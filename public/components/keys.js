
class KeysComponent extends HTMLElement {
  #synth
  #root
  #interval_list
  #intervals
  connectedCallback() {
    this.#synth = new Tone.Synth().toDestination();
    this.#synth.volume.value = -24

    const src = this.getAttribute('src');
    const intervals = this.getAttribute('intervals');
    
    if (!src) {
      this.innerHTML = '<p>No JSON source provided.</p>';
      return;
    }
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

    fetch(src)
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
        this.#interval_list.filter(item => this.#intervals.includes(item.fraction)).sort((a,b) => a.value > b.value).forEach(item => {
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


export const registerKeysComponent = () =>
  customElements.define('x-keys', KeysComponent)
