import { DomHelper } from '../../../Helper/Dom';
import { Iconify } from "@/components/lib";
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import CARD_CSS from '../CardCss';

class Clip extends HTMLElement {

    constructor() {
        super()
        DomHelper.initDom.call(this);
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

    connectedCallback() {
        this.inputFrom.value = this.clipData.from;
        this.inputTo.value = this.clipData.to;
        this.btnAdd.addEventListener('click', this.handleAdd);
        this.btnRemove.addEventListener('click', this.handleRemove);
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
            [this.inputFrom, this.inputTo].forEach(i => {
                i.setCustomValidity("Timecode invalid: 00:00:00.000");
                requestAnimationFrame(() => i.setCustomValidity(""));
                i.addEventListener('focus', this.handleFocus);
                i.addEventListener('blur', this.handleBlur);
                i.addEventListener('keydown', this.handleKey);
                i.addEventListener('input', this.setTimecode);
            });
        })
    }

    disconnectedCallback() {
        this.btnAdd.removeEventListener('click', this.handleAdd);
        this.btnRemove.removeEventListener('click', this.handleRemove);
        [this.inputFrom, this.inputTo].forEach(i => {
            i.removeEventListener('focus', this.handleFocus);
            i.removeEventListener('blur', this.handleBlur);
            i.removeEventListener('keydown', this.handleKey);
            i.removeEventListener('input', this.setTimecode);
        });
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

    set cutpoint(value) {
        this.labelCutPoint.innerText = value;
    }

    get inputFrom() {
        return this.shadowRoot.querySelector('input[name="from"]');
    }

    get inputTo() {
        return this.shadowRoot.querySelector('input[name="to"]');
    }

    get labelCutPoint() {
        return this.shadowRoot.querySelector('.cutpoint');
    }

    get btnAdd() {
        return this.shadowRoot.querySelector('.icon-stack.plus');
    }

    get btnRemove() {
        return this.shadowRoot.querySelector('.icon-stack.minus')
    }

    set canRemove(value) {
        this.btnRemove.disabled = !value;
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
            <input placeholder="0:0:0.0" name="from" pattern="${ Clip.prototype.pattern }">
        </div>
        <div>
            <span>To:<span class="cutpoint"></span></span>
            <input placeholder="0:0:0.0" name="to" pattern="${ Clip.prototype.pattern }">
        </div>
    </div>
    <div class="icon-stack plus">
        <span class="iconify" data-icon="mdi-plus-outline"></span>
        <span class="iconify hover" data-icon="mdi-plus-outline"></span>
    </div>
    <button class="icon-stack minus" tabindex="-1">
        <span class="iconify" data-icon="mdi-minus"></span>
        <span class="iconify hover" data-icon="mdi-minus"></span>
    </button>
</section>
`;

customElements.define('transcode-configurator-clip', Clip);
