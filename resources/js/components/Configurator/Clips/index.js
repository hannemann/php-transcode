import { Slim, Utils } from '@/components/lib';
import CARD_CSS from '../CardCss';
import './Clip'
import sortable from 'html5sortable/dist/html5sortable.es'

const dataFactory = function*() {
    let id = 0
    while(true) {
        // yield {from: `0:0:${id}.0`, to: null, id: id++}
        yield {from: null, to: null, id: id++}
    }
}

const getClipInitData = (factory) => factory.next().value

class Clips extends Slim {
    constructor() {
        super()
        this.clips = [this.newClip()]
        //this.clips = [this.newClip(), this.newClip(), this.newClip(), this.newClip()]
        this.valid = true
        this.bindListener()
    }

    bindListener() {
        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleAdd = this.handleAdd.bind(this)
        this.handleRemove = this.handleRemove.bind(this)
        this.handleSortupdate = this.handleSortupdate.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
    }

    onAdded() {
        requestAnimationFrame(() => {
            sortable(this.sortable)
        })
    }

    newClip() {
        if (!this.dataFactory) {
            this.dataFactory = dataFactory()
        }
        return getClipInitData(this.dataFactory)
    }

    handleSortupdate(e) {
        this.clips.splice(
            e.detail.destination.index,
            0,
            this.clips.splice(e.detail.origin.index, 1)[0]
        )
        this.update()
    }

    handleAdd(e) {
        const idx = this.clips.findIndex(c => c.id === e.detail.id)
        this.clips.splice(idx+1, 0, this.newClip())
        this.update()
    }

    handleRemove(e) {
        if (this.clips.length > 1) {
            const idx = this.clips.findIndex(c => c.id === e.detail.id)
            this.clips.splice(idx, 1)
            this.update()
        }
    }

    handleUpdate(e) {
        this.valid = Array.from(this.shadowRoot.querySelectorAll('transcode-configurator-clip')).every(c => c.valid)
    }

    update() {
        Utils.forceUpdate(this, 'clips')
        requestAnimationFrame(() => {
            sortable(this.sortable, 'reload')
            this.shadowRoot.querySelectorAll('transcode-configurator-clip').forEach((c, i) => c.clipData = this.clips[i])
        })
    }

    handleFocus() {
        sortable(this.sortable, 'disable')
    }

    handleBlur() {
        sortable(this.sortable, 'enable')
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
            *foreach="{{ this.clips }}"
            .can-remove="{{ this.clips.length > 1 }}"
            @updateclip="{{ this.handleUpdate }}"
            @clipinsert="{{ this.handleAdd }}"
            @clipremove="{{ this.handleRemove }}"
            @clipfocus="{{ this.handleFocus }}"
            @clipblur="{{ this.handleBlur }}"
            .clip-data="{{ item }}">
        </transcode-configurator-clip>
    </div>
</main>
`
customElements.define('transcode-configurator-clips', Clips);