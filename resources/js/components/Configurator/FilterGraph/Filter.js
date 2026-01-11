import { Slim, Utils } from '@/components/lib';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import CARD_CSS from '../CardCss';
import { requestScale } from "../Tools/scale.js";
import { requestCrop } from "../Tools/crop.js";
import { requestDelogo } from "../Tools/delogo.js";
import { requestRemovelogo } from "../Tools/removelogo.js";

class Filter extends Slim {

    constructor() {
        super();
        this.handleDelete = this.handleDelete.bind(this);
        this.handleModify = this.handleModify.bind(this);
    }

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    handleModify(e) {
        switch (this.filterData.filterType) {
            case 'delogo':
                requestDelogo.call(this.configurator, 'cpu', parseInt(this.dataset.id), this.filterData);
                break;
            case 'crop':
                requestCrop.call(this.configurator, 'cpu', parseInt(this.dataset.id), this.filterData);
                break;

        }
    }

    async handleDelete(e) {
        this.configurator.filterGraph.splice(parseInt(this.dataset.id), 1);
        await this.configurator.saveSettings();
    }

    get description() {
        if (this.filterData.filterType === 'crop') {
            if (this.filterData.replaceBlackBorders) {
                return `replace borders${this.filterData.mirror ? ' (mirrored)' : ''}`;
            }
        }
        if (this.filterData.filterType === 'scale') {
            return `${this.filterData.width} x ${this.filterData.height}`
        }
        if (this.filterData.filterType === 'delogo') {
            return `Top: ${this.filterData.y}px, Left: ${this.filterData.x}px, ${this.filterData.w}px x ${this.filterData.h}px, From: ${this.filterData.between?.from || 'n/a'}, To: ${this.filterData.between?.to || 'n/a'}`
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
    gap: .5rem;
}
.item {
    display: flex;
    gap: .5rem;
    align-items: center;
    flex-grow: 1;

    &:has(img) {
        justify-content: space-between;
    }

    img {
        max-height: 2rem;
    }
}
.icon-stack, .filterType {
    cursor: pointer;
}
</style>
<section>
    <div class="item" #ref="itemNode">
        <span class="filterType" value="{{ this.filterData.filterType }}" @click="{{ this.handleModify }}">{{ this.dataset.id }}. {{ this.filterData.filterType }}</span>
        <span>
            {{ this.description }}
        </span>
        <img data-type="logomask" *if="{{ this.filterData.filterType === 'removeLogo' }}" .src="{{ '/removelogo/' + this.configurator.item.path + '?' + performance.now() }}">
    </div>
    <div @click="{{ this.handleDelete }}" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
</section>
`;

customElements.define('transcode-configurator-filter', Filter);