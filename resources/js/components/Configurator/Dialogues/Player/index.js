import { Slim, Iconify } from "@/components/lib";
import { Request } from "@/components/Request";
import Hls from "hls.js";

class Player extends Slim {
    onAdded() {
        Request.get(`/stream/${encodeURIComponent(this.path)}`);
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
    video {
        width: 100%;
        max-height: 99%;
        max-width: 100%;
    }
</style>
<video #ref="video" controls></video>
`;

customElements.define("dialogue-player", Player);
