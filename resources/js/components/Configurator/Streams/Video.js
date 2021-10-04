import {Stream, MAINSTART, MAINEND} from "./Stream";
import CARD_CSS from "../CardCss";

export const VALID_ASPECT_RATIOS = ["4:3", "16:9"];

class Video extends Stream {}

Video.prototype.header = 'Video'

Video.template = /*html*/`
${CARD_CSS}
<style>
</style>
${MAINSTART}
<section class="toggle">
    <div class="{{ (item.shortView && 'visible') }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-right"></span>
        Stream #0:{{ item.index }}
        {{ item.codec_name }}
        {{ [item.width, item.height].filter(i => i).join('x') }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}" @click="{{ this.toggleView(item) }}" data-toggle="true">
        <span class="iconify" data-icon="mdi-chevron-down"></span>
        Stream #0:{{ item.index }}{{ (item.id?.wrap('[', ']') || '') }}:
    </div>
    <div class="{{ (!item.shortView && 'visible') }}">
        Video: {{ item.codec_name }}
        {{ item.profile?.wrap('(', ')') || '' }}
        {{ [item.codec_tag_string, item.codec_tag].filter(i => i).join(' / ')?.wrap('(', ')') || '' }}
        {{ (item.pix_fmt || '') }}{{ [item.color_range, item.color_space, item.field_order].filter(i => i).join(', ')?.wrap('(', ')') }}
    </div>
    <div class="{{ (!item.shortView && 'visible') }}">
        {{ [item.width, item.height].filter(i => i).join('x') }}
        {{ [item.sample_aspect_ratio?.wrap('SAR '), item.display_aspect_ratio?.wrap('DAR ')].filter(i => i).join(' ')?.wrap('[', ']') }}
        {{ ( item.avg_frame_rate?.indexOf('/') > -1 && eval(item.avg_frame_rate) || (item.avg_frame_rate || 'N/A') ) }} fps,
        {{ ( item.r_frame_rate?.indexOf('/') > -1 && eval(item.r_frame_rate) || (item.r_frame_rate || 'N/A') ) }} tbr,
        {{ ( item.time_base?.indexOf('/') > -1 && parseInt(item.time_base.split('/').pop(), 10) / 1000 + 'k' || (item.time_base || 'N/A') ) }} tbn,
        {{ ( item.codec_time_base?.indexOf('/') > -1 && item.codec_time_base.split('/').pop() || (item.codec_time_base || 'N/A') ) }} tbc
    </div>
</section>
${MAINEND}
`

customElements.define('transcode-configurator-stream-video', Video);