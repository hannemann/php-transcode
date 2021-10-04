import { Slim, Utils } from "@/components/lib";

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 576;
const DEFAULT_ASPECT = "4:3";

import { VALID_ASPECT_RATIOS } from "../Streams/Video";

class Scale extends Slim {
    constructor() {
        super();
        this.scale = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            aspectRatio: DEFAULT_ASPECT,
        };
        this.handleWidth = this.handleWidth.bind(this);
        this.handleHeight = this.handleHeight.bind(this);
        this.handleAspectRatio = this.handleAspectRatio.bind(this);
    }

    onAdded() {
        this.calculateWidth();
    }

    setWidth(value) {
        this.scale.width = value;
    }
    setHeight(value) {
        this.scale.height = value;
        this.calculateWidth();
    }
    setAspectRatio(value) {
        if (VALID_ASPECT_RATIOS.indexOf(value) > -1) {
            this.scale.aspectRatio = value;
            this.calculateWidth();
        }
    }

    calculateWidth() {
        const ratio = this.scale.aspectRatio.split(":");
        this.scale.width = (this.scale.height / ratio[1]) * ratio[0];
        requestAnimationFrame(() => Utils.forceUpdate(this, "scale"));
    }

    handleWidth(e) {
        this.setWidth(e.currentTarget.value);
    }

    handleHeight(e) {
        this.setHeight(e.currentTarget.value);
    }

    handleAspectRatio(e) {
        this.setAspectRatio(e.currentTarget.value);
    }
}

Scale.template = /*html*/ `
<style>
    :host {
        display: flex;
        flex-direction: column;
        gap: .5rem;
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
</style>
<fieldset>
    <legend>Dimensions:</legend>
    <label>
        <span>Width:</span><input type="number" value="{{ this.scale.width }}" placeholder="Width" @input="{{ this.handleWidth }}">
    </label>
    <label>
        <span>Height:</span><input type="number" value="{{ this.scale.height }}" placeholder="Height" @input="{{ this.handleHeight }}">
    </label>
</fieldset>
<fieldset>
    <legend>Aspect-Ratio:</legend>
    <label>
        <span>4:3</span>
        <input type="radio" name="aspect" value="4:3" @change="{{ this.handleAspectRatio }}" .checked="{{ this.scale.aspectRatio === '4:3' }}">
    </label>
    <label>
        <span>16:9</span>
        <input type="radio" name="aspect" value="16:9" @change="{{ this.handleAspectRatio }}" .checked="{{ this.scale.aspectRatio === '16:9' }}">
    </label>
</fieldset>
`;

customElements.define("dialogue-scale", Scale);
