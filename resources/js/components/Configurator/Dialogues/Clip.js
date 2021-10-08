import { Slim, Utils, Iconify } from "@/components/lib";

const THUMBNAIL_HEIGHT = 30;
class Clip extends Slim {
    constructor() {
        super();
        this.bindListeners();
        this.current = 0;
        this.clips = [];
        this.raw = [];
        this.added = false;
    }

    bindListeners() {
        this.rwd = this.rwd.bind(this);
        this.ffwd = this.ffwd.bind(this);
        this.handleKey = this.handleKey.bind(this);
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
        this.added = true;
    }

    onRemoved() {
        this.added = false;
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
        if (this.added) {
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

    handleKey(e) {
        // console.log(this);
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        let action = false;
        const updateIndex = e.altKey ? this.raw.indexOf(this.current) : -1;
        switch (e.key) {
            case "ArrowRight":
                this.ffwd(
                    e.shiftKey ? 2000 : e.ctrlKey ? 5000 : 1000 / this.fps
                );
                action = true;
                break;
            case "ArrowLeft":
                this.rwd(
                    e.shiftKey ? 2000 : e.ctrlKey ? 5000 : 1000 / this.fps
                );
                action = true;
                break;
            case "ArrowUp":
                this.ffwd(e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
                action = true;
                break;
            case "ArrowDown":
                this.rwd(e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
                action = true;
                break;
            case "+":
                this.add();
                action = true;
                break;
            case "-": {
                this.remove();
                action = true;
                break;
            }
        }
        if (action) {
            e.preventDefault();
            e.stopPropagation();
            this.updateTimeout = setTimeout(() => {
                if (updateIndex > -1) {
                    this.raw.splice(updateIndex, 1, this.current);
                    this.raw.sort((a, b) => a > b);
                    this.calculateClips();
                }
                Utils.forceUpdate(this);
                delete this.updateTimeout;
            }, 150);
        }
    }

    handleIndicatorClick(e) {
        if (!e.composedPath().find((p) => p.classList?.contains("clip"))) {
            this.current =
                (this.duration * 1000 * e.layerX) / this.indicator.offsetWidth;
            Utils.forceUpdate(this);
        }
    }

    rwd(seconds) {
        this.current = Math.max(this.start * 1000, this.current - seconds);
    }

    ffwd(seconds) {
        this.current = Math.min(this.duration * 1000, this.current + seconds);
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

    get baseUrl() {
        return `/image/${encodeURIComponent(this.path)}?timestamp=`;
    }
}

Clip.template = /*html*/ `
<style>
    :host {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-areas:
            "help frame timestamps"
            "thumbnails thumbnails thumbnails";
        grid-column-gap: .5rem;
    }

    .frame {
        grid-area: frame;
        text-align: center;
    }
    .frame img {
        max-width: 600px;
    }
    .indicator {
        grid-area: thumbnails;
        height: ${THUMBNAIL_HEIGHT + 16}px;
        position: relative;
        display: flex;
        justify-content: space-around;
        align-items: center;
        overflow: hidden;
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
    }
    .indicator img {
        display: inline-block;
        height: ${THUMBNAIL_HEIGHT}px;
        aspect-ratio: 4 / 3;
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
    .help, .timestamps {
        font-size: .75rem;
    }
    .help {
        grid-area: help;
    }
    dl {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-column-gap: .5rem;
    }
    dd {
        margin: 0;
    }
    .timestamps {
        grid-area: timestamps;
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: min-content;
        overflow-y: auto;
    }
    .timestamp {
        cursor: pointer;
        padding: .125rem;
    }
    .timestamp.active {
        background: var(--clr-bg-100);
    }
</style>
<div class="frame">
    <img src="{{ this.baseUrl + this.timestamp() }}" #ref="image">
</div>
<div class="status">
    {{ this.timestamp() }}
</div>
<div class="indicator" #ref="indicator" @click="{{ this.handleIndicatorClick }}">
    <div class="clip" *foreach="{{ this.clips }}" style="{{ this.getClipPos(item) }}" @click="{{ this.activateClip(item) }}"></div>
    <div class="current" #ref="indicatorCurrent" style="{{ this.getIndicatorPos(item) }}"></div>
</div>
<div class="help">
    <dl>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span></dt><dd>+/-1 Frame</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Shift</dt><dd>+/-2 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl</dt><dd>+/-5 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span></dt><dd>+/-1 Minute</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Shift</dt><dd>+/-5 Minutes</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Ctrl</dt><dd>+/-10 Minutes</dd>
        <dt>+</dt><dd>Add</dd>
        <dt>-</dt><dd>Remove</dd>
        <dt>
            <span class="iconify" data-icon="mdi-swap-horizontal-bold"></span>
            <span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Alt
        </dt>
        <dd>Move</dd>
    </dl>
</div>
<div class="timestamps">
    <div class="{{ item === this.current ? 'timestamp active' : 'timestamp' }}" *foreach="{{ this.raw }}" @click="{{ this.activateClip({raw:{start:item}}) }}">{{ this.timestamp(item) }}</div>
</div>
`;

customElements.define("dialogue-clip", Clip);
