import { Slim, Utils } from '@/components/lib';
import {Request} from '@/components/Request'

const TYPE_DIRECTORY = 'd'
const TYPE_FILE = 'f'
class FilePickerBase extends Slim {

    constructor() {
        super()
        this.items = []
        this.wsUrl = [this.wsBaseUrl]
        this.wsChannel = `${this.wsEvent}.${this.channelHash}`
        this.requestItems = this.requestItems.bind(this)
        this.onWsEvent = this.onWsEvent.bind(this)
    }

    onAdded() {
        this.addEventListener('child-deleted', this.requestItems)
    }

    onRemoved() {
        this.leaveWebsocket()
        this.removeEventListener('child-deleted', this.requestItems)
    }

    initWebsocket() {
        this.channel = window.Echo.channel(this.wsChannel)
        this.channel.listen(this.wsEvent, this.onWsEvent);
        this.channel.subscribed(this.requestItems.bind(this))
    }

    leaveWebsocket() {
        if (this.channel) {
            this.channel.stopListening(this.wsEvent)
            window.Echo.leave(this.wsChannel)
        }
    }

    onWsEvent(e) {
        this.items = e.items
        if (!e.externalUpdate) {
            Request.loading = false
            console.info('Received %d items in %s', this.items.length, this.path)
        }
        requestAnimationFrame(() => {
            this.shadowRoot.querySelectorAll('filepicker-item').forEach(i => i.update())
        })
    }

    handleClick() {
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

    set iconActive(value) {
        this.shadowRoot.querySelector('.icon-stack').classList.toggle('active', value)
    }
}

FilePickerBase.prototype.wsBaseUrl = '/file-picker/'
FilePickerBase.prototype.wsEvent = 'FilePicker'
FilePickerBase.prototype.loadingClass = 'loading'

export { FilePickerBase, TYPE_FILE, TYPE_DIRECTORY }