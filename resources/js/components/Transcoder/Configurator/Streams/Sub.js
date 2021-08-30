import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Sub extends Stream {}

Sub.prototype.header = 'Subtitle'

Sub.template = /*html*/`
${CARD_CSS}
${MAINSTART}
    <div>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div>
        Subtitle: {{ item.codec_name }}
        {{ [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') }}
        {{ Object.keys(item.disposition).filter(k => item.disposition[k] > 0).join(', ').wrap('(', ')') }}
    </div>
${MAINEND}
`

customElements.define('transcode-configurator-stream-sub', Sub);