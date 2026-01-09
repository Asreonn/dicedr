/**
 * Utility class for declarative DOM element creation
 * Reduces boilerplate and improves readability
 */
export class DOMBuilder {
  /**
   * Create an element with properties and children
   * @param {string} tag - HTML tag name
   * @param {Object} props - Element properties and attributes
   * @param {Array<Node|string>} children - Child nodes or text
   * @returns {HTMLElement}
   */
  static create(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    // Set properties
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {Object} options - Button configuration
   * @returns {HTMLButtonElement}
   */
  static button(text, { className = '', onClick, ...props } = {}) {
    return DOMBuilder.create(
      'button',
      {
        className,
        type: 'button',
        onClick,
        ...props,
      },
      [text]
    );
  }

  /**
   * Create an input element
   * @param {string} type - Input type
   * @param {Object} options - Input configuration
   * @returns {HTMLInputElement}
   */
  static input(type, { value = '', onInput, ...props } = {}) {
    return DOMBuilder.create('input', {
      type,
      value,
      onInput,
      ...props,
    });
  }

  /**
   * Create a text input with label
   * @param {string} labelText - Label text
   * @param {Object} inputProps - Input properties
   * @returns {HTMLLabelElement}
   */
  static labeledInput(labelText, inputProps = {}) {
    const input = DOMBuilder.input('text', inputProps);
    return DOMBuilder.create('label', {}, [labelText, input]);
  }

  /**
   * Create a section with title
   * @param {string} title - Section title
   * @param {Array<Node>} children - Section content
   * @returns {HTMLElement}
   */
  static section(title, children = []) {
    const titleEl = DOMBuilder.create('div', { className: 'section-title' }, [title]);
    return DOMBuilder.create('section', { className: 'section' }, [titleEl, ...children]);
  }

  /**
   * Create a textarea element
   * @param {Object} options - Textarea configuration
   * @returns {HTMLTextAreaElement}
   */
  static textarea({ value = '', placeholder = '', onInput, ...props } = {}) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.placeholder = placeholder;

    Object.entries(props).forEach(([key, val]) => {
      if (key === 'className') {
        textarea.className = val;
      } else {
        textarea.setAttribute(key, val);
      }
    });

    if (onInput) {
      textarea.addEventListener('input', onInput);
    }

    return textarea;
  }

  /**
   * Clear and replace container content
   * @param {HTMLElement} container - Target container
   * @param {Array<Node>} children - New children
   */
  static replaceContent(container, children) {
    container.innerHTML = '';
    children.forEach((child) => container.appendChild(child));
  }
}
