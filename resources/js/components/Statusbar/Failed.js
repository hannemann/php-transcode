import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";

class ProgressFailed extends ProgressItem {
    showException(item) {
        console.error(item);
        document.dispatchEvent(
            new CustomEvent("show-textcontent", {
                detail: { content: item.exception },
            })
        );
    }
}

ProgressFailed.template = /*html*/ `
${PROGRESS_ITEM_CSS}
<header>Failed</header>
<div *foreach="{{ this.items }}">
    <div @click="{{ this.delete(item) }}" style="cursor: pointer" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
    <div @click="{{ this.showException(item) }}" class="path" style="cursor: pointer">{{ item.type.ucfirst() }}: {{ item.path }}</div>
    <div>{{ item.percentage }}%</div>
</div>
`;

customElements.define("status-progress-failed", ProgressFailed);
