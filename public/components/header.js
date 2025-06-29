

class HeaderComponent extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('header')) return

    this.innerHTML = `
      <header>
        <h1><a href="">Skalastudier</a></h1>
        <nav>
          <ul>
            <li>
              <a href="pages/articles.html">Artiklar</a>
            </li>
            <li>
              <a href="pages/harmonic-navigation.html">Harmonisk Navigasjon</a>
            </li>
            <li>
              <a href="pages/resources.html">Ressursar</a>
            </li>
            <li>
              <a href="pages/intervals.html">Tonetabell</a>
            </li>
          </ul>
        </nav>
      </header>
    `
  }
}

export const registerHeaderComponent = 
    () => {
      if (!customElements.get('x-header'))
        customElements.define('x-header', HeaderComponent);
    }

