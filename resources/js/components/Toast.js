import { Slim, Utils } from 'slim-js';
import '../slim-directives';
import Iconify from '@iconify/iconify'

const STATES = ['success', 'info', 'warning', 'error']
const DEFAULT_STATE = 'info'

class Toast extends Slim {

    onAdded() {
        this.items = []
        document.addEventListener('toast', this.show.bind(this))
    }

    init(e) {
    }

    show(e) {
        e.detail.type = STATES.indexOf(e.detail.type) > -1 ? e.detail.type : DEFAULT_STATE
        this.items.unshift(e.detail)
        Utils.forceUpdate(this)
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    hide(item) {
        let idx = this.items.indexOf(item)
        let node = this.shadowRoot.querySelectorAll('main > div')[idx];
        node.classList.add('fade-out')
        node.addEventListener('transitionend', () => {
            this.items.splice(idx, 1)
            Utils.forceUpdate(this)
        })
    }
}

Toast.template = /*html*/`
<style>
:host {
    position: fixed;
    right: 2rem;
    top: 2rem;
    display: block;
}
main > div {
    display: flex;
    align-items: center;
    width: 240px;
    color: white;
    padding: .5rem;
    border-radius: .5rem;
    position: relative;
    margin-bottom: .5rem;
    opacity: 1;
    transition: opacity var(--transition-slow) linear;
}
div.fade-out {
    opacity: 0;
}
div.success {
    background: green;
}
div.info {
    background: blue;
}
div.warning {
    background: yellow;
}
div.error {
    background: red;
}
svg {
    display: none;
    margin: .1rem .5rem 0 0;
    flex-shrink: 0;
}
div.success svg[data-icon="mdi-thumb-up-outline"],
div.info svg[data-icon="mdi-alert-box-outline"],
div.warning svg[data-icon="mdi-alert-outline"],
div.error svg[data-icon="mdi-alert-circle-outline"] {
    display: block;
}
div.hide {
    cursor: pointer;
}
svg[data-icon="mdi-close"] {
    display: block;
    position: absolute;
    top: .5rem;
    right: .5rem;
}
</style>
<main #ref="main">
    <div *foreach="{{ this.items }}" class="{{ item.type }}">
        <div class="hide" @click="{{ this.hide(item) }}">
            <span class="iconify" data-icon="mdi-close"></span>
        </div>
        <span class="iconify" data-icon="mdi-thumb-up-outline"></span>
        <span class="iconify" data-icon="mdi-alert-box-outline"></span>
        <span class="iconify" data-icon="mdi-alert-outline"></span>
        <span class="iconify" data-icon="mdi-alert-circle-outline"></span>
        {{ item.message }}
    </div>
</main>
`

customElements.define('transcoder-toast', Toast);