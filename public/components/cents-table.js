
const getCentValue = (num1, num2) => {
  const value = Math.round(1200 * Math.log2(num2 / num1));
  if (value > 0) {
    return '+' + value
  }
  return value
};


class CentsTableComponent extends HTMLElement {
  #interval_list
  #intervals

  connectedCallback() {
    const intervals = this.getAttribute('intervals');

    if (!intervals) {
      this.innerHTML = '<p>No intervals provided.</p>';
      return;
    }

    this.#intervals = intervals.split(',')

    fetch('data/intervals.json')
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
    const title = document.createElement('h3')
    title.textContent = 'Innbyrdes avstander'

    const intervals = this.#interval_list.filter(item => this.#intervals.includes(item.fraction)).sort((a, b) => a.value > b.value ? 1 : -1)

    const wrapper = document.createElement('div')
    const table = document.createElement('table')
    const tr = document.createElement('tr')

    const nonce = document.createElement('th')
    tr.appendChild(nonce)

    intervals.forEach(item => {
      const step = document.createElement('th')
      step.textContent = item.fraction
      tr.appendChild(step)
    })

    table.appendChild(tr)

    intervals.forEach(item => {
      const tr = document.createElement('tr')

      const th = document.createElement('th')
      th.textContent = item.fraction
      tr.appendChild(th)


      intervals.forEach(inner => {
        const td = document.createElement('td')
        td.textContent = getCentValue(item.value, inner.value)
        tr.appendChild(td)
      })

      table.appendChild(tr)
    })


    this.innerHTML = '';
    wrapper.appendChild(table)
    this.appendChild(title)
    this.appendChild(wrapper)

  }
}

export const registerCentsTableComponent = () => {
  if (!customElements.get('x-cents-table'))
    customElements.define('x-cents-table', CentsTableComponent);
}
