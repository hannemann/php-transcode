import { Slim, Utils, Iconify } from "@/components/lib";
import { handleKey, rwd, ffwd } from "./mixins/handleKey";

const THUMBNAIL_HEIGHT = 30;
class Clipper extends Slim {
    #aspect = "16:9";
    #aspectDecimal = 16 / 9;
    #height = 576;

    constructor() {
        super();
        this.bindListeners();
        this.current = 0;
        this.clips = [];
        this.raw = [];
        this.height = 576;
    }

    bindListeners() {
        this.rwd = rwd.bind(this);
        this.ffwd = ffwd.bind(this);
        this.handleKey = handleKey.bind(this);
        this.getFrameUrl = this.getFrameUrl.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.timestamp = this.timestamp.bind(this);
        this.getClipPos = this.getClipPos.bind(this);
        this.getIndicatorPos = this.getIndicatorPos.bind(this);
        this.activateClip = this.activateClip.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
    }

    onAdded() {
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        document.addEventListener("keydown", this.handleKey);
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
            this.addThumbnails();
        });
        this.calculateClips();
    }

    onRemoved() {
        document.removeEventListener("keydown", this.handleKey);
    }

    add() {
        this.raw.push(this.current);
        this.raw.sort((a, b) => a > b);
        this.calculateClips();
        Utils.forceUpdate(this, "clips,raw");
        this.dispatchEvent(
            new CustomEvent("clipper", { detail: this.timestamp() })
        );
    }

    remove() {
        const idx = this.raw.indexOf(this.current);
        if (idx > -1) {
            this.raw.splice(idx, 1);
            this.calculateClips();
            Utils.forceUpdate(this, "clips,raw");
        }
    }

    setClips(clips) {
        this.raw = clips;
        if (this.parentNode) {
            Utils.forceUpdate(this);
        }
    }

    addThumbnails() {
        let i = 1;
        const count = Math.floor(
            this.indicator.offsetWidth / (THUMBNAIL_HEIGHT * (4 / 3))
        );
        const fr = (this.duration * 1000) / (count + 2);
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
                (this.duration * 1000 * e.layerX) / this.indicator.offsetWidth;
            Utils.forceUpdate(this);
        }
    }

    activateClip(item) {
        if (this.current === item.raw.start && item.raw.end) {
            this.current = item.raw.end;
        } else {
            this.current = item.raw.start;
        }
        Utils.forceUpdate(this);
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

    src() {
        return `/image/${encodeURIComponent(
            this.path
        )}?timestamp=${this.timestamp()}`;
    }

    calculateClips() {
        let clips = [];
        for (let i = 0; i < this.raw.length; i += 2) {
            const start = this.raw[i] ? this.timestamp(this.raw[i]) : null;
            const end = this.raw[i + 1]
                ? this.timestamp(this.raw[i + 1])
                : null;
            const percentage = 100 / (this.duration * 1000);
            clips.push({
                timestamps: { start, end },
                raw: {
                    start: start ? this.raw[i] : null,
                    end: end ? this.raw[i + 1] : null,
                },
                percentage: {
                    start: start ? percentage * this.raw[i] : null,
                    length: end
                        ? percentage * (this.raw[i + 1] - this.raw[i])
                        : null,
                },
            });
        }
        this.clips = clips;
    }

    getIndicatorPos(item) {
        const percentage = (100 / (this.duration * 1000)) * this.current;
        return `left: ${percentage}%`;
    }

    getClipPos(item) {
        if (item.percentage.start && item.percentage.length) {
            return `left: ${item.percentage.start}%;width:${item.percentage.length}%`;
        }
        return `left: ${item.percentage.start}%;width:1px`;
    }

    getFrameUrl() {
        if (this.aspectDecimal) {
            const width = this.height * this.aspectDecimal;
            return `${this.baseUrl}${this.timestamp()}&width=${width}&height=${
                this.height
            }`;
        }
        return `${this.baseUrl}${this.timestamp()}`;
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
        Utils.forceUpdate(this);
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
                Utils.forceUpdate(this);
            }
        }
    }

    get baseUrl() {
        return `/image/${encodeURIComponent(this.path)}?timestamp=`;
    }
}

Clipper.template = /*html*/ `
<style>
    :host {
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: 1fr min-content max-content;
        grid-template-areas:
            "help frame timestamps"
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
    }
    .indicator img {
        max-width: 100%;
        max-height: 100%;
    }
    .indicator .clip {
        position: absolute;
        inset-block: 0;
        background: hsla(var(--hue-success) var(--sat-alert) var(--lit-alert) / .5);
    }
    .indicator .current {
        position: absolute;
        inset-block: -3px;
        background: red;
        width: 1px;
    }
    .help, .clips {
        font-size: .75rem;
        white-space: nowrap;
    }
    .help {
        grid-area: help;
    }
    .toggle-aspect::part(button) {
        width: 100%;
    }
    .help dl {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-column-gap: .5rem;
    }
    .help dd {
        margin: 0;
    }
    .clips {
        grid-area: timestamps;
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: min-content;
        overflow-y: auto;
        grid-row-gap: .25rem;
    }
    .clips .clip:nth-child(odd) {
        background: var(--clr-bg-100);
    }
    .clips .clip .timestamp {
        cursor: pointer;
        padding: .125rem;
    }
    .clips .clip .timestamp.active {
        background: var(--clr-bg-200);
    }
</style>
<img class="frame" src="{{ this.getFrameUrl() }}" #ref="image">
<div class="status">
    {{ this.timestamp() }}
</div>
<div class="indicator" #ref="indicator" @click="{{ this.handleIndicatorClick }}">
    <div class="clip" *foreach="{{ this.clips }}" style="{{ this.getClipPos(item) }}" @click="{{ this.activateClip(item) }}"></div>
    <div class="current" #ref="indicatorCurrent" style="{{ this.getIndicatorPos(item) }}"></div>
</div>
<div class="help">
    <theme-button class="toggle-aspect" @click="{{ this.toggleAspect() }}">{{ this.aspect }}</theme-button>
    <dl>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span></dt><dd>+/-1 Frame</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Shift</dt><dd>+/-2 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl</dt><dd>+/-5 Seconds</dd>
    </dl>
    <dl>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span></dt><dd>+/-1 Minute</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Shift</dt><dd>+/-5 Minutes</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Ctrl</dt><dd>+/-10 Minutes</dd>
    </dl>
    <dl>
        <dt>+</dt><dd>Add</dd>
        <dt>-</dt><dd>Remove</dd>
    </dl>
    <dl>
        <dt>
            <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span>
            <span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Alt
        </dt>
        <dd>Move</dd>
        <dt>
            <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl/Shift
        </dt>
        <dd>Skip</dd>
    </dl>
</div>
<div class="clips">
    <div class="clip" *foreach="{{ this.clips }}">
        <div @click="{{ this.activateClip({raw:{start:item.raw.start}}) }}"
            class="{{ item.raw.start === this.current ? 'timestamp active' : 'timestamp' }}"
        >
            {{ this.timestamp(item.raw.start) }}
        </div>
        <div @click="{{ this.activateClip({raw:{start:item.raw.end}}) }}"
            class="{{ item.raw.end === this.current ? 'timestamp active' : 'timestamp' }}"
        >
            {{ this.timestamp(item.raw.end) }}
        </div>
    </div>
</div>
`;

customElements.define("dialogue-clipper", Clipper);
