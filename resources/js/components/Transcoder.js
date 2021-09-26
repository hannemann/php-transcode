import { Slim } from '@/components/lib';
import './FilePicker'
import './Configurator'
import './TextViewer'
import './Request'
import './Toast'
import './Progress'

class Transcoder extends Slim {

    constructor() {
        super()
        this.backgroundRequests = 0
    }

    onAdded() {
        let backgroundHandler = this.toggleBackground.bind(this);
        this.filePicker.channelHash = this.dataset.channel
        document.addEventListener('loading', backgroundHandler)
        document.addEventListener('configurator-show', backgroundHandler)
        document.addEventListener('textviewer-show', backgroundHandler)
    }

    toggleBackground(e) {
        if (e.detail) {
            this.scrollY = window.scrollY
            this.scrollX = window.scrollX
            this.backgroundRequests++
        } else {
            this.backgroundRequests--
        }
        this.classList.toggle('background', this.backgroundRequests)
        if (!this.backgroundRequests) {
            window.scroll(this.scrollX, this.scrollY)
        }
    }

    selectChange(e) {
        console.log('Change: ', e.target.value)
    }
    selectClick(e) {
        console.log('Action: ', e.target.value)
    }
    getNode() {
        return this
    }
}

Transcoder.template = /*html*/`
<style>
    :host {
        display: block;
    }
    :host(.background) {
        overflow: hidden;
        height: calc(100vh - .4rem);
    }
    :host(.background) main {
        filter: blur(3px);
    }
    main {
        padding: .2rem;
        filter: blur(0);
        transition: var(--loading-transition);
    }
    h1 {
        user-select: none;
    }
</style>
<main>
    <h1>Transcoder</h1>
    <filepicker-root #ref="filePicker"></filepicker-root>
</main>
<transcode-configurator #ref="configurator"></transcode-configurator>
<text-viewer></text-viewer>
<transcoder-loading></transcoder-loading>
<ffmpeg-progress></ffmpeg-progress>
<transcoder-toast></transcoder-toast>
`

customElements.define('ffmpeg-transcoder', Transcoder);