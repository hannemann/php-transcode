import { DomHelper } from '../../Helper/Dom'
import Iconify from '@iconify/iconify'

const STATES = ['success', 'info', 'warning', 'error']
const DEFAULT_STATE = 'info'

class Toast extends HTMLElement {

    constructor() {
        super()
        this.items = []
        document.addEventListener('toast', this.show.bind(this))
    }

    connectedCallback() {

        const importNode = DomHelper.fromTemplate.call(this);
        this.main = importNode.querySelector('main');
        
        const itemTemplate = importNode.querySelector('template[data-type="item"]');
        this.itemTemplate = itemTemplate.content;
        itemTemplate.remove();

        DomHelper.appendShadow.call(this, importNode);
    }

    show(e) {
        e.detail.type = STATES.indexOf(e.detail.type) > -1 ? e.detail.type : DEFAULT_STATE
        e.detail.id = `${performance.now()}-${this.items.length}`
        this.items.unshift(e.detail)
        this.renderItems();
        this.animateIn()
    }

    renderItems() {
        this.main.replaceChildren();
        this.items.forEach(item => {
            const node = document.importNode(this.itemTemplate, true).querySelector('div');
            node.classList.add(item.type);
            node.addEventListener('click', this.hide.bind(this, item), {once: true});
            node.querySelector('section').append(document.createTextNode(item.message));
            this.main.append(node);
        });
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
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
                        this.renderItems();
                    }, {once: true})
                    node.dataset.transitionOut = 'before'
                })
            })
        }
    }
}

Toast.template = /*html*/ `
<style>
:host {
    position: fixed;
    right: 2rem;
    top: 2rem;
    display: block;
    overflow-y: hidden;
    z-index: 100;
}
main {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
main > div {
    width: 25rem;
    font-size: var(--font-size-50);
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
<main>
    <template data-type="item">
        <div>
            <section>
                <span class="iconify" data-icon="mdi-thumb-up-outline"></span>
                <span class="iconify" data-icon="mdi-alert-box-outline"></span>
                <span class="iconify" data-icon="mdi-alert-outline"></span>
                <span class="iconify" data-icon="mdi-alert-circle-outline"></span>
            </section>
        </div>
    </template>
</main>
`;

customElements.define('transcoder-toast', Toast);