import { Slim, Utils } from '@/components/lib';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import CARD_CSS from '../CardCss';
import { requestCrop } from "../Tools/crop.js";
import { requestDelogo } from "../Tools/delogo.js";
import { Time } from '../../../Helper/Time.js';

class Filter extends Slim {

    constructor() {
        super();
        this.handleDelete = this.handleDelete.bind(this);
        this.handleModify = this.handleModify.bind(this);
        this.handleClipsLoaded = this.handleClipsLoaded.bind(this);
        this.description = '';
    }

    onAdded() {
        document.addEventListener("clips-updated", this.handleClipsLoaded);
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    onRemoved() {
        document.removeEventListener("clips-updated", this.handleClipsLoaded);
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

    handleClipsLoaded() {
        this.description = this.updateDescription();
        Utils.forceUpdate(this);
    }

    async handleDelete(e) {
        this.configurator.filterGraph.splice(parseInt(this.dataset.id), 1);
        await this.configurator.saveSettings();
    }

    updateDescription() {
        if (this.filterData.filterType === 'crop') {
            if (this.filterData.replaceBlackBorders) {
                return `replace borders${this.filterData.mirror ? ' (mirrored)' : ''}`;
            }
        }
        if (this.filterData.filterType === 'scale') {
            return `${this.filterData.width} x ${this.filterData.height}`
        }
        if (this.filterData.filterType === 'delogo') {
            let from = this.filterData.between?.from || 'n/a';
            let to = this.filterData.between?.to || 'n/a';
            if (!isNaN(from)) {
                from = Time.calculateCutTimestamp(this.configurator.clips.clips, this.filterData.between.from * 1000)
            }
            if (!isNaN(to)) {
                to = Time.calculateCutTimestamp(this.configurator.clips.clips, this.filterData.between.to * 1000);
            }

            return `${from} - ${to}, Top: ${this.filterData.y}px, Left: ${this.filterData.x}px, ${this.filterData.w}px x ${this.filterData.h}px`
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