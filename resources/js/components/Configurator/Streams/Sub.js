import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Sub extends Stream {}

Sub.prototype.header = 'Subtitle'

Sub.template = /*html*/`
${CARD_CSS}
${MAINSTART}
<section class="toggle">
    <div class="{{ item.shortView && 'visible' }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-right"></span>
        Stream #0:{{ item.index }}
        {{ item.codec_name }}
        {{ (item.tags?.language || '').wrap('(', ')') }}
        {{ Object.keys(item.disposition).filter(k => item.disposition[k] > 0).join(', ').wrap('(', ')') }}
        &nbsp;->&nbsp;
        {{ Object.values(SUBTITLE_CODECS).find(c => c.v === item.transcodeConfig.codec).l }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-down"></span>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}">
        Subtitle: {{ item.codec_name }}
        {{ [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') }}
        {{ Object.keys(item.disposition).filter(k => item.disposition[k] > 0).join(', ').wrap('(', ')') }}
    </div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-sub', Sub);