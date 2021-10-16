import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { Utils } from "@/components/lib";

class Cropper extends VideoEditor {
    constructor() {
        super();
        this.cropWidth = 0;
        this.cropHeight = 0;
    }
}

Cropper.template = /*html*/ `
${EDITOR_CSS}
${EDITOR_TEMPLATE}
`;

customElements.define("dialogue-cropper", Cropper);
