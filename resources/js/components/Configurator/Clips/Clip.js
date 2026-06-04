import { DomHelper } from "../../../Helper/Dom";
import { Iconify } from "@/components/lib";
import { ICON_STACK_CSS } from "@/components/Icons/Stack.css";
import CARD_CSS from "../CardCss";
import { requestPlay } from "../Tools/player";
import { VTime } from "../../../Helper/Time";

class Clip extends HTMLElement {
    constructor() {
        super();
        DomHelper.initDom.call(this);
        this.setTimecode = this.setTimecode.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.bindListener();
        this.valid = true;
    }

    bindListener() {
        this.handleAdd = this.handleAdd.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handlePlay = this.handlePlay.bind(this);
    }

    connectedCallback() {
        this.inputFrom.value = this.clipData.from;
        this.inputTo.value = this.clipData.to;
        this.btnAdd.addEventListener("click", this.handleAdd);
        this.btnRemove.addEventListener("click", this.handleRemove);
        this.btnPlay.addEventListener("click", this.handlePlay);
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
            [this.inputFrom, this.inputTo].forEach((i) => {
                i.setCustomValidity("Timecode invalid: 00:00:00.000");
                requestAnimationFrame(() => i.setCustomValidity(""));
                i.addEventListener("focus", this.handleFocus);
                i.addEventListener("blur", this.handleBlur);
                i.addEventListener("keydown", this.handleKey);
                i.addEventListener("input", this.setTimecode);
            });
        });
    }

    disconnectedCallback() {
        this.btnAdd.removeEventListener("click", this.handleAdd);
        this.btnRemove.removeEventListener("click", this.handleRemove);
        this.btnPlay.removeEventListener("click", this.handlePlay);
        [this.inputFrom, this.inputTo].forEach((i) => {
            i.removeEventListener("focus", this.handleFocus);
            i.removeEventListener("blur", this.handleBlur);
            i.removeEventListener("keydown", this.handleKey);
            i.removeEventListener("input", this.setTimecode);
        });
    }

    setTimecode(e) {
        let input = e.currentTarget;
        this.clipData[input.name] = input.value;
        input.reportValidity();
        if (input.validity.patternMismatch) {
            input.setCustomValidity("Timecode invalid: HH:MM:SS.mss");
        } else {
            input.setCustomValidity("");
        }
        this.valid =
            this.shadowRoot.querySelectorAll("input:valid").length === 2;
        this.dispatchEvent(
            new CustomEvent("updateclip", { detail: this.clipData }),
        );
    }

    handleAdd() {
        this.dispatchEvent(
            new CustomEvent("clipinsert", { detail: this.clipData }),
        );
    }

    handleRemove() {
        this.dispatchEvent(
            new CustomEvent("clipremove", { detail: this.clipData }),
        );
    }

    handleFocus() {
        this.dispatchEvent(
            new CustomEvent("clipfocus", { detail: this.clipData }),
        );
    }

    handleBlur() {
        this.dispatchEvent(
            new CustomEvent("clipblur", { detail: this.clipData }),
        );
    }

    handlePlay() {
        const to = new VTime(this.clipData.to);
        const start = new VTime(to - 2000).coord;
        let end;
        const next = this.configurator.clips.clips[this.index + 1];
        if (next) {
            end = new VTime(new VTime(next.from) + 10000).coord;
        } else {
            end = new VTime(to + 15 * 60 * 1000).coord;
        }
        requestPlay.call(this.configurator, start, end);
    }

    handleKey(e) {
        let prevent = false;
        switch (e.key) {
            case "Tab":
                if (
                    !e.shiftKey &&
                    this.isLast &&
                    e.currentTarget === this.inputTo
                ) {
                    this.handleAdd();
                    prevent = true;
                }
                break;
            case "-":
                this.handleRemove();
                prevent = true;
                break;
            case "+":
                this.handleAdd();
                prevent = true;
                break;
        }
        prevent && e.preventDefault();
    }

    set cutpoint(value) {
        this.labelCutPoint.innerText = value;
    }

    get inputFrom() {
        return this.shadowRoot.querySelector('input[name="from"]');
    }

    get inputTo() {
        return this.shadowRoot.querySelector('input[name="to"]');
    }

    get labelCutPoint() {
        return this.shadowRoot.querySelector(".cutpoint");
    }

    get btnPlay() {
        return this.shadowRoot.querySelector('[data-ref="play"]');
    }

    get btnAdd() {
        return this.shadowRoot.querySelector(".icon-stack.plus");
    }

    get btnRemove() {
        return this.shadowRoot.querySelector(".icon-stack.minus");
    }

    set canRemove(value) {
        this.btnRemove.disabled = !value;
    }
}

Clip.prototype.pattern = "^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$";

const CSS = css`
    section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
    }
    .input {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex-grow: 1;
    }
    .input > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;

        & > span {
            flex-grow: 1;
            display: flex;
            align-items: baseline;

            .cutpoint {
                flex-grow: 1;
            }
        }
    }
    .cutpoint {
        font-size: max(10px, 0.75rem);
        padding-left: 0.5rem;
    }
    input {
        border: 3px solid transparent;
        text-align: right;
        width: 12ch;
    }
    input:invalid {
        border: 3px dashed
            hsla(
                var(--hue-alert),
                var(--sat-alert),
                var(--lit-alert),
                var(--clr-base-alpha)
            );
    }
    .icon-stack {
        font-size: var(--font-size-200);
        height: 1em;
        cursor: pointer;
    }
    .minus:disabled {
        cursor: default;
    }
`;

Clip.template = html`
    <style>
        ${CARD_CSS}
        ${ICON_STACK_CSS}
        ${CSS}
    </style>
    <section>
        <div class="input">
            <div>
                <span>From:</span>
                <input
                    placeholder="0:0:0.0"
                    name="from"
                    pattern="${Clip.prototype.pattern}"
                />
            </div>
            <div>
                <span
                    >To:<span class="cutpoint"></span>
                    <div
                        class="icon-stack"
                        data-ref="play"
                        title="Play from 2 seconds before cutpoint"
                    >
                        <span class="iconify" data-icon="mdi-play"></span>
                        <span
                            class="iconify hover"
                            data-icon="mdi-play"
                        ></span></div
                ></span>
                <input
                    placeholder="0:0:0.0"
                    name="to"
                    pattern="${Clip.prototype.pattern}"
                />
            </div>
        </div>
        <div class="icon-stack plus">
            <span class="iconify" data-icon="mdi-plus-outline"></span>
            <span class="iconify hover" data-icon="mdi-plus-outline"></span>
        </div>
        <button class="icon-stack minus" tabindex="-1">
            <span class="iconify" data-icon="mdi-minus"></span>
            <span class="iconify hover" data-icon="mdi-minus"></span>
        </button>
    </section>
`;

customElements.define("transcode-configurator-clip", Clip);
