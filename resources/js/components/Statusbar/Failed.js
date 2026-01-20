import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";

class ProgressFailed extends ProgressItem {
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

        switch (e.currentTarget.dataset.click) {
            case "exception":
                this.showException(item);
                break;
        }
    }

    showException(item) {
        console.error(item);
        document.dispatchEvent(
            new CustomEvent("show-textcontent", {
                detail: { content: item.exception },
            }),
        );
    }
}

ProgressFailed.template = html`
    ${PROGRESS_ITEM_CSS}
    <header>Failed</header>
    <template data-type="item">
        <div class="item">
            <div style="cursor: pointer" class="icon-stack" data-click="delete">
                <span class="iconify" data-icon="mdi-close"></span>
                <span class="iconify hover" data-icon="mdi-close"></span>
            </div>
            <div data-click="exception" class="path show">
                <span></span><span></span>
            </div>
            <div class="percentage"></div>
        </div>
    </template>
`;

customElements.define("status-progress-failed", ProgressFailed);
