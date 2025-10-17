import { Slim, Utils, Iconify } from "@/components/lib";
import CARD_CSS from "../CardCss";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import "./Filter";

class FilterGraph extends Slim {}

FilterGraph.template = /*html*/ `
${ICON_STACK_CSS}
${CARD_CSS}
<main>
    <h2>FilterGraph</h2>
    <div class="filters">
        <transcode-configurator-filter
            data-id="{{ this.filters.findIndex(f => f === item) }}"
             .configurator="{{ this.configurator }}"
            *foreach="{{ this.filters }}"
            .filter-data="{{ item }}
        "></transcode-configurator-filter>
    </div>
</main>
`;
customElements.define("transcode-configurator-filter-graph", FilterGraph);