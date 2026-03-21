import { VideoEditor } from "../VideoEditor";
import FileHelper from "../../../../Helper/File";

class OutFileName extends VideoEditor {
    #fileNameInput;
    btnGuess;
    /**
     * @type {String}
     */
    path;

    connectedCallback() {
        requestAnimationFrame(() => {
            this.btnGuess = this.shadowRoot.querySelector('[data-ref="guess"]');
            this.addListeners();
            if (!this.fileName) this.handleEvent();
        });
    }

    addListeners() {
        this.btnGuess.addEventListener("click", this);
        return this;
    }

    disconnectedCallback() {
        this.btnGuess.removeEventListener("click", this);
    }

    handleEvent() {
        let fileName = this.path.split("/").pop();
        this.fileName = FileHelper.guessFileName(fileName);
    }

    get fileNameInput() {
        return (this.#fileNameInput ??=
            this.shadowRoot.querySelector('[data-ref="name"]'));
    }

    get fileName() {
        return this.fileNameInput.value;
    }

    set fileName(value) {
        this.fileNameInput.value = String(value);
    }
}

const CSS = css`
    :host {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    fieldset {
        border: 2px solid var(--clr-bg-200);
        padding: 1rem;
        background: var(--clr-bg-100);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border-radius: 0.25rem;

        div.flex-h {
            display: flex;
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
        width: 800px;
        font-size: var(--font-size-100);
    }
`;

OutFileName.template = html`
    <style>
        ${CSS}
    </style>
    <fieldset>
        <legend>Name:</legend>
        <label>
            <input data-ref="name" />
        </label>
        <theme-button data-ref="guess">Guess Name</theme-button>
    </fieldset>
`;

customElements.define("dialogue-outfilename", OutFileName);
