import { Slim, Iconify } from "@/components/lib";

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 576;
const DEFAULT_ASPECT = "4:3";

class Scale extends Slim {
    constructor() {
        super();
        this.scale = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            aspectRatio: DEFAULT_ASPECT,
        };
        this.setWidth = this.setWidth.bind(this);
        this.setHeight = this.setHeight.bind(this);
        this.setAspectRatio = this.setAspectRatio.bind(this);
    }

    setWidth(e) {
        this.scale.width = e.currentTarget.value;
    }
    setHeight(e) {
        this.scale.height = e.currentTarget.value;
    }
    setAspectRatio(e) {
        this.scale.aspectRatio = e.currentTarget.value;
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
        <span>Width:</span><input type="number" value="{{ this.scale.width }}" placeholder="Width" @input="{{ this.setWidth }}">
    </label>
    <label>
        <span>Height:</span><input type="number" value="{{ this.scale.height }}" placeholder="Height" @input="{{ this.setHeight }}">
    </label>
</fieldset>
<fieldset>
    <legend>Aspect-Ratio:</legend>
    <label>
        <span>4:3</span>
        <input type="radio" name="aspect" value="4:3" @change="{{ this.setAspectRatio }}" checked="checked">
    </label>
    <label>
        <span>16:9</span>
        <input type="radio" name="aspect" value="16:9" @change="{{ this.setAspectRatio }}">
    </label>
</fieldset>
`;

customElements.define("dialogue-scale", Scale);
