import { FilePickerBase } from './FilePickerBase';
import './FilePickerItem';

import ITEM_TEMPLATE from './FilePickerItem';

class FilePicker extends FilePickerBase {

    onAdded() {
        super.onAdded()
        this.path = 'root'
        this.initWebsocket();
    }
}

FilePicker.template = /*html*/`
<div>
    ${ITEM_TEMPLATE}
</div>
`
customElements.define('filepicker-root', FilePicker);