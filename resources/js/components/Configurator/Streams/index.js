import { DomHelper } from '../../../Helper/Dom'
import './Video'
import './Audio'
import './Sub'
import './Data'
import './Config'

const TYPE_VIDEO = 'video'
const TYPE_AUDIO = 'audio'
const TYPE_SUB = 'subtitle'
const TYPE_DATA = 'data'

export { TYPE_AUDIO, TYPE_VIDEO, TYPE_SUB, TYPE_DATA };

class Streams extends HTMLElement {

    container;

    connectedCallback() {
        DomHelper.initDom.call(this);
        this.container = this.shadowRoot.querySelector('div');
        this.updateHandler = this.handleUpdates.bind(this);
        this.video?.find(v => v.active) || this.video?.forEach((v, k) => v.active = k === 0)
        this.audio?.find(a => a.active) || this.audio?.forEach((v, k) => v.active = PREFERRED_LANGUAGES.includes(v.tags?.language));
        this.audio?.find(a => a.active) || this.audio?.forEach((v, k) => v.active = k === 0)
        document.addEventListener('stream-config', this.updateHandler);
        this.handleUpdates();
    }

    disconnectedCallback() {
        document.removeEventListener('stream-config', this.updateHandler);
    }

    handleUpdates() {
        const streams = [];
        this.video.length && streams.push(this.getVideoStreams());
        this.audio.length && streams.push(this.getAudioStreams());
        this.subs.length && streams.push(this.getSubtitleStreams());
        this.data.length && streams.push(this.getDataStreams());
        this.container.replaceChildren(...streams);
    }

    getVideoStreams() {
        const node = document.createElement('transcode-configurator-stream-video');
        node.streams = this.video;
        return node;
    }

    getAudioStreams() {
        const node = document.createElement('transcode-configurator-stream-audio');
        node.streams = this.audio;
        return node;
    }

    getSubtitleStreams() {
        const node = document.createElement('transcode-configurator-stream-sub');
        node.streams = this.subs;
        return node;
    }

    getDataStreams() {
        const node = document.createElement('transcode-configurator-stream-data');
        node.streams = this.data;
        return node;
    }

    get video() {
        return this.items?.filter(i => i.codec_type === TYPE_VIDEO).sort((a, b) => a.index > b.index)
    }

    get audio() {
        return this.items?.filter(i => i.codec_type === TYPE_AUDIO).sort((a, b) => a.index > b.index)
    }

    get subs() {
        return this.items?.filter(i => i.codec_type === TYPE_SUB).sort((a, b) => a.index > b.index)
    }

    get data() {
        return this.items?.filter(i => i.codec_type === TYPE_DATA).sort((a, b) => a.index > b.index)
    }
}

Streams.template = /*html*/`
<style>
div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
<div></div>
`

customElements.define('transcode-configurator-streams', Streams);