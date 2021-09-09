import { Slim, Utils } from '@/components/lib';
import CARD_CSS from '../CardCss';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import Iconify from '@iconify/iconify'
import './Clip'
import {getClipInitData} from './Clip'

class Clips extends Slim {
    constructor() {
        super()
        this.clips = [getClipInitData()]
        this.cliUpdatepHandler = this.handleClipUpdate.bind(this)
        this.valid = true
    }

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    handleClick(item) {
        const idx = this.clips.indexOf(item)
        if (this.clips.length === 1 || idx === this.clips.length - 1) {
            this.clips = [...this.clips, getClipInitData()]
        } else {
            this.clips = [...this.clips.filter((c, i) => i !== idx)]
        }
        Utils.forceUpdate(this)
        requestAnimationFrame(() => {Iconify.scan(this.shadowRoot)})
    }

    handleClipUpdate(e) {
        const idx = Array.from(this.shadowRoot.querySelectorAll('section')).indexOf(e.target.parentNode)
        this.clips[idx].from = e.target.from
        this.clips[idx].to = e.target.to
        this.valid = Array.from(this.shadowRoot.querySelectorAll('section')).every(c => c.valid)
    }
}

Clips.template = /*html*/`
${CARD_CSS}
${ICON_STACK_CSS}
<style>
    section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .5rem;
    }
    transcode-configurator-clip {
        flex-grow: 1;
    }
    .icon-stack {
        font-size: var(--font-size-200);
        height: 1em;
    }
    section .plus {
        display: none;
    }
    section:last-of-type .plus {
        display: block;
    }
    section:last-of-type .minus {
        display: none;
    }
</style>
<main>
    <h2>Clips</h2>
    <section *foreach="{{ this.clips }}">
        <transcode-configurator-clip @clipupdate="{{ this.cliUpdatepHandler }}" .from="{{ item.from }}" .to="{{ item.to }}"></transcode-configurator-clip>
        <div @click="{{ this.handleClick(item) }}">
            <div class="icon-stack plus">
                <span class="iconify" data-icon="mdi-plus-outline"></span>
                <span class="iconify hover" data-icon="mdi-plus-outline"></span>
            </div>
            <div class="icon-stack minus">
                <span class="iconify" data-icon="mdi-minus"></span>
                <span class="iconify hover" data-icon="mdi-minus"></span>
            </div>
        </div>
    </section>
</main>
`
customElements.define('transcode-configurator-clips', Clips);