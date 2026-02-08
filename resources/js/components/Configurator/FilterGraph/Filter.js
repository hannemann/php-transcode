import { DomHelper } from "../../../Helper/Dom.js";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import CARD_CSS from "../CardCss";
import { requestCrop } from "../Tools/crop.js";
import { requestDelogo } from "../Tools/delogo.js";
import { requestRemovelogo } from "../Tools/removelogo.js";
import { requestFillborders } from "../Tools/fillborders.js";
import { VTime } from "../../../Helper/Time.js";
import { saveCustomMask } from "../Dialogues/RemoveLogo/index.js";
import Paint from "../../../Helper/Paint.js";

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
        this.labelFilterType.addEventListener("click", this.handleModify);
        requestAnimationFrame(() => {
            this.description = this.updateDescription();
            Iconify.scan(this.shadowRoot);
        });
    }

    disconnectedCallback() {
        document.removeEventListener("clips-updated", this.handleClipsLoaded);
        this.btnDelete.removeEventListener("click", this.handleDelete);
        this.labelFilterType.removeEventListener("click", this.handleModify);
    }

    handleModify(e) {
        switch (this.filterData.filterType) {
            case "delogo":
                requestDelogo.call(
                    this.configurator,
                    "cpu",
                    parseInt(this.dataset.id),
                    this.filterData,
                );
                break;
            case "crop":
                requestCrop.call(
                    this.configurator,
                    "cpu",
                    parseInt(this.dataset.id),
                    this.filterData,
                );
                break;
            case "removeLogo":
                requestRemovelogo.call(
                    this.configurator,
                    "cpu",
                    parseInt(this.dataset.id),
                    this.filterData,
                );
                break;
            case "fillborders":
                requestFillborders.call(
                    this.configurator,
                    "cpu",
                    parseInt(this.dataset.id),
                    this.filterData,
                );
                break;
        }
    }

    handleClipsLoaded() {
        this.description = this.updateDescription();
    }

    async handleDelete(e) {
        this.configurator.filterGraph.splice(parseInt(this.dataset.id), 1);
        await this.configurator.saveSettings();
    }

    updateDescription() {
        if (this.filterData.filterType === "crop") {
            if (this.filterData.replaceBlackBorders) {
                return `replace borders${this.filterData.mirror ? " (mirrored)" : ""}`;
            }
        }
        if (this.filterData.filterType === "scale") {
            return `${this.filterData.width} x ${this.filterData.height}`;
        }
        if (this.filterData.filterType === "removeLogo") {
            return `${this.filterData.timestamp}`;
        }
        if (this.filterData.filterType === "delogo") {
            let from = new VTime(this.filterData.between?.from * 1000);
            let to = new VTime(this.filterData.between?.to * 1000);
            const clips = this.configurator.clips;
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
            this.logoMaskImage.src = `/removelogo/${this.configurator.item.path}?${performance.now()}`;
            this.logoMaskImage.addEventListener("click", () => {
                Paint.init(
                    async (image) => {
                        await saveCustomMask(
                            image,
                            this.configurator.item.path,
                        );
                    },
                    () => {
                        this.logoMaskImage.src = `/removelogo/${this.configurator.item.path}?${performance.now()}`;
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
}

Filter.template = html`
    ${ICON_STACK_CSS} ${CARD_CSS}
    <style>
        section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;

            &:has(.error) {
                background-color: hsl(
                    from var(--clr-bg-150) var(--hue-error) s l
                );
            }
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
        .icon-stack,
        .filterType {
            cursor: pointer;
        }
    </style>
    <section>
        <div class="item">
            <span class="filterType"></span>
            <span class="description"></span>
            <img data-type="logomask" />
        </div>
        <div class="icon-stack btn-delete">
            <span class="iconify" data-icon="mdi-close"></span>
            <span class="iconify hover" data-icon="mdi-close"></span>
        </div>
    </section>
`;

customElements.define("transcode-configurator-filter", Filter);
