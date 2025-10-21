import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { handleKeyDown, handleKeyUp, rwd, ffwd } from "../VideoEditor/mixins/handleKey";
import Painterro from 'painterro';
import { Request } from "../../../Request";

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
        this.run = this.run.bind(this);
        this.paint = this.paint.bind(this);
        this.handleSaveImage = this.handleSaveImage.bind(this);
        this.initRemovelogo = this.initRemovelogo.bind(this);
        this.rwd = rwd.bind(this);
        this.ffwd = ffwd.bind(this);
        this.handleKeyDown = handleKeyDown.bind(this);
        this.handleKeyUp = handleKeyUp.bind(this);
    }

    onAdded() {
        super.onAdded();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);

        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initRemovelogo, {
                once: true,
            });
            this.initImages();
        });
    }

    onRemoved() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
    }

    run() {
        this.startRemoveLogo = true;
        this.parentNode.confirmAction();
    }

    paint() {
        this.paintArea = document.createElement('div');
        this.paintArea.id = 'paint';
        document.body.insertBefore(this.paintArea, document.querySelector('transcoder-toast'));
        this.imageType = IMAGE_TYPE_MASK;
        this.updateFrameUrl();
        this.painterro = Painterro({
            id: 'paint',
            activeColor: '#000000',
            onClose: () => {
                document.body.removeChild(this.paintArea)
            },
            saveHandler: this.handleSaveImage
        }).show(this.image.src);
    }

    async handleSaveImage(image, callback) {
        try {
            const data = {
                image: image.asDataURL('image/jpeg')
            };
            const result = await Request.post(`/removelogoCustomMask/${encodeURIComponent(this.path)}`, data);
            const response = await result.json();
            document.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        message: response.message,
                        type: 'info'
                    },
                })
            );
        } catch (error) {
        } finally {
            callback(true);
            this.painterro.close();
        }
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

    get removeLogo() {
        return {
            timestamp: this.timestamp(),
            w: this.video.width,
            h: this.video.height,
            type: this.type
        }
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
    .actions {
        grid-area: right;
    }
</style>
${EDITOR_TEMPLATE}
<div class="info">
    <theme-button class="toggle-type" @click="{{ this.toggleType() }}">{{ this.imageType }}</theme-button>
    <p>
        Find a black frame containing only the logo
    </p>
</div>
<!-- TODO: Create logomask without running action -->
<div class="actions">
    <theme-button #ref="runButton" class="run" @click="{{ this.run }}">Start</theme-button>
    <theme-button #ref="paintButton" class="paint-button" @click="{{ this.paint }}">Paint</theme-button>
</div>
`;

customElements.define("dialogue-removelogo", RemoveLogo);
