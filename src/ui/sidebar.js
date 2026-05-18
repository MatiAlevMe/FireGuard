/**
 * FireGuard — Sidebar UI Module
 * Handles sidebar toggle, list interactions, and map click placement.
 */
import { state, updateMetrics, saveData, showToast } from '../main.js';
import { getMap, createHelpMarker, createPersonMarker, showFireDetail, openFirePopup, openHelpPopup, openPersonPopup } from '../map/map.js';

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
    const { idx, lat, lng } = e.detail;
    const map = getMap();
    if (map) {
      map.setView([lat, lng], 12);
    }
    
    // Sort array identically to how it was rendered
    const sortedFires = [...state.fires].sort((a, b) => b.riskScore - a.riskScore);
    if (idx !== undefined && sortedFires[idx]) {
      showFireDetail(sortedFires[idx]);
    }
  });

  // Focus on help point when clicking list item
  document.addEventListener('focus-help', (e) => {
    const { lat, lng } = e.detail;
    const map = getMap();
    if (map) {
      map.setView([lat, lng], 14);
    }
  });

  // Focus on vulnerable person when clicking list item
  document.addEventListener('focus-person', (e) => {
    const { lat, lng } = e.detail;
    const map = getMap();
    if (map) {
      map.setView([lat, lng], 14);
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
        document.getElementById('modal-help')?.classList.remove('hidden');
      } else if (state.placingMarker === 'person') {
        document.getElementById('person-lat').value = e.latlng.lat;
        document.getElementById('person-lng').value = e.latlng.lng;
        showToast(`📍 Ubicación marcada: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`, 'success');
        state.placingMarker = null;
        map.getContainer().style.cursor = '';
        document.getElementById('modal-person')?.classList.remove('hidden');
      }
    });
  }

  // Event Listeners for Updates and Deletes
  document.addEventListener('update-person', (e) => {
    const { idx, status } = e.detail;
    state.people[idx].status = status;
    saveData();
    renderPeopleList();
    showToast('✅ Estado actualizado', 'success');
  });

  document.addEventListener('delete-person', (e) => {
    if(!confirm('¿Eliminar esta persona?')) return;
    const { idx } = e.detail;
    state.people.splice(idx, 1);
    saveData();
    renderPeopleList();
    showToast('🗑️ Persona eliminada', 'info');
  });

  document.addEventListener('delete-help', (e) => {
    if(!confirm('¿Eliminar este punto de ayuda?')) return;
    const { idx } = e.detail;
    state.helpPoints.splice(idx, 1);
    saveData();
    renderHelpList();
    showToast('🗑️ Punto de ayuda eliminado', 'info');
  });

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
    <div class="list-item">
      <span class="list-item-icon" style="cursor:pointer;" onclick="document.dispatchEvent(new CustomEvent('focus-help', {detail: {lat: ${hp.lat}, lng: ${hp.lng}}}))">${typeIcons[hp.type] || '🆘'}</span>
      <div class="list-item-content">
        <div class="list-item-name" style="cursor:pointer;" onclick="document.dispatchEvent(new CustomEvent('focus-help', {detail: {lat: ${hp.lat}, lng: ${hp.lng}}}))">${hp.name}</div>
        <div class="list-item-detail">${hp.address || 'Sin dirección'}</div>
      </div>
      <span class="list-item-action" style="cursor:pointer; padding: 0.5rem;" onclick="document.dispatchEvent(new CustomEvent('delete-help', {detail: {idx: ${idx}}}))">🗑️</span>
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
    <div class="list-item">
      <span class="list-item-icon" style="cursor:pointer;" onclick="document.dispatchEvent(new CustomEvent('focus-person', {detail: {lat: ${p.lat}, lng: ${p.lng}}}))">${statusIcons[p.status] || '👤'}</span>
      <div class="list-item-content">
        <div class="list-item-name" style="cursor:pointer;" onclick="document.dispatchEvent(new CustomEvent('focus-person', {detail: {lat: ${p.lat}, lng: ${p.lng}}}))">${p.name}</div>
        <div class="list-item-detail">${p.address || 'Sin dirección'}${p.age ? ` | ${p.age} años` : ''}</div>
        <select onchange="document.dispatchEvent(new CustomEvent('update-person', {detail: {idx: ${idx}, status: this.value}}))" style="margin-top: 4px; font-size: 0.8rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px;">
          <option value="sin_visitar" ${p.status === 'sin_visitar' ? 'selected' : ''}>🔴 Sin visitar</option>
          <option value="en_camino" ${p.status === 'en_camino' ? 'selected' : ''}>🟡 En camino</option>
          <option value="visitado" ${p.status === 'visitado' ? 'selected' : ''}>🟢 Visitado</option>
          <option value="necesita_ayuda" ${p.status === 'necesita_ayuda' ? 'selected' : ''}>🔴 Necesita más ayuda</option>
        </select>
      </div>
      <span class="list-item-action" style="cursor:pointer; padding: 0.5rem;" onclick="document.dispatchEvent(new CustomEvent('delete-person', {detail: {idx: ${idx}}}))">🗑️</span>
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
