import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Audio extends Stream {}

Audio.prototype.header = 'Audio'

Audio.template = /*html*/`
${CARD_CSS}
${MAINSTART}
<section class="toggle">
    <div class="{{ item.shortView && 'visible' }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-right"></span>
        Stream #0:{{ item.index }}
        {{ item.codec_name }}
        {{ item.channel_layout && item.channel_layout + ',' || '' }}
        {{ (item.bit_rate && Math.round(item.bit_rate / 1000) + ' kb/s') || '' }}
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-down"></span>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}">
        Audio: {{ item.codec_name }}
        {{ [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') }},
        {{ item.sample_rate && item.sample_rate + 'Hz,' || '' }}
        {{ item.channel_layout && item.channel_layout + ',' || '' }}
        {{ item.sample_fmt && item.sample_fmt + ',' || '' }}
        {{ (item.bit_rate && Math.round(item.bit_rate / 1000) + ' kb/s') || '' }}
    </div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-audio', Audio);