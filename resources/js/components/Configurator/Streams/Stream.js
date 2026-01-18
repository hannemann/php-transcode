import { DomHelper } from '../../../Helper/Dom';
import Iconify from '@iconify/iconify'
import './Buttons'

class Stream extends HTMLElement {

    importNode;
    itemContainer;
    itemTemplate;

    connectedCallback() {
        this.streams.forEach(item => {
            item.shortView = true
        });
        this.short = true
        this.handleToggleStream = this.handleToggleStream.bind(this);
        document.addEventListener('stream-toggle', this.handleToggleStream);

        this.importNode = DomHelper.fromTemplate.call(this);
        const itemTemplate = this.importNode.querySelector('template.item');
        this.itemContainer = this.importNode.querySelector('.streams');
        this.itemTemplate = itemTemplate.content;
        itemTemplate.remove();
        this.importNode.querySelector('h2').innerText = this.__proto__.header;
        this.streams.forEach(stream => {
            const node = document.importNode(this.itemTemplate, true).querySelector('.stream');
            node.dataset.active = (!!stream.active).toString();
            node.dataset.index = stream.index.toString();
            node.querySelector('transcode-configurator-stream-buttons').item = stream;
            this.itemContainer.append(this.initItem(stream, node));
            node.querySelectorAll('[data-toggle]').forEach(t => t.addEventListener('click', this.toggleView))
        });

        DomHelper.appendShadow.call(this, this.importNode);
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    disconnectedCallback() {
        document.removeEventListener('stream-toggle', this.handleToggleStream);
    }

    toggleView(e) {
        e.currentTarget.closest('.toggle')
            .querySelectorAll(':scope > div')
            .forEach(d => d.classList.toggle('visible'));
    }

    handleToggleStream(e) {
        e.detail.origin.closest('.stream')
            .dataset.active = e.detail.item.active.toString();
    }
}

const MAINSTART = /*html*/ `
<main>
    <h2></h2>
    <div class="streams">
        <template class="item">
            <div class="stream">
`

const MAINEND = /*html*/ `
                <transcode-configurator-stream-buttons .item="{{ item }}"></transcode-configurator-stream-buttons>
            </div>
        </template
    </div>
</main>
`

export {Stream, MAINSTART, MAINEND}