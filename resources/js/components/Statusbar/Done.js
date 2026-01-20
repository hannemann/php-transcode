import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";

class ProgressDone extends ProgressItem {
    connectedCallback() {
        super.connectedCallback();

        this.initItemTemplate();
        const items = [];
        this.items.forEach((item, key) => {
            const node = this.getItemTemplateNode(key);
            node.querySelector(".path span:first-of-type").innerText =
                this.getItemPath(item);
            node.querySelector(".path span:last-of-type").innerText =
                this.getDuration(item);
            node.querySelector(".percentage").innerText = `${item.percentage}%`;
            items.push(node);
        });
        this.shadowRoot.append(...items);

        this.addListeners();
    }

    handleEvent(e) {
        const idx = Number(e.currentTarget.closest(".item").dataset.itemIndex);
        const item = this.items[idx];
        super.handleEvent(e, item);
    }
}

ProgressDone.template = html`
    ${PROGRESS_ITEM_CSS}
    <header>Done</header>
    <template data-type="item">
        <div class="item">
            <div style="cursor: pointer" class="icon-stack" data-click="delete">
                <span class="iconify" data-icon="mdi-close"></span>
                <span class="iconify hover" data-icon="mdi-close"></span>
            </div>
            <div class="path show" data-click="show">
                <span></span><span></span>
            </div>
            <div class="percentage"></div>
        </div>
    </template>
`;

customElements.define("status-progress-done", ProgressDone);
