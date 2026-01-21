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

- [x] remove slim from stream config and buttons
    - [x] Configurator/Streams/Buttons
    - [x] Configurator/Streams/Config/index
- [x] remove slim from textviewer
- [x] remove slim from toast
- [x] remove slim from clips
- [x] remove slim from clips/clip
- [x] remove slim from filter graph
- [x] remove slim from request loading
- [x] remove slim from modals
- [ ] remove slim from dialogues
        - [x] Scale
        - [x] Concat
        - [ ] Player
        - [ ] VideoEditor
            - [ ] Clipper
            - [ ] Cropper
            - [ ] Delogo
            - [ ] RemoveLogo
- [x] remove slim from statusbar
    - [x] index
    - [x] Items
        - [x] Current
        - [x] Done
        - [x] Failed
        - [x] Pending

*/
