import {Request} from '@/components/Request'

const TYPE_DIRECTORY = 'd'
const TYPE_FILE = 'f'
class FilePickerBase extends Slim {

    constructor() {
        super()
        this.items = []
        this.wsUrl = [this.wsBaseUrl]
    }

    onAdded() {
        this.wsChannel = `${this.wsEvent}.${this.channelHash}`
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
        console.info('Received %d items in %s', this.items.length, this.path)
        Request.loading = false
    }

    handleClick() {
        if (!this.items.length) {
            if (TYPE_DIRECTORY === this.type) {
                this.shadowRoot.querySelector('.icon-stack').classList.toggle('active', true)
                this.requestItems()
            } else if (TYPE_FILE === this.type) {
                this.handleFileClick()
            }
        }
    }

    handleFileClick() {
        let evt = new CustomEvent('file-clicked', {
            detail: {
                path: this.path,
                channel: this.channelHash,
                mime: this.mime,
                size: this.size,
                type: this.type
            }
        })

        document.dispatchEvent(evt)
    }

    requestItems() {
        try {
            this.classList.add(this.loadingClass)
            console.info('Request items in %s', this.path)
            Request.loading = true
            Request.get(this.wsUrl.join(''))
        } catch (error) {
            Request.loading = false
        } finally {
            this.classList.remove(this.loadingClass)
        }
    }
}

FilePickerBase.prototype.wsBaseUrl = '/file-picker/'
FilePickerBase.prototype.wsEvent = 'FilePicker'
FilePickerBase.prototype.loadingClass = 'loading'

export { FilePickerBase, TYPE_FILE, TYPE_DIRECTORY }