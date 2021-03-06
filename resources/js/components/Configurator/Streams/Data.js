import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Data extends Stream {}

Data.prototype.header = 'Data'

Data.template = /*html*/`
${CARD_CSS}
${MAINSTART}
<section class="toggle">
    <div class="{{ item.shortView && 'visible' }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-right"></span>
        Stream #0:{{ item.index }}
        {{ item.codec_name }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-down"></span>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}">
        Data: {{ item.codec_name }}
        {{ [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') }}
    </div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-data', Data);