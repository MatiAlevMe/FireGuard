/**
 * FireGuard — Weather Data Module
 * Fetches weather data from Open-Meteo API and calculates Fire Risk Score.
 * No API key required.
 */

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// Cache to avoid repeated API calls for nearby locations
const weatherCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Get current weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{temperature: number, humidity: number, windSpeed: number}>}
 */
export async function getWeatherForLocation(lat, lng) {
  // Round to 1 decimal for caching (~10km granularity)
  const cacheKey = `${lat.toFixed(1)},${lng.toFixed(1)}`;

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
      timezone: 'auto',
    });

    const response = await fetch(`${OPEN_METEO_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.status}`);
    }

    const data = await response.json();

    const weather = {
      temperature: Math.round(data.current?.temperature_2m ?? 20),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 50),
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 10),
    };

    // Cache the result
    weatherCache.set(cacheKey, { data: weather, timestamp: Date.now() });

    return weather;

  } catch (error) {
    console.warn('Weather fetch failed, using defaults:', error.message);
    return {
      temperature: 25,
      humidity: 40,
      windSpeed: 15,
    };
  }
}

/**
 * Calculate Fire Risk Score based on weather conditions
 * 
 * Formula:
 * - Temperature: higher = more risk (0-1, max at 45°C)
 * - Humidity: lower = more risk (0-1, dry = high)
 * - Wind: higher = more risk (0-1, max at 60 km/h)
 * 
 * Weights: humidity 40%, temperature 30%, wind 30%
 * (Low humidity is the strongest fire indicator)
 * 
 * @param {{temperature: number, humidity: number, windSpeed: number}} weather
 * @returns {{score: number, level: string, color: string}}
 */
export function calculateFireRiskScore(weather) {
  const tempScore = Math.min(Math.max(weather.temperature, 0) / 45, 1);
  const humidityScore = Math.max(1 - (weather.humidity / 100), 0);
  const windScore = Math.min(Math.max(weather.windSpeed, 0) / 60, 1);

  // Weighted combination
  const raw = (tempScore * 0.3) + (humidityScore * 0.4) + (windScore * 0.3);
  const score = Math.round(raw * 100);

  let level, color;
  if (score > 70) {
    level = 'CRÍTICO';
    color = '#ff4757';
  } else if (score > 50) {
    level = 'ALTO';
    color = '#ff6b35';
  } else if (score > 30) {
    level = 'MODERADO';
    color = '#ffd93d';
  } else {
    level = 'BAJO';
    color = '#4ecdc4';
  }

  return { score, level, color };
}
