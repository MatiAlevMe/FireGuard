/**
 * FireGuard - Emergency Dashboard JavaScript
 * Handles UI interactions, modals, and dynamic functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const panelToggle = document.getElementById('panelToggle');
  const bottomPanel = document.getElementById('bottomPanel');
  const btnReportHelp = document.getElementById('btnReportHelp');
  const btnRegisterPerson = document.getElementById('btnRegisterPerson');
  const btnSendAlert = document.getElementById('btnSendAlert');
  const modalHelp = document.getElementById('modalHelp');
  const modalPerson = document.getElementById('modalPerson');
  const modalAlert = document.getElementById('modalAlert');
  const formHelp = document.getElementById('formHelp');
  const formPerson = document.getElementById('formPerson');
  const formAlert = document.getElementById('formAlert');
  const btnMarkMap = document.getElementById('btnMarkMap');

  // Mobile Menu Toggle
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('active'));
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  // Bottom Panel Toggle
  panelToggle.addEventListener('click', () => {
    bottomPanel.classList.toggle('collapsed');
    panelToggle.setAttribute('aria-expanded', !bottomPanel.classList.contains('collapsed'));
  });

  // Modal Functions
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }
  }

  // Modal Triggers
  btnReportHelp.addEventListener('click', () => openModal(modalHelp));
  btnRegisterPerson.addEventListener('click', () => openModal(modalPerson));
  btnSendAlert.addEventListener('click', () => openModal(modalAlert));

  // Close Modal Buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) closeModal(modal);
    });
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        closeModal(modal);
      });
    }
  });

  // Form Submissions
  formHelp.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(formHelp);
    const data = Object.fromEntries(formData.entries());
    
    // Get icon based on type
    const typeIcons = {
      'olla': '&#127858;',
      'acopio': '&#128230;',
      'albergue': '&#127968;',
      'medico': '&#129657;',
      'agua': '&#128167;'
    };
    
    const typeNames = {
      'olla': 'Olla Comun',
      'acopio': 'Centro de Acopio',
      'albergue': 'Albergue',
      'medico': 'Punto Medico',
      'agua': 'Distribucion de Agua'
    };

    // Create new help item
    const helpList = document.getElementById('helpList');
    const newItem = document.createElement('li');
    newItem.className = 'help-item';
    newItem.innerHTML = `
      <span class="help-icon">${typeIcons[data.helpType] || '&#128205;'}</span>
      <div class="help-info">
        <span class="help-name">${escapeHtml(data.helpName)}</span>
        <span class="help-address">${escapeHtml(data.helpAddress)}</span>
        <span class="help-hours">${data.helpHoursStart} - ${data.helpHoursEnd}</span>
      </div>
    `;
    
    // Add with animation
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateX(-20px)';
    helpList.insertBefore(newItem, helpList.firstChild);
    
    requestAnimationFrame(() => {
      newItem.style.transition = 'all 0.3s ease';
      newItem.style.opacity = '1';
      newItem.style.transform = 'translateX(0)';
    });

    // Update metric
    updateMetric('help', 1);
    
    // Close modal
    closeModal(modalHelp);
    
    // Show success notification
    showNotification('Punto de ayuda registrado exitosamente', 'success');
  });

  formPerson.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(formPerson);
    const data = Object.fromEntries(formData.entries());
    
    // Update counter
    const vulnerableCount = document.getElementById('vulnerableCount');
    const currentCount = parseInt(vulnerableCount.textContent);
    vulnerableCount.textContent = currentCount + 1;
    
    // Update metric
    updateMetric('people', 1);
    
    // Close modal
    closeModal(modalPerson);
    
    // Show success notification
    showNotification(`${data.personName} registrado/a exitosamente`, 'success');
  });

  formAlert.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(formAlert);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate sending alert
    const submitBtn = formAlert.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
          <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      Enviando...
    `;
    
    setTimeout(() => {
      // Update alerts metric
      updateMetric('alerts', 47);
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      
      // Close modal
      closeModal(modalAlert);
      
      // Show success notification
      showNotification('Alerta SMS enviada a 47 personas', 'success');
    }, 1500);
  });

  // Mark on Map Button
  btnMarkMap.addEventListener('click', () => {
    showNotification('Haga clic en el mapa para marcar la ubicacion', 'info');
    closeModal(modalPerson);
    
    // Add click listener to map
    const map = document.getElementById('map');
    map.style.cursor = 'crosshair';
    
    const mapClickHandler = (e) => {
      // Get relative position
      const rect = map.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create marker
      const marker = document.createElement('div');
      marker.className = 'map-marker';
      marker.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 24px;
        height: 24px;
        background: var(--accent-teal);
        border: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: markerPulse 0.3s ease;
      `;
      
      // Make map container relative for positioning
      map.style.position = 'relative';
      map.appendChild(marker);
      
      // Reset cursor
      map.style.cursor = 'default';
      map.removeEventListener('click', mapClickHandler);
      
      // Reopen modal
      openModal(modalPerson);
      showNotification('Ubicacion marcada en el mapa', 'success');
    };
    
    map.addEventListener('click', mapClickHandler);
  });

  // Utility Functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updateMetric(type, increment) {
    const metricCards = document.querySelectorAll('.metric-card');
    const metricMap = {
      'fire': 0,
      'people': 1,
      'help': 2,
      'alerts': 3
    };
    
    const card = metricCards[metricMap[type]];
    if (card) {
      const valueEl = card.querySelector('.metric-value');
      const trendEl = card.querySelector('.metric-trend');
      
      // Update value
      const currentValue = parseInt(valueEl.textContent);
      valueEl.textContent = currentValue + increment;
      
      // Update trend
      if (trendEl) {
        const currentTrend = parseInt(trendEl.textContent.replace(/[^0-9-]/g, '')) || 0;
        trendEl.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          +${currentTrend + increment}
        `;
        trendEl.className = 'metric-trend trend-up';
      }
      
      // Animate value change
      valueEl.style.transform = 'scale(1.2)';
      valueEl.style.color = 'var(--accent-teal)';
      setTimeout(() => {
        valueEl.style.transform = 'scale(1)';
        valueEl.style.color = '';
      }, 300);
    }
  }

  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' 
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        }
      </svg>
      <span>${message}</span>
    `;
    
    // Styles
    notification.style.cssText = `
      position: fixed;
      top: calc(var(--header-height) + 1rem);
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: ${type === 'success' ? 'rgba(78, 205, 196, 0.15)' : 'rgba(255, 217, 61, 0.15)'};
      border: 1px solid ${type === 'success' ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 217, 61, 0.3)'};
      border-radius: 12px;
      color: ${type === 'success' ? 'var(--accent-teal)' : 'var(--alert-yellow)'};
      font-size: 0.875rem;
      font-weight: 500;
      z-index: 300;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add CSS animation for marker
  const style = document.createElement('style');
  style.textContent = `
    @keyframes markerPulse {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.2);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
    
    .metric-value {
      transition: transform 0.3s ease, color 0.3s ease;
    }
  `;
  document.head.appendChild(style);

  // Simulate real-time updates (for demo purposes)
  setInterval(() => {
    // Random chance to update fire conditions
    if (Math.random() < 0.1) {
      const fireItems = document.querySelectorAll('.fire-item');
      const randomItem = fireItems[Math.floor(Math.random() * fireItems.length)];
      if (randomItem) {
        const tempEl = randomItem.querySelector('.fire-details span:first-child');
        if (tempEl) {
          const currentTemp = parseInt(tempEl.textContent.match(/\d+/)[0]);
          const newTemp = currentTemp + Math.floor(Math.random() * 3) - 1;
          tempEl.innerHTML = tempEl.innerHTML.replace(/\d+C/, `${newTemp}C`);
          
          // Flash effect
          randomItem.style.boxShadow = '0 0 15px rgba(255, 107, 53, 0.3)';
          setTimeout(() => {
            randomItem.style.boxShadow = '';
          }, 500);
        }
      }
    }
  }, 5000);
});
