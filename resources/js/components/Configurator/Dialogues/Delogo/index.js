import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

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
        this.zoomImage = this.zoom.appendChild(document.createElement("img"));
        this.zoomImage.src = this.image.src;
    }

    handleIndicatorClick(e) {
        this.image.addEventListener(
            "load",
            () => {
                console.log(this.image.src);
                this.zoomImage.src = this.image.src;
            },
            { once: true }
        );
        super.handleIndicatorClick(e);
    }

    addDelogoBox(e) {
        this.delogoOffsetTop = e.layerY - 10;
        this.delogoOffsetLeft = e.layerX - 10;
        if (!this.delogoBox) {
            this.delogoBox = document.createElement("div");
            this.shadowRoot.appendChild(this.delogoBox);
            this.delogoBox.classList.add("box");
            this.zoomDelogoBox = this.zoom.appendChild(
                this.delogoBox.cloneNode(true)
            );
        }
        this.delogoBox.style.top = `${this.delogoOffsetTop}px`;
        this.delogoBox.style.left = `${this.delogoOffsetLeft}px`;
        this.delogoBox.style.width = `20px`;
        this.delogoBox.style.height = `20px`;
        this.updateZoom();
    }

    updateZoom() {
        const tr = `translate(
            -${this.coords.x - this.zoom.offsetWidth / 2 + this.coords.w / 2}px,
            -${this.coords.y - this.zoom.offsetHeight / 2 + this.coords.h / 2}px
            )`;
        this.zoomImage.style.transform = tr;
        this.zoomDelogoBox.style.top = `${this.coords.y}px`;
        this.zoomDelogoBox.style.left = `${this.coords.x}px`;
        this.zoomDelogoBox.style.width = `${this.coords.w}px`;
        this.zoomDelogoBox.style.height = `${this.coords.h}px`;
        this.zoomDelogoBox.style.transform = tr;
    }

    handleKey(e) {
        if (this.delogoBox) {
            e.preventDefault();
            if (e.ctrlKey) {
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.left = `${
                        parseInt(this.delogoBox.style.left, 10) + 1
                    }px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.left = `${
                        parseInt(this.delogoBox.style.left, 10) - 1
                    }px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.top = `${
                        parseInt(this.delogoBox.style.top, 10) + 1
                    }px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.top = `${
                        parseInt(this.delogoBox.style.top, 10) - 1
                    }px`;
                }
            } else {
                const box = this.delogoBox.getBoundingClientRect();
                if (e.key === "ArrowRight") {
                    this.delogoBox.style.width = `${
                        parseInt(this.delogoBox.style.width, 10) + 1
                    }px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.width = `${
                        parseInt(this.delogoBox.style.width, 10) - 1
                    }px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.height = `${
                        parseInt(this.delogoBox.style.height, 10) + 1
                    }px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.height = `${
                        parseInt(this.delogoBox.style.height, 10) - 1
                    }px`;
                }
            }
            this.updateZoom();
        }
    }

    get coords() {
        if (this.delogoBox) {
            const box = this.delogoBox.getBoundingClientRect();
            const image = this.image.getBoundingClientRect();
            return {
                x: parseInt(((box.left - image.left) * 1920) / image.width, 10),
                y: parseInt(((box.top - image.top) * 1920) / image.width, 10),
                w: parseInt((box.width * 1920) / image.width, 10),
                h: parseInt((box.height * 1920) / image.width, 10),
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
        white-space: nowrap;
    }
    .zoom {
        width: 250px;
        aspect-ratio: 1;
        overflow: hidden;
        position: relative;
    }
</style>
${EDITOR_TEMPLATE}
<div class="info">
    <div class="zoom" #ref="zoom"></div>
</div>
`;

customElements.define("dialogue-delogo", DeLogo);
