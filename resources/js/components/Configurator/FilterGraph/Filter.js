import { DomHelper } from "../../../Helper/Dom.js";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import CARD_CSS from "../CardCss";
import { requestCrop } from "../Tools/crop.js";
import { requestPad } from "../Tools/pad.js";
import { requestDelogo } from "../Tools/delogo.js";
import { requestRemovelogo } from "../Tools/removelogo.js";
import { requestFillborders } from "../Tools/fillborders.js";
import { requestScale } from "../Tools/scale.js";
import { VTime } from "../../../Helper/Time.js";
import { saveCustomMask } from "../Dialogues/RemoveLogo/index.js";
import Paint from "../../../Helper/Paint.js";
import { Request } from "../../Request/index.js";
import { STATE_INFO } from "../../Toast/index.js";

class Filter extends HTMLElement {
    constructor() {
        super();
        DomHelper.initDom.call(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleModify = this.handleModify.bind(this);
        this.handleClipsLoaded = this.handleClipsLoaded.bind(this);
        this.description = "";
    }

    connectedCallback() {
        document.addEventListener("clips-updated", this.handleClipsLoaded);
        this.btnDelete.addEventListener("click", this.handleDelete);
        this.btnEdit.addEventListener("click", this.handleModify);
        requestAnimationFrame(() => {
            this.description = this.updateDescription();
            Iconify.scan(this.shadowRoot);
        });
    }

    disconnectedCallback() {
        document.removeEventListener("clips-updated", this.handleClipsLoaded);
        this.btnDelete.removeEventListener("click", this.handleDelete);
        this.btnEdit.removeEventListener("click", this.handleModify);
    }

    handleModify(e) {
        const idx = Number(this.dataset.id);
        const filterData = this.configurator.filterGraph[idx];
        switch (filterData.filterType) {
            case "delogo":
                requestDelogo.call(this.configurator, filterData);
                break;
            case "crop":
                requestCrop.call(this.configurator, filterData);
                break;
            case "pad":
                requestPad.call(this.configurator, filterData);
                break;
            case "removeLogo":
                requestRemovelogo.call(this.configurator, filterData);
                break;
            case "fillborders":
                requestFillborders.call(this.configurator, filterData);
                break;
            case "scale":
                requestScale.call(this.configurator, filterData);
                break;
        }
    }

    handleClipsLoaded() {
        this.description = this.updateDescription();
    }

    async handleDelete(e) {
        try {
            const m = document.createElement("modal-confirm");
            m.header = "Delete Filter";
            m.content = "Are you sure?";
            document.body.appendChild(m);
            await m.confirm();
            this.configurator.filterGraph.splice(parseInt(this.dataset.id), 1);
            if (this.filterData.filterType === "removeLogo") {
                const path = this.configurator.item.path;
                const fileId = this.filterData.fileId;
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
            }
            await this.configurator.saveSettings();
        } catch (error) {
            if (error !== "cancel") {
                console.error(
                    "Critical error during filter delete operation:",
                    error,
                );
            }
        }
    }

    updateDescription() {
        const clips = this.configurator.clips;
        let from;
        let to;

        if (this.filterData.between) {
            from = new VTime(this.filterData.between?.from * 1000);
            to = new VTime(this.filterData.between?.to * 1000);
            const duration = new VTime(clips.totalDuration);
            if (from.date) {
                const ts = VTime.calcCut(clips.clips, from.milliseconds);
                from = new VTime(ts);
                if (from >= duration) {
                    this.itemNode.classList.add("error");
                    this.itemNode.dataset.fromError = "out-of-range";
                }
            }
            if (to.date) {
                to = new VTime(VTime.calcCut(clips.clips, to.milliseconds));
                if (to >= duration) {
                    this.itemNode.classList.add("error");
                    this.itemNode.dataset.toError = "out-of-range";
                }
            }
        }

        if (this.filterData.filterType === "crop") {
            if (this.filterData.replaceBlackBorders) {
                return `replace borders${this.filterData.mirror ? " (mirrored)" : ""}`;
            }
        }
        if (this.filterData.filterType === "scale") {
            return `${this.filterData.width} x ${this.filterData.height}`;
        }
        if (this.filterData.filterType === "removeLogo") {
            return `${from.toString()} - ${to.toString()}, ${new VTime(this.filterData.timestamp).getCutpoint(clips.clips)}`;
        }
        if (this.filterData.filterType === "fillborders") {
            return (
                `${from.toString()} - ${to.toString()}, ` +
                `Top: ${this.filterData.top}px, ` +
                `Right: ${this.filterData.right}px, ` +
                `Bottom: ${this.filterData.bottom}px, ` +
                `Left: ${this.filterData.left}px`
            );
        }
        if (this.filterData.filterType === "delogo") {
            return `${from.toString()} - ${to.toString()}, Top: ${this.filterData.y}px, Left: ${this.filterData.x}px, ${this.filterData.w}px x ${this.filterData.h}px`;
        }
        return "";
    }

    get itemNode() {
        return this.shadowRoot.querySelector(".item");
    }

    get labelFilterType() {
        return this.shadowRoot.querySelector(".filterType");
    }

    get labelDescription() {
        return this.shadowRoot.querySelector(".description");
    }

    get btnEdit() {
        return this.shadowRoot.querySelector(".btn-edit");
    }

    get btnDelete() {
        return this.shadowRoot.querySelector(".btn-delete");
    }

    get logoMaskImage() {
        return this.shadowRoot.querySelector('[data-type="logomask"]');
    }

    set filterData(filterData) {
        this.itemNode.dataset.filterData = JSON.stringify(filterData);
        this.labelFilterType.setAttribute("value", filterData.filterType);
        this.labelFilterType.innerText = `${this.dataset.id}. ${filterData.filterType}`;
        if (filterData.filterType === "removeLogo") {
            const src = () =>
                `/removelogo/${this.configurator.item.path}/${filterData.fileId}?${performance.now()}`;
            this.logoMaskImage.src = src();
            this.logoMaskImage.addEventListener("click", () => {
                Paint.init(
                    async (image) => {
                        await saveCustomMask(
                            image,
                            this.configurator.item.path,
                            filterData.fileId,
                        );
                    },
                    () => {
                        this.logoMaskImage.src = src();
                    },
                ).show(this.logoMaskImage.src);
            });
        } else {
            this.logoMaskImage.remove();
        }
    }

    get filterData() {
        return JSON.parse(this.itemNode.dataset.filterData);
    }

    set description(value) {
        this.labelDescription.innerText = value;
    }

    set groupColor(color) {
        this.style.setProperty("--group-color", color);
    }

    set grouped(value) {
        this.toggleAttribute("data-grouped", value);
    }
}

const CSS = css`
    :host {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    :host([data-immutable]) .icon-stack {
        pointer-events: none;
        opacity: 0.6;
    }
    :host([data-grouped]) section {
        border-left-color: transparent;
        padding-left: 8px;
    }
    :host([data-grouped]) section::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--group-color);
    }
    section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        border-left: 4px solid var(--group-color, transparent);
        position: relative;

        &:has(.error) {
            background-color: hsl(from var(--clr-bg-150) var(--hue-error) s l);
        }
        .item {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-grow: 1;

            &:has(img[src]) {
                justify-content: space-between;

                span:last-of-type {
                    flex-grow: 1;
                }
            }

            img[src] {
                max-height: 2rem;
                cursor: pointer;
            }

            img:not([src]) {
                display: none;
            }
        }
    }
    .icon-stack {
        cursor: pointer;
    }
`;

Filter.template = html`
    <style>
        ${CARD_CSS}
        ${ICON_STACK_CSS}
        ${CSS}
    </style>
    <section>
        <div class="item">
            <span class="filterType"></span>
            <span class="description"></span>
            <img data-type="logomask" />
        </div>
    </section>
    <div class="btns">
        <div class="icon-stack btn-edit">
            <span class="iconify" data-icon="mdi-pencil-outline"></span>
            <span class="iconify hover" data-icon="mdi-pencil-outline"></span>
        </div>
        <div class="icon-stack btn-delete">
            <span class="iconify" data-icon="mdi-close"></span>
            <span class="iconify hover" data-icon="mdi-close"></span>
        </div>
    </div>
`;

customElements.define("transcode-configurator-filter", Filter);
