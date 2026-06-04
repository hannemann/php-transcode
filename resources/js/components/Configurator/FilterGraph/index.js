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
            this.btnLinkTimeRelative.addEventListener("click", this);
            this.filters.addEventListener("sortupdate", this);
            this.filters.append(
                ...this.configurator.filterGraph.map((v, k) => {
                    const node = document.createElement(
                        "transcode-configurator-filter",
                    );
                    node.dataset.id = k;
                    node.configurator = this.configurator;
                    node.filterData = v;
                    if (v.between?.groupId) {
                        node.groupColor =
                            this.configurator.filterGraph.getGroupColor(
                                v.between.groupId,
                            );
                        node.grouped = true;
                    } else if (v.between?.linkId) {
                        node.groupColor =
                            this.configurator.filterGraph.getGroupColor(
                                v.between.linkId,
                            );
                    }
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
        this.btnLinkTimeRelative.removeEventListener("click", this);
        this.filters.removeEventListener("sortupdate", this);
        sortable(this.filters, "destroy");
    }

    async handleEvent(e) {
        if (e.currentTarget === this.btnLinkTime) {
            this.toggleLinkMode("absolute");
        }

        if (e.currentTarget === this.btnLinkTimeRelative) {
            this.toggleLinkMode("relative");
        }

        if (e.type === "sortupdate") {
            this.configurator.filterGraph = e.detail.destination.items.map(
                (i) => i.filterData,
            );
            await this.configurator.saveSettings();
        }
    }

    toggleLinkMode(mode) {
        const currentMode = this.getAttribute("data-link-mode");
        const isActive = currentMode === mode;
        if (isActive) {
            this.removeAttribute("data-link-mode");
        } else {
            this.setAttribute("data-link-mode", mode);
        }
        const newIsActive = !isActive;
        this.btnLinkTime.classList.toggle("active", newIsActive && mode === "absolute");
        this.btnLinkTimeRelative.classList.toggle("active", newIsActive && mode === "relative");
        this.filterNodes.forEach((f) =>
            f.toggleAttribute("data-immutable", newIsActive),
        );
        if (newIsActive) {
            this.addEventListener("click", this.handleAddToLinkGroup);
        } else {
            this.removeEventListener("click", this.handleAddToLinkGroup);
            if (this.#linkTimeFilters.length > 1) {
                if (currentMode === "relative") {
                    this.configurator.filterGraph.linkEnableRelative(
                        this.#linkTimeFilters,
                    );
                } else {
                    this.configurator.filterGraph.linkEnable(
                        this.#linkTimeFilters,
                    );
                }
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

        const mode = this.getAttribute("data-link-mode");
        const isRelative = mode === "relative";

        if (isRelative) {
            const groupId = filter.between.groupId;
            if (groupId) {
                filterGraph.unlinkGroup(filter);
                filterElement.style.setProperty("--group-color", "");
                filterElement.removeAttribute("data-grouped");
                this.#linkTimeFilters = this.#linkTimeFilters.filter(
                    (f) => f !== filter,
                );
                const remaining = filterGraph.filter(
                    (f) =>
                        f !== filter &&
                        f.between?.groupId === groupId,
                );
                if (remaining.length < 2 && remaining[0]) {
                    filterGraph.unlinkGroup(remaining[0]);
                    this.filterNodes
                        .find(
                            (n) =>
                                Number(n.dataset.id) ===
                                remaining[0].filterIndex,
                        )
                        ?.style.setProperty("--group-color", "");
                    this.filterNodes
                        .find(
                            (n) =>
                                Number(n.dataset.id) ===
                                remaining[0].filterIndex,
                        )
                        ?.removeAttribute("data-grouped");
                }
            } else {
                const addedIndex = this.#linkTimeFilters.indexOf(filter);
                if (addedIndex < 0) {
                    const color = (this.#currentLinkTimeGroupColor ??=
                        filterGraph.getGroupColor(crypto.randomUUID()));
                    this.#linkTimeFilters.push(filter);
                    filterElement.style.setProperty("--group-color", color);
                    filterElement.setAttribute("data-grouped", "");
                } else {
                    this.#linkTimeFilters.splice(addedIndex, 1);
                    filterElement.style.setProperty("--group-color", "");
                    filterElement.removeAttribute("data-grouped");
                }
            }
        } else {
            const linkId = filter.between.linkId;
            if (linkId) {
                filterGraph.unlinkEnable(filter);
                filterElement.style.setProperty("--group-color", "");
                this.#linkTimeFilters = this.#linkTimeFilters.filter(
                    (f) => f !== filter,
                );
                const group = filterGraph.getEnableGroupMembers(linkId);
                if (group.length < 2 && group[0]) {
                    filterGraph.unlinkEnable(group[0]);
                    this.filterNodes
                        .find(
                            (n) =>
                                Number(n.dataset.id) ===
                                group[0].filterIndex,
                        )
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
    }

    get btnLinkTime() {
        return this.shadowRoot.querySelector('[data-ref="link-time"]');
    }

    get btnLinkTimeRelative() {
        return this.shadowRoot.querySelector(
            '[data-ref="link-time-relative"]',
        );
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
            <div style="display: flex; gap: 0.25rem">
                <div class="icon-stack" data-ref="link-time">
                    <span class="iconify active" data-icon="mdi-link"></span>
                    <span class="iconify inactive" data-icon="mdi-link"></span>
                    <span class="iconify hover" data-icon="mdi-link"></span>
                </div>
                <div class="icon-stack" data-ref="link-time-relative">
                    <span class="iconify active" data-icon="mdi-link-variant"></span>
                    <span class="iconify inactive" data-icon="mdi-link-variant"></span>
                    <span class="iconify hover" data-icon="mdi-link-variant"></span>
                </div>
            </div>
        </h2>
        <div></div>
    </main>
`;
customElements.define("transcode-configurator-filter-graph", FilterGraph);
