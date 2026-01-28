import { VideoEditor, EDITOR_TEMPLATE, EDITOR_CSS } from "../VideoEditor";

class Clipper extends VideoEditor {
    clips = [];
    raw = [];

    connectedCallback() {
        super.connectedCallback();
        requestAnimationFrame(() => {
            this.calculateClips();
        });
    }

    bindListeners() {
        super.bindListeners();
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.getClipPos = this.getClipPos.bind(this);
        this.activateClip = this.activateClip.bind(this);
    }

    addListeners() {
        super.addListeners();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);

        this.btnAdd.addEventListener("pointerup", this.add);
        this.btnRemove.addEventListener("pointerup", this.remove);
    }

    removeListeners() {
        super.removeListeners();
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);

        this.btnAdd.removeEventListener("pointerup", this.add);
        this.btnRemove.removeEventListener("pointerup", this.remove);

        this.removeClipListeners();
    }

    removeClipListeners() {
        this.indicator.querySelectorAll(".clip").forEach((c) => {
            c.removeEventListener("click", this.activateClip);
        });
        this.clipsContainer
            .querySelectorAll("clip")
            .forEach((c) => c.removeEventListener("click", this.activateClip));
    }

    add() {
        this.raw.push(this.current);
        this.raw.sort((a, b) => a > b);
        this.calculateClips();
        this.dispatchEvent(
            new CustomEvent("clipper", { detail: this.timestamp() }),
        );
    }

    remove() {
        const idx = this.raw.indexOf(this.current);
        if (idx > -1) {
            this.raw.splice(idx, 1);
            this.raw.sort((a, b) => a > b);
            this.calculateClips();
        }
    }

    setClips(clips) {
        this.raw = clips;
    }

    activateClip(e) {
        const idx = e.currentTarget.dataset.index;
        const item = this.clips[idx];
        this.clipsContainer
            .querySelectorAll(".active")
            .forEach((a) => a.classList.remove("active"));
        if (this.current === item.raw.start && item.raw.end) {
            this.current = item.raw.end;
            this.clipsContainer
                .querySelector(`[data-index="${idx}"] div:last-of-type`)
                .classList.add("active");
        } else {
            this.current = item.raw.start;
            this.clipsContainer
                .querySelector(`[data-index="${idx}"] div:first-of-type`)
                .classList.add("active");
        }
        this.updateImages();
    }

    clipEndTimestamp(seconds) {
        return seconds ? this.timestamp(seconds) : "-";
    }

    calculateClips() {
        this.removeClipListeners();
        this.indicator.querySelectorAll(".clip").forEach((c) => c.remove());
        this.clips = [];
        const indicatorClips = [];
        const clipTimestamps = [];
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
            this.clips.push(clip);
            indicatorClips.push(this.creatClipIndicator(clip, end));
            clipTimestamps.push(this.createClipTimestamp(clip));
        }
        this.indicator.append(...indicatorClips);
        this.clipsContainer.replaceChildren(...clipTimestamps);
    }

    creatClipIndicator(item, end) {
        const node = document.createElement("div");
        node.style.left = `${item.percentage.start}%`;
        node.style.width = end ? `${item.percentage.length}%` : "1px";
        node.dataset.index = item.index;
        node.classList.add("clip");
        node.addEventListener("click", this.activateClip);
        return node;
    }

    createClipTimestamp(item) {
        const clip = document.createElement("div");
        const start = document.createElement("div");
        const end = document.createElement("div");

        clip.dataset.index = item.index;
        clip.addEventListener("click", this.activateClip);

        clip.classList.add("clip");
        start.classList.add("timestamp");
        end.classList.add("timestamp");

        start.innerText = item.raw.start ? this.timestamp(item.raw.start) : "";
        end.innerText = item.raw.end ? this.timestamp(item.raw.end) : "";

        clip.append(start, end);
        return clip;
    }

    getClipPos(item) {
        if (item.percentage.start && item.percentage.length) {
            return `left: ${item.percentage.start}%;width:${item.percentage.length}%`;
        }
        return `left: ${item.percentage.start}%;width:1px`;
    }

    get clipsContainer() {
        return this.shadowRoot.querySelector(".clips");
    }
}

Clipper.template = html`
    ${EDITOR_CSS}
    <style>
        .status {
            div:has(.nav) {
                .nav.move {
                    display: revert;
                }
            }

            .time div {
                &.btn-add,
                &.btn-remove {
                    display: revert;
                }
            }
        }
        .indicator .clip {
            position: absolute;
            inset-block: 0;
            background: hsla(
                var(--hue-success) var(--sat-alert) var(--lit-alert) / 0.5
            );
            z-index: 1;
        }
        .help,
        .clips {
            font-size: 0.75rem;
            white-space: nowrap;
        }
        .help {
            grid-area: left;
        }
        .help dl {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-column-gap: 0.5rem;
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
            grid-row-gap: 0.25rem;
            justify-self: end;
        }
        .clips .clip:nth-child(odd) {
            background: var(--clr-bg-100);
        }
        .clips .clip .timestamp {
            cursor: pointer;
            padding: 0.125rem;
        }
        .clips .clip .timestamp.active {
            background: var(--clr-bg-200);
            color: var(--clr-enlightened);
        }
    </style>
    ${EDITOR_TEMPLATE}
    <div class="help">
        <dl>
            <dt>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
            </dt>
            <dd>+/-1 Frame</dd>
            <dt>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
                + Shift
            </dt>
            <dd>+/-2 Seconds</dd>
            <dt>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
                + Ctrl
            </dt>
            <dd>+/-5 Seconds</dd>
        </dl>
        <dl>
            <dt>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
            </dt>
            <dd>+/-1 Minute</dd>
            <dt>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                + Shift
            </dt>
            <dd>+/-5 Minutes</dd>
            <dt>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                + Ctrl
            </dt>
            <dd>+/-10 Minutes</dd>
        </dl>
        <dl>
            <dt>+</dt>
            <dd>Add</dd>
            <dt>-</dt>
            <dd>Remove</dd>
        </dl>
        <dl>
            <dt>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
                <span class="iconify" data-icon="mdi-swap-vertical-bold"></span>
                + Alt
            </dt>
            <dd>Move</dd>
            <dt>
                <span
                    class="iconify"
                    data-icon="mdi-swap-horizontal-bold"
                ></span>
                + Ctrl/Shift
            </dt>
            <dd>Skip</dd>
        </dl>
    </div>
    <div class="clips"></div>
`;

customElements.define("dialogue-clipper", Clipper);
