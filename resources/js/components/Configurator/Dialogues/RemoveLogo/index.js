import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { handleKey, rwd, ffwd } from "../Clipper/mixins/handleKey";

const IMAGE_TYPE_ORIGINAL = "Original";
const IMAGE_TYPE_MASK = "Mask";
class RemoveLogo extends VideoEditor {
    constructor() {
        super();
        this.raw = [-1];
        this.imageType = IMAGE_TYPE_ORIGINAL;
    }

    bindListeners() {
        super.bindListeners();
        this.initRemovelogo = this.initRemovelogo.bind(this);
        this.rwd = rwd.bind(this);
        this.ffwd = ffwd.bind(this);
        this.handleKey = handleKey.bind(this);
    }

    onAdded() {
        super.onAdded();
        document.addEventListener("keydown", this.handleKey);
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initRemovelogo, {
                once: true,
            });
            this.initImages();
        });
    }

    onRemoved() {
        document.removeEventListener("keydown", this.handleKey);
    }

    initRemovelogo() {
        console.info("Initialize Removelogo");
    }

    toggleType() {
        if (this.imageType === IMAGE_TYPE_ORIGINAL) {
            this.imageType = IMAGE_TYPE_MASK;
        } else {
            this.imageType = IMAGE_TYPE_ORIGINAL;
        }
        this.updateFrameUrl();
    }

    get baseThumbUrl() {
        return super.baseUrl;
    }

    get baseUrl() {
        return this.imageType === IMAGE_TYPE_ORIGINAL
            ? super.baseUrl
            : `/removelogoImage/${encodeURIComponent(this.path)}?timestamp=`;
    }

    add() {}
}

RemoveLogo.template = /*html*/ `
${EDITOR_CSS}
<style>
    :host {
        position: relative;
    }
    .box {
        position: absolute;
        background-color: hsla(0 100% 50% / .5);
    }
    .info {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
        gap: .5rem;
        font-size: .75rem;
    }
    .toggle-type::part(button) {
        min-width: 150px;
    }
    .toggle-aspect {
        display: none;
    }
    .info p {
        max-width: 150px;
    }
</style>
${EDITOR_TEMPLATE}
<div class="info">
    <theme-button class="toggle-type" @click="{{ this.toggleType() }}">{{ this.imageType }}</theme-button>
    <p>
        Find a black frame containing only the logo
    </p>
</div>
`;

customElements.define("dialogue-removelogo", RemoveLogo);
