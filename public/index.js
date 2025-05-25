import { registerHeaderComponent } from "./components/header";
import { registerArticleListComponent } from "./components/article-list";
import { registerAudioComponent } from "./components/audio";

const app = () => {
    const template = document.querySelector('template#page');
    if (template) document.body.appendChild(template.content, true);

    registerHeaderComponent()
    registerArticleListComponent()
    registerAudioComponent()
    
}

document.addEventListener('DOMContentLoaded', app);
