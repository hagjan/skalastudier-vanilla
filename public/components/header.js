

class HeaderComponent extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('header')) return

    this.innerHTML = `
      <header>
        <h1>Skalastudier</h1>
        <nav>
          <ul>
            <li>
              <a href="/">Heim</a>
            </li>
            <li>
              <a href="/pages/articles.html">Artiklar</a>
            </li>
            <li>
              <a href="/pages/harmonic-navigation.html">Harmonisk Navigasjon</a>
            </li>
            <li>
              <a href="/pages/resources.html">Ressursar</a>
            </li>
          </ul>
        </nav>
      </header>
    `
  }
}

export const registerHeaderComponent = 
    () => customElements.define('x-header', HeaderComponent);

