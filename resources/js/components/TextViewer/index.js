import { Slim } from '@/components/lib';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import {Request} from '@/components/Request'

const WS_CHANNEL = 'TextViewer'

class TextViewer extends Slim {

    onAdded() {
        document.addEventListener('file-clicked', this.init.bind(this))
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    init(e) {
        if ('text' === e.detail.mime.split('/').shift()) {
            this.item = e.detail
            this.initWebsocket()
        }
    }

    show() {
        this.classList.add('active')
        document.dispatchEvent(new CustomEvent('textviewer-show', {detail: true}))
        console.info('Show contents of %s', this.item.path)
    }

    hide() {
        this.addEventListener('transitionend', () => {
            this.classList.remove('active', 'fade-out')
        })
        this.classList.add('fade-out')
        delete this.item
        this.leaveWebsocket()
        document.dispatchEvent(new CustomEvent('textviewer-show', {detail: false}))
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL)
        this.channel.listen(WS_CHANNEL, this.handleTextViewerEvent.bind(this))
        this.channel.subscribed(this.requestContent.bind(this))
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL)
        window.Echo.leave(WS_CHANNEL)
        delete this.channel
    }

    requestContent() {
        console.info('Attempt to fetch content of %s', this.item.path)
        try {
            Request.loading = true
            Request.get(`/textviewer/${encodeURIComponent(this.item.path)}`)
        } catch (error) {
            this.leaveWebsocket()
            this.hide()
        }
    }

    handleTextViewerEvent(ws) {
        console.info(ws)
        this.content = ws.content
        this.show()
        Request.loading = false
    }
}

const CSS = /*html*/`
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
pre {
    white-space: pre-wrap;
    background: var(--clr-bg-100);
    padding: .5rem;
    border-radius: .5rem;
    overflow-y: auto;
    height: calc(100% - 1.75rem - var(--rel-gutter-200) * 2);
}
</style>
${ICON_STACK_CSS}
`

const HEADING = /*html*/`
<h1>
    Textviewer
    <div @click="this.hide()" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
</h1>
`

TextViewer.template = /*html*/`
${CSS}
<main>
    ${HEADING}
<pre>
{{ this.content }}
</pre>
</main>
`

customElements.define('text-viewer', TextViewer);