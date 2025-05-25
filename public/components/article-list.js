class ArticleListComponent extends HTMLElement {
  connectedCallback() {
    const src = this.getAttribute('src');
    if (!src) {
      this.innerHTML = '<p>No JSON source provided.</p>';
      return;
    }

    fetch(src)
      .then(response => response.json())
      .then(items => {
        if (!Array.isArray(items)) {
          this.innerHTML = '<p>Invalid JSON format.</p>';
          return;
        }
        const ul = document.createElement('ul');
        items.sort((a,b) => a.title > b.title).forEach(item => {
          const link = document.createElement('a')
          link.href = `/pages/${item._id}/`

          const title = document.createElement('h3')
          title.textContent = item.title

          link.appendChild(title)

          const performer = document.createElement('p')
          performer.textContent = item.performer
          const area = document.createElement('p')
          area.textContent = item.area

          const detail = document.createElement('div')
          detail.appendChild(performer)
          detail.appendChild(area)


          
          const li = document.createElement('li');
          li.accessKey = item._id
          li.appendChild(link)
          li.appendChild(detail)

          ul.appendChild(li);
        });
        this.innerHTML = '';
        this.appendChild(ul);
      })
      .catch(error => {
        this.innerHTML = `<p>Error loading JSON: ${error}</p>`;
      });
  }
}

export const registerArticleListComponent = () => 
    customElements.define('x-article-list', ArticleListComponent);
