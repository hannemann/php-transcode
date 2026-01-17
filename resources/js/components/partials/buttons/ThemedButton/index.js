import { DomHelper } from "../../../../Helper/Dom";

class ThemeButton extends HTMLElement {
    
    connectedCallback() {
        DomHelper.initDom.call(this);
        this.button = this.shadowRoot.querySelector('button');

        requestAnimationFrame(() => {
            this.disabled =
                this.hasAttribute("disabled") || this.deferredDisable;
            delete this.deferredDisable;
        });
    }
    focus() {
        requestAnimationFrame(() => {
            this.button.focus();
        });
    }
    blur() {
        requestAnimationFrame(() => {
            this.button.blur();
        });
    }
    matches(selector) {
        if (selector === ":focus") {
            return this.button.matches(":focus");
        }
        return super.matches(selector);
    }
    set disabled(value) {
        if (this.button) {
            this.button.disabled = !!value;
        } else {
            this.deferredDisable = !!value;
        }
    }
    get disabled() {
        return this.button.disabled;
    }
}

ThemeButton.template = /*html*/ `
<style>
button {
    background: var(--clr-bg-100);
    color: var(--clr-text-100);
    font-size: 1rem;
    padding-inline: .5rem;
    display: flex;
    align-items: center;
    gap: .5rem;
    border: 2px solid var(--clr-bg-200);
    transition-property: text-shadow, box-shadow, border-color, background-color;
    transition-timing-function: ease-out;
    transition-duration: var(--transition-medium);
}
button:focus {
    border-color: var(--clr-enlightened);
    color: var(--clr-enlightened);
    background:var(--clr-bg-200);
}
button:focus-visible {
    outline: none;
}
button:hover {
    background:var(--clr-bg-200);
    color: var(--clr-enlightened);
    text-shadow: 0 0 5px var(--clr-enlightened-glow), 0 0 10px var(--clr-enlightened-glow);
    border-color: var(--clr-enlightened);
    box-shadow: 0 0 20px 0 var(--clr-enlightened-glow), 0 0 10px 0 inset var(--clr-enlightened-glow);
}
button:disabled {
    color: var(--clr-text-100);
    background-color: var(--clr-disabled);
    border-color: var(--clr-bg-150);
    text-shadow: none;
    box-shadow: none;
}
.label {
    display: inline-block;
    padding-block: .5rem;
}
</style>
<button part="button">
    <slot name="icon"></slot>
    <span class="label">
        <slot></slot>
    </span>
</button>
`;

export { ThemeButton };
