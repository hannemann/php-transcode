import { Slim, Utils } from '@/components/lib';
import CARD_CSS from '../CardCss';

class Clip extends Slim {

    constructor() {
        super()
        this.setTimecode = this.setTimecode.bind(this)
        this.valid = true
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
        this[input.name] = input.value
        input.reportValidity()
        if (input.validity.patternMismatch) {
            input.setCustomValidity("Timecode invalid: HH:MM:SS.mss")
        } else {
            input.setCustomValidity("")
        }
        this.valid = this.shadowRoot.querySelectorAll('input:valid').length === 2
        this.dispatchEvent(new CustomEvent('clipupdate'))
    }

    static get initData() {
        return {from: null, to: null}
    }
}

Clip.prototype.pattern = '([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+'

Clip.template = /*html*/ `
<style>
main {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
div {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
input {
    border: 3px solid transparent;
}
input:invalid {
    border: 3px dashed red;
}
</style>
<main>
    <div><span>From:</span><input placeholder="0:0:0.0" @input="{{ this.setTimecode }}" name="from" pattern="{{ this.pattern }}" .value="{{ this.from }}"></div>
    <div><span>To:</span><input placeholder="0:0:0.0" @input="{{ this.setTimecode }}" name="to" pattern="{{ this.pattern }}" .value="{{ this.to }}"></div>
</main>
`

customElements.define('transcode-configurator-clip', Clip);

const getClipInitData = function() {
    return Clip.initData
}

export {getClipInitData}