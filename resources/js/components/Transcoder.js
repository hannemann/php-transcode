import { Slim } from "@/components/lib";
import "./FilePicker";
import "./Configurator";
import "./TextViewer";
import "./Request";
import "./Toast";
import "./Statusbar";

class Transcoder extends Slim {
    constructor() {
        super();
        this.backgroundRequests = 0;
    }

    onAdded() {
        let backgroundHandler = this.toggleBackground.bind(this);
        this.filePicker.channelHash = this.dataset.channel;
        document.addEventListener("loading", backgroundHandler);
        document.addEventListener("configurator-show", backgroundHandler);
        document.addEventListener("textviewer-show", backgroundHandler);
        document.addEventListener("modal-show", backgroundHandler);
        document.body.appendChild(document.createElement('transcoder-toast'));
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

Transcoder.template = /*html*/ `
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
    main, h1 {
        filter: blur(0);
        transition: var(--loading-transition);
    }
    h1 {
        user-select: none;
        grid-area: header;
    }
    main {
        padding: .2rem;
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
    <filepicker-root #ref="filePicker"></filepicker-root>
</main>
<transcode-configurator #ref="configurator"></transcode-configurator>
<text-viewer></text-viewer>
<status-bar .configurator="{{ this.configurator }}"></status-bar>
<transcoder-loading></transcoder-loading>
`;

customElements.define("ffmpeg-transcoder", Transcoder);
