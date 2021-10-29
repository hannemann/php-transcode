import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class RemoveLogo extends VideoEditor {
    constructor() {
        super();
    }

    bindListeners() {
        super.bindListeners();
        this.initRemovelogo = this.initRemovelogo.bind(this);
    }

    onAdded() {
        super.onAdded();
        requestAnimationFrame(() => {
            this.image.addEventListener("load", this.initRemovelogo, {
                once: true,
            });
            this.initImages();
        });
    }

    onRemoved() {}

    initRemovelogo() {
        console.info("Initialize Removelogo");
    }
}

RemoveLogo.template = /*html*/ `
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
</style>
${EDITOR_TEMPLATE}
<div class="info">
</div>
`;

customElements.define("dialogue-removelogo", RemoveLogo);
