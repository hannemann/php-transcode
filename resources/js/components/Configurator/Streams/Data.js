import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

class Data extends Stream {

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
        return `Stream #0:${item.index} ${item.codec_name}`
    }

    getIndexDescription(item) {
        const index = `Stream #0:${ item.index }${ (item.id?.wrap('[', ']') || '') }:`;
        const lang = (item.tags?.language || '').wrap('(', ')');
        return `${index} ${lang}`;
    }

    getCodecDescription(item) {
        const codec = [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') || '';
        return `Data: ${ item.codec_name } ${ codec }`;
    }
}

Data.prototype.header = 'Data'

Data.template = /*html*/`
${CARD_CSS}
${MAINSTART}
<section class="toggle">
    <div class="short-description visible" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-right"></span>
        Stream #0:{{ item.index }}
        {{ item.codec_name }}
    </div>
    <div class="long-description" data-desc="index" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-down"></span>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
        {{ (item.tags?.language || '').wrap('(', ')') }}
    </div>
    <div class="long-description" data-desc="codec"></div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-data', Data);