import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class Pad extends VideoEditor {
    connectedCallback() {
        super.connectedCallback();
    }

    bindListeners() {
        super.bindListeners();
    }

    addListeners() {
        super.addListeners();
    }

    removeListeners() {
        super.removeListeners();
    }

    handleEvents(e) {
        if (e.type === "keydown") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
            }
        }
    }

    setDimensions() {
        this.shadowRoot.querySelector('[data-type="wh"]').innerText =
            `${this.width}px x${this.height}px`;
        return this;
    }

    setPosition() {
        this.shadowRoot.querySelector('[data-type="xy"]').innerText =
            `Top: ${this.top}, Left: ${this.left}`;
        return this;
    }

    applyFilterData(data) {
        this.pad = data;
    }

    get pad() {
        return {
            cw: this.canvasWidth,
            ch: this.canvasHeight,
            cx: this.left,
            cy: this.top,
            color: this.color,
        };
    }

    set pad(pad) {
        this.canvasWidth = pad.cw;
        this.canvasHeight = pad.ch;
        this.left = pad.cx;
        this.top = pad.cy;
        this.color = pad.color;
    }

    get videoImageRatio() {
        const scaleRatio = this.image.naturalWidth / this.image.offsetWidth;
        return (this.image.offsetWidth / this.imageRect.width) * scaleRatio;
    }

    get imageRect() {
        return this.image.getBoundingClientRect();
    }

    get canvasWidth() {
        return parseInt(this.inputWidth.value);
    }

    set canvasWidth(value) {
        value = value instanceof InputEvent ? value.target.value : value;
        this.inputWidth.value = parseInt(value);
    }

    get canvasHeight() {
        return parseInt(this.inputHeight.value);
    }

    set canvasHeight(value) {
        value = value instanceof InputEvent ? value.target.value : value;
        this.inputHeight.value = parseInt(value);
    }

    get top() {
        return parseInt(this.inputTop.value);
    }

    set top(value) {
        value = value instanceof InputEvent ? value.target.value : value;
        this.inputTop.value = parseInt(value);
    }

    get left() {
        return parseInt(this.inputLeft.value);
    }

    set left(value) {
        value = value instanceof InputEvent ? value.target.value : value;
        this.inputLeft.value = parseInt(value);
    }

    get inputWidth() {
        return this.shadowRoot.querySelector('[data-ref="width"]');
    }

    get inputHeight() {
        return this.shadowRoot.querySelector('[data-ref="height"]');
    }

    get inputTop() {
        return this.shadowRoot.querySelector('[data-ref="top"]');
    }

    get inputLeft() {
        return this.shadowRoot.querySelector('[data-ref="left"]');
    }

    get inputColor() {
        return this.shadowRoot.querySelector('[data-ref="color"]');
    }
}

const STYLES = css`
    ${EDITOR_CSS.replace("<style>", "").replace("</style>", "")}

    .frame {
        /* padding-inline: calc(((1920px - 846px) / 2) / var(--ratio));
         padding-block: calc(((1080px - 712px) / 2) / var(--ratio)); */
        --ratio: 1.5;
        box-sizing: border-box;
        width: calc(846px / var(--ratio));
        height: calc(712px / var(--ratio));
        border: solid black;
        /*border-inline-width: calc(((1920px - 846px) / 2) / var(--ratio));*/
    }

    .toggle-aspect {
        display: none;
    }

    .info,
    .settings {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
        gap: 0.5rem;
        font-size: 0.75rem;
        white-space: nowrap;
        width: 250px;
    }
    .settings {
        grid-area: right;
        justify-self: end;
    }
    fieldset {
        border: 2px solid var(--clr-bg-200);
        padding: 0.5rem;
        background: var(--clr-bg-100);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border-radius: 0.25rem;
    }
    legend {
        background: var(--clr-bg-0);
        padding: 0.25rem;
        border-radius: 0.25rem;
    }
    label {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
    }
    input {
        accent-color: var(--clr-enlightened);
    }
    input:checked {
        box-shadow: 0 0 10px 3px var(--clr-enlightened-glow);
    }
    input[type="color"] {
        background: var(--clr-bg-100);
        border: 2px solid var(--clr-bg-200);

        &:hover {
            border-color: var(--clr-enlightened);
            box-shadow:
                0 0 20px 0 var(--clr-enlightened-glow),
                0 0 10px 0 inset var(--clr-enlightened-glow);
        }
    }
    .info .warning {
        opacity: 0;
        font-size: 1.5rem;
        color: hsl(var(--hue-warning) var(--sat-alert) var(--lit-alert));
        transition: opacity var(--transition-medium) ease-in-out;
        transform: scale(0);
    }
    .info .error {
        white-space: normal;
        background: hsl(var(--hue-error) var(--sat-alert) var(--lit-alert));
        padding: 0.5rem;
        border-radius: 0.25rem;
    }
    input[type="number"] {
        max-width: 4rem;
    }
    .help dl {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-column-gap: 0.5rem;
    }
    .help dd {
        margin: 0;
    }
    :host > theme-button {
        justify-self: end;
    }
`;

Pad.template = html`
<style>
    ${STYLES}
</style>
${EDITOR_TEMPLATE}
<div class="info" data-ref="info">
    <div class="help">
        <dl>
            <dt>
                <span class="iconify" data-icon="mdi-mouse"></span> / 
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl
            </dt>
            </dt>
            <dd>Set upper left</dd>
        </dl>
    </div>
    <div class="warning height-warning" title="For best results height should be dividable by 16">
        <span class="iconify" data-icon="mdi-alert-outline"></span>
    </div>
</div>
<div class="settings">
    <fieldset>
        <legend>Cancas:</legend>
        <label>
            <span>Width</span>
            <input type="number" data-ref="width">
        </label>
        <label>
            <span>Height</span>
            <input type="number" data-ref="height">
        </label>
        <label>
            <span>Color</span>
            <input type="color" data-ref="color" value="#000000">
        </label>
    </fieldset>
    <fieldset>
        <legend>Image:</legend>
        <label>
            <span>Top</span>
            <input type="number" data-ref="top">
        </label>
        <label>
            <span>Left</span>
            <input type="number" data-ref="left">
        </label>
    </fieldset>
</div>
`;

customElements.define("dialogue-pad", Pad);
