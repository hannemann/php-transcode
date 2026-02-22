import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { VTime } from "../../../../Helper/Time";
import { saveDelogo } from "../../Tools/delogo";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import Iconify from "@iconify/iconify/dist/iconify.js";
import { Delogo } from "../../../../Models/Filters/Delogo";
import "./Filters/Item";

export class DeLogo extends VideoEditor {
    /**
     * @type {Delogo}
     */
    model;
    delogoOffsetTop = 0;
    delogoOffsetLeft = 0;
    delogoOffsetBottom = null;
    delogoOffsetRight = null;

    connectedCallback() {
        this.initDelogo = this.initDelogo.bind(this);
        this.createItem = this.createItem.bind(this);
        super.connectedCallback();
        this.isEdit = false;
        this.saved = false;
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initDelogo, {
                once: true,
            });
            this.isSaved = this.saved;
            this.initFilters();
            Iconify.scan(this.shadowRoot);
        });
    }

    initDelogo() {
        console.info("Initialize Delogo");
        this.addListeners();
        this.resetBetween();
        this.zoomImage = this.zoom.appendChild(document.createElement("img"));
        this.zoomImage.src = this.image.src;
        this.addDelogoBox({
            offsetX: Math.round(
                this.image.offsetLeft + this.image.width / 2 - 10,
            ),
            offsetY: Math.round(
                this.image.offsetTop + this.image.height / 2 - 10,
            ),
        });
    }

    bindListeners() {
        super.bindListeners();
        this.addDelogoBox = this.addDelogoBox.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.setBetweenFrom = this.setBetweenFrom.bind(this);
        this.setBetweenTo = this.setBetweenTo.bind(this);
        this.resetBetween = this.resetBetween.bind(this);
        this.gotoBetweenFrom = this.gotoBetweenFrom.bind(this);
        this.gotoBetweenTo = this.gotoBetweenTo.bind(this);
        this.save = this.save.bind(this);
        this.addNext = this.addNext.bind(this);
        this.editItem = this.editItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.copyItem = this.copyItem.bind(this);
        this.showItemTimeRange = this.showItemTimeRange.bind(this);
    }

    addListeners() {
        super.addListeners();
        this.image.addEventListener("click", this.addDelogoBox);
        document.addEventListener("keydown", this.handleKey);

        this.addButton.addEventListener("click", this.addNext);
        this.saveButton.addEventListener("click", this.save);

        this.btnBetweenFrom.addEventListener("click", this.setBetweenFrom);
        this.btnBetweenTo.addEventListener("click", this.setBetweenTo);
        this.btnBetweenReset.addEventListener("click", this.resetBetween);

        this.displayBetweenFrom.addEventListener("click", this.gotoBetweenFrom);
        this.displayBetweenTo.addEventListener("click", this.gotoBetweenTo);

        this.addItemListeners();
    }

    addItemListeners() {
        this.filtersContainer.addEventListener("delogo-item-edit", this);
        this.filtersContainer.addEventListener("delogo-item-copy", this);
        this.filtersContainer.addEventListener("delogo-item-delete", this);
        this.filtersContainer.addEventListener("delogo-item-on", this);
        this.filtersContainer.addEventListener("delogo-item-off", this);
    }

    removeListeners() {
        super.removeListeners();
        this.image.removeEventListener("click", this.addDelogoBox);
        document.removeEventListener("keydown", this.handleKey);

        this.addButton.removeEventListener("click", this.addNext);
        this.saveButton.removeEventListener("click", this.save);

        this.btnBetweenFrom.removeEventListener("click", this.setBetweenFrom);
        this.btnBetweenTo.removeEventListener("click", this.setBetweenTo);
        this.btnBetweenReset.removeEventListener("click", this.resetBetween);

        this.displayBetweenFrom.removeEventListener(
            "click",
            this.gotoBetweenFrom,
        );
        this.displayBetweenTo.removeEventListener("click", this.gotoBetweenTo);

        this.removeItemListeners();
    }

    removeItemListeners() {
        this.filtersContainer.removeEventListener("delogo-item-edit", this);
        this.filtersContainer.removeEventListener("delogo-item-copy", this);
        this.filtersContainer.removeEventListener("delogo-item-delete", this);
        this.filtersContainer.removeEventListener("delogo-item-on", this);
        this.filtersContainer.removeEventListener("delogo-item-off", this);
    }

    /**
     * Central event hub for the VideoEditor
     * @param {CustomEvent} e
     */
    handleEvent(e) {
        const itemComponent = e.detail?.item;
        const index = itemComponent?.index;

        switch (e.type) {
            case "delogo-item-edit":
                this.editItem(index);
                break;
            case "delogo-item-copy":
                this.copyItem(index);
                break;
            case "delogo-item-delete":
                this.deleteItem(index);
                break;
            case "delogo-item-on":
                this.showItemTimeRange(index);
                break;
            case "delogo-item-off":
                this.hideItemTimeRange();
                break;
        }
    }

    updateFrameUrl() {
        this.image.addEventListener(
            "load",
            () => {
                if (!this.zoomImage) return;
                this.zoomImage.src = this.image.src;
            },
            { once: true },
        );
        super.updateFrameUrl();
    }

    addDelogoBox(e) {
        requestAnimationFrame(() => {
            // need to wait for offset properties to be calculated properly
            if (!this.delogoBox) {
                this.delogoBox = document.createElement("div");
                this.shadowRoot.appendChild(this.delogoBox);
                this.delogoBox.classList.add("box");
                this.zoomDelogoBox = this.zoom.appendChild(
                    this.delogoBox.cloneNode(true),
                );
                this.delogoBox.style.width = `20px`;
                this.delogoBox.style.height = `20px`;
            }
            if (!this.itemBox) {
                this.itemBox = document.createElement("div");
                this.shadowRoot.appendChild(this.itemBox);
                this.itemBox.classList.add("fake-box");
            }
            //console.log(e, e.offsetX, e.offsetY);
            this.delogoOffsetTop =
                e.offsetY - Math.round(this.delogoBox.offsetHeight / 2);
            this.delogoOffsetLeft =
                e.offsetX - Math.round(this.delogoBox.offsetWidth / 2);
            this.delogoBox.style.top = `${Math.max(
                this.image.offsetTop,
                Math.min(
                    this.image.offsetTop +
                        this.image.height -
                        this.delogoBox.offsetHeight,
                    this.delogoOffsetTop,
                ),
            )}px`;
            this.delogoBox.style.left = `${Math.max(
                this.image.offsetLeft,
                Math.min(
                    this.image.offsetLeft +
                        this.image.width -
                        this.delogoBox.offsetWidth,
                    this.delogoOffsetLeft,
                ),
            )}px`;
            this.updateZoom();
        });
    }

    updateZoom() {
        const image = this.image.getBoundingClientRect();
        const tr = `translate(
            ${
                (this.coords.x -
                    this.zoom.offsetWidth / 2 +
                    this.coords.w / 2) *
                -1
            }px,
            ${
                (this.coords.y -
                    this.zoom.offsetHeight / 2 +
                    this.coords.h / 2) *
                -1
            }px
            )`;
        this.zoomImage.style.transform = tr;
        this.zoomDelogoBox.style.top = `${this.coords.y}px`;
        this.zoomDelogoBox.style.left = `${this.coords.x}px`;
        this.zoomDelogoBox.style.width = `${this.coords.w}px`;
        this.zoomDelogoBox.style.height = `${this.coords.h}px`;
        this.zoomDelogoBox.style.transform = tr;
        this.displayLeft.innerText = `${this.coords.x}px`;
        this.displayTop.innerText = `${this.coords.y}px`;
        this.displayWidth.innerText = `${this.coords.w}px`;
        this.displayHeight.innerText = `${this.coords.h}px`;
        this.dispatchEvent(new CustomEvent("delogo-updated"));
    }

    handleKey(e) {
        if (this.delogoBox) {
            e.preventDefault();
            const delta = e.shiftKey ? 10 : 1;
            if (e.ctrlKey) {
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.left = `${Math.min(
                        this.delogoBox.offsetLeft + delta,
                        this.image.offsetLeft +
                            this.image.width -
                            1 -
                            this.delogoBox.offsetWidth,
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.left = `${Math.max(
                        this.delogoBox.offsetLeft - delta,
                        this.image.offsetLeft + 1,
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.top = `${Math.min(
                        this.delogoBox.offsetTop + delta,
                        this.image.offsetTop +
                            this.image.height -
                            1 -
                            this.delogoBox.offsetHeight,
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.top = `${Math.max(
                        this.delogoBox.offsetTop - delta,
                        this.image.offsetTop + 1,
                    )}px`;
                }
            } else {
                const box = this.delogoBox.getBoundingClientRect();
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.width = `${Math.min(
                        this.delogoBox.offsetWidth + delta,
                        this.image.offsetLeft +
                            this.image.offsetWidth -
                            1 -
                            this.delogoBox.offsetLeft,
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.width = `${Math.max(
                        this.delogoBox.offsetWidth - delta,
                        5,
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.height = `${Math.min(
                        this.delogoBox.offsetHeight + delta,
                        this.image.offsetTop +
                            this.image.offsetHeight -
                            1 -
                            this.delogoBox.offsetTop,
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.height = `${Math.max(
                        this.delogoBox.offsetHeight - delta,
                        5,
                    )}px`;
                }
            }
            this.model.coords = this.coords;
            this.updateZoom();
        }
    }

    setBetweenFrom() {
        this.model.between.from = this.timestamp();
        this.betweenFrom = this.model.between.from?.getCutpoint(
            this.clipsConfig,
        );
    }

    setBetweenTo() {
        this.model.between.to = this.timestamp();
        this.betweenTo = this.model.between.to?.getCutpoint(this.clipsConfig);
    }

    resetBetween() {
        if (this.model) {
            this.model.between.from = null;
            this.model.between.to = null;
        }
        this.betweenFrom = "n/a";
        this.betweenTo = "n/a";
    }

    gotoBetweenFrom() {
        if (!this.model.between.from) return;
        this.current = this.model.between.from.milliseconds;
        this.updateIndicatorPos();
        this.updateImages();
    }

    gotoBetweenTo() {
        if (!this.model.between.to) return;
        this.current = this.model.between.to.milliseconds;
        this.updateIndicatorPos();
        this.updateImages();
    }

    /**
     *
     * @param {Number} idx
     * @returns
     */
    editItem(idx) {
        const item = this.filtersContainer.querySelector(
            `delogo-filter-item[data-index="${idx}"]`,
        );
        if (item.active) {
            this.activeDelogoFilter = null;
            this.resetModel();
            this.resetBetween();
            this.isSaved = true;
            return;
        }
        this.filterIndex = idx;
        this.model = this.configurator.filterGraph[idx];
        this.isSaved = false;
        this.applyModelData();
        this.activeDelogoFilter = idx;
    }

    /**
     * @param {Number} idx
     */
    async deleteItem(idx) {
        this.configurator.filterGraph.splice(idx, 1);

        document.addEventListener(
            "clips-loaded",
            () => {
                this.isSaved = true;
                this.resetModel();
                this.initFilters();
            },
            { once: true },
        );

        await this.configurator.saveSettings();
    }

    /**
     * @param {Number} idx
     */
    async copyItem(idx) {
        const src = this.configurator.filterGraph[idx];
        const dest = structuredClone(src);
        dest.filterIndex =
            this.configurator.filterGraph.getProposedFilterIndex("delogo");

        dest.between.from = new VTime(this.current).seconds;
        dest.between.to = new VTime(this.current).seconds;

        this.configurator.filterGraph.splice(dest.filterIndex, 0, dest);

        document.addEventListener(
            "clips-loaded",
            () => {
                this.isSaved = true;
                this.initFilters();
                this.editItem(this.lastFilterNode.index);
            },
            { once: true },
        );

        await this.configurator.saveSettings();
    }

    initFilters() {
        this.filters = [...this.configurator.filterGraph].filter((f, k) => {
            if (f.filterType !== "delogo") return false;
            f.index = k;
            return true;
        });
    }

    /**
     *
     * @param {Delogo} item
     * @returns {HTMLElement}
     */
    createItem(item) {
        const node = document.createElement("delogo-filter-item");
        node.clipsConfig = this.clipsConfig;
        node.totalDuration = new VTime(this.configurator.clips.totalDuration);
        node.model = item;

        return node;
    }

    showItemTimeRange(index) {
        this.hideItemTimeRange();
        const delogo = this.configurator.filterGraph[index];
        this.itemCoords = delogo;
        this.indicatorRangeByTimestamp = {
            from: delogo.between.from.seconds || 0,
            to: delogo.between.to.seconds || 0,
        };
        this.itemBox.classList.add("active");
    }

    hideItemTimeRange() {
        this.itemBox?.classList.remove("active");
        this.indicatorByTimestamp = null;
    }

    run() {
        const isNew = this.configurator.filterGraph.indexOf(this.model) > -1;
        if (isNew) {
            this.applyModelData();
        } else {
            this.addNext();
        }
    }

    save() {
        saveDelogo.call(this.configurator, this, this.isEdit);
        this.isSaved = this.saved;
        this.initFilters();
        this.activeDelogoFilter = null;
        this.resetModel();
        Iconify.scan(this.shadowRoot);
    }

    applyModelData() {
        this.isEdit = true;
        this.isSaved = false;
        this.coords = this.model.coords;
        this.betweenFrom = this.model.between.from?.getCutpoint(
            this.clipsConfig,
        );
        this.betweenTo = this.model.between.to?.getCutpoint(this.clipsConfig);
        this.updateZoom();
        this.current = this.model.between.from.milliseconds;
        this.updateIndicatorPos();
        this.updateImages();
        this.activeDelogoFilter = this.filterIndex;
    }

    addNext() {
        this.isEdit = false;
        this.isSaved = false;
        this.resetBetween();
        this.model.coords = this.coords;
        this.model.between.from = this.current / 1000;
        this.model.between.to = this.current / 1000;
        this.filterIndex = this.model.filterIndex;
        const filters = this.filters;
        filters.push(this.model);
        this.filters = filters;
        this.activeDelogoFilter = this.model.filterIndex;
    }

    resetModel() {
        this.model = new Delogo(
            this.configurator.filterGraph.getProposedFilterIndex("delogo"),
        );
        this.filterIndex = this.model.filterIndex;
    }

    set filters(items) {
        this.hideItemTimeRange();
        this.filtersContainer.replaceChildren(...items.map(this.createItem));
        Iconify.scan(this.shadowRoot);
    }

    get filters() {
        return [...this.filtersContainer.querySelectorAll(":scope > div")].map(
            (i) => {
                return this.configurator.filterGraph[Number(i.dataset.index)];
            },
        );
    }

    get lastFilterNode() {
        return this.filtersContainer.querySelector(
            ":nth-last-child(1 of delogo-filter-item)",
        );
    }

    set isSaved(value) {
        this.saved = !!value;
        this.saveButton.disabled = this.saved;
        this.addButton.disabled = !this.saved;
    }

    set activeDelogoFilter(item) {
        this.shadowRoot
            .querySelectorAll(".filters delogo-filter-item")
            .forEach((f) => (f.active = false));
        if (!isNaN(item)) {
            item = this.shadowRoot.querySelector(
                `.filters [data-index="${item}"]`,
            );
        }
        if (item) {
            item.active = true;
        }
    }

    /**
     * coords of specific item, used to show position in timeline on hover
     */
    set itemCoords(coord) {
        const image = this.imageRect;
        const ratio = this.videoImageRatio;
        this.itemBox.style.top = `${Math.round(coord.y / ratio)}px`;
        this.itemBox.style.left = `${Math.round(coord.x / ratio + (Math.round(image.left) - this.offsetLeft))}px`;
        this.itemBox.style.height = `${Math.round(coord.h / ratio)}px`;
        this.itemBox.style.width = `${Math.round(coord.w / ratio)}px`;
    }

    set coords(coord) {
        const image = this.imageRect;
        const ratio = this.videoImageRatio;
        this.delogoBox.style.top = `${Math.round(coord.y / ratio)}px`;
        this.delogoBox.style.left = `${Math.round(coord.x / ratio + (Math.round(image.left) - this.offsetLeft))}px`;
        this.delogoBox.style.height = `${Math.round(coord.h / ratio)}px`;
        this.delogoBox.style.width = `${Math.round(coord.w / ratio)}px`;
    }

    get coords() {
        if (this.delogoBox) {
            const box = this.delogoBox.getBoundingClientRect();
            const image = this.imageRect;
            const ratio = this.videoImageRatio;
            return {
                x: Math.round((box.left - Math.round(image.left)) * ratio),
                y: Math.round((box.top - image.top) * ratio),
                w: Math.round(box.width * ratio),
                h: Math.round(box.height * ratio),
            };
        } else {
            return null;
        }
    }

    get imageRect() {
        return this.image.getBoundingClientRect();
    }

    get videoImageRatio() {
        const scaleRatio = this.image.naturalWidth / this.video.width;
        return (this.video.width / this.imageRect.width) * scaleRatio;
    }

    get betweenFrom() {
        return this.displayBetweenFrom.querySelector("span:last-of-type")
            .innerText;
    }

    set betweenFrom(value) {
        this.displayBetweenFrom.querySelector("span:last-of-type").innerText =
            value;
    }

    get displayBetweenFrom() {
        return this.shadowRoot.querySelector("span.between-from");
    }

    get betweenTo() {
        return this.displayBetweenTo.querySelector("span:last-of-type")
            .innerText;
    }

    set betweenTo(value) {
        this.displayBetweenTo.querySelector("span:last-of-type").innerText =
            value;
    }

    get displayBetweenTo() {
        return this.shadowRoot.querySelector("span.between-to");
    }

    get btnBetweenFrom() {
        return this.shadowRoot.querySelector(
            'theme-button[data-type="between-from"]',
        );
    }

    get btnBetweenTo() {
        return this.shadowRoot.querySelector(
            'theme-button[data-type="between-to"]',
        );
    }

    get btnBetweenReset() {
        return this.shadowRoot.querySelector(
            'theme-button[data-type="between-reset"]',
        );
    }

    get saveButton() {
        return this.shadowRoot.querySelector('theme-button[data-type="save"]');
    }

    get addButton() {
        return this.shadowRoot.querySelector('theme-button[data-type="add"]');
    }

    get filtersContainer() {
        return this.shadowRoot.querySelector(".filters");
    }

    get displayLeft() {
        return this.shadowRoot.querySelector(".displayLeft");
    }

    get displayTop() {
        return this.shadowRoot.querySelector(".displayTop");
    }

    get displayWidth() {
        return this.shadowRoot.querySelector(".displayWidth");
    }

    get displayHeight() {
        return this.shadowRoot.querySelector(".displayHeight");
    }

    get zoom() {
        return this.shadowRoot.querySelector(".zoom");
    }
}

const STYLES = css`
    :host {
        position: relative;
    }
    .box {
        position: absolute;
        background: hsla(
            var(--hue-alert) var(--sat-alert) var(--lit-alert) / 0.5
        );
    }
    .fake-box {
        position: absolute;
        background: hsla(180deg 100% 50% / 0.5);
        display: none;
    }
    .fake-box.active {
        display: revert;
    }
    .info {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
        gap: 0.5rem;
        font-size: 0.75rem;
        max-width: 250px;
    }
    .zoom {
        width: 250px;
        aspect-ratio: 1;
        overflow: hidden;
        position: relative;
        z-index: 1;
        transform-origin: left top;
        transition: transform 200ms linear;
    }
    .zoom:hover {
        transform: scale(2);
    }
    .toggle-aspect {
        display: none;
    }
    .info dl {
        display: flex;
        justify-content: space-between;
        margin: 0;
    }
    p {
        max-width: 250px;
        margin: 0;
    }
    .sidebar {
        grid-area: right;
        display: grid;
        grid-template-rows: min-content min-content auto;
        width: 360px;
        justify-self: end;
    }
    .between {
        & > span {
            display: flex;
            justify-content: space-between;
            cursor: pointer;
        }
        div {
            display: flex;
            justify-content: end;
            gap: 0.5rem;
        }
    }
    .actions {
        display: flex;
        gap: 0.5rem;
        padding-block: 0.5rem;
    }
    .filters {
        display: grid;
        gap: 0.5rem;
        overflow-y: auto;
        grid-auto-rows: min-content;

        & > :not(delogo-filter-item) {
            display: none;
        }
    }
`;

DeLogo.template = html`
    ${EDITOR_CSS} ${ICON_STACK_CSS}
    <style>
        ${STYLES}
    </style>
    ${EDITOR_TEMPLATE}
    <div class="info">
        <div class="zoom"></div>
        <p>Click on image to set delogo rectangle</p>
        <dl>
            <dt>x/y</dt>
            <dd>
                <span class="displayLeft">0px</span>&nbsp;/&nbsp;
                <span class="displayTop">0px</span>
            </dd>
        </dl>
        <dl>
            <dt>w/h</dt>
            <dd>
                <span class="displayWidth">0px</span>&nbsp;/&nbsp;
                <span class="displayHeight">0px</span>
            </dd>
        </dl>
        <dl>
            <dt>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
            </dt>
            <dd>Adjust dimensions</dd>
        </dl>
        <dl>
            <dt>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
                + Ctrl
            </dt>
            <dd>Adjust position</dd>
        </dl>
        <dl>
            <dt>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
                + Shift
            </dt>
            <dd>Faster movement</dd>
        </dl>
    </div>
    <div class="sidebar">
        <fieldset class="between">
            <legend>Between</legend>
            <span class="between-from">
                <span>From:</span>
                <span></span>
            </span>
            <span class="between-to">
                <span>To:</span>
                <span></span>
            </span>
            <div>
                <theme-button data-type="between-from">Start</theme-button>
                <theme-button data-type="between-to">End</theme-button>
                <theme-button data-type="between-reset">Reset</theme-button>
            </div>
        </fieldset>
        <div class="actions">
            <theme-button data-type="save">Save</theme-button>
            <theme-button data-type="add">Add Next</theme-button>
        </div>
        <div class="filters"></div>
    </div>
`;

customElements.define("dialogue-delogo", DeLogo);
