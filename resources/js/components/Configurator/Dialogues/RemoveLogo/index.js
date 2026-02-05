import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import Paint from "../../../../Helper/Paint";
import { Request } from "../../../Request";
import { VTime } from "../../../../Helper/Time";
import { STATE_INFO } from "../../../Toast";

const IMAGE_TYPE_ORIGINAL = "Original";
const IMAGE_TYPE_MASK = "Mask";

export const saveCustomMask = async function (image, path) {
    const canvas = document.querySelector("#painterro-paintarea canvas");
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelArray = imageData.data;
    const totalPixels = pixelArray.length / 4;

    let nonBlackPixels = 0;
    for (let i = 0; i < pixelArray.length; i += 4) {
        const r = pixelArray[i];
        const g = pixelArray[i + 1];
        const b = pixelArray[i + 2];
        const a = pixelArray[i + 3];

        if (!(r === 0 && g === 0 && b === 0 && a > 0)) {
            nonBlackPixels++;
        }
    }
    const nonBlackPercent = Math.round((nonBlackPixels / totalPixels) * 100);
    if (nonBlackPercent > 10) {
        const m = document.createElement("modal-confirm");
        m.header = "Too much white";
        m.content = `FFMpeg will have a really hard time masking ${nonBlackPercent}% of the video. Proceed?`;
        document.body.appendChild(m);
        await m.confirm();
    }

    const data = {
        image: image.asDataURL("image/png"),
    };
    const result = await Request.post(
        `/removelogoCustomMask/${encodeURIComponent(path)}`,
        data,
    );
    const response = await result.json();
    document.dispatchEvent(
        new CustomEvent("toast", {
            detail: {
                message: response.message,
                type: STATE_INFO,
            },
        }),
    );
};

class RemoveLogo extends VideoEditor {
    raw = [-1];

    bindListeners() {
        super.bindListeners();
        this.toggleType = this.toggleType.bind(this);
        this.paint = this.paint.bind(this);
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
        this.imageType = IMAGE_TYPE_MASK;
        this.updateFrameUrl();
        Paint.init(
            async (image) => {
                await saveCustomMask(image, this.path);
            },
            () => {
                this.imageType = IMAGE_TYPE_ORIGINAL;
                this.updateFrameUrl();
            },
        ).show(this.image.src);
    }

    toggleType() {
        if (this.imageType === IMAGE_TYPE_ORIGINAL) {
            this.imageType = IMAGE_TYPE_MASK;
        } else {
            this.imageType = IMAGE_TYPE_ORIGINAL;
        }
        this.updateFrameUrl();
    }

    setTimestamp(value) {
        this.current = new VTime(value).milliseconds;
        this.updateImages();
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
