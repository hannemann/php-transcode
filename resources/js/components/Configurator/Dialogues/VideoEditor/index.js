import { Slim, Iconify } from "@/components/lib";

const THUMBNAIL_HEIGHT = 30;

class VideoEditor extends Slim {
    constructor() {
        super();
        this.height = 576;
        this.bindListeners();
    }

    bindListeners() {
        this.toggleAspect = this.toggleAspect.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
    }

    onAdded() {
        this.start = parseFloat(this.video.start_time);
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        this.aspectRatio = this.video.display_aspect_ratio;
        this.duration = this.toMilliSeconds(this.video.tags.DURATION);
        this.displayDuration = this.timestamp(this.duration);
        requestAnimationFrame(() => {
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
            img.src = `${this.baseUrl}${timestamp}&height=${THUMBNAIL_HEIGHT}`;
            this.indicator.appendChild(img);
        } while (i++ <= count);
    }

    handleIndicatorClick(e) {
        if (!e.composedPath().find((p) => p.classList?.contains("clip"))) {
            this.current =
                (this.duration * e.layerX) / this.indicator.offsetWidth;
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
        if (this.aspectDecimal) {
            const width = this.height * this.aspectDecimal;
            this.frameUrl = `${
                this.baseUrl
            }${this.timestamp()}&width=${width}&height=${this.height}`;
        } else {
            this.frameUrl = `${this.baseUrl}${this.timestamp()}`;
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

    get baseUrl() {
        return `/image/${encodeURIComponent(this.path)}?timestamp=`;
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
}

export const EDITOR_CSS = /*html*/ `
<style>
:host {
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: 1fr min-content max-content;
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
        text-align: center;
    }
    .indicator {
        grid-area: thumbnails;
        height: ${THUMBNAIL_HEIGHT + 16}px;
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
</style>`;

export const EDITOR_TEMPLATE = /*html*/ `
<img class="frame" src="{{ this.frameUrl }}" #ref="image">
<theme-button class="toggle-aspect" @click="{{ this.toggleAspect }}">{{ this.aspect }}</theme-button>
<div class="status">
    {{ this.currentTimestamp }} / {{ this.displayDuration }}
</div>
<div class="indicator" #ref="indicator" @click="{{ this.handleIndicatorClick }}">
    <div class="current" #ref="indicatorCurrent" style="{{ this.indicatorPos }}"></div>
</div>`;

export { VideoEditor };
