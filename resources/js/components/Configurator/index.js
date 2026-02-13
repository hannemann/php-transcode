import { Iconify } from "@/components/lib";
import { Request } from "@/components/Request";
import { COMBO_BUTTON_CSS } from "@/components/partials";
import "./Streams";
import "./Clips";
import "./Format";
import "./FilterGraph";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import "./Dialogues/Scale";
import "./Dialogues/Concat";
import "./Dialogues/Clipper";
import "./Dialogues/Cropper";
import "./Dialogues/Delogo";
import "./Dialogues/RemoveLogo";
import "./Dialogues/Fillborders";
import { toolProxy } from "./Tools";
import { DomHelper } from "../../Helper/Dom";

const WS_CHANNEL = "Transcode.Config";
class TranscodeConfigurator extends HTMLElement {
    #format;
    #streams;
    #filterGraph;

    canConcat = false;
    remuxContainer = "MP4";

    connectedCallback() {
        this.initDom().initListeners().addListeners();
    }

    initDom() {
        const importNode = DomHelper.fromTemplate.call(this);
        this.main = importNode.querySelector("main");
        this.infoNode = importNode.querySelector(".info");
        this.streamsSection = this.infoNode.querySelector("section");
        this.streamConfig = importNode.querySelector(
            "transcode-configurator-stream-config",
        );
        DomHelper.appendShadow.call(this, importNode);
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
        return this;
    }

    initListeners() {
        document.addEventListener("file-clicked", this.init.bind(this));
        this.handleConfigureStream = this.handleConfigureStream.bind(this);
        this.handleConfigureStreamReady = this.handleStreamConfig.bind(this);
        this.handleClipsUpdated = this.handleClipsUpdated.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.toolProxy = toolProxy.bind(this);
        this.saveProxy = this.saveProxy.bind(this);
        this.hide = this.hide.bind(this);
        this.transcode = this.transcode.bind(this);
        return this;
    }

    addListeners() {
        this.shadowRoot
            .querySelector(".btn-hide")
            .addEventListener("click", this.hide);
        this.shadowRoot
            .querySelector(".btn-save")
            .addEventListener("click", this.saveProxy);
        this.shadowRoot
            .querySelector(".btn-tools")
            .addEventListener("click", this.toolProxy);
        this.shadowRoot
            .querySelector(".btn-tools")
            .addEventListener("change", this.toolProxy);
        this.shadowRoot
            .querySelector(".btn-transcode")
            .addEventListener("click", this.transcode);
        this.shadowRoot
            .querySelector(".btn-play")
            .addEventListener(
                "click",
                this.toolProxy.bind(this, { target: { value: "play:cpu" } }),
            );
        this.shadowRoot
            .querySelector(".btn-clipper")
            .addEventListener(
                "click",
                this.toolProxy.bind(this, { target: { value: "clip" } }),
            );
        return this;
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
            new CustomEvent("configurator-show", { detail: true }),
        );
        document.addEventListener(
            "stream-configure",
            this.handleConfigureStream,
        );
        document.addEventListener("clips-updated", this.handleClipsUpdated);
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
            { once: true },
        );
        this.classList.add("fade-out");
        this.leaveWebsocket();
        document.removeEventListener(
            "stream-configure",
            this.handleConfigureStream,
        );
        document.removeEventListener("clips-updated", this.handleClipsUpdated);
        document.removeEventListener(
            "stream-config",
            this.handleConfigureStreamReady,
        );
        document.dispatchEvent(
            new CustomEvent("configurator-show", { detail: false }),
        );
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL);
        this.channel.listen(
            WS_CHANNEL,
            this.handleConfiguratorEvent.bind(this),
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

    async transcode() {
        if (!this.clips.valid) {
            document.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        message: "Clip is invalid",
                        type: "warning",
                    },
                }),
            );
            return;
        }
        let confirm = null;
        this.config.streams.forEach((s) => {
            const stream = this.streams[s.id];
            const type = stream.codec_type;
            if (type === "video") {
                const defaultQp = this.videoCodecs[s.config.codec]?.qp || 0;
                if (defaultQp && defaultQp !== s.config.qp) {
                    confirm = {
                        header: "QP Mismatch",
                        message:
                            `Chosen QP ${s.config.qp} does not match` +
                            `default QP ${defaultQp}. Transcode anyway?`,
                    };
                }
            }
        });
        if (confirm) {
            const m = document.createElement("modal-confirm");
            m.header = confirm.header;
            m.content = confirm.message;
            document.body.appendChild(m);
            try {
                await m.confirm();
            } catch (error) {
                return;
            }
        }
        try {
            requestAnimationFrame(() => {
                console.info("Transcode %s", this.item.path, this.config);
                Request.post(
                    `/transcode/${encodeURIComponent(this.item.path)}`,
                    this.config,
                );
            });
        } catch (error) {}
    }

    handleConfiguratorEvent(ws) {
        console.info(ws);
        this.format = ws.format;
        this.streams = this.initTranscodeConfig(ws.streams, ws.clips);
        this.crop = ws.crop ?? {};
        this.removeLogo = ws.removeLogo ?? {};
        this.delogo = ws.delogo ?? {};
        this.fillborders = ws.fillborders ?? {};
        this.filterGraph = ws.filterGraph ?? [];
        this.chapters = ws.chapters ?? [];
        this.show();
    }

    initTranscodeConfig(streams, clips) {
        console.log("Initialize transcode config");
        const preferredAudioCodes =
            (clips?.length || 0) > 1
                ? PREFERRED_AUDIO_CODECS?.["multiClip"]
                : PREFERRED_AUDIO_CODECS?.["singleClip"];
        streams.forEach((stream) => {
            const type = stream.codec_type;
            const codecs = this.codecsMap.get(`${type}Codecs`);
            stream.transcodeConfig = stream.transcodeConfig || {};
            stream.transcodeConfig.codec =
                typeof stream.transcodeConfig?.codec !== "undefined"
                    ? stream.transcodeConfig.codec
                    : codecs.find((c) => c.default).v;
            switch (type) {
                case "video":
                    stream.transcodeConfig.qp =
                        typeof stream.transcodeConfig?.qp !== "undefined"
                            ? stream.transcodeConfig.qp
                            : codecs.find((c) => c.default).qp;
                    stream.transcodeConfig.aspectRatio =
                        stream.transcodeConfig.aspectRatio || "16:9";
                    break;
                case "audio":
                    if (!stream.transcodeConfig.manual) {
                        const preferredCodec =
                            AUDIO_CODECS[preferredAudioCodes?.[stream.channels]]
                                ?.v;
                        if ("undefined" !== typeof preferredCodec) {
                            stream.transcodeConfig.codec = preferredCodec;
                        }
                    }
                    stream.transcodeConfig.channels = stream.channels;
                    break;
                case "subtitle":
                    break;
            }
        });
        return streams;
    }

    handleClipsUpdated() {
        requestAnimationFrame(() => {
            const preferredAudioCodes =
                (this.clips.clips?.length || 0) > 1
                    ? PREFERRED_AUDIO_CODECS?.["multiClip"]
                    : PREFERRED_AUDIO_CODECS?.["singleClip"];
            this.streams = this.streams.map((stream) => {
                const type = stream.codec_type;
                switch (type) {
                    case "video":
                        break;
                    case "audio":
                        if (!stream.transcodeConfig.manual) {
                            const preferredCodec =
                                AUDIO_CODECS[
                                    preferredAudioCodes?.[stream.channels]
                                ]?.v;
                            if ("undefined" !== typeof preferredCodec) {
                                stream.transcodeConfig.codec = preferredCodec;
                            }
                        }
                        stream.transcodeConfig.channels = stream.channels;
                        break;
                    case "subtitle":
                        break;
                }
                return stream;
            });
            document.dispatchEvent(new CustomEvent("stream-config"));
        });
    }

    setCanConcat() {
        this.canConcat =
            this.item?.parent?.videoFiles?.length > 1 &&
            !this.item.parent.videoFiles.find(
                (i) => i.name === `${this.item.parent.channelHash}-concat.ts`,
            );

        this.shadowRoot
            .querySelectorAll('.btn-tools option[value^="concat"]')
            .forEach((o) => {
                o.style.display = this.canConcat ? "" : "none";
            });
    }

    handleConfigureStream(e) {
        console.log("Start stream config");
        const offsetOrigin = e.detail.origin.getBoundingClientRect();
        const offsetMain = this.main.getBoundingClientRect();
        const offset = {
            top: offsetOrigin.top - offsetMain.top,
            right: offsetMain.right - offsetOrigin.left,
        };
        document.addEventListener(
            "stream-config",
            this.handleConfigureStreamReady,
            {
                once: true,
            },
        );
        if (
            this.streamConfig.classList.contains("active") &&
            e.detail.item.index !== this.streamConfig.item.index
        ) {
            this.streamConfig.addEventListener(
                "transitionend",
                () => {
                    requestAnimationFrame(() =>
                        this.streamConfig.toggle(e.detail.item, offset),
                    );
                },
                { once: true },
            );
        }
        this.streamConfig.toggle(e.detail.item, offset);
    }

    handleStreamConfig(e) {
        console.info("Stream configured: ", e.detail.item.transcodeConfig);
    }

    saveProxy(e) {
        const args = e.target.value.split(":");
        this.saveSettings(args[1] === "template");
    }

    async saveSettings(asTemplate = false, skipUpdates = false) {
        await Request.post(`/settings/${encodeURIComponent(this.item.path)}`, {
            ...this.config,
            asTemplate,
        });

        if (skipUpdates) return;

        this.format = this.format;
        this.filterGraph = this.filterGraph;
        this.streams = this.streams;
    }

    get format() {
        return this.#format;
    }

    set format(value) {
        this.#format = value;
        const tagFormat = "transcode-configurator-format";
        const tagClips = "transcode-configurator-clips";
        this.streamsSection.querySelector(tagFormat)?.remove();
        this.infoNode.querySelector(tagClips)?.remove();

        if (this.format) {
            const formatNode = document.createElement(tagFormat);
            formatNode.format = this.format;
            this.streamsSection.append(formatNode);

            const clipsNode = document.createElement(tagClips);
            clipsNode.path = this.item.path;
            clipsNode.videoDuration = this.format.duration;
            this.infoNode.append(clipsNode);
        }
    }

    get streams() {
        return this.#streams;
    }

    set streams(value) {
        this.#streams = value;
        const tag = "transcode-configurator-streams";
        this.streamsSection.querySelector(tag)?.remove();

        if (this.streams) {
            const node = document.createElement(tag);
            node.items = this.streams;
            this.streamsSection.append(node);
        }
    }

    get filterGraph() {
        return this.#filterGraph;
    }

    set filterGraph(value) {
        this.#filterGraph = value;
        const tag = "transcode-configurator-filter-graph";
        this.streamsSection.querySelector(tag)?.remove();

        if (this.filterGraph.length) {
            const node = document.createElement(tag);
            node.configurator = this;
            this.streamsSection.append(node);
        }
    }

    get config() {
        let clipsData = [...this.clips.clips];
        if (clipsData.length === 1 && clipsData[0].from === null) {
            clipsData = [];
        }
        const streams = this.streams
            .filter((s) => s.active)
            .map((s) => ({ id: s.index, config: s.transcodeConfig ?? {} }));

        return {
            streams,
            clips: clipsData,
            crop: this.crop,
            removeLogo: this.removeLogo,
            delogo: this.delogo,
            filterGraph: this.filterGraph,
        };
    }

    get clips() {
        return this.shadowRoot.querySelector("transcode-configurator-clips");
    }

    get codecsMap() {
        const codecsMap = new Map();
        codecsMap.set(
            "videoCodecs",
            Object.values(VIDEO_CODECS).sort((a, b) => a.v > b.v),
        );
        codecsMap.set(
            "audioCodecs",
            Object.values(AUDIO_CODECS).sort((a, b) => a.v > b.v),
        );
        codecsMap.set(
            "subtitleCodecs",
            Object.values(SUBTITLE_CODECS).sort((a, b) => a.v > b.v),
        );
        return codecsMap;
    }

    get videoCodecs() {
        return this.codecsMap.get("videoCodecs");
    }

    get audioCodecs() {
        return this.codecsMap.get("videoCodecs");
    }

    get subtitleCodecs() {
        return this.codecsMap.get("videoCodecs");
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
    grid-template-areas: "data clips" "filterGraph .";
    grid-template-rows: repeat(2, min-content);
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

    transcode-configurator-format {
        order: 1;
    }

    transcode-configurator-streams {
        order: 2;
    }

    transcode-configurator-filter-graph {
        order: 3;
    }
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
    <div class="icon-stack btn-hide">
        <span class="iconify" data-icon="mdi-close"></span>
        <span class="iconify hover" data-icon="mdi-close"></span>
    </div>
</h1>
`;

TranscodeConfigurator.template = /*html*/ `
${CSS}
<main>
    ${HEADING}
    <div>
        <div class="info">
            <section></section>
        </div>
        <footer>
            <button class="icon-stack btn-play" title="Play">
                <span class="iconify" data-icon="mdi-play"></span>
                <span class="iconify hover" data-icon="mdi-play"></span>
            </button>
            <combo-button class="btn-save">
                <span class="icon-stack" slot="icon">
                    <span class="iconify" data-icon="mdi-content-save-outline"></span>
                    <span class="iconify hover" data-icon="mdi-content-save-outline"></span>
                </span>
                <option value="save:template">Save as Template</option>
                <option value="save:normal">Save</option>
            </combo-button>
            <combo-button class="btn-tools">
                <span class="icon-stack" slot="icon">
                    <span class="iconify" data-icon="mdi-tools"></span>
                    <span class="iconify hover" data-icon="mdi-tools"></span>
                </span>
                <option value="concat:mkv">Concat MKV</option>
                <option value="concat:mp4">Concat MP4</option>
                <option value="remux:mkv">Remux MKV</option>
                <option value="remux:mp4">Remux MP4</option>
                <option value="remux:ts">Remux TS</option>
                <option value="chapters_keep:cpu:instantOpen">Keep Chapters</option>
                <option value="deinterlace:cpu:instantOpen">Deinterlace</option>
                <option value="crop:cpu:instantOpen">Crop (CPU)</option>
                <option value="scale:cpu:instantOpen">Scale (CPU)</option>
                <option value="delogo:cpu:instantOpen">DeLogo</option>
                <option value="removelogo:cpu:instantOpen">RemoveLogo</option>
                <option value="fillborders:cpu:instantOpen">Fillborders</option>
            </combo-button>
            <theme-button class="btn-clipper">
                <span class="icon-stack" slot="icon">
                    <span class="iconify" data-icon="mdi-scissors"></span>
                    <span class="iconify hover" data-icon="mdi-scissors"></span>
                </span>
                Clipper
            </theme-button>
            <theme-button class="btn-transcode">
                <span class="icon-stack" slot="icon">
                    <span class="iconify" data-icon="mdi-motion-play-outline"></span>
                    <span class="iconify hover" data-icon="mdi-motion-play-outline"></span>
                </span>
                Transcode</theme-button>
        </footer>
    </div>
    <transcode-configurator-stream-config></transcode-configurator-stream-config>
</main>
`;

customElements.define("transcode-configurator", TranscodeConfigurator);
