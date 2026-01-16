import {Request} from '@/components/Request';
import {DomHelper} from '../../Helper/Dom';

const TYPE_DIRECTORY = 'd'
const TYPE_FILE = 'f'
class FilePickerBase extends HTMLElement {

    connectedCallback() {
        this.items = []
        this.wsUrl = [this.wsBaseUrl]
        this.requestItems = this.requestItems.bind(this)
        this.onWsEvent = this.onWsEvent.bind(this)

        this.initDom();

        this.wsChannel = `${this.wsEvent}.${this.channelHash}`
        this.addEventListener('child-deleted', this.requestItems)
    }

    disconnectedCallback() {
        this.leaveWebsocket()
        this.removeEventListener('child-deleted', this.requestItems)
    }

    initDom() {
        DomHelper.initDom.call(this);
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
        this.removeItems();
        this.renderItems();
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

    renderItems() {
        const container = this.shadowRoot.querySelector('.items');
        this.items.forEach(i => {
            const item = document.createElement('filepicker-item');
            item.path = i.path;
            item.channelHash = i.channel;
            item.size = i.size;
            item.lastModified = i.lastModified;
            item.internal = i.internal;
            item.name = i.name;
            item.innerText = i.name;
            item.type = i.type;
            item.mime = i.mime;
            container.append(item);
        });
    }

    removeItems() {
        this.shadowRoot.querySelectorAll('filepicker-item').forEach(i => i.remove());
    }

    set iconActive(value) {
        this.shadowRoot.querySelector('.icon-stack').classList.toggle('active', value)
    }
}

FilePickerBase.prototype.wsBaseUrl = '/file-picker/'
FilePickerBase.prototype.wsEvent = 'FilePicker'
FilePickerBase.prototype.loadingClass = 'loading'

export { FilePickerBase, TYPE_FILE, TYPE_DIRECTORY }