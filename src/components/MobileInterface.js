import { BaseComponent } from './BaseComponent.js';

export class MobileInterface extends BaseComponent {
  constructor() {
    super();
    this.isMobile = this.detectMobile();
    this.orientation = this.getOrientation();
    this.init();
  }

  init() {
    if (this.isMobile) {
      this.setupMobileOptimizations();
      this.setupOrientationChange();
      this.setupTouchOptimizations();
      this.setupKeyboardHandling();
    }
    
    this.setupResponsiveImages();
    this.setupAccessibility();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  setupMobileOptimizations() {
    document.body.classList.add('mobile-device');
    
    // Disable pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'contain';
    
    // Prevent text selection on UI elements
    const uiElements = document.querySelectorAll('button, .header, .accordion__header');
    uiElements.forEach(el => {
      el.style.userSelect = 'none';
      el.style.webkitUserSelect = 'none';
    });

    // Add mobile-specific classes
    this.updateMobileClasses();
  }

  setupOrientationChange() {
    const handleOrientationChange = () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        document.body.classList.toggle('portrait', this.orientation === 'portrait');
        document.body.classList.toggle('landscape', this.orientation === 'landscape');
        
        this.emit('orientationChanged', { 
          orientation: this.orientation,
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 100); // Small delay to ensure dimensions are updated
    };

    this.addEventListener(window, 'orientationchange', handleOrientationChange);
    this.addEventListener(window, 'resize', handleOrientationChange);
    
    // Initial setup
    handleOrientationChange();
  }

  setupTouchOptimizations() {
    // Improve touch scrolling
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Add touch feedback to interactive elements
    const interactiveElements = document.querySelectorAll('button, [role="button"], .contact-item');
    
    interactiveElements.forEach(element => {
      this.addEventListener(element, 'touchstart', () => {
        element.classList.add('touch-active');
      });
      
      this.addEventListener(element, 'touchend', () => {
        setTimeout(() => element.classList.remove('touch-active'), 150);
      });
      
      this.addEventListener(element, 'touchcancel', () => {
        element.classList.remove('touch-active');
      });
    });
  }

  setupKeyboardHandling() {
    let initialViewportHeight = window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      if (heightDifference > 150) {
        // Keyboard is likely open
        document.body.classList.add('keyboard-open');
        this.emit('keyboardOpen', { heightDifference });
      } else {
        // Keyboard is likely closed
        document.body.classList.remove('keyboard-open');
        this.emit('keyboardClose');
      }
    };

    this.addEventListener(window, 'resize', handleViewportChange);
    
    // Handle input focus for better keyboard experience
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      this.addEventListener(input, 'focus', (e) => {
        setTimeout(() => {
          if (document.activeElement === e.target) {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      });
    });
  }

  setupResponsiveImages() {
    // Future: Add responsive image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
    });
  }

  setupAccessibility() {
    // Improve accessibility for mobile screens
    this.setupFocusManagement();
    this.setupAnnouncements();
  }

  setupFocusManagement() {
    let lastFocusedElement = null;
    
    // Track focus for modal management
    this.addEventListener(document, 'focusin', (e) => {
      lastFocusedElement = e.target;
    });

    // Handle modal focus trapping
    this.on('modalOpen', (e) => {
      const modal = e.detail.modal;
      this.trapFocus(modal);
    });

    this.on('modalClose', () => {
      if (lastFocusedElement && document.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
      }
    });
  }

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.addEventListener(container, 'keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
    
    firstElement.focus();
  }

  setupAnnouncements() {
    // Create live region for screen reader announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-announcements';
    document.body.appendChild(liveRegion);

    // Listen for announcement requests
    this.on('announce', (e) => {
      this.announce(e.detail.message);
    });
  }

  announce(message) {
    const liveRegion = document.getElementById('live-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  updateMobileClasses() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    document.body.classList.remove('mobile-small', 'mobile-medium', 'mobile-large');
    
    if (width <= 480) {
      document.body.classList.add('mobile-small');
    } else if (width <= 768) {
      document.body.classList.add('mobile-medium');
    } else {
      document.body.classList.add('mobile-large');
    }
    
    // Update orientation classes
    document.body.classList.toggle('portrait', this.orientation === 'portrait');
    document.body.classList.toggle('landscape', this.orientation === 'landscape');
  }

  // Utility methods
  vibrate(pattern = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  isKeyboardOpen() {
    return document.body.classList.contains('keyboard-open');
  }

  getViewportHeight() {
    return window.innerHeight;
  }

  getViewportWidth() {
    return window.innerWidth;
  }

  getCurrentOrientation() {
    return this.orientation;
  }

  // Static utility methods
  static isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  static getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
  }

  static isRetinaDisplay() {
    return window.devicePixelRatio > 1;
  }
}