/**
 * FireGuard — Sidebar UI Module
 * Handles sidebar toggle, list interactions, and map click placement.
 */
import { state, updateMetrics, saveData, showToast } from '../main.js';
import { getMap, createHelpMarker, createPersonMarker } from '../map/map.js';

export function initUI() {
  // Sidebar toggle (mobile)
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');

  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close detail panel
  document.getElementById('close-detail')?.addEventListener('click', () => {
    document.getElementById('fire-detail')?.classList.add('hidden');
  });

  // Focus on fire when clicking list item
  document.addEventListener('focus-fire', (e) => {
    const { lat, lng } = e.detail;
    const map = getMap();
    if (map) {
      map.setView([lat, lng], 12);
    }
  });

  // Map click handler for placing markers
  const map = getMap();
  if (map) {
    map.on('click', (e) => {
      if (state.placingMarker === 'help') {
        document.getElementById('help-lat').value = e.latlng.lat;
        document.getElementById('help-lng').value = e.latlng.lng;
        showToast(`📍 Ubicación marcada: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`, 'success');
        state.placingMarker = null;
        map.getContainer().style.cursor = '';
      } else if (state.placingMarker === 'person') {
        document.getElementById('person-lat').value = e.latlng.lat;
        document.getElementById('person-lng').value = e.latlng.lng;
        showToast(`📍 Ubicación marcada: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`, 'success');
        state.placingMarker = null;
        map.getContainer().style.cursor = '';
      }
    });
  }

  // Render any pre-loaded data
  renderHelpList();
  renderPeopleList();
}

/**
 * Render help points list in sidebar
 */
export function renderHelpList() {
  const list = document.getElementById('help-list');

  if (state.helpPoints.length === 0) {
    list.innerHTML = '<p class="list-empty">Sin puntos registrados</p>';
    return;
  }

  const typeIcons = {
    olla: '🍲',
    acopio: '📦',
    albergue: '🏠',
    salud: '🏥',
    agua: '💧',
  };

  list.innerHTML = state.helpPoints.map((hp, idx) => `
    <div class="list-item" onclick="document.dispatchEvent(new CustomEvent('focus-fire', {detail: {lat: ${hp.lat}, lng: ${hp.lng}}}))">
      <span class="list-item-icon">${typeIcons[hp.type] || '🆘'}</span>
      <div class="list-item-content">
        <div class="list-item-name">${hp.name}</div>
        <div class="list-item-detail">${hp.address || 'Sin dirección'}</div>
      </div>
    </div>
  `).join('');

  updateMetrics();
}

/**
 * Render vulnerable people list in sidebar
 */
export function renderPeopleList() {
  const list = document.getElementById('people-list');

  if (state.people.length === 0) {
    list.innerHTML = '<p class="list-empty">Sin personas registradas</p>';
    return;
  }

  const statusIcons = {
    sin_visitar: '🔴',
    en_camino: '🟡',
    visitado: '🟢',
    necesita_ayuda: '🔴',
  };

  list.innerHTML = state.people.map((p, idx) => `
    <div class="list-item" onclick="document.dispatchEvent(new CustomEvent('focus-fire', {detail: {lat: ${p.lat}, lng: ${p.lng}}}))">
      <span class="list-item-icon">${statusIcons[p.status] || '👤'}</span>
      <div class="list-item-content">
        <div class="list-item-name">${p.name}</div>
        <div class="list-item-detail">${p.address || 'Sin dirección'}${p.age ? ` | ${p.age} años` : ''}</div>
      </div>
    </div>
  `).join('');

  updateMetrics();
}

/**
 * Add a help point to the state and map
 */
export function addHelpPoint(data) {
  state.helpPoints.push(data);
  createHelpMarker(data.lat, data.lng, data);
  renderHelpList();
  saveData();
  showToast(`✅ Punto de ayuda "${data.name}" registrado`, 'success');
}

/**
 * Add a vulnerable person to the state and map
 */
export function addPerson(data) {
  state.people.push(data);
  createPersonMarker(data.lat, data.lng, data);
  renderPeopleList();
  saveData();
  showToast(`✅ Persona "${data.name}" registrada`, 'success');
}
