import "./FilePicker";
import "./Configurator";
import "./TextViewer";
import "./Request";
import "./Toast";
import "./Statusbar";

import { DomHelper } from "../Helper/Dom";

class Transcoder extends HTMLElement {
    backgroundRequests = 0;

    connectedCallback() {
        this.initDom();
        this.addListeners();
    }

    disconnectedCallback() {
        this.removeListeners();
    }

    initDom() {
        const importedNode = DomHelper.fromTemplate.call(this);
        this.filePicker = importedNode.querySelector("filepicker-root");
        this.filePicker.channelHash = this.dataset.channel;
        this.configurator = importedNode.querySelector(
            "transcode-configurator",
        );
        importedNode.querySelector("status-bar").configurator =
            this.configurator;
        document.body.appendChild(document.createElement("transcoder-toast"));
        DomHelper.appendShadow.call(this, importedNode);
    }

    addListeners() {
        document.addEventListener("loading", this);
        document.addEventListener("configurator-show", this);
        document.addEventListener("textviewer-show", this);
        document.addEventListener("modal-show", this);
    }

    removeListeners() {
        document.removeEventListener("loading", this);
        document.removeEventListener("configurator-show", this);
        document.removeEventListener("textviewer-show", this);
        document.removeEventListener("modal-show", this);
    }

    handleEvent(e) {
        this.toggleBackground(e);
    }

    toggleBackground(e) {
        if (e.detail) {
            this.classList.add("background");
            document.body.style.overflow = "hidden";
            this.backgroundRequests++;
        } else {
            this.backgroundRequests--;
        }
        if (!this.backgroundRequests) {
            document.body.style.overflow = "";
            this.classList.remove("background");
        }
    }

    selectChange(e) {
        console.log("Change: ", e.target.value);
    }
    selectClick(e) {
        console.log("Action: ", e.target.value);
    }
    getNode() {
        return this;
    }
}

Transcoder.template = html`
    <style>
        :host {
            height: 100%;
            display: grid;
            grid-template-rows: 5rem calc(100vh - 7rem) var(--statusbar-height);
            grid-template-areas: "header" "filepicker" "status";
        }
        :host(.background) h1,
        :host(.background) main {
            filter: blur(3px);
        }
        main,
        h1 {
            filter: blur(0);
            transition: var(--loading-transition);
        }
        h1 {
            user-select: none;
            grid-area: header;
        }
        main {
            padding: 0.2rem;
            grid-area: filepicker;
            overflow: hidden;
            align-self: stretch;
        }
        filepicker-root {
            height: 100%;
        }
        status-bar {
            grid-area: status;
        }
    </style>
    <h1>PVR Toolbox</h1>
    <main>
        <filepicker-root></filepicker-root>
    </main>
    <transcode-configurator></transcode-configurator>
    <text-viewer></text-viewer>
    <status-bar></status-bar>
    <transcoder-loading></transcoder-loading>
`;

customElements.define("ffmpeg-transcoder", Transcoder);

/*

TODO:

- metadata of streams (is standard, language, ...)
- sorting of streams
- add save btn to removelogo ui and disable show filtered btn until saved
- transcode editor images to see result before encoding

- Audio Analyse:

ffprobe -hide_banner -v error -read_intervals 00:02:20.620%+1 -i "Die-Maske-des-Zorro-(1998).mkv" -select_streams a:0 -show_frames -show_entries frame=pts_time,channels,channel_layout -of json
ffprobe -hide_banner -v error -read_intervals 02:07:27.441%+1 -i "Die-Maske-des-Zorro-(1998).mkv" -select_streams a:0 -show_frames -show_entries frame=pts_time,channels,channel_layout -of json

- Werbe Detektor:

ffprobe -v error -i Spider-Man_-Across-the-Spider-Verse-\(2023\).mkv   -select_streams a:0 -show_frames   -show_entries frame=pts_time,channel_layout   -of json |   jq '.frames | reduce .[] as $item ([]; 
    if length == 0 or .[-1].channel_layout != $item.channel_layout 
    then . + [$item] 
    else . 
    end)'

*/
