import { Slim } from 'slim-js';
import '../slim-directives';
import './FilePicker/FilePicker'
import './Transcoder/Configurator'
import './Loading'

class Transcoder extends Slim {

    onAdded() {
        this.filePicker.channelHash = this.dataset.channel
        document.addEventListener('loading', e => this.classList.toggle('loading', !!e.detail))
    }
}

Transcoder.template = /*html*/`
<style>
    :host(.loading) main {
        filter: blur(3px)
    }
    main {
        filter: blur(0);
        transition: var(--loading-transition);
    }
</style>
<main>
    <h1>Transcoder</h1>
    <filepicker-root #ref="filePicker"></filepicker-root>
    <transcode-configurator></transcode-configurator>
</main>
<transcoder-loading></transcoder-loading>
`

customElements.define('ffmpeg-transcoder', Transcoder);