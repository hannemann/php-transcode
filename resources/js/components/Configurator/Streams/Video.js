import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

export const VALID_ASPECT_RATIOS = ["4:3", "16:9"];

class Video extends Stream {

    initItem(stream, node) {
        node.querySelector('.short-description')
            .append(document.createTextNode(this.getShortDescription(stream)));
        node.querySelector('.long-description[data-desc="index"]')
            .append(document.createTextNode(this.getIndexDescription(stream)));
        node.querySelector('.long-description[data-desc="codec"]')
            .append(document.createTextNode(this.getCodecDescription(stream)));
        node.querySelector('.long-description[data-desc="dim"]')
            .append(document.createTextNode(this.getDimensionDescription(stream)));
        return node;
    }

    getShortDescription(stream) {
        const dim = [stream.width, stream.height].filter(i => i).join('x');
        const targetCodec = Object.values(VIDEO_CODECS).find(c => c.v === stream.transcodeConfig.codec).l;
        const qp = this.getQp(stream);
        const aspect = `DAR: ${ stream.transcodeConfig.aspectRatio }`;
        return `Stream #0:${stream.index} ${stream.codec_name} ${dim}`
            + ` -> ${targetCodec}, ${qp}${aspect}`
    }

    getIndexDescription(item) {
        return `Stream #0:${ item.index }${ (item.id?.wrap('[', ']') || '') }:`;
    }

    getCodecDescription(item) {
        const profile = item.profile?.wrap('(', ')') || '';
        const codec = [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') || '';
        const pixFmt = item.pix_fmt || '';
        const color = [item.color_range, item.color_space, item.field_order].filter(i => i).join(', ')?.wrap('(', ')');
        return `Video: ${ item.codec_name } ${ profile } ${ codec } ${ pixFmt } ${color}`;
    }

    getDimensionDescription(item) {
        const dim = [item.width, item.height].filter(i => i).join('x');
        const aspect = [item.sample_aspect_ratio?.wrap('SAR '), item.display_aspect_ratio?.wrap('DAR ')].filter(i => i).join(' ')?.wrap('[', ']');
        const frameRate = `${ ( item.avg_frame_rate?.indexOf('/') > -1 && eval(item.avg_frame_rate) || (item.avg_frame_rate || 'N/A') ) } fps`;
        const tbr = `${ ( item.r_frame_rate?.indexOf('/') > -1 && eval(item.r_frame_rate) || (item.r_frame_rate || 'N/A') ) } tbr`;
        const tbn = `${ ( item.time_base?.indexOf('/') > -1 && parseInt(item.time_base.split('/').pop(), 10) / 1000 + 'k' || (item.time_base || 'N/A') ) } tbn`;
        const tbc = `${ ( item.codec_time_base?.indexOf('/') > -1 && item.codec_time_base.split('/').pop() || (item.codec_time_base || 'N/A') ) } tbc`;
        return `${ dim } ${ aspect } ${ frameRate }, ${ tbr }, ${ tbn }, ${ tbc }`;
    }

    getQp(item) {
        return 'undefined' !== typeof item.transcodeConfig.qp ? 
            'QP: ' + item.transcodeConfig.qp + this.getDefaultQp(item) + ', ' :
            '' 
    }

    getDefaultQp(item) {
        const qp = Object.values(VIDEO_CODECS).find(c => c.v === item.transcodeConfig.codec).qp;
        if (qp === item.transcodeConfig.qp) return '';
        return ` (Default: ${qp})`;
    }
}

Video.prototype.header = 'Video'

Video.template = /*html*/`
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
    <div class="long-description" data-desc="dim"></div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-video', Video);