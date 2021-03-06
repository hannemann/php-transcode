import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";
import { Request } from "@/components/Request";

class ProgressPending extends ProgressItem {
    cancel(item) {
        console.info("Request cancel of queue %s", item.id);
        Request.post(`/queue/cancel/${item.id}`);
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

ProgressPending.template = /*html*/ `
${PROGRESS_ITEM_CSS}
<header>Pending</header>
<div *foreach="{{ this.items }}">
    <div @click="{{ this.cancel(item) }}" style="cursor: pointer" class="icon-stack">
        <span class="iconify" data-icon="mdi-trash-can-outline"></span>
        <span class="iconify hover" data-icon="mdi-trash-can-outline"></span>
    </div>
    <div class="path">{{ item.type.ucfirst() }}: {{ item.path }}</div>
    <div>{{ item.percentage }}%</div>
</div>
`;

customElements.define("status-progress-pending", ProgressPending);
