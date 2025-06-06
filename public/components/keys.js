
class KeysComponent extends HTMLElement {
  #root
  #interval_list
  #intervals

  constructor() {
    super()
    this.wasmExports = null;
  }

  connectedCallback() {
    (async () => {
      const response = await fetch('synth.wasm');
      const wasmBytes = await response.arrayBuffer();

      const audioContext = new AudioContext({ sampleRate: 44100 });
      // Pass wasmBytes to AudioWorkletProcessor via node options or port message
      await audioContext.audioWorklet.addModule('synth-processor.js');

      const synthNode = new AudioWorkletNode(audioContext, 'synth-processor', {
        processorOptions: { wasmBytes }
      });

      synthNode.connect(audioContext.destination);

      this.addEventListener('trigger', async (e) => {
        // Resume AudioContext on user interaction (required by browsers)
        if (audioContext.state !== 'running') {
          await audioContext.resume();
        }
        // Send noteOn message with frequency 440 Hz and current time
        synthNode.port.postMessage({ type: 'noteOn', frequency: e.detail.value * this.#root, currentTime: audioContext.currentTime });
        setTimeout(() => synthNode.port.postMessage({ type: 'noteOff', currentTime: audioContext.currentTime }), 1000);
      });

    })();

    const intervals = this.getAttribute('intervals');

    if (!intervals) {
      this.innerHTML = '<p>No intervals provided.</p>';
      return;
    }

    this.addEventListener('control', (e) => {
      this.#root = e.detail.root
    })


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
    const wrapper = document.createElement('div')
    wrapper.style = 'width: 300px; height: 300px; background-color: yellow;'
    this.#interval_list.filter(item => this.#intervals.includes(item.fraction)).sort((a, b) => a.value > b.value ? 1 : -1).forEach(item => {
      const button = document.createElement('button')
      button.textContent = item.fraction
      button.onclick = () => dispatchNote(wrapper, { value: item.value })
      wrapper.appendChild(button)
    })

    this.appendChild(wrapper)

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


export const registerKeysComponent = () => {
  if (!customElements.get('x-keys'))
    customElements.define('x-keys', KeysComponent)
}
