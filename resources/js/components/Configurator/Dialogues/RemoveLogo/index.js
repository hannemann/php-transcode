import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import Paint from "../../../../Helper/Paint";
import { Request } from "../../../Request";
import { VTime } from "../../../../Helper/Time";
import { STATE_INFO } from "../../../Toast";
import { RemoveLogo as Model } from "../../../../Models/Filters/RemoveLogo";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";

const IMAGE_TYPE_ORIGINAL = "Original";
const IMAGE_TYPE_MASK = "Mask";

export const alertWhitePixelError = async (percentage) => {
    const message = `${Math.round(percentage)}% is too much white`;
    const m = document.createElement("modal-alert");
    m.innerText = message;
    document.body.appendChild(m);
    await m.alert();
    return message;
};

export const saveCustomMask = async function (image, path, fileId) {
    const nonBlackPercent = Paint.getWhitePixelPercent();
    if (nonBlackPercent > 10) {
        throw new Error(await alertWhitePixelError(nonBlackPercent));
    } else {
        const data = {
            image: image.asDataURL("image/png"),
        };
        const response = await Request.post(
            `/removelogoCustomMask/${encodeURIComponent(path)}/${fileId}`,
            data,
        );
        const result = await response.json();
        document.dispatchEvent(
            new CustomEvent("toast", {
                detail: {
                    message: result.message,
                    type: STATE_INFO,
                },
            }),
        );
    }
};

class RemoveLogo extends VideoEditor {
    /**
     * @type {Model}
     */
    model;
    raw = [-1];
    isSaved = false;

    connectedCallback() {
        super.connectedCallback();
        requestAnimationFrame(() => {
            this.current = this.model.timestamp.milliseconds || 0;
            this.width = parseInt(this.video.width);
            this.height = parseInt(this.video.height);
            this.isSaved = this.model.hasFilterIndex;
            this.updateImages();
            this.image.addEventListener(
                "load",
                () => {
                    this.from = this.model.between.from;
                    this.to = this.model.between.to;
                    this.dispatchEvent(new CustomEvent("removologo-loaded"));
                    console.log("Image loaded", this.image.src);
                    this.maskThumb.addEventListener(
                        "load",
                        () => {
                            console.log("Mask loaded", this.maskThumb.src);
                            this.btnToggleType.disabled = false;
                            this.btnEditMask.disabled = false;
                            this.btnSaveMask.disabled = false;
                            this.btnTogglePreview.toggleAttribute(
                                "disabled",
                                !this.isSaved,
                            );
                            this.btnDeleteMask.disabled = false;
                            if (this.model.hasFilterIndex) {
                                Paint.checkImage = this.maskThumb;
                                this.model.originalMaskData =
                                    Paint.checkWhitePixelCanvas.toDataURL(
                                        "image/png",
                                    );
                                Paint.clearPaintArea();
                            }
                        },
                        { once: true },
                    );
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
        this.togglePreview = this.togglePreview.bind(this);
        this.paint = this.paint.bind(this);
        this.save = this.save.bind(this);
        this.deleteMask = this.deleteMask.bind(this);
        this.handleFromTo = this.handleFromTo.bind(this);
    }

    addListeners() {
        super.addListeners();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        this.btnEditMask.addEventListener("click", this.paint);
        this.maskThumb.addEventListener("click", this.paint);
        this.btnToggleType.addEventListener("click", this.toggleType);
        this.btnTogglePreview.addEventListener("click", this.togglePreview);
        this.btnSaveMask.addEventListener("click", this.save);
        this.btnDeleteMask.addEventListener("click", this.deleteMask);

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
        this.btnEditMask.removeEventListener("click", this.paint);
        this.maskThumb.removeEventListener("click", this.paint);
        this.btnToggleType.removeEventListener("click", this.toggleType);
        this.btnTogglePreview.removeEventListener("click", this.togglePreview);
        this.btnSaveMask.removeEventListener("click", this.save);
        this.btnDeleteMask.removeEventListener("click", this.deleteMask);

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

    async save() {
        const canvas = Paint.checkWhitePixelCanvas;
        Paint.checkImage = this.maskThumb;
        let result;
        try {
            await saveCustomMask(
                {
                    asDataURL: () => canvas.toDataURL("image/png"),
                },
                this.path,
                this.model.fileId,
            );
            if (!this.model.hasFilterIndex) {
                this.configurator.filterGraph.push(this.model);
            }
            this.configurator.filterGraph.reindex();
            this.model.timestamp = this.current;
            await this.configurator.saveSettings();
            this.filterIndex = this.model.filterIndex;
            this.isSaved = true;
        } catch (error) {
            console.error(error);
        } finally {
            Paint.clearPaintArea();
            this.updateFrameUrl();
            this.btnTogglePreview.toggleAttribute("disabled", !this.isSaved);
            return result;
        }
    }

    async deleteMask() {
        const path = this.path;
        const fileId = this.model.fileId;
        const response = await Request.delete(
            `/removelogoImage/${path}/${fileId}`,
        );
        const result = await response.json();
        document.dispatchEvent(
            new CustomEvent("toast", {
                detail: {
                    message: result.message,
                    type: STATE_INFO,
                },
            }),
        );
        this.maskThumb.src = this.image.src.replace(
            "/image/",
            "/removelogoImage/",
        );
        this.isSaved = false;
        this.btnTogglePreview.toggleAttribute("disabled", !this.isSaved);
    }

    paint() {
        Paint.init(
            async (image) => {
                await saveCustomMask(image, this.path, this.model.fileId);
                this.model.timestamp = this.current;
                if (!this.model.hasFilterIndex) {
                    this.configurator.filterGraph.push(this.model);
                }
                await this.configurator.saveSettings();
                this.filterIndex = this.model.filterIndex;
                this.isSaved = true;
            },
            () => {
                this.updateFrameUrl();
                this.btnTogglePreview.toggleAttribute(
                    "disabled",
                    !this.isSaved,
                );
            },
        ).show(this.maskThumb.src);
    }

    toggleType() {
        if (!this.btnToggleType.classList.contains("active")) {
            this.btnToggleType.classList.add("active");
        } else {
            this.btnToggleType.classList.remove("active");
        }
        this.updateFrameUrl();
    }

    async togglePreview() {
        if (this.filterIndex !== this.model.filterIndex) {
            this.filterIndex = this.model.filterIndex;
            this.btnTogglePreview.classList.remove("active");
        } else {
            try {
                Paint.checkImage = this.maskThumb;
                const nonBlackPercent = Paint.getWhitePixelPercent();
                Paint.clearPaintArea();
                if (nonBlackPercent > 10) {
                    throw new Error(
                        await alertWhitePixelError(nonBlackPercent),
                    );
                }
                this.filterIndex = this.model.filterIndex + 1;
                this.btnTogglePreview.classList.add("active");
            } catch (error) {
                console.error(error);
            }
        }
        this.updateFrameUrl(performance.now());
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

    /**
     * update image url
     * also update thumbnail url
     */
    async updateFrameUrl(cacheBuster = null) {
        this.image.addEventListener(
            "load",
            () => {
                this.updateThumb();
            },
            { once: true },
        );
        super.updateFrameUrl(cacheBuster);
    }

    updateThumb() {
        this.maskThumb.src = !this.isSaved
            ? this.image.src.replace("/image/", "/removelogoImage/")
            : `/removelogo/${this.configurator.item.path}/${this.model.fileId}?${performance.now()}`;
    }

    get baseThumbUrl() {
        return super.baseUrl;
    }

    get baseUrl() {
        return !this.btnToggleType.classList.contains("active")
            ? super.baseUrl
            : `/removelogoImage/${encodeURIComponent(this.path)}?timestamp=`;
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

    get btnToggleType() {
        return this.shadowRoot.querySelector('[data-ref="btn-toggle-type"]');
    }

    get btnTogglePreview() {
        return this.shadowRoot.querySelector('[data-ref="btn-preview-mask"]');
    }

    get btnSaveMask() {
        return this.shadowRoot.querySelector('[data-ref="btn-save-mask"]');
    }

    get btnEditMask() {
        return this.shadowRoot.querySelector('[data-ref="btn-edit-mask"]');
    }

    get btnDeleteMask() {
        return this.shadowRoot.querySelector('[data-ref="btn-delete-mask"]');
    }

    get maskThumb() {
        return this.shadowRoot.querySelector('[data-ref="mask-thumb"]');
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

        .display-options,
        .actions {
            & > div {
                display: grid;
                justify-items: end;
                gap: 0.5rem;
                grid-auto-rows: min-content;
            }

            & > span {
                white-space: initial;

                &.warning {
                    color: var(--clr-text-warn);
                }
            }
        }

        .preview-btns {
            grid-template-columns: 1fr 1fr;

            theme-button {
                width: 100%;
            }
        }

        .mask-actions {
            display: flex;
            gap: 0.5rem;

            [data-ref^="btn-"] {
                cursor: pointer;
                font-size: 1rem;
            }
        }

        [data-ref="mask-thumb"] {
            width: 100%;
            aspect-ratio: 16 / 9;
            cursor: pointer;
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
        <fieldset class="display-options">
            <legend>Logomask:</legend>
            <div>
                <div class="mask-actions">
                    <button
                        class="icon-stack"
                        data-ref="btn-toggle-type"
                        title="Toggle Image Type"
                        disabled="disabled"
                    >
                        <span
                            class="iconify inactive"
                            data-icon="mdi-toggle-switch-off-outline"
                        ></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-toggle-switch-off-outline"
                        ></span>
                        <span
                            class="iconify active"
                            data-icon="mdi-toggle-switch-outline"
                        ></span>
                    </button>
                    <button
                        class="icon-stack"
                        data-ref="btn-edit-mask"
                        title="Edit Mask"
                        disabled="disabled"
                    >
                        <span
                            class="iconify"
                            data-icon="mdi-pencil-outline"
                        ></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-pencil-outline"
                        ></span>
                    </button>
                    <button
                        class="icon-stack"
                        data-ref="btn-save-mask"
                        title="Save Mask"
                        disabled="disabled"
                    >
                        <span
                            class="iconify"
                            data-icon="mdi-content-save-outline"
                        ></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-content-save-outline"
                        ></span>
                    </button>
                    <button
                        class="icon-stack"
                        data-ref="btn-preview-mask"
                        title="Toggle Preview"
                        disabled="disabled"
                    >
                        <span
                            class="iconify"
                            data-icon="mdi-eye-outline"
                        ></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-eye-outline"
                        ></span>
                    </button>
                    <button
                        class="icon-stack"
                        data-ref="btn-delete-mask"
                        title="Delete Mask"
                        disabled="disabled"
                    >
                        <span class="iconify" data-icon="mdi-close"></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-close"
                        ></span>
                    </button>
                </div>
                <img data-ref="mask-thumb" title="Edit Mask" />
            </div>
        </fieldset>
    </div>
`;

customElements.define("dialogue-removelogo", RemoveLogo);
