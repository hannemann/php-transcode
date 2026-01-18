import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Audio extends Stream {

    initItem(stream, node) {
        node.querySelector('.short-description')
            .append(document.createTextNode(this.getShortDescription(stream)));
        node.querySelector('.long-description[data-desc="index"]')
            .append(document.createTextNode(this.getIndexDescription(stream)));
        node.querySelector('.long-description[data-desc="codec"]')
            .append(document.createTextNode(this.getCodecDescription(stream)));
        return node;
    }

    getShortDescription(item) {
        const layout = item.channel_layout && item.channel_layout + ',' || '';
        const bitrate = (item.bit_rate && Math.round(item.bit_rate / 1000) + ' kb/s') || '';
        const lang = (item.tags?.language || '').wrap('(', ')');
        const targetCodec = Object.values(AUDIO_CODECS).find(c => c.v === item.transcodeConfig.codec).l ;
        const channels = `Channels: ${ item.transcodeConfig.channels }`;
        return `Stream #0:${item.index} ${item.codec_name} ${layout}`
            + `${bitrate}${lang} -> ${targetCodec}, ${channels}`
    }

    getIndexDescription(item) {
        const index = `Stream #0:${ item.index }${ (item.id?.wrap('[', ']') || '') }:`;
        const lang = (item.tags?.language || '').wrap('(', ')');
        return `${index} ${lang}`;
    }

    getCodecDescription(item) {
        const codec = [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') || '';
        const sampleRate = item.sample_rate && item.sample_rate + 'Hz, ' || '';
        const channelLayout = item.channel_layout && item.channel_layout + ', ' || '';
        const sampleFormat = item.sample_fmt && item.sample_fmt + ', ' || '';
        const bitRate = (item.bit_rate && Math.round(item.bit_rate / 1000) + ' kb/s') || '';
        return `Audio: ${ item.codec_name } ${ codec } ${ sampleRate }${channelLayout}${sampleFormat}${bitRate}`;
    }
}

Audio.prototype.header = 'Audio'

Audio.template = /*html*/`
${CARD_CSS}
${MAINSTART}
<section class="toggle">
    <div class="short-description visible" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-right"></span>        
    </div>
    <div class="long-description" data-desc="index" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-down"></span>
    </div>
    <div class="long-description" data-desc="codec"></div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-audio', Audio);