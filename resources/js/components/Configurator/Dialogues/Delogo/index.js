import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { VTime } from "../../../../Helper/Time";
import { saveDelogo } from "../../Tools/delogo";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import Iconify from "@iconify/iconify/dist/iconify.js";

class DeLogo extends VideoEditor {
    delogoOffsetTop = 0;
    delogoOffsetLeft = 0;
    delogoOffsetBottom = null;
    delogoOffsetRight = null;

    connectedCallback() {
        super.connectedCallback();
        this.isEdit = false;
        this.saved = false;
        this.totalDuration = this.configurator.clips.totalDuration;
        this.clips = [...this.configurator.clips.clips];
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
        this.initDelogo = this.initDelogo.bind(this);
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
        this.handleFakeBox = this.handleFakeBox.bind(this);
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
        this.filtersContainer.querySelectorAll(":scope > div")?.forEach((e) => {
            e.addEventListener("click", this.editItem);
            e.querySelector(".icon-stack").addEventListener(
                "click",
                this.deleteItem,
            );
            e.addEventListener("pointerenter", this.handleFakeBox);
            e.addEventListener("pointerleave", this.handleFakeBox);
        });
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
        this.filtersContainer.querySelectorAll(":scope > div")?.forEach((e) => {
            e.removeEventListener("click", this.editItem);
            e.querySelector(".icon-stack").removeEventListener(
                "click",
                this.deleteItem,
            );
            e.removeEventListener("pointerenter", this.handleFakeBox);
            e.removeEventListener("pointerleave", this.handleFakeBox);
        });
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
            if (!this.fakeBox) {
                this.fakeBox = document.createElement("div");
                this.shadowRoot.appendChild(this.fakeBox);
                this.fakeBox.classList.add("fake-box");
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
                            this.delogoBox.offsetWidth,
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.left = `${Math.max(
                        this.delogoBox.offsetLeft - delta,
                        this.image.offsetLeft,
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.top = `${Math.min(
                        this.delogoBox.offsetTop + delta,
                        this.image.offsetTop +
                            this.image.height -
                            this.delogoBox.offsetHeight,
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.top = `${Math.max(
                        this.delogoBox.offsetTop - delta,
                        this.image.offsetTop,
                    )}px`;
                }
            } else {
                const box = this.delogoBox.getBoundingClientRect();
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.width = `${Math.min(
                        this.delogoBox.offsetWidth + delta,
                        this.image.offsetLeft +
                            this.image.offsetWidth -
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
            this.updateZoom();
        }
    }

    applyFilterData(data) {
        this.isEdit = true;
        this.isSaved = false;
        this.coords = data;
        this.setBetween(data.between);
        this.updateZoom();
        this.current = data.between.from * 1000;
        this.updateIndicatorPos();
        this.updateImages();
        this.activeDelogoFilter = this.filterIndex;
    }

    setBetween(between) {
        this.between = between;
        this.betweenFrom = this.getCutTimeStamp(this.between.from);
        this.betweenTo = this.getCutTimeStamp(this.between.to);
    }

    setBetweenFrom() {
        this.between.from = new VTime(this.timestamp()).seconds;
        this.betweenFrom = this.getCutTimeStamp(this.between.from);
    }

    setBetweenTo() {
        this.between.to = new VTime(this.timestamp()).seconds;
        this.betweenTo = this.getCutTimeStamp(this.between.to);
    }

    getCutTimeStamp(timestamp) {
        if (!timestamp) return "n/a";
        return VTime.calcCut(this.clips, timestamp * 1000);
    }

    resetBetween() {
        this.between = { from: null, to: null };
        this.betweenFrom = "n/a";
        this.betweenTo = "n/a";
    }

    gotoBetweenFrom() {
        if (!this.between.from) return;
        this.current = this.between.from * 1000;
        this.updateIndicatorPos();
        this.updateImages();
    }

    gotoBetweenTo() {
        if (!this.between.to) return;
        this.current = this.between.to * 1000;
        this.updateIndicatorPos();
        this.updateImages();
    }

    save() {
        saveDelogo.call(this.configurator, this.type, this, this.isEdit);
        this.isSaved = this.saved;
        this.initFilters();
        this.activeDelogoFilter = null;
        Iconify.scan(this.shadowRoot);
    }

    addNext() {
        this.filterIndex = null;
        this.isEdit = false;
        this.isSaved = false;
        this.resetBetween();
        const item = {
            index: this.configurator.filterGraph.length,
            type: "cpu",
            filterType: "delogo",
            between: {
                from: null,
                to: null,
            },
            ...this.coords,
        };
        this.filters = [...this.filters, item];
        this.activeDelogoFilter = item.index;
    }

    editItem(e) {
        if ("undefined" !== typeof e.currentTarget.dataset.active) {
            this.filterIndex = null;
            this.activeDelogoFilter = null;
            this.resetBetween();
            this.isSaved = true;
            return;
        }
        const data = JSON.parse(e.currentTarget.dataset.delogo);
        this.isSaved = false;
        this.applyFilterData(data);
        this.filterIndex = e.currentTarget.dataset.index;
        this.activeDelogoFilter = e.currentTarget;
    }

    async deleteItem(e) {
        e.stopPropagation();
        this.configurator.filterGraph.splice(
            parseInt(e.currentTarget.closest("[data-delogo]").dataset.index),
            1,
        );
        await this.configurator.saveSettings();
        this.initFilters();
    }

    initFilters() {
        this.filters = [...this.configurator.filterGraph].filter((f, k) => {
            if (f.filterType !== "delogo") return false;
            f.index = k;
            return true;
        });
    }

    createItem(item) {
        const node = document.createElement("div");
        const { from, to } = item.between;
        node.dataset.index = item.index;
        node.dataset.delogo = JSON.stringify(item);

        const duration = new VTime(this.totalDuration).seconds;
        if (from) {
            const fromTime = new VTime(this.getCutTimeStamp(from)).seconds;
            if (fromTime >= duration) {
                node.classList.add("error");
                node.dataset.fromError = "out-of-range";
            }
        }
        if (to) {
            const toTime = new VTime(this.getCutTimeStamp(to)).seconds;

            if (toTime >= duration) {
                node.classList.add("error");
                node.dataset.toError = "out-of-range";
            }
        }

        node.innerText =
            `${this.getCutTimeStamp(from)} - ` + `${this.getCutTimeStamp(to)}`;
        node.classList.toggle("incomplete", from === null || to === null);
        const iconWrap = document.createElement("div");
        iconWrap.classList.add("icon-stack");
        const icon = document.createElement("span");
        icon.classList.add("iconify");
        icon.dataset.icon = "mdi-close";
        const iconHover = document.createElement("span");
        iconHover.classList.add("iconify", "hover");
        iconHover.dataset.icon = "mdi-close";
        iconWrap.append(icon, iconHover);
        node.append(iconWrap);

        return node;
    }

    handleFakeBox(e) {
        const isActive = e.type === "pointerenter";
        this.fakeBox.classList.toggle("active", isActive);
        this.indicatorByTimestamp = null;
        if (!isActive) return;
        const data = JSON.parse(e.currentTarget.dataset.delogo);
        this.fakeCoords = data;
        this.indicatorRangeByTimestamp = data.between;
    }

    set filters(items) {
        this.removeItemListeners();
        this.filtersContainer.replaceChildren(
            ...items.map(this.createItem.bind(this)),
        );
        Iconify.scan(this.shadowRoot);
        this.addItemListeners();
    }

    get filters() {
        return [...this.filtersContainer.querySelectorAll(":scope > div")].map(
            (i) => {
                return JSON.parse(i.dataset.delogo);
            },
        );
    }

    set isSaved(value) {
        this.saved = !!value;
        this.saveButton.disabled = this.saved;
        this.addButton.disabled = !this.saved;
    }

    set activeDelogoFilter(item) {
        this.shadowRoot
            .querySelectorAll(".filters [data-delogo]")
            .forEach((f) => delete f.dataset.active);
        if (!isNaN(item)) {
            item = this.shadowRoot.querySelector(
                `.filters [data-index="${item}"]`,
            );
        }
        if (item) {
            item.dataset.active = "";
        }
    }

    set fakeCoords(coord) {
        const image = this.imageRect;
        const ratio = this.videoImageRatio;
        this.fakeBox.style.top = `${Math.round(coord.y / ratio)}px`;
        this.fakeBox.style.left = `${Math.round(coord.x / ratio + (Math.round(image.left) - this.offsetLeft))}px`;
        this.fakeBox.style.height = `${Math.round(coord.h / ratio)}px`;
        this.fakeBox.style.width = `${Math.round(coord.w / ratio)}px`;
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

DeLogo.template = html`
    ${EDITOR_CSS} ${ICON_STACK_CSS}
    <style>
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
            max-width: 350px;
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

            & > div {
                &[data-delogo] {
                    background: var(--clr-bg-100);
                    color: var(--clr-text-100);
                    border: 2px solid var(--clr-bg-200);
                    padding-inline: 0.5rem;
                    transition-property:
                        text-shadow, box-shadow, border-color, background-color;
                    transition-timing-function: ease-out;
                    transition-duration: var(--transition-medium);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    &[data-active] {
                        background: var(--clr-bg-200);
                        color: var(--clr-enlightened);
                        text-shadow:
                            0 0 5px var(--clr-enlightened-glow),
                            0 0 10px var(--clr-enlightened-glow);
                        border-color: var(--clr-enlightened);
                        box-shadow:
                            0 0 20px 0 var(--clr-enlightened-glow),
                            0 0 10px 0 inset var(--clr-enlightened-glow);
                    }
                }
                &.error {
                    background-color: hsl(
                        from var(--clr-bg-150) var(--hue-error) s l
                    );
                }
                &.incomplete {
                    opacity: 0.8;
                }
                &:not([data-delogo]) {
                    display: none;
                }
            }
        }
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
