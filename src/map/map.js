/**
 * FireGuard — Map Module
 * Initializes and manages the Leaflet map instance with dark tiles.
 */
import L from 'leaflet';

let map = null;
let fireLayer = null;
let helpLayer = null;
let peopleLayer = null;

// Dark map tiles
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Chile center coordinates
const CHILE_CENTER = [-33.45, -70.65]; // Santiago
const CHILE_ZOOM = 6;

export function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return null;

  map = L.map(mapContainer, {
    center: CHILE_CENTER,
    zoom: CHILE_ZOOM,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer(DARK_TILES, {
    attribution: DARK_ATTRIBUTION,
    maxZoom: 18,
    subdomains: 'abcd',
  }).addTo(map);

  // Create layer groups
  fireLayer = L.layerGroup().addTo(map);
  helpLayer = L.layerGroup().addTo(map);
  peopleLayer = L.layerGroup().addTo(map);

  // Fix map sizing issues robustly
  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
  });
  resizeObserver.observe(mapContainer);

  return map;
}

export function getMap() {
  return map;
}

export function getFireLayer() {
  return fireLayer;
}

export function getHelpLayer() {
  return helpLayer;
}

export function getPeopleLayer() {
  return peopleLayer;
}

/**
 * Create a fire marker with custom styling based on risk level
 */
export function createFireMarker(lat, lng, data) {
  const riskClass = data.riskScore > 70 ? 'critical' :
                    data.riskScore > 50 ? 'high' :
                    data.riskScore > 30 ? 'moderate' : 'low';

  const icon = L.divIcon({
    className: `fire-marker fire-marker-${riskClass}`,
    html: '🔥',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const marker = L.marker([lat, lng], { icon }).addTo(fireLayer);

  marker.bindPopup(`
    <div class="popup-fire">
      <h4>🔥 Foco de Incendio</h4>
      <p class="popup-risk" style="color: ${data.riskColor}">Riesgo: ${data.riskLevel} (${data.riskScore}%)</p>
      <p>🌡️ ${data.temperature}°C | 💧 ${data.humidity}% | 💨 ${data.windSpeed} km/h</p>
      <p>📡 ${data.satellite} | Confianza: ${data.confidence}%</p>
      <p>📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
    </div>
  `);

  // Store data on marker for detail panel
  marker._fireData = { ...data, lat, lng };

  marker.on('click', () => {
    showFireDetail(marker._fireData);
  });

  return marker;
}

/**
 * Create a help point marker
 */
export function createHelpMarker(lat, lng, data) {
  const typeIcons = {
    olla: '🍲',
    acopio: '📦',
    albergue: '🏠',
    salud: '🏥',
    agua: '💧',
  };

  const icon = L.divIcon({
    className: 'help-marker',
    html: typeIcons[data.type] || '🆘',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const marker = L.marker([lat, lng], { icon }).addTo(helpLayer);

  marker.bindPopup(`
    <div class="popup-help">
      <h4>${typeIcons[data.type] || '🆘'} ${data.name}</h4>
      <p>📍 ${data.address || 'Sin dirección'}</p>
      <p>🕐 ${data.schedule || 'Sin horario'}</p>
      ${data.contact ? `<p>📞 ${data.contact}</p>` : ''}
    </div>
  `);

  return marker;
}

/**
 * Create a vulnerable person marker
 */
export function createPersonMarker(lat, lng, data) {
  const statusColors = {
    sin_visitar: '#ff4757',
    en_camino: '#ffd93d',
    visitado: '#4ecdc4',
    necesita_ayuda: '#ff4757',
  };

  const icon = L.divIcon({
    className: 'person-marker',
    html: '👤',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const marker = L.marker([lat, lng], { icon }).addTo(peopleLayer);

  const statusLabels = {
    sin_visitar: '🔴 Sin visitar',
    en_camino: '🟡 En camino',
    visitado: '🟢 Visitado',
    necesita_ayuda: '🔴 Necesita ayuda',
  };

  marker.bindPopup(`
    <div class="popup-person">
      <h4>👤 ${data.name}</h4>
      ${data.age ? `<p>Edad: ${data.age} años</p>` : ''}
      <p>📍 ${data.address || 'Sin dirección'}</p>
      <p>Estado: ${statusLabels[data.status] || data.status}</p>
      ${data.needs ? `<p>Necesidades: ${data.needs}</p>` : ''}
      ${data.contact ? `<p>📞 Familiar: ${data.contact}</p>` : ''}
    </div>
  `);

  return marker;
}

/**
 * Show fire detail in the side panel
 */
export function showFireDetail(data) {
  const panel = document.getElementById('fire-detail');
  panel.classList.remove('hidden');

  document.getElementById('detail-title').textContent = `🔥 Foco — ${data.lat.toFixed(3)}, ${data.lng.toFixed(3)}`;
  
  const riskEl = document.getElementById('detail-risk');
  riskEl.textContent = `${data.riskLevel} (${data.riskScore}%)`;
  riskEl.style.background = data.riskColor + '25';
  riskEl.style.color = data.riskColor;

  document.getElementById('detail-temp').textContent = `${data.temperature}°C`;
  document.getElementById('detail-humidity').textContent = `${data.humidity}%`;
  document.getElementById('detail-wind').textContent = `${data.windSpeed} km/h`;
  document.getElementById('detail-confidence').textContent = `${data.confidence}%`;
  document.getElementById('detail-satellite').textContent = data.satellite;
}
