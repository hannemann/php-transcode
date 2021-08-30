import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Data extends Stream {}

Data.prototype.header = 'Data'

Data.template = /*html*/`
${CARD_CSS}
${MAINSTART}
    <div>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div>
        Data: {{ item.codec_name }}
        {{ [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') }}
    </div>
${MAINEND}
`

customElements.define('transcode-configurator-stream-data', Data);