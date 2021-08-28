import FilePickerBase from './FilePickerBase'
import { Utils } from 'slim-js';
import Iconify from '@iconify/iconify'

const TYPE_DIRECTORY = 'd'
const TYPE_FILE = 'f'
const FFMPEG_PROCESS_STAGE_PENDING = 0
const FFMPEG_PROCESS_STAGE_RUNNING = 1
const FFMPEG_PROCESS_STAGE_DONE = 2

class FilePickerItem extends FilePickerBase {

    constructor() {
        super()
        this.wsUrl.push(encodeURIComponent(this.dataset.path))
        this.isDirectory = this.dataset.type === TYPE_DIRECTORY
        this.isFile = this.dataset.type === TYPE_FILE
        this.canConcat = false
        this.concatPending = false
        this.concatRunning = false
    }

    onAdded() {
        super.onAdded()
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    onWsEvent(e) {
        super.onWsEvent(e)
        this.setCanConcat()
    }

    setCanConcat() {
        this.canConcat = this.videoFiles.length > 1 &&
            !this.videoFiles.find(i => i.name === `${this.dataset.channel}-concat.ts`)
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
            this.setCanConcat()
        }
    }

    requestConcat() {
        console.info('Concat video files in %s', this.dataset.path)
        let event = 'FFMpegProcess'
        let channel = window.Echo.channel(`FFMpegProcess.${this.dataset.channel}`)
        try {
            channel.listen(event, this.handleProcessEvent.bind(this, channel, event))
            channel.subscribed(async () => await fetch(`/concat/${this.dataset.path}`))
            console.info('%s has subscribed to channel %s', this.dataset.path, channel.name)
        } catch (error) {
            this.leaveProcessChannel(channel, event);
            console.error(error)
        }
    }

    requestTranscode() {
        console.info('Transcode video file %s', this.dataset.path)
        let event = 'FFMpegProcess'
        let channel = window.Echo.channel(`FFMpegProcess.${this.dataset.channel}`)
        try {
            channel.listen(event, this.handleProcessEvent.bind(this, channel, event))
            channel.subscribed(async () => await fetch(`/transcode/${this.dataset.path}`))
            console.info('%s has subscribed to channel %s', this.dataset.path, channel.name)
        } catch (error) {
            this.leaveProcessChannel(channel, event);
            console.error(error)
        }
    }

    handleProcessEvent(channel, event, ws) {
        let process = ws.name.split('.').shift()
        let processU = process[0].toUpperCase() + process.slice(1)
        switch(ws.name) {
            case `${process}.pending`:
                console.info('%s video file %s queued at %s', processU, this.dataset.path, new Date().toLocaleTimeString())
                this.concatPending = true
                this.canConcat = false
                break
            case `${process}.running`:
                console.info('%s video file %s started at %s', processU, this.dataset.path, new Date().toLocaleTimeString())
                this.concatRunning = true
                this.canConcat = false
                break
            case `${process}.done`:
                console.info('%s video files in %s done at %s', processU, this.dataset.path, new Date().toLocaleTimeString())
                this.leaveProcessChannel(channel, event)
                if (this.items.length) {
                    this.items = []
                    requestAnimationFrame(this.fetch.bind(this))
                }
                break
            case `${process}.progress`:
                console.info('%s progress: %d%%', processU, ws.data.percentage)
                break
            case `${process}.failed`:
                console.error('%s video files in %s failed', processU, this.dataset.path)
                this.leaveProcessChannel(channel, event)
                this.setCanConcat()
        }
    }

    leaveProcessChannel(channel, event) {
        channel.stopListening(event)
        window.Echo.leave(channel.name)
        console.info('%s has left channel %s', this.dataset.path, channel.name)
    }

    get icon() {
        if (this.isDirectory) {
            return 'mdi-folder'
        }
        switch(this.fileType) {
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

    get fileType() {
        let mime = this.dataset.mime.split('/').shift().toLowerCase() 
        switch(mime) {
            case 'video':
            case 'text':
            case 'image':
                return mime
            default:
                return 'unknown'
        }
    }

    get hasFiles() {
        return this.isDirectory &&
                this.items.filter(i => i.type === TYPE_FILE).length > 0
    }

    get videoFiles() {
        if (this.hasFiles) {
            return this.items.filter(i => i.type === TYPE_FILE && 'video' === i.mime.split('/').shift().toLowerCase())
        }
        return []
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

const ICON_TEMPLATE = /*html*/`
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
    <div>
        ${ICON_TEMPLATE}
        <span @click="this.handleClick()" title="{{ this.title }}">
            <slot></slot>
        </span>
        <span *if="{{ this.canConcat }}" @click="this.requestConcat()">Concat?</span>
        <span *if="{{ this.dataset.mime.toLowerCase().indexOf('video') === 0 }}" @click="this.requestTranscode()">Transcode?</span>
    </div>
    ${ITEM_TEMPLATE}
</div>
`;

customElements.define('filepicker-item', FilePickerItem);

export default ITEM_TEMPLATE