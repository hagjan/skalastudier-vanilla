import { registerHeaderComponent } from "./components/header";
import { registerArticleListComponent } from "./components/article-list";
import { registerAudioComponent } from "./components/audio";
import { registerIntervalTableComponent } from "./components/interval-table";
import { registerControlsComponent } from "./components/controls";
import { registerYouTubeComponent } from "./components/youtube";

const app = () => {
  const template = document.querySelector('template#page');
  if (template) document.body.appendChild(template.content, true);

  registerHeaderComponent()
  registerArticleListComponent()
  registerAudioComponent()
  registerIntervalTableComponent()
  registerControlsComponent()
  registerYouTubeComponent()


  let main = document.querySelector('main')
  let interval_table = document.querySelector('x-interval-table')
  main.addEventListener('control', (e) =>  dispatchControlEvent(interval_table, e.detail))

}

export function dispatchControlEvent(elem, detail) {
  elem.dispatchEvent(
    new CustomEvent('control', {
      detail,
      bubbles: true,
      composed: true
    })
  )
}

document.addEventListener('DOMContentLoaded', app);
