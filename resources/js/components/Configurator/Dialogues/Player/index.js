import { Slim, Iconify } from "@/components/lib";
import { Request } from "@/components/Request";
import Hls from "hls.js";
import 'media-chrome';

class Player extends Slim {
    async onAdded() {
        let response = await Request.post(
            `/stream/${encodeURIComponent(this.path)}`,
            this.config
        );
        requestAnimationFrame(() => {
            this.hls = new Hls();
            this.hls.loadSource(
                `/stream-playlist/${encodeURIComponent(this.path)}.m3u8`
            );
            this.hls.attachMedia(this.video);
        });
    }

    onRemoved() {
        this.hls.detachMedia();
        this.hls.destroy();
        Request.delete(`/stream/${encodeURIComponent(this.path)}`);
    }
}

Player.template = /*html*/ `
<style>
    :host {
        display: grid;
        place-items: center;
        height: 100%;
    }
    media-controller,
    video {
        width: 100%;
        max-height: 99%;
        max-width: 1920px;
        aspect-ratio: {{ this.aspectRatio }};
    }
</style>
<media-controller defaultduration="600">
    <video #ref="video" slot="media"></video>
    <media-loading-indicator slot="centered-chrome"></media-loading-indicator>
    <media-control-bar>
        <media-play-button></media-play-button>
        <media-mute-button></media-mute-button>
        <media-volume-range></media-volume-range>
        <media-time-range></media-time-range>
    </media-control-bar>
</media-controller>
`;

customElements.define("dialogue-player", Player);
