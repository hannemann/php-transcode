import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import Painterro from "painterro";
import { Request } from "../../../Request";

const IMAGE_TYPE_ORIGINAL = "Original";
const IMAGE_TYPE_MASK = "Mask";
class RemoveLogo extends VideoEditor {
    raw = [-1];

    bindListeners() {
        super.bindListeners();
        this.toggleType = this.toggleType.bind(this);
        this.paint = this.paint.bind(this);
        this.handleSaveImage = this.handleSaveImage.bind(this);
    }

    addListeners() {
        super.addListeners();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        this.paintButton.addEventListener("click", this.paint);
        this.typeButton.addEventListener("click", this.toggleType);
    }

    removeListeners() {
        super.removeListeners();
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
        this.paintButton.removeEventListener("click", this.paint);
        this.typeButton.removeEventListener("click", this.toggleType);
    }

    paint() {
        this.paintArea = document.createElement("div");
        this.paintArea.id = "paint";
        document.body.insertBefore(
            this.paintArea,
            document.querySelector("transcoder-toast"),
        );
        this.imageType = IMAGE_TYPE_MASK;
        this.updateFrameUrl();
        // https://github.com/devforth/painterro?tab=readme-ov-file#ui-color-scheme
        this.painterro = Painterro({
            id: "paint",
            activeColor: "#000000",
            activeFillColor: "#000000",
            colorScheme: {
                backgroundColor: "var(--clr-bg-0)",
                main: "var(--clr-bg-150)",
                control: "var(--clr-bg-140)",
                activeControl: "var(--clr-bg-400)",
                activeControlContent: "var(--clr-bg-0)",
                controlContent: "var(--clr-text-0)",
                controlShadow: "0px 0px 3px 1px var(--clr-bg-200)",
                inputBackground: "var(--clr-bg-140)",
                inputText: "var(--clr-text-0)",
                hoverControl: "var(--clr-bg-300)",
                hoverControlContent: "var(--clr-text-100)",
            },
            defaultLineWidth: 150,
            defaultTool: "brush",
            language: "de",
            onClose: () => {
                document.body.removeChild(this.paintArea);
            },
            saveHandler: this.handleSaveImage,
        }).show(this.image.src);
    }

    async handleSaveImage(image, callback) {
        try {
            const data = {
                image: image.asDataURL("image/jpeg"),
            };
            const result = await Request.post(
                `/removelogoCustomMask/${encodeURIComponent(this.path)}`,
                data,
            );
            const response = await result.json();
            document.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        message: response.message,
                        type: "info",
                    },
                }),
            );
        } catch (error) {
        } finally {
            callback(true);
            this.painterro.close();
        }
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
            type: this.type,
        };
    }

    get paintButton() {
        return this.shadowRoot.querySelector(".paint-button");
    }

    get typeButton() {
        return this.shadowRoot.querySelector(".toggle-type");
    }

    get imageType() {
        return this.typeButton.innerText;
    }

    set imageType(value) {
        this.typeButton.innerText = value;
    }
}

RemoveLogo.template = html`
    ${EDITOR_CSS}
    <style>
        :host {
            position: relative;
        }
        .info {
            grid-area: left;
            display: grid;
            grid-auto-rows: min-content;
            gap: 0.5rem;
            font-size: 0.75rem;
            p {
                max-width: 150px;
                margin: 0;
            }
        }
        theme-button::part(button) {
            min-width: 150px;
        }
        .toggle-aspect {
            display: none;
        }
        .actions {
            grid-area: right;
            display: grid;
            justify-items: end;
            gap: 0.5rem;
            grid-auto-rows: min-content;
        }
    </style>
    ${EDITOR_TEMPLATE}
    <div class="info">
        <p>Find a black frame containing the logo on black background.</p>
        <p>Toggle Original/Mask to test.</p>
        <p>Optionally paint white parts of mask black.</p>
    </div>
    <div class="actions">
        <theme-button class="toggle-type">${IMAGE_TYPE_ORIGINAL}</theme-button>
        <theme-button class="paint-button">Paint</theme-button>
    </div>
`;

customElements.define("dialogue-removelogo", RemoveLogo);
