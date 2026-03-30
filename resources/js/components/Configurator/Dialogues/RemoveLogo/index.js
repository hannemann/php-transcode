import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import Paint from "../../../../Helper/Paint";
import { Request } from "../../../Request";
import { VTime } from "../../../../Helper/Time";
import { STATE_INFO } from "../../../Toast";
import { RemoveLogo as Model } from "../../../../Models/Filters/RemoveLogo";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";

const IMAGE_TYPE_ORIGINAL = "Original";
const IMAGE_TYPE_MASK = "Mask";

export const saveCustomMask = async function (image, path, fileId) {
    const nonBlackPercent = Paint.getWhitePixelPercent();
    if (nonBlackPercent > 10) {
        const m = document.createElement("modal-confirm");
        m.header = "Too much white";
        m.content = `FFMpeg will have a really hard time masking ${Math.round(nonBlackPercent)}% of the video. Proceed?`;
        document.body.appendChild(m);
        await m.confirm();
    }
    const data = {
        image: image.asDataURL("image/png"),
    };
    const result = await Request.post(
        `/removelogoCustomMask/${encodeURIComponent(path)}/${fileId}`,
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
    /**
     * @type {Model}
     */
    model;
    raw = [-1];

    connectedCallback() {
        super.connectedCallback();
        requestAnimationFrame(() => {
            this.current = this.model.timestamp.milliseconds || 0;
            this.width = parseInt(this.video.width);
            this.height = parseInt(this.video.height);
            this.updateImages();
            this.image.addEventListener(
                "load",
                () => {
                    this.from = this.model.between.from;
                    this.to = this.model.between.to;
                    this.dispatchEvent(new CustomEvent("removologo-loaded"));
                },
                {
                    once: true,
                },
            );
        });
    }

    bindListeners() {
        super.bindListeners();
        this.toggleType = this.toggleType.bind(this);
        this.paint = this.paint.bind(this);
        this.paintMask = this.paintMask.bind(this);
        this.handleFromTo = this.handleFromTo.bind(this);
    }

    addListeners() {
        super.addListeners();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        this.paintButton.addEventListener("click", this.paint);
        this.paintMaskButton.addEventListener("click", this.paintMask);
        this.typeButton.addEventListener("click", this.toggleType);

        this.coordsDisplay
            .querySelector('[data-ref="from"]')
            .addEventListener("click", this.handleFromTo);
        this.coordsDisplay
            .querySelector('[data-ref="to"]')
            .addEventListener("click", this.handleFromTo);
        this.btnFrom.addEventListener("click", this.handleFromTo);
        this.btnTo.addEventListener("click", this.handleFromTo);
        this.btnDelFrom.addEventListener("click", this.handleFromTo);
        this.btnDelTo.addEventListener("click", this.handleFromTo);
    }

    removeListeners() {
        super.removeListeners();
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
        this.paintButton.removeEventListener("click", this.paint);
        this.paintMaskButton.removeEventListener("click", this.paintMask);
        this.typeButton.removeEventListener("click", this.toggleType);

        this.btnFrom.removeEventListener("click", this.handleFromTo);
        this.btnTo.removeEventListener("click", this.handleFromTo);
        this.coordsDisplay
            .querySelector('[data-ref="from"]')
            .removeEventListener("click", this.handleFromTo);
        this.coordsDisplay
            .querySelector('[data-ref="to"]')
            .removeEventListener("click", this.handleFromTo);
        this.btnDelFrom.removeEventListener("click", this.handleFromTo);
        this.btnDelTo.removeEventListener("click", this.handleFromTo);
    }

    paint() {
        Paint.init(
            async (image) => {
                await saveCustomMask(image, this.path, this.model.fileId);
            },
            () => {
                this.imageType = IMAGE_TYPE_ORIGINAL;
                this.updateFrameUrl();
            },
        ).show(this.image.src);
    }

    paintMask() {
        this.imageType = IMAGE_TYPE_MASK;
        this.updateFrameUrl();
        this.paint();
    }

    toggleType() {
        if (this.imageType === IMAGE_TYPE_ORIGINAL) {
            this.imageType = IMAGE_TYPE_MASK;
        } else {
            this.imageType = IMAGE_TYPE_ORIGINAL;
        }
        this.updateFrameUrl();
    }

    /**
     *
     * @param {MouseEvent} e
     */
    handleFromTo(e) {
        const path = e.composedPath();
        let ref = e.currentTarget.dataset.ref;

        if (!ref.includes("btn-del") && path.includes(this.coordsDisplay)) {
            this.current = new VTime(this[ref]).milliseconds;
            this.updateIndicatorPos();
            this.updateImages();
            return;
        }

        let value = this.current;
        if (ref.includes("btn-del")) {
            value = "";
            ref = ref.replace("btn-del-", "");
        }
        this[ref] = value;
    }

    get baseThumbUrl() {
        return super.baseUrl;
    }

    get baseUrl() {
        return this.imageType === IMAGE_TYPE_ORIGINAL
            ? super.baseUrl
            : `/removelogoImage/${encodeURIComponent(this.path)}?timestamp=`;
    }

    get paintButton() {
        return this.shadowRoot.querySelector(".paint-button");
    }

    get paintMaskButton() {
        return this.shadowRoot.querySelector(".paint-mask-button");
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

    get coordsDisplay() {
        return this.shadowRoot.querySelector(
            'label[data-ref="between-coords"]',
        );
    }

    /**
     * display from value
     */
    get from() {
        const node = this.shadowRoot.querySelector('span[data-ref="from"]');
        const raw = node.dataset.raw;
        return raw ? parseFloat(raw) : null;
    }

    set from(value) {
        const from = this.model.between.from;
        const to = this.model.between.to;
        const delta = to && from && to > from ? to - from : 0;

        this.model.between.from = new VTime(value);
        this.model.between.to = new VTime(
            this.model.between.from + new VTime(delta),
        );

        let node = this.shadowRoot.querySelector('span[data-ref="from"]');
        node.dataset.raw = this.model.between.from.milliseconds || "";
        node.innerText = value
            ? this.model.between.from.getCutpoint(this.clipsConfig)
            : "";

        node = this.shadowRoot.querySelector('span[data-ref="to"]');
        node.dataset.raw = this.model.between.to.milliseconds || "";
        node.innerText = value
            ? this.model.between.to.getCutpoint(this.clipsConfig)
            : "";
    }

    get to() {
        const node = this.shadowRoot.querySelector('span[data-ref="to"]');
        const raw = node.dataset.raw;
        return raw ? parseFloat(raw) : null;
    }

    set to(value) {
        this.model.between.to = new VTime(value);
        const node = this.shadowRoot.querySelector('span[data-ref="to"]');
        node.dataset.raw = this.model.between.to.milliseconds;
        node.innerText = value
            ? this.model.between.to.getCutpoint(this.clipsConfig)
            : "";
    }

    get btnFrom() {
        return this.shadowRoot.querySelector('theme-button[data-ref="from"]');
    }

    get btnTo() {
        return this.shadowRoot.querySelector('theme-button[data-ref="to"]');
    }

    get btnDelFrom() {
        return this.shadowRoot.querySelector('[data-ref="btn-del-from"]');
    }

    get btnDelTo() {
        return this.shadowRoot.querySelector('[data-ref="btn-del-to"]');
    }
}

const CSS = css`
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
    .toggle-aspect {
        display: none;
    }
    .settings {
        grid-area: right;
        display: grid;
        grid-auto-rows: min-content;
        gap: 0.5rem;
        font-size: 0.75rem;
        white-space: nowrap;
        width: 250px;

        .actions {
            & > div {
                display: grid;
                justify-items: end;
                gap: 0.5rem;
                grid-auto-rows: min-content;

                theme-button::part(button) {
                    min-width: 150px;
                }
            }
        }

        fieldset {
            border: 2px solid var(--clr-bg-200);
            padding: 0.5rem;
            background: var(--clr-bg-100);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            border-radius: 0.25rem;

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
        }
        [data-ref="between-coords"] {
            display: none;
            &:has([data-ref]:not([data-ref^="btn"]):not(:empty)) {
                display: grid;
                justify-content: stretch;
            }

            & > div {
                display: flex;
                justify-content: space-between;
                gap: 0.5rem;
                width: 100%;

                & span:not([data-ref]) {
                    width: 5ch;
                }

                & [data-ref]:not([data-ref^="btn"]) {
                    flex-grow: 1;
                    cursor: pointer;
                }

                & .icon-stack {
                    cursor: pointer;
                }
            }
        }
    }
`;

RemoveLogo.template = html`
    <style>
        ${EDITOR_CSS}
        ${ICON_STACK_CSS}
        ${CSS}
    </style>
    ${EDITOR_TEMPLATE}
    <div class="info">
        <p>Find a black frame containing the logo on black background.</p>
        <p>Toggle Original/Mask to test.</p>
        <p>Optionally paint white parts of mask black.</p>
    </div>
    <div class="settings">
        <fieldset>
            <legend>Settings:</legend>
            <label>
                <span>Between</span>
                <theme-button data-ref="from">Start</theme-button>
                <theme-button data-ref="to">End</theme-button>
            </label>
            <label data-ref="between-coords">
                <div>
                    <span>From:</span>
                    <span data-ref="from"></span>
                    <div class="icon-stack" data-ref="btn-del-from">
                        <span class="iconify" data-icon="mdi-close"></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-close"
                        ></span>
                    </div>
                </div>
                <div>
                    <span>To:</span>
                    <span data-ref="to"></span>
                    <div class="icon-stack" data-ref="btn-del-to">
                        <span class="iconify" data-icon="mdi-close"></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-close"
                        ></span>
                    </div>
                </div>
            </label>
        </fieldset>
        <fieldset class="actions">
            <legend>Actions:</legend>
            <div>
                <theme-button class="toggle-type"
                    >${IMAGE_TYPE_ORIGINAL}</theme-button
                >
                <theme-button class="paint-button">Paint</theme-button>
                <theme-button class="paint-mask-button"
                    >Paint on Mask</theme-button
                >
            </div>
        </fieldset>
    </div>
`;

customElements.define("dialogue-removelogo", RemoveLogo);
