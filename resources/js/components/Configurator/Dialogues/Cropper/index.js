import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class Cropper extends VideoEditor {
    cropOffsetTop = 0;
    cropOffsetLeft = 0;
    cropOffsetBottom = null;
    cropOffsetRight = null;
    video = null;
    aspectDecimal = 0;
    zoomed = 0;
    valid = true;

    connectedCallback() {
        super.connectedCallback();
        this.aspectDecimal = this.video.width / this.video.height;
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initCrop, {
                once: true,
            });
            this.current = parseInt(this.duration / 2, 10) ?? 0;
            this.initImages();
            this.width = parseInt(this.video.width, 10);
            this.height = parseInt(this.video.height, 10);
        });
    }

    disconnectedCallback() {
        this.image.removeEventListener("load", this.updateCropBox);
        document.removeEventListener("keydown", this.handleKey);
        document.removeEventListener("keyup", this.handleKey);
    }

    bindListeners() {
        super.bindListeners();
        this.initCrop = this.initCrop.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.updateCropBox = this.updateCropBox.bind(this);
    }

    initCrop() {
        this.image.removeEventListener("load", this.initCrop);
        this.image.addEventListener("load", this.updateCropBox);
        document.addEventListener("keydown", this.handleKey);
        document.addEventListener("keyup", this.handleKey);
        this.cropImage.addEventListener("click", this.handleClick);
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
        this.cropImage.style.backgroundImage = `${this.gradients},url("${this.image.src}")`;
        this.image.style.display = "none";
        this.info.classList.toggle(
            "height-error",
            (this.cropOffsetBottom - this.cropOffsetTop) % 16 !== 0,
        );
        this.validateDimensions();
        this.dispatchEvent(new CustomEvent("cropper-updated"));
    }

    validateDimensions() {
        const croppedWidth = this.cropOffsetRight - this.cropOffsetLeft;
        const croppedHeight = this.cropOffsetBottom - this.cropOffsetTop;
        const ratios = this.aspectRatio.split(":").map((r) => parseInt(r, 10));
        const padWidth = (croppedHeight / ratios[1]) * ratios[0];
        this.valid =
            this.replaceBlackBorders ||
            this.aspectRatio === "custom" ||
            (croppedHeight <= this.height && croppedWidth <= padWidth);
        if (this.aspectRatio === "custom") {
            this.inputHeight.value = this.cropOffsetBottom - this.cropOffsetTop;
        }
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
                    { once: true },
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
                    { once: true },
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
                    this.cropOffsetLeft + 1,
                );
                if (this.equal) {
                    this.cropOffsetRight = Math.max(
                        Math.floor(this.image.naturalWidth / 2),
                        this.image.naturalWidth - this.cropOffsetLeft,
                    );
                }
                this.updateCropBox();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.cropOffsetLeft = Math.max(0, this.cropOffsetLeft - 1);
                if (this.equal) {
                    this.cropOffsetRight = Math.max(
                        Math.floor(this.image.naturalWidth / 2),
                        this.image.naturalWidth - this.cropOffsetLeft,
                    );
                }
                this.updateCropBox();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.cropOffsetTop = Math.min(
                    Math.floor(this.image.naturalHeight / 2),
                    this.cropOffsetTop + 1,
                );
                if (this.equal) {
                    this.cropOffsetBottom = Math.max(
                        Math.floor(this.image.naturalHeight / 2),
                        this.image.naturalHeight - this.cropOffsetTop,
                    );
                }
                this.updateCropBox();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.cropOffsetTop = Math.max(0, this.cropOffsetTop - 1);
                if (this.equal) {
                    this.cropOffsetBottom = Math.min(
                        this.image.naturalHeight,
                        this.image.naturalHeight - this.cropOffsetTop,
                    );
                }
                this.updateCropBox();
            }
        }
        if (e.shiftKey && e.type === "keydown") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                this.cropOffsetRight = Math.min(
                    this.image.naturalWidth,
                    this.cropOffsetRight + 1,
                );
                if (this.equal) {
                    this.cropOffsetLeft = Math.max(
                        0,
                        this.image.naturalWidth - this.cropOffsetRight,
                    );
                }
                this.updateCropBox();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.cropOffsetRight = Math.max(
                    Math.floor(this.image.naturalWidth / 2),
                    this.cropOffsetRight - 1,
                );
                if (this.equal) {
                    if (this.equal) {
                        this.cropOffsetLeft = Math.min(
                            Math.floor(this.image.naturalWidth / 2),
                            this.image.naturalWidth - this.cropOffsetRight,
                        );
                    }
                }
                this.updateCropBox();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.cropOffsetBottom = Math.min(
                    this.image.naturalHeight,
                    this.cropOffsetBottom + 1,
                );
                if (this.equal) {
                    this.cropOffsetTop = Math.max(
                        0,
                        this.image.naturalHeight - this.cropOffsetBottom,
                    );
                }
                this.updateCropBox();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.cropOffsetBottom = Math.max(
                    Math.floor(this.image.naturalHeight / 2),
                    this.cropOffsetBottom - 1,
                );
                if (this.equal) {
                    this.cropOffsetTop = Math.min(
                        Math.floor(this.image.naturalHeight / 2),
                        this.image.naturalHeight - this.cropOffsetBottom,
                    );
                }
                this.updateCropBox();
            }
        }
    }

    handleClick(e) {
        requestAnimationFrame(() => {
            const imageRect = this.cropImage.getBoundingClientRect();
            if (this.zoomed === 1) {
                this.cropOffsetLeft = parseInt(e.pageX - imageRect.left);
                this.cropOffsetTop = parseInt(e.pageY - imageRect.top);
            } else if (this.zoomed === 2) {
                this.cropOffsetBottom = parseInt(e.pageY - imageRect.top);
                this.cropOffsetRight = parseInt(e.pageX - imageRect.left);
            }
            this.updateCropBox();
        });
    }

    get aspectRatio() {
        return (
            this.shadowRoot.querySelector('[name="input-aspect"]:checked')
                ?.value ?? this.video.display_aspect_ratio
        );
    }

    set aspectRatio(value) {
        if (["4:3", "16:9"].indexOf(value) > -1) {
            this.shadowRoot.querySelector(
                `[name="input-aspect"][value="${value}"]`,
            ).checked = true;
        } else if (value.match(/([0-9]+):([0-9]+)/)) {
            this.shadowRoot.querySelector(
                `[name="input-aspect"][value="custom"]`,
            ).checked = true;
        }
    }

    get mirror() {
        return this.inputMirror.checked;
    }

    set mirror(value) {
        this.inputMirror.checked = !!value;
    }

    get replaceBlackBorders() {
        return this.inputReplaceBlackBorders.checked;
    }

    set replaceBlackBorders(value) {
        this.inputReplaceBlackBorders.checked = !!value;
    }

    get width() {
        return parseInt(this.inputWidth.value, 10);
    }

    set width(value) {
        if (value instanceof InputEvent) {
            this.inputWidth.value = parseInt(value.target.value, 10);
        } else {
            this.inputWidth.value = parseInt(value, 10);
        }
    }

    get height() {
        return parseInt(this.inputHeight.value, 10);
    }

    set height(value) {
        if (value instanceof InputEvent) {
            this.inputHeight.value = parseInt(value.target.value, 10);
        } else {
            this.inputHeight.value = parseInt(value, 10);
        }
    }

    get replaceBlackBorders() {
        return this.inputReplaceBlackBorders.checked;
    }

    get equal() {
        return this.inputEqual.checked;
    }

    get crop() {
        return {
            cw: this.cropOffsetRight - this.cropOffsetLeft,
            ch: this.cropOffsetBottom - this.cropOffsetTop,
            cx: this.cropOffsetLeft,
            cy: this.cropOffsetTop,
            width: this.width,
            height: this.height,
            aspect:
                this.aspectRatio === "custom"
                    ? `${this.cropOffsetRight - this.cropOffsetLeft}:${
                          this.cropOffsetBottom - this.cropOffsetTop
                      }`
                    : this.aspectRatio,
            type: this.type,
            replaceBlackBorders: this.replaceBlackBorders,
            mirror: this.inputMirror.checked,
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

    applyFilterData(data) {
        this.crop = data;
        this.updateCropBox();
    }
}

Cropper.template = html`
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
        gap: .5rem;
        font-size: .75rem;
        white-space: nowrap;
        width: 250px;
    }
    fieldset {
        border: 2px solid var(--clr-bg-200);
        padding: .5rem;
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
        font-size: 1.5rem;
        color: hsl(var(--hue-warning) var(--sat-alert) var(--lit-alert));
        transition: opacity var(--transition-medium) ease-in-out;
        transform: scale(0);
    }
    .info .error {
        white-space: normal;
        background: hsl(var(--hue-error) var(--sat-alert) var(--lit-alert));
        padding: .5rem;
        border-radius: .25rem;
    }
    .height-error .height-warning {
        opacity: 1;
        transform: scale(1);
    }
    input[type="number"] {
        max-width: 4rem;
    }
    .help dl {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-column-gap: .5rem;
    }
    .help dd {
        margin: 0;
    }
    :host > theme-button {
        justify-self: end;
    }
</style>
${EDITOR_TEMPLATE}
<div #ref="cropOverlay" class="crop"><div #ref="cropImage"></div></div>
<div class="info" #ref="info">
    <div *if="{{ !this.valid }}" class="error">
        Resulting video does not fit into target aspect ratio;
    </div>
    <fieldset>
        <legend>Scale:</legend>
        <label>
            <span>Width:</span>
            <input type="number" #ref="inputWidth">
        </label>
        <label>
            <span>Height:</span>
            <input type="number" #ref="inputHeight">
        </label>
        <label>
            <span>Replace Borders</span>
            <input type="checkbox" name="replaceBlackBorders" #ref="inputReplaceBlackBorders" @change="{{ this.validateDimensions() }}" checked="checked">
        </label>
        <label>
            <span>Mirror</span>
            <input type="checkbox" name="mirror" #ref="inputMirror">
        </label>
        <label>
            <span>Equal Borders</span>
            <input type="checkbox" name="equal" #ref="inputEqual" checked="checked">
        </label>
    </fieldset>
    <fieldset class="aspect-ratio">
        <legend>Aspect Ratio:</legend>
        <label>
            <span>4:3</span>
            <input type="radio" name="input-aspect" value="4:3" @change="{{ this.validateDimensions() }}">
        </label>
        <label>
            <span>16:9</span>
            <input type="radio" name="input-aspect" value="16:9" @change="{{ this.validateDimensions() }}">
        </label>
        <label>
            <span>Custom ({{ this.cropOffsetRight - this.cropOffsetLeft }}x{{ this.cropOffsetBottom - this.cropOffsetTop }})</span>
            <input type="radio" name="input-aspect" value="custom" @change="{{ this.validateDimensions() }}">
        </label>
    </fieldset>
    <fieldset>
        <legend>Crop Box:</legend>
        <label><span>w:h</span><span>{{ this.cropOffsetRight - this.cropOffsetLeft }}:{{ this.cropOffsetBottom - this.cropOffsetTop }}</span></label>
        <label><span>x:y</span><span>{{ this.cropOffsetLeft }}:{{ this.cropOffsetTop }}</span></label>
    </fieldset>
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
        <dl>
            <dt>
                <span class="iconify" data-icon="mdi-mouse"></span> / 
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Shift
            </dt>
            <dd>Set lower right</dd>
        </dl>
    </div>
    <div *v-if="{{ this.divisionBySixteenError }}" class="warning height-warning" title="For best results height should be dividable by 16">
        <span class="iconify" data-icon="mdi-alert-outline"></span>
    </div>
</div>
`;

customElements.define("dialogue-cropper", Cropper);
