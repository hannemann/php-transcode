import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { COMBO_BUTTON_CSS } from "@/components/partials";

const KEY_ACTIONS = {
    // resize
    ArrowRight: (ed, d) => ed.resizeBox(d, 0),
    ArrowLeft: (ed, d) => ed.resizeBox(-d, 0),
    ArrowUp: (ed, d) => ed.resizeBox(0, -d),
    ArrowDown: (ed, d) => ed.resizeBox(0, d),

    // move (Ctrl)
    "ctrl+ArrowRight": (ed, d) => ed.moveBox(d, 0),
    "ctrl+ArrowLeft": (ed, d) => ed.moveBox(-d, 0),
    "ctrl+ArrowUp": (ed, d) => ed.moveBox(0, -d),
    "ctrl+ArrowDown": (ed, d) => ed.moveBox(0, d),
};

const INPUT_ACTIONS = {
    standards: (pad, target) => (pad.canvasHeight = target.value),
    top: (pad, target) => (pad.top = target.value),
    left: (pad, target) => (pad.left = target.value),
    width: (pad, target) => (pad.canvasWidth = target.value),
    height: (pad, target) => (pad.canvasHeight = target.value),
    "aspect-x": (pad, target) => (pad.aspectX = target.value),
    "aspect-y": (pad, target) => (pad.aspectY = target.value),
};

class Pad extends VideoEditor {
    #inputStandards;
    #inputWidth;
    #inputHeight;
    #inputTop;
    #inputLeft;
    #inputColor;
    #inputAspectX;
    #inputAspectY;

    connectedCallback() {
        super.connectedCallback();
    }

    bindListeners() {
        super.bindListeners();
    }

    addListeners() {
        super.addListeners();
        this.inputStandards.addEventListener("change", this);
    }

    removeListeners() {
        super.removeListeners();
    }

    handleEvent(e) {
        if (e.type === "change") {
            const action = INPUT_ACTIONS[e.currentTarget.dataset.ref];
            if (action) {
                action(this, e.currentTarget);
            }
        }
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

    get canvasWidth() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--canvas-w"),
        );
    }

    set canvasWidth(value) {
        this.image.style.setProperty("--canvas-w", Number(value));
    }

    get canvasHeight() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--canvas-h"),
        );
    }

    set canvasHeight(value) {
        this.image.style.setProperty("--canvas-h", Number(value));
    }

    get top() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--offset-y"),
        );
    }

    set top(value) {
        this.image.style.setProperty("--offset-y", Number(value));
    }

    get left() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--offset-x"),
        );
    }

    set left(value) {
        this.image.style.setProperty("--offset-x", Number(value));
    }

    get color() {
        return getComputedStyle(this.image).getPropertyValue("--color-bg");
    }

    set color(value) {
        this.image.style.setProperty("--color-bg", String(value));
    }

    get aspectX() {
        return Number(this.aspectX.value);
    }

    set aspectX(value) {}

    get aspectY() {
        return Number(this.aspectY.value);
    }

    set aspectY(value) {}

    get inputStandards() {
        return (this.#inputStandards ??= this.shadowRoot.querySelector(
            '[data-ref="standards"]',
        ));
    }

    get inputWidth() {
        return (this.#inputWidth ??=
            this.shadowRoot.querySelector('[data-ref="width"]'));
    }

    get inputHeight() {
        return (this.#inputHeight ??= this.shadowRoot.querySelector(
            '[data-ref="height"]',
        ));
    }

    get inputTop() {
        return (this.#inputTop ??=
            this.shadowRoot.querySelector('[data-ref="top"]'));
    }

    get inputLeft() {
        return (this.#inputLeft ??=
            this.shadowRoot.querySelector('[data-ref="left"]'));
    }

    get inputColor() {
        return (this.#inputColor ??=
            this.shadowRoot.querySelector('[data-ref="color"]'));
    }

    get inputAspectX() {
        return (this.#inputAspectX ??= this.shadowRoot.querySelector(
            '[data-ref="aspect-x"]',
        ));
    }

    get inputAspectY() {
        return (this.#inputAspectY ??= this.shadowRoot.querySelector(
            '[data-ref="aspect-y"]',
        ));
    }
}

const STYLES = css`
    :host {
        grid-template-columns: auto 1fr 1fr;
    }
    .frame {
        --color-bg: black;
        grid-column: span 2;

        /* 1. Das "Spielfeld" festlegen */
        /*width: 100%; /* Oder was auch immer die Breite vorgibt */
        /*aspect-ratio: var(--aspect-x, 16) / var(--aspect-y, 9); /* Entspricht 1920x1080 */
        box-sizing: border-box;
        display: block;
        background-color: var(--color-bg);

        /* 2. Die logischen Koordinaten als CSS-Variablen */
        --canvas-w: 1920; /* 16:9 */
        --canvas-w: 1440; /*  4:3 */
        --canvas-h: 1080;
        --img-w: 632;
        --img-h: 649;
        --offset-x: 200;
        --offset-y: 100;

        /* 3. Padding berechnen (Prozentual zum Canvas) */
        /* Da Padding-Top/Bottom in % sich auf die Breite beziehen, 
       nutzen wir einen Trick für die vertikale Positionierung */
        padding-left: calc(var(--offset-x) / var(--canvas-w) * 100%);
        padding-top: calc(
            var(--offset-y) / var(--canvas-h) *
                (100% / (var(--canvas-w) / var(--canvas-h)))
        );

        /* 4. Größe des Bild-Inhalts einschränken */
        /* Wir berechnen, wie viel Platz das Bild im Vergleich zum Canvas einnimmt */
        padding-right: calc(
            (var(--canvas-w) - var(--img-w) - var(--offset-x)) /
                var(--canvas-w) * 100%
        );
        padding-bottom: calc(
            (var(--canvas-h) - var(--img-h) - var(--offset-y)) /
                var(--canvas-h) * (100% / (var(--canvas-w) / var(--canvas-h)))
        );

        /* 5. Bild einpassen */
        object-fit: fill;
    }

    .toggle-aspect {
        display: none;
    }

    .info {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
        gap: 0.5rem;
        font-size: 0.75rem;
        white-space: nowrap;
        width: 250px;
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
    ${COMBO_BUTTON_CSS}
    ${EDITOR_CSS}
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
    <fieldset>
        <legend>Canvas:</legend>
        <label>
            <span>Color</span>
            <input type="color" data-ref="color" value="#000000">
        </label>
        <label>
            <span>Standards:</span>
            <combo-button data-ref="standards">
                <option value="1080p" selected="selected">1080p</option>
                <option value="720p">720p</option>
                <option value="576p">576p</option>
                <option value="480p">480p</option>
            </combo-button>
        </label>
        <label>
            <span>Width</span>
            <input type="number" data-ref="width">
        </label>
        <label>
            <span>Height</span>
            <input type="number" data-ref="height">
        </label>
    </fieldset>
    <fieldset>
        <legend>Canvas Aspect Ratio</legend>
        <label>
            <theme-button data-ref="16:9">16:9</theme-button>
            <theme-button data-ref="4:3">4:3</theme-button>
        </label>
        <label>
            <input type="number" data-ref="aspect-x">:
            <input type="number" data-ref="aspect-y">
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
