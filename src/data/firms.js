/**
 * FireGuard — NASA FIRMS Data Module
 * Fetches active fire hotspots from NASA FIRMS API and enriches with weather data.
 */
import { state, updateMetrics, showToast } from '../main.js';
import { createFireMarker, getFireLayer } from '../map/map.js';
import { getWeatherForLocation, calculateFireRiskScore } from './weather.js';

// FIRMS API Configuration
const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';
const MAP_KEY = import.meta.env.VITE_FIRMS_MAP_KEY || '';

// Chile bounding box (approximate)
const CHILE_BBOX = {
  west: -76.0,
  south: -56.0,
  east: -66.0,
  north: -17.5,
};

/**
 * Fetch active fire data from NASA FIRMS
 * Uses VIIRS_SNPP sensor, last 24 hours, Chile region
 */
export async function loadFireData() {
  if (!MAP_KEY) {
    console.warn('⚠️ FIRMS MAP_KEY not set. Using demo data.');
    loadDemoData();
    return;
  }

  try {
    showToast('📡 Cargando datos satelitales...', 'info');

    // FIRMS API: area/csv/{MAP_KEY}/{source}/{area}/{days}
    // source: VIIRS_SNPP for best resolution
    const area = `${CHILE_BBOX.west},${CHILE_BBOX.south},${CHILE_BBOX.east},${CHILE_BBOX.north}`;
    const url = `${FIRMS_BASE_URL}/${MAP_KEY}/VIIRS_SNPP/${area}/1`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FIRMS API error: ${response.status}`);
    }

    const csvText = await response.text();
    const fires = parseCSV(csvText);

    if (fires.length === 0) {
      showToast('ℹ️ No hay focos activos en Chile (últimas 24h)', 'info');
      // Load with broader search or demo data
      await loadBroaderSearch();
      return;
    }

    await processFireData(fires);
    showToast(`🔥 ${fires.length} focos activos detectados`, 'success');

  } catch (error) {
    console.error('Error loading FIRMS data:', error);
    showToast('⚠️ Error cargando datos. Usando datos de demostración.', 'error');
    loadDemoData();
  }
}

/**
 * Try broader search with MODIS or more days
 */
async function loadBroaderSearch() {
  try {
    // Try with 2 days and MODIS
    const area = `${CHILE_BBOX.west},${CHILE_BBOX.south},${CHILE_BBOX.east},${CHILE_BBOX.north}`;
    const url = `${FIRMS_BASE_URL}/${MAP_KEY}/MODIS_NRT/${area}/2`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Broader search failed');

    const csvText = await response.text();
    const fires = parseCSV(csvText);

    if (fires.length > 0) {
      await processFireData(fires);
      showToast(`🔥 ${fires.length} focos detectados (últimas 48h)`, 'success');
    } else {
      // Try South America
      await loadSouthAmericaData();
    }
  } catch (e) {
    loadDemoData();
  }
}

/**
 * Fallback: Load South America data
 */
async function loadSouthAmericaData() {
  try {
    const area = '-82,-56,-34,-12'; // South America bbox
    const url = `${FIRMS_BASE_URL}/${MAP_KEY}/VIIRS_SNPP/${area}/1`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('SA search failed');

    const csvText = await response.text();
    const fires = parseCSV(csvText);

    // Take first 50 to not overload
    const limited = fires.slice(0, 50);

    if (limited.length > 0) {
      await processFireData(limited);
      showToast(`🔥 ${limited.length} focos en Sudamérica`, 'success');
    } else {
      loadDemoData();
    }
  } catch (e) {
    loadDemoData();
  }
}

/**
 * Parse FIRMS CSV response into objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const fires = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < headers.length) continue;

    const fire = {};
    headers.forEach((header, idx) => {
      fire[header.trim()] = values[idx]?.trim();
    });

    // Only include if we have coordinates
    if (fire.latitude && fire.longitude) {
      fires.push({
        lat: parseFloat(fire.latitude),
        lng: parseFloat(fire.longitude),
        brightness: parseFloat(fire.bright_ti4 || fire.brightness || 0),
        confidence: fire.confidence || 'nominal',
        satellite: fire.satellite || 'VIIRS',
        acqDate: fire.acq_date || '',
        acqTime: fire.acq_time || '',
        frp: parseFloat(fire.frp || 0),
      });
    }
  }

  return fires;
}

/**
 * Process fire data: enrich with weather and add to map
 */
async function processFireData(fires) {
  // Clear existing fire markers
  getFireLayer().clearLayers();
  state.fires = [];

  // Get unique locations for weather (batch by rounding coordinates)
  const weatherCache = {};

  for (const fire of fires) {
    // Round to 1 decimal for weather caching (same weather in ~10km area)
    const weatherKey = `${fire.lat.toFixed(1)},${fire.lng.toFixed(1)}`;

    let weather;
    if (weatherCache[weatherKey]) {
      weather = weatherCache[weatherKey];
    } else {
      weather = await getWeatherForLocation(fire.lat, fire.lng);
      weatherCache[weatherKey] = weather;
    }

    const risk = calculateFireRiskScore(weather);

    const fireData = {
      ...fire,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      riskScore: risk.score,
      riskLevel: risk.level,
      riskColor: risk.color,
      confidence: normalizeConfidence(fire.confidence),
    };

    state.fires.push(fireData);
    createFireMarker(fire.lat, fire.lng, fireData);
  }

  updateMetrics();
  updateFiresList();
}

/**
 * Normalize confidence value to percentage
 */
function normalizeConfidence(conf) {
  if (typeof conf === 'number') return conf;
  const map = { high: 90, nominal: 70, low: 40 };
  return map[conf?.toLowerCase()] || 70;
}

/**
 * Update the fires list in the sidebar
 */
function updateFiresList() {
  const list = document.getElementById('fires-list');
  
  if (state.fires.length === 0) {
    list.innerHTML = '<p class="list-empty">No hay focos activos</p>';
    return;
  }

  // Sort by risk score descending
  const sorted = [...state.fires].sort((a, b) => b.riskScore - a.riskScore);

  list.innerHTML = sorted.slice(0, 20).map((fire, idx) => `
    <div class="list-item" data-fire-idx="${idx}" onclick="document.dispatchEvent(new CustomEvent('focus-fire', {detail: {lat: ${fire.lat}, lng: ${fire.lng}}}))">
      <span class="list-item-icon">🔥</span>
      <div class="list-item-content">
        <div class="list-item-name">${fire.lat.toFixed(3)}, ${fire.lng.toFixed(3)}</div>
        <div class="list-item-detail">${fire.temperature}°C | ${fire.windSpeed} km/h | ${fire.satellite}</div>
      </div>
      <span class="list-item-badge">
        <span class="badge" style="background: ${fire.riskColor}25; color: ${fire.riskColor}">${fire.riskLevel}</span>
      </span>
    </div>
  `).join('');
}

/**
 * Demo data for when API is unavailable
 */
function loadDemoData() {
  const demoFires = [
    { lat: -33.45, lng: -70.65, brightness: 320, confidence: 'high', satellite: 'DEMO', frp: 15 },
    { lat: -33.52, lng: -70.78, brightness: 310, confidence: 'nominal', satellite: 'DEMO', frp: 12 },
    { lat: -36.82, lng: -73.05, brightness: 350, confidence: 'high', satellite: 'DEMO', frp: 25 },
    { lat: -37.47, lng: -72.35, brightness: 340, confidence: 'nominal', satellite: 'DEMO', frp: 18 },
    { lat: -38.74, lng: -72.60, brightness: 300, confidence: 'low', satellite: 'DEMO', frp: 8 },
    { lat: -34.17, lng: -70.74, brightness: 315, confidence: 'nominal', satellite: 'DEMO', frp: 14 },
  ];

  processFireData(demoFires);
  showToast('ℹ️ Usando datos de demostración', 'info');
}
