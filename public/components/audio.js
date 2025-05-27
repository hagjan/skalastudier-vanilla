
class AudioComponent extends HTMLElement {
  connectedCallback() {
    const title = document.createElement('h3')
    title.textContent = "Lydopptak"

    const src = this.getAttribute('src');
    if (!src) {
      this.innerHTML = '<p>No audio source provided.</p>';
      return;
    }

    if (this.querySelector('audio')) return

    let source = document.createElement('source')
    source.type = "audio/mpeg";
    source.setAttribute('src', 'assets/audio/' + src);
    
    let audio = document.createElement('audio');
    audio.controls = true
    audio.textContent = "Your browser does not support the audio element."
    audio.appendChild(source);
    this.innerHTML = ''
    this.appendChild(title)
    this.appendChild(audio)
  }
}
export const registerAudioComponent = () => {
  customElements.define('x-audio', AudioComponent);
}
