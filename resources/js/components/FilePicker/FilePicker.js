import { FilePickerBase } from './FilePickerBase';
import './FilePickerItem';

import ITEM_TEMPLATE from './FilePickerItem';

class FilePicker extends FilePickerBase {

    onAdded() {
        super.onAdded()
        this.ds = this.dataset.ds
        this.dataset.path = 'root'
        this.channel.subscribed(this.fetch.bind(this))
    }
}

FilePicker.template = /*html*/`
<div>
    ${ITEM_TEMPLATE}
</div>
`
customElements.define('filepicker-root', FilePicker);