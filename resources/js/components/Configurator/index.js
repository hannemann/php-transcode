import { Slim, Utils } from '@/components/lib';
import Iconify from '@iconify/iconify'
import {Request} from '@/components/Request'
import './Streams'
import './Clips'
import './Format'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';

const WS_CHANNEL = 'Transcode.Config'

class TranscodeConfigurator extends Slim {

    onAdded() {
        this.canConcat = false
        document.addEventListener('file-clicked', this.init.bind(this))
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
        this.handleConfigureStream = this.handleConfigureStream.bind(this)
        // this.handleStreamConfig = this.handleStreamConfig.bind(this)
    }

    init(e) {
        if ('video' === e.detail.mime.split('/').shift()) {
            this.item = e.detail
            this.setCanConcat()
            this.initWebsocket()
        }
    }

    show() {
        this.classList.add('active')
        this.item.node.iconActive = true
        document.dispatchEvent(new CustomEvent('configurator-show', {detail: true}))
        document.addEventListener('stream-configure', this.handleConfigureStream)
        console.info('Show streams of %s', this.item.path)
    }

    hide() {
        this.addEventListener('transitionend', () => {
            this.classList.remove('active', 'fade-out')
        }, {once: true})
        this.classList.add('fade-out')
        this.format = undefined
        this.streams = undefined
        this.item.node.iconActive = false
        delete this.item
        this.leaveWebsocket()
        document.removeEventListener('stream-configure', this.handleConfigureStream)
        document.dispatchEvent(new CustomEvent('configurator-show', {detail: false}))
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL)
        this.channel.listen(WS_CHANNEL, this.handleConfiguratorEvent.bind(this))
        this.channel.subscribed(this.requestStreams.bind(this))
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL)
        window.Echo.leave(WS_CHANNEL)
        delete this.channel
    }

    requestStreams() {
        try {
            console.info('Request streams of %s', this.item.path)
            Request.get(`/streams/${encodeURIComponent(this.item.path)}`)
        } catch (error) {
            this.leaveWebsocket()
            this.hide()
        }
    }

    transcode() {
        const clips = this.shadowRoot.querySelector('transcode-configurator-clips')
        if (!clips.valid) {
            document.dispatchEvent(new CustomEvent('toast', {
                detail: {
                    message: 'Clip is invalid',
                    type: 'warning'
                }
            }))
            return
        }
        try {
            requestAnimationFrame(() => {
                const clipsData = [...clips.clips]
                if (clipsData[0].from === null) {
                    clipsData[0].from = '0:0:0.0'
                }
                if (clipsData.length === 1 && clipsData[0].to === null) {
                    clipsData[0].to = this.formatNode.duration
                }
                const streams = this.streams.filter(s => s.active).map(s => ({id: s.index, config: s.transcodeConfig ?? {}}))
                console.info('Transcode %s', this.item.path, clipsData, streams)
                Request.post(`/transcode/${encodeURIComponent(this.item.path)}`, {
                    streams,
                    clips: clipsData
                })
            })
        } catch (error) {}
    }

    handleConfiguratorEvent(ws) {
        console.info(ws)
        this.format = ws.format
        this.streams = ws.streams
        this.show()
    }

    setCanConcat() {
        this.canConcat = this.item?.parent?.videoFiles?.length > 1 &&
            !this.item.parent.videoFiles.find(i => i.name === `${this.item.parent.channelHash}-concat.ts`)
    }

    async requestConcat() {
        console.info('Concat video files in %s', this.item.parent.path)
        try {
            await Request.get(`/concat/${this.item.parent.path}`)
        } catch (error) {
            console.error(error)
        }
    }

    async requestRemux() {
        console.info('Remux video file %s', this.item.path)
        try {
            await Request.get(`/remux/${this.item.path}`)
        } catch (error) {
            console.error(error)
        }
    }

    handleConfigureStream(e) {
        const offsetOrigin = e.detail.origin.getBoundingClientRect()
        const offsetMain = this.main.getBoundingClientRect()
        const offset = {
            top: offsetOrigin.top - offsetMain.top,
            right: offsetMain.right - offsetOrigin.left
        }
        document.addEventListener('stream-config', this.handleStreamConfig.bind(this, e.detail.item), {once: true})
        if (this.streamConfig.classList.contains('active') && e.detail.item.index !== this.streamConfig.item.index) {
            this.streamConfig.addEventListener('transitionend', () => {
                requestAnimationFrame(() => this.streamConfig.toggle(e.detail.item, offset))
            }, {once: true})
        }
        this.streamConfig.toggle(e.detail.item, offset)
    }

    handleStreamConfig(item) {
        console.info('Stream configured: ', item.transcodeConfig)
    }
}

const CSS = /*css*/`
<style>
:host {
    position: fixed;
    inset: 0;
    display: none;
    opacity: 1;
    transition: opacity var(--transition-slow) linear;
}
:host(.active) {
    display: flex;
    align-items: center;
}
:host(.fade-out) {
    opacity: 0;
}
main {
    position: absolute;
    box-shadow: 0 0 10vw 3vw var(--clr-shadow-0);
    inset: var(--rel-gutter-500);
    background-color: var(--clr-bg-0);
    border-radius: var(--rel-gutter-100);
    padding: var(--rel-gutter-200);
}
main > div {
    overflow-y: auto;
    height: calc(100% - 1.75rem - var(--rel-gutter-200) * 2);
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    height: 1em;
    width: 1em;
}
main div *:last-child {
    margin-bottom: 0;
}
footer {
    display: flex;
    justify-content: flex-end;
    gap: .5rem;
    padding: 0 1rem 1rem;
}
footer button {
    background: var(--clr-bg-100);
    color: var(--clr-text-100);
    font-size: 1rem;
    padding: .5rem;
    border: 2px solid var(--clr-bg-200);
    transition-property: text-shadow, box-shadow, border-color, background-color;
    transition-timing-function: ease-out;
    transition-duration: var(--transition-medium);
}
footer button:hover {
    background:var(--clr-bg-200);
    color: var(--clr-enlightened);
    text-shadow: 0 0 5px var(--clr-enlightened-glow), 0 0 10px var(--clr-enlightened-glow);
    border-color: var(--clr-enlightened);
    box-shadow: 0 0 20px 0 var(--clr-enlightened-glow), 0 0 10px 0 inset var(--clr-enlightened-glow);
}
</style>
${ICON_STACK_CSS}
`

const HEADING = /*html*/`
<h1>
    Transcode
    <div @click="this.hide()" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
</h1>
`

TranscodeConfigurator.template = /*html*/`
${CSS}
<main #ref="main">
    ${HEADING}
    <div>
        <transcode-configurator-format *if="{{ this.format }}" .format="{{ this.format }}" #ref="formatNode"></transcode-configurator-format>
        <transcode-configurator-streams *if="{{ this.streams }}" .items="{{ this.streams }}"></transcode-configurator-streams>
        <transcode-configurator-clips *if="{{ this.streams }}" .path="{{ this.item.path }}"></transcode-configurator-clips>
        <footer>
            <button @click="this.requestRemux()">Remux</button>
            <button *if="{{ this.canConcat }}" @click="this.requestConcat()">Concat</button>
            <button @click="this.transcode()">Start</button>
        </footer>
    </div>
    <transcode-configurator-stream-config #ref="streamConfig"></transcode-configurator-stream-config>
</main>
`

customElements.define('transcode-configurator', TranscodeConfigurator);