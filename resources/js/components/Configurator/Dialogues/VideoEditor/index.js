import { DomHelper } from "../../../../Helper/Dom";
import { Iconify } from "@/components/lib";
import { Time } from "../../../../Helper/Time";
import { handleKeyDown, handleKeyUp } from "./mixins/handleKey";
import ConfiguratorHelper from "../../../../Helper/Configurator";

const THUMBNAIL_HEIGHT = 30;

class VideoEditor extends HTMLElement {
    #markers = [];
    raw = [];
    clipsConfig = ConfiguratorHelper.clips.clips;

    constructor() {
        super();
        DomHelper.initDom.call(this);
    }

    connectedCallback() {
        this.bindListeners();
        this.fps =
            this.video.avg_frame_rate.split("/")[0] /
            this.video.avg_frame_rate.split("/")[1];
        this.start = parseFloat(this.video.start_time);
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        this.duration = this.video.duration * 1000;
        this.modeMove = false;
        requestAnimationFrame(() => {
            this.addListeners();
            this.initImages();
            this.aspectRatio = this.video.display_aspect_ratio;
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
        this.setCurrentPosByMarker = this.setCurrentPosByMarker.bind(this);
        this.toggleMoveMode = this.toggleMoveMode.bind(this);

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
        this.btnAspect.addEventListener("click", this.toggleAspect);
        this.btnMove.addEventListener("click", this.toggleMoveMode);

        this.btnPrevFrame.addEventListener("pointerdown", this.prevFrame);
        this.btnPrevFrame.addEventListener("pointerup", this.handleNavUp);
        this.btnNextFrame.addEventListener("pointerdown", this.nextFrame);
        this.btnNextFrame.addEventListener("pointerup", this.handleNavUp);

        this.btnRew500.addEventListener("pointerdown", this.rew500);
        this.btnRew500.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw500.addEventListener("pointerdown", this.ffw500);
        this.btnFfw500.addEventListener("pointerup", this.handleNavUp);

        this.btnRew1000.addEventListener("pointerdown", this.rew1000);
        this.btnRew1000.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw1000.addEventListener("pointerdown", this.ffw1000);
        this.btnFfw1000.addEventListener("pointerup", this.handleNavUp);

        this.btnRew2000.addEventListener("pointerdown", this.rew2000);
        this.btnRew2000.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw2000.addEventListener("pointerdown", this.ffw2000);
        this.btnFfw2000.addEventListener("pointerup", this.handleNavUp);

        this.btnRew5000.addEventListener("pointerdown", this.rew5000);
        this.btnRew5000.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw5000.addEventListener("pointerdown", this.ffw5000);
        this.btnFfw5000.addEventListener("pointerup", this.handleNavUp);

        this.btnRew1m.addEventListener("pointerdown", this.rew1m);
        this.btnRew1m.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw1m.addEventListener("pointerdown", this.ffw1m);
        this.btnFfw1m.addEventListener("pointerup", this.handleNavUp);

        this.btnRew5m.addEventListener("pointerdown", this.rew5m);
        this.btnRew5m.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw5m.addEventListener("pointerdown", this.ffw5m);
        this.btnFfw5m.addEventListener("pointerup", this.handleNavUp);

        this.btnRew10m.addEventListener("pointerdown", this.rew10m);
        this.btnRew10m.addEventListener("pointerup", this.handleNavUp);
        this.btnFfw10m.addEventListener("pointerdown", this.ffw10m);
        this.btnFfw10m.addEventListener("pointerup", this.handleNavUp);
    }

    removeListeners() {
        this.indicator.removeEventListener("click", this.handleIndicatorClick);
        this.btnAspect.removeEventListener("click", this.toggleAspect);
        this.btnMove.removeEventListener("click", this.toggleMoveMode);

        this.btnPrevFrame.removeEventListener("pointerdown", this.prevFrame);
        this.btnPrevFrame.removeEventListener("pointerup", this.handleNavUp);
        this.btnNextFrame.removeEventListener("pointerdown", this.nextFrame);
        this.btnNextFrame.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew500.removeEventListener("pointerdown", this.rew500);
        this.btnRew500.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw500.removeEventListener("pointerdown", this.ffw500);
        this.btnFfw500.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew1000.removeEventListener("pointerdown", this.rew1000);
        this.btnRew1000.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw1000.removeEventListener("pointerdown", this.ffw1000);
        this.btnFfw1000.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew2000.removeEventListener("pointerdown", this.rew2000);
        this.btnRew2000.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw2000.removeEventListener("pointerdown", this.ffw2000);
        this.btnFfw2000.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew5000.removeEventListener("pointerdown", this.rew5000);
        this.btnRew5000.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw5000.removeEventListener("pointerdown", this.ffw5000);
        this.btnFfw5000.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew1m.removeEventListener("pointerdown", this.rew1m);
        this.btnRew1m.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw1m.removeEventListener("pointerdown", this.ffw1m);
        this.btnFfw1m.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew5m.removeEventListener("pointerdown", this.rew5m);
        this.btnRew5m.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw5m.removeEventListener("pointerdown", this.ffw5m);
        this.btnFfw5m.removeEventListener("pointerup", this.handleNavUp);

        this.btnRew10m.removeEventListener("pointerdown", this.rew10m);
        this.btnRew10m.removeEventListener("pointerup", this.handleNavUp);
        this.btnFfw10m.removeEventListener("pointerdown", this.ffw10m);
        this.btnFfw10m.removeEventListener("pointerup", this.handleNavUp);

        this.indicator.querySelectorAll("markers").forEach((m) => {
            m.removeEventListener("click", this.setCurrentPosByMarker);
        });
    }

    initImages() {
        this.addThumbnails();
        this.updateImages();
    }

    updateImages() {
        this.updateFrameUrl();
        this.updateIndicatorPos();
        this.currentTimestamp = this.timestamp();
        this.currentTimestampCut = this.timestampCut();

        this.timeDisplay.innerText = `${this.timestamp()} (${this.currentTimestampCut}) / ${this.timestamp(this.duration)}`;
    }

    updateIndicatorPos() {
        const percentage = (100 / this.duration) * this.current;
        this.indicatorCurrent.style.left = `min(${percentage}%, 100% - 1px`;
    }

    addThumbnails() {
        let i = 1;
        const count = Math.floor(
            this.indicator.offsetWidth / (THUMBNAIL_HEIGHT * (4 / 3)),
        );
        const fr = this.duration / (count + 2);
        do {
            const img = document.createElement("img");
            const timestamp = this.timestamp(fr * i);
            img.src = `${this.baseThumbUrl}${timestamp}&width=${THUMBNAIL_HEIGHT * (4 / 3)}&height=${THUMBNAIL_HEIGHT}`;
            this.indicator.appendChild(img);
        } while (i++ <= count);
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

    timestamp(current) {
        return Time.fromMilliSeconds(current ?? this.current);
    }

    timestampCut() {
        const clips = this.clips || this.clipsConfig;
        return Time.calculateCutTimestamp(clips, this.current);
    }

    updateFrameUrl() {
        const filterIndex = parseInt(this.filterIndex);
        const params = ["filtered=1"];
        if (!isNaN(filterIndex)) {
            params.push(`current_filter=${this.filterIndex}`);
        }
        if (this.aspectDecimal) {
            const filterGraph = document
                .querySelector("ffmpeg-transcoder")
                .shadowRoot.querySelector("transcode-configurator").filterGraph;
            const scaleFilter = filterGraph.find((f, idx) => {
                if (!isNaN(filterIndex) && idx > filterIndex) return false;
                return f.filterType === "scale";
            });
            const height = scaleFilter
                ? parseInt(scaleFilter.height)
                : this.video.coded_height;
            const width = height * this.aspectDecimal;
            params.push(`height=${height}`);
            params.push(`width=${width}`);
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
                acc.push({ start: Time.milliSeconds(cur.from) * multiplier });
                acc.push({ start: Time.milliSeconds(cur.to) * multiplier });
            }
            return acc;
        }, []);

        return markers;
    }

    handleNavDown(e) {
        this.pInterval = setInterval(() => this.handleKeyDown(e), 50);
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

    get baseUrl() {
        return `/image/${encodeURIComponent(this.path)}?timestamp=`;
    }

    get baseThumbUrl() {
        return this.baseUrl;
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

    get btnMove() {
        return this.shadowRoot.querySelector(".status .nav.move");
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
        return this.shadowRoot.querySelector(".prev-frame");
    }

    get btnNextFrame() {
        return this.shadowRoot.querySelector(".next-frame");
    }

    get btnRew500() {
        return this.shadowRoot.querySelector(".rew-500");
    }

    get btnFfw500() {
        return this.shadowRoot.querySelector(".ffw-500");
    }

    get btnRew1000() {
        return this.shadowRoot.querySelector(".rew-1000");
    }

    get btnFfw1000() {
        return this.shadowRoot.querySelector(".ffw-1000");
    }

    get btnRew2000() {
        return this.shadowRoot.querySelector(".rew-2000");
    }

    get btnFfw2000() {
        return this.shadowRoot.querySelector(".ffw-2000");
    }

    get btnRew5000() {
        return this.shadowRoot.querySelector(".rew-5000");
    }

    get btnFfw5000() {
        return this.shadowRoot.querySelector(".ffw-5000");
    }

    get btnAdd() {
        return this.shadowRoot.querySelector(".btn-add");
    }

    get btnRemove() {
        return this.shadowRoot.querySelector(".btn-remove");
    }

    get btnRew1m() {
        return this.shadowRoot.querySelector(".rew-1m");
    }

    get btnFfw1m() {
        return this.shadowRoot.querySelector(".ffw-1m");
    }

    get btnRew5m() {
        return this.shadowRoot.querySelector(".rew-5m");
    }

    get btnFfw5m() {
        return this.shadowRoot.querySelector(".ffw-5m");
    }

    get btnRew10m() {
        return this.shadowRoot.querySelector(".rew-10m");
    }

    get btnFfw10m() {
        return this.shadowRoot.querySelector(".ffw-10m");
    }

    get timeDisplay() {
        return this.shadowRoot.querySelector(".time span");
    }
}

export const EDITOR_CSS = html`<style>
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
            "status status status"
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
    .status {
        grid-area: status;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
        max-width: 100rem;
        justify-self: center;

        .time {
            display: flex;
            justify-content: space-between;
            gap: 1rem;

            div {
                cursor: pointer;

                &.btn-add,
                &.btn-remove {
                    display: none;
                }
            }
        }

        div {
            justify-self: start;

            &.time {
                justify-self: center;
            }
        }

        div:has(.nav) {
            display: flex;
            gap: 0.5rem;
            .nav {
                cursor: pointer;
                user-select: none;

                &.move {
                    display: none;
                }
            }

            &:not(:first-child) {
                justify-self: end;
            }
        }
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
    }
    .indicator img {
        max-width: 100%;
        max-height: 100%;
        z-index: 0;
    }
    .indicator .current {
        position: absolute;
        inset-block: -3px;
        background: red;
        width: 1px;
        z-index: 2;
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
</style>`;

export const EDITOR_TEMPLATE = html` <img class="frame" />
    <theme-button class="toggle-aspect"></theme-button>
    <div class="status">
        <div>
            <div class="nav move">Move Marker</div>
            <div class="nav prev-frame">-1f</div>
            <div class="nav next-frame">+1f</div>
            <div class="nav rew-500">-0.5s</div>
            <div class="nav ffw-500">+0.5s</div>
            <div class="nav rew-1000">-1s</div>
            <div class="nav ffw-1000">+1s</div>
            <div class="nav rew-2000">-2s</div>
            <div class="nav ffw-2000">+2s</div>
            <div class="nav rew-5000">-5s</div>
            <div class="nav ffw-5000">+5s</div>
        </div>
        <div class="time">
            <div class="btn-add">+</div>
            <span></span>
            <div class="btn-remove">-</div>
        </div>
        <div>
            <div class="nav rew-1m">-1m</div>
            <div class="nav ffw-1m">+1m</div>
            <div class="nav rew-5m">-5m</div>
            <div class="nav ffw-5m">+5m</div>
            <div class="nav rew-10m">-10m</div>
            <div class="nav ffw-10m">+10m</div>
        </div>
    </div>
    <div class="indicator">
        <div class="current"></div>
    </div>`;

export { VideoEditor };
