/**
 * FireGuard — Modals Module
 * Handles modal open/close and form submissions.
 */
import { state } from '../main.js';
import { getMap } from '../map/map.js';
import { addHelpPoint, addPerson } from './sidebar.js';

export function initModals() {
  // Open modals
  document.getElementById('btn-add-help')?.addEventListener('click', () => {
    openModal('modal-help');
  });

  document.getElementById('btn-mark-map-help')?.addEventListener('click', () => {
    closeModal('modal-help');
    state.placingMarker = 'help';
    const map = getMap();
    if (map) map.getContainer().style.cursor = 'crosshair';
  });

  document.getElementById('btn-add-person')?.addEventListener('click', () => {
    openModal('modal-person');
  });

  document.getElementById('btn-mark-map-person')?.addEventListener('click', () => {
    closeModal('modal-person');
    state.placingMarker = 'person';
    const map = getMap();
    if (map) map.getContainer().style.cursor = 'crosshair';
  });

  // Close modals — all close buttons and backdrops
  document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.dataset.modal || btn.closest('.modal')?.id;
      if (modalId) closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', () => {
      const modal = backdrop.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });

  // Form: Add help point
  document.getElementById('form-help')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const lat = parseFloat(document.getElementById('help-lat').value);
    const lng = parseFloat(document.getElementById('help-lng').value);

    if (!lat || !lng) {
      alert('📍 Por favor, haz clic en el mapa para marcar la ubicación del punto de ayuda.');
      return;
    }

    const data = {
      name: document.getElementById('help-name').value,
      type: document.getElementById('help-type').value,
      address: document.getElementById('help-address').value,
      schedule: document.getElementById('help-schedule').value,
      contact: document.getElementById('help-contact').value,
      lat,
      lng,
      createdAt: new Date().toISOString(),
    };

    addHelpPoint(data);
    closeModal('modal-help');
    e.target.reset();
    document.getElementById('help-lat').value = '';
    document.getElementById('help-lng').value = '';
  });

  // Form: Add vulnerable person
  document.getElementById('form-person')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const lat = parseFloat(document.getElementById('person-lat').value);
    const lng = parseFloat(document.getElementById('person-lng').value);

    if (!lat || !lng) {
      alert('📍 Por favor, haz clic en el mapa para marcar la ubicación de la persona.');
      return;
    }

    const data = {
      name: document.getElementById('person-name').value,
      age: document.getElementById('person-age').value,
      address: document.getElementById('person-address').value,
      needs: document.getElementById('person-needs').value,
      contact: document.getElementById('person-contact').value,
      status: document.getElementById('person-status').value,
      lat,
      lng,
      createdAt: new Date().toISOString(),
    };

    addPerson(data);
    closeModal('modal-person');
    e.target.reset();
    document.getElementById('person-lat').value = '';
    document.getElementById('person-lng').value = '';
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
  state.placingMarker = null;
  const map = getMap();
  if (map) map.getContainer().style.cursor = '';
}
