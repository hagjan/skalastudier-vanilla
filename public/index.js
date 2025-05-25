import { registerHeaderComponent } from "./components/header";
import { registerArticleListComponent } from "./components/article-list";

const app = () => {
    const template = document.querySelector('template#page');
    if (template) document.body.appendChild(template.content, true);

    registerHeaderComponent()
    registerArticleListComponent()
    
}

document.addEventListener('DOMContentLoaded', app);
