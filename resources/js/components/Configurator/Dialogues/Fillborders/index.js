import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class Fillborders extends VideoEditor {
    video = null;
    aspectDecimal = 0;
    zoomed = 0;
    valid = true;

    connectedCallback() {
        super.connectedCallback();
        this.aspectDecimal = this.video.width / this.video.height;
        requestAnimationFrame(() => {
            this.current = parseInt(this.duration / 2) ?? 0;
            this.width = parseInt(this.video.width);
            this.height = parseInt(this.video.height);
            this.updateImages();
            this.image.addEventListener("load", this.initFillborders, {
                once: true,
            });
        });
    }

    bindListeners() {
        super.bindListeners();
        this.initFillborders = this.initFillborders.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.updateFillbordersBox = this.updateFillbordersBox.bind(this);
    }

    initFillborders() {
        if (this.fillbordersOffsetBottom === null) {
            this.fillbordersOffsetBottom = this.image.naturalHeight;
        }
        if (this.fillbordersOffsetRight === null) {
            this.fillbordersOffsetRight = this.image.naturalWidth;
        }
        this.updateFillbordersBox();
    }

    addListeners() {
        super.addListeners();
        this.image.addEventListener("load", this.updateFillbordersBox);
        document.addEventListener("keydown", this.handleKey);
        document.addEventListener("keyup", this.handleKey);
        this.fillbordersImage.addEventListener("click", this.handleClick);
    }

    removeListeners() {
        super.removeListeners();
        this.image.removeEventListener("load", this.updateFillbordersBox);
        document.removeEventListener("keydown", this.handleKey);
        document.removeEventListener("keyup", this.handleKey);
        this.fillbordersImage.removeEventListener("click", this.handleClick);
    }

    updateFillbordersBox() {
        this.image.style.display = "block";
        if (!this.zoomed) {
            this.fillbordersOverlay.style.width = `${this.image.offsetWidth}px`;
            this.fillbordersOverlay.style.height = `${this.image.offsetHeight}px`;
        }
        this.fillbordersImage.style.backgroundImage = `${this.gradients},url("${this.image.src}")`;
        this.image.style.display = "none";
        this.dispatchEvent(new CustomEvent("fillborders-updated"));
    }

    get gradients() {
        let top = `linear-gradient(180deg, var(--clr-cropper-gradient) ${this.fillbordersPercentTop}%, transparent ${this.fillbordersPercentTop}%)`;
        let bottom = `linear-gradient(180deg, transparent ${this.fillbordersPercentBottom}%, var(--clr-cropper-gradient) ${this.fillbordersPercentBottom}%)`;
        let left = `linear-gradient(90deg, var(--clr-cropper-gradient) ${this.fillbordersPercentLeft}%, transparent ${this.fillbordersPercentLeft}%)`;
        let right = `linear-gradient(90deg, transparent ${this.fillbordersPercentRight}%, var(--clr-cropper-gradient) ${this.fillbordersPercentRight}%)`;
        return [top, bottom, left, right].join(",");
    }

    get fillbordersPercentTop() {
        return (100 / this.image.naturalHeight) * this.fillbordersOffsetTop;
    }

    get fillbordersPercentBottom() {
        return (100 / this.image.naturalHeight) * this.fillbordersOffsetBottom;
    }

    get fillbordersPercentLeft() {
        return (100 / this.image.naturalWidth) * this.fillbordersOffsetLeft;
    }

    get fillbordersPercentRight() {
        return (100 / this.image.naturalWidth) * this.fillbordersOffsetRight;
    }

    handleKey(e) {
        if (e.key === "Control" || e.key === "Shift") {
            if (e.type === "keydown") {
                this.fillbordersImage.addEventListener(
                    "transitionend",
                    () => {
                        this.zoomed = e.key === "Control" ? 1 : 2;
                    },
                    { once: true },
                );
                this.fillbordersImage.style.width = `${this.image.naturalWidth}px`;
                this.fillbordersImage.style.height = `${this.image.naturalHeight}px`;
                if (e.key === "Shift") {
                    this.fillbordersImage.style.inset = "auto 0 0 auto";
                }
            } else {
                this.fillbordersImage.addEventListener(
                    "transitionend",
                    () => {
                        this.fillbordersImage.style.inset = "";
                        this.zoomed = 0;
                    },
                    { once: true },
                );
                this.fillbordersImage.style.width = "";
                this.fillbordersImage.style.height = "";
            }
        }
        if (e.ctrlKey && e.type === "keydown") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                this.fillbordersOffsetLeft = Math.min(
                    Math.floor(this.image.naturalWidth / 2),
                    this.fillbordersOffsetLeft + 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetRight = Math.max(
                        Math.floor(this.image.naturalWidth / 2),
                        this.image.naturalWidth - this.fillbordersOffsetLeft,
                    );
                }
                this.updateFillbordersBox();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.fillbordersOffsetLeft = Math.max(
                    0,
                    this.fillbordersOffsetLeft - 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetRight = Math.max(
                        Math.floor(this.image.naturalWidth / 2),
                        this.image.naturalWidth - this.fillbordersOffsetLeft,
                    );
                }
                this.updateFillbordersBox();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.fillbordersOffsetTop = Math.min(
                    Math.floor(this.image.naturalHeight / 2),
                    this.fillbordersOffsetTop + 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetBottom = Math.max(
                        Math.floor(this.image.naturalHeight / 2),
                        this.image.naturalHeight - this.fillbordersOffsetTop,
                    );
                }
                this.updateFillbordersBox();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.fillbordersOffsetTop = Math.max(
                    0,
                    this.fillbordersOffsetTop - 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetBottom = Math.min(
                        this.image.naturalHeight,
                        this.image.naturalHeight - this.fillbordersOffsetTop,
                    );
                }
                this.updateFillbordersBox();
            }
        }
        if (e.shiftKey && e.type === "keydown") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                this.fillbordersOffsetRight = Math.min(
                    this.image.naturalWidth,
                    this.fillbordersOffsetRight + 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetLeft = Math.max(
                        0,
                        this.image.naturalWidth - this.fillbordersOffsetRight,
                    );
                }
                this.updateFillbordersBox();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.fillbordersOffsetRight = Math.max(
                    Math.floor(this.image.naturalWidth / 2),
                    this.fillbordersOffsetRight - 1,
                );
                if (this.equal) {
                    if (this.equal) {
                        this.fillbordersOffsetLeft = Math.min(
                            Math.floor(this.image.naturalWidth / 2),
                            this.image.naturalWidth -
                                this.fillbordersOffsetRight,
                        );
                    }
                }
                this.updateFillbordersBox();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.fillbordersOffsetBottom = Math.min(
                    this.image.naturalHeight,
                    this.fillbordersOffsetBottom + 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetTop = Math.max(
                        0,
                        this.image.naturalHeight - this.fillbordersOffsetBottom,
                    );
                }
                this.updateFillbordersBox();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.fillbordersOffsetBottom = Math.max(
                    Math.floor(this.image.naturalHeight / 2),
                    this.fillbordersOffsetBottom - 1,
                );
                if (this.equal) {
                    this.fillbordersOffsetTop = Math.min(
                        Math.floor(this.image.naturalHeight / 2),
                        this.image.naturalHeight - this.fillbordersOffsetBottom,
                    );
                }
                this.updateFillbordersBox();
            }
        }
    }

    handleClick(e) {
        requestAnimationFrame(() => {
            const imageRect = this.fillbordersImage.getBoundingClientRect();
            if (this.zoomed === 1) {
                this.fillbordersOffsetLeft = parseInt(e.pageX - imageRect.left);
                this.fillbordersOffsetTop = parseInt(e.pageY - imageRect.top);
            } else if (this.zoomed === 2) {
                this.fillbordersOffsetBottom = parseInt(
                    e.pageY - imageRect.top,
                );
                this.fillbordersOffsetRight = parseInt(
                    e.pageX - imageRect.left,
                );
            }
            this.updateFillbordersBox();
        });
    }

    get mirror() {
        return this.inputMirror.checked;
    }

    set mirror(value) {
        this.inputMirror.checked = !!value;
    }

    get equal() {
        return this.inputEqual.checked;
    }

    get fillborders() {
        return {
            top: this.fillbordersOffsetTop,
            right: this.width - this.fillbordersOffsetRight,
            bottom: this.height - this.fillbordersOffsetBottom,
            left: this.fillbordersOffsetLeft,
            mode: this.inputMirror.checked ? "mirror" : "fixed",
            between: {
                from: this.from ?? null,
                to: this.to ?? null,
            },
            color: this.color ?? null,
        };
    }

    set fillborders(fillborders) {
        this.fillbordersOffsetTop = fillborders.top ?? 0;
        this.fillbordersOffsetLeft = fillborders.left ?? 0;
        this.fillbordersOffsetBottom =
            this.video.height - fillborders.bottom ?? 0;
        this.fillbordersOffsetRight = this.video.width - fillborders.right ?? 0;
        this.between = fillborders.between;
        this.color = fillborders.color;
        this.mode = fillborders.mode;
    }

    applyFilterData(data) {
        this.fillborders = data;
        this.updateFillbordersBox();
    }

    get fillbordersOverlay() {
        return this.shadowRoot.querySelector('[data-ref="fillbordersOverlay"]');
    }

    get fillbordersImage() {
        return this.shadowRoot.querySelector('[data-ref="fillbordersImage"]');
    }

    get info() {
        return this.shadowRoot.querySelector('[data-ref="info"]');
    }

    get inputMirror() {
        return this.shadowRoot.querySelector('[data-ref="inputMirror"]');
    }

    get inputEqual() {
        return this.shadowRoot.querySelector('[data-ref="inputEqual"]');
    }

    get fillbordersOffsetTop() {
        return Number(
            this.shadowRoot.querySelector("[data-fillborders]").dataset.top,
        );
    }

    set fillbordersOffsetTop(value) {
        this.shadowRoot.querySelector("[data-fillborders]").dataset.top =
            String(value);
        this.setDimensions();
    }

    get fillbordersOffsetLeft() {
        return Number(
            this.shadowRoot.querySelector("[data-fillborders]").dataset.left,
        );
    }

    set fillbordersOffsetLeft(value) {
        this.shadowRoot.querySelector("[data-fillborders]").dataset.left =
            String(value);
        this.setDimensions();
    }

    get fillbordersOffsetBottom() {
        return (
            Number(
                this.shadowRoot.querySelector("[data-fillborders]").dataset
                    .bottom,
            ) || null
        );
    }

    set fillbordersOffsetBottom(value) {
        this.shadowRoot.querySelector("[data-fillborders]").dataset.bottom =
            String(value);
        this.setDimensions();
    }

    get fillbordersOffsetRight() {
        return (
            Number(
                this.shadowRoot.querySelector("[data-fillborders]").dataset
                    .right,
            ) || null
        );
    }

    set fillbordersOffsetRight(value) {
        this.shadowRoot.querySelector("[data-fillborders]").dataset.right =
            String(value);
        this.setDimensions();
    }

    setDimensions() {
        this.shadowRoot.querySelector('[data-type="top"]').innerText =
            this.fillbordersOffsetTop;
        this.shadowRoot.querySelector('[data-type="right"]').innerText =
            this.video.width - this.fillbordersOffsetRight;
        this.shadowRoot.querySelector('[data-type="bottom"]').innerText =
            this.video.height - this.fillbordersOffsetBottom;
        this.shadowRoot.querySelector('[data-type="left"]').innerText =
            this.fillbordersOffsetLeft;
        return this;
    }
}

Fillborders.template = html`
${EDITOR_CSS}
<style>
    .toggle-aspect {
        display: none;
    }
    .fillborders {
        box-sizing: border-box;
        grid-area: frame;
        border: 0 solid hsla(0 50% 50% / .5);
        justify-self: center;
        cursor: crosshair;
        position: relative;
        overflow: hidden;
    }
    .fillborders div {
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        height: 100%;
        transition: 250ms ease-in-out;
        background-size: 100%;
        background-blend-mode: lighten;
    }

    .info, .settings {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
        gap: .5rem;
        font-size: .75rem;
        white-space: nowrap;
        width: 250px;
    }
    .settings {
        grid-area: right;
        justify-self: end;
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
<div data-ref="fillbordersOverlay" class="fillborders">
    <div data-ref="fillbordersImage"></div>
</div>
<div class="info" data-ref="info">
    <fieldset data-fillborders data-top="0" data-left="0" data-right data-bottom>
        <legend>Fillborders Box:</legend>
        <label><span>top</span><span data-type="top"></span></label>
        <label><span>right</span><span data-type="right"></span></label>
        <label><span>bottom</span><span data-type="bottom"></span></label>
        <label><span>left</span><span data-type="left"></span></label>
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
</div>
<div class="settings">
    <fieldset>
        <legend>Settings:</legend>
        <label>
            <span>Mirror</span>
            <input type="checkbox" name="mirror" data-ref="inputMirror">
        </label>
        <label>
            <span>Equal Borders</span>
            <input type="checkbox" name="equal" data-ref="inputEqual" checked="checked">
        </label>
    </fieldset>
</div>
`;

customElements.define("dialogue-fillborders", Fillborders);
