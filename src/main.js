/**
 * FireGuard — Main Application Entry Point
 * Initializes map, data fetching, UI interactions, and offline support.
 */
import './style.css';
import { initMap, getMap } from './map/map.js';
import { loadFireData } from './data/firms.js';
import { initUI } from './ui/sidebar.js';
import { initModals } from './ui/modals.js';
import { initAlerts } from './ui/alerts.js';
import { registerServiceWorker } from './sw-register.js';

// --- App State ---
export const state = {
  fires: [],
  helpPoints: [],
  people: [],
  alertsSent: 0,
  alertsLog: [],
  isOnline: navigator.onLine,
  placingMarker: null, // 'help' | 'person' | null
};

// --- Initialize Application ---
async function init() {
  console.log('🔥 FireGuard initializing...');

  // 1. Init map
  initMap();

  // 2. Init UI interactions
  initUI();
  initModals();
  initAlerts();

  // 3. Load fire data
  await loadFireData();

  // 4. Register service worker for PWA
  registerServiceWorker();

  // 5. Setup online/offline detection
  setupConnectivity();

  // 6. Load saved data from localStorage
  loadSavedData();

  console.log('✅ FireGuard ready');
}

// --- Connectivity ---
function setupConnectivity() {
  const banner = document.getElementById('offline-banner');

  const updateStatus = () => {
    state.isOnline = navigator.onLine;
    if (state.isOnline) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// --- Persistence ---
function loadSavedData() {
  try {
    const savedHelp = localStorage.getItem('fireguard_help');
    const savedPeople = localStorage.getItem('fireguard_people');
    const savedLogs = localStorage.getItem('fireguard_logs');

    if (savedHelp) {
      state.helpPoints = JSON.parse(savedHelp);
    }
    if (savedPeople) {
      state.people = JSON.parse(savedPeople);
    }
    if (savedLogs) {
      state.alertsLog = JSON.parse(savedLogs);
      state.alertsSent = state.alertsLog.length;
    }
  } catch (e) {
    console.warn('Could not load saved data:', e);
  }
}

export function saveData() {
  try {
    localStorage.setItem('fireguard_help', JSON.stringify(state.helpPoints));
    localStorage.setItem('fireguard_people', JSON.stringify(state.people));
    localStorage.setItem('fireguard_logs', JSON.stringify(state.alertsLog));
  } catch (e) {
    console.warn('Could not save data:', e);
  }
}

// --- Metrics Update ---
export function updateMetrics() {
  const metricFires = document.querySelector('#metric-fires strong');
  const metricHelp = document.querySelector('#metric-help strong');
  const metricPeople = document.querySelector('#metric-people strong');
  const firesCount = document.getElementById('fires-count');
  const helpCount = document.getElementById('help-count');
  const peopleCount = document.getElementById('people-count');

  if (metricFires) metricFires.textContent = state.fires.length;
  if (metricHelp) metricHelp.textContent = state.helpPoints.length;
  if (metricPeople) metricPeople.textContent = state.people.length;
  if (firesCount) firesCount.textContent = state.fires.length;
  if (helpCount) helpCount.textContent = state.helpPoints.length;
  if (peopleCount) peopleCount.textContent = state.people.length;
}

// --- Toast Notifications ---
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
