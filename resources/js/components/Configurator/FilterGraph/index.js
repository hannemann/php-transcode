import { DomHelper } from "../../../Helper/Dom";
import CARD_CSS from "../CardCss";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import sortable from "html5sortable/dist/html5sortable.es";
import "./Filter";

const SELECTOR_FILTER_NODE = "transcode-configurator-filter";

class FilterGraph extends HTMLElement {
    #linkTimeFilters = [];
    #currentLinkTimeGroupColor;

    constructor() {
        super();
        DomHelper.initDom.call(this);
        this.handleAddToLinkGroup = this.handleAddToLinkGroup.bind(this);
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            this.btnLinkTime.addEventListener("click", this);
            this.filters.addEventListener("sortupdate", this);
            this.filters.append(
                ...this.configurator.filterGraph.map((v, k) => {
                    const node = document.createElement(
                        "transcode-configurator-filter",
                    );
                    node.dataset.id = k;
                    node.configurator = this.configurator;
                    node.filterData = v;
                    node.groupColor =
                        this.configurator.filterGraph.getGroupColor(
                            v.between?.linkId,
                        );
                    return node;
                }),
            );
            sortable(this.filters);
            requestAnimationFrame(() => {
                Iconify.scan(this.shadowRoot);
            });
        });
    }

    disconnectedCallback() {
        [...this.filters.childNodes].forEach((f) => f.remove());
        this.btnLinkTime.removeEventListener("click", this);
        this.filters.removeEventListener("sortupdate", this);
        sortable(this.filters, "destroy");
    }

    async handleEvent(e) {
        if (e.currentTarget === this.btnLinkTime) {
            this.toggleLinkMode();
        }

        if (e.type === "sortupdate") {
            this.configurator.filterGraph = e.detail.destination.items.map(
                (i) => i.filterData,
            );
            await this.configurator.saveSettings();
        }
    }

    toggleLinkMode() {
        this.toggleAttribute("data-link-mode");
        const isActive = this.hasAttribute("data-link-mode");
        this.btnLinkTime.classList.toggle("active", isActive);
        this.filterNodes.forEach((f) =>
            f.toggleAttribute("data-immutable", isActive),
        );
        if (isActive) {
            this.addEventListener("click", this.handleAddToLinkGroup);
        } else {
            this.removeEventListener("click", this.handleAddToLinkGroup);
            if (this.#linkTimeFilters.length > 1) {
                this.configurator.filterGraph.linkEnable(this.#linkTimeFilters);
            }
            this.#linkTimeFilters = [];
            this.#currentLinkTimeGroupColor = null;
            this.configurator.saveSettings();
        }
    }

    handleAddToLinkGroup(e) {
        const filterGraph = this.configurator.filterGraph;
        const filterElement = e
            .composedPath()
            .find((el) => el.localName === SELECTOR_FILTER_NODE);

        if (!filterElement) return;

        const idx = Number(filterElement.dataset.id);
        const filter = filterGraph[idx];
        const isLinkable = filter.between;

        if (!isLinkable) return;

        const linkId = filter.between.linkId;
        if (linkId) {
            filterGraph.unlinkEnable(filter);
            filterElement.style.setProperty("--group-color", "");
            const group = filterGraph.getEnableGroupMembers(linkId);
            if (group.length < 2 && group[0]) {
                filterGraph.unlinkEnable(group[0]);
                this.filterNodes
                    .find((n) => Number(n.dataset.id) === group[0].filterIndex)
                    ?.style.setProperty("--group-color", "");
            }
        } else {
            const addedIndex = this.#linkTimeFilters.indexOf(filter);
            if (addedIndex < 0) {
                const color = (this.#currentLinkTimeGroupColor ??=
                    filterGraph.getGroupColor(crypto.randomUUID()));
                this.#linkTimeFilters.push(filter);
                filterElement.style.setProperty("--group-color", color);
            } else {
                this.#linkTimeFilters.splice(addedIndex, 1);
                filterElement.style.setProperty("--group-color", "");
            }
        }
    }

    get btnLinkTime() {
        return this.shadowRoot.querySelector('[data-ref="link-time"]');
    }

    get filters() {
        return this.shadowRoot.querySelector("main > div");
    }

    get filterNodes() {
        return [...this.filters.querySelectorAll(SELECTOR_FILTER_NODE)];
    }
}

const CSS = css`
    :host([data-link-mode]) {
        transcode-configurator-filter {
        }
    }

    h2 {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        align-items: center;

        span {
            flex-grow: 1;
        }
    }
`;

FilterGraph.template = html`
    <style>
        ${ICON_STACK_CSS}
        ${CARD_CSS}
        ${CSS}
    </style>
    <main>
        <h2>
            <span>FilterGraph</span>
            <div class="icon-stack" data-ref="link-time">
                <span class="iconify active" data-icon="mdi-link"></span>
                <span class="iconify inactive" data-icon="mdi-link"></span>
                <span class="iconify hover" data-icon="mdi-link"></span>
            </div>
        </h2>
        <div></div>
    </main>
`;
customElements.define("transcode-configurator-filter-graph", FilterGraph);
