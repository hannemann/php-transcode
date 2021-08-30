import { Slim } from 'slim-js'
import '../slim-directives'
import Iconify from '@iconify/iconify'

class Loading extends Slim {

    onAdded() {
        document.addEventListener('loading', e => this.classList.toggle('active', !!e.detail))
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }
}

Loading.template = /*html*/`
<style>
    :host {
        position: fixed;
        inset: 0;
        background-color: transparent;
        transition: var(--loading-transition);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    :host(.active) {
        background-color: var(--clr-bg-0-translucent);
    }
    :host(:not(.active)) {
        display: none;
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    main {
        animation: spin 1s infinite;
        font-size: 5rem;
    }
</style>
<main>
    <span class="iconify" data-icon="mdi-loading"></span>
</main>
`

customElements.define('transcoder-loading', Loading);