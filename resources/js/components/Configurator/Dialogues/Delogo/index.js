import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class DeLogo extends VideoEditor {
    constructor() {
        super();
        this.delogoOffsetTop = 0;
        this.delogoOffsetLeft = 0;
        this.delogoOffsetBottom = null;
        this.delogoOffsetRight = null;
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

    initDelogo() {
        console.info("Initialize Delogo");
    }
}

DeLogo.template = /*html*/ `
${EDITOR_CSS}
<style></style>
${EDITOR_TEMPLATE}
`;

customElements.define("dialogue-delogo", DeLogo);
