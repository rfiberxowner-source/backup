const INSTALLATION_STORAGE_KEY = "rfiber:installation-map-requests-v2";

export const magdalenaCenter = { lat: 14.2024, lng: 121.42865 };

export const magdalenaBounds = {
  north: 14.235,
  south: 14.158,
  west: 121.385,
  east: 121.485,
};

export const magdalenaNodes = [];

export const magdalenaPoles = [];

export const demoSubscribers = [];

export const magdalenaSegments = [];

export const statusLabels = {
  online: "Online",
  watch: "Watch",
  maintenance: "Maintenance",
  planned: "Planned",
  pending: "Pending install",
  active: "Active request",
  completed: "Completed",
  company: "Company office",
};

export const findNode = (nodeId) => magdalenaNodes.find((node) => node.id === nodeId);

export const segmentPath = (segment) => segment.path || [findNode(segment.from), findNode(segment.to)].filter(Boolean).map((node) => ({ lat: node.lat, lng: node.lng }));

export const hasValidCoordinates = (item = {}) => (
  item.lat !== undefined && item.lng !== undefined &&
  item.lat !== null && item.lng !== null &&
  item.lat !== "" && item.lng !== "" &&
  !Number.isNaN(Number(item.lat)) && !Number.isNaN(Number(item.lng))
);

export const normalizeCoordinateItem = (item = {}) => ({
  ...item,
  lat: item.lat ?? item.location_lat,
  lng: item.lng ?? item.location_lng,
});

export const getStoredInstallationRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(INSTALLATION_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveStoredInstallationRequests = (requests) => {
  localStorage.setItem(INSTALLATION_STORAGE_KEY, JSON.stringify(requests.slice(0, 200)));
  window.dispatchEvent(new CustomEvent("rfiber:installation-map-updated"));
};

export const saveStoredInstallationRequest = (request) => {
  const requests = getStoredInstallationRequests();
  const nextRequest = {
    ...request,
    id: request.id || `install-${Date.now()}`,
    created_at: request.created_at || new Date().toISOString(),
    source: "installation-request",
    status: request.status || "pending",
  };
  saveStoredInstallationRequests([nextRequest, ...requests]);
  return nextRequest;
};

export const googleMapsUrl = (item = {}) => {
  const normalized = normalizeCoordinateItem(item);
  if (hasValidCoordinates(normalized)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${normalized.lat},${normalized.lng}`)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalized.address || "Magdalena, Laguna")}`;
};




