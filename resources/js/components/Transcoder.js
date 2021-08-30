import { Slim } from 'slim-js';
import '../slim-directives';
import './FilePicker/FilePicker'
import './Transcoder/Configurator'
import './Loading'

class Transcoder extends Slim {

    onAdded() {
        let backgroundHandler = this.toggleBackground.bind(this);
        this.filePicker.channelHash = this.dataset.channel
        document.addEventListener('loading', backgroundHandler)
        document.addEventListener('configurator-show', backgroundHandler)
    }

    toggleBackground(e) {
        this.classList.toggle('background', !!e.detail)
    }
}

Transcoder.template = /*html*/`
<style>
    :host(.background) main {
        filter: blur(3px);
    }
    :host(.background) main {
        height: calc(100vh - .4rem);
        overflow: hidden;
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
<transcoder-loading></transcoder-loading>
`

customElements.define('ffmpeg-transcoder', Transcoder);