import { Slim } from 'slim-js';
import '../../../slim-directives';
import CARD_CSS from './CardCss';
import FileHelper from '../../../Helper/File';

class Format extends Slim {

    get duration() {
        if (!this.format.duration) {
            return 'N/A';
        }
        return new Date(this.format.duration * 1000).toISOString().replace(/^[0-9-]+T/, '').replace(/z$/i, '')
    }

    get size() {
        return FileHelper.fileSizeH(this.format.size)
    }

    get bitRate() {
        if (!this.format.bit_rate) {
            return 'N/A';
        }
        return `${Math.round(this.format.bit_rate / 1000)} kb/s`
    }
}

Format.template = /*html*/`
${CARD_CSS}
<main>
    <h2>Format</h2>
    <section>
        <div>{{ this.format.filename }}</div>
        <div>Container: {{ this.format.format_long_name }} / {{ this.format.format_name }}
        <div>Duration: {{ this.duration }}, Size: {{ this.size }}, Bitrate: {{ this.bitRate }}</div>
    </section>
</main>
`

customElements.define('transcode-configurator-format', Format);