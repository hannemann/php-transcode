import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'

class ProgressDone extends ProgressItem {}

ProgressDone.template = /*html*/`
${PROGRESS_ITEM_CSS}
Done
<div *foreach="{{ this.items }}">
    <div @click="{{ this.delete(item) }}" style="cursor: pointer"><span class="iconify" data-icon="mdi-close"></span></div>
    <div>{{ item.path }}</div>
    <div>{{ item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-done', ProgressDone);