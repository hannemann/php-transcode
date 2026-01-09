import { Slim, Iconify } from "@/components/lib";
import { Time } from '../../../../Helper/Time';
import { handleKeyDown, handleKeyUp } from "./mixins/handleKey";

const THUMBNAIL_HEIGHT = 30;

class VideoEditor extends Slim {

    #markers = [];

    constructor() {
        super();
        this.raw = [];
        this.bindListeners();
    }

    bindListeners() {
        this.handleKeyDown = handleKeyDown.bind(this);
        this.handleKeyUp = handleKeyUp.bind(this);
        this.toggleAspect = this.toggleAspect.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
        this.setCurrentPosByMarker = this.setCurrentPosByMarker.bind(this);
    }

    onAdded() {
        this.fps =
            this.video.avg_frame_rate.split("/")[0] /
            this.video.avg_frame_rate.split("/")[1];
        this.start = parseFloat(this.video.start_time);
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        this.duration = this.video.duration * 1000;
        this.displayDuration = this.timestamp(this.duration);
        requestAnimationFrame(() => {
            this.aspectRatio = this.video.display_aspect_ratio;
            Iconify.scan(this.shadowRoot);
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
    }

    updateIndicatorPos() {
        const percentage = (100 / this.duration) * this.current;
        this.indicatorPos = `left: min(${percentage}%, 100% - 1px`;
    }

    addThumbnails() {
        let i = 1;
        const count = Math.floor(
            this.indicator.offsetWidth / (THUMBNAIL_HEIGHT * (4 / 3))
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
        const indicatorClickPos = parseInt(e.pageX - this.indicator.getBoundingClientRect().left);
            this.current =
                (this.duration * indicatorClickPos) / this.indicator.offsetWidth;
            this.updateImages();
        }
    }

    timestamp(current) {
        return new Date(current ?? this.current)
            .toISOString()
            .replace(/^[0-9-]+T/, "")
            .replace(/z$/i, "");
    }

    toMilliSeconds(timestamp) {
        const parts = timestamp.split(":");
        const t = new Date(0);
        t.setUTCHours(parts[0]);
        t.setMinutes(parts[1]);
        t.setMilliseconds(parts[2] * 1000);
        return t.getTime();
    }

    updateFrameUrl() {
        let currentFilter = ''
        if ("undefined" !== typeof this.filterIndex && this.filterIndex !== null) {
            currentFilter = `&current_filter=${this.filterIndex}`
        }
        if (this.aspectDecimal) {
            const filterGraph = document.querySelector('ffmpeg-transcoder').shadowRoot.querySelector('transcode-configurator').filterGraph;
            const scaleFilter = filterGraph.find((f) => f.filterType === 'scale');
            const height = scaleFilter ? parseInt(scaleFilter.height) : this.video.height;
            const width = height * this.aspectDecimal;
            this.frameUrl = `${
                this.baseUrl
            }${this.timestamp()}&width=${width}&height=${height}&filtered=1${currentFilter}`;
        } else {
            this.frameUrl = `${this.baseUrl}${this.timestamp()}&filtered=1${currentFilter}`;
        }
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
        return `left: min(${percentage}%, 100% - 1px`;
    }

    setCurrentPosByMarker(e) {
        e.stopPropagation();
        this.current = e.currentTarget.dataset.start / 1000000;
        this.updateIndicatorPos();
        this.updateImages();
    }

    markersFromClips(clips) {
        const multiplier = 1000 * 1000

        const markers = [...clips].reduce((acc, cur) => {
            if (cur.from && cur.to) {
                acc.push({start: Time.milliSeconds(cur.from) * multiplier});
                acc.push({start: Time.milliSeconds(cur.to) * multiplier});
            }
            return acc;
        }, []);

        return markers
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
        const fromClips = 'undefined' !== typeof value.clips;
        const markers = fromClips ? this.markersFromClips(value.clips) : value;
        this.#markers = markers;
    }

    get markers() {
        return this.#markers;
    }
}

export const EDITOR_CSS = /*html*/ `
<style>
:host {
        --thumbnail-height: ${THUMBNAIL_HEIGHT + 16}px;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-rows: calc(100% - var(--thumbnail-height) - var(--font-size-100) * var(--line-height-100)) min-content max-content;
        grid-template-areas:
            "left frame right"
            "status status status"
            "thumbnails thumbnails thumbnails";
        grid-column-gap: .5rem;
        height: 100%;
    }

    .frame {
        grid-area: frame;
        max-width: 100%;
        max-height: 100%;
        justify-self: center;
    }
    .status {
        grid-area: status;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
        max-width: 100rem;
        justify-self: center;

        div {
            justify-self: start;

            &.time {
                justify-self: center;
            }
        }

        div:has(.nav) {
            justify-self: end;
            display: flex;
            gap: .5rem;
            .nav {
                cursor: pointer;
                user-select: none;
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
            linear-gradient(to right, var(--background) var(--size), transparent var(--size)),
            linear-gradient(to bottom, var(--background) var(--size), transparent var(--size)),
            linear-gradient(to right, var(--background) var(--size), transparent var(--size)),
            linear-gradient(to bottom, var(--background) var(--size), transparent var(--size)),
            linear-gradient(to bottom, transparent var(--size), var(--background) var(--size));
        background-size: calc(var(--size) * 2) var(--size), calc(var(--size) * 2) var(--size), calc(var(--size) * 2) var(--size), calc(var(--size) * 2) var(--size), 100% calc(100% - var(--size) * 3);
        background-repeat: repeat-x;
        background-position: 0 var(--size), top left, 0 calc(100% - var(--size)), bottom left, 0 var(--size);
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
        font-size: .75rem;
        padding: .5rem;
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

export const EDITOR_TEMPLATE = /*html*/ `
<img class="frame" src="{{ this.frameUrl }}" #ref="image">
<theme-button class="toggle-aspect" @click="{{ this.toggleAspect }}">{{ this.aspect }}</theme-button>
<div class="status">
    <div></div>
    <div class="time">{{ this.currentTimestamp }} / {{ this.displayDuration }}</div>
    <div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowLeft'}) }}" @pointerup="{{ this.handleNavUp() }}"">-1f</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowRight'}) }}" @pointerup="{{ this.handleNavUp() }}"" @pointerup="{{ this.handleNavUp() }}">+1f</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowLeft', shiftKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">-2s</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowRight', shiftKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">+2s</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowLeft', ctrlKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">-5s</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowRight', ctrlKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">+5s</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowDown'}) }}" @pointerup="{{ this.handleNavUp() }}"">-1m</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowUp'}) }}" @pointerup="{{ this.handleNavUp() }}"">+1m</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowDown', shiftKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">-5m</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowUp', shiftKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">+5m</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowDown', ctrlKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">-10m</div>
        <div class="nav" @pointerdown="{{ this.handleNavDown({key:'ArrowUp', ctrlKey: 1}) }}" @pointerup="{{ this.handleNavUp() }}"">+10m</div>
    </div>
</div>
<div class="indicator" #ref="indicator" @click="{{ this.handleIndicatorClick }}">
    <div class="current" #ref="indicatorCurrent" style="{{ this.indicatorPos }}"></div>
    <div class="markers" *foreach="{{ this.markers }}" data-start="{{ item.start }}" @click="{{ this.setCurrentPosByMarker }}" style="{{ this.getMarkerLeft(item) }}"></div>
</div>`;

export { VideoEditor };
