import { Slim, Utils } from '@/components/lib';

class StreamConfig extends Slim {

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
        this.item.transcodeConfig = {codec: this.codec}
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
        const codec = this.item.transcodeConfig?.codec
        const channels = this.item.transcodeConfig?.channels
        const qp = this.item.transcodeConfig?.qp
        this.aspectRatio = this.item.transcodeConfig?.aspectRatio ?? '16:9'
        this.codecs = this[`${this.item.codec_type}Codecs`].sort((a,b) => a.id > b.id)
        this.codec = typeof codec !== 'undefined' ? codec : this.codecs.find(c => c.default).v
        this.qp = typeof qp !== 'undefined' ? qp : this.codecs.find(c => c.default).qp
        this.channels = typeof channels !== 'undefined' ? channels : this.codecs.find(c => c.default).channels
        this.qpSlider.value = this.qp
        this.copyCodec = this.codecs.find(c => c.l === 'Copy').v
        Utils.forceUpdate(this)
    }

    handleDocumentClick(e) {
        if(e.composedPath().indexOf(this) < 0) {
            this.hide()
        }
    }

    handleQpRange(e) {
        this.qp = parseInt(this.qpSlider.value)
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
        Utils.forceUpdate(this)
    }

    handleChannelsChange(e) {
        this.channels = parseInt(e.currentTarget.value)
    }

    handleAspectRatioChange(e) {
        this.aspectRatio = e.currentTarget.value
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
    <label *foreach="{{ this.codecs }}">
        <span>{{ item.l }}</span>
        <input type="radio" value="{{ item.v }}" name="codec" .checked="{{ this.isCodecChecked(item) }}" @change="{{ this.handleCodecChange }}">
    </label>
    <div id="audiochannels">
        <span>Channels</span>
        <label *foreach="{{ this.channelOptions }}">
            <span>{{ item }}</span>
            <input type="radio" value="{{ item }}" .disabled="{{ this.codec === this.copyCodec }}" name="channels" .checked="{{ this.isCHannelsChecked(item) }}" @change="{{ this.handleChannelsChange }}">
        </label>
    </div>
    <label id="qpslider">
        <span>QP (<span #ref="qpDisplay">{{ this.qp }}</span>)</span>
        <input #ref="qpSlider" list="tickmarks" .disabled="{{ this.codec === this.copyCodec }}" type="range" min="18" max="51" step="1" value="{{ this.qp }}" @input="{{ this.handleQpRange }}">
    </label>
    <div id="aspect-ratio">
        <span>Aspect Ratio</span>
        <label *foreach="{{ this.aspectRatioOptions }}">
            <span>{{ item }}</span>
            <input type="radio" value="{{ item }}" name="aspect-ratio" .checked="{{ this.isAspectRatio(item) }}" @change="{{ this.handleAspectRatioChange }}">
        </label>
    </div>
</main>
`

customElements.define('transcode-configurator-stream-config', StreamConfig);