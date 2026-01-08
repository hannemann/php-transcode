import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { Utils } from "@/components/lib";
import { Time } from "../../../../Helper/Time";

class DeLogo extends VideoEditor {
    constructor() {
        super();
        this.delogoOffsetTop = 0;
        this.delogoOffsetLeft = 0;
        this.delogoOffsetBottom = null;
        this.delogoOffsetRight = null;
    }

    bindListeners() {
        super.bindListeners();
        this.initDelogo = this.initDelogo.bind(this);
        this.addDelogoBox = this.addDelogoBox.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.setBetweenFrom = this.setBetweenFrom.bind(this);
        this.setBetweenTo = this.setBetweenTo.bind(this);
        this.resetBetween = this.resetBetween.bind(this);
    }

    onAdded() {
        super.onAdded();
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initDelogo, {
                once: true,
            });
            this.initImages();
        });
    }

    onRemoved() {
        this.image.removeEventListener("click", this.addDelogoBox);
        document.removeEventListener("keydown", this.handleKey);
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
                this.image.offsetLeft + this.image.width / 2 - 10
            ),
            offsetY: Math.round(
                this.image.offsetTop + this.image.height / 2 - 10
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
            { once: true }
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
                    this.delogoBox.cloneNode(true)
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
                    this.delogoOffsetTop
                )
            )}px`;
            this.delogoBox.style.left = `${Math.max(
                this.image.offsetLeft,
                Math.min(
                    this.image.offsetLeft +
                        this.image.width -
                        this.delogoBox.offsetWidth,
                    this.delogoOffsetLeft
                )
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
        this.dispatchEvent(new CustomEvent('delogo-updated'));
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
                            this.delogoBox.offsetWidth
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.left = `${Math.max(
                        this.delogoBox.offsetLeft - 1,
                        this.image.offsetLeft
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.top = `${Math.min(
                        this.delogoBox.offsetTop + 1,
                        this.image.offsetTop +
                            this.image.height -
                            this.delogoBox.offsetHeight
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.top = `${Math.max(
                        this.delogoBox.offsetTop - 1,
                        this.image.offsetTop
                    )}px`;
                }
            } else {
                const box = this.delogoBox.getBoundingClientRect();
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.width = `${Math.min(
                        this.delogoBox.offsetWidth + 1,
                        this.image.offsetLeft +
                            this.image.offsetWidth -
                            this.delogoBox.offsetLeft
                    )}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.width = `${Math.max(
                        this.delogoBox.offsetWidth - 1,
                        5
                    )}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.height = `${Math.min(
                        this.delogoBox.offsetHeight + 1,
                        this.image.offsetTop +
                            this.image.offsetHeight -
                            this.delogoBox.offsetTop
                    )}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.height = `${Math.max(
                        this.delogoBox.offsetHeight - 1,
                        5
                    )}px`;
                }
            }
            this.updateZoom();
        }
    }

    applyFilterData(data) {
        this.coords = data;
        this.setBetween(data.between);
        this.updateZoom();
        this.current = data.between.from * 1000;
        this.updateIndicatorPos();
        this.updateImages();
    }

    setBetween(between) {
        this.between = between;
        Utils.forceUpdate(this);
    }

    setBetweenFrom() {
        this.between.from = Time.toSeconds(this.timestamp());
        Utils.forceUpdate(this);
    }

    setBetweenTo() {
        this.between.to = Time.toSeconds(this.timestamp());
        Utils.forceUpdate(this);
    }
    
    resetBetween() {
        this.between = {from: null, to: null};
        Utils.forceUpdate(this);
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

DeLogo.template = /*html*/ `
${EDITOR_CSS}
<style>
    :host {
        position: relative;
    }
    .box {
        position: absolute;
        background-color: hsla(0 100% 50% / .5);
    }
    .info {
        grid-area: left;
        display: grid;
        grid-auto-rows: min-content;
        gap: .5rem;
        font-size: .75rem;
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
    .between {
        & > span {
            display: flex;
            justify-content: space-between;
        }
        div {
            display: flex;
            justify-content: end;
            gap: .5rem;
        }
    }
</style>
${EDITOR_TEMPLATE}
<div class="info">
    <div class="zoom" #ref="zoom"></div>
    <p>
        Click on image to set delogo rectangle
    </p>
    <dl>
        <dt>x/y</dt>
        <dd><span #ref="displayLeft">0px</span>&nbsp;/&nbsp;<span #ref="displayTop">0px</span></dd>
    </dl>
    <dl>
        <dt>w/h</dt>
        <dd><span #ref="displayWidth">0px</span>&nbsp;/&nbsp;<span #ref="displayHeight">0px</span></dd>
    </dl>
    <dl>
        <dt>
            <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
            <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span>
        </dt>
        <dd>Adjust dimensions</dd>
    </dl>
    <dl>
        <dt>
            <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
            <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl
        </dt>
        <dd>Adjust position</dd>
    </dl>
    <fieldset class="between">
        <legend>Between</legend>
        <span>
            <span>From:</span><span>{{ this.between.from || 'n/a' }}</span>
        </span>
        <span>
            <span>To:</span><span>{{ this.between.to || 'n/a' }}</span>
        </span>
        <div>
            <theme-button @click="{{ this.setBetweenFrom }}">Start</theme-button>
            <theme-button @click="{{ this.setBetweenTo }}">End</theme-button>
            <theme-button @click="{{ this.resetBetween }}">Reset</theme-button>
        </div>
    </fieldset>
</div>
`;

customElements.define("dialogue-delogo", DeLogo);
