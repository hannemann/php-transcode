import { Slim } from '@/components/lib';
import Iconify from '@iconify/iconify'
import './Done'
import './Failed'
import './Current'
import './Pending'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';

const STATE_RUNNING = 'running'
const STATE_PENDING = 'pending'
const STATE_DONE = 'done'
const STATE_FAILED = 'failed'

class Progress extends Slim {

    constructor() {
        super()
        this.size = 0
        this.percentage = 0
        this.detail = false
        this.dataset.hasItems = false
    }

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
        this.channel = window.Echo.channel('FFMpegProgress')
        this.channel.subscribed(this.fetch.bind(this))
        this.channel.listen('FFMpegProgress', this.handleProgressEvent.bind(this))
        setInterval(this.fetch, 5000)
        this.fetch()
    }

    toggleDetail() {
        this.detail = !this.detail
        this.classList.toggle('detail', this.detail)
        this.iconShort.classList.toggle('hidden', this.detail)
        this.sectionShort.classList.toggle('hidden', this.detail)
        this.iconDetail.classList.toggle('hidden', !this.detail)
        this.sectionDetail.classList.toggle('hidden', !this.detail)
        this.fetch()
    }

    async fetch() {
        try {
            let response = await fetch('/progress')
            if (response.status !== 200) {
                let error = await response.json()
                throw new Error(error.message)
            }
        } catch (error) {
            console.error(error)
            document.dispatchEvent(new CustomEvent('toast', {
                detail: {
                    message: error,
                    type: 'error'
                }
            }))
        }
    }

    handleProgressEvent({queue}) {
        this.dataset.hasItems = (queue.length > 0).toString()
        let current = queue.filter(q => q.state === STATE_RUNNING)
        let pending = queue.filter(q => q.state === STATE_PENDING)
        let failed = queue.filter(q => q.state === STATE_FAILED)
        let done = queue.filter(q => q.state === STATE_DONE)
        this.percentage = current.length ? current[0].percentage : 0

        this.sectionDetail.querySelectorAll('*').forEach(n => n.remove())
        this.dummy.querySelectorAll('*').forEach(n => n.remove())
        
        if (pending.length) {
            let node = this.sectionDetail.appendChild(document.createElement('ffmpeg-progress-pending'))
            let clone = this.dummy.appendChild(node.cloneNode(true))
            node.items = clone.items = pending
        }
        if (current.length) {
            let node = this.sectionDetail.appendChild(document.createElement('ffmpeg-progress-current'))
            let clone = this.dummy.appendChild(node.cloneNode(true))
            node.item = clone.item = current[0]
        }
        if (failed.length) {
            let node = this.sectionDetail.appendChild(document.createElement('ffmpeg-progress-failed'))
            let clone = this.dummy.appendChild(node.cloneNode(true))
            node.items = clone.items = failed
        }
        if (done.length) {
            let node = this.sectionDetail.appendChild(document.createElement('ffmpeg-progress-done'))
            let clone = this.dummy.appendChild(node.cloneNode(true))
            node.items = clone.items = done
        }
        if (this.detail) {
            requestAnimationFrame(() => {
                this.sectionDetail.style.maxHeight = `${this.dummy.offsetHeight}px`
                this.sectionDetail.style.maxWidth = `min(90vw, ${this.dummy.offsetWidth}px)`
            })
        }
    }
}

Progress.template = /*html*/`
<style>
:host([data-has-items="false"]) {
    display: none;
}
:host {
    position: fixed;
    top: 0;
    margin: 0 auto;
    min-width: 10rem;
    padding: .5em 1em;
    font-size: max(10px, .85rem);
    background: var(--clr-bg-100);
    border-bottom-left-radius: .5em;
    border-bottom-right-radius: .5em;
    left: 50%;
    transform: translate(-50%);
    border: 2px var(--clr-bg-200);
    border-style: none solid solid;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    box-shadow: 0 0 7vw 0 var(--clr-shadow-0);
}
div {
    cursor: pointer;
    margin-right: .5em;
}
div.hidden {
    display: none;
}
section:first-of-type {
    text-align: right;
    flex-grow: 1;
}
section {
    --duration: var(--transition-medium);
    transform-origin: top left;
    transition: transform var(--duration) ease-in-out,
                max-width var(--duration) ease-in-out,
                max-height var(--duration) ease-in-out;
}
section.hidden {
    max-width: 0 !important;
    max-height: 0 !important;
    transform: scale(0);
}
section.detail, section.dummy {
    display: flex;
    flex-direction: column;
    gap: .5em;
}
section.dummy {
    position: fixed;
    top: 100vh;
    max-width: 90vw;
}
</style>
${ICON_STACK_CSS}
<div #ref="iconShort" @click="this.toggleDetail()">
    <div class="icon-stack">
        <span class="iconify" data-icon="mdi-plus-box-outline"></span>
        <span class="iconify hover" data-icon="mdi-plus-box-outline"></span>
    </div>
</div>
<div #ref="iconDetail" class="hidden" @click="this.toggleDetail()">
    <div class="icon-stack">
        <span class="iconify" data-icon="mdi-minus-box-outline"></span>
        <span class="iconify hover" data-icon="mdi-minus-box-outline"></span>
    </div>
</div>
<section #ref="sectionShort">{{ this.percentage }}%</section>
<section #ref="sectionDetail" class="detail hidden" style="max-width: 0; max-height: 0"></section>
<section #ref="dummy" class="dummy"></section>
`

customElements.define('ffmpeg-progress', Progress);
