import { registerHeaderComponent } from "./components/header";
import { registerArticleListComponent } from "./components/article-list";
import { registerAudioComponent } from "./components/audio";
import { registerIntervalTableComponent} from "./components/interval-table";

const app = () => {
    const template = document.querySelector('template#page');
    if (template) document.body.appendChild(template.content, true);

    registerHeaderComponent()
    registerArticleListComponent()
    registerAudioComponent()
    registerIntervalTableComponent()
    
}

document.addEventListener('DOMContentLoaded', app);
