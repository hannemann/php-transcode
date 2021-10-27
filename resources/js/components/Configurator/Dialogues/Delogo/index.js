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
    }

    addDelogoBox(e) {
        this.delogoOffsetTop = e.layerY - 10;
        this.delogoOffsetLeft = e.layerX - 10;
        if (!this.delogoBox) {
            this.delogoBox = document.createElement("div");
            this.shadowRoot.appendChild(this.delogoBox);
            this.delogoBox.classList.add("box");
        }
        this.delogoBox.style.top = `${this.delogoOffsetTop}px`;
        this.delogoBox.style.left = `${this.delogoOffsetLeft}px`;
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
                    this.delogoBox.style.width = `${box.width + 1}px`;
                }
                if (e.key === "ArrowLeft") {
                    this.delogoBox.style.width = `${box.width - 1}px`;
                }
                if (e.key === "ArrowDown") {
                    this.delogoBox.style.height = `${box.height + 1}px`;
                }
                if (e.key === "ArrowUp") {
                    this.delogoBox.style.height = `${box.height - 1}px`;
                }
            }
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
        width: 20px;
        height: 20px;
    }
</style>
${EDITOR_TEMPLATE}
`;

customElements.define("dialogue-delogo", DeLogo);
