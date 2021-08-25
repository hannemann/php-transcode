import { Utils, Slim } from 'slim-js';
import '../slim-directives';
import Iconify from '@iconify/iconify';

const TYPE_DIRECTORY = 'd';
const TYPE_FILE = 'f';

class FilePickerItem extends Slim {
    constructor() {
        super()
        this.items = []
    }

    handleClick() {
        if (!this.items.length) {
            if (TYPE_DIRECTORY === this.dataset.type) {
                console.log('Load children');
                this.items = [
                    {name: 'lala', type: TYPE_DIRECTORY},
                    {name: 'boing', type: TYPE_FILE}
                ];
            } else if (TYPE_FILE === this.dataset.type) {
                console.log('Pick file %s');
            }
        } else {
            this.items = []
        }
    }

    onAdded() {
        this.isDirectory = this.dataset.type === TYPE_DIRECTORY
        this.isFile = this.dataset.type === TYPE_FILE
        setTimeout(() => Iconify.scan(this.shadowRoot))
    }
}

FilePickerItem.template = /*html*/`
<script>
import Iconify from '@iconify/iconify';
</script>
<style>
    :host([data-type="${TYPE_FILE}"]) div {}
    :host {
        display: block;
    }
    span {
        display: inline-block;
        cursor: pointer;
        padding: calc(var(--gutter-base) / 4) calc(var(--gutter-base) / 2)
    }
    span:hover {
        background-color: var(--clr-bg-100);
    }
    filepicker-item {
        margin-left: 1rem;
    }
</style>
<div>
    <span *if="{{ this.isDirectory }}" class="iconify" data-icon="mdi-folder"></span>
    <span *if="{{ this.isFile }}" class="iconify" data-icon="mdi-file"></span>
    <span @click="this.handleClick()"><slot></slot></span>
    <filepicker-item *foreach="{{ this.items }}" data-type="{{ item.type }}">{{ item.name }}</filepicker-item>
</div>
`;

customElements.define('filepicker-item', FilePickerItem);