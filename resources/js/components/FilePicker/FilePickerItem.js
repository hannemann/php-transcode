import { FilePickerBase, TYPE_DIRECTORY, TYPE_FILE } from './FilePickerBase'
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import { Request } from "@/components/Request";

class FilePickerItem extends FilePickerBase {

    connectedCallback() {
        super.connectedCallback();
        this.wsUrl.push(encodeURIComponent(this.path));
        this.handleClick = this.handleClick.bind(this);
        this.delete = this.delete.bind(this);
        this.addListeners();
        requestAnimationFrame(() => this.update());
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeListeners();
    }

    initDom() {
        super.initDom();

        this.initType();
        this.initIcon();

        this.itemsContainer.classList.toggle('internal', this.internal);
        if (this.internal) {
            this.shadowRoot.querySelector('.dummy-button').remove();
        } else {
            this.shadowRoot.querySelector('.icon-stack.delete').remove();
        }
    }

    initType() {
        this.isDirectory = this.type === TYPE_DIRECTORY;
        this.isFile = this.type === TYPE_FILE;
        this.itemsContainer.classList.toggle('file', this.type === TYPE_FILE);
        this.itemsContainer.classList.toggle('dir', this.type === TYPE_DIRECTORY);
        if (this.isFile) {
            this.shadowRoot.querySelector('.info[data-info="size"]').innerText = this.size;
            this.shadowRoot.querySelector('.info[data-info="date"]').innerText = this.getLocalDate();
        } else {
            this.shadowRoot.querySelectorAll('.info').forEach(i => i.remove());
        }
    }

    initIcon() {
        this.shadowRoot.querySelectorAll('.icon-stack:not(.delete) .iconify')
            .forEach(i => i.dataset.icon = this.icon);
    }

    addListeners() {
        this.shadowRoot.querySelector('.label').addEventListener('click', this.handleClick);
        this.shadowRoot.querySelector('.icon-stack.delete')?.addEventListener('click', this.delete);
    }

    removeListeners() {
        this.shadowRoot.querySelector('.label').removeEventListener('click', this.handleClick);
        this.shadowRoot.querySelector('.icon-stack.delete')?.removeEventListener('click', this.delete);
    }

    update() {
        this.title = this.buildTitle();
        Iconify.scan(this.shadowRoot);
    }

    handleClick() {
        if (TYPE_DIRECTORY === this.type) {
            this.dirClicked();
        }
        if (TYPE_FILE === this.type) {
            this.fileClicked();
        }
    }

    dirClicked() {
        if (!this.items.length) {
            this.iconActive = true;
            this.initWebsocket();
        } else {
            this.items = [];
            this.iconActive = false;
            this.leaveWebsocket();
        }
    }

    fileClicked() {
        const detail = {
            node: this,
            path: this.path,
            channel: this.channelHash,
            mime: this.mime,
            size: this.size,
            type: this.type,
        };
        const parent = this.getRootNode().host;
        if (parent) {
            detail.parent = {
                node: parent,
                path: parent.path,
                videoFiles: parent.videoFiles,
                channelHash: parent.channelHash,
            };
        }
        this.iconActive = true;
        document.dispatchEvent(new CustomEvent("file-clicked", { detail }));
    }

    buildTitle() {
        let result = this.path.trim();
        if (this.mime) {
            result += ` - ${this.mime}`;
        }
        if (this.size) {
            result += ` - ${this.size}`;
        }
        if (this.lastModified) {
            result += ` - ${this.getLocalDate()}`;
        }
        return result;
    }

    getLocalDate() {
        let d = new Date(this.lastModified * 1000);
        let date = d.toLocaleDateString(d.getTimezoneOffset(), {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        let time = d.toLocaleTimeString(d.getTimezoneOffset());
        return `${date} ${time}`;
    }

    async delete() {
        const m = document.createElement("modal-confirm");
        m.header = "Delete";
        m.content = `Delete file ${this.path}?`;
        document.body.appendChild(m);
        try {
            await m.confirm();
            await Request.delete(
                `/file-picker/${encodeURIComponent(this.path)}`
            );
            this.getRootNode().host.dispatchEvent(
                new CustomEvent("child-deleted")
            );
        } catch (error) {}
    }

    get icon() {
        if (this.isDirectory) {
            return "mdi-folder";
        }
        switch (this.fileType) {
            case "video":
                return "mdi-filmstrip";
            case "text":
                return "mdi-note-text-outline";
            case "image":
                return "mdi-file-image-outline";
            default:
                return "mdi-file";
        }
    }

    set title(value) {
        this.shadowRoot.querySelector('.label').title = value;
    }

    get title() {
        return this.shadowRoot.querySelector('.label').title;
    }

    get fileType() {
        let mime = this.mime.split("/").shift().toLowerCase();
        switch (mime) {
            case "video":
            case "text":
            case "image":
                return mime;
            default:
                return "unknown";
        }
    }

    get hasFiles() {
        return (
            this.isDirectory &&
            this.items.filter((i) => i.type === TYPE_FILE).length > 0
        );
    }

    get videoFiles() {
        if (this.hasFiles) {
            return this.items.filter(
                (i) =>
                    i.type === TYPE_FILE &&
                    "video" === i.mime.split("/").shift().toLowerCase()
            );
        }
        return [];
    }
}

const CSS = /*css*/ `
<style>
    :host {
        display: block;
    }
    :host(.${FilePickerBase.prototype.loadingClass}) {
        animation: pulse 1s infinite;
    }
    span {
        display: inline-block;
        cursor: pointer;
        padding: calc(var(--gutter-base) / 4) calc(var(--gutter-base) / 2);
    }
    :host(:hover) span {
        background-color: var(--clr-bg-100);
    }
    :host(:hover) .icon-stack:not(:disabled):not(.active):not(button) svg.hover {
        opacity: 1;
    }
    .items {
        margin-left: var(--gutter-base);

        &:empty {
            display: none;
        }
    }
    @keyframes pulse {
        0% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
        100% {
            opacity: 1;
        }
    }
    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .label {
        margin-right: auto;
    }
    .icon-stack {
        width: 1em;
        height: 1em;
        display: inline-block;
    }
    .file.internal button.delete {
        font-size: 1rem;
        display: revert;
    }
    .dummy-button {
        width: 1rem;
    }
    .info {
        font-size: .85em;
    }
</style>
${ICON_STACK_CSS}
`;

const ICON_TEMPLATE = /*html*/ `
<div class="icon-stack">
    <span class="iconify inactive"></span>
    <span class="iconify active"></span>
    <span class="iconify hover"></span>
</div>
`;

FilePickerItem.template = /*html*/ `
${CSS}
<main>
    <div class="item">
        ${ICON_TEMPLATE}
        <span class="label">
            <slot></slot>
        </span>
        <span class="info" data-info="size"></span>
        <span class="info" data-info="date"></span>
        <button class="icon-stack delete">
            <span class="iconify" data-icon="mdi-trash-can-outline"></span>
            <span class="iconify hover" data-icon="mdi-trash-can-outline"></span>
        </button>
        <div class="dummy-button"></div>
    </div>
    <div class="items"></div>
</main>
`;

customElements.define("filepicker-item", FilePickerItem);