import { Slim } from 'slim-js';
import '../../slim-directives';
import Iconify from '@iconify/iconify'
import './Configurator/Streams'
import './Configurator/Cut'
import './Configurator/Format'

const WS_CHANNEL = 'Transcode.Config'

class TranscodeConfigurator extends Slim {

    onAdded() {
        document.addEventListener('file-clicked', this.show.bind(this))
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    show(e) {
        if ('video' === e.detail.mime.split('/').shift()) {
            this.classList.add('active')
            this.item = e.detail
            this.initWebsocket()
        }
    }

    hide() {
        this.classList.remove('active')
        delete this.item
        this.format = undefined
        this.streams = undefined
        this.leaveWebsocket()
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL)
        try {
            this.channel.listen(WS_CHANNEL, this.handleConfiguratorEvent.bind(this))
            this.channel.subscribed(this.requestStreams.bind(this))
        } catch (error) {
            console.error(error)
        }
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL)
        window.Echo.leave(WS_CHANNEL)
        delete this.channel
    }

    async requestStreams() {
        await fetch(`/streams/${this.item.path}`)
    }

    handleConfiguratorEvent(ws) {
        console.log(ws)
        this.format = ws.format
        this.streams = ws.streams
    }
}

const CSS = /*css*/`
<style>
:host {
    position: fixed;
    inset: 0;
    display: none;
}
:host(.active) {
    display: block;
}
main {
    position: absolute;
    box-shadow: 0 0 10vw 3vw var(--clr-shadow-0);
    inset: var(--rel-gutter-400);
    background-color: var(--clr-bg-0);
    border-radius: var(--rel-gutter-200);
    padding: var(--rel-gutter-200);
}
main > div {
    overflow-y: auto;
    height: calc(100% - 1.75rem - var(--rel-gutter-200) * 2);
}
main h1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0 0 var(--rel-gutter-100) 0;
    font-size: 1.75rem;
}
main h1 div {
    cursor: pointer;
}
</style>
`

const HEADING = /*html*/`
<h1>
    Transcode
    <div @click="this.hide()">
        <span class="iconify" data-icon="mdi-close"></span>
    </div>
</h1>
`

TranscodeConfigurator.template = /*html*/`
${CSS}
<main>
    ${HEADING}
    <div>
        <transcode-configurator-format *if="{{ this.format }}" .format="{{ this.format }}"></transcode-configurator-format>
        <transcode-configurator-streams *if="{{ this.streams }}" .items="{{ this.streams }}"></transcode-configurator-streams>
        <transcode-configurator-cut *if="{{ this.streams }}"></transcode-configurator-cut>
    </div>
</main>
`

customElements.define('transcode-configurator', TranscodeConfigurator);