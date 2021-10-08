import { Slim, Utils, Iconify } from "@/components/lib";

class Clip extends Slim {
    constructor() {
        super();
        this.rwd = this.rwd.bind(this);
        this.ffwd = this.ffwd.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.add = this.add.bind(this);
        this.timestamp = this.timestamp.bind(this);
        this.getClipPos = this.getClipPos.bind(this);
        this.getIndicatorPos = this.getIndicatorPos.bind(this);
        this.getIndicashowCliptorPos = this.showClip.bind(this);
        this.current = 0;
        this.clips = [];
        this.raw = [];
        this.added = false;
    }

    onAdded() {
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        document.addEventListener("keydown", this.handleKey);
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
        });
        this.calculateClips()
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

    handleKey(e) {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        let prevent = false;
        const updateIndex = this.raw.indexOf(this.current);
        switch (e.key) {
            case "ArrowRight":
                this.ffwd(
                    e.shiftKey ? 2000 : e.ctrlKey ? 5000 : 1000 / this.fps
                );
                prevent = true;
                break;
            case "ArrowLeft":
                this.rwd(
                    e.shiftKey ? 2000 : e.ctrlKey ? 5000 : 1000 / this.fps
                );
                prevent = true;
                break;
            case "ArrowUp":
                this.ffwd(e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
                prevent = true;
                break;
            case "ArrowDown":
                this.rwd(e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
                prevent = true;
                break;
            case "+":
                this.add();
                prevent = true;
                break;
            case "-": {
                this.remove();
                prevent = true;
                break;
            }
        }
        if (prevent) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.updateTimeout = setTimeout(() => {
            // if (updateIndex > -1) {
            //     this.raw.splice(this.updateIndex, 1, this.current);
            //     this.raw.sort((a, b) => a > b);
            //     this.calculateClips();
            // }
            Utils.forceUpdate(this);
            delete this.updateTimeout;
        }, 150);
    }

    rwd(seconds) {
        this.current = Math.max(this.start * 1000, this.current - seconds);
    }

    ffwd(seconds) {
        this.current = Math.min(this.duration * 1000, this.current + seconds);
    }

    showClip(item) {
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
    img {
        max-width: 100%;
    }
    .indicator {
        height: 20px;
        position: relative;
        background: var(--clr-bg-100);
    }
    .indicator .clip {
        position: absolute;
        inset-block: 0;
        background: var(--clr-bg-200);
    }
    .indicator .current {
        position: absolute;
        inset-block: -3px;
        background: red;
        width: 1px;
    }
    .info {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
    dl {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-column-gap: .5rem;
        font-size: .75rem;
    }
    dd {
        margin: 0;
    }
    .timestamp {
        cursor: pointer;
    }
</style>
<div>
    <img src="{{ this.baseUrl + this.timestamp() }}" #ref="image">
</div>
<div>
    {{ this.timestamp() }}
</div>
<div class="indicator">
    <div class="clip" *foreach="{{ this.clips }}" style="{{ this.getClipPos(item) }}" @click="{{ this.showClip(item) }}"></div>
    <div class="current" style="{{ this.getIndicatorPos(item) }}"></div>
</div>
<div class="info">
    <dl>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span></dt><dd>+/-1 Frame</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Shift</dt><dd>+/-2 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl</dt><dd>+/-5 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span></dt><dd>+/-1 Minute</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Shift</dt><dd>+/-5 Minutes</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Ctrl</dt><dd>+/-10 Minutes</dd>
        <dt>+</dt><dd>Add</dd>
        <dt>-</dt><dd>Remove</dd>
    </dl>
    <div>
        <div class="timestamp" *foreach="{{ this.raw }}" @click="{{ this.showClip({raw:{start:item}}) }}">{{ this.timestamp(item) }}</div>
    </div>
</div>
`;

customElements.define("dialogue-clip", Clip);
