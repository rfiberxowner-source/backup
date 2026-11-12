export const BILLING_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PLAN_RATES = [
  [500, 4500],
  [300, 2700],
  [200, 2000],
  [150, 1700],
  [100, 1500],
  [70, 1300],
  [60, 1200],
  [50, 1000],
  [45, 900],
  [30, 800],
  [20, 599]
];

const MONTH_PREFIX_TO_INDEX = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * Resolves standard monthly service fee from a plan label when no explicit user rate exists.
 */
export function getPlanBaseAmount(planStr, fallbackAmount = 0) {
  const s = String(planStr || '');
  for (const [speed, rate] of PLAN_RATES) {
    if (new RegExp(`(?:^|\\D)${speed}(?:\\s*mbps)?(?=\\D|$)`, 'i').test(s)) {
      return rate;
    }
  }
  return fallbackAmount || 0;
}

/**
 * Parses a billing month selector value or label into timezone-safe 1st-of-month
 * statement dates and 7th-of-month due dates.
 */
export function parseBillingMonthInfo(monthVal) {
  const now = new Date();
  const str = String(monthVal || '').trim();
  const lower = str.toLowerCase();

  let year = now.getFullYear();
  let monthIndex = now.getMonth();
  let matched = false;

  if (!lower || lower === 'current') {
    matched = lower === 'current';
  } else if (lower === 'next') {
    const nextD = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    year = nextD.getFullYear();
    monthIndex = nextD.getMonth();
    matched = true;
  } else if (str !== '-') {
    const monthMatch = str.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
    if (monthMatch) {
      const idx = MONTH_PREFIX_TO_INDEX[monthMatch[1].slice(0, 3).toLowerCase()];
      const yearMatch = str.match(/\b((?:19|20)\d{2})\b/);
      if (idx !== undefined) {
        monthIndex = idx;
        if (yearMatch) year = parseInt(yearMatch[1], 10);
        matched = true;
      }
    } else {
      const isoMatch = str.match(/^(\d{4})-(\d{1,2})/);
      if (isoMatch) {
        const mNum = parseInt(isoMatch[2], 10);
        if (mNum >= 1 && mNum <= 12) {
          year = parseInt(isoMatch[1], 10);
          monthIndex = mNum - 1;
          matched = true;
        }
      } else {
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          year = parsed.getFullYear();
          monthIndex = parsed.getMonth();
          matched = true;
        }
      }
    }
  }

  // Use 12:00 UTC so local date formatting stays on the 1st across PHT (+8) and US (-8..-5) timezones.
  const statementDate = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
  const monthName = BILLING_MONTH_NAMES[monthIndex];

  return {
    matched,
    year,
    monthIndex,
    billingMonth: `${monthName} ${year}`,
    statementDate,
    statementIso: statementDate.toISOString(),
    statementDateStr: `${monthName} 1, ${year}`,
    dueDateStr: `${monthName} 7, ${year}`
  };
}

/**
 * Returns chronological sort key prioritizing the billing period (month/year)
 * so back-dated or reverted bills always sort before later months.
 */
export function getBillingSortTime(item) {
  if (!item) return 0;
  const periodStr = item.billingMonth || item.month || item.period;
  if (periodStr && String(periodStr).trim() !== '-') {
    const parsed = parseBillingMonthInfo(periodStr);
    if (parsed.matched) return parsed.statementDate.getTime();
  }

  const rawDate = item.dateSent || item.sortDate || item.datePaid || item.date || item.createdAt || item.timestamp;
  if (!rawDate) return 0;
  if (typeof rawDate.toDate === 'function') return rawDate.toDate().getTime();
  const ms = new Date(rawDate).getTime();
  return isNaN(ms) ? 0 : ms;
}

/**
 * Resolves the statement Date object for display, always anchoring to the 1st of the
 * billing month when a billing period is present.
 */
export function resolveStatementDate(record) {
  if (!record) return new Date();
  const periodStr = record.billingMonth || record.month || record.period;
  if (periodStr && String(periodStr).trim() !== '-') {
    const parsed = parseBillingMonthInfo(periodStr);
    if (parsed.matched) return parsed.statementDate;
  }
  if (record.dateSent) {
    const d = new Date(record.dateSent);
    if (!isNaN(d.getTime())) return d;
  }
  if (record.timestamp && typeof record.timestamp.toDate === 'function') {
    return record.timestamp.toDate();
  }
  const fallback = record.datePaid || record.date;
  if (fallback) {
    const d = new Date(fallback);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Merges paid `payments` and unpaid `billing_emails` into one chronologically sorted customer ledger.
 */
export function buildCustomerLedger(paymentDocs, billingEmailDocs) {
  const seenPayIds = new Set();
  const paidBillIds = new Set();
  const ledger = [];

  (paymentDocs || []).forEach((pd) => {
    if (!pd || !pd.id || seenPayIds.has(pd.id)) return;
    seenPayIds.add(pd.id);
    if (pd.billId) paidBillIds.add(pd.billId);
    ledger.push({ ...pd, isPaidRec: true });
  });

  (billingEmailDocs || []).forEach((bd) => {
    if (!bd || !bd.id) return;
    const isPaidStatus = String(bd.status || '').toLowerCase() === 'paid';
    if (!isPaidStatus && !paidBillIds.has(bd.id)) {
      ledger.push({ ...bd, isPaidRec: false });
    }
  });

  ledger.sort((a, b) => getBillingSortTime(a) - getBillingSortTime(b));
  return ledger;
}

/**
 * Computes Section A (Previous Charges) from all ledger entries preceding the current statement.
 * Sums every unpaid prior bill instead of inspecting only the single immediately preceding entry.
 */
export function computePriorBillingState(ledger, currentId, fallbackBaseAmount = 0) {
  const currentIdx = (ledger || []).findIndex((p) => p.id === currentId || p.billId === currentId);
  if (currentIdx <= 0) {
    return { prevPaid: true, prevCharges: 0, remainingBalance: 0 };
  }

  const priorItems = ledger.slice(0, currentIdx);
  const priorUnpaid = priorItems.filter((p) => !p.isPaidRec);

  if (priorUnpaid.length > 0) {
    const unpaidSum = priorUnpaid.reduce((sum, item) => {
      const amt = parseFloat(String(item.amount || '').replace(/[^0-9.]/g, '')) || fallbackBaseAmount;
      return sum + amt;
    }, 0);
    return { prevPaid: false, prevCharges: unpaidSum, remainingBalance: unpaidSum };
  }

  const lastPaid = priorItems[priorItems.length - 1];
  const lastAmt = parseFloat(String(lastPaid.amount || '').replace(/[^0-9.]/g, '')) || fallbackBaseAmount;
  return { prevPaid: true, prevCharges: lastAmt, remainingBalance: 0 };
}
