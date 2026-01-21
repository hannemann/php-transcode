import { DomHelper } from "../../../Helper/Dom";

const SKIP_CODECS = ["dvb_teletext", "bin_data"];

class Concat extends HTMLElement {
    connectedCallback() {
        DomHelper.initDom.call(this);
    }

    get filesContainer() {
        return this.shadowRoot.querySelector('fieldset[data-type="files"] div');
    }

    get streamsContainer() {
        return this.shadowRoot.querySelector(
            'fieldset[data-type="streams"] div',
        );
    }

    set streams(items) {
        this.streamsContainer.replaceChildren(
            ...items.map((item) => {
                const l = document.createElement("label");
                const i = document.createElement("input");
                const s = document.createElement("span");
                s.innerText = `${item.index} ${item.codec_name}`;
                i.type = "checkbox";
                i.checked = SKIP_CODECS.indexOf(item.codec_name) < 0;
                i.dataset.item = JSON.stringify(item);
                l.append(s, i);
                return l;
            }),
        );
    }

    get streams() {
        return Array.from(this.streamsContainer.querySelectorAll("input"))
            .filter((i) => i.checked)
            .map((i) => JSON.parse(i.dataset.item));
    }

    set files(items) {
        this.filesContainer.replaceChildren(
            ...items.map((item) => {
                const l = document.createElement("label");
                const i = document.createElement("input");
                const s = document.createElement("span");
                s.innerText = `${item.name}`;
                i.type = "checkbox";
                i.checked = true;
                i.dataset.item = JSON.stringify(item);
                l.append(s, i);
                return l;
            }),
        );
    }

    get files() {
        return Array.from(this.filesContainer.querySelectorAll("input"))
            .filter((i) => i.checked)
            .map((i) => JSON.parse(i.dataset.item));
    }
}

Concat.template = html`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        fieldset {
            border: 2px solid var(--clr-bg-200);
            padding: 1rem;
            background: var(--clr-bg-100);
            border-radius: 0.25rem;

            div {
                display: grid;
                gap: 0.5rem;
            }
        }
        legend {
            background: var(--clr-bg-0);
            padding: 0.25rem;
            border-radius: 0.25rem;
        }
        label {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
        }
        input {
            accent-color: var(--clr-enlightened);
        }
        input:checked {
            box-shadow: 0 0 10px 3px var(--clr-enlightened-glow);
        }
    </style>
    <fieldset data-type="files">
        <legend>Files:</legend>
        <div></div>
    </fieldset>
    <fieldset data-type="streams">
        <legend>Streams:</legend>
        <div></div>
    </fieldset>
`;

customElements.define("dialogue-concat", Concat);
