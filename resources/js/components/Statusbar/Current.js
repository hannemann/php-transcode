import { PROGRESS_ITEM_CSS, ProgressItem } from "./Items";
import { Request } from "@/components/Request";

class ProgressCurrent extends ProgressItem {
    connectedCallback() {
        super.connectedCallback();
        this.addListeners();

        this.shadowRoot
            .querySelectorAll(".path > span span")
            .forEach(
                (s) =>
                    (s.innerText = `${this.item.type.ucfirst()}: ${this.item.path}`),
            );

        this.shadowRoot.querySelector(".path > span:last-of-type").style.width =
            `${this.item.percentage}%`;

        this.shadowRoot.querySelector(".percentage").innerText =
            `${this.item.percentage}%`;
    }

    handleEvent(e) {
        super.handleEvent(e, this.item);
        switch (e.currentTarget.dataset.click) {
            case "kill":
                this.statusbar.requestKill();
                break;
        }
    }
}

ProgressCurrent.template = html`
    ${PROGRESS_ITEM_CSS}
    <style>
        .item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
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
            text-indent: 0.25rem;
            position: absolute;
            inset: 0;
            background: var(--clr-enlightened);
            box-shadow: 0 0 5px 5px inset var(--clr-enlightened-glow);
            color: var(--clr-text-200-inverse);
            overflow-x: hidden;
            border-radius: 0.2rem;
        }
    </style>
    <header>Current</header>
    <div class="item">
        <div class="icon-stack" data-click="kill">
            <span
                class="iconify"
                data-icon="mdi-skull-crossbones-outline"
            ></span>
            <span
                class="iconify hover"
                data-icon="mdi-skull-crossbones-outline"
            ></span>
        </div>
        <div class="path show" data-click="show">
            <span><span></span></span>
            <span><span></span></span>
        </div>
        <div class="percentage"></div>
    </div>
`;

customElements.define("status-progress-current", ProgressCurrent);
