export class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = new Map();
    this.idCounter = 0;
  }

  show(message, type = 'info', options = {}) {
    const id = ++this.idCounter;
    const duration = options.duration || (type === 'error' ? 6000 : 4000);
    const title = options.title || this.getDefaultTitle(type);
    const closable = options.closable !== false;

    const toast = this.createToast(id, title, message, type, closable);
    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Animasyon için kısa gecikme
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Progress bar animasyonu
    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar && duration > 0) {
      progressBar.style.width = '100%';
      progressBar.style.transitionDuration = `${duration}ms`;
      
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }

    // Otomatik kapat
    if (duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    return id;
  }

  createToast(id, title, message, type, closable) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.id = id;

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon"></div>
        <div class="toast-text">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
      </div>
      ${closable ? '<button class="toast-close">×</button>' : ''}
      <div class="toast-progress"></div>
    `;

    // Close button event
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        this.hide(id);
      });
    }

    // Click to close (opsiyonel)
    toast.addEventListener('click', () => {
      if (closable) {
        this.hide(id);
      }
    });

    return toast;
  }

  hide(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    toast.classList.remove('show');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 400); // CSS transition süresi
  }

  hideAll() {
    this.toasts.forEach((toast, id) => {
      this.hide(id);
    });
  }

  getDefaultTitle(type) {
    const titles = {
      success: 'Başarılı',
      error: 'Hata',
      warning: 'Uyarı',
      info: 'Bilgi'
    };
    return titles[type] || 'Bildirim';
  }

  // Kısa yollar
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }
}

// Global toast instance
export const toast = new Toast();