import { Slim, Utils } from 'slim-js';
import '../slim-directives';
import Iconify from '@iconify/iconify'

const STATES = ['success', 'info', 'warning', 'error']
const DEFAULT_STATE = 'info'

class Toast extends Slim {

    constructor() {
        super()
        this.items = []
        document.addEventListener('toast', this.show.bind(this))
    }

    show(e) {
        e.detail.type = STATES.indexOf(e.detail.type) > -1 ? e.detail.type : DEFAULT_STATE
        e.detail.id = `${performance.now()}-${this.items.length}`
        this.items.unshift(e.detail)
        Utils.forceUpdate(this, 'items')

        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
        this.animateIn()
    }

    animateIn() {
        let node = this.shadowRoot.querySelector('main > div')
        this.items[0].height = node.offsetHeight
        requestAnimationFrame(() => {
            node.dataset.transitionIn = 'before'
            requestAnimationFrame(() => {
                node.style.height = `${this.items[0].height}px`
                node.dataset.transition = 'in'
                node.addEventListener('transitionend', () => {
                    delete node.dataset.transition
                    node.style.height = ''
                }, {once: true})
                requestAnimationFrame(() => delete node.dataset.transitionIn)
            })
        })
    }

    hide(item) {
        let idx = this.items.findIndex(i => item.id === i.id)
        if (idx > -1) {
            let node = this.shadowRoot.querySelectorAll('main > div')[idx];
            node.style.height = `${item.height}px`
            requestAnimationFrame(() => {
                node.dataset.transition = 'out'
                requestAnimationFrame(() => {
                    node.addEventListener('transitionend', () => {
                        this.items.splice(idx, 1)
                        node.style.height = ''
                        delete node.dataset.transition
                        delete node.dataset.transitionOut
                        Utils.forceUpdate(this, 'items')
                    }, {once: true})
                    node.dataset.transitionOut = 'before'
                })
            })
        }
    }
}

Toast.template = /*html*/`
<style>
:host {
    position: fixed;
    right: 2rem;
    top: 2rem;
    display: block;
    overflow-y: hidden;
}
main {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
main > div {
    width: 240px;
    color: hsla(0, 0%, 100%, .8);
    border-radius: .5rem;
    position: relative;
    transform-origin: center top;
    transform: scaleY(1);
    opacity: 1;
    max-height: 10rem;
    overflow: hidden;
}
main > div:hover {
    max-height: 100rem;
}
main > div[data-transition="in"],
main > div[data-transition="out"] {
    transition: all var(--transition-medium) linear;
}
main > div[data-transition-in="before"],
main > div[data-transition-out="before"] {
    opacity: 0;
    transform: scaleY(.01);
    height: 0 !important;
}
main > div {
    background: hsla(var(--hue-alert), var(--sat-alert), var(--lit-alert), var(--clr-base-alpha));
    cursor: pointer;
}
main > div.success {
    --hue-alert: var(--hue-success);
}
main > div.info {
    --hue-alert: var(--hue-info);
}
main > div.warning {
    --hue-alert: var(--hue-warning);
}
main > div.error {
    --hue-alert: var(--hue-error);
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
section {
    display: flex;
    align-items: flex-start;
    padding: .5rem;
}
svg[data-icon="mdi-close"] {
    display: block;
}
</style>
<main #ref="main">
    <div *foreach="{{ this.items }}" class="{{ item.type }}" @click="{{ this.hide(item) }}">
        <section>
            <span class="iconify" data-icon="mdi-thumb-up-outline"></span>
            <span class="iconify" data-icon="mdi-alert-box-outline"></span>
            <span class="iconify" data-icon="mdi-alert-outline"></span>
            <span class="iconify" data-icon="mdi-alert-circle-outline"></span>
            {{ item.message }}
        </section>
    </div>
</main>
`

customElements.define('transcoder-toast', Toast);