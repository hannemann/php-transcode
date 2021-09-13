import {PROGRESS_ITEM_CSS, ProgressItem} from './Items'


class ProgressCurrent extends ProgressItem {
    get width() {
        return `width: ${this.item.percentage}%;`
    }
}

ProgressCurrent.template = /*html*/`
${PROGRESS_ITEM_CSS}
<style>
    .path {
        position: relative;
        height: 1rem;
        width: 100%;
    }
    .path span {
        position: absolute;
        inset: 0;
    }
    .path span:last-of-type {
        background: var(--clr-enlightened);
        color: var(--clr-text-200-inverse);
        overflow: hidden;
        border-radius: .2rem;
    }
</style>
<header>Current</header>
<div>
    <div class="path">
        <span>{{ this.item.type.ucfirst() }}: {{ this.item.path }}</span>
        <span style="{{ this.width }}">{{ this.item.type.ucfirst() }}: {{ this.item.path }}</span>
    </div>
    <div>{{ this.item.percentage }}%</div>
</div>
`

customElements.define('ffmpeg-progress-current', ProgressCurrent);