import { DomHelper } from "../../../../Helper/Dom";
import { Iconify } from "@/components/lib";
import { VTime } from "../../../../Helper/Time";
import { handleKeyDown, handleKeyUp } from "./mixins/handleKey";
import ConfiguratorHelper from "../../../../Helper/Configurator";
import { Request } from "../../../Request";

const THUMBNAIL_HEIGHT = 30;

document.addEventListener("configurator-show", (e) => {
    VideoEditor.thumbs = [];
});

class VideoEditor extends HTMLElement {
    #markers = [];
    raw = [];
    static thumbs = [];

    constructor() {
        super();
        DomHelper.initDom.call(this);
    }

    connectedCallback() {
        this.parentNode.insertAdjacentHTML("beforeend", BUTTONS_TEMPLATE);
        this.bindListeners();
        this.fps =
            this.video.avg_frame_rate.split("/")[0] /
            this.video.avg_frame_rate.split("/")[1];
        this.start = parseFloat(this.video.start_time);
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        this.duration = new VTime(this.video.duration * 1000);
        this.modeMove = false;
        this.scrubSlider.step = 1000 / this.fps;
        requestAnimationFrame(() => {
            this.addListeners();
            this.initImages();
            this.aspectRatio =
                this.aspectRatio ||
                this.video.display_aspect_ratio ||
                `${this.video.width}:${this.video.height}`;
            Iconify.scan(this.shadowRoot);
        });
    }

    disconnectedCallback() {
        this.removeListeners();
    }

    bindListeners() {
        this.handleKeyDown = handleKeyDown.bind(this);
        this.handleKeyUp = handleKeyUp.bind(this);
        this.handleNavDown = this.handleNavDown.bind(this);
        this.handleNavUp = this.handleNavUp.bind(this);
        this.toggleAspect = this.toggleAspect.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
        this.handleIndicatorMove = this.handleIndicatorMove.bind(this);
        this.handleIndicatorLeave = this.handleIndicatorLeave.bind(this);
        this.setCurrentPosByMarker = this.setCurrentPosByMarker.bind(this);
        this.toggleMoveMode = this.toggleMoveMode.bind(this);
        this.handleScrubInput = this.handleScrubInput.bind(this);
        this.handleScrubRelease = this.handleScrubRelease.bind(this);

        this.prevFrame = this.handleNavDown.bind(this, { key: "ArrowLeft" });
        this.nextFrame = this.handleNavDown.bind(this, { key: "ArrowRight" });
        this.rew500 = this.handleNavDown.bind(this, {
            key: "ArrowLeft",
            duration: 500,
        });
        this.ffw500 = this.handleNavDown.bind(this, {
            key: "ArrowRight",
            duration: 500,
        });
        this.rew1000 = this.handleNavDown.bind(this, {
            key: "ArrowLeft",
            duration: 1000,
        });
        this.ffw1000 = this.handleNavDown.bind(this, {
            key: "ArrowRight",
            duration: 1000,
        });
        this.rew2000 = this.handleNavDown.bind(this, {
            key: "ArrowLeft",
            shiftKey: 1,
        });
        this.ffw2000 = this.handleNavDown.bind(this, {
            key: "ArrowRight",
            shiftKey: 1,
        });
        this.rew5000 = this.handleNavDown.bind(this, {
            key: "ArrowLeft",
            ctrlKey: 1,
        });
        this.ffw5000 = this.handleNavDown.bind(this, {
            key: "ArrowRight",
            ctrlKey: 1,
        });
        this.rew10000 = this.handleNavDown.bind(this, {
            key: "ArrowLeft",
            duration: 10000,
        });
        this.ffw10000 = this.handleNavDown.bind(this, {
            key: "ArrowRight",
            duration: 10000,
        });
        this.rew1m = this.handleNavDown.bind(this, {
            key: "ArrowDown",
        });
        this.ffw1m = this.handleNavDown.bind(this, {
            key: "ArrowUp",
        });
        this.rew5m = this.handleNavDown.bind(this, {
            key: "ArrowDown",
            shiftKey: 1,
        });
        this.ffw5m = this.handleNavDown.bind(this, {
            key: "ArrowUp",
            shiftKey: 1,
        });
        this.rew10m = this.handleNavDown.bind(this, {
            key: "ArrowDown",
            ctrlKey: 1,
        });
        this.ffw10m = this.handleNavDown.bind(this, {
            key: "ArrowUp",
            ctrlKey: 1,
        });
    }

    addListeners() {
        this.indicator.addEventListener("click", this.handleIndicatorClick);
        this.indicator.addEventListener(
            "pointermove",
            this.handleIndicatorMove,
        );
        this.indicator.addEventListener(
            "pointerleave",
            this.handleIndicatorLeave,
        );
        this.btnAspect.addEventListener("click", this.toggleAspect);
        this.btnMove.addEventListener("click", this.toggleMoveMode);

        this.btnPrevFrame.addEventListener("pointerdown", this.prevFrame);
        this.btnNextFrame.addEventListener("pointerdown", this.nextFrame);

        this.btnRew500.addEventListener("pointerdown", this.rew500);
        this.btnFfw500.addEventListener("pointerdown", this.ffw500);

        this.btnRew1000.addEventListener("pointerdown", this.rew1000);
        this.btnFfw1000.addEventListener("pointerdown", this.ffw1000);

        this.btnRew2000.addEventListener("pointerdown", this.rew2000);
        this.btnFfw2000.addEventListener("pointerdown", this.ffw2000);

        this.btnRew5000.addEventListener("pointerdown", this.rew5000);
        this.btnFfw5000.addEventListener("pointerdown", this.ffw5000);

        this.btnRew10000.addEventListener("pointerdown", this.rew10000);
        this.btnFfw10000.addEventListener("pointerdown", this.ffw10000);

        this.btnRew1m.addEventListener("pointerdown", this.rew1m);
        this.btnFfw1m.addEventListener("pointerdown", this.ffw1m);

        this.btnRew5m.addEventListener("pointerdown", this.rew5m);
        this.btnFfw5m.addEventListener("pointerdown", this.ffw5m);

        this.btnRew10m.addEventListener("pointerdown", this.rew10m);
        this.btnFfw10m.addEventListener("pointerdown", this.ffw10m);

        this.scrubSlider.addEventListener("input", this.handleScrubInput);
        this.scrubSlider.addEventListener("change", this.handleScrubRelease);
    }

    removeListeners() {
        this.indicator.removeEventListener("click", this.handleIndicatorClick);
        this.indicator.removeEventListener(
            "pointermove",
            this.handleIndicatorMove,
        );
        this.indicator.removeEventListener(
            "pointerleave",
            this.handleIndicatorLeave,
        );
        this.btnAspect.removeEventListener("click", this.toggleAspect);
        this.btnMove.removeEventListener("click", this.toggleMoveMode);

        this.btnPrevFrame.removeEventListener("pointerdown", this.prevFrame);
        this.btnNextFrame.removeEventListener("pointerdown", this.nextFrame);

        this.btnRew500.removeEventListener("pointerdown", this.rew500);
        this.btnFfw500.removeEventListener("pointerdown", this.ffw500);

        this.btnRew1000.removeEventListener("pointerdown", this.rew1000);
        this.btnFfw1000.removeEventListener("pointerdown", this.ffw1000);

        this.btnRew2000.removeEventListener("pointerdown", this.rew2000);
        this.btnFfw2000.removeEventListener("pointerdown", this.ffw2000);

        this.btnRew5000.removeEventListener("pointerdown", this.rew5000);
        this.btnFfw5000.removeEventListener("pointerdown", this.ffw5000);

        this.btnRew10000.removeEventListener("pointerdown", this.rew10000);
        this.btnFfw10000.removeEventListener("pointerdown", this.ffw10000);

        this.btnRew1m.removeEventListener("pointerdown", this.rew1m);
        this.btnFfw1m.removeEventListener("pointerdown", this.ffw1m);

        this.btnRew5m.removeEventListener("pointerdown", this.rew5m);
        this.btnFfw5m.removeEventListener("pointerdown", this.ffw5m);

        this.btnRew10m.removeEventListener("pointerdown", this.rew10m);
        this.btnFfw10m.removeEventListener("pointerdown", this.ffw10m);

        this.scrubSlider.removeEventListener("input", this.handleScrubInput);
        this.scrubSlider.removeEventListener("change", this.handleScrubRelease);

        this.indicator.querySelectorAll("markers").forEach((m) => {
            m.removeEventListener("click", this.setCurrentPosByMarker);
        });
    }

    initImages() {
        this.updateImages();
        requestAnimationFrame(() => {
            this.addThumbnails();
        });
    }

    updateImages() {
        this.updateFrameUrl();
        this.updateIndicatorPos();
        this.currentTimestamp = this.timestamp();
        this.currentTimestampCut = this.timestampCut();
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        this.timeDisplay.innerText =
            `${this.currentTimestamp} (${this.currentTimestampCut})` +
            ` / ${this.duration.coord}`;
    }

    updateIndicatorPos() {
        const percentage = (100 / this.duration) * this.current;
        this.indicatorCurrent.style.left = `min(${percentage}%, 100% - 1px`;
    }

    async addThumbnails() {
        let i = 1;
        const count = Math.floor(
            this.indicator.offsetWidth / (THUMBNAIL_HEIGHT * (4 / 3)),
        );

        if (!VideoEditor.thumbs.length) {
            console.time("Thumbnail generation: ");
            this.indicator.classList.remove("finished");
            const response = await Request.get(
                `/thumbnails/${encodeURIComponent(this.path)}/${this.duration.seconds}/${count}`,
            );
            VideoEditor.thumbs = await response.json();
            console.timeEnd("Thumbnail generation: ");
        }

        for (let thumb of VideoEditor.thumbs) {
            const img = document.createElement("img");
            img.src = `${thumb}?c=${performance.now()}`;
            this.indicator.appendChild(img);
        }
        this.indicator.classList.add("finished");
    }

    handleIndicatorClick(e) {
        if (!e.composedPath().find((p) => p.classList?.contains("clip"))) {
            const indicatorClickPos = parseInt(
                e.pageX - this.indicator.getBoundingClientRect().left,
            );
            this.current =
                (this.duration * indicatorClickPos) /
                this.indicator.offsetWidth;
            this.updateImages();
        }
    }

    handleIndicatorMove(e) {
        const indicatorClickPos = parseInt(
            e.pageX - this.indicator.getBoundingClientRect().left,
        );
        const ts = new VTime(
            (this.duration * indicatorClickPos) / this.indicator.offsetWidth,
        );
        const clips = this.clips || this.clipsConfig;
        this.timeDisplay.innerText =
            `${ts.coord} (${ts.getCutpoint(clips)})` +
            ` / ${this.duration.coord}`;
    }

    handleIndicatorLeave() {
        this.updateTimeDisplay();
    }

    timestamp(current) {
        return new VTime(current ?? this.current).coord;
    }

    timestampCut() {
        const clips = this.clips || this.clipsConfig;
        return VTime.calcCut(clips, this.current);
    }

    updateFrameUrl(cacheBuster = null) {
        const filterIndex = parseInt(this.filterIndex);
        const params = ["filtered=1"];
        if (!isNaN(filterIndex)) {
            params.push(`current_filter=${this.filterIndex}`);
        }
        if (this.aspectDecimal) {
            const dim = this.outputDimensions;
            params.push(`height=${dim.height}`);
            params.push(`width=${dim.width}`);
        }
        if (cacheBuster) {
            params.push(cacheBuster);
        }
        this.frameUrl = `${this.baseUrl}${this.timestamp()}&${params.join("&")}`;
    }

    toggleAspect() {
        switch (this.aspect) {
            case "16:9":
                this.aspect = "4:3";
                this.aspectDecimal = 4 / 3;
                break;
            case "4:3":
                this.aspect = "Native";
                this.aspectDecimal = 0;
                break;
            default:
                this.aspect = "16:9";
                this.aspectDecimal = 16 / 9;
        }
        this.updateImages();
    }

    getMarkerLeft(item) {
        const percentage = (100 / this.duration) * (item.start / 1000000);
        return `min(${percentage}%, 100% - 1px`;
    }

    setCurrentPosByMarker(e) {
        e.stopPropagation();
        this.current = e.currentTarget.dataset.start / 1000000;
        this.updateIndicatorPos();
        this.updateImages();
    }

    markersFromClips(clips) {
        const multiplier = 1000 * 1000;

        const markers = [...clips].reduce((acc, cur) => {
            if (cur.from && cur.to) {
                const from = new VTime(cur.from).milliseconds * multiplier;
                const to = new VTime(cur.to).milliseconds * multiplier;
                acc.push({ start: from });
                acc.push({ start: to });
            }
            return acc;
        }, []);

        return markers;
    }

    handleNavDown(e) {
        if (this.pInterval) return;
        document.addEventListener("pointerup", this.handleNavUp, {
            once: true,
        });
        this.pInterval = setInterval(() => {
            this.handleKeyDown(e.fromSlider ? this.buildSliderEvent() : e);
        }, 50);
    }

    handleNavUp() {
        this.handleKeyUp();
        if (!this.pInterval) return;
        clearInterval(this.pInterval);
        delete this.pInterval;
    }

    toggleMoveMode() {
        this.modeMove = !this.modeMove;
        if (this.modeMove) {
            this.btnMove.dataset.active = "";
        } else {
            delete this.btnMove.dataset.active;
        }
    }

    calcScrubDuration(value) {
        const maxDuration = 30000;
        const rate = 7;
        const t = Math.abs(value) / maxDuration;
        return Math.round(
            maxDuration * (Math.exp(rate * t) - 1) / (Math.exp(rate) - 1),
        );
    }

    buildSliderEvent() {
        const value = parseInt(this.scrubSlider.value);
        return {
            key: value >= 0 ? "ArrowRight" : "ArrowLeft",
            duration: this.calcScrubDuration(value),
        };
    }

    handleScrubInput() {
        this.handleNavDown({ fromSlider: true });
        this.updateScrubSpeed();
    }

    updateScrubSpeed() {
        const value = parseInt(this.scrubSlider.value);
        if (value === 0) {
            this.scrubSpeedLabel.innerText = "";
            return;
        }
        const duration = this.calcScrubDuration(value);
        if (duration < 1000) {
            const frames = Math.round((duration / 1000) * this.fps);
            this.scrubSpeedLabel.innerText = `\u00B1${frames}f`;
        } else {
            this.scrubSpeedLabel.innerText = `\u00B1${(duration / 1000).toFixed(1)}s`;
        }
    }

    handleScrubRelease() {
        this.scrubSlider.value = 0;
        this.scrubSpeedLabel.innerText = "";
    }

    get clipsConfig() {
        return ConfiguratorHelper.clips.clips;
    }

    get baseUrl() {
        return `/image/${encodeURIComponent(this.path)}?timestamp=`;
    }

    get baseThumbUrl() {
        return this.baseUrl;
    }

    get outputDimensions() {
        /**
         * @type {Array}
         */
        const filterGraph = document
            .querySelector("ffmpeg-transcoder")
            .shadowRoot.querySelector("transcode-configurator").filterGraph;
        const filterIndex = parseInt(this.filterIndex);
        const filter = filterGraph.findLast((f, idx) => {
            if (!isNaN(filterIndex) && idx >= filterIndex) return false;
            return ["scale", "crop", "pad"].includes(f.filterType);
        });
        const height = filter
            ? parseInt(filter.height || filter.ch)
            : this.video.coded_height;
        const width = filter
            ? Math.round(
                  this.aspectDecimal
                      ? height * this.aspectDecimal
                      : filter.width || filter.cw,
              )
            : this.video.coded_width;
        return {
            width,
            height,
        };
    }

    get aspectRatio() {
        return this.aspect;
    }

    set aspectRatio(value) {
        if (value.match(/([0-9]+):([0-9]+)/)) {
            this.aspect = value;
            this.aspectDecimal =
                parseInt(RegExp.$1, 10) / parseInt(RegExp.$2, 10);
            if (this.parentNode) {
                this.updateImages();
            }
        }
    }

    set markers(value) {
        const fromClips = "undefined" !== typeof value.clips;
        const markers = fromClips ? this.markersFromClips(value.clips) : value;
        this.#markers = markers;
        const nodes = markers.map((m) => {
            const node = document.createElement("div");
            node.classList.add("markers");
            node.addEventListener("click", this.setCurrentPosByMarker);
            node.style.left = this.getMarkerLeft(m);
            node.dataset.start = m.start;
            return node;
        });
        this.indicator.append(...nodes);
    }

    get markers() {
        return this.#markers;
    }

    set frameUrl(value) {
        this.image.src = value;
    }

    get image() {
        return this.shadowRoot.querySelector("img.frame");
    }

    get indicator() {
        return this.shadowRoot.querySelector(".indicator");
    }

    get indicatorCurrent() {
        return this.indicator.querySelector(".current");
    }

    set indicatorByTimestamp(value) {
        this.indicator
            .querySelectorAll(".by-timestamp")
            .forEach((i) => i.remove());
        if (isNaN(parseInt(value))) return;

        const node = this.indicatorCurrent.cloneNode(true);
        node.classList.add("by-timestamp");
        const percentage = (100 / this.duration) * (value * 1000);
        node.style.left = `min(${percentage}%, 100% - 1px`;
        node.style.right = "auto";
        node.style.width = "";
        this.indicator.appendChild(node);
    }

    set indicatorRangeByTimestamp({ from, to }) {
        this.indicatorByTimestamp = from;
        if (isNaN(parseInt(to))) return;
        const node = this.indicator.querySelector(".by-timestamp");
        const percentage = (100 / this.duration) * (to * 1000);
        node.style.right = `min(100% - ${percentage}%, 100% - 1px`;
        node.style.width = "auto";
        node.style.minWidth = "1px";
    }

    get btnMove() {
        return this.parentNode.querySelector(".nav-btns .move");
    }

    get btnAspect() {
        return this.shadowRoot.querySelector("theme-button.toggle-aspect");
    }

    set aspect(value) {
        this.btnAspect.innerText = value;
    }

    get aspect() {
        return this.btnAspect.innerText;
    }

    get btnPrevFrame() {
        return this.parentNode.querySelector(".nav-btns .prev-frame");
    }

    get btnNextFrame() {
        return this.parentNode.querySelector(".nav-btns .next-frame");
    }

    get btnRew500() {
        return this.parentNode.querySelector(".nav-btns .rew-500");
    }

    get btnFfw500() {
        return this.parentNode.querySelector(".nav-btns .ffw-500");
    }

    get btnRew1000() {
        return this.parentNode.querySelector(".nav-btns .rew-1000");
    }

    get btnFfw1000() {
        return this.parentNode.querySelector(".nav-btns .ffw-1000");
    }

    get btnRew2000() {
        return this.parentNode.querySelector(".nav-btns .rew-2000");
    }

    get btnFfw2000() {
        return this.parentNode.querySelector(".nav-btns .ffw-2000");
    }

    get btnRew5000() {
        return this.parentNode.querySelector(".nav-btns .rew-5000");
    }

    get btnFfw5000() {
        return this.parentNode.querySelector(".nav-btns .ffw-5000");
    }

    get btnRew10000() {
        return this.parentNode.querySelector(".nav-btns .rew-10000");
    }

    get btnFfw10000() {
        return this.parentNode.querySelector(".nav-btns .ffw-10000");
    }

    get btnAdd() {
        return this.parentNode.querySelector(".nav-btns .btn-add");
    }

    get btnRemove() {
        return this.parentNode.querySelector(".nav-btns .btn-remove");
    }

    get btnRew1m() {
        return this.parentNode.querySelector(".nav-btns .rew-1m");
    }

    get btnFfw1m() {
        return this.parentNode.querySelector(".nav-btns .ffw-1m");
    }

    get btnRew5m() {
        return this.parentNode.querySelector(".nav-btns .rew-5m");
    }

    get btnFfw5m() {
        return this.parentNode.querySelector(".nav-btns .ffw-5m");
    }

    get btnRew10m() {
        return this.parentNode.querySelector(".nav-btns .rew-10m");
    }

    get btnFfw10m() {
        return this.parentNode.querySelector(".nav-btns .ffw-10m");
    }

    get timeDisplay() {
        return this.parentNode.querySelector(".status .time span");
    }

    get scrubSlider() {
        return this.parentNode.querySelector(".scrub-slider");
    }

    get scrubSpeedLabel() {
        return this.parentNode.querySelector(".scrub-speed");
    }
}

export const EDITOR_CSS = css`
    :host {
        --thumbnail-height: ${THUMBNAIL_HEIGHT + 16}px;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-rows:
            calc(
                100% - var(--thumbnail-height) - var(--font-size-100) *
                    var(--line-height-100)
            )
            min-content max-content;
        grid-template-areas:
            "left frame right"
            "thumbnails thumbnails thumbnails";
        grid-column-gap: 0.5rem;
        height: 100%;
    }

    .frame {
        grid-area: frame;
        max-width: 100%;
        max-height: 100%;
        justify-self: center;
    }
    .move {
        color: var(--clr-text-100);
        transition-property: text-shadow, color;
        transition-timing-function: ease-out;
        transition-duration: var(--transition-medium);
    }
    .move[data-active] {
        color: var(--clr-enlightened);
        text-shadow:
            0 0 5px var(--clr-enlightened-glow),
            0 0 10px var(--clr-enlightened-glow);
    }
    .indicator {
        grid-area: thumbnails;
        height: var(--thumbnail-height);
        width: 100%;
        max-width: 100rem;
        justify-self: center;
        position: relative;
        --background: var(--clr-bg-200);
        --size: 3px;
        background-image:
            linear-gradient(
                to right,
                var(--background) var(--size),
                transparent var(--size)
            ),
            linear-gradient(
                to bottom,
                var(--background) var(--size),
                transparent var(--size)
            ),
            linear-gradient(
                to right,
                var(--background) var(--size),
                transparent var(--size)
            ),
            linear-gradient(
                to bottom,
                var(--background) var(--size),
                transparent var(--size)
            ),
            linear-gradient(
                to bottom,
                transparent var(--size),
                var(--background) var(--size)
            );
        background-size:
            calc(var(--size) * 2) var(--size),
            calc(var(--size) * 2) var(--size),
            calc(var(--size) * 2) var(--size),
            calc(var(--size) * 2) var(--size),
            100% calc(100% - var(--size) * 3);
        background-repeat: repeat-x;
        background-position:
            0 var(--size),
            top left,
            0 calc(100% - var(--size)),
            bottom left,
            0 var(--size);
        display: grid;
        grid-auto-flow: column;
        align-content: center;
        justify-items: center;
        z-index: 0;

        animation: breathing-pulse 1.5s infinite alternate ease-in-out;

        &.finished {
            animation: none;
            opacity: 1;
            transform: scale(1);
        }
    }
    .indicator img {
        max-width: 100%;
        max-height: 100%;
        z-index: 0;
    }
    .indicator .current,
    .indicator .by-timestamp {
        position: absolute;
        inset-block: -3px;
        background: red;
        width: 1px;
        z-index: 2;
    }
    .indicator .by-timestamp {
        background: hsla(180deg 100% 50% / 0.5);
    }
    .toggle-aspect {
        grid-area: frame;
        justify-self: start;
        align-self: start;
    }
    .toggle-aspect::part(button) {
        font-size: 0.75rem;
        padding: 0.5rem;
    }
    .markers {
        position: absolute;
        bottom: -15px;
        height: 15px;
        aspect-ratio: 1;
        display: grid;
        place-items: start;
        cursor: pointer;

        &::after {
            display: block;
            content: "";
            background-color: white;
            height: 100%;
            width: 1px;
        }
    }

    @keyframes breathing-pulse {
        0% {
            transform: scale(0.99);
            opacity: 0.7;
        }
        50% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0.99);
            opacity: 0.7;
        }
    }
`;

export const EDITOR_TEMPLATE = html` <img class="frame" />
    <theme-button class="toggle-aspect"></theme-button>
    <div class="indicator">
        <div class="current"></div>
    </div>`;

const BUTTONS_CSS = css`
    div[slot="footer-content"] {
        display: grid;
        gap: 0.25rem;
        justify-content: center;

        .status {
            display: flex;
            justify-content: center;
        }

        .nav-btns {
            display: flex;
            gap: 1rem;

            > div {
                display: flex;
                gap: 0.5rem;
                align-items: center;

                &.vert {
                    display: grid;
                    grid-auto-flow: column;
                    grid-auto-columns: 1fr;
                    grid-template-rows: repeat(2, 1fr);
                }

                > div {
                    user-select: none;
                    min-width: 1rem;
                    height: fit-content;
                    text-align: center;
                    padding: 0.125rem;
                    cursor: pointer;
                    background: var(--clr-bg-100);
                    color: var(--clr-text-100);
                    border: 2px solid var(--clr-bg-200);
                    transition-property:
                        text-shadow, box-shadow, border-color, background-color;
                    transition-timing-function: ease-out;
                    transition-duration: var(--transition-medium);

                    &:hover,
                    &.move[data-active] {
                        background: var(--clr-bg-200);
                        color: var(--clr-enlightened);
                        text-shadow:
                            0 0 5px var(--clr-enlightened-glow),
                            0 0 10px var(--clr-enlightened-glow);
                        border-color: var(--clr-enlightened);
                        box-shadow:
                            0 0 20px 0 var(--clr-enlightened-glow),
                            0 0 10px 0 inset var(--clr-enlightened-glow);
                    }
                }

                &.clipper-only {
                    display: none;
                }
            }
        }

        .scrub-row {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            justify-content: center;
        }

        .scrub-label {
            font-size: 0.75rem;
            color: var(--clr-text-200);
            min-width: 2.5ch;
            text-align: center;
        }

        .scrub-slider {
            height: 6px;
            background: var(--clr-bg-200);
            border-radius: 3px;
            outline: none;
            cursor: pointer;
            flex: 1;
            max-width: 60rem;
        }

        .scrub-speed {
            font-size: 0.75rem;
            color: var(--clr-text-200);
            min-width: 6ch;
            text-align: center;
            font-variant-numeric: tabular-nums;
        }
    }
`;
let BUTTONS_TEMPLATE = html`<div slot="footer-content">
    <style>
        ${BUTTONS_CSS}
    </style>
    <div class="status">
        <div class="time">
            <span></span>
        </div>
    </div>
    <div class="nav-btns">
        <div class="clipper-only">
            <div class="nav move">Move Marker</div>
        </div>
        <div class="clipper-only vert">
            <div class="btn-add">+</div>
            <div class="btn-remove">-</div>
        </div>
        <div class="vert">
            <div class="nav prev-frame">-1f</div>
            <div class="nav next-frame">+1f</div>
        </div>
        <div class="vert">
            <div class="nav rew-500">-0.5s</div>
            <div class="nav ffw-500">+0.5s</div>
            <div class="nav rew-1000">-1s</div>
            <div class="nav ffw-1000">+1s</div>
            <div class="nav rew-2000">-2s</div>
            <div class="nav ffw-2000">+2s</div>
            <div class="nav rew-5000">-5s</div>
            <div class="nav ffw-5000">+5s</div>
            <div class="nav rew-10000">-10s</div>
            <div class="nav ffw-10000">+10s</div>
        </div>
        <div class="vert">
            <div class="nav rew-1m">-1m</div>
            <div class="nav ffw-1m">+1m</div>
            <div class="nav rew-5m">-5m</div>
            <div class="nav ffw-5m">+5m</div>
            <div class="nav rew-10m">-10m</div>
            <div class="nav ffw-10m">+10m</div>
        </div>
    </div>
    <datalist id="scrub-marks">
        <option value="-30000" label="-30s"></option>
        <option value="-20000" label="-20s"></option>
        <option value="-10000" label="-10s"></option>
        <option value="0" label="0"></option>
        <option value="10000" label="10s"></option>
        <option value="20000" label="20s"></option>
        <option value="30000" label="30s"></option>
    </datalist>
    <div class="scrub-row">
        <span class="scrub-label">-30s</span>
        <input
            type="range"
            class="scrub-slider"
            min="-30000"
            max="30000"
            value="0"
            list="scrub-marks"
        />
        <span class="scrub-label">+30s</span>
        <span class="scrub-speed"></span>
    </div>
</div>`;

export { VideoEditor };
