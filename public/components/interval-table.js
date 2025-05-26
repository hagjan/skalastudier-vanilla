function centFromTempered(val, root, step)  {
  const tempered = root * Math.pow(2, step / 12);
  const dev = 1200 * Math.log2((val * root) / tempered);
  return dev > 0 ? `+${dev.toFixed()}` : `${dev.toFixed()}`;
};


class IntervalTableComponent extends HTMLElement {
  #root
  #interval_list
  #intervals

  connectedCallback() {
    this.addEventListener("control", (e) => {
      this.#root = e.detail.root;
      this.update()
    })
  
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

    this.#intervals = intervals.split(',')
    this.#root = this.getAttribute('root') || 440.0;


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
        const title = document.createElement('h3')
        title.textContent = 'Skalaoversikt'
        
        const wrapper = document.createElement('div')
        const table = document.createElement('table')
        const head = document.createElement('thead')
        const tr = document.createElement('tr')

        const step = document.createElement('th')
        step.textContent = 'Steg'
        const name = document.createElement('th')
        name.textContent = 'Intervallnamn'
        const frac = document.createElement('th')
        frac.textContent = 'Svingetal'
        const hertz = document.createElement('th')
        hertz.textContent = 'Hertz'
        const diverge = document.createElement('th')
        diverge.textContent = 'Centavvik'
        const primelimit = document.createElement('th')
        primelimit.textContent = 'Primtalsgrense'

        tr.appendChild(step)
        tr.appendChild(name)
        tr.appendChild(frac)
        tr.appendChild(hertz)
        tr.appendChild(diverge)
        tr.appendChild(primelimit)
        head.appendChild(tr)
        table.appendChild(head)

        const body = document.createElement('tbody')

        this.#interval_list.filter(item => this.#intervals.includes(item.fraction)).sort((a,b) => a.value > b.value).forEach(item => {

          const tr = document.createElement('tr')

          const step = document.createElement('td')
          step.textContent = item.step
          const name = document.createElement('td')
          name.textContent = item.name
          const frac = document.createElement('td')
          frac.textContent = item.fraction
          const hertz = document.createElement('td')
          hertz.textContent = (this.#root * (item.numerator/item.denominator)).toFixed(2)
          const diverge = document.createElement('td')
          diverge.textContent = centFromTempered(item.value, this.#root, item.tempered)
          const primelimit = document.createElement('td')
          primelimit.textContent = item.limit
          
          tr.appendChild(step)
          tr.appendChild(name)
          tr.appendChild(frac)
          tr.appendChild(hertz)
          tr.appendChild(diverge)
          tr.appendChild(primelimit)

          body.appendChild(tr)

          
        });
        this.innerHTML = '';



        table.appendChild(head)
        table.appendChild(body)
        wrapper.appendChild(table)
        this.appendChild(title)
        this.appendChild(wrapper)
           
   }
}

export const registerIntervalTableComponent = () => 
    customElements.define('x-interval-table', IntervalTableComponent);
