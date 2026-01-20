import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";
import { Request } from "@/components/Request";

class ProgressPending extends ProgressItem {
    connectedCallback() {
        super.connectedCallback();

        this.initItemTemplate();
        const items = [];
        this.items.forEach((item, key) => {
            const node = this.getItemTemplateNode(key);
            node.querySelector(".path").innerText = this.getItemPath(item);
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
            case "cancel":
                this.cancel(item);
                break;
        }
    }

    async cancel(item) {
        const m = document.createElement("modal-confirm");
        m.header = "Cancel";
        m.content = `Cancel ${item.type.ucfirst()} ${item.path}?`;
        document.body.appendChild(m);
        try {
            await m.confirm();
            console.info("Request cancel of queue %s", item.id);
            Request.post(`/queue/cancel/${item.id}`);
        } catch (error) {}
    }
}

ProgressPending.template = html`
    ${PROGRESS_ITEM_CSS}
    <header>Pending</header>
    <template data-type="item">
        <div class="item">
            <div data-click="cancel" style="cursor: pointer" class="icon-stack">
                <span class="iconify" data-icon="mdi-trash-can-outline"></span>
                <span
                    class="iconify hover"
                    data-icon="mdi-trash-can-outline"
                ></span>
            </div>
            <div class="path"></div>
            <div class="percentage"></div>
        </div>
    </template>
`;

customElements.define("status-progress-pending", ProgressPending);
