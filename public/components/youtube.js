class YouTubeComponent extends HTMLElement {
  connectedCallback() {
    console.log('asda')
    const id = this.getAttribute('id')

    if (!id) {
      this.innerHTML = `<p>No youtube reference provided.</p>`
      return;
    }
    if (this.querySelector('iframe')) return

    const header = document.createElement('h3')
    header.textContent = "Video"
    const wrapper = document.createElement('div')
    wrapper.style = "display: flex; width: 100%; justify-content: center;"
    const iframe = document.createElement('iframe')
    iframe.width = '100%'
    // iframe.width = '711px'
    iframe.height= '400px'
    iframe.src = `https://www.youtube.com/embed/${id}`

    wrapper.appendChild(iframe)

    const br = document.createElement('br')
    this.appendChild(header)
    this.appendChild(wrapper)
    this.appendChild(br)
  }
}

export const registerYouTubeComponent = () =>
  customElements.define('x-youtube', YouTubeComponent)
