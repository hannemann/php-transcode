import { DomHelper } from "../../../Helper/Dom";

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 576;
const DEFAULT_ASPECT = "4:3";

import { VALID_ASPECT_RATIOS } from "../Streams/Video";

class Scale extends HTMLElement {
    connectedCallback() {
        DomHelper.initDom.call(this);
        this.initElements().initListeners().addListeners();
        this.aspectRatio = DEFAULT_ASPECT;
        this.width = DEFAULT_WIDTH;
        this.height = DEFAULT_HEIGHT;
        this.calculateWidth();
    }

    initElements() {
        const shadow = this.shadowRoot;
        this.btn1080 = shadow.querySelector('theme-button[data-height="1080"]');
        this.btn720 = shadow.querySelector('theme-button[data-height="720"]');
        this.btn576 = shadow.querySelector('theme-button[data-height="576"]');
        this.btn480 = shadow.querySelector('theme-button[data-height="480"]');
        this.inputWidth = shadow.querySelector('input[placeholder="Width"]');
        this.inputHeight = shadow.querySelector('input[placeholder="Height"]');
        this.input43 = shadow.querySelector('input[value="4:3"]');
        this.input169 = shadow.querySelector('input[value="16:9"]');
        return this;
    }

    initListeners() {
        this.handleWidth = this.handleWidth.bind(this);
        this.handleHeight = this.handleHeight.bind(this);
        this.handleSize = this.handleSize.bind(this);
        this.handleAspectRatio = this.handleAspectRatio.bind(this);
        return this;
    }

    addListeners() {
        this.btn1080.addEventListener("click", this.handleSize);
        this.btn720.addEventListener("click", this.handleSize);
        this.btn576.addEventListener("click", this.handleSize);
        this.btn480.addEventListener("click", this.handleSize);
        this.inputWidth.addEventListener("input", this.handleSize);
        this.inputHeight.addEventListener("input", this.handleSize);
        this.input43.addEventListener("change", this.handleAspectRatio);
        this.input169.addEventListener("change", this.handleAspectRatio);
        return this;
    }

    disconnectedCallback() {
        this.btn1080.removeEventListener("click", this.handleSize);
        this.btn720.removeEventListener("click", this.handleSize);
        this.btn576.removeEventListener("click", this.handleSize);
        this.btn480.removeEventListener("click", this.handleSize);
        this.inputWidth.removeEventListener("input", this.handleSize);
        this.inputHeight.removeEventListener("input", this.handleSize);
        this.input43.removeEventListener("change", this.handleAspectRatio);
        this.input169.removeEventListener("change", this.handleAspectRatio);
    }

    calculateWidth() {
        const [rWidth, rHeight] = this.aspectRatio.split(":");
        this.width = (this.height / rHeight) * rWidth;
    }

    calculateHeight() {
        const [rWidth, rHeight] = this.aspectRatio.split(":");
        this.height = (this.width / rWidth) * rHeight;
    }

    handleWidth(e) {
        this.width = e.currentTarget.value;
        this.calculateHeight();
    }

    handleHeight(e) {
        this.height = e.currentTarget.value;
        this.calculateWidth();
    }

    handleSize(e) {
        const [rWidth, rHeight] = this.aspectRatio.split(":");
        this.height = parseInt(e.currentTarget.dataset.height);
        this.calculateWidth();
    }

    handleAspectRatio(e) {
        this.aspectRatio = e.currentTarget.value;
        this.calculateWidth();
    }

    get aspectRatio() {
        const ratios = [this.input43, this.input169];
        return ratios.find((i) => i.checked)?.value;
    }

    set aspectRatio(value) {
        if (!VALID_ASPECT_RATIOS.includes(value)) return;
        const ratios = [this.input43, this.input169];
        const input = ratios.find((i) => i.value === value);
        input && (input.checked = true);
    }

    get width() {
        return Number(this.inputWidth.value);
    }

    set width(value) {
        this.inputWidth.value = value;
    }

    get height() {
        return Number(this.inputHeight.value);
    }

    set height(value) {
        this.inputHeight.value = value;
    }
}

Scale.template = html`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        fieldset {
            border: 2px solid var(--clr-bg-200);
            padding: 1rem;
            background: var(--clr-bg-100);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            border-radius: 0.25rem;

            div.flex-h {
                display: flex;
                gap: 0.5rem;
            }
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
    </style>
    <fieldset>
        <legend>Standard:</legend>
        <div class="flex-h">
            <theme-button data-height="1080">1080p</theme-button>
            <theme-button data-height="720">720p</theme-button>
            <theme-button data-height="576">576p</theme-button>
            <theme-button data-height="480">480p</theme-button>
        </div>
    </fieldset>
    <fieldset>
        <legend>Custom:</legend>
        <label>
            <span>Width:</span><input type="number" placeholder="Width" />
        </label>
        <label>
            <span>Height:</span><input type="number" placeholder="Height" />
        </label>
    </fieldset>
    <fieldset>
        <legend>Aspect-Ratio:</legend>
        <label>
            <span>4:3</span>
            <input type="radio" name="aspect" value="4:3" />
        </label>
        <label>
            <span>16:9</span>
            <input type="radio" name="aspect" value="16:9" />
        </label>
    </fieldset>
`;

customElements.define("dialogue-scale", Scale);
