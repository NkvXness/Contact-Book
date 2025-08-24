export class BaseComponent {
  constructor(element = null) {
    this.element = element;
    this.eventListeners = new Map();
  }

  $(selector, context = document) {
    return context.querySelector(selector);
  }

  $$(selector, context = document) {
    return context.querySelectorAll(selector);
  }

  createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content !== null) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (content instanceof Element) {
        element.appendChild(content);
      } else if (Array.isArray(content)) {
        content.forEach(child => {
          if (child instanceof Element) {
            element.appendChild(child);
          }
        });
      }
    }

    return element;
  }

  addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    const key = `${element.constructor.name}-${event}-${handler.name || 'anonymous'}`;
    this.eventListeners.set(key, { element, event, handler, options });
  }

  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
    
    const key = `${element.constructor.name}-${event}-${handler.name || 'anonymous'}`;
    this.eventListeners.delete(key);
  }

  addClass(element, className) {
    element?.classList.add(className);
  }

  removeClass(element, className) {
    element?.classList.remove(className);
  }

  toggleClass(element, className) {
    return element?.classList.toggle(className);
  }

  hasClass(element, className) {
    return element?.classList.contains(className) || false;
  }

  show(element) {
    if (element) {
      element.style.display = '';
    }
  }

  hide(element) {
    if (element) {
      element.style.display = 'none';
    }
  }

  setHTML(element, html) {
    if (element) {
      element.innerHTML = html;
    }
  }

  setText(element, text) {
    if (element) {
      element.textContent = text;
    }
  }

  getValue(element) {
    return element?.value || '';
  }

  setValue(element, value) {
    if (element) {
      element.value = value;
    }
  }

  emit(eventName, detail = null, target = document) {
    const event = new CustomEvent(eventName, { detail });
    target.dispatchEvent(event);
  }

  on(eventName, handler, target = document) {
    this.addEventListener(target, eventName, handler);
  }

  off(eventName, handler, target = document) {
    this.removeEventListener(target, eventName, handler);
  }

  destroy() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();
    this.element = null;
  }
}