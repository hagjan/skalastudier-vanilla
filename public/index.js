import { registerHeaderComponent } from "./components/header.js";
import { registerArticleListComponent } from "./components/article-list.js";
import { registerAudioComponent } from "./components/audio.js";
import { registerIntervalTableComponent } from "./components/interval-table.js";
import { registerControlsComponent } from "./components/controls.js";
import { registerYouTubeComponent } from "./components/youtube.js";
import { registerKeysComponent } from "./components/keys.js";

const app = () => {
  const template = document.querySelector('template#page');
  if (template) document.body.appendChild(template.content, true);

  registerHeaderComponent()
  registerArticleListComponent()
  registerAudioComponent()
  registerIntervalTableComponent()
  registerControlsComponent()
  registerYouTubeComponent()
  registerKeysComponent()


  let main = document.querySelector('main')
  let interval_table = document.querySelector('x-interval-table')
  let keys = document.querySelector('x-keys')
  main.addEventListener('control_main', (e) =>  dispatchControlEvent(interval_table, e.detail))
  main.addEventListener('control_main', (e) =>  dispatchControlEvent(keys, e.detail))

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
