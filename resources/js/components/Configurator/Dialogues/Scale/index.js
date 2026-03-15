import { Scale as Model } from "../../../../Models/Filters/Scale";

import { VALID_ASPECT_RATIOS } from "../../Streams/Video";
import { VideoEditor } from "../VideoEditor";

class Scale extends VideoEditor {
    /**
     * @type {Model}
     */
    #model;

    #btn1080;
    #btn720;
    #btn576;
    #inputWidth;
    #inputHeight;
    #input43;
    #input169;
    #inputKeep;

    connectedCallback() {
        this.bindListeners();
        requestAnimationFrame(() => {
            this.addListeners();
            this.calculateWidth();
        });
    }

    bindListeners() {
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
        this.inputWidth.addEventListener("input", this.handleSize);
        this.inputHeight.addEventListener("input", this.handleSize);
        this.input43.addEventListener("change", this.handleAspectRatio);
        this.input169.addEventListener("change", this.handleAspectRatio);
        this.inputKeep.addEventListener("change", this.handleAspectRatio);
        return this;
    }

    disconnectedCallback() {
        this.btn1080.removeEventListener("click", this.handleSize);
        this.btn720.removeEventListener("click", this.handleSize);
        this.btn576.removeEventListener("click", this.handleSize);
        this.inputWidth.removeEventListener("input", this.handleSize);
        this.inputHeight.removeEventListener("input", this.handleSize);
        this.input43.removeEventListener("change", this.handleAspectRatio);
        this.input169.removeEventListener("change", this.handleAspectRatio);
        this.inputKeep.removeEventListener("change", this.handleAspectRatio);
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
        if (e.currentTarget.value === "keep") {
            this.aspectRatio = `${this.video.width}:${this.video.height}`;
        } else {
            this.aspectRatio = e.currentTarget.value;
        }
        this.calculateWidth();
    }

    /**
     * @param {Model} model
     */
    set scale(model) {
        this.#model = model;
        this.inputWidth.value = Number(model.width);
        this.inputHeight.value = Number(model.height);
        this.aspectRatio = model.aspect;
    }

    /**
     * @returns {Model}
     */
    get scale() {
        return this.#model;
    }

    get aspectRatio() {
        return this.#model.aspect;
    }

    set aspectRatio(value) {
        let input;
        if (!VALID_ASPECT_RATIOS.includes(value)) {
            input = this.inputKeep;
        } else {
            const ratios = [this.input43, this.input169];
            input = ratios.find((i) => i.value === value);
        }
        if (input) {
            this.#model.aspect = value;
            input.checked = true;
        }
    }

    get width() {
        return this.#model.width;
    }

    set width(value) {
        this.#model.width = Number(value);
        this.inputWidth.value = value;
    }

    get height() {
        return this.#model.height;
    }

    set height(value) {
        this.#model.height = Number(value);
        this.inputHeight.value = value;
    }

    get btn1080() {
        return (this.#btn1080 ??= this.shadowRoot.querySelector(
            'theme-button[data-height="1080"]',
        ));
    }
    get btn720() {
        return (this.#btn720 ??= this.shadowRoot.querySelector(
            'theme-button[data-height="720"]',
        ));
    }
    get btn576() {
        return (this.#btn576 ??= this.shadowRoot.querySelector(
            'theme-button[data-height="576"]',
        ));
    }
    get inputWidth() {
        return (this.#inputWidth ??= this.shadowRoot.querySelector(
            'input[placeholder="Width"]',
        ));
    }
    get inputHeight() {
        return (this.#inputHeight ??= this.shadowRoot.querySelector(
            'input[placeholder="Height"]',
        ));
    }
    get input43() {
        return (this.#input43 ??=
            this.shadowRoot.querySelector('input[value="4:3"]'));
    }
    get input169() {
        return (this.#input169 ??= this.shadowRoot.querySelector(
            'input[value="16:9"]',
        ));
    }
    get inputKeep() {
        return (this.#inputKeep ??= this.shadowRoot.querySelector(
            'input[value="keep"]',
        ));
    }
}

const CSS = css`
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
`;

Scale.template = html`
    <style>
        ${CSS}
    </style>
    <fieldset>
        <legend>Standard:</legend>
        <div class="flex-h">
            <theme-button data-height="1080">1080p</theme-button>
            <theme-button data-height="720">720p</theme-button>
            <theme-button data-height="576">576p</theme-button>
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
        <label>
            <span>Keep</span>
            <input type="radio" name="aspect" value="keep" />
        </label>
    </fieldset>
`;

customElements.define("dialogue-scale", Scale);
