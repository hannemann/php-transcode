import { Iconify } from "@/components/lib";
import { DomHelper } from "../../../Helper/Dom";
import CARD_CSS from "../CardCss";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import "./Clip";
import sortable from "html5sortable/dist/html5sortable.es";
import { Request } from "@/components/Request";
import { Time } from "../../../Helper/Time";

const WS_CHANNEL = "Transcode.Clips";

class Clips extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        DomHelper.initDom.call(this);
        this.clips = [this.newClip()];
        this.valid = true;
        this.bindListener();
        this.btnCopy.addEventListener('click', this);
        this.clipsContainer.addEventListener('sortupdate', this);
        this.mode = "clips";
        this.totalDuration = Time.fromSeconds(this.videoDuration);
        this.initWebsocket();
        requestAnimationFrame(() => sortable(this.clipsContainer));            
    }

    disconnectedCallback() {
        this.leaveWebsocket();
        this.btnCopy.removeEventListener('click', this);
        this.clipsContainer.removeEventListener('sortupdate', this);
    }

    removeAllClips() {
        this.clipsContainer.replaceChildren();
    }

    removeClip(clip) {
        clip.removeEventListener('updateclip', this);
        clip.removeEventListener('clipinsert', this);
        clip.removeEventListener('clipremove', this);
        clip.removeEventListener('clipfocus', this);
        clip.removeEventListener('clipblur', this);
        clip.remove();
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
        return { from: null, to: null, id: (this.clips?.length || 0) + 1 };
    }

    handleClipsEvent(ws) {
        this.removeAllClips();
        if (ws.clips.length) {
            this.clips = [];
            ws.clips.forEach((c) => this.createClip(c.from, c.to));
            this.update();
        }
        Iconify.scan(this.shadowRoot);

    }

    handleEvent(e) {
        switch (e.type) {
            case 'updateclip':
                this.handleUpdate(e);
                break;
            case 'clipinsert':
                this.handleAdd(e);
                break;
            case 'clipremove':
                this.handleRemove(e);
                break;
            case 'clipfocus':
                this.handleFocus(e);
                break;
            case 'clipblur':
                this.handleBlur(e);
                break;
            case 'click':
                this.handleCopy(e);
                break;
            case 'sortupdate':
                this.handleSortupdate(e);
                break;
        }
    }

    createClip(from, to) {
        const clipData = this.newClip();
        clipData.from = from;
        clipData.to = to;
        const clip = document.createElement('transcode-configurator-clip');
        clip.dataset.id = clipData.id;
        clip.canRemove = this.clips.length > 0
        // clip.isLast = this.clips.indexOf(clipData) === this.clips.length - 1;
        clip.clipData = {...clipData};
        clip.from = clipData.from;
        clip.to = clipData.to;
        this.clips.push(clipData);
        this.clipsContainer.append(clip);
        clip.cutpoint = this.getCutpoint(clipData);
        clip.addEventListener('updateclip', this);
        clip.addEventListener('clipinsert', this);
        clip.addEventListener('clipremove', this);
        clip.addEventListener('clipfocus', this);
        clip.addEventListener('clipblur', this);
        return clip;
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
        const clip = this.createClip('0:0:0.0', '0:0:0.0');
        this.clips.pop();
        this.clipsContainer.insertBefore(clip, this.clipsContainer.childNodes[idx + 1]);
        this.clips.splice(idx + 1, 0, clip.clipData);
        await this.update();
        clip.inputFrom.focus();
    }

    async handleRemove(e) {
        if (this.clips.length > 1) {
            const clip = this.clipsContainer.querySelector(`[data-id="${e.detail.id}"]`);
            clip.remove();
            const idx = this.clips.findIndex((c) => c.id === e.detail.id);
            const focus = Math.max(0, idx - 1);
            this.clips.splice(idx, 1);
            await this.update();
            this.clipsContainer
                .querySelector(`[data-id="${this.clips[focus].id}"]`)
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
        const clips = [...this.clips];
        this.clips = []
        this.clipsContainer.replaceChildren(...clips.map(c => this.createClip(c.from, c.to)));
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                sortable(this.clipsContainer, "reload");
                this.shadowRoot
                    .querySelectorAll("transcode-configurator-clip")
                    .forEach((c, i) => (c.clipData = this.clips[i]));
                this.calculateTotalDuration();
                document.dispatchEvent(new CustomEvent("clips-updated"));
                const children = [...this.clipsContainer.childNodes];
                children.forEach(c => c.isLast = false);
                children.pop().isLast = true;
                resolve();
            });
        });
    }

    handleFocus() {
        sortable(this.clipsContainer, "disable");
    }

    handleBlur() {
        sortable(this.clipsContainer, "enable");
    }

    getCutpoint(clip) {
        if (this.clips.length <= 0) return ""
        return Time.calculateCutTimestamp(this.clips, clip.from);
    }

    getTimestamps() {
        return this.clips.reduce((acc, cur) => {
            if (cur.from) {
                acc.push(Time.milliSeconds(cur.from));
            }
            if (cur.to) {
                acc.push(Time.milliSeconds(cur.to));
            }
            return acc;
        }, []);
    }

    calculateTotalDuration() {
        if (this.clips.length) {
            this.totalDuration = Time.calculateClipsDuration(this.clips);
        } else {
            this.totalDuration = Time.fromSeconds(this.videoDuration);
        }
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
            const raw = this.copyarea.value.trim().split("\n");
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
            this.clips = [];
            this.removeAllClips();
            clips.forEach((c) => this.addClip(c.from, c.to));
            if (this.clips.length) {
                this.update();
            }
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

    set mode(value) {
        const main = this.shadowRoot.querySelector('main');
        main.classList.remove('copy', 'clips');
        main.classList.add(value);
    }

    get mode() {
        return this.shadowRoot.querySelector('main').className;
    }

    get clipsContainer() {
        return this.shadowRoot?.querySelector('div.clips')
    }

    get copyarea() {
        return this.shadowRoot?.querySelector('.copy textarea')
    }

    get btnCopy() {
        return this.shadowRoot?.querySelector('.btn-copy')
    }

    set totalDuration(value) {
        this.shadowRoot.querySelector('.duration span').innerText = value;
    }

    get totalDuration() {
        return this.shadowRoot.querySelector('.duration span').innerText;
    }
}

Clips.template = /*html*/ `
${ICON_STACK_CSS}
${CARD_CSS}
<style>
    :host {
        user-select: none;
    }
    main {
        display: grid;
        gap: .5rem;
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
    .clips .duration {
        display: flex;
        gap: .5rem;
    }
</style>
<main>
    <h2>
        Clips
        <div class="btn-copy icon-stack">
            <span class="iconify" data-icon="mdi-content-copy"></span>
            <span class="iconify hover" data-icon="mdi-content-copy"></span>
        </div>
    </h2>
    <div class="copy">
        <textarea></textarea>
    </div>
    <div class="clips">
    </div>
    <div class="duration">
        <h2>Duration:</h2> <span></span>
    </div>
</main>
`;
customElements.define("transcode-configurator-clips", Clips);
