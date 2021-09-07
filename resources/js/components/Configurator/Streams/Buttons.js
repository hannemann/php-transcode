import { Slim, Utils } from '@/components/lib';
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'

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
${ICON_STACK_CSS}
<main>
    <div @click="{{ this.toggle() }}" class="{{ this.item.active ? 'icon-stack active' : 'icon-stack' }}">
        <span class="iconify active" data-icon="mdi-checkbox-marked-outline"></span>
        <span class="iconify inactive" data-icon="mdi-checkbox-blank-outline"></span>
        <span class="iconify hover" data-icon="mdi-checkbox-blank-outline"></span>
    </div>
    <div @click="{{ this.configure() }}" class="icon-stack">
        <span class="iconify" data-icon="mdi-cog-outline"></span>
        <span class="iconify hover" data-icon="mdi-cog-outline"></span>
    </div>
</main>
`

customElements.define('transcode-configurator-stream-buttons', Buttons);