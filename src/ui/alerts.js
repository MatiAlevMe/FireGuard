/**
 * FireGuard — Alerts Module
 * Handles SMS alert sending via Zavu API.
 */
import { state, showToast } from '../main.js';

const ZAVU_API_KEY = (import.meta.env.VITE_ZAVU_API_KEY || '').replace(/['"]/g, '').trim();

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

      const logEntry = {
        date: new Date().toLocaleString(),
        phone,
        message,
        status: !ZAVU_API_KEY ? 'Demo/Sandbox' : 'Enviado'
      };
      state.alertsLog.push(logEntry);
      state.alertsSent = state.alertsLog.length;
      
      const { saveData } = await import('../main.js');
      saveData();
      renderLogs();

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

  document.getElementById('btn-view-logs')?.addEventListener('click', () => {
    renderLogs();
    const modal = document.getElementById('modal-logs');
    if (modal) modal.classList.remove('hidden');
  });
}

function renderLogs() {
  const list = document.getElementById('logs-list');
  const countEl = document.getElementById('metric-logs-count');
  if (countEl) countEl.textContent = state.alertsLog.length;

  if (state.alertsLog.length === 0) {
    if (list) list.innerHTML = '<p class="list-empty">No hay alertas enviadas</p>';
    return;
  }

  if (list) {
    list.innerHTML = state.alertsLog.slice().reverse().map(log => `
      <div class="list-item" style="display:flex; flex-direction:column; align-items:flex-start; padding: 1rem; gap: 0.5rem; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 0.5rem;">
        <div style="font-size: 0.8rem; color: var(--text-muted);">${log.date} — <span style="color:var(--accent-teal)">${log.status}</span></div>
        <div style="font-weight: bold;">📞 ${log.phone}</div>
        <div style="font-size: 0.9rem; font-style: italic;">"${log.message}"</div>
      </div>
    `).join('');
  }
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
      channel: 'whatsapp',
      content: {
        type: 'text',
        text: message,
      },
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
