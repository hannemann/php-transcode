import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";

class ProgressDone extends ProgressItem {}

ProgressDone.template = /*html*/ `
${PROGRESS_ITEM_CSS}
<header>Done</header>
<div *foreach="{{ this.items }}">
    <div @click="{{ this.delete(item) }}" style="cursor: pointer" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
    <div @click="{{ this.showCommand(item) }}" class="path show"><span>{{ item.type.ucfirst() }}: {{ item.path }}</span><span>{{ this.getDuration(item) }}</span></div>
    <div>{{ item.percentage }}%</div>
</div>
`;

customElements.define("status-progress-done", ProgressDone);
