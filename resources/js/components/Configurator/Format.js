import { DomHelper } from "../../Helper/Dom";
import { VTime } from "../../Helper/Time";
import FileHelper from "../../Helper/File";
import CARD_CSS from "./CardCss";

class Format extends HTMLElement {
    connectedCallback() {
        DomHelper.initDom.call(this);
        this.filename = this.format.filename;
        this.formatName = `Container: ${this.format.format_long_name} / ${this.format.format_name}`;
        this.duration = this.format.duration
            ? new VTime(this.format.duration * 1000).coord
            : "N/A";
        this.size = FileHelper.fileSizeH(this.format.size);
        this.bitRate = `${Math.round(this.format.bit_rate / 1000)} kb/s`;
    }

    set filename(value) {
        this.shadowRoot.querySelector(".filename").innerText = String(value);
    }

    set formatName(value) {
        this.shadowRoot.querySelector(".format-name").innerText = String(value);
    }

    set duration(value) {
        this.shadowRoot.querySelector(".duration").innerText = String(value);
    }

    get duration() {
        return this.shadowRoot.querySelector(".duration").innerText;
    }

    set size(value) {
        this.shadowRoot.querySelector(".size").innerText = String(value);
    }

    get size() {
        return this.shadowRoot.querySelector(".size").innerText;
    }

    set bitRate(value) {
        this.shadowRoot.querySelector(".bitrate").innerText = String(value);
    }

    get bitRate() {
        return this.shadowRoot.querySelector(".bitrate").innerText;
    }
}

Format.template = /*html*/ `
${CARD_CSS}
<style>
    .select-all {
        user-select: all;
    }
    .filename {
        font-size: .75em;
    }
</style>
<main>
    <h2>Format</h2>
    <section>
        <div class="filename select-all"></div>
        <div class="format-name"></div>
        <div>
            Duration: <span class="select-all duration"></span>,
            Size: <span class="size"></span>,
            Bitrate: <span class="bitrate"></span>
        </div>
    </section>
</main>
`;

customElements.define("transcode-configurator-format", Format);
