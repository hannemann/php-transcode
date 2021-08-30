import { Slim } from 'slim-js'
import '../../../slim-directives'
import './Streams/Video'
import './Streams/Audio'
import './Streams/Sub'
import './Streams/Data'

const TYPE_VIDEO = 'video'
const TYPE_AUDIO = 'audio'
const TYPE_SUB = 'subtitle'
const TYPE_DATA = 'data'

class Streams extends Slim {

    get video() {
        return this.items?.filter(i => i.codec_type === TYPE_VIDEO)
    }

    get audio() {
        return this.items?.filter(i => i.codec_type === TYPE_AUDIO)
    }

    get subs() {
        return this.items?.filter(i => i.codec_type === TYPE_SUB)
    }

    get data() {
        return this.items?.filter(i => i.codec_type === TYPE_DATA)
    }
}

Streams.template = /*html*/`
<div>
    <transcode-configurator-stream-video *if="{{ this.video.length }}" .streams="{{ this.video }}"></transcode-configurator-stream-video>
    <transcode-configurator-stream-audio *if="{{ this.audio.length }}" .streams="{{ this.audio }}"></transcode-configurator-stream-audio>
    <transcode-configurator-stream-sub *if="{{ this.subs.length }}" .streams="{{ this.subs }}"></transcode-configurator-stream-sub>
    <transcode-configurator-stream-data *if="{{ this.data.length }}" .streams="{{ this.data }}"></transcode-configurator-stream-data>
<div>
`

customElements.define('transcode-configurator-streams', Streams);