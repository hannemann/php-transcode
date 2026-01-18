import { DomHelper } from '../../../Helper/Dom';
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'

class Buttons extends HTMLElement {

    connectedCallback() {
        DomHelper.initDom.call(this);
        this.toggle = this.toggle.bind(this);
        this.configure = this.configure.bind(this);
        this.btnCheckbox = this.shadowRoot.querySelector('button[data-type="checkbox"]');
        this.btnConfig = this.shadowRoot.querySelector('button[data-type="config"]');
        this.btnCheckbox.addEventListener('click', this.toggle);
        this.btnConfig.addEventListener('click', this.configure);
        this.active = this.item.active;
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    disconnectedCallback() {
        this.btnCheckbox.removeEventListener('click', this.toggle);
        this.btnConfig.removeEventListener('click', this.configure);
    }

    toggle() {
        this.item.active = !this.item.active
        this.active = this.item.active;
        document.dispatchEvent(new CustomEvent('stream-toggle', {detail: {
            origin: this,
            item: this.item
        }}))
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot)
        })
    }

    configure() {
        document.dispatchEvent(new CustomEvent('stream-configure', {detail: {
            origin: this,
            item: this.item
        }}))
    }

    set active(value) {
        this.btnCheckbox.classList.toggle('active', !!value);
        this.btnConfig.disabled = !value;
    }
}

Buttons.template = /*html*/`
<style>
    :host {
        flex-grow: 0;
    }
    main {
        display: flex;
        align-items: center;
        gap: .5rem;
    }
    button {
        font-size: var(--font-size-200);
        height: 1em;
        aspect-ratio: 1;
    }
    button:not(:disabled) {
        cursor: pointer;
    }
</style>
${ICON_STACK_CSS}
<main>
    <button data-type="checkbox" class="icon-stack">
        <span class="iconify active" data-icon="mdi-checkbox-marked-outline"></span>
        <span class="iconify inactive" data-icon="mdi-checkbox-blank-outline"></span>
        <span class="iconify hover" data-icon="mdi-checkbox-blank-outline"></span>
    </button>
    <button data-type="config" class="icon-stack">
        <span class="iconify" data-icon="mdi-cog-outline"></span>
        <span class="iconify hover" data-icon="mdi-cog-outline"></span>
    </button>
</main>
`

customElements.define('transcode-configurator-stream-buttons', Buttons);