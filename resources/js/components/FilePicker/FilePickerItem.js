import FilePickerBase from './FilePickerBase';
import Iconify from '@iconify/iconify';

const TYPE_DIRECTORY = 'd';
const TYPE_FILE = 'f';

class FilePickerItem extends FilePickerBase {

    constructor() {
        super()
        this.wsUrl.push(encodeURIComponent(this.dataset.path))
        this.isDirectory = this.dataset.type === TYPE_DIRECTORY
        this.isFile = this.dataset.type === TYPE_FILE
    }

    onAdded() {
        super.onAdded()
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    handleClick() {
        if (!this.items.length) {
            if (TYPE_DIRECTORY === this.dataset.type) {
                this.fetch()
            } else if (TYPE_FILE === this.dataset.type) {
                console.log('Pick file %s', this.dataset.name);
            }
        } else {
            this.items = []
        }
    }

    get icon() {
        if (this.isDirectory) {
            return 'mdi-folder'
        }
        switch(this.dataset.mime.split('/').shift().toLowerCase()) {
            case 'video':
                return 'mdi-filmstrip'
            case 'text':
                return 'mdi-note-text-outline'
            case 'image':
                return 'mdi-file-image-outline'
            default:
                return 'mdi-file'
        }
    }

    get title() {
        let result = this.dataset.path.trim()
        if (this.dataset.mime) {
            result += ` - ${this.dataset.mime}`
        }
        if (this.dataset.size) {
            result += ` - ${this.dataset.size}`
        }
        if (this.dataset.lastModified) {
            let d = new Date(this.dataset.lastModified * 1000)
            let date = d.toLocaleDateString(d.getTimezoneOffset(), {year: 'numeric', month: '2-digit', day: '2-digit'})
            let time = d.toLocaleTimeString(d.getTimezoneOffset())
            result += ` - ${date} ${time}`
        }
        return result
    }
}

const CSS = /*css*/`
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
    span:hover {
        background-color: var(--clr-bg-100);
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
</style>
`

const ICONS_TEMPLATE = /*html*/`
<span class="iconify" data-icon="{{ this.icon }}"></span>
`

/** preserve whitespaces! */
const ITEM_TEMPLATE = /*html*/`
<filepicker-item
    *foreach="{{ this.items }}"
    data-type="{{ item.type }}"
    data-path="{{ item.path }}"
    data-channel="{{ item.channel }}"
    data-mime="{{ item.mime }}"
    data-size="{{ item.size }}"
    data-last-modified="{{ item.lastModified }}"
>
        {{ item.name }}
</filepicker-item>
`

FilePickerItem.template = /*html*/`
${CSS}
<div>
    ${ICONS_TEMPLATE}
    <span @click="this.handleClick()" title="{{ this.title }}">
        <slot></slot>
    </span>
    ${ITEM_TEMPLATE}
</div>
`;

customElements.define('filepicker-item', FilePickerItem);

export default ITEM_TEMPLATE