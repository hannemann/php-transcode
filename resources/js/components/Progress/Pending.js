import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'


class ProgressPending extends ProgressItem {}

ProgressPending.template = /*html*/`
${PROGRESS_ITEM_CSS}
Pending
<div *foreach="{{ this.items }}">
    <div>{{ item.path }}</div>
    <div>{{ item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-pending', ProgressPending);