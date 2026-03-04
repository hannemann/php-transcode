import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { VTime } from "../../../../Helper/Time";
import { saveDelogo } from "../../Tools/delogo";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import Iconify from "@iconify/iconify/dist/iconify.js";
import { Delogo } from "../../../../Models/Filters/Delogo";
import "./Filters/Item";

const KEY_ACTIONS = {
    // resize
    ArrowRight: (ed, d) => ed.resizeBox(d, 0),
    ArrowLeft: (ed, d) => ed.resizeBox(-d, 0),
    ArrowUp: (ed, d) => ed.resizeBox(0, -d),
    ArrowDown: (ed, d) => ed.resizeBox(0, d),

    // move (Ctrl)
    "ctrl+ArrowRight": (ed, d) => ed.moveBox(d, 0),
    "ctrl+ArrowLeft": (ed, d) => ed.moveBox(-d, 0),
    "ctrl+ArrowUp": (ed, d) => ed.moveBox(0, -d),
    "ctrl+ArrowDown": (ed, d) => ed.moveBox(0, d),
};

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
        this.zoomImage = document.createElement("img");
        this.zoom.prepend(this.zoomImage);
        this.zoomImage.src = this.image.src;
        this.dispatchEvent(new CustomEvent("delogo-updated"));
    }

    bindListeners() {
        super.bindListeners();
        this.handleKey = this.handleKey.bind(this);
        this.centerBoxUnderCursor = this.centerBoxUnderCursor.bind(this);
    }

    addListeners() {
        super.addListeners();

        // 1. Image Interaction
        this.image.addEventListener("click", this.centerBoxUnderCursor);

        // 2. Scoped Keyboard Shortcuts (bound to host instead of document)
        document.addEventListener("keydown", this.handleKey);

        // 3. UI Buttons (using 'this' as the listener to trigger handleEvent)
        this.addButton.addEventListener("click", this);
        this.saveButton.addEventListener("click", this);
        this.btnBetweenFrom.addEventListener("click", this);
        this.btnBetweenTo.addEventListener("click", this);
        this.btnBetweenReset.addEventListener("click", this);

        // 4. Display spans (navigation)
        this.displayBetweenFrom.addEventListener("click", this);
        this.displayBetweenTo.addEventListener("click", this);

        // 5. Filter Item Events (Delegated via Container)
        this.filtersContainer.addEventListener("delogo-item-edit", this);
        this.filtersContainer.addEventListener("delogo-item-copy", this);
        this.filtersContainer.addEventListener("delogo-item-delete", this);
        this.filtersContainer.addEventListener("delogo-item-on", this);
        this.filtersContainer.addEventListener("delogo-item-off", this);
    }

    removeListeners() {
        super.removeListeners();

        // 1. Image Interaction
        this.image.removeEventListener("click", this.centerBoxUnderCursor);

        // 2. Scoped Keyboard Shortcuts
        document.removeEventListener("keydown", this.handleKey);

        // 3. UI Buttons
        this.addButton.removeEventListener("click", this);
        this.saveButton.removeEventListener("click", this);
        this.btnBetweenFrom.removeEventListener("click", this);
        this.btnBetweenTo.removeEventListener("click", this);
        this.btnBetweenReset.removeEventListener("click", this);

        // 4. Display spans
        this.displayBetweenFrom.removeEventListener("click", this);
        this.displayBetweenTo.removeEventListener("click", this);

        // 5. Filter Item Events (Container level)
        this.filtersContainer.removeEventListener("delogo-item-edit", this);
        this.filtersContainer.removeEventListener("delogo-item-copy", this);
        this.filtersContainer.removeEventListener("delogo-item-delete", this);
        this.filtersContainer.removeEventListener("delogo-item-on", this);
        this.filtersContainer.removeEventListener("delogo-item-off", this);
    }

    /**
     * update image url
     * also update zoomimage utl
     */
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

    /**
     * sync zoom box to delogo box
     */
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
    }

    /**
     * Central event hub for the VideoEditor
     * @param {CustomEvent} e
     */
    handleEvent(e) {
        // Handle filter item specific events
        if (e.type.startsWith("delogo-item-")) {
            const index = e.detail?.item?.index;
            this.#handleFilterAction(e.type, index);
            return;
        }

        // Handle standard UI actions based on data-type or element
        const type = e.currentTarget?.dataset?.type;

        switch (type) {
            case "save":
                this.save();
                break;
            case "add":
                this.applyNewModel();
                break;
            case "between-from":
                this.setBetweenFrom();
                break;
            case "between-to":
                this.setBetweenTo();
                break;
            case "between-reset":
                this.resetBetween();
                break;
        }

        // Handle navigation clicks on the display spans
        if (e.currentTarget === this.displayBetweenFrom) this.gotoBetweenFrom();
        if (e.currentTarget === this.displayBetweenTo) this.gotoBetweenTo();
    }

    /**
     * Internal helper for filter list actions
     * @param {String} type
     * @param {Number} index
     */
    #handleFilterAction(type, index) {
        switch (type) {
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

    /**
     * handle key presses
     * @param {KeyboardEvent} e
     * @returns
     */
    handleKey(e) {
        if (!this.delogoBox) return;

        const combo = `${e.ctrlKey ? "ctrl+" : ""}${e.key}`;
        const action = KEY_ACTIONS[combo];

        if (action) {
            e.preventDefault();
            const delta = e.shiftKey ? 1 : 10;

            action(this, delta);

            this.model.coords = this.coords;
            this.updateZoom();
        }
    }

    /**
     * move box by delta
     * @param {Number} dx
     * @param {Number} dy
     */
    moveBox(dx, dy) {
        const coords = { ...this.model.coords };
        const videoWidth = this.video.width;
        const videoHeight = this.video.height;

        // 1px padding in real video pixels (0 to VideoWidth)
        coords.x = Math.max(
            1,
            Math.min(coords.x + dx, videoWidth - coords.w - 1),
        );
        coords.y = Math.max(
            1,
            Math.min(coords.y + dy, videoHeight - coords.h - 1),
        );

        this.model.coords = coords;
        this.syncBoxToModel();
    }

    /**
     * resize box by delta
     * @param {Number} dw
     * @param {Number} dh
     */
    resizeBox(dw, dh) {
        const coords = { ...this.model.coords };
        const videoWidth = this.video.width;
        const videoHeight = this.video.height;
        const minSize = 10;

        coords.w = Math.max(
            minSize,
            Math.min(coords.w + dw, videoWidth - coords.x - 1),
        );
        coords.h = Math.max(
            minSize,
            Math.min(coords.h + dh, videoHeight - coords.y - 1),
        );

        this.model.coords = coords;
        this.syncBoxToModel();
    }

    /**
     * set between from value to model and update ui
     */
    setBetweenFrom() {
        this.model.between.from = this.timestamp();
        this.betweenFrom = this.model.between.from?.getCutpoint(
            this.clipsConfig,
        );
    }

    /**
     * set between to value to model and update ui
     */
    setBetweenTo() {
        this.model.between.to = this.timestamp();
        this.betweenTo = this.model.between.to?.getCutpoint(this.clipsConfig);
    }

    /**
     * reset between from and to values, reset ui
     */
    resetBetween() {
        if (this.model) {
            this.model.between.from = null;
            this.model.between.to = null;
        }
        this.betweenFrom = "n/a";
        this.betweenTo = "n/a";
    }

    /**
     * goto between from value
     */
    gotoBetweenFrom() {
        if (!this.model.between.from) return;
        this.current = this.model.between.from.milliseconds;
        this.updateIndicatorPos();
        this.updateImages();
    }

    /**
     * goto between to value
     */
    gotoBetweenTo() {
        if (!this.model.between.to) return;
        this.current = this.model.between.to.milliseconds;
        this.updateIndicatorPos();
        this.updateImages();
    }

    /**
     * initialize filters
     */
    initFilters() {
        this.filters = [...this.configurator.filterGraph].filter(
            (f) => f.filterType === Delogo.filterType,
        );
    }

    /**
     * edit item
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
     * delete item
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
     * copy item
     * @param {Number} idx
     */
    async copyItem(idx) {
        const src = this.configurator.filterGraph[idx];
        const dest = structuredClone(src);
        dest.filterIndex = this.configurator.filterGraph.getProposedFilterIndex(
            Delogo.filterType,
        );

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

    /**
     * hightlight timerange in thumbs bar
     * @param {Number} index
     * @returns
     */
    showItemTimeRange(index) {
        this.hideItemTimeRange();
        const delogo = this.configurator.filterGraph[index];
        if (!delogo) return;
        this.itemCoords = delogo.coords;
        this.indicatorRangeByTimestamp = {
            from: delogo.between.from.seconds || 0,
            to: delogo.between.to.seconds || 0,
        };
        this.itemBox.classList.add("active");
    }

    /**
     * remove timerange from thumbsbar
     */
    hideItemTimeRange() {
        this.itemBox?.classList.remove("active");
        this.indicatorByTimestamp = null;
    }

    /**
     * save models
     */
    save() {
        saveDelogo.call(this.configurator, this);
        this.isSaved = this.saved;
        this.initFilters();
        this.activeDelogoFilter = null;
        this.resetModel();
        Iconify.scan(this.shadowRoot);
    }

    /**
     * run delogo dialogue
     */
    run() {
        if (this.configurator.filterGraph.includes(this.model)) {
            this.applyModelData();
        } else {
            this.centerBoxInVideo();
            this.applyNewModel();
        }
    }

    /**
     * apply data of existing model to ui
     */
    applyModelData() {
        this.isSaved = false;
        this.coords = this.model.coords;
        this.betweenFrom = this.model.between.from?.getCutpoint(
            this.clipsConfig,
        );
        this.betweenTo = this.model.between.to?.getCutpoint(this.clipsConfig);
        this.current = this.model.between.from.milliseconds;
        this.updateIndicatorPos();
        this.updateImages();
        this.activeDelogoFilter = this.filterIndex;
        this.syncBoxToModel();
        this.updateZoom();
    }

    /**
     * apply new model data
     */
    applyNewModel() {
        this.isSaved = false;

        this.model.coords = this.coords;
        this.model.between.from = this.current / 1000;
        this.model.between.to = this.current / 1000;

        this.filters = [...this.filters, this.model];
        this.filterIndex = this.model.filterIndex;
        this.activeDelogoFilter = this.filterIndex;

        this.resetBetween();
        this.syncBoxToModel();
        this.updateZoom();
    }

    /**
     * reset model
     */
    resetModel() {
        this.model = new Delogo(
            this.configurator.filterGraph.getProposedFilterIndex(
                Delogo.filterType,
            ),
            this.coords,
        );
        this.filterIndex = this.model.filterIndex;
    }

    /**
     * syncs delogo box to model coordinates
     */
    syncBoxToModel() {
        if (!this.delogoBox || !this.model.coords) return;

        const coord = this.model.coords;
        const ratio = this.videoImageRatio;

        this.delogoBox.style.top = `${Math.round(coord.y / ratio) + this.image.offsetTop}px`;
        this.delogoBox.style.left = `${Math.round(coord.x / ratio) + this.image.offsetLeft}px`;
        this.delogoBox.style.height = `${Math.round(coord.h / ratio)}px`;
        this.delogoBox.style.width = `${Math.round(coord.w / ratio)}px`;

        this.updateZoom();
    }

    /**
     * centers box in video
     */
    centerBoxInVideo() {
        const vW = this.video.width;
        const vH = this.video.height;
        // use current dimensions or default 40
        const w = this.model.coords?.w || 40;
        const h = this.model.coords?.h || 40;

        this.coords = {
            x: Math.round(vW / 2 - w / 2),
            y: Math.round(vH / 2 - h / 2),
            w,
            h,
        };
    }

    /**
     * centers box under cursor
     * respects video size padding of 1px
     * @param {MouseEvent} e
     */
    centerBoxUnderCursor(e) {
        const ratio = this.videoImageRatio;
        const vW = this.video.width;
        const vH = this.video.height;

        // use current dimensions or default 40
        const w = this.model.coords?.w || 40;
        const h = this.model.coords?.h || 40;

        // 1. transform click to video pixels and center box
        let targetX = Math.round(e.offsetX * ratio - w / 2);
        let targetY = Math.round(e.offsetY * ratio - h / 2);

        // 2. ensure 1px padding to video border
        // x/y must not be smaller than 1
        // x/y not bigger than (Video-Limit - Box-Size - 1 pad)
        targetX = Math.max(1, Math.min(targetX, vW - w - 1));
        targetY = Math.max(1, Math.min(targetY, vH - h - 1));

        this.coords = {
            x: targetX,
            y: targetY,
            w: w,
            h: h,
        };
    }

    /**
     * set filter items and rerender ui
     */
    set filters(items) {
        this.hideItemTimeRange();
        this.filtersContainer.replaceChildren(...items.map(this.createItem));
        Iconify.scan(this.shadowRoot);
    }

    /**
     * obtain filter items mapped to new array
     */
    get filters() {
        return [
            ...this.filtersContainer.querySelectorAll(
                ":scope > delogo-filter-item",
            ),
        ].map((i) => {
            return this.configurator.filterGraph[Number(i.dataset.index)];
        });
    }

    /**
     * obtain last filter node
     */
    get lastFilterNode() {
        return this.filtersContainer.querySelector(
            ":nth-last-child(1 of delogo-filter-item)",
        );
    }

    /**
     * set is saved state and update ui
     */
    set isSaved(value) {
        this.saved = !!value;
        this.saveButton.disabled = this.saved;
        this.addButton.disabled = !this.saved;
    }

    /**
     * hightlight current filter item
     */
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

    /**
     * set coords in model and sync box
     */
    set coords(coords) {
        this.model.coords = coords;
        this.syncBoxToModel();
    }

    /**
     * obtain coords from model
     */
    get coords() {
        return this.model.coords;
    }

    /**
     * obtain image bounding client rect
     */
    get imageRect() {
        return this.image.getBoundingClientRect();
    }

    /**
     * obtain video to image pixel ratio
     */
    get videoImageRatio() {
        const scaleRatio = this.image.naturalWidth / this.video.width;
        return (this.video.width / this.imageRect.width) * scaleRatio;
    }

    /* between display properties */

    get betweenFrom() {
        return this.displayBetweenFrom.querySelector("span:last-of-type")
            .innerText;
    }

    set betweenFrom(value) {
        this.displayBetweenFrom.querySelector("span:last-of-type").innerText =
            value;
    }

    get betweenTo() {
        return this.displayBetweenTo.querySelector("span:last-of-type")
            .innerText;
    }

    set betweenTo(value) {
        this.displayBetweenTo.querySelector("span:last-of-type").innerText =
            value;
    }

    /* element getters */
    #displayBetweenFrom;
    get displayBetweenFrom() {
        return (this.#displayBetweenFrom ??=
            this.shadowRoot.querySelector("span.between-from"));
    }

    #displayBetweenTo;
    get displayBetweenTo() {
        return (this.#displayBetweenTo ??=
            this.shadowRoot.querySelector("span.between-to"));
    }

    #btnBetweenFrom;
    get btnBetweenFrom() {
        return (this.#btnBetweenFrom ??= this.shadowRoot.querySelector(
            'theme-button[data-type="between-from"]',
        ));
    }

    #btnBetweenTo;
    get btnBetweenTo() {
        return (this.#btnBetweenTo ??= this.shadowRoot.querySelector(
            'theme-button[data-type="between-to"]',
        ));
    }

    #btnBetweenReset;
    get btnBetweenReset() {
        return (this.#btnBetweenReset ??= this.shadowRoot.querySelector(
            'theme-button[data-type="between-reset"]',
        ));
    }

    #saveButton;
    get saveButton() {
        return (this.#saveButton ??= this.shadowRoot.querySelector(
            'theme-button[data-type="save"]',
        ));
    }

    #addButton;
    get addButton() {
        return (this.#addButton ??= this.shadowRoot.querySelector(
            'theme-button[data-type="add"]',
        ));
    }

    #filtersContainer;
    get filtersContainer() {
        return (this.#filtersContainer ??=
            this.shadowRoot.querySelector(".filters"));
    }

    #displayLeft;
    get displayLeft() {
        return (this.#displayLeft ??=
            this.shadowRoot.querySelector(".displayLeft"));
    }

    #displayTop;
    get displayTop() {
        return (this.#displayTop ??=
            this.shadowRoot.querySelector(".displayTop"));
    }

    #displayWidth;
    get displayWidth() {
        return (this.#displayWidth ??=
            this.shadowRoot.querySelector(".displayWidth"));
    }

    #displayHeight;
    get displayHeight() {
        return (this.#displayHeight ??=
            this.shadowRoot.querySelector(".displayHeight"));
    }
    #zoom;
    get zoom() {
        return (this.#zoom ??= this.shadowRoot.querySelector(".zoom"));
    }

    #delogoBox;
    get delogoBox() {
        return (this.#delogoBox ??=
            this.shadowRoot.querySelector(".delogo-box"));
    }

    #zoomDelogoBox;
    get zoomDelogoBox() {
        return (this.#zoomDelogoBox ??=
            this.shadowRoot.querySelector(".zoom-delogo-box"));
    }

    #itemBox;
    get itemBox() {
        return (this.#itemBox ??= this.shadowRoot.querySelector(".item-box"));
    }
}

const STYLES = css`
    :host {
        position: relative;
    }
    .delogo-box,
    .zoom-delogo-box {
        width: 20px;
        height: 20px;
        position: absolute;
        background: hsla(
            var(--hue-alert) var(--sat-alert) var(--lit-alert) / 0.5
        );
    }
    .item-box {
        width: 20px;
        height: 20px;
        position: absolute;
        background: hsla(180deg 100% 50% / 0.5);
        display: none;
    }
    .item-box.active {
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
    <style>
        ${EDITOR_CSS}
        ${ICON_STACK_CSS}
        ${STYLES}
    </style>
    ${EDITOR_TEMPLATE}
    <div class="info">
        <div class="zoom"><div class="zoom-delogo-box"></div></div>
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
            <dd>Finer movement</dd>
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
    <div class="delogo-box"></div>
    <div class="item-box"></div>
`;

customElements.define("dialogue-delogo", DeLogo);
