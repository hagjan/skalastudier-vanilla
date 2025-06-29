const charmap = {
  'q': 0,
  'w': 1,
  'e': 2,
  'r': 3,
  't': 4,
  'y': 5,
  'u': 6,
  'i': 7,
  'a': 8,
  's': 9,
  'd': 10,
  'f': 11,
  'g': 12,
  'h': 13,
  'j': 14,
  'k': 15,
  'z': 16,
  'x': 17,
  'c': 18,
  'v': 19,
  'b': 20,
  'n': 21,
  'm': 22,
}
class KeysComponent extends HTMLElement {

  constructor() {
    super()
    this.wasmExports = null;
    this.hold = false
    this.playingNotes = new Set()
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

      document.addEventListener('keydown', async (e) => {
        if (this.playingNotes.has(e.key)) return
        this.playingNotes.add(e.key)
        const interval = this.interval_list[charmap[e.key]]
        if (!interval) return
        // Resume AudioContext on user interaction (required by browsers)
        if (audioContext.state !== 'running') {
          await audioContext.resume();
        }
        synthNode.port.postMessage({ type: 'noteOn', frequency: interval.value * this.root });

      })

      this.addEventListener('waveform', e => {
        this.waveform = e.detail.value
        synthNode.port.postMessage({ type: 'waveform', waveform: e.detail.value })
      })

      document.addEventListener('keyup', async (e) => {
        if (this.hold) return
        this.playingNotes.delete(e.key)
        const interval = this.interval_list[charmap[e.key]]
        if (!interval) return
        // Resume AudioContext on user interaction (required by browsers)
        if (audioContext.state !== 'running') {
          await audioContext.resume();
        }
        synthNode.port.postMessage({ type: 'noteOff', frequency: interval.value * this.root });

      })

      this.addEventListener('trigger', async (e) => {
        // Resume AudioContext on user interaction (required by browsers)
        if (audioContext.state !== 'running') {
          await audioContext.resume();
        }
        if (e.detail.value === null) {
          synthNode.port.postMessage({ type: 'allOff' });

        } else {
          // Send noteOn message with frequency 440 Hz and current time
          synthNode.port.postMessage({ type: 'noteOn', frequency: e.detail.value * this.root });
          if (!this.hold) setTimeout(() => synthNode.port.postMessage({ type: 'noteOff', frequency: e.detail.value * this.root }), 300);
          // synthNode.port.postMessage({ type: 'noteOff', frequency: e.detail.value * this.root })
        }
      });

    })();

    const intervals = this.getAttribute('intervals');

    if (!intervals) {
      this.innerHTML = '<p>No intervals provided.</p>';
      return;
    }

    this.addEventListener('control', (e) => {
      this.root = e.detail.root
    })


    this.intervals = intervals.split(',')

    this.root = this.getAttribute('root') || 440.0

    fetch("data/intervals.json")
      .then(response => response.json())
      .then(items => {
        if (!Array.isArray(items)) {
          this.innerHTML = '<p>Invalid JSON format.</p>';
          return;
        }
        this.interval_list = items.filter(item => this.intervals.includes(item.fraction)).sort((a, b) => a.value > b.value ? 1 : -1)

        this.update()
      })
      .catch(error => {
        this.innerHTML = `<p>Error loading JSON: ${error}</p>`;
      });
  }

  update() {
    const wrapper = document.createElement('div')
    wrapper.className = "keys";
    this.interval_list.forEach(item => {
      const button = document.createElement('button')
      button.textContent = item.fraction
      button.onclick = () => dispatchNote(wrapper, { value: item.value })
      wrapper.appendChild(button)
    })

    this.appendChild(wrapper)
    const button = document.createElement('button')
    button.textContent = "Stop all"
    button.onclick = () => {
      this.playingNotes = new Set()
      dispatchNote(wrapper, { value: null })
    };
    this.appendChild(button)
    const button2 = document.createElement('button')
    const button3 = document.createElement('button')
    button2.textContent = "Trigger mode"
    button2.disabled = true
    button2.onclick = () => {
      this.hold = false
      this.playingNotes = new Set()
      button3.disabled = false
      button2.disabled = true
    }
    button3.textContent = "Hold mode"
    button3.onclick = () => {
      this.hold = true
      button2.disabled = false
      button3.disabled = true
    }
    this.appendChild(button2);
    this.appendChild(button3);


    const waveformSelect = document.createElement("div");
    waveformSelect.className = "waveform";
    ["sine", "triangle", "square"].forEach((waveform, index) => {
      const inputWrapper = document.createElement("div");
      const input = document.createElement('input')
      const label = document.createElement('label')
      label.textContent = waveform
      label.htmlFor = waveform
      input.id = waveform
      input.defaultChecked = index == 0
      input.type = "radio"
      input.name = "waveform"
      input.onclick = () => {
        wrapper.dispatchEvent(new CustomEvent('waveform', {
          detail: { value: index },
          bubbles: true,
          composed: true,
        }))
      }
      inputWrapper.appendChild(input)
      inputWrapper.appendChild(label)
      waveformSelect.appendChild(inputWrapper)
    })

    this.appendChild(waveformSelect);
    this.focus()
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
