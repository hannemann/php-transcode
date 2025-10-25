import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";
import { Request } from "@/components/Request";

class ProgressCurrent extends ProgressItem {
    constructor() {
        super();
        this.requestKill = this.requestKill.bind(this);
    }
    get width() {
        return `width: ${this.item.percentage}%;`;
    }

    get runtime() {
        return this.offsetParent.parentNode.host.runtime;
    }

    get remainTime() {
        return this.offsetParent.parentNode.host.remainTime;
    }

    async requestKill() {
        console.info("Kill of all ffmpeg processes requested");
        Request.post("/kill");
    }
}

ProgressCurrent.template = /*html*/ `
${PROGRESS_ITEM_CSS}
<style>
    .path {
        position: relative;
        width: 100%;
        display: block;

        & > span {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
        }
    }
    .path > span:last-of-type {
        text-indent: .25rem;
        position: absolute;
        inset: 0;
        background: var(--clr-enlightened);
        box-shadow: 0 0 5px 5px inset var(--clr-enlightened-glow);
        color: var(--clr-text-200-inverse);
        overflow-x: hidden;
        border-radius: .2rem;
    }
</style>
<header>Current</header>
<div>
    <div class="icon-stack" @click="{{ this.requestKill }}">
        <span class="iconify" data-icon="mdi-skull-crossbones-outline"></span>
        <span class="iconify hover" data-icon="mdi-skull-crossbones-outline"></span>
    </div>
    <div @click="{{ this.showCommand(this.item) }}" class="path show">
        <span><span>{{ this.item.type.ucfirst() }}: {{ this.item.path }}</span></span>
        <span style="{{ this.width }}"><span>{{ this.item.type.ucfirst() }}: {{ this.item.path }}</span></span>
    </div>
    <div>{{ this.item.percentage }}%</div>
</div>
`;

customElements.define("status-progress-current", ProgressCurrent);
