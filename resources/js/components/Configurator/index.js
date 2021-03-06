import { Slim, Iconify } from '@/components/lib';
import {Request} from '@/components/Request'
import { COMBO_BUTTON_CSS } from '@/components//partials';
import './Streams'
import './Clips'
import './Format'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import "./Dialogues/Scale";
import "./Dialogues/Concat";
import "./Dialogues/Clipper";
import "./Dialogues/Cropper";
import "./Dialogues/Delogo";
import "./Dialogues/RemoveLogo";
import { toolProxy } from "./Tools";

const WS_CHANNEL = "Transcode.Config";
class TranscodeConfigurator extends Slim {
    onAdded() {
        this.canConcat = false;
        document.addEventListener("file-clicked", this.init.bind(this));
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
        this.remuxContainer = "MP4";
        this.handleConfigureStream = this.handleConfigureStream.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.toolProxy = toolProxy.bind(this);
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
        this.channel.subscribed(this.requestStreams.bind(this));
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL);
        window.Echo.leave(WS_CHANNEL);
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
        this.crop = ws.crop ?? {};
        this.show();
    }

    setCanConcat() {
        this.canConcat =
            this.item?.parent?.videoFiles?.length > 1 &&
            !this.item.parent.videoFiles.find(
                (i) => i.name === `${this.item.parent.channelHash}-concat.ts`
            );
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
            crop: this.crop,
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
    inset: var(--window-inset);
    background-color: var(--clr-bg-0);
    border-radius: var(--window-border-radius);
    padding: min(30px, var(--rel-gutter-200));
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
main > div {
    height: calc(100% - 1.75rem * 2);
    gap: 1rem;
    display: grid;
    grid-template-areas: "info" "footer";
    grid-template-rows: auto min-content;
}
.info {
    grid-area: info;
    display: grid;
    grid-template-areas: "data clips";
    gap: 1rem;
    overflow-y: auto;
}
@media (max-width: 640px) {
    .info {
        grid-template-areas: "data" "clips";
    }
}
.info section {
    grid-area: data;
    display: grid;
    gap: 1rem;
    grid-auto-rows: min-content;
}
.info transcode-configurator-clips {
    grid-area: clips;
}
footer {
    grid-area: footer;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: .5rem;
    padding: 0 1rem;
}
footer .icon-stack {
    font-size: var(--font-size-200);
    aspect-ratio: 1;
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
        <div class="info">
            <section>
                <transcode-configurator-format *if="{{ this.format }}" .format="{{ this.format }}" #ref="formatNode"></transcode-configurator-format>
                <transcode-configurator-streams *if="{{ this.streams }}" .items="{{ this.streams }}"></transcode-configurator-streams>
            </section>
            <transcode-configurator-clips *if="{{ this.streams }}" .path="{{ this.item.path }}"></transcode-configurator-clips>
        </div>
        <footer>
            <button @click="this.saveSettings()" class="icon-stack" title="Save Settings">
                <span class="iconify" data-icon="mdi-content-save-outline"></span>
                <span class="iconify hover" data-icon="mdi-content-save-outline"></span>
            </button>
            <button @click="this.toolProxy({target:{value:'play:cpu'}})" class="icon-stack" title="Play">
                <span class="iconify" data-icon="mdi-play"></span>
                <span class="iconify hover" data-icon="mdi-play"></span>
            </button>
            <combo-button @click="{{ this.toolProxy }}">
                <option *if="{{ this.canConcat }}" value="concat:mkv">Concat MKV</option>
                <option *if="{{ this.canConcat }}" value="concat:mp4">Concat MP4</option>
                <option value="scale:cpu">Scale (CPU)</option>
                <option value="remux:mkv">Remux MKV</option>
                <option value="remux:mp4">Remux MP4</option>
                <option value="remux:ts">Remux TS</option>
                <option value="crop:cpu">Crop (CPU)</option>
                <option value="delogo:cpu">DeLogo (CPU)</option>
                <option value="removelogo:cpu">RemoveLogo (CPU)</option>
            </combo-button>
            <theme-button @click="this.toolProxy({target:{value:'clip'}})">Clipper</theme-button>
            <theme-button @click="this.transcode()">Transcode</theme-button>
        </footer>
    </div>
    <transcode-configurator-stream-config #ref="streamConfig"></transcode-configurator-stream-config>
</main>
`;

customElements.define('transcode-configurator', TranscodeConfigurator);