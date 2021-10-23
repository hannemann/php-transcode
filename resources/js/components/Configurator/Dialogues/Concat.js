import { Slim, Utils } from "@/components/lib";

const SKIP_CODECS = ["dvb_teletext"];

class Concat extends Slim {
    onAdded() {
        requestAnimationFrame(() => {
            if (this.deferredStreams) {
                this.streams = this.deferredStreams;
                delete this.deferredStreams;
            }
            if (this.deferredFiles) {
                this.files = this.deferredFiles;
                delete this.deferredFiles;
            }
        });
    }

    set streams(items) {
        if (!this.streamsContainer) {
            this.deferredStreams = items;
        } else {
            this.emptyContainer(this.streamsContainer);
            items.forEach((item) => {
                const l = document.createElement("label");
                const i = document.createElement("input");
                const s = document.createElement("span");
                s.innerText = `${item.index} ${item.codec_name}`;
                i.type = "checkbox";
                i.checked = SKIP_CODECS.indexOf(item.codec_name) < 0;
                i.dataset.item = JSON.stringify(item);
                l.appendChild(s);
                l.appendChild(i);
                this.streamsContainer.appendChild(l);
            });
        }
    }

    get streams() {
        if (!this.streamsContainer) return [];
        return Array.from(this.streamsContainer.querySelectorAll("input"))
            .filter((i) => i.checked)
            .map((i) => JSON.parse(i.dataset.item));
    }

    set files(items) {
        if (!this.filesContainer) {
            this.deferredFiles = items;
        } else {
            this.emptyContainer(this.filesContainer);
            items.forEach((item) => {
                const l = document.createElement("label");
                const i = document.createElement("input");
                const s = document.createElement("span");
                s.innerText = `${item.name}`;
                i.type = "checkbox";
                i.checked = true;
                i.dataset.item = JSON.stringify(item);
                l.appendChild(s);
                l.appendChild(i);
                this.filesContainer.appendChild(l);
            });
        }
    }

    get files() {
        if (!this.filesContainer) return [];
        return Array.from(this.filesContainer.querySelectorAll("input"))
            .filter((i) => i.checked)
            .map((i) => JSON.parse(i.dataset.item));
    }

    emptyContainer(container) {
        container
            .querySelectorAll("label")
            .forEach((l) => l.parentNode.removeChild(l));
    }
}

Concat.template = /*html*/ `
<style>
    :host {
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }
    fieldset {
        border: 2px solid var(--clr-bg-200);
        padding: 1rem;
        background: var(--clr-bg-100);
        display: flex;
        flex-direction: column;
        gap: .5rem;
        border-radius: 0.25rem;
    }
    legend {
        background: var(--clr-bg-0);
        padding: .25rem;
        border-radius: 0.25rem;
    }
    label {
        display: flex;
        justify-content: space-between;
        gap: .5rem;
    }
    input {
        accent-color: var(--clr-enlightened);
    }
    input:checked {
        box-shadow: 0 0 10px 3px var(--clr-enlightened-glow);
    }
</style>
<fieldset #ref="filesContainer">
    <legend>Files:</legend>
    <label>
        <span>{{ item.name }}</span><input type="checkbox" value="{{  }}">
    </label>
</fieldset>
<fieldset #ref="streamsContainer">
    <legend>Streams:</legend>
    <label>
        <span>{{ item.name }}</span><input type="checkbox" value="{{  }}">
    </label>
</fieldset>
`;

customElements.define("dialogue-concat", Concat);
