import { Slim, Utils } from "@/components/lib";

const DEFAULT_HEIGHT = 576;
const DEFAULT_ASPECT = "16:9";

import { VALID_ASPECT_RATIOS } from "../Streams/Video";

class Crop extends Slim {
    constructor() {
        super();
        this.crop = {
            cw: 0,
            ch: 0,
            cx: 0,
            cy: 0,
            height: DEFAULT_HEIGHT,
            aspect: DEFAULT_ASPECT,
        };
        this.handleCropWidth = this.handleCropWidth.bind(this);
        this.handleCropHeight = this.handleCropHeight.bind(this);
        this.handleCropOffsetX = this.handleCropOffsetX.bind(this);
        this.handleCropOffsetY = this.handleCropOffsetY.bind(this);
        this.handleHeight = this.handleHeight.bind(this);
        this.handleAspectRatio = this.handleAspectRatio.bind(this);
    }

    setCropWidth(value) {
        this.crop.cw = value;
    }

    setCropHeight(value) {
        this.crop.ch = value;
    }

    setCropOffsetX(value) {
        this.crop.cx = value;
    }

    setCropOffsetY(value) {
        this.crop.cy = value;
    }

    setHeight(value) {
        this.crop.height = value;
    }
    setAspectRatio(value) {
        if (VALID_ASPECT_RATIOS.indexOf(value) > -1) {
            this.crop.aspect = value;
        }
    }

    handleCropWidth(e) {
        this.setCropWidth(e.currentTarget.value);
    }

    handleCropHeight(e) {
        this.setCropHeight(e.currentTarget.value);
    }

    handleCropOffsetX(e) {
        this.setCropOffsetX(e.currentTarget.value);
    }

    handleCropOffsetY(e) {
        this.setCropOffsetY(e.currentTarget.value);
    }

    handleHeight(e) {
        this.setHeight(e.currentTarget.value);
    }

    handleAspectRatio(e) {
        this.setAspectRatio(e.currentTarget.value);
    }
}

Crop.template = /*html*/ `
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
    <legend>Crop Box:</legend>
    <label>
        <span>Width:</span><input type="number" value="{{ this.crop.cw }}" placeholder="Width" @input="{{ this.handleCropWidth }}">
    </label>
    <label>
        <span>Height:</span><input type="number" value="{{ this.crop.ch }}" placeholder="Height" @input="{{ this.handleCropHeight }}">
    </label>
    <label>
        <span>Offset X:</span><input type="number" value="{{ this.crop.cx }}" placeholder="Width" @input="{{ this.handleCropOffsetX }}">
    </label>
    <label>
        <span>Offset Y:</span><input type="number" value="{{ this.crop.cy }}" placeholder="Height" @input="{{ this.handleCropOffsetY }}">
    </label>
</fieldset>
<fieldset>
    <legend>Scale:</legend>
    <label>
        <span>Height:</span><input type="number" value="{{ this.crop.height }}" placeholder="Height" @input="{{ this.handleHeight }}">
    </label>
</fieldset>
<fieldset>
    <legend>Aspect-Ratio:</legend>
    <label>
        <span>4:3</span>
        <input type="radio" name="aspect" value="4:3" @change="{{ this.handleAspectRatio }}" .checked="{{ this.crop.aspect === '4:3' }}">
    </label>
    <label>
        <span>16:9</span>
        <input type="radio" name="aspect" value="16:9" @change="{{ this.handleAspectRatio }}" .checked="{{ this.crop.aspect === '16:9' }}">
    </label>
</fieldset>
`;

customElements.define("dialogue-crop", Crop);
