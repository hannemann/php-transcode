import { Slim } from 'slim-js';
import '../../slim-directives';
import Iconify from '@iconify/iconify'
import './Configurator/Streams'
import './Configurator/Clip'
import './Configurator/Format'
import { ICON_STACK_CSS } from '../IconStack.css';

const WS_CHANNEL = 'Transcode.Config'
const CSRF_TOKEN = document.head.querySelector("[name~=csrf-token][content]").content;

class TranscodeConfigurator extends Slim {

    onAdded() {
        document.addEventListener('file-clicked', this.init.bind(this))
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    init(e) {
        if ('video' === e.detail.mime.split('/').shift()) {
            this.item = e.detail
            this.initWebsocket()
        }
    }

    show() {
        this.classList.add('active')
        document.dispatchEvent(new CustomEvent('configurator-show', {detail: true}))
        console.info('Show streams of %s', this.item.path)
    }

    hide() {
        this.addEventListener('transitionend', () => {
            this.classList.remove('active', 'fade-out')
        })
        this.classList.add('fade-out')
        delete this.item
        this.format = undefined
        this.streams = undefined
        this.leaveWebsocket()
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

    async requestStreams() {
        console.info('Attempt to fetch streams of %s', this.item.path)
        document.dispatchEvent(new CustomEvent('loading', {detail: true}))
        try {
            let response = await fetch(`/streams/${encodeURIComponent(this.item.path)}`)
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
            this.leaveWebsocket()
            this.hide()
        } finally {
            document.dispatchEvent(new CustomEvent('loading', {detail: false}))
        }
    }

    async transcode() {
        let clip = this.shadowRoot.querySelector('transcode-configurator-clip')
        if (clip.dataset.valid !== 'true') {
            document.dispatchEvent(new CustomEvent('toast', {
                detail: {
                    message: 'Clip is invalid',
                    type: 'warning'
                }
            }))
            return
        }
        console.info('Transcode %s', this.item.path)
        try {
            let response = await fetch(`/transcode/${encodeURIComponent(this.item.path)}`, {
                method: 'post',
                body: JSON.stringify({
                    streams: this.streams.filter(s => s.active).map(s => s.index),
                    clip: {
                        from: clip.from || null,
                        to: clip.to || null
                    }
                }),
                headers: {
                  'Content-Type': 'application/json',
                  "X-CSRF-Token": CSRF_TOKEN
                },
            })
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
        } finally {
            document.dispatchEvent(new CustomEvent('loading', {detail: false}))
        }
    }

    handleConfiguratorEvent(ws) {
        console.info(ws)
        this.format = ws.format
        this.streams = ws.streams
        document.dispatchEvent(new CustomEvent('loading', {detail: false}))
        this.show()
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
<main>
    ${HEADING}
    <div>
        <transcode-configurator-format *if="{{ this.format }}" .format="{{ this.format }}"></transcode-configurator-format>
        <transcode-configurator-streams *if="{{ this.streams }}" .items="{{ this.streams }}"></transcode-configurator-streams>
        <transcode-configurator-clip #ref="clip" *if="{{ this.streams }}"></transcode-configurator-clip>
        <footer>
            <button @click="this.transcode()">Start</button>
        </footer>
    </div>
</main>
`

customElements.define('transcode-configurator', TranscodeConfigurator);