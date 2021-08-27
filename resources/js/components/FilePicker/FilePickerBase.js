import { Utils, Slim } from 'slim-js';
import '../../slim-directives';

class FilePickerBase extends Slim {

    constructor() {
        super()
        this.items = []
        this.wsUrl = [this.wsBaseUrl]
    }

    onAdded() {
        this.wsChannel = `${this.wsEvent}.${this.dataset.channel}`
        this.channel = window.Echo.channel(this.wsChannel)
        this.channel.listen(this.wsEvent, this.onWsEvent.bind(this));
    }

    onRemoved() {
        this.items = []
        this.channel.stopListening(this.wsEvent)
        window.Echo.leave(this.wsChannel)
    }

    onWsEvent(e) {
        this.items = e.items
    }

    async fetch() {
        try {
            this.classList.add(this.loadingClass)
            await fetch(this.wsUrl.join(''));
            this.classList.remove(this.loadingClass)
        } catch (error) {
            console.error(error)
        }
    }
}

FilePickerBase.prototype.wsBaseUrl = '/file-picker/'
FilePickerBase.prototype.wsEvent = 'FilePicker'
FilePickerBase.prototype.loadingClass = 'loading'
FilePickerBase.prototype.ds = ''

export default FilePickerBase