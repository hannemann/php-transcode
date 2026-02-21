import { DomHelper } from "../../../../../Helper/Dom";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import { Enable } from "../../../../../Models/Filters/Filters/Enable";

class DelogoItem extends HTMLElement {
    #display;
    #btnCopy;
    #btnClose;

    /**
     * @type {{raw:{start:Number,end:Number}}[]|{from:Number,to:Number}[]}
     */
    clipsConfig = [{ from: null, to: null }];

    constructor() {
        super();
        DomHelper.initDom.call(this);
    }

    connectedCallback() {
        Iconify.scan(this.shadowRoot);
    }

    /**
     * @param {Enable} enable
     */
    set enable(enable) {
        const from = enable.from?.getCutpoint?.(this.clipsConfig) || "n/a";
        const to = enable.to?.getCutpoint?.(this.clipsConfig) || "n/a";
        this.display.innerText = `${from} - ${to}`;
    }

    set active(value) {
        this.toggleAttribute("data-active", !!value);
    }

    // Dom node getters

    get display() {
        return (this.#display ??= this.shadowRoot.querySelector(
            '[data-ref="display"]',
        ));
    }

    get btnCopy() {
        return (this.#btnCopy ??= this.shadowRoot.querySelector(
            '[data-ref="btn-copy"]',
        ));
    }

    get btnClose() {
        return (this.#btnClose ??= this.shadowRoot.querySelector(
            '[data-ref="btn-close"]',
        ));
    }
}

const STYLES = css`
    :host {
        background: var(--clr-bg-100);
        color: var(--clr-text-100);
        border: 2px solid var(--clr-bg-200);
        padding-inline: 0.5rem;
        transition-property:
            text-shadow, box-shadow, border-color, background-color;
        transition-timing-function: ease-out;
        transition-duration: var(--transition-medium);
        display: flex;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: center;

        span {
            flex-grow: 1;
        }

        &[data-active] {
            background: var(--clr-bg-200);
            color: var(--clr-enlightened);
            text-shadow:
                0 0 5px var(--clr-enlightened-glow),
                0 0 10px var(--clr-enlightened-glow);
            border-color: var(--clr-enlightened);
            box-shadow:
                0 0 20px 0 var(--clr-enlightened-glow),
                0 0 10px 0 inset var(--clr-enlightened-glow);
        }
    }
`;

DelogoItem.template = html`
    ${ICON_STACK_CSS}
    <style>
        ${STYLES}
    </style>
    <span data-ref="display"></span>
    <div class="icon-stack copy" data-ref="btn-copy">
        <span class="iconify" data-icon="mdi-content-copy"></span>
        <span class="iconify hover" data-icon="mdi-content-copy"></span>
    </div>
    <div class="icon-stack close" data-ref="btn-close">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
`;

customElements.define("delogo-filter-item", DelogoItem);
