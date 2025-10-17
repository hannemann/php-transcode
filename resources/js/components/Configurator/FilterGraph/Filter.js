import { Slim, Utils } from '@/components/lib';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css'
import CARD_CSS from '../CardCss';

class Filter extends Slim {

    constructor() {
        super();
        this.bindListener();
    }

    bindListener() {
        this.handleDelete = this.handleDelete.bind(this);
    }

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    handleDelete(e) {
        this.configurator.filterGraph.splice(parseInt(this.dataset.id), 1);
        this.configurator.saveSettings();
        Utils.forceUpdate(this.configurator);
    }

    get description() {
        if (this.filterData.filterType === 'crop') {
            if (this.filterData.replaceBlackBorders) {
                return `replace borders${this.filterData.mirror ? ' (mirrored)' : ''}`;
            }
        }
        return '';
    }
}

Filter.template = /*html*/ `
${ICON_STACK_CSS}
${CARD_CSS}
<style>
section {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.icon-stack, .item {
    cursor: pointer;
}
</style>
<section>
    <div class="item">
        <span>{{ this.filterData.filterType }}</span>
        <span>
            {{ this.description }}
        </span>
    </div>
    <div @click="{{ this.handleDelete }}" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
</section>
`;

customElements.define('transcode-configurator-filter', Filter);