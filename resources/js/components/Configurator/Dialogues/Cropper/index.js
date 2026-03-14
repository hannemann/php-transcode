import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { Crop as Model } from "../../../../Models/Filters/Crop";

class Cropper extends VideoEditor {
    video = null;
    zoomed = 0; // 0: none, 1: top-left, 2: bottom-right
    #model;

    connectedCallback() {
        super.connectedCallback();
        requestAnimationFrame(() => {
            this.current = Math.floor(this.duration / 2) || 0;
            this.updateImages();
            this.image.addEventListener("load", this.initCrop, { once: true });
        });
    }

    bindListeners() {
        super.bindListeners();
        this.initCrop = this.initCrop.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.updateCropBox = this.updateCropBox.bind(this);
    }

    initCrop() {
        // Initialer Ausschnitt: Vollbild, falls nichts gesetzt
        this.cropOffsetTop ??= 0;
        this.cropOffsetLeft ??= 0;
        this.cropOffsetBottom ??= this.image.naturalHeight;
        this.cropOffsetRight ??= this.image.naturalWidth;
        this.updateCropBox();
        this.dispatchEvent(new CustomEvent("cropper-initialized"));
        this.cropImage.style.aspectRatio = this.aspectRatio.replace(":", "/");
    }

    addListeners() {
        super.addListeners();
        this.image.addEventListener("load", this.updateCropBox);
        document.addEventListener("keydown", this.handleKey);
        document.addEventListener("keyup", this.handleKey);
        this.cropImage.addEventListener("click", this.handleClick);
    }

    removeListeners() {
        super.removeListeners();
        this.image.removeEventListener("load", this.updateCropBox);
        document.removeEventListener("keydown", this.handleKey);
        document.removeEventListener("keyup", this.handleKey);
        this.cropImage.removeEventListener("click", this.handleClick);
    }

    updateCropBox() {
        // Visualisierung via CSS Gradients auf dem Vorschaubild
        this.cropImage.style.backgroundImage = `${this.gradients},url("${this.image.src}")`;

        // Anzeige der aktuellen Werte aktualisieren
        this.displayXY.innerText = `${this.#model.cx} , ${this.#model.cy}`;
        this.displayWH.innerText = `${this.#model.cw} x ${this.#model.ch}`;

        this.dispatchEvent(new CustomEvent("cropper-updated"));
    }

    get gradients() {
        const t = (100 / this.image.naturalHeight) * this.cropOffsetTop;
        const b = (100 / this.image.naturalHeight) * this.cropOffsetBottom;
        const l = (100 / this.image.naturalWidth) * this.cropOffsetLeft;
        const r = (100 / this.image.naturalWidth) * this.cropOffsetRight;

        return [
            `linear-gradient(180deg, var(--clr-cropper-gradient) ${t}%, transparent ${t}%)`,
            `linear-gradient(180deg, transparent ${b}%, var(--clr-cropper-gradient) ${b}%)`,
            `linear-gradient(90deg, var(--clr-cropper-gradient) ${l}%, transparent ${l}%)`,
            `linear-gradient(90deg, transparent ${r}%, var(--clr-cropper-gradient) ${r}%)`,
        ].join(",");
    }

    handleKey(e) {
        // Zoom-Modus für präzises Klicken (Ctrl = Oben/Links, Shift = Unten/Rechts)
        if (e.key === "Control" || e.key === "Shift") {
            if (e.type === "keydown") {
                this.zoomed = e.key === "Control" ? 1 : 2;
                this.cropImage.style.width = `${this.image.naturalWidth}px`;
                this.cropImage.style.height = `${this.image.naturalHeight}px`;
                if (e.key === "Shift")
                    this.cropImage.style.inset = "auto 0 0 auto";
            } else {
                this.zoomed = 0;
                this.cropImage.style.width = "";
                this.cropImage.style.height = "";
                this.cropImage.style.inset = "";
            }
            return;
        }

        // Pfeiltasten-Steuerung
        if (e.type !== "keydown") return;
        const step = 1;

        if (e.ctrlKey) {
            // Move Top-Left
            e.preventDefault();
            if (e.key === "ArrowRight")
                this.cropOffsetLeft = Math.min(
                    this.cropOffsetRight - 10,
                    this.cropOffsetLeft + step,
                );
            if (e.key === "ArrowLeft")
                this.cropOffsetLeft = Math.max(0, this.cropOffsetLeft - step);
            if (e.key === "ArrowDown")
                this.cropOffsetTop = Math.min(
                    this.cropOffsetBottom - 10,
                    this.cropOffsetTop + step,
                );
            if (e.key === "ArrowUp")
                this.cropOffsetTop = Math.max(0, this.cropOffsetTop - step);
        } else if (e.shiftKey) {
            // Move Bottom-Right
            e.preventDefault();
            if (e.key === "ArrowRight")
                this.cropOffsetRight = Math.min(
                    this.image.naturalWidth,
                    this.cropOffsetRight + step,
                );
            if (e.key === "ArrowLeft")
                this.cropOffsetRight = Math.max(
                    this.cropOffsetLeft + 10,
                    this.cropOffsetRight - step,
                );
            if (e.key === "ArrowDown")
                this.cropOffsetBottom = Math.min(
                    this.image.naturalHeight,
                    this.cropOffsetBottom + step,
                );
            if (e.key === "ArrowUp")
                this.cropOffsetBottom = Math.max(
                    this.cropOffsetTop + 10,
                    this.cropOffsetBottom - step,
                );
        }
        this.updateCropBox();
    }

    handleClick(e) {
        const rect = this.cropImage.getBoundingClientRect();
        const x = Math.round(e.pageX - rect.left);
        const y = Math.round(e.pageY - rect.top);

        if (this.zoomed === 1) {
            this.cropOffsetLeft = x;
            this.cropOffsetTop = y;
        } else if (this.zoomed === 2) {
            this.cropOffsetRight = x;
            this.cropOffsetBottom = y;
        }
        this.updateCropBox();
    }

    /**
     * @return {Model}
     */
    get crop() {
        return this.#model;
    }

    /**
     * @param {Model} model
     */
    set crop(model) {
        this.#model = model;
    }

    /* Element Accessors */
    get cropImage() {
        return this.shadowRoot.querySelector('[data-ref="cropImage"]');
    }
    get displayWH() {
        return this.shadowRoot.querySelector('[data-type="wh"]');
    }
    get displayXY() {
        return this.shadowRoot.querySelector('[data-type="xy"]');
    }

    // --- TOP / BOTTOM (Y-Achse) ---
    set cropOffsetTop(v) {
        const currentBottom = this.cropOffsetBottom; // Den aktuellen Endpunkt halten
        this.#model.cy = v;
        if (currentBottom !== null) {
            this.#model.ch = Math.max(0, currentBottom - v);
        }
    }
    get cropOffsetTop() {
        return this.#model.cy;
    }

    set cropOffsetBottom(v) {
        // v ist die absolute Y-Koordinate der unteren Kante
        this.#model.ch = Math.max(0, v - this.#model.cy);
    }
    get cropOffsetBottom() {
        if (this.#model.ch === null) return null;
        return this.#model.cy + this.#model.ch; // Absolute Position
    }

    // --- LEFT / RIGHT (X-Achse) ---
    set cropOffsetLeft(v) {
        const currentRight = this.cropOffsetRight; // Den aktuellen Endpunkt halten
        this.#model.cx = v;
        if (currentRight !== null) {
            this.#model.cw = Math.max(0, currentRight - v);
        }
    }
    get cropOffsetLeft() {
        return this.#model.cx;
    }

    set cropOffsetRight(v) {
        // v ist die absolute X-Koordinate der rechten Kante
        this.#model.cw = Math.max(0, v - this.#model.cx);
    }
    get cropOffsetRight() {
        if (this.#model.cw === null) return null;
        return this.#model.cx + this.#model.cw; // Absolute Position
    }
}

const CSS = css`
    .crop {
        grid-area: frame;
        justify-self: center;
        cursor: crosshair;
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
    }
    .crop div {
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        background-size: 100%;
        background-repeat: no-repeat;
    }
    .info {
        grid-area: left;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-size: 0.85rem;
    }
    fieldset {
        border: 1px solid var(--clr-bg-300);
        padding: 0.75rem;
        border-radius: 4px;
    }
    .help dl {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem;
        margin: 0;
    }
`;

Cropper.template = html`
    <style>
        ${EDITOR_CSS}
        ${CSS}
    </style>
    ${EDITOR_TEMPLATE}
    <div class="crop">
        <div data-ref="cropImage"></div>
    </div>
    <div class="info">
        <fieldset>
            <legend>Ausschnitt (px)</legend>
            <div style="display: flex; justify-content: space-between;">
                <span>Größe:</span><b data-type="wh"></b>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Position:</span><b data-type="xy"></b>
            </div>
        </fieldset>
        <div class="help">
            <dl>
                <dt><kbd>Ctrl</kbd> + Click</dt>
                <dd>Obere linke Ecke setzen</dd>
                <dt><kbd>Shift</kbd> + Click</dt>
                <dd>Untere rechte Ecke setzen</dd>
                <dt><kbd>Ctrl</kbd> + ⇅⇆</dt>
                <dd>Ecke O/L verschieben</dd>
                <dt><kbd>Shift</kbd> + ⇅⇆</dt>
                <dd>Ecke U/R verschieben</dd>
            </dl>
        </div>
    </div>
`;

customElements.define("dialogue-cropper", Cropper);
