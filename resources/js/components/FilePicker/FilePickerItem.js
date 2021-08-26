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
<span *if="{{ this.isDirectory }}" class="iconify" data-icon="mdi-folder"></span>
<span *if="{{ this.isFile }}" class="iconify" data-icon="mdi-file"></span>
`

/** preserve whitespaces! */
const ITEM_TEMPLATE = /*html*/`
<filepicker-item
    *foreach="{{ this.items }}"
    data-type="{{ item.type }}"
    data-path="{{ item.path }}"
    data-channel="{{ item.channel }}"
>
        {{ item.name }}
</filepicker-item>
`

FilePickerItem.template = /*html*/`
${CSS}
<div>
    ${ICONS_TEMPLATE}
    <span @click="this.handleClick()"><slot></slot></span>
    ${ITEM_TEMPLATE}
</div>
`;

customElements.define('filepicker-item', FilePickerItem);

export default ITEM_TEMPLATE