import { Slim, Utils } from 'slim-js'
import '../../../../slim-directives'
import Iconify from '@iconify/iconify'
import './Buttons'

class Stream extends Slim {

    constructor() {
        super()
        this.streams.forEach(item => {
            item.shortView = true
        });
        this.short = true
    }

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    toggleView(item) {
        item.shortView = !item.shortView
        Utils.forceUpdate(this)
    }
}

const MAINSTART = /*html*/ `
<main>
    <h2>{{ this.header }}</h2>
    <div *foreach="{{ this.streams }}">
        <div class="stream">
`

const MAINEND = /*html*/ `
            <transcode-configurator-stream-buttons .item="{{ item }}"></transcode-configurator-stream-buttons>
        </div>
    </div>
</main>
`

export {Stream, MAINSTART, MAINEND}