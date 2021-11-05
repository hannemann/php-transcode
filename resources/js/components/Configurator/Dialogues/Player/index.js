import { Slim, Iconify } from "@/components/lib";
import { Request } from "@/components/Request";
import Hls from "hls.js";

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
    video {
        width: 100%;
        max-height: 99%;
        max-width: 100%;
    }
</style>
<video #ref="video" controls></video>
`;

customElements.define("dialogue-player", Player);
