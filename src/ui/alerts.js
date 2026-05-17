/**
 * FireGuard — Alerts Module
 * Handles SMS alert sending via Zavu API.
 */
import { state, showToast } from '../main.js';

const ZAVU_API_KEY = import.meta.env.VITE_ZAVU_API_KEY || '';

export function initAlerts() {
  // FAB button opens alert modal
  document.getElementById('fab-alert')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-alert');
    if (modal) modal.classList.remove('hidden');
  });

  // Alert zone button from fire detail
  document.getElementById('btn-alert-zone')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-alert');
    if (modal) modal.classList.remove('hidden');
  });

  // Alert form submit
  document.getElementById('form-alert')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('alert-phone').value;
    const message = document.getElementById('alert-message').value;
    const statusEl = document.getElementById('alert-status');

    if (!phone || !message) return;

    statusEl.classList.remove('hidden', 'success', 'error');
    statusEl.textContent = '📤 Enviando alerta...';
    statusEl.className = 'alert-status';

    try {
      if (!ZAVU_API_KEY) {
        // Demo mode — simulate sending
        await simulateAlert(phone, message);
        statusEl.textContent = '✅ Alerta enviada exitosamente (modo demo)';
        statusEl.classList.add('success');
      } else {
        await sendZavuAlert(phone, message);
        statusEl.textContent = '✅ Alerta SMS enviada exitosamente';
        statusEl.classList.add('success');
      }

      state.alertsSent++;
      showToast(`📤 Alerta enviada a ${phone}`, 'success');

      // Close modal after 2 seconds
      setTimeout(() => {
        const modal = document.getElementById('modal-alert');
        if (modal) modal.classList.add('hidden');
        statusEl.classList.add('hidden');
      }, 2000);

    } catch (error) {
      console.error('Alert send failed:', error);
      statusEl.textContent = `❌ Error: ${error.message}`;
      statusEl.classList.add('error');
      showToast('❌ Error al enviar alerta', 'error');
    }
  });
}

/**
 * Send SMS via Zavu API
 */
async function sendZavuAlert(phone, message) {
  const response = await fetch('https://api.zavu.dev/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZAVU_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: phone,
      channel: 'sms',
      content: message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zavu API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Simulate alert sending for demo purposes
 */
function simulateAlert(phone, message) {
  return new Promise((resolve) => {
    console.log(`📤 DEMO ALERT to ${phone}:`, message);
    setTimeout(resolve, 1500);
  });
}
