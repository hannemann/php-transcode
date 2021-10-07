import { Slim, Utils } from "@/components/lib";

class Clip extends Slim {
    constructor() {
        super();
        this.previous = this.previous.bind(this);
        this.next = this.next.bind(this);
        this.decreaseBy = this.decreaseBy.bind(this);
        this.increaseBy = this.increaseBy.bind(this);
        this.handleKey = this.handleKey.bind(this);
        // this.current = 2988.795;
        // this.current = 1.489078;
        this.current = 0;
    }

    onAdded() {
        console.log(this.duration, this.path);

        document.addEventListener("keyup", this.handleKey);
    }

    onRemoved() {
        document.removeEventListener("keyup", this.handleKey);
    }

    handleKey(e) {
        e.preventDefault();
        console.log(e);
        switch (e.key) {
            case "ArrowRight":
                e.shiftKey ? this.increaseBy(60) : this.next();
                break;
            case "ArrowLeft":
                e.shiftKey ? this.decreaseBy(60) : this.previous();
                break;
            case "ArrowUp":
                this.increaseBy(e.shiftKey ? 10 : e.ctrlKey ? 300 : 2);
                break;
            case "ArrowDown":
                this.decreaseBy(e.shiftKey ? 10 : e.ctrlKey ? 300 : 2);
                break;
        }
    }

    previous() {
        this.current = Math.max(0, this.current - 1 / this.fps);
        Utils.forceUpdate(this);
    }

    next() {
        this.current = Math.min(this.duration, this.current + 1 / this.fps);
        Utils.forceUpdate(this);
    }

    decreaseBy(seconds) {
        this.current = Math.max(0, this.current - seconds);
        Utils.forceUpdate(this);
    }

    increaseBy(seconds) {
        this.current = Math.min(this.duration, this.current + seconds);
        Utils.forceUpdate(this);
    }

    timestamp() {
        let t = new Date(this.current * 1000)
            .toISOString()
            .replace(/^[0-9-]+T/, "")
            .replace(/z$/i, "");
        console.log(t, this.current);
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
</style>
<div>
    <img src="{{ this.baseUrl + this.timestamp() }}">
</div>
<div>
    {{ this.timestamp() }}
</div>
<theme-button @click="{{ this.previous }}"><</theme-button>
<theme-button @click="{{ this.next }}">></theme-button>
`;

customElements.define("dialogue-clip", Clip);
