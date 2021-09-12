import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'


class ProgressCurrent extends ProgressItem {}

ProgressCurrent.template = /*html*/`
${PROGRESS_ITEM_CSS}
<header>Current</header>
<div>
    <div class="path">{{ this.item.type.ucfirst() }}: {{ this.item.path }}</div>
    <div>{{ this.item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-current', ProgressCurrent);