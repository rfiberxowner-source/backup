import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./NetworkMap.css";
import {
  findNode,
  getStoredInstallationRequests,
  saveStoredInstallationRequests,
  hasValidCoordinates,
  magdalenaBounds,
  magdalenaCenter,
  magdalenaNodes,
  magdalenaPoles,
  magdalenaSegments,
  normalizeCoordinateItem,
  segmentPath,
  statusLabels,
} from "./magdalenaNetwork";

const filters = ["all", "line", "nap", "pole", "splitter", "fdh"];
const mapWidth = 1000;
const mapHeight = 650;
const fallbackTileZoom = 14;
const googleMapsApiKey = "AIzaSyCnwMZ16TOKpMmWRsbkCq3dceniz2vopms";
const boxOverrideStorageKey = "rfiber:network-box-overrides-v2";
const napAssignmentStorageKey = "rfiber:nap-assignments-v2";
const subscriberStorageKey = "rfiber:network-subscribers-v2";
const poleStorageKey = "rfiber:network-poles-v2";
const customRouteStorageKey = "rfiber:custom-routes-v2";
const pointAddressStorageKey = "rfiber:point-addresses-v2";
const clientCleanResetKey = "rfiber:client-clean-reset-2026-07-16";
const editableBoxStatuses = ["online", "watch", "maintenance", "planned"];
const routeEquipmentChoices = {
  nap: { category: "Access", prefix: "NAP", name: "NAP", equipment: "NAP access terminal box", capacity: 16 },
  splitter: { category: "Splitter", prefix: "SPL", name: "Splitter", equipment: "Splitter box", capacity: 64 },
  fdh: { category: "Distribution", prefix: "FDH", name: "FDH", equipment: "FDH fiber distribution cabinet", capacity: 144 },
};

const defaultBoxId = (node) => {
  if (node.type === "Company") return "HQ-MAGDALENA";
  if (node.type === "Core") return "OLT-POB-01";
  const prefix = node.type === "Distribution" ? "FDH" : node.type === "Splitter" ? "SPL" : "NAP";
  return `${prefix}-${String(node.area || node.id).toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-01`;
};

const defaultBoxCapacity = (node) => {
  if (node.type === "Core") return 512;
  if (node.type === "Distribution") return 144;
  if (node.type === "Splitter") return 64;
  if (node.type === "Access") return 16;
  return 0;
};

const normalizeSubscriberStatus = (status = "") => {
  const normalized = String(status).toLowerCase().replace(/\s+/g, "-");
  if (["no-internet", "offline", "no internet"].includes(normalized)) return "no-internet";
  if (["maintenance", "repair"].includes(normalized)) return "maintenance";
  if (["pending", "install"].includes(normalized)) return "pending";
  return "active";
};

const subscriberStatusLabels = {
  active: "Active",
  "no-internet": "No Internet",
  maintenance: "Maintenance",
  pending: "Pending Install",
};

const networkTypeRank = {
  Company: 0,
  Core: 1,
  Distribution: 2,
  Splitter: 3,
  Access: 4,
  Pole: 5,
};

const portLabelForNap = (nap, portNumber) => `${nap?.boxId || "NAP"} / P${String(portNumber).padStart(2, "0")}`;

const getStoredBoxOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(boxOverrideStorageKey) || "{}");
  } catch {
    return {};
  }
};

const saveStoredBoxOverrides = (overrides) => {
  localStorage.setItem(boxOverrideStorageKey, JSON.stringify(overrides));
};

const getStoredNapAssignments = () => {
  try {
    return JSON.parse(localStorage.getItem(napAssignmentStorageKey) || "{}");
  } catch {
    return {};
  }
};

const saveStoredNapAssignments = (assignments) => {
  localStorage.setItem(napAssignmentStorageKey, JSON.stringify(assignments));
};

const readStorageArray = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const writeStorageArray = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const coordinateKey = (item) => {
  const lat = Number(item?.lat);
  const lng = Number(item?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng)
    ? `${lat.toFixed(6)},${lng.toFixed(6)}`
    : "";
};

const getStoredPointAddresses = () => {
  try {
    const value = JSON.parse(localStorage.getItem(pointAddressStorageKey) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

const saveStoredPointAddresses = (addresses) => {
  localStorage.setItem(pointAddressStorageKey, JSON.stringify(addresses));
};

const normalizeResolvedAddress = (value) => {
  if (typeof value === "string") {
    return { address: value, locationType: "UNKNOWN", partialMatch: false };
  }
  return value?.address ? value : null;
};

const addressAccuracyLabel = (resolved) => {
  if (!resolved) return "Awaiting Google address resolution";
  if (resolved.partialMatch) return "Approximate Google match";
  if (resolved.locationType === "ROOFTOP") return "Rooftop-level Google match";
  if (resolved.locationType === "RANGE_INTERPOLATED") return "Interpolated street address";
  if (resolved.locationType === "GEOMETRIC_CENTER") return "Road or property center";
  if (resolved.locationType === "APPROXIMATE") return "Approximate area match";
  return "Google Maps address";
};

const bestReverseGeocodeResult = (results = []) => {
  const typeRank = [
    "street_address",
    "premise",
    "subpremise",
    "establishment",
    "point_of_interest",
    "route",
    "plus_code",
    "neighborhood",
    "sublocality",
    "locality",
  ];
  return [...results].sort((left, right) => {
    const leftRank = Math.min(...left.types.map((type) => {
      const index = typeRank.indexOf(type);
      return index < 0 ? typeRank.length : index;
    }));
    const rightRank = Math.min(...right.types.map((type) => {
      const index = typeRank.indexOf(type);
      return index < 0 ? typeRank.length : index;
    }));
    return leftRank - rightRank;
  })[0];
};

const getStoredSubscribers = () => readStorageArray(subscriberStorageKey, []);
const saveStoredSubscribers = (subscribers) => writeStorageArray(subscriberStorageKey, subscribers);
const getStoredPoles = () => readStorageArray(poleStorageKey, magdalenaPoles);
const saveStoredPoles = (poles) => writeStorageArray(poleStorageKey, poles);
const getStoredCustomRoutes = () => readStorageArray(customRouteStorageKey, []);
const saveStoredCustomRoutes = (routes) => writeStorageArray(customRouteStorageKey, routes);

const statusClass = (status) => `network-status-${status}`;

const routeDistance = (from, to) => {
  const lat1 = Number(from.lat);
  const lng1 = Number(from.lng);
  const lat2 = Number(to.lat);
  const lng2 = Number(to.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  const latDelta = lat1 - lat2;
  const lngDelta = (lng1 - lng2) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  return Math.sqrt((latDelta ** 2) + (lngDelta ** 2));
};

const segmentMeters = (from, to) => {
  const lat1 = Number(from.lat);
  const lng1 = Number(from.lng);
  const lat2 = Number(to.lat);
  const lng2 = Number(to.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return 0;
  const radius = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const routeLengthMeters = (points = []) => points.reduce((total, point, index) => {
  if (index === 0) return total;
  return total + segmentMeters(points[index - 1], point);
}, 0);

const formatMeters = (meters) => {
  if (!Number.isFinite(meters) || meters <= 0) return "";
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.ceil(meters)} m`;
};

const detailedDirectionsPath = (result, origin, destination) => {
  const route = result?.routes?.[0];
  if (!route) return [];
  const detailed = route.legs?.flatMap((leg) => (
    leg.steps?.flatMap((step) => step.path || []) || []
  )) || [];
  const source = detailed.length ? detailed : route.overview_path || [];
  const routed = source.map((point) => ({
    lat: typeof point.lat === "function" ? point.lat() : Number(point.lat),
    lng: typeof point.lng === "function" ? point.lng() : Number(point.lng),
  }));
  const complete = [
    { lat: Number(origin.lat), lng: Number(origin.lng) },
    ...routed,
    { lat: Number(destination.lat), lng: Number(destination.lng) },
  ];
  return complete.filter((point, index) => (
    Number.isFinite(point.lat)
    && Number.isFinite(point.lng)
    && (
      index === 0
      || point.lat !== complete[index - 1].lat
      || point.lng !== complete[index - 1].lng
    )
  ));
};

const nearestFiberNode = (item) => magdalenaNodes
  .filter((node) => node.status !== "planned" && node.type !== "Company")
  .reduce((nearest, node) => (routeDistance(item, node) < routeDistance(item, nearest) ? node : nearest), magdalenaNodes[0]);

const nearestItem = (item, items = []) => {
  if (!items.length) return null;
  return items.reduce((nearest, next) => (routeDistance(item, next) < routeDistance(item, nearest) ? next : nearest), items[0]);
};

const findUpstreamSegments = (targetId, segments, nodes) => {
  const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const parentByNode = segments.reduce((parents, segment) => {
    const existing = parents[segment.to];
    const existingRank = existing ? networkTypeRank[nodeById[existing.from]?.type] ?? 99 : 99;
    const nextRank = networkTypeRank[nodeById[segment.from]?.type] ?? 99;
    if (!existing || nextRank < existingRank) return { ...parents, [segment.to]: segment };
    return parents;
  }, {});
  const path = [];
  let current = targetId;
  const visited = new Set();
  while (parentByNode[current] && !visited.has(current)) {
    visited.add(current);
    const segment = parentByNode[current];
    path.unshift(segment);
    current = segment.from;
  }
  return path;
};

const operationsMapStyles = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "simplified" }, { saturation: -25 }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f4f2eb" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5b6472" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#9ed8e8" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#e8f5e8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#24364d" }] },
];

const markerProfiles = {
  Company: { code: "HQ", shape: "hex", fill: "#2563eb", stroke: "#dbeafe" },
  Core: { code: "OLT", shape: "diamond", fill: "#111827", stroke: "#f8fafc" },
  Distribution: { code: "FDH", shape: "box", fill: "#047857", stroke: "#d1fae5" },
  Splitter: { code: "SPL", shape: "box", fill: "#0f9f6e", stroke: "#dcfce7" },
  Access: { code: "NAP", shape: "box", fill: "#15803d", stroke: "#dcfce7" },
  Pole: { code: "P", shape: "hex", fill: "#7c3aed", stroke: "#ede9fe" },
};

const markerSvg = ({ code, shape, fill, stroke, selected }) => {
  const size = selected ? 48 : 42;
  const textSize = code.length > 2 ? 10 : 12;
  const shapeMarkup = shape === "hex"
    ? '<polygon points="21 3 37 12 37 30 21 39 5 30 5 12" />'
    : shape === "diamond"
      ? '<path d="M21 3 39 21 21 39 3 21Z" />'
      : '<rect x="5" y="7" width="32" height="28" rx="6" />';
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 42 42">
      <g filter="url(#shadow)">
        <g fill="${fill}" stroke="${selected ? "#fbbf24" : stroke}" stroke-width="${selected ? 4 : 3}">${shapeMarkup}</g>
        <text x="21" y="24" text-anchor="middle" font-family="Arial, sans-serif" font-size="${textSize}" font-weight="900" fill="#ffffff">${code}</text>
      </g>
      <defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.28"/></filter></defs>
    </svg>`;
};

const buildNetworkIcon = (maps, item, selected) => {
  const profile = markerProfiles[item.category] || markerProfiles.Access;
  const size = selected ? 48 : 42;
  const issueColor = item.issueSeverity === "critical" ? "#e31b23" : item.issueSeverity === "warning" ? "#f59e0b" : null;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg({ ...profile, fill: issueColor || profile.fill, selected }))}`,
    scaledSize: new maps.Size(size, size),
    anchor: new maps.Point(size / 2, size / 2),
  };
};
const routeLabelSvg = ({ text, color, selected }) => {
  const width = Math.max(58, (text.length * 7) + 18);
  const border = selected ? "#fbbf24" : "#ffffff";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28">
      <rect x="2" y="3" width="${width - 4}" height="22" rx="8" fill="${color}" stroke="${border}" stroke-width="3" />
      <text x="${width / 2}" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#ffffff">${text}</text>
    </svg>`;
};

const routePlacementMenuHtml = (routeName) => `
  <div class="network-info-window route-placement-menu" style="min-width:190px;color:#172033;font-family:DM Sans, Manrope, Arial, sans-serif;line-height:1.35;">
    <strong style="display:block;color:#101828;font-size:14px;font-weight:900;margin:0 0 5px;">Place on this line</strong>
    <small style="display:block;color:#667085;font-size:11px;font-weight:800;margin:0 0 8px;">${routeName}</small>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
      <button type="button" style="color:#172033;background:#ffffff;" onclick="window.__rfiberPlaceOnRoute && window.__rfiberPlaceOnRoute('nap')">NAP</button>
      <button type="button" style="color:#172033;background:#ffffff;" onclick="window.__rfiberPlaceOnRoute && window.__rfiberPlaceOnRoute('pole')">Pole</button>
      <button type="button" style="color:#172033;background:#ffffff;" onclick="window.__rfiberPlaceOnRoute && window.__rfiberPlaceOnRoute('splitter')">Splitter</button>
      <button type="button" style="color:#172033;background:#ffffff;" onclick="window.__rfiberPlaceOnRoute && window.__rfiberPlaceOnRoute('fdh')">FDH</button>
    </div>
  </div>
`;

const buildRouteLabelIcon = (maps, text, color, selected) => {
  const width = Math.max(58, (text.length * 7) + 18);
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(routeLabelSvg({ text, color, selected }))}`,
    scaledSize: new maps.Size(width, 28),
    anchor: new maps.Point(width / 2, 14),
  };
};

const buildHouseIcon = (maps, item, selected) => {
  const fill = item.status === "no-internet" ? "#e31b23" : item.status === "maintenance" ? "#f59e0b" : "#16a34a";
  const size = selected ? 42 : 34;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 42 42">
      <path d="M6 20 21 7l15 13v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" fill="${fill}" stroke="${selected ? "#fbbf24" : "#ffffff"}" stroke-width="${selected ? 4 : 3}" />
      <path d="M17 37V25h8v12" fill="rgba(255,255,255,.28)" stroke="#ffffff" stroke-width="2" />
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new maps.Size(size, size),
    anchor: new maps.Point(size / 2, size / 2),
  };
};

const routeMidpoint = (points) => points[Math.floor(points.length / 2)];


const cableColors = {
  "Main line": "#ef4444",
  "12 core": "#eab308",
  "24 core": "#3b82f6",
  "8 core": "#8b5cf6",
  "Field route": "#22c55e",
};

const statusColors = {
  online: "#16a34a",
  watch: "#f59e0b",
  maintenance: "#e31b23",
  planned: "#64748b",
  pending: "#8b5cf6",
  active: "#f59e0b",
  completed: "#16a34a",
  company: "#2563eb",
  "no-internet": "#e31b23",
};

const lngToTileX = (lng, z) => ((Number(lng) + 180) / 360) * (2 ** z);
const latToTileY = (lat, z) => {
  const radians = Number(lat) * Math.PI / 180;
  return ((1 - Math.log(Math.tan(radians) + (1 / Math.cos(radians))) / Math.PI) / 2) * (2 ** z);
};

const projectPoint = (item) => {
  const normalized = normalizeCoordinateItem(item);
  const west = lngToTileX(magdalenaBounds.west, fallbackTileZoom);
  const east = lngToTileX(magdalenaBounds.east, fallbackTileZoom);
  const north = latToTileY(magdalenaBounds.north, fallbackTileZoom);
  const south = latToTileY(magdalenaBounds.south, fallbackTileZoom);
  return {
    x: ((lngToTileX(normalized.lng, fallbackTileZoom) - west) / (east - west)) * mapWidth,
    y: ((latToTileY(normalized.lat, fallbackTileZoom) - north) / (south - north)) * mapHeight,
  };
};

const tileXToLng = (x, z) => ((x / (2 ** z)) * 360) - 180;
const tileYToLat = (y, z) => {
  const radians = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / (2 ** z))));
  return radians * 180 / Math.PI;
};

const unprojectPoint = (x, y) => {
  const west = lngToTileX(magdalenaBounds.west, fallbackTileZoom);
  const east = lngToTileX(magdalenaBounds.east, fallbackTileZoom);
  const north = latToTileY(magdalenaBounds.north, fallbackTileZoom);
  const south = latToTileY(magdalenaBounds.south, fallbackTileZoom);
  return {
    lat: tileYToLat(north + ((y / mapHeight) * (south - north)), fallbackTileZoom),
    lng: tileXToLng(west + ((x / mapWidth) * (east - west)), fallbackTileZoom),
  };
};

const tileLayout = () => {
  const west = lngToTileX(magdalenaBounds.west, fallbackTileZoom);
  const east = lngToTileX(magdalenaBounds.east, fallbackTileZoom);
  const north = latToTileY(magdalenaBounds.north, fallbackTileZoom);
  const south = latToTileY(magdalenaBounds.south, fallbackTileZoom);
  const minX = Math.floor(west);
  const maxX = Math.floor(east);
  const minY = Math.floor(north);
  const maxY = Math.floor(south);
  const widthTiles = east - west;
  const heightTiles = south - north;
  const tiles = [];

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tiles.push({
        key: `${x}-${y}`,
        src: `https://tile.openstreetmap.org/${fallbackTileZoom}/${x}/${y}.png`,
        left: ((x - west) / widthTiles) * 100,
        top: ((y - north) / heightTiles) * 100,
        width: (1 / widthTiles) * 100,
        height: (1 / heightTiles) * 100,
      });
    }
  }
  return tiles;
};

const loadGoogleMaps = () => {
  if (!googleMapsApiKey) return Promise.reject(new Error("Missing Google Maps API key"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__rfiberGoogleMapsPromise) return window.__rfiberGoogleMapsPromise;

  window.__rfiberGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return window.__rfiberGoogleMapsPromise;
};

const normalizeTicket = (ticket) => {
  const normalized = normalizeCoordinateItem(ticket);
  if (!hasValidCoordinates(normalized)) return null;
  return {
    id: `ticket-${ticket.ticket_id}`,
    type: "request",
    name: ticket.name || ticket.customer_name || `Ticket #${ticket.ticket_id}`,
    label: `#${ticket.ticket_id}`,
    address: ticket.address,
    lat: normalized.lat,
    lng: normalized.lng,
    status: ["Resolved", "Closed"].includes(ticket.status) ? "completed" : "active",
    category: ticket.category || "Service request",
    detail: ticket.subject || ticket.description || "Customer service request",
    source: "Ticket",
  };
};

const normalizeCustomer = (customer) => {
  const normalized = normalizeCoordinateItem(customer);
  if (!hasValidCoordinates(normalized)) return null;
  return {
    id: `customer-${customer.customer_id || customer.id || customer.email}`,
    type: "customer",
    name: customer.name || customer.email || "Customer",
    label: customer.account_number || "Customer",
    address: customer.address,
    lat: normalized.lat,
    lng: normalized.lng,
    status: customer.status === "Inactive" ? "watch" : "online",
    category: customer.internet_plan || customer.role || "Subscriber",
    detail: customer.email || customer.contact_number || "Customer location",
    source: "Customer profile",
  };
};

const normalizeStoredInstall = (request) => {
  const normalized = normalizeCoordinateItem(request);
  if (!hasValidCoordinates(normalized)) return null;
  return {
    id: request.id,
    type: "request",
    name: request.name || "Installation request",
    label: request.ticket_id ? `#${request.ticket_id}` : "Install",
    address: request.address,
    lat: normalized.lat,
    lng: normalized.lng,
    status: request.status || "pending",
    category: request.internet_plan || "Installation request",
    detail: request.email || request.contact_number || "New install request",
    source: "Installation form",
  };
};

function NetworkMap() {
  const mapNodeRef = useRef(null);
  const mapShellRef = useRef(null);
  const googleMapRef = useRef(null);
  const mapObjectsRef = useRef({ markers: [], polylines: [], infoWindow: null });
  const drawStateRef = useRef({ isDrawingRoute: false, isAddingRouteBends: false, manualRoutePoints: [] });
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("headend");
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [storedInstalls, setStoredInstalls] = useState(() => getStoredInstallationRequests());
  const [loading, setLoading] = useState(false);
  const [googleMapStatus, setGoogleMapStatus] = useState(googleMapsApiKey ? "loading" : "missing-key");
  const [routedSegmentPaths, setRoutedSegmentPaths] = useState({});
  const [serviceRoutePaths, setServiceRoutePaths] = useState({});
  const [routeFailures, setRouteFailures] = useState({});
  const [routeStatus, setRouteStatus] = useState("idle");
  const [boxOverrides, setBoxOverrides] = useState(() => getStoredBoxOverrides());
  const [napAssignments, setNapAssignments] = useState(() => getStoredNapAssignments());
  const [managedSubscribers, setManagedSubscribers] = useState(() => getStoredSubscribers());
  const [managedPoles, setManagedPoles] = useState(() => getStoredPoles());
  const [customRoutes, setCustomRoutes] = useState(() => getStoredCustomRoutes());
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isInspectorHidden, setIsInspectorHidden] = useState(false);
  const [isDrawToolbarOpen, setIsDrawToolbarOpen] = useState(false);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [isAddingRouteBends, setIsAddingRouteBends] = useState(false);
  const [manualRoutePoints, setManualRoutePoints] = useState([]);
  const [manualRouteGuidePoint, setManualRouteGuidePoint] = useState(null);
  const [manualRouteRoadPreviewPath, setManualRouteRoadPreviewPath] = useState([]);
  const [mapAddressQuery, setMapAddressQuery] = useState("");
  const [searchedAddressPin, setSearchedAddressPin] = useState(null);
  const [mapAddressStatus, setMapAddressStatus] = useState("");
  const [selectedRoutePoint, setSelectedRoutePoint] = useState(null);
  const [pointAddresses, setPointAddresses] = useState(getStoredPointAddresses);
  const [leftTab, setLeftTab] = useState("Mapping");
  const [rawLocationClients, setRawLocationClients] = useState([]);
  const [isShowingAllPins, setIsShowingAllPins] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let docs = [];
        if (window._adminUsersSnap) {
          docs = window._adminUsersSnap.docs;
        } else if (window._getAdminDb) {
          const { db, firestore } = await window._getAdminDb();
          const snap = await firestore.getDocs(firestore.collection(db, "users"));
          docs = snap.docs;
        }
        const clients = docs.map(d => ({id: d.id, ...d.data()})).filter(c => c.rawLocation && c.rawLocation.latitude);
        setRawLocationClients(clients);
      } catch (e) {}
    };
    fetchClients();
  }, []);

  const allClientPinsRef = useRef([]);

  const clearAllClientPins = () => {
    if (allClientPinsRef.current) {
      allClientPinsRef.current.forEach(m => m.setMap(null));
      allClientPinsRef.current = [];
    }
  };

  const showAllClientPins = (clients) => {
    if (!googleMapRef.current || !window.google?.maps) return;
    
    if (clientPinRef.current) {
      clientPinRef.current.setMap(null);
      clientPinRef.current = null;
    }
    mapObjectsRef.current.infoWindow?.close();
    
    clearAllClientPins();

    const maps = window.google.maps;
    const bounds = new maps.LatLngBounds();
    let hasPins = false;

    clients.forEach(c => {
      if (c.rawLocation && c.rawLocation.latitude && c.rawLocation.longitude) {
        const lat = Number(c.rawLocation.latitude);
        const lng = Number(c.rawLocation.longitude);
        
        const marker = new maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: c.name || c.fullName || "Client",
          zIndex: 9998,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            fillColor: "#f59e0b",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          }
        });

        marker.addListener("click", () => {
          panToClient(c);
        });

        allClientPinsRef.current.push(marker);
        hasPins = true;
      }
    });
  };

  const toggleAllClientPins = (clients) => {
    if (isShowingAllPins) {
      clearAllClientPins();
      setIsShowingAllPins(false);
    } else {
      showAllClientPins(clients);
      setIsShowingAllPins(true);
    }
  };

  const clientPinRef = useRef(null);

  const panToClient = (c) => {
    clearAllClientPins();
    setIsShowingAllPins(false);
    if (c.rawLocation && c.rawLocation.latitude && c.rawLocation.longitude) {
      const lat = Number(c.rawLocation.latitude);
      const lng = Number(c.rawLocation.longitude);
      
      if (googleMapRef.current && window.google?.maps) {
        googleMapRef.current.panTo({ lat, lng });
        googleMapRef.current.setZoom(18);

        if (clientPinRef.current) {
          clientPinRef.current.setMap(null);
        }

        const maps = window.google.maps;
        const marker = new maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: c.name || c.fullName || "Client",
          zIndex: 9999,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            fillColor: "#e53935",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
            scale: 12,
          }
        });
        
        clientPinRef.current = marker;

        if (!mapObjectsRef.current.infoWindow) {
          mapObjectsRef.current.infoWindow = new maps.InfoWindow();
        }
        
        mapObjectsRef.current.infoWindow.setContent(`
          <div class="network-info-window" style="min-width:150px;max-width:230px;color:#172033;font-family:DM Sans, Manrope, Arial, sans-serif;line-height:1.35;">
            <strong style="display:block;color:#101828;font-size:14px;font-weight:900;margin:0 0 5px;">Client Location</strong>
            <span style="display:block;color:#344054;font-size:12px;font-weight:800;margin:0 0 3px;">${c.name || c.fullName}</span>
            <small style="display:block;color:#667085;font-size:11px;font-weight:700;">Account ID: ${c.accountNumber || c.id}</small>
          </div>
        `);
        
        setTimeout(() => {
          mapObjectsRef.current.infoWindow.open({ map: googleMapRef.current, anchor: marker });
          window.google.maps.event.addListenerOnce(mapObjectsRef.current.infoWindow, 'closeclick', () => {
            if (clientPinRef.current) {
              clientPinRef.current.setMap(null);
              clientPinRef.current = null;
            }
          });
        }, 300);
      }
      
      setMapCenter({ lat, lng });
      setMapZoom(18);
    }
  };

  useEffect(() => {
    drawStateRef.current = { isDrawingRoute, isAddingRouteBends, manualRoutePoints };
  }, [isAddingRouteBends, isDrawingRoute, manualRoutePoints]);

  const setGoogleMapType = (mapTypeId) => {
    if (googleMapRef.current) googleMapRef.current.setMapTypeId(mapTypeId);
  };

  const beginRouteDrawing = () => {
    setIsDrawToolbarOpen(true);
    setManualRoutePoints([]);
    setManualRouteGuidePoint(null);
    setManualRouteRoadPreviewPath([]);
    setIsDrawingRoute(true);
    setIsAddingRouteBends(false);
    setIsInspectorHidden(true);
  };

  const stopRouteDrawing = () => {
    setIsDrawingRoute(false);
    setIsAddingRouteBends(false);
    setManualRouteGuidePoint(null);
    setIsInspectorHidden(false);
  };

  const clearManualRoute = () => {
    setManualRoutePoints([]);
    setManualRouteGuidePoint(null);
    setManualRouteRoadPreviewPath([]);
    setIsDrawingRoute(true);
    setIsAddingRouteBends(false);
    setIsInspectorHidden(false);
  };

  const undoManualRoutePoint = () => {
    setManualRoutePoints((points) => points.slice(0, -1));
    setIsDrawingRoute(true);
    setIsAddingRouteBends(false);
  };

  const addManualRoutePoint = useCallback((point) => {
    const lat = Number(point?.lat);
    const lng = Number(point?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const drawState = drawStateRef.current;
    setManualRoutePoints((points) => {
      const nextPoint = { lat, lng };
      if (drawState.isAddingRouteBends && points.length >= 2) {
        let bestIndex = 1;
        let minCost = Infinity;
        const getDist = (p1, p2) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const cost = getDist(p1, nextPoint) + getDist(nextPoint, p2) - getDist(p1, p2);
          if (cost < minCost) {
            minCost = cost;
            bestIndex = i + 1;
          }
        }
        return [...points.slice(0, bestIndex), nextPoint, ...points.slice(bestIndex)];
      }
      if (drawState.isDrawingRoute && points.length === 0) {
        const center = googleMapRef.current?.getCenter?.();
        setManualRouteGuidePoint(center ? { lat: center.lat(), lng: center.lng() } : nextPoint);
      }
      return [...points, nextPoint];
    });
  }, []);

  const beginRouteBending = () => {
    if (manualRoutePoints.length < 2) return;
    setIsDrawToolbarOpen(true);
    setIsDrawingRoute(false);
    setIsAddingRouteBends(true);
    setManualRouteGuidePoint(null);
    setIsInspectorHidden(true);
  };

  const finishManualRouteAtPoint = useCallback((point) => {
    const lat = Number(point?.lat);
    const lng = Number(point?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setManualRoutePoints((points) => [...points, { lat, lng }]);
    setManualRouteGuidePoint(null);
    setIsDrawingRoute(false);
    setIsAddingRouteBends(false);
    setIsInspectorHidden(false);
  }, []);

  const finishManualRouteAtCurrentPoint = () => {
    if (isAddingRouteBends) {
      stopRouteDrawing();
      return;
    }
    if (isDrawingRoute && manualRouteGuidePoint && manualRoutePoints.length === 1) {
      finishManualRouteAtPoint(manualRouteGuidePoint);
      return;
    }
    if (manualRoutePoints.length) {
      stopRouteDrawing();
    }
  };

  const toggleMapFullscreen = () => {
    const mapElement = mapShellRef.current;
    if (!mapElement) return;
    if (document.fullscreenElement === mapElement) {
      document.exitFullscreen?.();
      return;
    }
    mapElement.requestFullscreen?.();
  };

  const geocodeAddress = async (address) => {
    const cleanAddress = String(address || "").trim();
    if (!cleanAddress || !window.google?.maps) return null;
    const maps = window.google.maps;
    const geocoder = new maps.Geocoder();
    const request = {
      address: cleanAddress.toLowerCase().includes("magdalena")
        ? cleanAddress
        : `${cleanAddress}, Magdalena, Laguna, Philippines`,
      componentRestrictions: { country: "PH" },
      bounds: new maps.LatLngBounds(
        { lat: magdalenaBounds.south, lng: magdalenaBounds.west },
        { lat: magdalenaBounds.north, lng: magdalenaBounds.east }
      ),
    };
    const result = await geocoder.geocode(request);
    const location = result.results?.[0]?.geometry?.location;
    if (!location) return null;
    return { lat: location.lat(), lng: location.lng() };
  };

  const searchMapAddress = async (event) => {
    event.preventDefault();
    const query = mapAddressQuery.trim();
    if (!query) return;
    setMapAddressStatus("Searching...");
    try {
      const pin = await geocodeAddress(query);
      if (!pin) {
        setMapAddressStatus("Address not found");
        return;
      }
      const nextPin = {
        ...pin,
        id: "searched-address",
        name: query,
        address: query.toLowerCase().includes("magdalena") ? query : `${query}, Magdalena, Laguna`,
      };
      setSearchedAddressPin(nextPin);
      setMapAddressStatus("Found");
      if (googleMapRef.current) {
        googleMapRef.current.panTo({ lat: pin.lat, lng: pin.lng });
        googleMapRef.current.setZoom(Math.max(googleMapRef.current.getZoom() || 0, 18));
      }
    } catch {
      setMapAddressStatus("Address not found");
    }
  };

  const focusSelectedOnMap = () => {
    if (googleMapStatus !== "ready" || !window.google?.maps || !googleMapRef.current) return;
    if (selectedItem?.id === "empty") return;
    const maps = window.google.maps;
    const map = googleMapRef.current;
    if (selectedSegment) {
      const routePoints = routedSegmentPaths[selectedSegment.id] || segmentPath(selectedSegment);
      const bounds = new maps.LatLngBounds();
      routePoints.forEach((point) => bounds.extend({ lat: Number(point.lat), lng: Number(point.lng) }));
      if (!bounds.isEmpty()) map.fitBounds(bounds, 80);
      return;
    }
    const selectedMapPosition = mapPositionForItem(selectedItem);
    if (hasValidCoordinates(selectedMapPosition)) {
      map.panTo({ lat: Number(selectedMapPosition.lat), lng: Number(selectedMapPosition.lng) });
      map.setZoom(18);
    }
  };

  const loadMapData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const ticketsRes = { status: "fulfilled", value: { data: [] } };
      const usersRes = { status: "fulfilled", value: { data: [] } };
      if (ticketsRes.status === "fulfilled") setTickets(Array.isArray(ticketsRes.value.data) ? ticketsRes.value.data : []);
      if (usersRes.status === "fulfilled") setCustomers(Array.isArray(usersRes.value.data) ? usersRes.value.data.filter((user) => user.role === "customer") : []);
    } finally {
      setStoredInstalls(getStoredInstallationRequests());
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem(clientCleanResetKey)) {
      setManagedSubscribers([]);
      saveStoredSubscribers([]);
      setStoredInstalls([]);
      saveStoredInstallationRequests([]);
      const nextAssignments = { ...getStoredNapAssignments() };
      Object.keys(nextAssignments).forEach((id) => {
        if (id.startsWith("subscriber-") || id.startsWith("customer-") || id.startsWith("ticket-") || id.startsWith("install-")) {
          delete nextAssignments[id];
        }
      });
      setNapAssignments(nextAssignments);
      saveStoredNapAssignments(nextAssignments);
      localStorage.setItem(clientCleanResetKey, "done");
    }
    loadMapData();
    const syncStoredInstalls = () => setStoredInstalls(getStoredInstallationRequests());
    window.addEventListener("storage", syncStoredInstalls);
    window.addEventListener("rfiber:installation-map-updated", syncStoredInstalls);
    const mapRefreshTimer = window.setInterval(() => loadMapData({ silent: true }), 10000);
    return () => {
      window.removeEventListener("storage", syncStoredInstalls);
      window.removeEventListener("rfiber:installation-map-updated", syncStoredInstalls);
      window.clearInterval(mapRefreshTimer);
    };
  }, []);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsMapFullscreen(document.fullscreenElement === mapShellRef.current);
      if (googleMapRef.current && window.google?.maps) {
        window.setTimeout(() => {
          window.google.maps.event.trigger(googleMapRef.current, "resize");
        }, 80);
      }
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const rawMapItems = useMemo(() => {
    const requestMarkers = [
      ...tickets.map(normalizeTicket).filter(Boolean),
      ...storedInstalls.map(normalizeStoredInstall).filter(Boolean),
    ];
    const customerMarkers = customers.map(normalizeCustomer).filter(Boolean);
    const customNetworkNodes = Object.entries(boxOverrides)
      .filter(([, override]) => override.custom && !override.deleted)
      .map(([id, override]) => ({
        id,
        name: override.name || override.boxId || "Custom NAP",
        type: override.category || "Access",
        equipment: override.equipment || "NAP access terminal box",
        area: override.area || "Field added",
        lat: override.lat,
        lng: override.lng,
        status: override.status || "online",
        notes: override.notes || "Field-added network box.",
      }))
      .filter(hasValidCoordinates);
    const baseNetworkNodes = [
      ...magdalenaNodes.filter(n => !boxOverrides[n.id]?.deleted), 
      ...customNetworkNodes
    ];
    const networkMarkers = baseNetworkNodes.map((node) => {
      const override = boxOverrides[node.id] || {};
      const boxId = override.boxId || defaultBoxId(node);
      const capacity = Number(override.capacity || defaultBoxCapacity(node));
      const status = override.status || node.status;
      const equipment = override.equipment || node.equipment;
      const lat = override.lat !== undefined ? Number(override.lat) : Number(node.lat);
      const lng = override.lng !== undefined ? Number(override.lng) : Number(node.lng);
      const notes = override.notes || node.notes;
      return {
        ...node,
        status,
        lat,
        lng,
        type: "network",
        label: node.type === "Company" ? "HQ" : boxId,
        boxId,
        capacity,
        category: node.type,
        equipment,
        detail: notes,
        notes,
        source: node.type === "Company" ? "Company location" : "Fiber equipment",
      };
    });
    const poleMarkers = managedPoles.map((pole) => {
      const nearestNap = nearestItem(pole, networkMarkers.filter((item) => item.category === "Access"));
      const linkedNap = networkMarkers.find((item) => item.id === pole.napId) || nearestNap;
      return {
        ...pole,
        napId: linkedNap?.id,
        napBoxId: linkedNap?.boxId,
        type: "pole",
        category: "Pole",
        label: pole.name?.replace(/^Pole\s+/i, "") || "Pole",
        source: "Pole database",
        detail: pole.notes || "Fiber pole point",
        status: pole.status || "online",
      };
    }).filter(hasValidCoordinates);
    const subscriberMarkers = managedSubscribers.map((subscriber) => ({
      ...subscriber,
      id: subscriber.id || `subscriber-${subscriber.accountId}`,
      type: "subscriber",
      name: subscriber.name || "Subscriber",
      label: subscriber.accountId || "Subscriber",
      accountId: subscriber.accountId || subscriber.account_id || subscriber.id,
      address: subscriber.address,
      lat: subscriber.lat,
      lng: subscriber.lng,
      status: normalizeSubscriberStatus(subscriber.status),
      category: "Subscriber",
      detail: subscriber.notes || subscriber.contact || "Subscriber house",
      source: "Subscriber database",
    })).filter(hasValidCoordinates);
    return {
      requestMarkers,
      customerMarkers,
      networkMarkers,
      poleMarkers,
      subscriberMarkers,
      all: [...requestMarkers, ...customerMarkers, ...networkMarkers, ...poleMarkers, ...subscriberMarkers],
    };
  }, [tickets, customers, storedInstalls, boxOverrides, managedPoles, managedSubscribers]);

  useEffect(() => {
    if (googleMapStatus !== "ready" || !window.google?.maps) return undefined;

    const unresolved = rawMapItems.all.filter((item) => {
      const key = coordinateKey(item);
      return key && (
        !pointAddresses[key]
        || typeof pointAddresses[key] === "string"
        || !pointAddresses[key].locationType
      );
    });
    if (!unresolved.length) return undefined;

    let cancelled = false;
    const geocoder = new window.google.maps.Geocoder();

    const resolveAddresses = async () => {
      const resolved = {};
      for (const item of unresolved) {
        if (cancelled) return;
        const key = coordinateKey(item);
        try {
          const response = await geocoder.geocode({
            location: { lat: Number(item.lat), lng: Number(item.lng) },
            region: "PH",
          });
          const result = response?.results ? bestReverseGeocodeResult(response.results) : null;
          if (result?.formatted_address) {
            resolved[key] = {
              address: result.formatted_address,
              locationType: result.geometry?.location_type || "UNKNOWN",
              partialMatch: Boolean(result.partial_match),
              placeId: result.place_id || "",
              resolvedAt: new Date().toISOString(),
            };
          }
        } catch (error) {
          console.warn(`Could not resolve address for ${item.name}:`, error);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }

      if (!cancelled && Object.keys(resolved).length) {
        setPointAddresses((current) => {
          const next = { ...current, ...resolved };
          saveStoredPointAddresses(next);
          return next;
        });
      }
    };

    resolveAddresses();
    return () => {
      cancelled = true;
    };
  }, [googleMapStatus, pointAddresses, rawMapItems]);

  const mapItems = useMemo(() => {
    const withAddress = (item) => {
      const resolvedAddress = normalizeResolvedAddress(pointAddresses[coordinateKey(item)]);
      return {
        ...item,
        originalAddress: item.address || item.area || "",
        address: resolvedAddress?.address || item.address || item.area,
        resolvedAddress: resolvedAddress?.address || "",
        addressAccuracy: addressAccuracyLabel(resolvedAddress),
      };
    };
    const requestMarkers = rawMapItems.requestMarkers.map(withAddress);
    const customerMarkers = rawMapItems.customerMarkers.map(withAddress);
    const networkMarkers = rawMapItems.networkMarkers.map(withAddress);
    const poleMarkers = rawMapItems.poleMarkers.map(withAddress);
    const subscriberMarkers = rawMapItems.subscriberMarkers.map(withAddress);
    return {
      requestMarkers,
      customerMarkers,
      networkMarkers,
      poleMarkers,
      subscriberMarkers,
      all: [...requestMarkers, ...customerMarkers, ...networkMarkers, ...poleMarkers, ...subscriberMarkers],
    };
  }, [pointAddresses, rawMapItems]);

  const napConnections = useMemo(() => {
    const napBoxes = mapItems.networkMarkers.filter((item) => item.category === "Access");
    const servicePoints = [...mapItems.subscriberMarkers, ...mapItems.customerMarkers, ...mapItems.requestMarkers];
    return servicePoints.reduce((connections, item) => {
      if (!napBoxes.length) return connections;
      const assignedNap = napBoxes.find((box) => box.id === (item.napId || napAssignments[item.id]));
      const nearestNap = assignedNap || napBoxes.reduce((nearest, box) => (routeDistance(item, box) < routeDistance(item, nearest) ? box : nearest), napBoxes[0]);
      return {
        ...connections,
        [nearestNap.id]: [...(connections[nearestNap.id] || []), { ...item, napId: nearestNap.id, napBoxId: nearestNap.boxId, assignmentSource: assignedNap ? "manual" : "nearest" }],
      };
    }, {});
  }, [mapItems, napAssignments]);

  const boxIssues = useMemo(() => mapItems.networkMarkers.reduce((issues, box) => {
    if (box.category === "Company") return issues;
    const connected = napConnections[box.id] || [];
    const activeRequests = connected.filter((item) => item.type === "request" && ["active", "pending"].includes(item.status));
    const load = box.capacity ? connected.length / box.capacity : 0;
    const detected = [];
    if (box.status === "maintenance") detected.push("Maintenance status");
    if (box.status === "watch") detected.push("Needs signal review");
    if (load >= 1) detected.push("NAP capacity full");
    else if (load >= 0.8) detected.push("NAP near capacity");
    if (activeRequests.length) detected.push(`${activeRequests.length} open request${activeRequests.length > 1 ? "s" : ""}`);
    if (!detected.length) return issues;
    return {
      ...issues,
      [box.id]: {
        severity: box.status === "maintenance" || load >= 1 ? "critical" : "warning",
        messages: detected,
        load,
        connectedCount: connected.length,
      },
    };
  }, {}), [mapItems, napConnections]);
  const visibleItems = useMemo(() => {
    if (activeFilter === "nap") return mapItems.networkMarkers.filter(item => item.category === "Access");
    if (activeFilter === "splitter") return mapItems.networkMarkers.filter(item => item.category === "Splitter");
    if (activeFilter === "fdh") return mapItems.networkMarkers.filter(item => item.category === "Distribution");
    if (activeFilter === "pole") return mapItems.poleMarkers;
    if (activeFilter === "line") return [];
    return mapItems.all;
  }, [activeFilter, boxIssues, mapItems]);

  const serviceLineItems = useMemo(() => visibleItems.filter((item) => ["customer", "request", "subscriber"].includes(item.type)), [visibleItems]);

  const networkSegments = useMemo(() => {
    const allSegments = [...magdalenaSegments, ...customRoutes];
    if (activeFilter !== "all" && activeFilter !== "line") return [];
    return allSegments;
  }, [customRoutes, activeFilter]);
  const selectedSegment = networkSegments.find((segment) => segment.id === selectedId);
  const selectedItem = visibleItems.find((item) => item.id === selectedId)
    || mapItems.all.find((item) => item.id === selectedId)
    || magdalenaNodes[0]
    || { id: "empty", name: "No selection", type: "system", status: "online", category: "System", lat: magdalenaCenter.lat, lng: magdalenaCenter.lng };
  const tiles = useMemo(() => tileLayout(), []);
  const selectedConnections = selectedItem?.type === "network" ? (napConnections[selectedId] || []) : [];
  const accessBoxes = useMemo(() => mapItems.networkMarkers.filter((item) => item.category === "Access"), [mapItems.networkMarkers]);
  const selectedServiceNap = (() => {
    if (!["customer", "request", "subscriber"].includes(selectedItem?.type)) return null;
    if (!accessBoxes.length) return null;
    return accessBoxes.find((box) => box.id === (selectedItem.napId || napAssignments[selectedId]))
      || accessBoxes.reduce((nearest, box) => (routeDistance(selectedItem, box) < routeDistance(selectedItem, nearest) ? box : nearest), accessBoxes[0]);
  })();
  const selectedNapConnections = selectedServiceNap ? (napConnections[selectedServiceNap.id] || []) : [];
  const selectedSuggestedPort = selectedServiceNap ? portLabelForNap(selectedServiceNap, selectedNapConnections.length + 1) : "";
  const selectedBoxIssue = selectedItem?.type === "network" ? boxIssues[selectedItem.id] : null;
  const selectedBoxEditable = selectedItem?.type === "network" && selectedItem.category !== "Company";
  const selectedServiceEditable = ["customer", "request", "subscriber"].includes(selectedItem?.type);
  const selectedRouteSegments = selectedServiceNap
    ? findUpstreamSegments(selectedServiceNap.id, networkSegments, mapItems.networkMarkers)
    : selectedSegment ? [selectedSegment] : [];
  const selectedRouteSegmentKey = selectedRouteSegments.map((segment) => segment.id).join("|");
  const selectedRouteSegmentIds = new Set(selectedRouteSegments.map((segment) => segment.id));
  const selectedRoutePoles = (() => {
    if (!selectedServiceNap || !selectedItem || !mapItems.poleMarkers.length) return [];
    return mapItems.poleMarkers
      .filter((pole) => pole.napId === selectedServiceNap.id || routeDistance(pole, selectedItem) < 0.008 || routeDistance(pole, selectedServiceNap) < 0.008)
      .sort((a, b) => routeDistance(a, selectedServiceNap) - routeDistance(b, selectedServiceNap))
      .slice(0, 4);
  })();
  const selectedSegmentPath = selectedSegment
    ? routedSegmentPaths[selectedSegment.id] || segmentPath(selectedSegment)
    : [];
  const selectedSegmentMeters = routeLengthMeters(selectedSegmentPath);
  const selectedSegmentWireMeters = Math.ceil(selectedSegmentMeters * 1.12);
  const selectedDropPath = selectedServiceEditable ? serviceRoutePaths[selectedItem.id] || [] : [];
  const selectedDropMeters = routeLengthMeters(selectedDropPath);
  const selectedNetworkRouteMeters = selectedRouteSegments.reduce((total, segment) => (
    total + routeLengthMeters(routedSegmentPaths[segment.id] || segmentPath(segment))
  ), 0);
  const selectedTotalRouteMeters = selectedNetworkRouteMeters + selectedDropMeters;
  const selectedTotalWireMeters = Math.ceil(selectedTotalRouteMeters * 1.12);

  const selectedRoutePointDistances = useMemo(() => {
    if (!selectedSegment || !selectedRoutePoint) return null;
    const path = routedSegmentPaths[selectedSegment.id] || segmentPath(selectedSegment);
    if (!path || path.length < 2) return null;
    
    const pt = selectedRoutePoint;
    let bestIndex = 1;
    let minCost = Infinity;
    const getDist = (p1, p2) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
    
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const cost = getDist(p1, pt) + getDist(pt, p2) - getDist(p1, p2);
      if (cost < minCost) {
        minCost = cost;
        bestIndex = i + 1;
      }
    }
    
    const partialPath = [...path.slice(0, bestIndex), pt];
    const currentMeters = routeLengthMeters(partialPath);
    return { currentMeters };
  }, [selectedSegment, selectedRoutePoint, routedSegmentPaths]);
  const routedServiceItems = Array.from(new Map((selectedItem?.category === "Access"
    ? [...serviceLineItems, ...selectedConnections]
    : serviceLineItems).map((item) => [item.id, item])).values());
  const mapPositionForItem = (item) => item;
  const networkNodeById = useMemo(() => Object.fromEntries(mapItems.networkMarkers.map((node) => [node.id, node])), [mapItems.networkMarkers]);
  const routeEndpointItems = useMemo(() => mapItems.all.filter(hasValidCoordinates), [mapItems.all]);
  const routeEndpointById = useMemo(() => Object.fromEntries(routeEndpointItems.map((item) => [item.id, item])), [routeEndpointItems]);
  const nodeName = (nodeId) => routeEndpointById[nodeId]?.name || networkNodeById[nodeId]?.name || findNode(nodeId)?.name || nodeId;
  const nodeArea = (nodeId) => routeEndpointById[nodeId]?.address || routeEndpointById[nodeId]?.area || networkNodeById[nodeId]?.area || findNode(nodeId)?.area || nodeId;

  const searchableItems = useMemo(() => visibleItems.map((item) => ({
    ...item,
    searchText: [
      item.name,
      item.accountId,
      item.label,
      item.boxId,
      item.address,
      item.area,
      item.napId,
      item.portNumber,
    ].filter(Boolean).join(" ").toLowerCase(),
  })).concat(networkSegments.map((segment) => ({
    id: segment.id,
    type: "route",
    name: segment.label || segment.id,
    label: segment.label || segment.id,
    category: segment.kind,
    area: `${segment.from} to ${segment.to}`,
    searchText: [segment.id, segment.label, segment.kind, segment.from, segment.to, segment.cable].filter(Boolean).join(" ").toLowerCase(),
  }))), [visibleItems, networkSegments]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchableItems;
    return searchableItems.filter((item) => item.searchText.includes(query));
  }, [searchQuery, searchableItems]);

  const selectMapItem = (id) => {
    setSelectedId(id);
    setIsInspectorHidden(false);
    setActiveFilter("all");
  };

  const runSearch = (event) => {
    event.preventDefault();
    const match = searchResults[0];
    if (match) selectMapItem(match.id);
  };

  const addFallbackRoutePoint = (event) => {
    if (!isDrawingRoute && !isAddingRouteBends) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * mapWidth;
    const y = ((event.clientY - rect.top) / rect.height) * mapHeight;
    addManualRoutePoint(unprojectPoint(x, y));
  };

  const guideFallbackRoutePoint = (event) => {
    if ((!isDrawingRoute && !isAddingRouteBends) || !manualRoutePoints.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * mapWidth;
    const y = ((event.clientY - rect.top) / rect.height) * mapHeight;
    setManualRouteGuidePoint(unprojectPoint(x, y));
  };

  const finishFallbackRoutePoint = (event) => {
    if (!isDrawingRoute && !isAddingRouteBends) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * mapWidth;
    const y = ((event.clientY - rect.top) / rect.height) * mapHeight;
    finishManualRouteAtPoint(unprojectPoint(x, y));
  };

  const selectFallbackRoutePoint = (event, segmentId) => {
    if (isDrawingRoute || isAddingRouteBends) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) {
      setSelectedId(segmentId);
      return;
    }
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * mapWidth;
    const y = ((event.clientY - rect.top) / rect.height) * mapHeight;
    setSelectedRoutePoint({ segmentId, ...unprojectPoint(x, y) });
    setSelectedId(segmentId);
  };

  const saveSelectedBox = (event) => {
    event.preventDefault();
    if (!selectedBoxEditable) return;
    const formData = new FormData(event.currentTarget);
    const lat = Number(formData.get("lat") || selectedItem.lat);
    const lng = Number(formData.get("lng") || selectedItem.lng);
    const nextOverrides = {
      ...boxOverrides,
      [selectedItem.id]: {
        boxId: String(formData.get("boxId") || selectedItem.boxId).trim(),
        equipment: String(formData.get("equipment") || selectedItem.equipment).trim(),
        capacity: Number(formData.get("capacity") || selectedItem.capacity || 0),
        status: String(formData.get("status") || selectedItem.status),
        lat: Number.isFinite(lat) ? lat : selectedItem.lat,
        lng: Number.isFinite(lng) ? lng : selectedItem.lng,
        notes: String(formData.get("notes") || selectedItem.detail || "").trim(),
      },
    };
    setBoxOverrides(nextOverrides);
    saveStoredBoxOverrides(nextOverrides);
  };

  const resetBoxPositions = () => {
    const nextOverrides = Object.fromEntries(Object.entries(boxOverrides).map(([id, override]) => {
      const rest = { ...override };
      delete rest.lat;
      delete rest.lng;
      return [id, rest];
    }));
    setBoxOverrides(nextOverrides);
    saveStoredBoxOverrides(nextOverrides);
  };

  const resetDemoFieldPoints = () => {
    setManagedSubscribers([]);
    saveStoredSubscribers([]);
    setManagedPoles(magdalenaPoles);
    saveStoredPoles(magdalenaPoles);
    const nextAssignments = { ...napAssignments };
    Object.keys(nextAssignments).forEach((id) => {
      if (id.startsWith("subscriber-") || id.startsWith("customer-") || id.startsWith("ticket-") || id.startsWith("install-")) {
        delete nextAssignments[id];
      }
    });
    setNapAssignments(nextAssignments);
    saveStoredNapAssignments(nextAssignments);
  };
  const updateSelectedRouteLabel = (event) => {
    const newLabel = event.target.value.trim();
    if (!newLabel || !selectedSegment) return;
    const nextRoutes = customRoutes.map((route) => {
      if (route.id === selectedSegment.id) {
        return {
          ...route,
          label: newLabel,
          from: route.manualPath ? `${newLabel}.S` : route.from,
          to: route.manualPath ? `${newLabel}.E` : route.to,
        };
      }
      return route;
    });
    setCustomRoutes(nextRoutes);
    saveStoredCustomRoutes(nextRoutes);
  };

  const updateSelectedRouteCable = (event) => {
    const newCable = event.target.value;
    if (!selectedSegment) return;
    const nextRoutes = customRoutes.map((route) => route.id === selectedSegment.id ? { ...route, cable: newCable } : route);
    setCustomRoutes(nextRoutes);
    saveStoredCustomRoutes(nextRoutes);
  };

  const deleteMapItem = () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    if (selectedSegment) {
      const nextRoutes = customRoutes.filter((r) => r.id !== selectedSegment.id);
      setCustomRoutes(nextRoutes);
      saveStoredCustomRoutes(nextRoutes);

      const nextBoxes = { ...boxOverrides };
      let changedBoxes = false;
      Object.keys(nextBoxes).forEach((key) => {
        if (nextBoxes[key].segmentId === selectedSegment.id && !nextBoxes[key].deleted) {
          nextBoxes[key] = { ...nextBoxes[key], deleted: true };
          changedBoxes = true;
        }
      });
      if (changedBoxes) {
        setBoxOverrides(nextBoxes);
        saveStoredBoxOverrides(nextBoxes);
      }

      const nextPoles = managedPoles.filter((p) => p.segmentId !== selectedSegment.id);
      if (nextPoles.length !== managedPoles.length) {
        setManagedPoles(nextPoles);
        saveStoredPoles(nextPoles);
      }
    } else if (selectedItem) {
      if (selectedItem.type === "network") {
        const nextBoxes = { ...boxOverrides, [selectedItem.id]: { ...boxOverrides[selectedItem.id], deleted: true } };
        setBoxOverrides(nextBoxes);
        saveStoredBoxOverrides(nextBoxes);
      } else if (selectedItem.type === "pole") {
        const nextPoles = managedPoles.filter((p) => p.id !== selectedItem.id);
        setManagedPoles(nextPoles);
        saveStoredPoles(nextPoles);
      }
    }
    
    setSelectedId(null);
    setIsInspectorHidden(true);
  };

  const saveCustomRoute = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveRouteFromForm(formData);
    event.currentTarget.reset();
  };

  const saveRouteFromForm = (formData) => {
    const id = String(formData.get("id") || `route-${Date.now()}`).trim();
    const rawLength = String(formData.get("length") || "").trim();
    const estimatedLength = formatMeters(routeLengthMeters(manualRouteRoadPreviewPath.length >= 2 ? manualRouteRoadPreviewPath : manualRoutePoints));
    const hasDrawnPath = manualRoutePoints.length >= 2 || manualRouteRoadPreviewPath.length >= 2;
    const label = String(formData.get("label") || `Line ${networkSegments.length + 1}`).trim();
    const from = String(formData.get("from") || (hasDrawnPath ? `${label}.S` : ""));
    const to = String(formData.get("to") || (hasDrawnPath ? `${label}.E` : ""));
    const route = {
      id,
      label,
      from,
      to,
      createdAt: Date.now(),
      kind: String(formData.get("kind") || "Custom"),
      status: String(formData.get("status") || "online"),
      cable: String(formData.get("cable") || "Field route").trim(),
      length: rawLength && rawLength.toLowerCase() !== "tbd" ? rawLength : estimatedLength || "TBD",
      loss: String(formData.get("loss") || "TBD").trim(),
      notes: String(formData.get("notes") || "Admin-added route.").trim(),
      manualPath: manualRoutePoints.length >= 2,
      controlPoints: manualRoutePoints.length >= 2 ? manualRoutePoints : undefined,
      path: manualRouteRoadPreviewPath.length >= 2
        ? manualRouteRoadPreviewPath
        : manualRoutePoints.length >= 2 ? manualRoutePoints : undefined,
    };
    if (!route.from || !route.to || route.from === route.to) return;
    const nextRoutes = [route, ...customRoutes.filter((item) => item.id !== route.id)];
    setCustomRoutes(nextRoutes);
    saveStoredCustomRoutes(nextRoutes);
    setSelectedId(route.id);
    setManualRoutePoints([]);
    setIsDrawingRoute(false);
    setIsInspectorHidden(false);
  };

  const selectedRoutePlacementPoint = () => {
    if (selectedRoutePoint && selectedRoutePoint.segmentId === selectedSegment?.id) return selectedRoutePoint;
    const routePoints = routedSegmentPaths[selectedSegment?.id] || selectedSegment?.path || [];
    return routeMidpoint(routePoints) || magdalenaCenter;
  };

  const addBoxOnSelectedRoute = (choiceKey = "nap") => {
    if (!selectedSegment) return;
    const choice = routeEquipmentChoices[choiceKey] || routeEquipmentChoices.nap;
    const point = selectedRoutePlacementPoint();
    const coordinateKey = `${String(Number(point.lat).toFixed(5)).replace(/[^0-9]+/g, "")}-${String(Number(point.lng).toFixed(5)).replace(/[^0-9]+/g, "")}`;
    const id = `${choice.prefix.toLowerCase()}-${selectedSegment.id}-${coordinateKey}`;
    const name = `${choice.name} on ${selectedSegment.label || selectedSegment.id}`;
    
    // Calculate sequence number for this specific line
    const existingBoxesOnLine = Object.values(boxOverrides).filter(
      (box) => box.segmentId === selectedSegment.id && box.category === choice.category && !box.deleted
    );
    const boxId = `${choice.prefix}-${String(existingBoxesOnLine.length + 1).padStart(2, "0")}`;

    const nextOverrides = {
      ...boxOverrides,
      [id]: {
        custom: true,
        segmentId: selectedSegment.id,
        name,
        boxId,
        category: choice.category,
        equipment: choice.equipment,
        area: nodeArea(selectedSegment.to) || "Route",
        capacity: choice.capacity,
        lat: Number(point.lat),
        lng: Number(point.lng),
        status: "online",
        notes: `${choice.name} added on route ${selectedSegment.label || selectedSegment.id}.`,
      },
    };
    setBoxOverrides(nextOverrides);
    saveStoredBoxOverrides(nextOverrides);
    setSelectedId(id);
  };

  const addNapOnSelectedRoute = () => addBoxOnSelectedRoute("nap");

  const addPoleOnSelectedRoute = () => {
    if (!selectedSegment) return;
    const point = selectedRoutePlacementPoint();
    const id = `pole-${selectedSegment.id}-${String(Number(point.lat).toFixed(5)).replace(/[^0-9]+/g, "")}-${String(Number(point.lng).toFixed(5)).replace(/[^0-9]+/g, "")}`;
    const nearestNap = nearestItem(point, accessBoxes);
    const pole = {
      id,
      name: `Pole ${String(managedPoles.length + 1).padStart(2, "0")}`,
      area: nodeArea(selectedSegment.to) || "Route",
      lat: Number(point.lat),
      lng: Number(point.lng),
      napId: nearestNap?.id || "",
      napBoxId: nearestNap?.boxId || "",
      status: "online",
      notes: `Added on route ${selectedSegment.label || selectedSegment.id}.`,
    };
    const nextPoles = [pole, ...managedPoles.filter((item) => item.id !== pole.id)];
    setManagedPoles(nextPoles);
    saveStoredPoles(nextPoles);
    setSelectedId(pole.id);
  };

  const placeEquipmentOnSelectedRoute = (kind) => {
    if (kind === "pole") {
      addPoleOnSelectedRoute();
      return;
    }
    addBoxOnSelectedRoute(kind);
  };

  useEffect(() => {
    window.__rfiberPlaceOnRoute = (kind) => placeEquipmentOnSelectedRoute(kind);
    return () => {
      delete window.__rfiberPlaceOnRoute;
    };
  });

  const saveSelectedService = (event) => {
    event.preventDefault();
    if (!selectedServiceEditable) return;
    const formData = new FormData(event.currentTarget);
    const napId = String(formData.get("napId") || "");
    const nextAssignments = { ...napAssignments };
    if (napId) nextAssignments[selectedItem.id] = napId;
    else delete nextAssignments[selectedItem.id];
    setNapAssignments(nextAssignments);
    saveStoredNapAssignments(nextAssignments);
    if (selectedItem.type === "subscriber") {
      const nextSubscribers = managedSubscribers.map((subscriber) => (
        subscriber.id === selectedItem.id ? { ...subscriber, napId } : subscriber
      ));
      setManagedSubscribers(nextSubscribers);
      saveStoredSubscribers(nextSubscribers);
    }
  };

  const approveInstallationRequest = (event) => {
    event.preventDefault();
    if (selectedItem?.type !== "request") return;
    const formData = new FormData(event.currentTarget);
    const napId = String(formData.get("napId") || selectedServiceNap?.id || "");
    const assignedNap = accessBoxes.find((box) => box.id === napId) || selectedServiceNap;
    const fallbackAccountId = `RFX-${String(selectedItem.id || "INSTALL").replace(/[^a-z0-9]+/gi, "-").toUpperCase().slice(-8)}`;
    const accountId = String(formData.get("accountId") || fallbackAccountId).trim();
    const subscriber = {
      id: `subscriber-${accountId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      accountId,
      name: selectedItem.name || "New Subscriber",
      address: selectedItem.address || "Magdalena, Laguna",
      lat: selectedItem.lat,
      lng: selectedItem.lng,
      status: "active",
      napId,
      portNumber: String(formData.get("portNumber") || selectedSuggestedPort).trim(),
      technician: String(formData.get("technician") || "").trim(),
      notes: `Approved from ${selectedItem.source || "installation request"}. ${selectedItem.detail || ""}`.trim(),
    };
    const nextSubscribers = [subscriber, ...managedSubscribers.filter((item) => item.id !== subscriber.id)];
    setManagedSubscribers(nextSubscribers);
    saveStoredSubscribers(nextSubscribers);
    if (assignedNap) {
      const nextAssignments = { ...napAssignments, [subscriber.id]: assignedNap.id };
      setNapAssignments(nextAssignments);
      saveStoredNapAssignments(nextAssignments);
    }
    const nextStoredInstalls = storedInstalls.filter((request) => request.id !== selectedItem.id);
    if (nextStoredInstalls.length !== storedInstalls.length) {
      setStoredInstalls(nextStoredInstalls);
      saveStoredInstallationRequests(nextStoredInstalls);
    }
    setSelectedId(subscriber.id);
  };

  const renderSelectedInspector = () => {
    if (!selectedSegment && selectedItem?.id === "empty") {
      const allLines = networkSegments.length;
      let meters = 0;
      let cables = { "Main line": 0, "12 core": 0, "16 core": 0, "24 core": 0, "8 core": 0, "Field route": 0 };
      networkSegments.forEach(s => {
         meters += (s.meters || 0);
         cables[s.cable || "Field route"] = (cables[s.cable || "Field route"] || 0) + 1;
      });
      const km = (meters / 1000).toFixed(2);
      
      const naps = mapItems.networkMarkers.filter(m => m.category === "Access").length;
      const splitters = mapItems.networkMarkers.filter(m => m.category === "Splitter").length;
      const fdhs = mapItems.networkMarkers.filter(m => m.category === "Distribution").length;
      const poles = mapItems.poleMarkers.length;

      return (
        <>
          <span className="network-label">Selected map item</span>
          <h2>Whole Information</h2>
          <p>Total overview of the network mapping system</p>
          <dl>
            <div style={{ marginTop: '10px' }}><dt>Total Lines</dt><dd>{allLines}</dd></div>
            <div><dt>Total Length</dt><dd>{formatMeters(meters)} ({km} km)</dd></div>
            
            <div style={{ marginTop: '20px', gridColumn: '1 / -1', color: '#cbd5e1', fontWeight: 'bold' }}>Cable Usage</div>
            <div><dt>Main line</dt><dd>{cables["Main line"] || 0}</dd></div>
            <div><dt>24 core</dt><dd>{cables["24 core"] || 0}</dd></div>
            <div><dt>16 core</dt><dd>{cables["16 core"] || 0}</dd></div>
            <div><dt>12 core</dt><dd>{cables["12 core"] || 0}</dd></div>
            <div><dt>8 core</dt><dd>{cables["8 core"] || 0}</dd></div>
            <div><dt>Field route</dt><dd>{cables["Field route"] || 0}</dd></div>

            <div style={{ marginTop: '20px', gridColumn: '1 / -1', color: '#cbd5e1', fontWeight: 'bold' }}>Equipment Usage</div>
            <div><dt>NAPs</dt><dd>{naps}</dd></div>
            <div><dt>Poles</dt><dd>{poles}</dd></div>
            <div><dt>Splitters</dt><dd>{splitters}</dd></div>
            <div><dt>FDHs</dt><dd>{fdhs}</dd></div>
          </dl>
        </>
      );
    }

    return (
    <>
      <span className="network-label">Selected map item</span>
      {selectedSegment ? (
        <>
          <h2>
            <input 
              type="text" 
              defaultValue={selectedSegment.label || selectedSegment.id} 
              onBlur={updateSelectedRouteLabel} 
              className="network-route-name-input"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#fff', fontSize: 'inherit', fontWeight: 'inherit', padding: '4px', width: '100%', borderRadius: '4px' }}
            />
          </h2>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
            Start: {selectedSegment.from} <br/> End: {selectedSegment.to}
          </div>
          <dl>
            <div>
              <dt>Cable</dt>
              <dd>
                <select 
                  value={selectedSegment.cable || "Field route"} 
                  onChange={updateSelectedRouteCable}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '2px 4px', borderRadius: '4px', width: '100%' }}
                >
                  <option value="Main line">Main line</option>
                  <option value="12 core">12 core</option>
                  <option value="24 core">24 core</option>
                  <option value="8 core">8 core</option>
                  <option value="Field route">Field route</option>
                </select>
              </dd>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <dt>Saved length</dt>
                <dd>{selectedSegment.length}</dd>
              </div>
              {selectedSegmentMeters > 0 && (
                <div>
                  <dt>Map distance</dt>
                  <dd>{formatMeters(selectedSegmentMeters)}</dd>
                </div>
              )}
            </div>

            {selectedSegmentWireMeters > 0 && <div><dt>Cable to bring</dt><dd>{formatMeters(selectedSegmentWireMeters)}</dd></div>}
            
            {selectedRoutePointDistances && selectedRoutePointDistances.currentMeters > 0 && (
              <div>
                <dt>Current length</dt>
                <dd>{formatMeters(selectedRoutePointDistances.currentMeters)} <br/><small style={{color: '#94a3b8', fontSize: '11px'}}>(from start to click)</small></dd>
              </div>
            )}
            
            {selectedSegment.createdAt && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <dt>Date added</dt>
                  <dd>{new Date(selectedSegment.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt>Time added</dt>
                  <dd>{new Date(selectedSegment.createdAt).toLocaleTimeString()}</dd>
                </div>
              </div>
            )}
          </dl>
          <small>{selectedSegment.notes}</small>
        </>
      ) : (
        <>
          <h2>{selectedItem.name}</h2>
          {selectedItem.type !== "network" && <p>{selectedItem.source || selectedItem.type} - {selectedItem.category || selectedItem.area}</p>}
          <dl>
            {selectedItem.type !== "network" && <div><dt>Status</dt><dd>{subscriberStatusLabels[selectedItem.status] || statusLabels[selectedItem.status] || selectedItem.status}</dd></div>}
            {selectedItem.accountId && <div><dt>Account ID</dt><dd>{selectedItem.accountId}</dd></div>}
            {selectedItem.boxId && <div><dt>Box ID</dt><dd>{selectedItem.boxId}</dd></div>}
            {selectedItem.equipment && selectedItem.type !== "network" && <div><dt>Equipment</dt><dd>{selectedItem.equipment}</dd></div>}
            {selectedItem.capacity > 0 && <div><dt>Capacity</dt><dd>{selectedConnections.length}/{selectedItem.capacity} connected</dd></div>}
            {selectedItem.type === "pole" && selectedItem.napBoxId && <div><dt>Parent NAP</dt><dd>{selectedItem.napBoxId}</dd></div>}
            {selectedServiceNap && <div><dt>Connected NAP</dt><dd>{selectedServiceNap.boxId}</dd></div>}
            {selectedItem.portNumber && <div><dt>Port</dt><dd>{selectedItem.portNumber}</dd></div>}
            {selectedItem.technician && <div><dt>Technician</dt><dd>{selectedItem.technician}</dd></div>}
            <div><dt>Actual address</dt><dd>{selectedItem.resolvedAddress || "Resolving from GPS coordinates..."}</dd></div>
            {selectedItem.type !== "network" && <div><dt>Address accuracy</dt><dd>{selectedItem.addressAccuracy}</dd></div>}
            <div><dt>Stored pin</dt><dd>{Number(selectedItem.lat).toFixed(5)}, {Number(selectedItem.lng).toFixed(5)}</dd></div>
          </dl>
          {selectedServiceNap && (
            <div className="network-route-card">
              <strong>Fiber route</strong>
              <span>HQ to {selectedRouteSegments.map((segment) => nodeArea(segment.to)).join(" to ") || selectedServiceNap.area} to house</span>
              {selectedTotalRouteMeters > 0 && <small>Total route length: {formatMeters(selectedTotalRouteMeters)}</small>}
              {selectedTotalWireMeters > 0 && <small>Estimated cable to bring: {formatMeters(selectedTotalWireMeters)}</small>}
              {selectedDropMeters > 0 && <small>NAP to house drop: {formatMeters(selectedDropMeters)}</small>}
              <small>{selectedRoutePoles.length ? `Poles: ${selectedRoutePoles.map((pole) => pole.name).join(", ")}` : "No pole records near this drop yet."}</small>
              <small>Likely fault area: {selectedItem.status === "no-internet" ? selectedServiceNap.boxId : selectedRouteSegments.find((segment) => segment.status === "maintenance" || segment.status === "watch")?.id || "No active route issue detected"}</small>
            </div>
          )}
          {selectedItem.type === "request" && selectedServiceNap && (
            <form className="network-survey-card" onSubmit={approveInstallationRequest}>
              <strong>Installation workflow</strong>
              <span>Auto status: Pending Survey</span>
              <small>Suggested NAP: {selectedServiceNap.boxId} ({selectedNapConnections.length}/{selectedServiceNap.capacity || "?"} used)</small>
              <small>Suggested route: {selectedRouteSegments.map((segment) => segment.id).join(" -> ") || "Nearest NAP drop"}</small>
              <label>Account ID<input name="accountId" placeholder="RFX-1005" /></label>
              <label>Final NAP<select name="napId" defaultValue={selectedServiceNap.id}>{accessBoxes.map((box) => <option key={box.id} value={box.id}>{box.boxId} - {box.area}</option>)}</select></label>
              <label>Port<input name="portNumber" defaultValue={selectedSuggestedPort} /></label>
              <label>Technician<input name="technician" placeholder="Assign technician" /></label>
              <button className="role-action-button compact" type="submit">Confirm installation</button>
            </form>
          )}
          {selectedBoxIssue && (
            <div className={`network-issue-card ${selectedBoxIssue.severity}`}>
              <strong>Auto issue detector</strong>
              {selectedBoxIssue.messages.map((message) => <span key={message}>{message}</span>)}
            </div>
          )}
          {selectedBoxEditable && (
            <form key={selectedItem.id} className="network-box-form" onSubmit={saveSelectedBox}>
              <label>Box ID<input name="boxId" defaultValue={selectedItem.boxId} /></label>
              {selectedItem.type !== "network" && <label>Equipment<input name="equipment" defaultValue={selectedItem.equipment} /></label>}
              {selectedItem.type === "network" ? (
                <label>Capacity<select name="capacity" defaultValue={selectedItem.capacity}><option value="8">8</option><option value="16">16</option><option value="32">32</option></select></label>
              ) : (
                <label>Capacity<input name="capacity" type="number" min="0" defaultValue={selectedItem.capacity} /></label>
              )}
              {selectedItem.type !== "network" && <label>Status<select name="status" defaultValue={selectedItem.status}>{editableBoxStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>}
              {selectedItem.type !== "network" && <label>Latitude<input name="lat" type="number" step="0.000001" defaultValue={selectedItem.lat} /></label>}
              {selectedItem.type !== "network" && <label>Longitude<input name="lng" type="number" step="0.000001" defaultValue={selectedItem.lng} /></label>}
              <label className="network-box-form-wide">Field notes<textarea name="notes" defaultValue={selectedItem.detail || ""} /></label>
              <button className="role-action-button compact" type="submit">Save box</button>
            </form>
          )}
          {selectedServiceEditable && (
            <form key={`service-${selectedItem.id}`} className="network-box-form" onSubmit={saveSelectedService}>
              <label className="network-box-form-wide">Assigned NAP
                <select name="napId" defaultValue={selectedItem.napId || napAssignments[selectedItem.id] || selectedServiceNap?.id || ""}>
                  {accessBoxes.map((box) => (
                    <option key={box.id} value={box.id}>{box.boxId} - {box.area}</option>
                  ))}
                </select>
              </label>
              <button className="role-action-button compact" type="submit">Save connection</button>
            </form>
          )}
          {selectedItem.category === "Access" && (
            <div className="network-connection-list">
              <strong>Connected houses / requests ({selectedConnections.length})</strong>
              {selectedConnections.length ? selectedConnections.slice(0, 10).map((connection) => (
                <button key={connection.id} type="button" onClick={() => setSelectedId(connection.id)}>
                  <span>{connection.name}</span>
                  <small>{connection.assignmentSource === "manual" ? "Manual" : "Nearest"} - {connection.status} - {connection.address || connection.category || connection.source}</small>
                </button>
              )) : <small>No customer/request currently assigned to this NAP.</small>}
            </div>
          )}
          <small>{selectedItem.detail || selectedItem.notes}</small>
        </>
      )}
    </>
    );
  };

  useEffect(() => {
    if (!googleMapsApiKey || !mapNodeRef.current) return undefined;
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapNodeRef.current) return;
        if (!googleMapRef.current) {
          googleMapRef.current = new maps.Map(mapNodeRef.current, {
            center: magdalenaCenter,
            zoom: 14,
            mapTypeId: "hybrid",
            streetViewControl: true,
            fullscreenControl: false,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: maps.ControlPosition.TOP_LEFT,
            },
            zoomControl: true,
            gestureHandling: "greedy",
            styles: operationsMapStyles,
          });
          mapObjectsRef.current.infoWindow = new maps.InfoWindow();
          mapObjectsRef.current.infoWindow.addListener("closeclick", () => {
            setSelectedId(null);
            setIsInspectorHidden(true);
          });
        }
        setGoogleMapStatus("ready");
      })
      .catch(() => setGoogleMapStatus("failed"));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const isRoutePointMode = isDrawingRoute || isAddingRouteBends;
    if (googleMapStatus !== "ready" || !window.google?.maps || !googleMapRef.current || !isRoutePointMode) return undefined;
    const maps = window.google.maps;
    const map = googleMapRef.current;
    map.setOptions({
      clickableIcons: false,
      disableDoubleClickZoom: true,
      draggable: true,
      draggableCursor: "crosshair",
      gestureHandling: "greedy",
      scrollwheel: true,
      zoomControl: true,
    });
    const clickListener = maps.event.addListener(map, "click", (event) => {
      if (!event.latLng) return;
      addManualRoutePoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });
    const endListener = maps.event.addListener(map, "rightclick", (event) => {
      if (!event.latLng) return;
      finishManualRouteAtPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });
    const moveListener = maps.event.addListener(map, "mousemove", (event) => {
      if (!event.latLng || !manualRoutePoints.length) return;
      setManualRouteGuidePoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });
    return () => {
      maps.event.removeListener(clickListener);
      maps.event.removeListener(endListener);
      maps.event.removeListener(moveListener);
      setManualRouteGuidePoint(null);
      map.setOptions({
        clickableIcons: true,
        disableDoubleClickZoom: false,
        draggable: true,
        draggableCursor: null,
        gestureHandling: "greedy",
        scrollwheel: true,
        zoomControl: true,
      });
    };
  }, [addManualRoutePoint, finishManualRouteAtPoint, googleMapStatus, isAddingRouteBends, isDrawingRoute]);

  useEffect(() => {
    if (googleMapStatus !== "ready" || !window.google?.maps || manualRoutePoints.length < 2) {
      setManualRouteRoadPreviewPath([]);
      return undefined;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const maps = window.google.maps;
      const directionsService = new maps.DirectionsService();
      const cleanPoints = manualRoutePoints
        .map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) }))
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
      if (cleanPoints.length < 2) return;

      const routeLeg = (origin, destination, mode) => new Promise((resolve) => {
        directionsService.route({
          origin,
          destination,
          travelMode: mode,
          optimizeWaypoints: false,
          provideRouteAlternatives: false,
        }, (result, status) => {
          const routePath = detailedDirectionsPath(result, origin, destination);
          if (status === "OK" && routePath.length) {
            resolve(routePath);
            return;
          }
          resolve(null);
        });
      });

      const routeEveryClickedBend = async () => {
        const routedPath = [];
        for (let index = 0; index < cleanPoints.length - 1; index += 1) {
          if (cancelled) return;
          const origin = cleanPoints[index];
          const destination = cleanPoints[index + 1];
          const roadLeg = await routeLeg(origin, destination, maps.TravelMode.DRIVING)
            || await routeLeg(origin, destination, maps.TravelMode.WALKING)
            || [origin, destination];
          routedPath.push(...(routedPath.length ? roadLeg.slice(1) : roadLeg));
        }
        if (!cancelled) setManualRouteRoadPreviewPath(routedPath);
      };

      routeEveryClickedBend();
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [googleMapStatus, manualRoutePoints]);

  useEffect(() => {
    if (googleMapStatus !== "ready" || !window.google?.maps || !googleMapRef.current) return undefined;
    let cancelled = false;
    const maps = window.google.maps;
    const directionsService = new maps.DirectionsService();
    const wait = (delay) => new Promise((resolve) => { window.setTimeout(resolve, delay); });

    const routeAlongRoad = (points, options = {}) => new Promise((resolve) => {
      const cleanPoints = points
        .map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) }))
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

      if (cleanPoints.length < 2) {
        resolve({ path: [], usedDirections: false, status: "NO_POINTS" });
        return;
      }

      if (options.preserveManual) {
        resolve({ path: cleanPoints, usedDirections: true, status: "MANUAL_PATH" });
        return;
      }

      const routeModes = [maps.TravelMode.DRIVING, maps.TravelMode.WALKING];
      const waypoints = cleanPoints.slice(1, -1).slice(0, 23).map((point) => ({
        location: point,
        stopover: false,
      }));
      const requestRoute = (modeIndex) => {
        directionsService.route({
          origin: cleanPoints[0],
          destination: cleanPoints[cleanPoints.length - 1],
          waypoints,
          travelMode: routeModes[modeIndex],
          optimizeWaypoints: false,
          provideRouteAlternatives: false,
        }, (result, status) => {
          const routePath = detailedDirectionsPath(
            result,
            cleanPoints[0],
            cleanPoints[cleanPoints.length - 1]
          );
          if (status === "OK" && routePath.length) {
            resolve({ path: routePath, usedDirections: true, status });
            return;
          }
          if (modeIndex + 1 < routeModes.length) {
            requestRoute(modeIndex + 1);
            return;
          }
          console.error("Google Maps Directions API Failed! Status:", status);
          resolve({ path: cleanPoints, usedDirections: false, status });
        });
      };

      requestRoute(0);
    });

    const resolveRouteQueue = async (routes) => {
      const entries = [];
      for (const route of routes) {
        if (cancelled) break;
        const result = await routeAlongRoad(route.points, { preserveManual: route.preserveManual });
        entries.push({ id: route.id, ...result });
        await wait(150);
      }
      return entries;
    };

    setRouteStatus("routing");

    const networkRoutes = networkSegments.map((segment) => ({
      id: segment.id,
      preserveManual: Boolean(segment.manualPath && segment.path?.length >= 2),
      points: segment.path?.length >= 2
        ? segment.path
        : [
          routeEndpointById[segment.from],
          routeEndpointById[segment.to],
        ].filter(Boolean),
    }));
    const routeServiceItems = Array.from(new Map((selectedItem?.category === "Access"
      ? [...serviceLineItems, ...(napConnections[selectedId] || [])]
      : serviceLineItems).map((item) => [item.id, item])).values());
    const selectedConnectionIds = new Set((napConnections[selectedId] || []).map((item) => item.id));
    const serviceRoutes = routeServiceItems.map((item) => ({
      id: item.id,
      points: (() => {
        const assignedNap = selectedItem?.category === "Access" && selectedConnectionIds.has(item.id)
          ? selectedItem
          : accessBoxes.find((box) => box.id === (item.napId || napAssignments[item.id])) || nearestFiberNode(item);
        const polePath = mapItems.poleMarkers
          .filter((pole) => pole.napId === assignedNap?.id || item.poleIds?.includes(pole.id))
          .sort((a, b) => routeDistance(a, assignedNap) - routeDistance(b, assignedNap))
          .slice(0, 4);
        return [assignedNap, ...polePath, item].filter(Boolean);
      })(),
    }));

    Promise.all([resolveRouteQueue(networkRoutes), resolveRouteQueue(serviceRoutes)]).then(([networkEntries, serviceEntries]) => {
      if (cancelled) return;
      const routedNetworks = networkEntries.filter((entry) => entry.path?.length);
      const routedServices = serviceEntries.filter((entry) => entry.path?.length);
      setRoutedSegmentPaths(Object.fromEntries(routedNetworks.map((entry) => [entry.id, entry.path])));
      setServiceRoutePaths(Object.fromEntries(routedServices.map((entry) => [entry.id, entry.path])));
      const failedEntries = [...networkEntries, ...serviceEntries].filter((entry) => !entry.usedDirections && entry.status !== "MANUAL_PATH");
      const failureCounts = failedEntries.reduce((counts, entry) => ({ ...counts, [entry.status || "UNKNOWN"]: (counts[entry.status || "UNKNOWN"] || 0) + 1 }), {});
      setRouteFailures(failureCounts);
      const totalRoutes = networkEntries.length + serviceEntries.length;
      const successfulTotal = [...networkEntries, ...serviceEntries].filter((entry) => entry.usedDirections || entry.status === "MANUAL_PATH").length;
      setRouteStatus(successfulTotal === totalRoutes ? "ready" : successfulTotal > 0 ? "partial" : "failed");
    });

    return () => {
      cancelled = true;
    };
  }, [accessBoxes, googleMapStatus, mapItems.poleMarkers, napAssignments, napConnections, networkSegments, routeEndpointById, selectedId, selectedItem?.category, serviceLineItems]);

  const routeFailureText = useMemo(() => Object.entries(routeFailures)
    .map(([status, count]) => `${count} ${status}`)
    .join(", "), [routeFailures]);
  const guidedManualRoutePoints = useMemo(() => (
    manualRouteGuidePoint && manualRoutePoints.length
      ? isAddingRouteBends && manualRoutePoints.length >= 2
        ? [...manualRoutePoints.slice(0, -1), manualRouteGuidePoint, manualRoutePoints[manualRoutePoints.length - 1]]
        : isDrawingRoute ? [...manualRoutePoints, manualRouteGuidePoint] : manualRoutePoints
      : manualRoutePoints
  ), [isAddingRouteBends, isDrawingRoute, manualRouteGuidePoint, manualRoutePoints]);
  const manualRouteCommittedPreview = useMemo(() => (
    manualRouteRoadPreviewPath.length >= 2 ? manualRouteRoadPreviewPath : manualRoutePoints
  ), [manualRouteRoadPreviewPath, manualRoutePoints]);
  const manualRouteMeters = useMemo(() => routeLengthMeters(manualRouteCommittedPreview), [manualRouteCommittedPreview]);
  const suggestedCableMeters = manualRouteMeters ? Math.ceil(manualRouteMeters * 1.12) : 0;
  const manualRouteLengthLabel = formatMeters(manualRouteMeters);
  const suggestedCableLabel = formatMeters(suggestedCableMeters);
  const isDrawToolbarExpanded = isDrawToolbarOpen || isDrawingRoute || isAddingRouteBends || manualRoutePoints.length > 0;
  const cancelDrawing = () => {
    clearManualRoute();
    setIsDrawToolbarOpen(false);
    setIsAddingRouteBends(false);
    setIsDrawingRoute(false);
  };

  const renderDrawToolbar = () => (
    <div className={`network-map-draw-toolbar ${isDrawToolbarExpanded ? "expanded" : "collapsed"}`} role="group" aria-label="Fiber route drawing controls">
      {manualRoutePoints.length < 2 && (
        <button className="network-map-draw-toggle" type="button" onClick={() => { setIsDrawToolbarOpen(true); beginRouteDrawing(); }}>
          Add line
        </button>
      )}
      {isDrawToolbarExpanded && (
        <>
          <strong>{manualRoutePoints.length ? `${manualRoutePoints.length} point${manualRoutePoints.length === 1 ? "" : "s"}` : "Draw cable"}</strong>
          {manualRouteLengthLabel && <span>{manualRouteLengthLabel} route / {suggestedCableLabel} wire</span>}
          <div style={{ flexBasis: '100%', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={cancelDrawing}>Cancel</button>
            <button type="submit" form="network-route-form" disabled={manualRoutePoints.length < 2}>Save</button>
            <button type="button" onClick={undoManualRoutePoint} disabled={!manualRoutePoints.length}>Undo</button>
            <button type="button" onClick={clearManualRoute} disabled={!manualRoutePoints.length && !isDrawingRoute && !isAddingRouteBends}>Clear</button>
            <button type="button" onClick={beginRouteBending} disabled={manualRoutePoints.length < 2}>Add bend</button>
          </div>
        </>
      )}
    </div>
  );

  useEffect(() => {
    if (googleMapStatus !== "ready" || !window.google?.maps || !googleMapRef.current) return;
    const maps = window.google.maps;
    const map = googleMapRef.current;

    mapObjectsRef.current.markers.forEach((marker) => marker.setMap(null));
    mapObjectsRef.current.polylines.forEach((line) => line.setMap(null));
    mapObjectsRef.current.markers = [];
    mapObjectsRef.current.polylines = [];

    if (manualRouteCommittedPreview.length) {
      const previewLine = new maps.Polyline({
        path: manualRouteCommittedPreview.map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) })),
        geodesic: false,
        strokeColor: "#fbbf24",
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map,
        zIndex: 1200,
      });
      mapObjectsRef.current.polylines.push(previewLine);
      if (isDrawingRoute && manualRouteGuidePoint && manualRoutePoints.length) {
        const lastPoint = manualRoutePoints[manualRoutePoints.length - 1];
        const guideLine = new maps.Polyline({
          path: [lastPoint, manualRouteGuidePoint].map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) })),
          geodesic: false,
          strokeColor: "#fbbf24",
          strokeOpacity: 0.82,
          strokeWeight: 3,
          map,
          zIndex: 1210,
          icons: [
            { icon: { path: maps.SymbolPath.CIRCLE, scale: 4, fillOpacity: 1, strokeOpacity: 1 }, offset: "0%" },
            { icon: { path: maps.SymbolPath.CIRCLE, scale: 4, fillOpacity: 1, strokeOpacity: 1 }, offset: "100%" },
            { icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }
          ],
        });
        mapObjectsRef.current.polylines.push(guideLine);
      }
      if (isAddingRouteBends && manualRouteGuidePoint && manualRoutePoints.length >= 2) {
        const pt = manualRouteGuidePoint;
        let bestIndex = 1;
        let minCost = Infinity;
        const getDist = (p1, p2) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
        for (let i = 0; i < manualRoutePoints.length - 1; i++) {
          const p1 = manualRoutePoints[i];
          const p2 = manualRoutePoints[i + 1];
          const cost = getDist(p1, pt) + getDist(pt, p2) - getDist(p1, p2);
          if (cost < minCost) {
            minCost = cost;
            bestIndex = i + 1;
          }
        }
        const guideLine = new maps.Polyline({
          path: [
            manualRoutePoints[bestIndex - 1],
            pt,
            manualRoutePoints[bestIndex],
          ].map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) })),
          geodesic: false,
          strokeColor: "#fbbf24",
          strokeOpacity: 0.62,
          strokeWeight: 2,
          map,
          zIndex: 1210,
          icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }],
        });
        mapObjectsRef.current.polylines.push(guideLine);
      }
      manualRoutePoints.forEach((point, index) => {
        const marker = new maps.Marker({
          position: { lat: Number(point.lat), lng: Number(point.lng) },
          map,
          title: `Route point ${index + 1}`,
          label: { text: String(index + 1), color: "#111827", fontWeight: "900", fontSize: "11px" },
          icon: {
            path: maps.SymbolPath.CIRCLE,
            fillColor: "#fbbf24",
            fillOpacity: 1,
            strokeColor: "#111827",
            strokeWeight: 2,
            scale: index === 0 ? 9 : 7,
          },
          zIndex: 1250,
        });
        mapObjectsRef.current.markers.push(marker);
      });
    }

    if (searchedAddressPin) {
      const marker = new maps.Marker({
        position: { lat: Number(searchedAddressPin.lat), lng: Number(searchedAddressPin.lng) },
        map,
        title: searchedAddressPin.name,
        label: { text: "ADR", color: "#ffffff", fontWeight: "900", fontSize: "10px" },
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 9,
        },
        zIndex: 1300,
      });
      marker.addListener("click", () => {
        if (isDrawingRoute || isAddingRouteBends) {
          addManualRoutePoint(searchedAddressPin);
          return;
        }
        mapObjectsRef.current.infoWindow?.setContent(`
          <div class="network-info-window" style="min-width:150px;max-width:230px;color:#172033;font-family:DM Sans, Manrope, Arial, sans-serif;line-height:1.35;">
            <strong style="display:block;color:#101828;font-size:14px;font-weight:900;margin:0 0 5px;">Searched address</strong>
            <span style="display:block;color:#344054;font-size:12px;font-weight:800;margin:0 0 3px;">${searchedAddressPin.name}</span>
            <small style="display:block;color:#667085;font-size:11px;font-weight:700;">${searchedAddressPin.address}</small>
          </div>
        `);
        mapObjectsRef.current.infoWindow?.open({ map, anchor: marker });
      });
      mapObjectsRef.current.markers.push(marker);
    }

    networkSegments.forEach((segment) => {
      const routePoints = routedSegmentPaths[segment.id];
      if (!routePoints?.length) return;
      const color = cableColors[segment.cable] || statusColors[segment.status] || "#64748b";
      const isRouteSelected = selectedId === segment.id || selectedRouteSegmentIds.has(segment.id);
      const line = new maps.Polyline({
        path: routePoints.map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) })),
        geodesic: false,
        strokeColor: selectedRouteSegmentIds.has(segment.id) ? "#fbbf24" : color,
        strokeOpacity: isRouteSelected ? 0.95 : segment.status === "planned" ? 0.55 : 0.82,
        strokeWeight: isRouteSelected ? 6 : 4,
        map,
        icons: segment.status === "planned" ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 }, offset: "0", repeat: "18px" }] : undefined,
      });
      line.addListener("click", (event) => {
        if ((isDrawingRoute || isAddingRouteBends) && event.latLng) {
          addManualRoutePoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
          return;
        }
        if (event.latLng) {
          setSelectedRoutePoint({ segmentId: segment.id, lat: event.latLng.lat(), lng: event.latLng.lng() });
          mapObjectsRef.current.infoWindow?.setContent(routePlacementMenuHtml(segment.label || segment.id));
          mapObjectsRef.current.infoWindow?.setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
          mapObjectsRef.current.infoWindow?.open({ map, disableAutoPan: true });
        }
        selectMapItem(segment.id);
      });
      mapObjectsRef.current.polylines.push(line);

      const startPoint = routePoints[0];
      const endPoint = routePoints[routePoints.length - 1];

      const startMarker = new maps.Marker({
        position: { lat: Number(startPoint.lat), lng: Number(startPoint.lng) },
        map,
        title: `${segment.label || segment.id} Start`,
        label: { text: "S", color: "#ffffff", fontWeight: "900", fontSize: "12px" },
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 9,
        },
        zIndex: isRouteSelected ? 950 : 750,
      });
      startMarker.addListener("click", () => selectMapItem(segment.id));
      mapObjectsRef.current.markers.push(startMarker);

      const endMarker = new maps.Marker({
        position: { lat: Number(endPoint.lat), lng: Number(endPoint.lng) },
        map,
        title: `${segment.label || segment.id} End`,
        label: { text: "E", color: "#ffffff", fontWeight: "900", fontSize: "12px" },
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 9,
        },
        zIndex: isRouteSelected ? 950 : 750,
      });
      endMarker.addListener("click", () => selectMapItem(segment.id));
      mapObjectsRef.current.markers.push(endMarker);

      const labelPoint = routeMidpoint(routePoints);
      if (labelPoint) {
        const labelMarker = new maps.Marker({
          position: { lat: Number(labelPoint.lat), lng: Number(labelPoint.lng) },
          map,
          title: `${segment.id} ${segment.kind}`,
          icon: buildRouteLabelIcon(maps, segment.label || segment.id, color, selectedId === segment.id),
          zIndex: selectedId === segment.id ? 930 : 720,
        });
        labelMarker.addListener("click", () => {
          if (isDrawingRoute || isAddingRouteBends) {
            addManualRoutePoint(labelPoint);
            return;
          }
          setSelectedRoutePoint({ segmentId: segment.id, lat: Number(labelPoint.lat), lng: Number(labelPoint.lng) });
          mapObjectsRef.current.infoWindow?.setContent(routePlacementMenuHtml(segment.label || segment.id));
          mapObjectsRef.current.infoWindow?.setPosition({ lat: Number(labelPoint.lat), lng: Number(labelPoint.lng) });
          mapObjectsRef.current.infoWindow?.open({ map, disableAutoPan: true });
          selectMapItem(segment.id);
        });
        mapObjectsRef.current.markers.push(labelMarker);
      }
    });

    routedServiceItems.forEach((item) => {
      const routePoints = serviceRoutePaths[item.id];
      if (!routePoints?.length) return;
      const color = statusColors[item.status] || "#8b5cf6";
      const line = new maps.Polyline({
        path: routePoints.map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) })),
        geodesic: false,
        strokeColor: color,
        strokeOpacity: selectedId === item.id ? 0.9 : 0.45,
        strokeWeight: selectedId === item.id ? 3 : 1.5,
        map,
      });
      line.addListener("click", (event) => {
        if ((isDrawingRoute || isAddingRouteBends) && event.latLng) {
          addManualRoutePoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
          return;
        }
        setSelectedId(item.id);
      });
      mapObjectsRef.current.polylines.push(line);
    });

    visibleItems.forEach((item) => {
      const issue = item.type === "network" ? boxIssues[item.id] : null;
      const color = issue?.severity === "critical" ? "#e31b23" : issue ? "#f59e0b" : statusColors[item.status] || "#64748b";
      const markerItem = item.type === "network" && issue ? { ...item, issueSeverity: issue.severity } : item;
      const markerPosition = mapPositionForItem(item);
      const markerIcon = item.type === "network"
        ? buildNetworkIcon(maps, markerItem, selectedId === item.id)
        : item.type === "pole"
          ? buildNetworkIcon(maps, { ...item, category: "Pole" }, selectedId === item.id)
          : item.type === "subscriber"
            ? buildHouseIcon(maps, item, selectedId === item.id)
            : {
              path: maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: selectedId === item.id ? "#111927" : "#ffffff",
              strokeWeight: selectedId === item.id ? 4 : 2,
              scale: 7,
            };
      const marker = new maps.Marker({
        position: { lat: Number(markerPosition.lat), lng: Number(markerPosition.lng) },
        map,
        title: item.name,
        label: ["network", "pole", "subscriber"].includes(item.type) ? undefined : { text: String(item.label).slice(0, 6), color: "#ffffff", fontWeight: "800", fontSize: "10px" },
        icon: markerIcon,
      });
      marker.addListener("click", () => {
        if (isDrawingRoute || isAddingRouteBends) {
          addManualRoutePoint(markerPosition);
          return;
        }
        setSelectedId(item.id);
        mapObjectsRef.current.infoWindow?.setContent(`
          <div class="network-info-window" style="min-width:150px;max-width:230px;color:#172033;font-family:DM Sans, Manrope, Arial, sans-serif;line-height:1.35;">
            <strong style="display:block;color:#101828;font-size:14px;font-weight:900;margin:0 0 5px;">${item.name}</strong>
            <span style="display:block;color:#344054;font-size:12px;font-weight:800;margin:0 0 3px;">${item.equipment || item.category || item.source || "Map item"}</span>
            <small style="display:block;color:#667085;font-size:11px;font-weight:700;">${item.resolvedAddress || "Resolving actual address..."}</small>
            <small style="display:block;color:#98a2b3;font-size:10px;font-weight:700;margin-top:3px;">${item.addressAccuracy}</small>
          </div>
        `);
        mapObjectsRef.current.infoWindow?.open({ map, anchor: marker });
      });
      mapObjectsRef.current.markers.push(marker);
    });
  }, [addManualRoutePoint, boxIssues, googleMapStatus, isAddingRouteBends, isDrawingRoute, manualRouteCommittedPreview, manualRouteGuidePoint, manualRoutePoints, networkSegments, routedSegmentPaths, routedServiceItems, searchedAddressPin, selectedId, selectedRouteSegmentKey, serviceRoutePaths, visibleItems]);

  useEffect(() => {
    focusSelectedOnMap();
    if (selectedId && selectedId !== "headend" && selectedId !== "empty") {
      setLeftTab("Mapping");
    }
  }, [selectedId]);

  return (
    <div className="network-page role-workspace">

      <main className="network-shell">
        <section className="network-workspace real-map-workspace">
          <aside className="network-panel">
            <form className="network-search-card" onSubmit={runSearch}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="network-label" style={{ margin: 0 }}>Search</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    type="button"
                    className={`role-action-button compact ${leftTab === 'Mapping' ? '' : 'secondary'}`} 
                    onClick={() => setLeftTab('Mapping')} 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                  >Mapping</button>
                  <button 
                    type="button"
                    className={`role-action-button compact ${leftTab === 'Client' ? '' : 'secondary'}`} 
                    onClick={() => setLeftTab('Client')} 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                  >Client</button>
                </div>
              </div>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Account ID, client name, NAP" />
              <button className="role-action-button compact" type="submit" style={{ display: 'none' }}>Search map</button>
              
              {leftTab === 'Mapping' ? (
                <div className="network-search-results" style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {searchResults.map((result) => (
                    <button key={result.id} type="button" onClick={() => selectMapItem(result.id)} style={{ width: '100%', textAlign: 'left', display: 'block' }}>
                      <strong>{result.name}</strong>
                      <small style={{ color: '#94a3b8' }}>{result.area || result.address || result.category}</small>
                    </button>
                  ))}
                </div>
              ) : (() => {
                const filteredClients = rawLocationClients.filter(c => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (c.name || c.fullName || "").toLowerCase().includes(q) || (c.accountNumber || c.id || "").toLowerCase().includes(q);
                });
                return (
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
                  {filteredClients.length > 0 && (
                    <button 
                      type="button" 
                      className={`role-action-button ${isShowingAllPins ? 'secondary' : ''}`} 
                      onClick={() => toggleAllClientPins(filteredClients)}
                      style={{ marginBottom: '0.5rem', width: '100%' }}
                    >
                      {isShowingAllPins ? "Remove all pinpoints" : "Show all pinpoints"}
                    </button>
                  )}
                  <div className="network-client-list" style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredClients.map(c => (
                       <button key={c.id} type="button" onClick={() => panToClient(c)} style={{ width: '100%', textAlign: 'left', display: 'block', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                         <strong style={{ display: 'block', marginBottom: '0.1rem', fontSize: '0.8rem' }}>{c.name || c.fullName}</strong>
                         <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>ID: {c.accountNumber || c.id}</small>
                       </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem', padding: '0.5rem', textAlign: 'center' }}>No clients found matching the search.</div>
                    )}
                  </div>
                </div>
                );
              })()}
            </form>

            <span className="network-label">Map layers</span>
            <div className="network-filter-row">
              {filters.map((filter) => (
                <button key={filter} type="button" className={activeFilter === filter ? "active" : ""} onClick={() => { setActiveFilter(filter); setLeftTab('Mapping'); }}>
                  {filter === "all" ? "All" : filter}
                </button>
              ))}
            </div>

          </aside>

          <div className="network-map-card real-map-card">
            <div className="network-map-head">
              <div>
                <span className="network-label">Google Maps</span>
                <h2>Magdalena fiber box and service view</h2>
              </div>
              <form className="google-map-address-search" onSubmit={searchMapAddress}>
                <span style={{ marginRight: '10px' }}>{googleMapStatus === "ready" ? `${visibleItems.length} visible pins` : "Google Maps setup required"}</span>
                <input value={mapAddressQuery} onChange={(event) => setMapAddressQuery(event.target.value)} placeholder="Search address or barangay" />
                <button type="submit" disabled={googleMapStatus !== "ready" || !mapAddressQuery.trim()}>Search</button>
                {searchedAddressPin && <button type="button" onClick={() => { setSearchedAddressPin(null); setMapAddressStatus(""); }}>Clear</button>}
                {mapAddressStatus && <span>{mapAddressStatus}</span>}
              </form>
            </div>

            {googleMapsApiKey ? (
              <div className="google-map-shell" ref={mapShellRef}>
                {googleMapStatus === "failed" && <div className="google-map-notice">Google Maps could not load. Check billing, Maps JavaScript API, and website restrictions. For this dev server, allow http://127.0.0.1:5174/* and http://localhost:5174/*.</div>}
                {googleMapStatus === "ready" && routeStatus === "routing" && <div className="google-map-notice">Routing fiber lines along roads...</div>}
                {googleMapStatus === "ready" && routeStatus === "partial" && <div className="google-map-notice">Some lines are using saved manual points because Google routing missed them. Status: {routeFailureText || "unknown"}.</div>}
                {googleMapStatus === "ready" && routeStatus === "failed" && <div className="google-map-notice">Showing saved manual route points. Google road routing status: {routeFailureText || "unknown"}. Check Directions API (Legacy), billing, and key restrictions.</div>}
                {(isDrawingRoute || isAddingRouteBends) && <div className="google-map-notice drawing">{isAddingRouteBends ? "Bend mode: click the road where the cable should bend. Use Done when finished." : "Draw mode: first click creates the start marker and guide line. Second click sets the endpoint."}</div>}
                {renderDrawToolbar()}
                <button className="network-map-fullscreen-toggle" type="button" onClick={toggleMapFullscreen}>
                  {isMapFullscreen ? "Exit fullscreen" : "Fullscreen"}
                </button>
                <button className="network-map-inspector-toggle" type="button" onClick={() => setIsInspectorHidden((hidden) => !hidden)}>
                  {isInspectorHidden ? "Show info" : "Hide info"}
                </button>
                <div className="google-map-canvas" ref={mapNodeRef} aria-label="Google map of Magdalena service requests and fiber routes" />
                {!isInspectorHidden && (
                  <aside className="network-map-inspector" aria-live="polite">
                    <div className="network-map-inspector-bar">
                      <span>Info panel</span>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {(selectedSegment || (selectedItem && selectedItem.type !== "request")) && (
                          <button type="button" onClick={deleteMapItem} style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Delete</button>
                        )}
                        <button type="button" onClick={() => { setIsInspectorHidden(true); setSelectedId(null); mapObjectsRef.current?.infoWindow?.close(); }} aria-label="Hide map info panel">Hide</button>
                      </div>
                    </div>
                    {renderSelectedInspector()}
                  </aside>
                )}
              </div>
            ) : (
              <div className="google-map-fallback">
                <div className="google-map-notice">Add VITE_GOOGLE_MAPS_API_KEY to use the real Google Map. Showing fallback map for local testing.</div>
                {renderDrawToolbar()}
                <div className="real-map-stage" style={{ aspectRatio: `${mapWidth} / ${mapHeight}` }}>
                  <div className="real-map-viewport">
                    <div className="real-map-tiles" aria-hidden="true">
                      {tiles.map((tile) => (
                        <img key={tile.key} src={tile.src} alt="" loading="lazy" style={{ left: `${tile.left}%`, top: `${tile.top}%`, width: `${tile.width}%`, height: `${tile.height}%` }} />
                      ))}
                    </div>
                    <svg
                      className={`real-map-overlay ${isDrawingRoute || isAddingRouteBends ? "drawing" : ""}`}
                      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                      aria-label="Magdalena fiber and installation overlays"
                      onClick={addFallbackRoutePoint}
                      onMouseMove={guideFallbackRoutePoint}
                      onMouseLeave={() => setManualRouteGuidePoint(null)}
                      onContextMenu={finishFallbackRoutePoint}
                    >
                      {guidedManualRoutePoints.length > 0 && (
                        <g className="manual-route-preview">
                          {guidedManualRoutePoints.length > 1 && <polyline points={guidedManualRoutePoints.map(projectPoint).map((point) => `${point.x},${point.y}`).join(" ")} />}
                          {manualRoutePoints.map((point, index) => {
                            const preview = projectPoint(point);
                            return (
                              <g key={`${point.lat}-${point.lng}-${index}`}>
                                <circle cx={preview.x} cy={preview.y} r="8" />
                                <text x={preview.x} y={preview.y + 4}>{index + 1}</text>
                              </g>
                            );
                          })}
                        </g>
                      )}
                      {networkSegments.map((segment) => {
                        const routePoints = segmentPath(segment).map(projectPoint);
                        const svgPoints = routePoints.map((point) => `${point.x},${point.y}`).join(" ");
                        const isSelected = selectedId === segment.id || selectedRouteSegmentIds.has(segment.id);
                        return (
                          <g key={segment.id}>
                            <polyline points={svgPoints} className="network-line-hit" onClick={(event) => selectFallbackRoutePoint(event, segment.id)} />
                            <polyline points={svgPoints} className={`network-line ${statusClass(segment.status)} ${isSelected ? "selected" : ""}`} onClick={(event) => selectFallbackRoutePoint(event, segment.id)} />
                          </g>
                        );
                      })}
                      {visibleItems.map((item) => {
                        const point = projectPoint(mapPositionForItem(item));
                        const isSelected = selectedId === item.id;
                        return (
                          <g key={item.id} className="real-map-marker" onClick={(event) => {
                            if (isDrawingRoute || isAddingRouteBends) {
                              event.stopPropagation();
                              addManualRoutePoint(mapPositionForItem(item));
                              return;
                            }
                            setSelectedId(item.id);
                          }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(item.id); }} role="button" tabIndex="0">
                            <circle cx={point.x} cy={point.y} r={item.type === "network" ? 12 : 10} className={`${statusClass(item.status)} ${item.type === "request" ? "request" : ""} ${isSelected ? "selected" : ""}`} />
                            <text x={point.x} y={point.y - 17}>{item.label}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="real-map-attribution">(c) OpenStreetMap contributors</div>
                </div>
              </div>
            )}
          </div>
          <form id="network-route-form" className="network-hidden-route-form" onSubmit={saveCustomRoute}>
            <input name="kind" defaultValue="Custom" />
            <input name="status" defaultValue="online" />
            <input name="cable" defaultValue="Field route" />
            <input name="loss" defaultValue="TBD" />
          </form>
        </section>
      </main>
    </div>
  );
}

export default NetworkMap;

































