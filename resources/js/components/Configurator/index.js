import { Slim, Iconify } from '@/components/lib';
import {Request} from '@/components/Request'
import { COMBO_BUTTON_CSS } from '@/components//partials';
import './Streams'
import './Clips'
import './Format'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import "./Dialogues/Scale";
import "./Dialogues/Crop";
import "./Dialogues/Clip";
import { TYPE_VIDEO } from "./Streams";

const WS_CHANNEL = "Transcode.Config";
const WS_CHANNEL_FFMPEG_OUT = "FFMpegOut";
class TranscodeConfigurator extends Slim {
    onAdded() {
        this.canConcat = false;
        this.debounceOut = false;
        document.addEventListener("file-clicked", this.init.bind(this));
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
        this.remuxContainer = "MP4";
        this.handleConfigureStream = this.handleConfigureStream.bind(this);
        this.requestRemux = this.requestRemux.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.hide = this.hide.bind(this);
    }

    init(e) {
        if (!this.item) {
            if ("video" === e.detail.mime.split("/").shift()) {
                this.item = e.detail;
                this.out = "";
                this.setCanConcat();
                this.initWebsocket();
            }
        }
    }

    show() {
        this.classList.add("active");
        this.item.node.iconActive = true;
        document.dispatchEvent(
            new CustomEvent("configurator-show", { detail: true })
        );
        document.addEventListener(
            "stream-configure",
            this.handleConfigureStream
        );
        console.info("Show streams of %s", this.item.path);
    }

    hide(e) {
        e.stopPropagation(); // prevent document clicks
        this.addEventListener(
            "transitionend",
            () => {
                this.classList.remove("active", "fade-out");
                this.format = undefined;
                this.streams = undefined;
                this.item.node.iconActive = false;
                delete this.item;
                document.dispatchEvent(new CustomEvent("configurator-hidden"));
            },
            { once: true }
        );
        this.classList.add("fade-out");
        this.leaveWebsocket();
        document.removeEventListener(
            "stream-configure",
            this.handleConfigureStream
        );
        document.removeEventListener("stream-config", this.handleStreamConfig, {
            once: true,
        });
        document.dispatchEvent(
            new CustomEvent("configurator-show", { detail: false })
        );
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL);
        this.channel.listen(
            WS_CHANNEL,
            this.handleConfiguratorEvent.bind(this)
        );
        this.channel.subscribed(this.requestStreams.bind(this)) +
            this.item.channel;
        this.channelOut = window.Echo.channel(
            `${WS_CHANNEL_FFMPEG_OUT}.${this.item.channel}`
        );
        this.channelOut.listen(
            WS_CHANNEL_FFMPEG_OUT,
            this.handleOutEvent.bind(this)
        );
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL);
        window.Echo.leave(WS_CHANNEL);
        this.channelOut.stopListening(WS_CHANNEL_FFMPEG_OUT);
        window.Echo.leave(`${WS_CHANNEL_FFMPEG_OUT}.${this.item.channel}`);
        delete this.channel;
    }

    requestStreams() {
        try {
            console.info("Request streams of %s", this.item.path);
            Request.get(`/streams/${encodeURIComponent(this.item.path)}`);
        } catch (error) {
            this.leaveWebsocket();
            this.hide();
        }
    }

    transcode() {
        if (!this.clips.valid) {
            document.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        message: "Clip is invalid",
                        type: "warning",
                    },
                })
            );
            return;
        }
        try {
            requestAnimationFrame(() => {
                console.info("Transcode %s", this.item.path, this.config);
                Request.post(
                    `/transcode/${encodeURIComponent(this.item.path)}`,
                    this.config
                );
            });
        } catch (error) {}
    }

    handleConfiguratorEvent(ws) {
        console.info(ws);
        this.format = ws.format;
        this.streams = ws.streams;
        this.show();
    }

    handleOutEvent(ws) {
        if (!this.debounceOut) {
            this.debounceOut = true;
            setTimeout(() => (this.debounceOut = false), 500);
            this.out = ws.out;
        }
    }

    setCanConcat() {
        this.canConcat =
            this.item?.parent?.videoFiles?.length > 1 &&
            !this.item.parent.videoFiles.find(
                (i) => i.name === `${this.item.parent.channelHash}-concat.ts`
            );
    }

    async requestConcat() {
        console.info("Concat video files in %s", this.item.path);
        try {
            await Request.post(`/concat/${encodeURIComponent(this.item.path)}`);
        } catch (error) {
            console.error(error);
        }
    }

    async requestRemux(e) {
        console.info("Remux video file %s", this.item.path);
        try {
            await Request.post(`/remux/${encodeURIComponent(this.item.path)}`, {
                ...this.config,
                container: e.target.value,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async requestScale(e) {
        const m = document.createElement("modal-dialogue");
        m.header = "Scale";
        const d = m.appendChild(document.createElement("dialogue-scale"));
        const video = this.streams.filter(
            (s) => s.codec_type === TYPE_VIDEO
        )?.[0];
        if (video) {
            d.setHeight(video.height);
            d.setAspectRatio(video.display_aspect_ratio);
        }
        document.body.appendChild(m);
        try {
            await m.open();
            console.info(
                "Scale video file %s to %dx%d with an aspect-ratio of %s",
                this.item.path,
                d.scale.width,
                d.scale.height,
                d.scale.aspectRatio
            );
            await Request.post(`/scale/${encodeURIComponent(this.item.path)}`, {
                width: d.scale.width,
                height: d.scale.height,
                aspect: d.scale.aspectRatio,
            });
        } catch (error) {}
    }

    async requestCrop(e) {
        const m = document.createElement("modal-dialogue");
        m.header = "Crop";
        const d = m.appendChild(document.createElement("dialogue-crop"));
        const video = this.streams.filter(
            (s) => s.codec_type === TYPE_VIDEO
        )?.[0];
        if (video) {
            d.setCropWidth(video.width);
            d.setCropHeight(video.height);
            d.setHeight(video.height);
            d.setAspectRatio(video.display_aspect_ratio);
        }
        document.body.appendChild(m);
        try {
            await m.open();
            console.info(
                "Crop video file %s to %dx%d with an aspect-ratio of %s",
                this.item.path,
                d.crop.cw,
                d.crop.ch,
                d.crop.aspect
            );
            await Request.post(
                `/crop/${encodeURIComponent(this.item.path)}`,
                d.crop
            );
        } catch (error) {}
    }

    async clipper() {
        if (this.format.format_name === "mpegts") {
            const m = document.createElement("modal-alert");
            m.appendChild(
                document.createTextNode(
                    "Clipper does not work with mpegts Files. Remux first."
                )
            );
            document.body.appendChild(m);
            await m.alert();
            return;
        }
        const m = document.createElement("modal-window");
        m.header = "Clipper";
        const d = document.createElement("dialogue-clip");
        d.duration = parseFloat(this.format.duration);
        d.setClips(this.clips.getTimestamps());
        const video = this.streams.filter(
            (s) => s.codec_type === TYPE_VIDEO
        )?.[0];
        if (video) {
            d.fps = parseInt(eval(video.avg_frame_rate), 10);
            d.start = parseFloat(video.start_time);
        }
        d.path = this.item.path;
        m.appendChild(d);
        m.classList.add("no-shadow");
        document.body.appendChild(m);
        const clipperHandler = this.handleClipper.bind(this);
        try {
            await m.open();
            this.clips.clips = [];
            for (let i = 0; i < d.clips.length; i++) {
                this.clips.addClip(
                    d.clips[i]?.timestamps.start ?? null,
                    d.clips[i]?.timestamps.end ?? null
                );
            }
            this.clips.update();
        } catch (error) {}
    }

    handleClipper(e) {
        console.log(e.detail);
    }

    handleConfigureStream(e) {
        const offsetOrigin = e.detail.origin.getBoundingClientRect();
        const offsetMain = this.main.getBoundingClientRect();
        const offset = {
            top: offsetOrigin.top - offsetMain.top,
            right: offsetMain.right - offsetOrigin.left,
        };
        document.addEventListener("stream-config", this.handleStreamConfig, {
            once: true,
        });
        if (
            this.streamConfig.classList.contains("active") &&
            e.detail.item.index !== this.streamConfig.item.index
        ) {
            this.streamConfig.addEventListener(
                "transitionend",
                () => {
                    requestAnimationFrame(() =>
                        this.streamConfig.toggle(e.detail.item, offset)
                    );
                },
                { once: true }
            );
        }
        this.streamConfig.toggle(e.detail.item, offset);
    }

    handleStreamConfig(e) {
        console.info("Stream configured: ", e.detail.item.transcodeConfig);
    }

    saveSettings() {
        Request.post(
            `/settings/${encodeURIComponent(this.item.path)}`,
            this.config
        );
    }

    get config() {
        const clipsData = [...this.clips.clips];
        if (clipsData[0].from === null) {
            clipsData[0].from = "0:0:0.0";
        }
        if (clipsData.length === 1 && clipsData[0].to === null) {
            clipsData[0].to = this.formatNode.duration;
        }
        const streams = this.streams
            .filter((s) => s.active)
            .map((s) => ({ id: s.index, config: s.transcodeConfig ?? {} }));

        return {
            streams,
            clips: clipsData,
        };
    }

    get clips() {
        return this.shadowRoot.querySelector("transcode-configurator-clips");
    }
}

const CSS = /*css*/ `
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
    inset: min(60px, var(--rel-gutter-500));
    background-color: var(--clr-bg-0);
    border-radius: var(--rel-gutter-100);
    padding: min(30px, var(--rel-gutter-200));
}
main > div {
    overflow-y: auto;
    height: calc(100% - 1.75rem - var(--rel-gutter-200) * 2);
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    height: 1em;
    width: 1em;
}
main div *:last-child {
    margin-bottom: 0;
}
footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: .5rem;
    padding: 0 1rem 1rem;
}
footer .icon-stack {
    font-size: var(--font-size-200);
    aspect-ratio: 1;
}
.status {
    position: absolute;
    inset: auto var(--rel-gutter-100) .5rem;
    height: auto;
    font-size: .75rem;
}
combo-button {
    min-width: 190px;
}
</style>
${ICON_STACK_CSS}
${COMBO_BUTTON_CSS}
`;

const HEADING = /*html*/ `
<h1>
    Transcode
    <div @click="{{ this.hide }}" class="icon-stack">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
</h1>
`;

TranscodeConfigurator.template = /*html*/ `
${CSS}
<main #ref="main">
    ${HEADING}
    <div>
        <transcode-configurator-format *if="{{ this.format }}" .format="{{ this.format }}" #ref="formatNode"></transcode-configurator-format>
        <transcode-configurator-streams *if="{{ this.streams }}" .items="{{ this.streams }}"></transcode-configurator-streams>
        <transcode-configurator-clips *if="{{ this.streams }}" .path="{{ this.item.path }}"></transcode-configurator-clips>
        <footer>
            <button @click="this.saveSettings()" class="icon-stack" title="Save Settings">
                <span class="iconify" data-icon="mdi-content-save-outline"></span>
                <span class="iconify hover" data-icon="mdi-content-save-outline"></span>
            </button>
            <combo-button @click="{{ this.requestRemux }}">
                <option value="mkv">Remux MKV</option>
                <option value="mp4">Remux MP4</option>
                <option value="ts">Remux TS</option>
            </combo-button>
            <theme-button @click="this.clipper()">Clipper</theme-button>
            <theme-button @click="this.requestCrop()">Crop</theme-button>
            <theme-button @click="this.requestScale()">Scale</theme-button>
            <theme-button *if="{{ this.canConcat }}" @click="this.requestConcat()">Concat</theme-button>
            <theme-button @click="this.transcode()">Transcode</theme-button>
        </footer>
    </div>
    <transcode-configurator-stream-config #ref="streamConfig"></transcode-configurator-stream-config>
    <div class="status">{{ this.out }}</div>
</main>
`;

customElements.define('transcode-configurator', TranscodeConfigurator);