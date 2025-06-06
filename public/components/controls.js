import { dispatchControlEvent } from "../index.js";

class ControlsComponent extends HTMLElement {
  connectedCallback() {
    // Create the slider input element
    this.slider = document.createElement('input');
    this.slider.type = 'range';

    // Set attributes from the custom element or use defaults
    this.slider.min = this.getAttribute('min') || '20.0';
    this.slider.max = this.getAttribute('max') || '1280.0';
    this.slider.step = this.getAttribute('step') || '0.1';
    this.slider.value = this.getAttribute('root') || '440.0';

    // Create a span to display the current value
    this.valueDisplay = document.createElement('span');
    this.valueDisplay.textContent = parseFloat(this.slider.value).toFixed(1);
    this.heading = document.createElement('h3')
    this.heading.textContent = 'Tonekontroll'

    this.wrapper = document.createElement('div')
    this.wrapper.appendChild(this.slider);
    this.wrapper.appendChild(this.valueDisplay);

    // Append elements as children in Light DOM
    this.appendChild(this.heading);
    this.appendChild(this.wrapper);

    // Update display on input
    this.slider.addEventListener('input', () => {
      this.valueDisplay.textContent = parseFloat(this.slider.value).toFixed(1);
      dispatchControlEvent(this, { root: this.slider.value })
      this.dispatchEvent(
        new CustomEvent('control_main', {
          detail: { root: this.slider.value },
          bubbles: true,
          composed: true
        })
      )
    });
  }

  // Reflect attribute changes to the slider input
  static observedAttributes = ['min', 'max', 'step', 'root'];

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.slider && oldValue !== newValue) {
      this.slider[name] = newValue;
      if (name === 'root') {
        this.valueDisplay.textContent = parseFloat(newValue).toFixed(1);
      }
    }
  }
}


export const registerControlsComponent = () =>
{
  if (!customElements.get('x-controls'))
  customElements.define('x-controls', ControlsComponent);
}
