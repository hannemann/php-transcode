import { FilePickerBase, TYPE_DIRECTORY, TYPE_FILE } from './FilePickerBase'
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import { Request } from '../Request'

const FFMPEG_PROCESS_STAGE_PENDING = 0
const FFMPEG_PROCESS_STAGE_RUNNING = 1
const FFMPEG_PROCESS_STAGE_DONE = 2

class FilePickerItem extends FilePickerBase {

    constructor() {
        super()
        this.wsUrl.push(encodeURIComponent(this.path))
        this.isDirectory = this.type === TYPE_DIRECTORY
        this.isFile = this.type === TYPE_FILE
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

    handleClick() {
        super.handleClick()
        if (this.items.length) {
            this.shadowRoot.querySelector('.icon-stack').classList.toggle('active', false)
            this.items = []
            this.setCanConcat()
        }
    }

    setCanConcat() {
        this.canConcat = this.videoFiles.length > 1 &&
            !this.videoFiles.find(i => i.name === `${this.channelHash}-concat.ts`)
    }

    async requestConcat() {
        console.info('Concat video files in %s', this.path)
        try {
            await Request.get(`/concat/${this.path}`)
        } catch (error) {
            console.error(error)
        }
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
        let result = this.path.trim()
        if (this.mime) {
            result += ` - ${this.mime}`
        }
        if (this.size) {
            result += ` - ${this.size}`
        }
        if (this.lastModified) {
            let d = new Date(this.lastModified * 1000)
            let date = d.toLocaleDateString(d.getTimezoneOffset(), {year: 'numeric', month: '2-digit', day: '2-digit'})
            let time = d.toLocaleTimeString(d.getTimezoneOffset())
            result += ` - ${date} ${time}`
        }
        return result
    }

    get fileType() {
        let mime = this.mime.split('/').shift().toLowerCase() 
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
    .item {
        display: flex;
        align-items: center;
    }
    .icon-stack {
        width: 1em;
        height: 1em;
        display: inline-block;
    }
</style>
${ICON_STACK_CSS}
`

const ICON_TEMPLATE = /*html*/`
<div class="icon-stack">
    <span class="iconify inactive" data-icon="{{ this.icon }}"></span>
    <span class="iconify active" data-icon="{{ this.icon }}"></span>
    <span class="iconify hover" data-icon="{{ this.icon }}"></span>
</div>
`

/** preserve whitespaces! */
const ITEM_TEMPLATE = /*html*/`
<filepicker-item
    *foreach="{{ this.items }}"
    .type="{{ item.type }}"
    .path="{{ item.path }}"
    .channel-hash="{{ item.channel }}"
    .mime="{{ item.mime }}"
    .size="{{ item.size }}"
    .last-modified="{{ item.lastModified }}"
>
        {{ item.name }}
</filepicker-item>
`

FilePickerItem.template = /*html*/`
${CSS}
<div>
    <div class="item">
        ${ICON_TEMPLATE}
        <span @click="this.handleClick()" title="{{ this.title }}">
            <slot></slot>
        </span>
        <span *if="{{ this.canConcat }}" @click="this.requestConcat()">Concat?</span>
    </div>
    ${ITEM_TEMPLATE}
</div>
`;

customElements.define('filepicker-item', FilePickerItem);

export default ITEM_TEMPLATE