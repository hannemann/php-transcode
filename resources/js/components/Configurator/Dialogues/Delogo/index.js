import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { Utils } from "@/components/lib";
import { Time } from "../../../../Helper/Time";
import { saveDelogo } from "../../Tools/delogo";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";

class DeLogo extends VideoEditor {
    delogoOffsetTop = 0;
    delogoOffsetLeft = 0;
    delogoOffsetBottom = null;
    delogoOffsetRight = null;

    connectedCallback() {
        super.connectedCallback();
        this.isEdit = false;
        this.saved = false;
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initDelogo, {
                once: true,
            });
            this.initImages();
            this.isSaved = this.saved;
            this.initFilters();
            Iconify.scan(this.shadowRoot);
        });
    }

    disconnectedCallback() {
        this.image.removeEventListener("click", this.addDelogoBox);
        document.removeEventListener("keydown", this.handleKey);
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
    }

    initDelogo() {
        console.info("Initialize Delogo");
        this.image.addEventListener("click", this.addDelogoBox);
        document.addEventListener("keydown", this.handleKey);
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
        const ratio = this.video.width / image.width;
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
            if (e.ctrlKey) {
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.left = `${Math.min(
                        this.delogoBox.offsetLeft + 1,
                        this.image.offsetLeft +
                            this.image.width -
                            this.delogoBox.offsetWidth,
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.left = `${Math.max(
                        this.delogoBox.offsetLeft - 1,
                        this.image.offsetLeft,
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.top = `${Math.min(
                        this.delogoBox.offsetTop + 1,
                        this.image.offsetTop +
                            this.image.height -
                            this.delogoBox.offsetHeight,
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.top = `${Math.max(
                        this.delogoBox.offsetTop - 1,
                        this.image.offsetTop,
                    )}px`;
                }
            } else {
                const box = this.delogoBox.getBoundingClientRect();
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.width = `${Math.min(
                        this.delogoBox.offsetWidth + 1,
                        this.image.offsetLeft +
                            this.image.offsetWidth -
                            this.delogoBox.offsetLeft,
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.width = `${Math.max(
                        this.delogoBox.offsetWidth - 1,
                        5,
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.height = `${Math.min(
                        this.delogoBox.offsetHeight + 1,
                        this.image.offsetTop +
                            this.image.offsetHeight -
                            this.delogoBox.offsetTop,
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.height = `${Math.max(
                        this.delogoBox.offsetHeight - 1,
                        5,
                    )}px`;
                }
            }
            this.updateZoom();
        }
    }

    applyFilterData(data) {
        this.isEdit = true;
        this.coords = data;
        this.setBetween(data.between);
        this.updateZoom();
        this.current = data.between.from * 1000;
        this.updateIndicatorPos();
        this.updateImages();
        this.activeDelogoFilter = this.shadowRoot.querySelector(
            `.filters [data-index="${this.filterIndex}"]`,
        );
    }

    setBetween(between) {
        this.between = between;
        Utils.forceUpdate(this);
    }

    setBetweenFrom() {
        this.between.from = Time.toSeconds(this.timestamp());
        Utils.forceUpdate(this);
    }

    getBetweenFrom() {
        if (!this.between?.from) return "n/a";
        return Time.calculateCutTimestamp(
            this.configurator.clips.clips,
            this.between.from * 1000,
        );
    }

    setBetweenTo() {
        this.between.to = Time.toSeconds(this.timestamp());
        Utils.forceUpdate(this);
    }

    getBetweenTo() {
        if (!this.between?.to) return "n/a";
        return Time.calculateCutTimestamp(
            this.configurator.clips.clips,
            this.between.to * 1000,
        );
    }

    resetBetween() {
        this.between = { from: null, to: null };
        Utils.forceUpdate(this);
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
        Utils.forceUpdate(this);
        Iconify.scan(this.shadowRoot);
    }

    addNext() {
        this.filterIndex = null;
        this.isEdit = false;
        this.isSaved = false;
        this.resetBetween();
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
        this.configurator.filterGraph.splice(
            parseInt(e.currentTarget.closest("[data-delogo]").dataset.index),
            1,
        );
        await this.configurator.saveSettings();
        this.initFilters();
    }

    initFilters() {
        this.filters = [...this.configurator.filterGraph].map((f, k) => {
            if (f.filterType !== "delogo") {
                return null;
            }
            f.index = k;
            return f;
        });
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
        if (item) {
            item.dataset.active = "";
        }
    }

    set coords(coord) {
        const image = this.image.getBoundingClientRect();
        const ratio = this.video.width / image.width;
        this.delogoBox.style.top = `${Math.round(coord.y / ratio)}px`;
        this.delogoBox.style.left = `${Math.round(coord.x / ratio + (Math.round(image.left) - this.offsetLeft))}px`;
        this.delogoBox.style.height = `${Math.round(coord.h / ratio)}px`;
        this.delogoBox.style.width = `${Math.round(coord.w / ratio)}px`;
    }

    get coords() {
        if (this.delogoBox) {
            const box = this.delogoBox.getBoundingClientRect();
            const image = this.image.getBoundingClientRect();
            const ratio = this.video.width / image.width;
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
}

DeLogo.template = html`
    ${EDITOR_CSS} ${ICON_STACK_CSS}
    <style>
        :host {
            position: relative;
        }
        .box {
            position: absolute;
            background-color: hsla(0 100% 50% / 0.5);
        }
        .info {
            grid-area: left;
            display: grid;
            grid-auto-rows: min-content;
            gap: 0.5rem;
            font-size: 0.75rem;
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
            display: grid;
            grid-template-rows: min-content min-content auto;
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
                &:not([data-delogo]) {
                    display: none;
                }
            }
        }
    </style>
    ${EDITOR_TEMPLATE}
    <div class="info">
        <div class="zoom" #ref="zoom"></div>
        <p>Click on image to set delogo rectangle</p>
        <dl>
            <dt>x/y</dt>
            <dd>
                <span #ref="displayLeft">0px</span>&nbsp;/&nbsp;<span
                    #ref="displayTop"
                    >0px</span
                >
            </dd>
        </dl>
        <dl>
            <dt>w/h</dt>
            <dd>
                <span #ref="displayWidth">0px</span>&nbsp;/&nbsp;<span
                    #ref="displayHeight"
                    >0px</span
                >
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
    </div>
    <div class="sidebar">
        <fieldset class="between">
            <legend>Between</legend>
            <span @click="{{ this.gotoBetweenFrom }}">
                <span>From:</span
                ><span>{{ this.getBetweenFrom() || 'n/a' }}</span>
            </span>
            <span @click="{{ this.gotoBetweenTo }}">
                <span>To:</span><span>{{ this.getBetweenTo() }}</span>
            </span>
            <div>
                <theme-button @click="{{ this.setBetweenFrom }}"
                    >Start</theme-button
                >
                <theme-button @click="{{ this.setBetweenTo }}"
                    >End</theme-button
                >
                <theme-button @click="{{ this.resetBetween }}"
                    >Reset</theme-button
                >
            </div>
        </fieldset>
        <div class="actions">
            <theme-button #ref="saveButton" @click="{{ this.save }}"
                >Save</theme-button
            >
            <theme-button #ref="addButton" @click="{{ this.addNext }}"
                >Add Next</theme-button
            >
        </div>
        <div class="filters">
            <div
                *foreach="{{ this.filters }}"
                data-index="{{ item.index }}"
                data-delogo="{{ JSON.stringify(item) }}"
                @click="{{ this.editItem }}"
            >
                Delogo
                <div @click="{{ this.deleteItem }}" class="icon-stack">
                    <span class="iconify" data-icon="mdi-close"></span>
                    <span class="iconify hover" data-icon="mdi-close"></span>
                </div>
            </div>
        </div>
    </div>
`;

customElements.define("dialogue-delogo", DeLogo);
