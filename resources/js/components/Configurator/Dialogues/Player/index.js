import { DomHelper } from "../../../../Helper/Dom";
import { Request } from "@/components/Request";
import Hls from "hls.js";
import "media-chrome";

class Player extends HTMLElement {
    constructor() {
        super();
        DomHelper.initDom.call(this);
    }
    async connectedCallback() {
        const controller = this.shadowRoot.querySelector("media-controller");
        // const config = { ...this.config, startTime: "00:29:00.280" };
        // const config = { ...this.config, startTime: "01:30:20.520" };
        const config = { ...this.config };
        controller.setAttribute("defaultduration", String(this.duration));
        await Request.post(`/stream/${encodeURIComponent(this.path)}`, config);
        requestAnimationFrame(() => {
            const video = this.shadowRoot.querySelector("video");
            this.hls = new Hls();
            this.hls.loadSource(
                `/stream-playlist/${encodeURIComponent(this.path)}.m3u8`,
            );
            this.hls.attachMedia(video);
        });
    }

    disconnectedCallback() {
        this.hls.detachMedia();
        this.hls.destroy();
        Request.delete(`/stream/${encodeURIComponent(this.path)}`);
    }

    set aspectRatio(value) {
        this.shadowRoot.querySelector("media-controller").style.aspectRatio =
            value;
    }
}

Player.template = html`
    <style>
        :host {
            display: block;
            height: 100%;
            text-align: center;
            overflow: hidden;
        }
        media-controller {
            max-width: 100%;
            height: 100%;
        }
    </style>
    <media-controller>
        <video slot="media"></video>
        <media-loading-indicator
            slot="centered-chrome"
            noautohide
        ></media-loading-indicator>
        <media-control-bar>
            <media-play-button></media-play-button>
            <media-mute-button></media-mute-button>
            <media-volume-range></media-volume-range>
            <media-time-range></media-time-range>
            <media-time-display showduration remaining></media-time-display>
        </media-control-bar>
    </media-controller>
`;

customElements.define("dialogue-player", Player);
