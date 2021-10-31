import { FilePickerBase } from "./FilePickerBase";
import "./FilePickerItem";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import Iconify from "@iconify/iconify";

import ITEM_TEMPLATE from "./FilePickerItem";

class FilePicker extends FilePickerBase {
    onAdded() {
        super.onAdded();
        this.path = "root";
        this.initWebsocket();
        this.reload = this.reload.bind(this);
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    reload(e) {
        this.items = [];
        this.requestItems();
    }
}

FilePicker.template = /*html*/ `
${ICON_STACK_CSS}
<style>
    :host {
        display: grid;
        grid-template-rows: min-content 1fr;
    }
.toolbar {
    display: grid;
    grid-auto-flow: column;
    justify-content: end;
    grid-column-gap: .25rem;
}
.toolbar .tool-button {
    width: 1.25em;
    height: 1.25em;
    font-size: 1.25rem;
    cursor: pointer;
    border: 1px solid var(--clr-bg-100);
    background: var(--clr-bg-150);
    display: grid;
    place-items: center;
    border-radius: .125rem;
}
main {
    overflow: auto;
    padding: 0 1rem;
}
</style>
<div class="toolbar">
    <div class="tool-button" @click="{{ this.reload }}">
        <div class="icon-stack">
            <span class="iconify inactive" data-icon="mdi-reload"></span>
            <span class="iconify active" data-icon="mdi-reload"></span>
            <span class="iconify hover" data-icon="mdi-reload"></span>
        </div>
    </div>
</div>
<main>
    <div>
        ${ITEM_TEMPLATE}
    </div>
</main>
`;
customElements.define("filepicker-root", FilePicker);
