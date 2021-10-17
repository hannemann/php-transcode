import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class Cropper extends VideoEditor {
    constructor() {
        super();
        this.cropOffsetTop = 0;
        this.cropOffsetLeft = 0;
        this.cropOffsetBottom = null;
        this.cropOffsetRight = null;
        this.video = null;
        this.aspectDecimal = 0;
        this.zoomed = 0;
    }

    bindListeners() {
        super.bindListeners();
        this.initCrop = this.initCrop.bind(this);
        this.setHeight = this.setHeight.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.updateCropBox = this.updateCropBox.bind(this);
        this.setAspectRatio = this.setAspectRatio.bind(this);
    }

    onAdded() {
        this.start = parseFloat(this.video.start_time);
        this.width = parseInt(this.video.width, 10);
        this.height = parseInt(this.video.height, 10);
        this.aspect = this.video.display_aspect_ratio;
        this.aspectDecimal = this.width / this.height;
        super.onAdded();
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initCrop, {
                once: true,
            });
            this.initImages();
        });
    }

    onRemoved() {
        this.image.removeEventListener("load", this.updateCropBox);
    }

    initCrop() {
        this.image.removeEventListener("load", this.initCrop);
        this.image.addEventListener("load", this.updateCropBox);
        document.addEventListener("keydown", this.handleKey);
        document.addEventListener("keyup", this.handleKey);
        this.cropOverlay.addEventListener("click", this.handleClick);
        if (this.cropOffsetBottom === null) {
            this.cropOffsetBottom = this.image.naturalHeight;
        }
        if (this.cropOffsetRight === null) {
            this.cropOffsetRight = this.image.naturalWidth;
        }
        this.updateCropBox();
    }

    updateCropBox() {
        this.image.style.display = "block";
        if (!this.zoomed) {
            this.cropOverlay.style.width = `${this.image.offsetWidth}px`;
            this.cropOverlay.style.height = `${this.image.offsetHeight}px`;
        }
        this.cropImage.style.backgroundImage = `${this.gradients},url(${this.image.src})`;
        this.image.style.display = "none";
        this.info.classList.toggle(
            "height-error",
            (this.cropOffsetBottom - this.cropOffsetTop) % 16 !== 0
        );
    }

    get gradients() {
        let top = `linear-gradient(180deg, var(--clr-cropper-gradient) ${this.cropPercentTop}%, transparent ${this.cropPercentTop}%)`;
        let bottom = `linear-gradient(180deg, transparent ${this.cropPercentBottom}%, var(--clr-cropper-gradient) ${this.cropPercentBottom}%)`;
        let left = `linear-gradient(90deg, var(--clr-cropper-gradient) ${this.cropPercentLeft}%, transparent ${this.cropPercentLeft}%)`;
        let right = `linear-gradient(90deg, transparent ${this.cropPercentRight}%, var(--clr-cropper-gradient) ${this.cropPercentRight}%)`;
        return [top, bottom, left, right].join(",");
    }

    get cropPercentTop() {
        return (100 / this.image.naturalHeight) * this.cropOffsetTop;
    }

    get cropPercentBottom() {
        return (100 / this.image.naturalHeight) * this.cropOffsetBottom;
    }

    get cropPercentLeft() {
        return (100 / this.image.naturalWidth) * this.cropOffsetLeft;
    }

    get cropPercentRight() {
        return (100 / this.image.naturalWidth) * this.cropOffsetRight;
    }

    handleKey(e) {
        if (e.key === "Control" || e.key === "Shift") {
            if (e.type === "keydown") {
                this.cropImage.addEventListener(
                    "transitionend",
                    () => {
                        this.zoomed = e.key === "Control" ? 1 : 2;
                    },
                    { once: true }
                );
                this.cropImage.style.width = `${this.image.naturalWidth}px`;
                this.cropImage.style.height = `${this.image.naturalHeight}px`;
                if (e.key === "Shift") {
                    this.cropImage.style.inset = "auto 0 0 auto";
                }
            } else {
                this.cropImage.addEventListener(
                    "transitionend",
                    () => {
                        this.cropImage.style.inset = "";
                        this.zoomed = 0;
                    },
                    { once: true }
                );
                this.cropImage.style.width = "";
                this.cropImage.style.height = "";
            }
        }
        if (e.ctrlKey && e.type === "keydown") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                this.cropOffsetLeft = Math.min(
                    Math.floor(this.image.naturalWidth / 2),
                    this.cropOffsetLeft + 1
                );
                this.updateCropBox();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.cropOffsetLeft = Math.max(0, this.cropOffsetLeft - 1);
                this.updateCropBox();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.cropOffsetTop = Math.min(
                    Math.floor(this.image.naturalHeight / 2),
                    this.cropOffsetTop + 1
                );
                this.updateCropBox();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.cropOffsetTop = Math.max(0, this.cropOffsetTop - 1);
                this.updateCropBox();
            }
        }
        if (e.shiftKey && e.type === "keydown") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                this.cropOffsetRight = Math.min(
                    this.image.naturalWidth,
                    this.cropOffsetRight + 1
                );
                this.updateCropBox();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.cropOffsetRight = Math.max(
                    Math.floor(this.image.naturalWidth / 2),
                    this.cropOffsetRight - 1
                );
                this.updateCropBox();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.cropOffsetBottom = Math.min(
                    this.image.naturalHeight,
                    this.cropOffsetBottom + 1
                );
                this.updateCropBox();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.cropOffsetBottom = Math.max(
                    Math.floor(this.image.naturalHeight / 2),
                    this.cropOffsetBottom - 1
                );
                this.updateCropBox();
            }
        }
    }

    handleClick(e) {
        if (this.zoomed === 1) {
            this.cropOffsetLeft = e.layerX;
            this.cropOffsetTop = e.layerY;
        } else if (this.zoomed === 2) {
            this.cropOffsetBottom = e.layerY;
            this.cropOffsetRight = e.layerX;
        }
        this.updateCropBox();
    }

    setAspectRatio(value) {
        if (value instanceof Event) {
            this.aspect = value.target.value;
        } else {
            this.aspect = value;
        }
    }

    setHeight(value) {
        if (value instanceof InputEvent) {
            this.height = parseInt(value.target.value, 10);
        } else {
            this.height = parseInt(value, 10);
        }
    }

    get crop() {
        return {
            cw: this.cropOffsetRight - this.cropOffsetLeft,
            ch: this.cropOffsetBottom - this.cropOffsetTop,
            cx: this.cropOffsetLeft,
            cy: this.cropOffsetTop,
            height: parseInt(this.inputHeight.value, 10),
            aspect: this.shadowRoot.querySelector(
                '[name="input-aspect"]:checked'
            )?.value,
        };
    }

    set crop(crop) {
        this.cropOffsetTop = crop.cy ?? 0;
        this.cropOffsetLeft = crop.cx ?? 0;
        if (typeof crop.cy !== "undefined" && typeof crop.ch !== "undefined") {
            this.cropOffsetBottom = crop.cy + crop.ch;
        }
        if (typeof crop.cx !== "undefined" && typeof crop.cw !== "undefined") {
            this.cropOffsetRight = crop.cx + crop.cw;
        }
    }
}

Cropper.template = /*html*/ `
${EDITOR_CSS}
<style>
    .toggle-aspect {
        display: none;
    }
    .crop {
        box-sizing: border-box;
        grid-area: frame;
        border: 0 solid hsla(0 50% 50% / .5);
        justify-self: center;
        cursor: crosshair;
        position: relative;
        overflow: hidden;
    }
    .crop div {
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        height: 100%;
        transition: 250ms ease-in-out;
        background-size: 100%;
        background-blend-mode: lighten;
    }

    .info {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
    }
    fieldset {
        border: 2px solid var(--clr-bg-200);
        padding: 1rem;
        background: var(--clr-bg-100);
        display: flex;
        flex-direction: column;
        gap: .5rem;
        border-radius: 0.25rem;
    }
    legend {
        background: var(--clr-bg-0);
        padding: .25rem;
        border-radius: 0.25rem;
    }
    label {
        display: flex;
        justify-content: space-between;
        gap: .5rem;
    }
    input {
        accent-color: var(--clr-enlightened);
    }
    input:checked {
        box-shadow: 0 0 10px 3px var(--clr-enlightened-glow);
    }
    .info .warning {
        opacity: 0;
        font-size: 3rem;
        color: hsl(var(--hue-warning) var(--sat-alert) var(--lit-alert));
        transition: opacity var(--transition-medium) ease-in-out;
        transform: scale(0);
    }
    .height-error .height-warning {
        opacity: 1;
        transform: scale(1);
    }
    input[type="number"] {
        max-width: 4rem;
    }
</style>
${EDITOR_TEMPLATE}
<div #ref="cropOverlay" class="crop"><div #ref="cropImage"></div></div>
<div class="info" #ref="info">
    <fieldset>
        <legend>Scale:</legend>
        <label>
            <span>Height:</span>
            <input type="number" #ref="inputHeight" @input="{{ this.setHeight }}" value="{{ this.height }}">
        </label>
    </fieldset>
    <fieldset class="aspect-ratio">
        <legend>Aspect Ratio:</legend>
        <label>
            <span>4:3</span>
            <input type="radio" name="input-aspect" .checked="{{ this.aspect === '4:3' }}" @change="{{ this.setAspectRatio }}" value="4:3">
        </label>
        <label>
            <span>16:9</span>
            <input type="radio" name="input-aspect" .checked="{{ this.aspect === '16:9' }}" @change="{{ this.setAspectRatio }}" value="16:9">
        </label>
    </fieldset>
    <fieldset>
        <legend>Crop Box:</legend>
        <label>{{ this.cropOffsetRight - this.cropOffsetLeft }} x {{ this.cropOffsetBottom - this.cropOffsetTop }}</label>
        <label>{{ this.cropOffsetLeft }} / {{ this.cropOffsetTop }}</label>
    </fieldset>
    <div class="warning height-warning" title="For best results height should be dividable by 16"><span class="iconify" data-icon="mdi-alert-outline"></span></div>
</div>
`;

customElements.define("dialogue-cropper", Cropper);
