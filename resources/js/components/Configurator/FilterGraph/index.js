import { DomHelper } from "../../../Helper/Dom";
import CARD_CSS from "../CardCss";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import sortable from "html5sortable/dist/html5sortable.es";
import "./Filter";

class FilterGraph extends HTMLElement {
    constructor() {
        super();
        DomHelper.initDom.call(this);
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            this.filters.addEventListener("sortupdate", this);
            this.filters.append(
                ...this.configurator.filterGraph.map((v, k) => {
                    const node = document.createElement(
                        "transcode-configurator-filter",
                    );
                    node.dataset.id = k;
                    node.configurator = this.configurator;
                    node.filterData = v;
                    return node;
                }),
            );
            sortable(this.filters);
        });
    }

    disconnectedCallback() {
        [...this.filters.childNodes].forEach((f) => f.remove());
        this.filters.removeEventListener("sortupdate", this);
        sortable(this.filters, "destroy");
    }

    async handleEvent(e) {
        this.configurator.filterGraph = e.detail.destination.items.map(
            (i) => i.filterData,
        );
        await this.configurator.saveSettings();
    }

    get filters() {
        return this.shadowRoot.querySelector("main > div");
    }
}

FilterGraph.template = /*html*/ `
${ICON_STACK_CSS}
${CARD_CSS}
<main>
    <h2>FilterGraph</h2>
    <div></div>
</main>
`;
customElements.define("transcode-configurator-filter-graph", FilterGraph);
