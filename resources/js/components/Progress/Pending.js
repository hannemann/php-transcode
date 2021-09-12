import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'


class ProgressPending extends ProgressItem {}

ProgressPending.template = /*html*/`
${PROGRESS_ITEM_CSS}
<header>Pending</header>
<div *foreach="{{ this.items }}">
    <div class="path">{{ item.type.ucfirst() }}: {{ item.path }}</div>
    <div>{{ item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-pending', ProgressPending);