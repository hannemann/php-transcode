import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";
import { Utils } from "@/components/lib";
class Clipper extends VideoEditor {
    clips = [];
    raw = [];

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        requestAnimationFrame(() => {
            this.calculateClips();
            this.initImages();
        });
    }

    bindListeners() {
        super.bindListeners();
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.getClipPos = this.getClipPos.bind(this);
        this.activateClip = this.activateClip.bind(this);
    }

    disconnectedCallback() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
    }

    add() {
        this.raw.push(this.current);
        this.raw.sort((a, b) => a > b);
        this.calculateClips();
        Utils.forceUpdate(this, "clips,raw");
        this.dispatchEvent(
            new CustomEvent("clipper", { detail: this.timestamp() }),
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

    activateClip(e) {
        const item = this.clips[e.target.dataset.index];
        if (this.current === item.raw.start && item.raw.end) {
            this.current = item.raw.end;
        } else {
            this.current = item.raw.start;
        }
        this.updateImages();
    }

    clipEndTimestamp(seconds) {
        return seconds ? this.timestamp(seconds) : "-";
    }

    calculateClips() {
        this.clips.forEach((c) => {
            c.node.removeEventListener("click", this.activateClip);
            c.node.remove();
        });
        this.clips = [];
        for (let i = 0; i < this.raw.length; i += 2) {
            const start = this.raw[i] ? this.timestamp(this.raw[i]) : null;
            const end = this.raw[i + 1]
                ? this.timestamp(this.raw[i + 1])
                : null;
            const percentage = 100 / this.duration;
            const clip = {
                index: this.clips.length,
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
            };
            clip.node = document.createElement("div");
            clip.node.style.left = `${clip.percentage.start}%`;
            clip.node.style.width = end ? `${clip.percentage.length}%` : "1px";
            clip.node.dataset.index = clip.index;
            clip.node.classList.add("clip");
            clip.node.addEventListener("click", this.activateClip);
            this.indicator.appendChild(clip.node);
            this.clips.push(clip);
        }
        Utils.forceUpdate(this);
    }

    getClipPos(item) {
        if (item.percentage.start && item.percentage.length) {
            return `left: ${item.percentage.start}%;width:${item.percentage.length}%`;
        }
        return `left: ${item.percentage.start}%;width:1px`;
    }
}

Clipper.template = /*html*/ `
${EDITOR_CSS}
<style>
    .indicator .clip {
        position: absolute;
        inset-block: 0;
        background: hsla(var(--hue-success) var(--sat-alert) var(--lit-alert) / .5);
        z-index: 1;
    }
    .help, .clips {
        font-size: .75rem;
        white-space: nowrap;
    }
    .help {
        grid-area: left;
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
        grid-area: right;
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: min-content;
        overflow-y: auto;
        grid-row-gap: .25rem;
        justify-self: end;
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
${EDITOR_TEMPLATE}
<div class="help">
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
        <div data-index="{{ item.index }}" @click="{{ this.activateClip }}"
            class="{{ item.raw.start === this.current ? 'timestamp active' : 'timestamp' }}"
        >
            {{ this.timestamp(item.raw.start) }}
        </div>
        <div data-index="{{ item.index }}" @click="{{ this.activateClip }}"
            class="{{ item.raw.end === this.current ? 'timestamp active' : 'timestamp' }}"
        >
            {{ this.clipEndTimestamp(item.raw.end) }}
        </div>
    </div>
</div>
`;

customElements.define("dialogue-clipper", Clipper);
