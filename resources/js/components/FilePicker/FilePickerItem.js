import { FilePickerBase, TYPE_DIRECTORY, TYPE_FILE } from './FilePickerBase'
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import { Request } from "@/components/Request";

class FilePickerItem extends FilePickerBase {
    constructor() {
        super();
        this.wsUrl.push(encodeURIComponent(this.path));
        this.isDirectory = this.type === TYPE_DIRECTORY;
        this.isFile = this.type === TYPE_FILE;
        this.delete = this.delete.bind(this);
    }

    onAdded() {
        super.onAdded();
        requestAnimationFrame(() => this.update());
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

    get title() {
        return this.buildTitle();
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
    filepicker-item {
        margin-left: var(--gutter-base);
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
    <span class="iconify inactive" data-icon="{{ this.icon }}"></span>
    <span class="iconify active" data-icon="{{ this.icon }}"></span>
    <span class="iconify hover" data-icon="{{ this.icon }}"></span>
</div>
`;

/** preserve whitespaces! */
const ITEM_TEMPLATE = /*html*/ `
<filepicker-item
    *foreach="{{ this.items }}"
    .type="{{ item.type }}"
    .path="{{ item.path }}"
    .channel-hash="{{ item.channel }}"
    .mime="{{ item.mime }}"
    .size="{{ item.size }}"
    .last-modified="{{ item.lastModified }}"
    .internal="{{ item.internal }}"
    .name="{{ item.name }}"
>
        {{ item.name }}
</filepicker-item>
`;

FilePickerItem.template = /*html*/ `
${CSS}
<div class="{{ (this.isFile ? 'file' : 'dir') + (this.internal ? ' internal' : '') }}">
    <div class="item">
        ${ICON_TEMPLATE}
        <span @click="this.handleClick()" title="{{ this.title }}" class="label">
            <slot></slot>
        </span>
        <span *if="{{ this.type === 'f' }}" class="info">{{ this.size }}</span>
        <span *if="{{ this.type === 'f' }}" class="info">{{ this.getLocalDate() }}</span>
        <button *if="{{ this.internal }}" class="icon-stack delete" @click="{{ this.delete }}">
            <span class="iconify" data-icon="mdi-trash-can-outline"></span>
            <span class="iconify hover" data-icon="mdi-trash-can-outline"></span>
        </button>
        <div class="dummy-button" *if="{{ !this.internal }}"></div>
    </div>
    ${ITEM_TEMPLATE}
</div>
`;

customElements.define("filepicker-item", FilePickerItem);

export default ITEM_TEMPLATE;