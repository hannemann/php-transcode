import { DomHelper } from '../../Helper/Dom';
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import {Request} from '@/components/Request'

const WS_CHANNEL = 'TextViewer'

class TextViewer extends HTMLElement {

    connectedCallback() {
        document.addEventListener('file-clicked', this.init.bind(this))
        document.addEventListener('show-textcontent', this.showTextContent.bind(this))

        DomHelper.initDom.call(this);

        this.btnClose = this.shadowRoot.querySelector('h1 div');
        this.btnClose.addEventListener('click', this.hide.bind(this));

        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    init(e) {
        if (!this.item) {
            if (this.isValid(e.detail)) {
                this.item = e.detail
                this.initWebsocket()
            }
        }
    }

    isValid(item) {
        return 'text' === item.mime.split('/').shift() ||
            'json' === item.mime.split('/').pop()
    }

    show() {
        this.classList.add('active')
        document.dispatchEvent(new CustomEvent('textviewer-show', {detail: true}))
        console.info('Show contents of %s', this.item.path)
    }

    showTextContent(e) {
        this.origin = 'textcontent'
        this.content = e.detail.content
        this.classList.add('active')
        document.dispatchEvent(new CustomEvent('textviewer-show', {detail: true}))
    }

    hide() {
        this.addEventListener('transitionend', () => {
            this.classList.remove('active', 'fade-out')
        })
        this.classList.add('fade-out')
        if (this.origin === 'file') {
            this.item.node.iconActive = false
            delete this.item
            this.leaveWebsocket()
        }
        this.origin = undefined
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
            this.origin = 'file'
            Request.loading = true
            Request.get(`/textviewer/${encodeURIComponent(this.item.path)}`)
        } catch (error) {
            this.leaveWebsocket()
            this.hide()
        }
    }

    handleTextViewerEvent(ws) {
        console.info(ws)
        this.shadowRoot.querySelector('pre').textContent = ws.content
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
    user-select: none;
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
    <div class="icon-stack">
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