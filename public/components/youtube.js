class YouTubeComponent extends HTMLElement {
  connectedCallback() {
    console.log('asda')
    const id = this.getAttribute('id')

    if (!id) {
      this.innerHTML = `<p>No youtube reference provided.</p>`
      return;
    }
    if (this.querySelector('iframe')) return

    const wrapper = document.createElement('div')
    wrapper.style = "display: flex; width: 100%; justify-content: center;"
    const iframe = document.createElement('iframe')
    iframe.width = '711px'
    iframe.height= '400px'
    iframe.src = `https://www.youtube.com/embed/${id}`

    wrapper.appendChild(iframe)

    this.appendChild(wrapper)
  }
}

export const registerYouTubeComponent = () =>
  customElements.define('x-youtube', YouTubeComponent)
