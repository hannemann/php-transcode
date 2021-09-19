import { Slim, Utils } from '@/components/lib';
import CARD_CSS from '../CardCss';
import './Clip'
import sortable from 'html5sortable/dist/html5sortable.es'
import {Request} from '@/components/Request'

const dataFactory = function*() {
    let id = 0
    while(true) {
        // yield {from: `0:0:${id}.0`, to: null, id: id++}
        yield {from: null, to: null, id: id++}
    }
}

const getClipInitData = (factory) => factory.next().value

const WS_CHANNEL = 'Transcode.Clips'

class Clips extends Slim {
    constructor() {
        super()
        this.clips = [this.newClip()]
        //this.clips = [this.newClip(), this.newClip(), this.newClip(), this.newClip()]
        this.valid = true
        this.bindListener()
    }

    onAdded() {
        this.initWebsocket()
        requestAnimationFrame(() => {
            sortable(this.sortable)
        })
    }

    onRemoved() {
        this.leaveWebsocket()
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL)
        this.channel.listen(WS_CHANNEL, this.handleClipsEvent.bind(this))
        this.channel.subscribed(this.requestClips.bind(this))
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL)
        window.Echo.leave(WS_CHANNEL)
        delete this.channel
    }

    requestClips() {
        try {
            console.info('Request clips of %s', this.path)
            Request.get(`/clips/${encodeURIComponent(this.path)}`)
        } catch (error) {
            console.error(error)
            this.leaveWebsocket()
        }
    }

    bindListener() {
        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleAdd = this.handleAdd.bind(this)
        this.handleRemove = this.handleRemove.bind(this)
        this.handleSortupdate = this.handleSortupdate.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
    }

    newClip() {
        if (!this.dataFactory) {
            this.dataFactory = dataFactory()
        }
        return getClipInitData(this.dataFactory)
    }

    handleClipsEvent(ws) {
        if (ws.clips.length) {
            this.clips = []
            ws.clips.forEach(c => {
                let clip = this.newClip()
                clip.from = c.from
                clip.to = c.to
                this.clips.push(clip)
            })
            this.update()
        }
    }

    handleSortupdate(e) {
        this.clips.splice(
            e.detail.destination.index,
            0,
            this.clips.splice(e.detail.origin.index, 1)[0]
        )
        this.update()
    }

    async handleAdd(e) {
        const idx = this.clips.findIndex(c => c.id === e.detail.id)
        let clip = this.newClip()
        this.clips.splice(idx+1, 0, clip)
        await this.update()
        this.sortable.querySelector(`[data-clip="${clip.id}"]`).inputFrom.focus()
    }

    async handleRemove(e) {
        if (this.clips.length > 1) {
            const idx = this.clips.findIndex(c => c.id === e.detail.id)
            this.clips.splice(idx, 1)
            await this.update()
            const focus = Math.max(0, idx - 1)
            this.sortable.querySelector(`[data-clip="${this.clips[focus].id}"]`).inputFrom.focus()
        }
    }

    handleUpdate(e) {
        this.update()
        this.valid = Array.from(this.shadowRoot.querySelectorAll('transcode-configurator-clip')).every(c => c.valid)
    }

    async update() {
        return new Promise((resolve) => {
            Utils.forceUpdate(this, 'clips')
            requestAnimationFrame(() => {
                sortable(this.sortable, 'reload')
                this.shadowRoot.querySelectorAll('transcode-configurator-clip').forEach((c, i) => c.clipData = this.clips[i])
                resolve()
            })
        })
    }

    handleFocus() {
        sortable(this.sortable, 'disable')
    }

    handleBlur() {
        sortable(this.sortable, 'enable')
    }

    getCutpoint(clip) {
        if (this.clips.length > 1) {
            const cutpoint = this.clips.filter(c => c.id <= clip.id).reverse()
                .reduce((acc, cur) => acc + this.toSeconds(cur.to) - this.toSeconds(cur.from), 0)
            if (isNaN(cutpoint)) {
                return ''
            }
            return `(Cutpoint: ${this.fromSeconds(cutpoint)})`
        }
        return '';
    }

    toSeconds(coord) {
        const [hours, minutes, seconds] = coord.split(':')
        return (parseFloat(hours) * 60 * 60) + (parseFloat(minutes) * 60) + parseFloat(seconds)
    }

    fromSeconds(coord) {
        const d = new Date(null)
        d.setMilliseconds(coord*1000)
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}.${d.getUTCMilliseconds()}`
    }
}

Clips.template = /*html*/`
${CARD_CSS}
<style>
    :host {
        user-select: none;
    }
    div {
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }
</style>
<main>
    <h2>Clips</h2>
    <div #ref="sortable" @sortupdate="{{ this.handleSortupdate }}">
        <transcode-configurator-clip
            data-clip="{{ item.id }}"
            *foreach="{{ this.clips }}"
            .can-remove="{{ this.clips.length > 1 }}"
            .is-last="{{ this.clips.indexOf(item) === this.clips.length - 1 }}"
            @updateclip="{{ this.handleUpdate }}"
            @clipinsert="{{ this.handleAdd }}"
            @clipremove="{{ this.handleRemove }}"
            @clipfocus="{{ this.handleFocus }}"
            @clipblur="{{ this.handleBlur }}"
            .clip-data="{{ item }}"
            .cutpoint="{{ this.getCutpoint(item) }}">
        </transcode-configurator-clip>
    </div>
</main>
`
customElements.define('transcode-configurator-clips', Clips);