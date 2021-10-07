import { Slim, Utils, Iconify } from "@/components/lib";

class Clip extends Slim {
    constructor() {
        super();
        this.rwd = this.rwd.bind(this);
        this.ffwd = this.ffwd.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.add = this.add.bind(this);
        this.current = 0;
        this.clips = [];
    }

    onAdded() {
        this.current = parseInt(this.start * 1000, 10) ?? 0;
        document.addEventListener("keydown", this.handleKey);
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
            this.addButton.focus();
        });
    }

    onRemoved() {
        document.removeEventListener("keydown", this.handleKey);
    }

    add() {
        this.clips.push(this.timestamp());
        this.clips.sort();
        Utils.forceUpdate(this, "clips");
        this.dispatchEvent(
            new CustomEvent("clipper", { detail: this.timestamp() })
        );
    }

    handleKey(e) {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        let prevent = false;
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
        }
        if (prevent) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.updateTimeout = setTimeout(() => {
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

    timestamp() {
        let t = new Date(this.current)
            .toISOString()
            .replace(/^[0-9-]+T/, "")
            .replace(/z$/i, "");
        return t;
    }

    src() {
        return `/image/${encodeURIComponent(
            this.path
        )}?timestamp=${this.timestamp()}`;
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
</style>
<div>
    <img src="{{ this.baseUrl + this.timestamp() }}" #ref="image">
</div>
<div>
    {{ this.timestamp() }}
</div>
<theme-button @click="{{ this.add }}" #ref="addButton">Add</theme-button>
<div class="info">
    <dl>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span></dt><dd>+/-1 Frame</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Shift</dt><dd>+/-2 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-horizontal-bold"></span> + Ctrl</dt><dd>+/-5 Seconds</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span></dt><dd>+/-1 Minute</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Shift</dt><dd>+/-5 Minutes</dd>
        <dt><span class="iconify" data-icon="mdi-swap-vertical-bold"></span> + Ctrl</dt><dd>+/-10 Minutes</dd>
    </dl>
    <div>
        <div *foreach="{{ this.clips }}">{{ item }}</div>
    </div>
</div>
`;

customElements.define("dialogue-clip", Clip);
