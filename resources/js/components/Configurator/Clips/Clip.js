import { Slim, Utils } from '@/components/lib';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import CARD_CSS from '../CardCss';

class Clip extends Slim {

    constructor() {
        super()
        this.setTimecode = this.setTimecode.bind(this)
        this.handleKey = this.handleKey.bind(this)
        this.bindListener()
        this.valid = true
    }

    bindListener() {
        this.handleAdd = this.handleAdd.bind(this)
        this.handleRemove = this.handleRemove.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
    }

    onAdded() {
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot)
            this.shadowRoot.querySelectorAll('input').forEach(i => {
                i.setCustomValidity("Timecode invalid: 00:00:00.000")
                requestAnimationFrame(() => i.setCustomValidity(""))
            })
        })
    }

    setTimecode(e) {
        let input = e.currentTarget
        this.clipData[input.name] = input.value
        input.reportValidity()
        if (input.validity.patternMismatch) {
            input.setCustomValidity("Timecode invalid: HH:MM:SS.mss")
        } else {
            input.setCustomValidity("")
        }
        this.valid = this.shadowRoot.querySelectorAll('input:valid').length === 2
        this.dispatchEvent(new CustomEvent('updateclip', {detail: this.clipData}))
    }

    handleAdd() {
        this.dispatchEvent(new CustomEvent('clipinsert', {detail: this.clipData}))
    }

    handleRemove() {
        this.dispatchEvent(new CustomEvent('clipremove', {detail: this.clipData}))
    }

    handleFocus() {
        this.dispatchEvent(new CustomEvent('clipfocus', {detail: this.clipData}))
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('clipblur', {detail: this.clipData}))
    }

    handleKey(e) {
        let prevent = false
        switch (e.key) {
            case 'Tab':
                if (!e.shiftKey && this.isLast && e.currentTarget === this.inputTo) {
                    this.handleAdd()
                    prevent = true
                }
                break;
            case '-':
                this.handleRemove()
                prevent = true
                break;
            case '+':
                this.handleAdd()
                prevent = true
                break;
        }
        prevent && e.preventDefault()
    }

    getCutpoint() {
        if (this.cutpoint !== '') {
            return `(Cutpoint: ${this.cutpoint})`
        }
        return ''
    }
}

Clip.prototype.pattern = '^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$'

Clip.template = /*html*/ `
${ICON_STACK_CSS}
${CARD_CSS}
<style>
section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
}
.input {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    flex-grow: 1;
}
.input > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
}
.input span {
    flex-grow: 1;
}
.cutpoint {
    font-size: max(10px, .75rem);
    padding-left: .5rem;
}
input {
    border: 3px solid transparent;
    text-align: right;
    width: 12ch;
}
input:invalid {
    border: 3px dashed hsla(var(--hue-alert), var(--sat-alert), var(--lit-alert), var(--clr-base-alpha));
}
.icon-stack {
    font-size: var(--font-size-200);
    height: 1em;
    cursor: pointer;
}
.minus:disabled {
    cursor: default;
}
</style>
<section>
    <div class="input">
        <div>
            <span>From:</span>
            <input #ref="inputFrom" @focus="{{ this.handleFocus }}" @blur="{{ this.handleBlur }}" placeholder="0:0:0.0" @input="{{ this.setTimecode }}" @keydown="{{ this.handleKey }}" name="from" pattern="{{ this.pattern }}" .value="{{ this.clipData.from }}">
        </div>
        <div>
            <span>To:<span class="cutpoint">{{ this.cutpoint }}</span></span>
            <input #ref="inputTo" @focus="{{ this.handleFocus }}" @blur="{{ this.handleBlur }}" placeholder="0:0:0.0" @input="{{ this.setTimecode }}" @keydown="{{ this.handleKey }}" name="to" pattern="{{ this.pattern }}" .value="{{ this.clipData.to }}">
        </div>
    </div>
    <div class="icon-stack plus" @click="{{ this.handleAdd }}">
        <span class="iconify" data-icon="mdi-plus-outline"></span>
        <span class="iconify hover" data-icon="mdi-plus-outline"></span>
    </div>
    <button disabled="{{ !this.canRemove }}" class="icon-stack minus" @click="{{ this.handleRemove }}" tabindex="-1">
        <span class="iconify" data-icon="mdi-minus"></span>
        <span class="iconify hover" data-icon="mdi-minus"></span>
    </button>
</section>
`;

customElements.define('transcode-configurator-clip', Clip);
