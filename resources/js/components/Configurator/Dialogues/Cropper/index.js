import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class Cropper extends VideoEditor {
    constructor() {
        super();
        this.cropOffsetTop = 0;
        this.cropOffsetLeft = 0;
        this.cropOffsetBottom = 0;
        this.cropOffsetRight = 0;
        this.aspect = "Native";
        this.aspectDecimal = 0;
        this.zoomed = 0;
    }

    bindListeners() {
        super.bindListeners();
        this.initCrop = this.initCrop.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.updateCropBox = this.updateCropBox.bind(this);
    }

    onAdded() {
        super.onAdded();
        requestAnimationFrame(() => {
            if (this.image.complete) {
                this.initCrop();
            } else {
                this.image.addEventListener("load", this.initCrop, {
                    once: true,
                });
            }
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
        this.cropOffsetBottom = this.image.naturalHeight;
        this.cropOffsetRight = this.image.naturalWidth;
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
        if (e.ctrlKey) {
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
        if (e.shiftKey) {
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

    get crop() {
        return {
            cw: this.cropOffsetRight - this.cropOffsetLeft,
            ch: this.cropOffsetBottom - this.cropOffsetTop,
            cx: this.cropOffsetLeft,
            cy: this.cropOffsetTop,
            height: this.height,
            aspect: this.aspectRatio,
        };
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
</style>
${EDITOR_TEMPLATE}
<div #ref="cropOverlay" class="crop"><div #ref="cropImage"></div></div>
`;

customElements.define("dialogue-cropper", Cropper);
