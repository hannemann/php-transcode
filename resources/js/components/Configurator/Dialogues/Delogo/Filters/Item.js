import { DomHelper } from "../../../../../Helper/Dom";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import { Delogo } from "../../../../../Models/Filters/Delogo";
import { VTime } from "../../../../../Helper/Time";

const EVENT_PREFIX = "delogo-item";

const ATTRIBUTES = {
    ACTIVE: "data-active",
};

class DelogoItem extends HTMLElement {
    /**
     * @type {HTMLElement}
     */
    #display;
    /**
     * @type {HTMLElement}
     */
    #btnCopy;
    /**
     * @type {HTMLElement}
     */
    #btnClose;
    /**
     * @type {VTime}
     */
    totalDuration;

    /**
     * @type {{raw:{start:Number,end:Number}}[]|{from:Number,to:Number}[]}
     */
    clipsConfig = [{ from: null, to: null }];

    constructor() {
        super();
        DomHelper.initDom.call(this);
    }

    connectedCallback() {
        this.#setupEvents();
        Iconify.scan(this.shadowRoot);
    }

    /**
     * Clean up listeners when element is removed from DOM
     */
    disconnectedCallback() {
        this.#takeDownEvents();
    }

    /**
     * setup event listeners
     */
    #setupEvents() {
        this.btnCopy.addEventListener("click", this);
        this.btnClose.addEventListener("click", this);
        this.addEventListener("click", this); // edit
        this.addEventListener("pointerenter", this);
        this.addEventListener("pointerleave", this);
    }

    /**
     * take down event listeners
     */
    #takeDownEvents() {
        this.btnCopy.removeEventListener("click", this);
        this.btnClose.removeEventListener("click", this);
        this.removeEventListener("click", this);
        this.removeEventListener("pointerenter", this);
        this.removeEventListener("pointerleave", this);
    }

    /**
     * Central Event Hub
     * @param {MouseEvent|PointerEvent} e
     */
    handleEvent(e) {
        switch (e.type) {
            case "click":
                e.stopImmediatePropagation();
                this.#handleClick(e);
                break;
            case "pointerenter":
            case "pointerleave":
                this.#handleHover(e);
                break;
        }
    }

    /**
     * handle click events
     * @param {MouseEvent} e
     */
    #handleClick(e) {
        let suffix = "edit";

        if (e.currentTarget === this.btnCopy) {
            suffix = "copy";
            e.stopImmediatePropagation();
        } else if (e.currentTarget === this.btnClose) {
            suffix = "delete";
            e.stopImmediatePropagation();
        }

        this.#dispatch(`${EVENT_PREFIX}-${suffix}`);
    }

    /**
     * handle hover events
     * @param {PointerEvent} e
     */
    #handleHover(e) {
        const suffix = e.type === "pointerenter" ? "on" : "off";
        this.#dispatch(`${EVENT_PREFIX}-${suffix}`);
    }

    /**
     * dispatch event
     * @param {String} name
     */
    #dispatch(name) {
        this.dispatchEvent(
            new CustomEvent(name, {
                bubbles: true,
                composed: true,
                detail: { item: this },
            }),
        );
    }

    /**
     * @param {Delogo} model
     */
    set model(model) {
        this.index = model.filterIndex;
        const { from, to } = model.between;
        const fromCut = from?.getCutpoint?.(this.clipsConfig) || "n/a";
        const toCut = to?.getCutpoint?.(this.clipsConfig) || "n/a";
        this.display.innerText = `${fromCut} - ${toCut}`;
        this.classList.toggle("incomplete", from === null || to === null);

        // TODO: validate from/to against first clip start- and last clip endtime
    }

    set index(idx) {
        this.dataset.index = idx;
    }

    get index() {
        return Number(this.dataset.index);
    }

    set active(value) {
        this.toggleAttribute(ATTRIBUTES.ACTIVE, !!value);
    }

    get active() {
        return this.hasAttribute(ATTRIBUTES.ACTIVE);
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

    set groupColor(color) {
        this.style.setProperty("--group-color", color);
    }

    set grouped(value) {
        this.toggleAttribute("data-grouped", value);
    }
}

const STYLES = css`
    :host {
        background: var(--clr-bg-100);
        color: var(--clr-text-100);
        border: 2px solid var(--clr-bg-200);
        border-left-color: var(--group-color, var(--clr-bg-200));
        padding-inline: 0.5rem;
        padding-left: 16px;
        transition-property:
            text-shadow, box-shadow, border-color, background-color;
        transition-timing-function: ease-out;
        transition-duration: var(--transition-medium);
        display: flex;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: center;
        position: relative;

        span {
            flex-grow: 1;
        }

        &:host([data-active]) {
            background: var(--clr-bg-200);
            color: var(--clr-enlightened);
            text-shadow:
                0 0 5px var(--clr-enlightened-glow),
                0 0 10px var(--clr-enlightened-glow);
            border-color: var(--clr-enlightened);
            border-left-color: var(--group-color, var(--clr-enlightened));
            box-shadow:
                0 0 20px 0 var(--clr-enlightened-glow),
                0 0 10px 0 inset var(--clr-enlightened-glow);
        }

        &:host(.error) {
            background-color: hsl(from var(--clr-bg-150) var(--hue-error) s l);
        }
        &:host(.incomplete) {
            opacity: 0.8;
        }
    }

    :host([data-grouped]) {
        border-left-color: transparent;
    }

    :host([data-grouped])::before {
        content: "";
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--group-color);
    }

    :host([data-grouped][data-active])::before {
        background: var(--group-color);
    }
`;

DelogoItem.template = html`
    <style>
        ${ICON_STACK_CSS}
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
