import { Slim } from '@/components/lib';
import CARD_CSS from './CardCss';

class Clip extends Slim {

    constructor() {
        super()
        this.setTimecode = this.setTimecode.bind(this)
        this.dataset.valid = 'true'
        this.valid = {
            from: true,
            to: true
        }
    }

    onAdded() {
        requestAnimationFrame(() => {
            this.shadowRoot.querySelectorAll('input').forEach(i => {
                i.setCustomValidity("Timecode invalid: 00:00:00.000")
                requestAnimationFrame(() => i.setCustomValidity(""))
            })
        })
    }

    setTimecode(e) {
        let input = e.currentTarget
        input.reportValidity()
        if (input.validity.patternMismatch) {
            input.setCustomValidity("Timecode invalid: HH:MM:SS.mss")
            this[input.name] = null
            this.valid[input.name] = false
        } else {
            input.setCustomValidity("")
            this[input.name] = input.value
            this.valid[input.name] = true
        }
        this.dataset.valid = (this.valid.from && this.valid.to).toString()
    }
}

Clip.prototype.pattern = '([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+'

Clip.template = /*html*/ `
${CARD_CSS}
<style>
div {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
section {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
input {
    border: 3px solid transparent;
}
input:invalid {
    border: 3px dashed red;
}
</style>
<main>
    <h2>Clip</h2>
    <section>
        <div><span>From:</span><input @input="{{ this.setTimecode }}" name="from" pattern="{{ this.pattern }}"></div>
        <div><span>To:</span><input @input="{{ this.setTimecode }}" name="to" pattern="{{ this.pattern }}"></div>
    </section>
</main>
`

customElements.define('transcode-configurator-clip', Clip);