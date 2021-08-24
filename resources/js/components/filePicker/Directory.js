import { Slim } from 'slim-js';
import '../../slim-directives';

class Directory extends Slim {
    constructor() {
        super()
        this.name = ''
    }

    load() {
        console.log(this)
    }

    onAdded() {
        this.dataset.componentId = performance.now();
    }
}

Directory.template = /*html*/`
    <style>
    :host {
        display: block;
    }
    div {
        display: inline-block;
        cursor: pointer;
    }
    div:hover {
        background-color: var(--clr-bg-200);
    }
    </style>
    <div @click="this.load()"><slot></slot></div>
`
customElements.define('filepicker-directory', Directory);