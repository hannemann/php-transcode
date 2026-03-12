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
    /**
     *
     * @param {Pad} pad
     * @param {HTMLElement} target
     */
    standards: (pad, target) => {
        pad.canvasWidth = target.value.split(":").shift();
        pad.canvasHeight = target.value.split(":").pop();
        pad.centerImage();
    },
    top: (pad, target) => (pad.top = target.value),
    left: (pad, target) => (pad.left = target.value),
    width: (pad, target) => (pad.canvasWidth = target.value),
    height: (pad, target) => (pad.canvasHeight = target.value),
    color: (pad, target) => (pad.color = target.value),
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
    #centerButton;

    #isDragging;
    #startX;
    #startY;
    #startLeft;
    #startTop;

    #imageSizeObserver;

    connectedCallback() {
        super.connectedCallback();
        this.#imageSizeObserver = new ResizeObserver((entries) => {
            this.image.style.setProperty(
                "--imageBorderSizeInline",
                `${Math.round(entries[0].borderBoxSize[0].inlineSize)}px`,
            );
        });
        this.#imageSizeObserver.observe(this.image);

        // Initiales Zentrieren, falls noch keine Position gesetzt ist
        // Wir warten kurz, damit die DOM-Werte bereit sind
        requestAnimationFrame(() => {
            if (this.left === 0 && this.top === 0) {
                this.centerImage();
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#imageSizeObserver.disconnect();
    }

    bindListeners() {
        super.bindListeners();
        this.startDrag = this.startDrag.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.centerImage = this.centerImage.bind(this);
    }

    addListeners() {
        super.addListeners();
        this.inputStandards.addEventListener("change", this);
        this.inputWidth.addEventListener("change", this);
        this.inputHeight.addEventListener("change", this);
        this.inputTop.addEventListener("change", this);
        this.inputLeft.addEventListener("change", this);
        this.inputColor.addEventListener("change", this);

        this.image.addEventListener("mousedown", this.startDrag);
        window.addEventListener("mousemove", this.onDrag);
        window.addEventListener("mouseup", this.stopDrag);

        this.centerButton.addEventListener("click", this.centerImage);
    }

    removeListeners() {
        super.removeListeners();
        this.inputStandards.removeEventListener("change", this);
        this.inputWidth.removeEventListener("change", this);
        this.inputHeight.removeEventListener("change", this);
        this.inputTop.removeEventListener("change", this);
        this.inputLeft.removeEventListener("change", this);
        this.inputColor.removeEventListener("change", this);

        this.image.removeEventListener("mousedown", this.startDrag);
        window.removeEventListener("mousemove", this.onDrag);
        window.removeEventListener("mouseup", this.stopDrag);

        this.centerButton.removeEventListener("click", this.centerImage);
    }

    centerImage() {
        this.left = Math.round((this.canvasWidth - this.imgWidth) / 2);
        this.top = Math.round((this.canvasHeight - this.imgHeight) / 2);
    }

    startDrag(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        this.#isDragging = true;
        this.#startX = e.clientX;
        this.#startY = e.clientY;
        this.#startLeft = this.left;
        this.#startTop = this.top;
        this.image.style.cursor = "grabbing";
    }

    onDrag(e) {
        if (!this.#isDragging) return;
        e.preventDefault();

        const rect = this.image.getBoundingClientRect();

        const factorX = this.canvasWidth / rect.width;
        const factorY = this.canvasHeight / rect.height;

        const deltaX = (e.clientX - this.#startX) * factorX;
        const deltaY = (e.clientY - this.#startY) * factorY;

        // 1. Neue Werte vorläufig berechnen
        let newLeft = Math.round(this.#startLeft + deltaX);
        let newTop = Math.round(this.#startTop + deltaY);

        // 2. Grenzen berechnen
        // Das Bild darf nicht aus dem Canvas herausgeschoben werden
        const maxLeft = this.canvasWidth - this.imgWidth;
        const maxTop = this.canvasHeight - this.imgHeight;

        // 3. Werte begrenzen
        this.left = Math.max(0, Math.min(newLeft, maxLeft));
        this.top = Math.max(0, Math.min(newTop, maxTop));
    }

    stopDrag() {
        this.#isDragging = false;
        this.image.style.cursor = "crosshair";
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
        this.inputWidth.value = this.canvasWidth;
    }

    get canvasHeight() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--canvas-h"),
        );
    }

    set canvasHeight(value) {
        this.image.style.setProperty("--canvas-h", Number(value));
        this.inputHeight.value = this.canvasHeight;
    }

    get top() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--offset-y"),
        );
    }

    set top(value) {
        this.image.style.setProperty("--offset-y", Number(value));
        this.inputTop.value = Number(value);
    }

    get left() {
        return Number(
            getComputedStyle(this.image).getPropertyValue("--offset-x"),
        );
    }

    set left(value) {
        this.image.style.setProperty("--offset-x", Number(value));
        this.inputLeft.value = Number(value);
    }

    get color() {
        return getComputedStyle(this.image).getPropertyValue("--color-bg");
    }

    set color(value) {
        this.image.style.setProperty("--color-bg", String(value));
    }

    get imgWidth() {
        return Number(getComputedStyle(this.image).getPropertyValue("--img-w"));
    }

    set imgWidth(value) {
        this.image.style.setProperty("--img-w", Number(value));
    }

    get imgHeight() {
        return Number(getComputedStyle(this.image).getPropertyValue("--img-h"));
    }

    set imgHeight(value) {
        this.image.style.setProperty("--img-h", Number(value));
    }

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

    get centerButton() {
        return (this.#centerButton ??= this.shadowRoot.querySelector(
            '[data-ref="center"]',
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

        /* 2. Die logischen Koordinaten als CSS-Variablen * /
        --canvas-w: 1920; /* 16:9 * /
        --canvas-w: 1440; /*  4:3 * /
        --canvas-h: 1080;
        --img-w: 632;
        --img-h: 649;
        --offset-x: 200;
        --offset-y: 100;
        */

        --padding-percent: min(var(--imageBorderSizeInline), 100%);

        /* 3. Padding berechnen (Prozentual zum Canvas) */
        /* Da Padding-Top/Bottom in % sich auf die Breite beziehen, 
       nutzen wir einen Trick für die vertikale Positionierung */
        padding-left: calc(
            var(--offset-x) / var(--canvas-w) * var(--padding-percent)
        );
        padding-top: calc(
            var(--offset-y) / var(--canvas-h) *
                (var(--padding-percent) / (var(--canvas-w) / var(--canvas-h)))
        );

        /* 4. Größe des Bild-Inhalts einschränken */
        /* Wir berechnen, wie viel Platz das Bild im Vergleich zum Canvas einnimmt */
        padding-right: calc(
            (var(--canvas-w) - var(--img-w) - var(--offset-x)) /
                var(--canvas-w) * var(--padding-percent)
        );
        padding-bottom: calc(
            (var(--canvas-h) - var(--img-h) - var(--offset-y)) /
                var(--canvas-h) *
                (var(--padding-percent) / (var(--canvas-w) / var(--canvas-h)))
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
                <option value="1920:1080" selected="selected">1080p</option>
                <option value="1280:720">720p</option>
                <option value="1024:576">576p</option>
                <option value="768:480">480p</option>
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
        <legend>Image:</legend>
        <label>
            <span>Top</span>
            <input type="number" data-ref="top">
        </label>
        <label>
            <span>Left</span>
            <input type="number" data-ref="left">
        </label>
        <label>
            <span>Center</span>
            <theme-button data-ref="center">Center</theme-button>
        </label>
    </fieldset>
</div>
`;

customElements.define("dialogue-pad", Pad);
