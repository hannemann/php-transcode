import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'


class ProgressCurrent extends ProgressItem {}

ProgressCurrent.template = /*html*/`
${PROGRESS_ITEM_CSS}
Current
<div>
    <div>{{ this.item.path }}</div>
    <div>{{ this.item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-current', ProgressCurrent);