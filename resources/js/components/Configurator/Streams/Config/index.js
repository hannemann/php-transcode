import { DomHelper } from "../../../../Helper/Dom";

class StreamConfig extends HTMLElement {

    #manual = false;
    codecContainer;
    codecTemplate;
    channelsContainer;
    channelTemplate;
    aspectContainer;
    aspectTemplate;

    constructor() {
        super()
        this.videoCodecs = Object.values(VIDEO_CODECS).sort((a,b) => a.v > b.v)
        this.audioCodecs = Object.values(AUDIO_CODECS).sort((a,b) => a.v > b.v)
        this.subtitleCodecs = Object.values(SUBTITLE_CODECS).sort(
            (a, b) => a.v > b.v
        );
        this.channelOptions = [2,6]
        this.aspectRatioOptions = ["Keep", "16:9", "4:3"];
        this.cleanup = this.cleanup.bind(this)
        this.handleQpRange = this.handleQpRange.bind(this)
        this.handleCodecChange = this.handleCodecChange.bind(this)
        this.handleDocumentClick = this.handleDocumentClick.bind(this)
        this.handleChannelsChange = this.handleChannelsChange.bind(this)
        this.handleAspectRatioChange = this.handleAspectRatioChange.bind(this)
    }

    connectedCallback() {

        const importNode = DomHelper.fromTemplate.call(this);
        this.qpDisplay = importNode.querySelector('#qpslider span span');
        this.qpSlider = importNode.querySelector('#qpslider input');
        this.qpSlider.addEventListener('input', this.handleQpRange);
        
        const codecTemplate = importNode.querySelector('template[data-type="codec"]');
        this.codecContainer = codecTemplate.parentNode;
        this.codecTemplate = codecTemplate.content;
        codecTemplate.remove();
        
        const channelTemplate = importNode.querySelector('template[data-type="channel"]');
        this.channelsContainer = channelTemplate.parentNode;
        this.channelTemplate = channelTemplate.content;
        channelTemplate.remove();
        
        const aspectTemplate = importNode.querySelector('template[data-type="aspect"]');
        this.aspectContainer = aspectTemplate.parentNode;
        this.aspectTemplate = aspectTemplate.content;
        aspectTemplate.remove();

        DomHelper.appendShadow.call(this, importNode);
    }

    toggle(item, offset) {
        if (this.classList.contains('active')) {
            this.hide()
        } else {
            this.item = item
            this.classList.add(item.codec_type)
            this.style.top = `calc(${offset.top}px - .4rem)`
            this.style.right = `calc(${offset.right}px + 1rem)`
            this.initSettings()
            requestAnimationFrame(() => this.show())
        }
    }
    show() {
        requestAnimationFrame(() => {
            this.classList.add('active')
            this.addEventListener('transitionend', () => {
                document.addEventListener('click', this.handleDocumentClick)
                document.addEventListener('configurator-hidden', this.cleanup, {once: true})
            }, {once: true})
            requestAnimationFrame(() => this.classList.add('fade-in'))
        })
    }

    hide() {
        this.item.transcodeConfig = {codec: this.codec, manual: this.#manual};
        if (this.item.codec_type === 'video') {
            this.item.transcodeConfig.qp = this.qp
            this.item.transcodeConfig.aspectRatio = this.aspectRatio
        } else {
            this.item.transcodeConfig.channels = this.channels
        }
        document.dispatchEvent(new CustomEvent('stream-config', {detail: {item: this.item}}))
        this.addEventListener('transitionend', this.cleanup, {once: true})
        this.classList.add('fade-out')
    }

    cleanup() {
        document.removeEventListener('click', this.handleDocumentClick)
        document.removeEventListener('configurator-hidden', this.cleanup)
        this.className = ''
        delete this.item
    }

    initSettings() {
        const codec = this.item.transcodeConfig?.codec;
        const channels = this.item.transcodeConfig?.channels;
        const qp = this.item.transcodeConfig?.qp;
        this.aspectRatio = this.item.transcodeConfig?.aspectRatio ?? '16:9';
        this.codecs = this[`${this.item.codec_type}Codecs`].sort((a,b) => a.id > b.id);
        this.codec = typeof codec !== 'undefined' ? codec : this.codecs.find(c => c.default).v;
        this.qp = typeof qp !== 'undefined' ? qp : this.codecs.find(c => c.default).qp;
        this.channels = typeof channels !== 'undefined' ? channels : this.codecs.find(c => c.default).channels;
        this.qpSlider.value = this.qp;
        this.copyCodec = this.codecs.find(c => c.l === 'Copy').v;
        this.update();
    }

    update() {
        this.renderCodecs().renderChannels().renderAspect();
        this.qpSlider.disabled = this.codec === this.copyCodec;
        this.qpSlider.dispatchEvent(new Event('input'));
    }

    renderCodecs() {
        this.codecContainer.replaceChildren();
        this.codecs.forEach(item => {
            const node = document.importNode(this.codecTemplate, true);
            node.querySelector('span').innerText = item.l;
            const input = node.querySelector('input');
            input.value = item.v;
            input.checked = this.isCodecChecked(item);
            input.addEventListener('change', this.handleCodecChange);
            this.codecContainer.append(node);
        });
        return this;
    }

    renderChannels() {
        this.channelsContainer.replaceChildren();
        this.channelOptions.forEach(item => {
            const node = document.importNode(this.channelTemplate, true);
            node.querySelector('span').innerText = item;
            const input = node.querySelector('input');
            input.value = item;
            input.checked = this.isCHannelsChecked(item);
            input.disabled = this.codec === this.copyCodec;
            input.addEventListener('change', this.handleChannelsChange);
            this.channelsContainer.append(node);
        });
        return this;
    }

    renderAspect() {
        this.aspectContainer.replaceChildren();
        this.aspectRatioOptions.forEach(item => {
            const node = document.importNode(this.aspectTemplate, true);
            node.querySelector('span').innerText = item;
            const input = node.querySelector('input');
            input.value = item;
            input.checked = this.isAspectRatio(item);
            input.addEventListener('change', this.handleAspectRatioChange);
            this.aspectContainer.append(node);
        });
        return this;
    }

    handleDocumentClick(e) {
        if(e.composedPath().indexOf(this) < 0) {
            this.hide()
        }
    }

    handleQpRange(e) {
        this.qp = parseInt(this.qpSlider.value)
        this.qpDisplay.innerText = String(this.qp);
        this.#manual = true;
    }

    handleCodecChange(e) {
        this.codec = parseInt(e.currentTarget.value)
        if (this.item.codec_type === 'audio') {
            this.channels = this.codecs.find(c => c.v === this.codec).channels
        }
        if (this.item.codec_type === 'video') {
            this.qp = this.codecs.find(c => c.v === this.codec).qp
            this.qpSlider.value = this.qp
        }
        this.#manual = true;
        this.update();
    }

    handleChannelsChange(e) {
        this.channels = parseInt(e.currentTarget.value)
        this.#manual = true;
    }

    handleAspectRatioChange(e) {
        this.aspectRatio = e.currentTarget.value
        this.#manual = true;
    }

    isCodecChecked(codec) {
        return codec.v === this.codec
    }

    isCHannelsChecked(channels) {
        return channels === this.channels && this.codec !== this.copyCodec
    }

    isAspectRatio(ratio) {
        return this.aspectRatio === ratio || "Keep" === ratio;
    }
}

StreamConfig.template = /*html*/`
<style>
    /* fade */
    :host {
        display: none;
        opacity: 0;
        transition: opacity var(--transition-fast) ease-in;
        position: absolute;
    }
    :host(.active) {
        display: flex;
        align-items: center;
    }
    :host(.fade-in) {
        opacity: 1;
    }
    :host(.fade-out) {
        transition-duration: var(--transition-ultraslow);
        opacity: 0;
    }
    /* common */
    main {
        background: var(--clr-bg-100);
        border: 2px solid var(--clr-bg-200);
        border-radius: .5rem;
        box-shadow: 0 0 7vw 0 var(--clr-shadow-0);
        padding: .5rem;
    }
    main::before {
        position: absolute;
        z-index: 0;
        top: .7rem;
        right: -.4rem;
        content: '';
        width: .8rem;
        aspect-ratio: 1;
        background: var(--clr-bg-100);
        border: 2px var(--clr-bg-200);
        border-style: none solid solid none;
        transform: rotate(-45deg);
    }
    label {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: .5rem;
        font-size: .8rem;
        padding-block: .25rem;
    }
    input {
        accent-color: var(--clr-enlightened);
    }
    input:checked {
        box-shadow: 0 0 10px 3px var(--clr-enlightened-glow);
    }
    :host(:not(.video)) #qpslider,
    :host(:not(.video)) #aspect-ratio {
        display: none;
    }
    :host(:not(.audio)) #audiochannels {
        display: none;
    }
</style>
<main>
    <div id="codecs">
        <template data-type="codec">
            <label>
                <span></span>
                <input type="radio" name="codec">
            </label>
        </template>
    </div>
    <div id="audiochannels">
        <span>Channels</span>
        <template data-type="channel">
            <label>
                <span></span>
                <input type="radio" name="channels">
            </label>
        </template>
    </div>
    <label id="qpslider">
        <span>QP (<span></span>)</span>
        <input list="tickmarks" type="range" min="18" max="51" step="1">
    </label>
    <div id="aspect-ratio">
        <span>Aspect Ratio</span>
        <template data-type="aspect">
            <label>
                <span></span>
                <input type="radio" name="aspect-ratio">
            </label>
        </template>
    </div>
</main>
`

customElements.define('transcode-configurator-stream-config', StreamConfig);