import { Slim } from '@/components/lib';

class StreamConfig extends Slim {

    constructor() {
        super()
        this.videoCodecs = Object.values(VIDEO_CODECS).sort((a,b) => a.v > b.v)
        this.audioCodecs = Object.values(AUDIO_CODECS).sort((a,b) => a.v > b.v)
        this.handleDocumentClick = this.handleDocumentClick.bind(this)
    }

    toggle(item, offset) {
        if (this.classList.contains('active')) {
            this.hide()
        } else {
            this.item = item
            this.codecs = this[`${item.codec_type}Codecs`]
            this.style.top = `calc(${offset.top}px - .4rem)`
            this.style.right = `calc(${offset.right}px + 1rem)`
            this.show()
        }
    }
    show() {
        requestAnimationFrame(() => {
            document.addEventListener('click', this.handleDocumentClick)
            this.classList.add('active')
            requestAnimationFrame(() => this.classList.add('fade-in'))
        })
    }

    hide() {
        this.addEventListener('transitionend', () => {
            this.className = ''
            delete this.item
            this.isVideo = false
            this.isAudio = false
        }, {once: true})
        document.removeEventListener('click', this.handleDocumentClick)
        this.classList.add('fade-out')
    }

    handleDocumentClick(e) {
        if(e.composedPath().indexOf(this) < 0) {
            this.hide()
        }
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
</style>
<main>
    <label *foreach="{{ this.codecs }}">
        <span>{{ item.l }}</span>
        <input type="radio" value="{{ item.v }}" name="codec" checked="{{ item.default }}">
    </label>
</main>
`

customElements.define('transcode-configurator-stream-config', StreamConfig);