import { Slim, Utils } from 'slim-js'
import '../../../../slim-directives'
import Iconify from '@iconify/iconify'

class Buttons extends Slim {

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    toggle() {
        this.item.active = !this.item.active
        requestAnimationFrame(() => {
            Utils.forceUpdate(this, 'item')
            Iconify.scan(this.shadowRoot)
        })
    }

    configure() {
        document.dispatchEvent(new CustomEvent('stream-configure', {detail: {
            item: this.item
        }}))
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
        font-size: var(--font-size-200)
    }
    main > div {
        cursor: pointer;
    }
    div {
        height: 1em;
    }
</style>
<main>
    <div @click="{{ this.toggle() }}">
        <div *if="{{ this.item.active }}">
            <span class="iconify" data-icon="mdi-checkbox-marked-outline"></span>
        </div>
        <div *if="{{ !this.item.active }}">
            <span class="iconify" data-icon="mdi-checkbox-blank-outline"></span>
        </div>
    </div>
    <div @click="{{ this.configure() }}">
        <span class="iconify" data-icon="mdi-cog-outline"></span>
    </div>
</main>
`

customElements.define('transcode-configurator-stream-buttons', Buttons);