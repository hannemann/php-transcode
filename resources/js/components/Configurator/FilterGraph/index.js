import { Slim, Utils, Iconify } from "@/components/lib";
import CARD_CSS from "../CardCss";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import sortable from "html5sortable/dist/html5sortable.es";
import "./Filter";

class FilterGraph extends Slim {

    connectedCallback() {
        requestAnimationFrame(() => {
            this.filters.addEventListener('sortupdate', this);
            this.configurator.filterGraph.forEach((v, k) => {
                const filter = document.createElement('transcode-configurator-filter');
                filter.dataset.id = k;
                filter.filterData = v;
                filter.configurator = this.configurator;
                this.filters.appendChild(filter);
            });
            sortable(this.filters);
        });
    }

    disconnectedCallback() {
        [...this.filters.childNodes].forEach(f => f.remove());
        this.filters.removeEventListener('sortupdate', this);
        sortable(this.filters, 'destroy');
    }

    async handleEvent(e) {
        this.configurator.filterGraph = e.detail.destination.items.map(i => i.filterData);
        await this.configurator.saveSettings();
    }

    get filters() {
        return this.shadowRoot.querySelector('main > div');
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