
class KeysComponent extends HTMLElement {
  #synth
  #root
  #interval_list
  #intervals

  constructor() {
    super()
    this.wasmExports = null;
  }

  connectedCallback() {
    this.loadWasm();
    this.#synth = new Tone.Synth().toDestination();
    this.#synth.volume.value = -24

    const intervals = this.getAttribute('intervals');

    if (!intervals) {
      this.innerHTML = '<p>No intervals provided.</p>';
      return;
    }

    this.addEventListener('control', (e) => {
      this.#root = e.detail.root
    })

    this.addEventListener('trigger', async (e) => {
      await Tone.start()
      this.#synth.triggerAttackRelease(parseFloat(this.#root) * e.detail.value, "8n");
    });

    this.#intervals = intervals.split(',')

    this.#root = this.getAttribute('root') || 440.0

    fetch("data/intervals.json")
      .then(response => response.json())
      .then(items => {
        if (!Array.isArray(items)) {
          this.innerHTML = '<p>Invalid JSON format.</p>';
          return;
        }
        this.#interval_list = items

        this.update()
      })
      .catch(error => {
        this.innerHTML = `<p>Error loading JSON: ${error}</p>`;
      });
  }

  update() {
    if (!this.wasmExports) {
      this.innerHTML = `<p>Loading WASM...</p>`;
      return;
    }
    const wrapper = document.createElement('div')
    wrapper.style = 'width: 300px; height: 300px; background-color: yellow;'
    this.#interval_list.filter(item => this.#intervals.includes(item.fraction)).sort((a, b) => a.value > b.value ? 1 : -1).forEach(item => {
      const button = document.createElement('button')
      button.textContent = item.fraction
      button.onclick = () => dispatchNote(wrapper, { value: item.value })
      wrapper.appendChild(button)
    })

    console.log(this.wasmExports)
    const test = document.createElement('span')
    test.textContent = this.wasmExports.add(5, 123)
    wrapper.appendChild(test)
    this.appendChild(wrapper)

  }

  async loadWasm() {
    const importObject = {}; // your imports if needed

// Using instantiateStreaming if supported:
if ('instantiateStreaming' in WebAssembly) {
  WebAssembly.instantiateStreaming(fetch('assets/math.wasm'), importObject)
    .then(({ instance }) => {
      // Use exported functions here
      this.wasmExports = instance.exports
    })
    .catch(console.error);
} else {
  // Fallback for browsers without instantiateStreaming
  fetch('assets/math.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, importObject))
    .then(({ instance }) => {
      console.log(instance.exports.add(3, 2));
    })
    .catch(console.error);
}

  }
}

function dispatchNote(elem, detail) {
  elem.dispatchEvent(
    new CustomEvent('trigger', {
      detail,
      bubbles: true,
      composed: true
    })
  )
}


export const registerKeysComponent = () =>
  customElements.define('x-keys', KeysComponent)
