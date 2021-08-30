import { Slim } from 'slim-js';
import '../slim-directives';
import './FilePicker/FilePicker'
import './Transcoder/Configurator'

class Transcoder extends Slim {

    onAdded() {
        this.filePicker.channelHash = this.dataset.channel
    }
}

Transcoder.template = /*html*/`
<main>
    <h1>Transcoder</h1>
    <filepicker-root #ref="filePicker"></filepicker-root>
    <transcode-configurator></transcode-configurator>
</main>
`

customElements.define('ffmpeg-transcoder', Transcoder);