import { Slim } from "@/components/lib";
import Iconify from "@iconify/iconify";
import { Request } from "@/components/Request";
import { Time } from "../../Helper/Time";
import "./Done";
import "./Failed";
import "./Current";
import "./Pending";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";

const STATE_RUNNING = "running";
const STATE_PENDING = "pending";
const STATE_DONE = "done";
const STATE_FAILED = "failed";
const WS_CHANNEL_FFMPEG_OUT = "FFMpegOut";
const WS_CHANNEL_FFMPEG_PROGRESS = "FFMpegProgress";
let runtimeInterval = false;
let currentRuntime = 0;

class Statusbar extends Slim {
    constructor() {
        super();
        this.running = false;
        this.runtime = "00:00:00";
        this.remainTime = "00:00:00";
        this.out = "";
        this.rate = "";
        this.remaining = "";
        this.percentage = 0;
        this.dataset.hasItems = false;
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleProgressEvent = this.handleProgressEvent.bind(this);
        this.handleOutEvent = this.handleOutEvent.bind(this);
    }

    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
        this.channel = window.Echo.channel(WS_CHANNEL_FFMPEG_PROGRESS);
        this.channel.subscribed(this.requestProgress.bind(this));
        this.channel.listen(WS_CHANNEL_FFMPEG_PROGRESS, this.handleProgressEvent);
        this.channelOut = window.Echo.channel(WS_CHANNEL_FFMPEG_OUT);
        this.channelOut.listen(WS_CHANNEL_FFMPEG_OUT, this.handleOutEvent);
        document.addEventListener("click", this.handleDocumentClick);
    }

    onRemoved() {
        this.channel.stopListening(WS_CHANNEL_FFMPEG_PROGRESS);
        window.Echo.leave(WS_CHANNEL_FFMPEG_PROGRESS);
        delete this.channel;
        this.channelOut.stopListening(WS_CHANNEL_FFMPEG_OUT);
        window.Echo.leave(WS_CHANNEL_FFMPEG_OUT);
        delete this.channelOut;
    }

    handleDocumentClick(e) {
        const p = e.composedPath();
        if (
            !this.sectionDetail.classList.contains("hidden") &&
            p.indexOf(this.sectionDetail) < 0
        ) {
            this.toggleDetail();
        } else if (p.indexOf(this.buttonDetail) > -1) {
            this.toggleDetail();
        }
    }

    handleOutEvent(ws) {
        const {line, clips} = ws.out;
        this.out = line;

        const speed = parseFloat(this.out.split(' ').find(p => p.includes('speed'))?.split('=').pop());
        const encodedTime = this.out.split(' ').find(p => p.includes('time'))?.split('=').pop();
        if (speed && encodedTime) {
            const clipsDuration = Time.milliSeconds(Time.calculateClipsDuration(clips));
            const elapsed = new Date(`1970-01-01T${encodedTime}`) - new Date('1970-01-01T00:00:00.00');
            const remainTime = new Date((clipsDuration - elapsed) / speed);
            if (remainTime.getDate()) {
                this.remainTime = Time.duration(remainTime);
            }
        }
    }

    toggleDetail() {
        const detail = this.sectionDetail.classList.contains("hidden");
        this.classList.toggle("detail", detail);
        this.iconShort.classList.toggle("hidden", detail);
        this.iconDetail.classList.toggle("hidden", !detail);
        this.sectionDetail.classList.toggle("hidden", !detail);
        this.requestProgress();
    }

    requestProgress() {
        try {
            Request.get("/progress", false);
        } catch (error) {}
    }

    handleProgressEvent({ queue }) {
        const hasItems = Boolean(queue.length);
        this.dataset.hasItems = hasItems.toString();
        if (!hasItems) {
            this.sectionDetail.classList.add('hidden');
        }
        let current = queue.filter((q) => q.state === STATE_RUNNING);
        let pending = queue.filter((q) => q.state === STATE_PENDING);
        let failed = queue.filter((q) => q.state === STATE_FAILED);
        let done = queue.filter((q) => q.state === STATE_DONE);
        this.percentage = current.length ? current[0].percentage : 0;
        this.rate = current.length ? current[0].rate : 0;
        this.remaining = current.length ? current[0].remaining : 0;
        this.classList.toggle("running", current.length > 0);
        this.handleTimer(current);

        this.sectionDetail.querySelectorAll("*").forEach((n) => n.remove());

        if (pending.length) {
            let node = this.sectionDetail.appendChild(
                document.createElement("status-progress-pending")
            );
            node.items = pending;
        }
        if (current.length) {
            let node = this.sectionDetail.appendChild(
                document.createElement("status-progress-current")
            );
            node.item = current[0];
        }
        if (failed.length) {
            let node = this.sectionDetail.appendChild(
                document.createElement("status-progress-failed")
            );
            node.items = failed;
        }
        if (done.length) {
            let node = this.sectionDetail.appendChild(
                document.createElement("status-progress-done")
            );
            node.items = done;
        }
    }

    handleTimer(current) {
        if (current.length && !runtimeInterval) {
            currentRuntime =
                new Date(current[0].updated_at) -
                new Date(current[0].start);
            runtimeInterval = setInterval(() => {
                this.runtime = Time.duration(new Date(currentRuntime));
                currentRuntime += 1000;
            }, 1000);
        } else if (!current.length) {
            clearInterval(runtimeInterval);
            runtimeInterval = false;
        }
    }

    async requestKill() {
        console.info("Kill of all ffmpeg processes requested");
        Request.post("/kill");
    }
}

Statusbar.template = /*html*/ `
<style>
:host {
    position: relative;
    box-shadow: 0 0 7vw 0 var(--clr-shadow-0);
    z-index: 0;
}
main {
    padding: .5em;
    font-size: max(10px, .85rem);
    background: var(--clr-bg-150);
    border: 2px var(--clr-bg-200);
    display: flex;
    gap: .5rem;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}
div {
    cursor: pointer;
}
div.hidden {
    display: none;
}
section:first-of-type {
    flex-grow: 1;
}
section {
    padding: 0 .5rem;
    border: 1px solid;
    border-color: var(--clr-bg-0) var(--clr-bg-0) var(--clr-bg-200) var(--clr-bg-200);
    background-color: var(--clr-bg-140);
    --duration: var(--transition-medium);
    transform-origin: bottom right;
    transition: transform var(--duration) ease-in-out,
                max-width var(--duration) ease-in-out,
                max-height var(--duration) ease-in-out;
}
section.detail {
    background: var(--clr-bg-150);
    border: 2px var(--clr-bg-200);
    box-shadow: 0 0 7vw 0 var(--clr-shadow-0);
    border-top-left-radius: .5rem;
    padding: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5em;
    position: absolute;
    right: 0;
    max-width: 90vw;
    transform: translateY(-100%) scaleY(1);
    transform-origin: top;
    top: 0;
    z-index: 0;
}
section.hidden {
    transform: translateY(0) scaleY(0);
}
.ffmpeg-out {
    color: var(--clr-text-disabled);
    display: flex;
    justify-content: space-between;
}
.ffmpeg-out .icon-stack {
    display: none;
}
:host(.running) .ffmpeg-out {
    color: var(--clr-text-0);
}
:host(.running) .ffmpeg-out .icon-stack {
    display: revert;
}
.runtime {
    position: relative;
}
.runtime span:last-of-type {
    position: absolute;
    inset: 0 0 1px;
    background: var(--clr-enlightened);
    box-shadow: 0 0 5px 5px inset var(--clr-enlightened-glow);
    color: var(--clr-text-200-inverse);
    overflow: hidden;
    border-radius: .2rem;
    text-indent: .5rem;
    max-width: 100%;
    white-space: nowrap;
}
</style>
${ICON_STACK_CSS}
<main>
    <section class="ffmpeg-out">
        <span>{{ this.out }}</span>
        <div class="icon-stack" @click="{{ this.requestKill }}">
            <span class="iconify" data-icon="mdi-skull-crossbones-outline"></span>
            <span class="iconify hover" data-icon="mdi-skull-crossbones-outline"></span>
        </div>
    </section>
    <section #ref="sectionRuntime" class="runtime">
        <span>{{ this.runtime }} / {{ this.remainTime }}</span>
        <span style="{{ 'width:' + this.percentage + '%' }}">{{ this.runtime }} / {{ this.remainTime }}</span>
    </section>
    <section #ref="sectionShort">{{ this.percentage }}%</section>
    <section #ref="buttonDetail">
        <div #ref="iconShort">
            <div class="icon-stack">
                <span class="iconify" data-icon="mdi-plus-box-outline"></span>
                <span class="iconify hover" data-icon="mdi-plus-box-outline"></span>
            </div>
        </div>
        <div #ref="iconDetail" class="hidden">
            <div class="icon-stack">
                <span class="iconify" data-icon="mdi-minus-box-outline"></span>
                <span class="iconify hover" data-icon="mdi-minus-box-outline"></span>
            </div>
        </div>
    </section>
</main>
<section #ref="sectionDetail" class="detail hidden"></section>
`;

customElements.define("status-bar", Statusbar);
