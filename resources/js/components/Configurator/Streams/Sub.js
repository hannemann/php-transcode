import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Sub extends Stream {

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
        const lang = (item.tags?.language || '').wrap('(', ')');
        const disp = Object.keys(item.disposition).filter(k => item.disposition[k] > 0).join(', ').wrap('(', ')');
        const targetCodec = Object.values(SUBTITLE_CODECS).find(c => c.v === item.transcodeConfig.codec)?.l || '' ;
        return `Stream #0:${item.index} ${item.codec_name} ${lang}, ${disp} -> ${targetCodec}`
    }

    getIndexDescription(item) {
        const index = `Stream #0:${ item.index }${ (item.id?.wrap('[', ']') || '') }:`;
        const lang = (item.tags?.language || '').wrap('(', ')');
        return `${index} ${lang}`;
    }

    getCodecDescription(item) {
        const codec = [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') || '';
        const disp = Object.keys(item.disposition).filter(k => item.disposition[k] > 0).join(', ').wrap('(', ')');
        return `Subtitle: ${ item.codec_name } ${ codec } ${ disp }`;
    }
}

Sub.prototype.header = 'Subtitle'

Sub.template = /*html*/`
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

customElements.define('transcode-configurator-stream-sub', Sub);