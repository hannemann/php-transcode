import { VideoEditor } from "../VideoEditor";
import { VIDEO_EXTENSIONS } from "../../../../Models/VideoStandards";

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
            this.handleEvent();
        });
    }

    addListeners() {
        this.btnGuess.addEventListener("click", this);
        return this;
    }

    disconnectedCallback() {
        this.btnGuess.removeEventListener("click", this);
    }

    handleEvent(e) {
        let fileName = this.path.split("/").pop();
        const hasEpisode = this.hasEpisode(fileName);
        if (hasEpisode) {
            const { episode, title, ext } = hasEpisode.groups;
            fileName = `${episode}.${title}.${ext}`;
        } else {
            fileName = fileName
                .replace(/---/g, " - ")
                .replace(/([^\s])-([^\s])/g, "$1 $2");
        }
        this.fileName = fileName;
    }

    /**
     * detect episode descriptor
     * @param {String} filename
     * @returns
     */
    hasEpisode(filename) {
        const episode = "(?<episode>S[0-9]{2}E[0-9]{2})";
        const title = "(?<title>.*)";
        const ext = `\.(?<ext>(${VIDEO_EXTENSIONS.join("|")}))`;
        const reg = new RegExp(`.*${episode}(?:-*)${title}${ext}$`);
        return filename.match(reg);
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
