import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'


class ProgressFailed extends ProgressItem {
    showException(item) {
        console.log(item)
    }
}

ProgressFailed.template = /*html*/`
${PROGRESS_ITEM_CSS}
<header>Failed</header>
<div *foreach="{{ this.items }}">
    <div @click="{{ this.delete(item) }}" style="cursor: pointer"><span class="iconify" data-icon="mdi-close"></span></div>
    <div @click="{{ this.showException(item) }}" class="path" style="cursor: pointer">{{ item.path }}</div>
    <div>{{ item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-failed', ProgressFailed);