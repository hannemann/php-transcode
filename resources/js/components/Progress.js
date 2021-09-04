import { Slim } from 'slim-js';
import '../slim-directives';

class Progress extends Slim {

    constructor() {
        super()
        this.queue = []
        this.size = 0
    }

    onAdded() {
        this.channel = window.Echo.channel('FFMpegProgress')
        this.channel.subscribed(this.fetch.bind(this))
        this.channel.listen('FFMpegProgress', this.handleProgressEvent.bind(this))
    }

    fetch() {
        setInterval(async () => {
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
        }, 10000)
    }

    handleProgressEvent({queue, size}) {
        this.queue = queue
        this.size = size
        console.info('Progress: ', this.queue)
    }
}

Progress.template = /*html*/`
<style>
:host {
    position: fixed;
    inset: 0 0 auto auto;
    min-width: 10rem;
    padding: .5em 1em;
    text-align: right;
    font-size: max(10px, .85rem);
    background: var(--clr-bg-100);
    border-bottom-left-radius: .5em; 
}
main > div {
    display: flex;
    justify-content: space-between;
    gap: .5em;
}
main > div > div:last-child {
    text-align: right;
}
</style>
<main>
    <div *foreach="{{ this.queue }}">
        <div>{{ item.path }}</div>
        <div>{{ item.percentage }}%</div>
    </div>
</main>
`
customElements.define('ffmpeg-progress', Progress);