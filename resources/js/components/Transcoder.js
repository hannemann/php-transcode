import { Slim } from 'slim-js';
import '../slim-directives';
import './FilePicker/FilePicker'
import './Transcoder/Configurator'
import './TextViewer'
import './Loading'
import './Toast'
import './Progress'

class Transcoder extends Slim {

    onAdded() {
        let backgroundHandler = this.toggleBackground.bind(this);
        this.filePicker.channelHash = this.dataset.channel
        document.addEventListener('loading', backgroundHandler)
        document.addEventListener('configurator-show', backgroundHandler)
        document.addEventListener('textviewer-show', backgroundHandler)
    }

    toggleBackground(e) {
        if (!!e.detail) {
            this.scrollY = window.scrollY
            this.scrollX = window.scrollX
        }
        this.classList.toggle('background', !!e.detail)
        if (!e.detail) {
            window.scroll(this.scrollX, this.scrollY)
        }
    }
}

Transcoder.template = /*html*/`
<style>
    :host {
        display: block;
        height: calc(100vh - .4rem);
        overflow: auto;
    }
    :host(.background) {
        overflow: hidden;
    }
    :host(.background) main {
        filter: blur(3px);
    }
    main {
        padding: .2rem;
        filter: blur(0);
        transition: var(--loading-transition);
    }
</style>
<main>
    <h1>Transcoder</h1>
    <filepicker-root #ref="filePicker"></filepicker-root>
</main>
<transcode-configurator></transcode-configurator>
<text-viewer></text-viewer>
<transcoder-loading></transcoder-loading>
<transcoder-toast></transcoder-toast>
<ffmpeg-progress></ffmpeg-progress>
`

customElements.define('ffmpeg-transcoder', Transcoder);