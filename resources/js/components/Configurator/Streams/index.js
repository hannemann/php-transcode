import { Slim } from '@/components/lib';
import './Video'
import './Audio'
import './Sub'
import './Data'
import './Config'

const TYPE_VIDEO = 'video'
const TYPE_AUDIO = 'audio'
const TYPE_SUB = 'subtitle'
const TYPE_DATA = 'data'

class Streams extends Slim {

    onAdded() {
        this.video?.find(v => v.active) || this.video?.forEach((v, k) => v.active = k === 0)
        this.audio?.find(a => a.active) || this.audio?.forEach((v, k) => v.active = k === 0)
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
<div>
    <transcode-configurator-stream-video *if="{{ this.video.length }}" .streams="{{ this.video }}"></transcode-configurator-stream-video>
    <transcode-configurator-stream-audio *if="{{ this.audio.length }}" .streams="{{ this.audio }}"></transcode-configurator-stream-audio>
    <transcode-configurator-stream-sub *if="{{ this.subs.length }}" .streams="{{ this.subs }}"></transcode-configurator-stream-sub>
    <transcode-configurator-stream-data *if="{{ this.data.length }}" .streams="{{ this.data }}"></transcode-configurator-stream-data>
</div>
`

customElements.define('transcode-configurator-streams', Streams);