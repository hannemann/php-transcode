import { DomHelper } from "../../Helper/Dom";
import Iconify from "@iconify/iconify";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import { Request } from "@/components/Request";
import { Time } from "../../Helper/Time";

const CSRF_TOKEN = document.head.querySelector(
    "[name~=csrf-token][content]",
).content;

class ProgressItem extends HTMLElement {
    constructor() {
        super();
        this.showCommand = this.showCommand.bind(this);
    }

    connectedCallback() {
        DomHelper.initDom.call(this);
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    disconnectedCallback() {
        this.shadowRoot
            .querySelectorAll("[data-click]")
            .forEach((i) => i.removeEventListener("click", this));
    }

    addListeners() {
        this.shadowRoot
            .querySelectorAll("[data-click]")
            .forEach((i) => i.addEventListener("click", this));
    }

    handleEvent(e, item) {
        switch (e.currentTarget.dataset.click) {
            case "show":
                this.showCommand(item);
                break;
            case "delete":
                this.delete(item);
                break;
        }
    }

    showCommand(item) {
        console.log(item.command);
        document.dispatchEvent(
            new CustomEvent("show-textcontent", {
                detail: { content: item.command },
            }),
        );
    }

    getDuration(item) {
        return Time.deltaDuration(
            new Date(item.start),
            new Date(item.end !== "-1" ? item.end : item.updated_at),
        );
    }

    getItemPath(item) {
        return `${item.type.ucfirst()}: ${item.path}`;
    }

    initItemTemplate() {
        const itemTemplate = this.shadowRoot.querySelector(
            'template[data-type="item"]',
        );
        this.itemTemplate = itemTemplate.content;
        itemTemplate.remove();
    }

    getItemTemplateNode(index) {
        const node = document
            .importNode(this.itemTemplate, true)
            .querySelector(".item");
        node.dataset.itemIndex = index;
        return node;
    }

    async delete(item) {
        try {
            Request.delete(`/progress/${item.id}`);
        } catch (error) {}
    }
}

const PROGRESS_ITEM_CSS = /*css*/ `
<style>
:host > div {
    display: flex;
    justify-content: space-between;
    gap: .5em;
}
header {
    font-weight: bold;
    user-select: none;
}
div > div:last-child {
    text-align: right;
    margin-left: auto;
    width: 4em;
}
div.path {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-grow: 1;
}
div.path.show {
    cursor: pointer;
}
div.icon-stack {
    width: 1em;
}
</style>
${ICON_STACK_CSS}
`;

export { PROGRESS_ITEM_CSS, ProgressItem };
