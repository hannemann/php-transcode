import { Slim, Utils, Iconify } from "@/components/lib";
import CARD_CSS from "../CardCss";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import "./Clip";
import sortable from "html5sortable/dist/html5sortable.es";
import { Request } from "@/components/Request";

const dataFactory = function* () {
    let id = 0;
    while (true) {
        // yield {from: `0:0:${id}.0`, to: null, id: id++}
        yield { from: null, to: null, id: id++ };
    }
};

const getClipInitData = (factory) => factory.next().value;

const WS_CHANNEL = "Transcode.Clips";

class Clips extends Slim {
    #mode;

    constructor() {
        super();
        this.clips = [this.newClip()];
        //this.clips = [this.newClip(), this.newClip(), this.newClip(), this.newClip()]
        this.valid = true;
        this.bindListener();
        this.mode = "clips";
    }

    onAdded() {
        this.initWebsocket();
        requestAnimationFrame(() => {
            sortable(this.sortable);
            Iconify.scan(this.shadowRoot);
        });
    }

    onRemoved() {
        this.leaveWebsocket();
    }

    initWebsocket() {
        this.channel = window.Echo.channel(WS_CHANNEL);
        this.channel.listen(WS_CHANNEL, this.handleClipsEvent.bind(this));
        this.channel.subscribed(this.requestClips.bind(this));
    }

    leaveWebsocket() {
        this.channel.stopListening(WS_CHANNEL);
        window.Echo.leave(WS_CHANNEL);
        delete this.channel;
    }

    requestClips() {
        try {
            console.info("Request clips of %s", this.path);
            Request.get(`/clips/${encodeURIComponent(this.path)}`);
        } catch (error) {
            console.error(error);
            this.leaveWebsocket();
        }
    }

    bindListener() {
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleSortupdate = this.handleSortupdate.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
    }

    newClip() {
        if (!this.dataFactory) {
            this.dataFactory = dataFactory();
        }
        return getClipInitData(this.dataFactory);
    }

    handleClipsEvent(ws) {
        if (ws.clips.length) {
            this.clips = [];
            ws.clips.forEach((c) => this.addClip(c.from, c.to));
            this.update();
        }
    }

    addClip(from, to) {
        let clip = this.newClip();
        clip.from = from;
        clip.to = to;
        this.clips.push(clip);
    }

    handleSortupdate(e) {
        this.clips.splice(
            e.detail.destination.index,
            0,
            this.clips.splice(e.detail.origin.index, 1)[0]
        );
        this.update();
    }

    async handleAdd(e) {
        const idx = this.clips.findIndex((c) => c.id === e.detail.id);
        let clip = this.newClip();
        this.clips.splice(idx + 1, 0, clip);
        await this.update();
        this.sortable
            .querySelector(`[data-clip="${clip.id}"]`)
            .inputFrom.focus();
    }

    async handleRemove(e) {
        if (this.clips.length > 1) {
            const idx = this.clips.findIndex((c) => c.id === e.detail.id);
            const focus = Math.max(0, idx - 1);
            this.clips.splice(idx, 1);
            await this.update();
            this.sortable
                .querySelector(`[data-clip="${this.clips[focus].id}"]`)
                .inputFrom.focus();
        }
    }

    handleUpdate(e) {
        this.update();
        this.valid = Array.from(
            this.shadowRoot.querySelectorAll("transcode-configurator-clip")
        ).every((c) => c.valid);
    }

    update() {
        return new Promise((resolve) => {
            Utils.forceUpdate(this, "clips");
            requestAnimationFrame(() => {
                sortable(this.sortable, "reload");
                this.shadowRoot
                    .querySelectorAll("transcode-configurator-clip")
                    .forEach((c, i) => (c.clipData = this.clips[i]));
                document.dispatchEvent(new CustomEvent("clips-updated"));
                resolve();
            });
        });
    }

    handleFocus() {
        sortable(this.sortable, "disable");
    }

    handleBlur() {
        sortable(this.sortable, "enable");
    }

    getCutpoint(clip) {
        if (this.clips.length > 1) {
            const cutpoint = this.clips
                .filter((c) => c.id <= clip.id)
                .reverse()
                .reduce(
                    (acc, cur) =>
                        acc + this.toSeconds(cur.to) - this.toSeconds(cur.from),
                    0
                );
            if (isNaN(cutpoint)) {
                return "";
            }
            return this.fromSeconds(cutpoint);
        }
        return "";
    }

    toSeconds(coord) {
        const [hours, minutes, seconds] = coord.split(":");
        return (
            parseFloat(hours) * 60 * 60 +
            parseFloat(minutes) * 60 +
            parseFloat(seconds)
        );
    }

    fromSeconds(coord) {
        const d = new Date(null);
        d.setMilliseconds(coord * 1000);
        return `${d.getUTCHours().toString().padStart(2, "0")}:${d
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}:${d
            .getUTCSeconds()
            .toString()
            .padStart(2, "0")}.${d.getUTCMilliseconds()}`;
    }

    milliSeconds(coord) {
        return this.toSeconds(coord) * 1000;
    }

    getTimestamps() {
        return this.clips.reduce((acc, cur) => {
            if (cur.from) {
                acc.push(this.milliSeconds(cur.from));
            }
            if (cur.to) {
                acc.push(this.milliSeconds(cur.to));
            }
            return acc;
        }, []);
    }

    handleCopy() {
        this.mode = this.mode === "clips" ? "copy" : "clips";
        if (this.mode === "copy") {
            this.copyarea.rows = Math.max(
                10,
                Math.min(20, this.clips.length * 2)
            );
            this.copyarea.value = this.getCopyClips();
            this.copyarea.select();
        } else {
            const raw = this.copyarea.value.split("\n");
            const clips = [];
            for (let i = 0; i < raw.length; i += 2) {
                if (raw[i]) {
                    let clip = {
                        from: raw[i],
                        to: raw[i + 1] ?? null,
                    };
                    clips.push(clip);
                }
            }
            if (clips.length === 0) {
                clips.push({ from: null, to: null });
            }
            this.clips = [];
            clips.forEach((c) => this.addClip(c.from, c.to));
            this.update();
        }
    }

    getCopyClips() {
        return this.clips
            .reduce((acc, cur) => {
                if (cur.from) {
                    acc.push(cur.from);
                }
                if (cur.to) {
                    acc.push(cur.to);
                }
                return acc;
            }, [])
            .join("\n");
    }
}

Clips.template = /*html*/ `
${ICON_STACK_CSS}
${CARD_CSS}
<style>
    :host {
        user-select: none;
    }
    h2 {
        display: flex;
        justify-content: space-between;
    }
    div.copy, div.clips {
        display: none;
    }
    .copy div.copy {
        display: block;
    }
    .clips div.clips {
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }
</style>
<main class="{{ this.mode }}">
    <h2>
        Clips
        <div class="icon-stack" @click="{{ this.handleCopy }}">
            <span class="iconify" data-icon="mdi-content-copy"></span>
            <span class="iconify hover" data-icon="mdi-content-copy"></span>
        </div>
    </h2>
    <div class="copy">
        <textarea #ref="copyarea"></textarea>
    </div>
    <div class="clips" #ref="sortable" @sortupdate="{{ this.handleSortupdate }}">
        <transcode-configurator-clip
            data-clip="{{ item.id }}"
            *foreach="{{ this.clips }}"
            .can-remove="{{ this.clips.length > 1 }}"
            .is-last="{{ this.clips.indexOf(item) === this.clips.length - 1 }}"
            @updateclip="{{ this.handleUpdate }}"
            @clipinsert="{{ this.handleAdd }}"
            @clipremove="{{ this.handleRemove }}"
            @clipfocus="{{ this.handleFocus }}"
            @clipblur="{{ this.handleBlur }}"
            .clip-data="{{ item }}"
            .cutpoint="{{ this.getCutpoint(item) }}">
        </transcode-configurator-clip>
    </div>
</main>
`;
customElements.define("transcode-configurator-clips", Clips);
