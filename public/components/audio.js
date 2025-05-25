
class AudioComponent extends HTMLElement {
  connectedCallback() {
    const src = this.getAttribute('src');
    if (!src) {
      this.innerHTML = '<p>No audio source provided.</p>';
      return;
    }

    if (this.querySelector('audio')) return

    let source = document.createElement('source')
    source.type = "audio/mpeg";
    source.setAttribute('src', src);
    
    let audio = document.createElement('audio');
    audio.controls = true
    audio.textContent = "Your browser does not support the audio element."
    audio.appendChild(source);
    this.innerHTML = ''
    this.appendChild(audio)
  }
  // static get observedAttributes() {
  //   return ['src', 'alt'];
  // }

  // attributeChangedCallback() {
  //   this.update();
  // }

  // update() {
  //   const source = this.querySelector('source');
  //   if (source) {
  //     source.src = this.getAttribute('src');
  //   }
  // }
}
export const registerAudioComponent = () => {
  customElements.define('x-audio', AudioComponent);
}
