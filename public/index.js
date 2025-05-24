import { registerHeaderComponent } from "./components/header";

const app = () => {
    const template = document.querySelector('template#page');
    if (template) document.body.appendChild(template.content, true);

    registerHeaderComponent()
    
}

document.addEventListener('DOMContentLoaded', app);
