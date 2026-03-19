import {
    AbstractModal,
    MODAL_BASE_CSS,
    MODAL_TEMPLATE_BEGIN,
    MODAL_TEMPLATE_END,
} from "../Abstract";

/**
 * usage:
    async testModal() {
        const m = document.createElement("modal-confirm");
        m.header = "Cillum exercitation";
        const d = m.appendChild(document.createElement("dialogue-scale"));
        m.content =
            "Esse sit exercitation laborum sit nostrud labore qui cupidatat.";
        document.body.appendChild(m);
        try {
            await m.confirm();
            console.log("confirmed");
        } catch (error) {
            console.log("canceled");
        }
    }
 */
class Dialogue extends AbstractModal {
    #mainContainer;
    #isDragging = false;
    #startX;
    #startY;

    constructor() {
        super();
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();

        this.headerNode.addEventListener("pointerdown", this.handleMouseDown);
        this.addEventListener("pointermove", this.handleMouseMove);
        this.addEventListener("pointerup", this.handleMouseUp);

        const slot = this.shadowRoot.querySelector("slot");
        const main = this.shadowRoot.querySelector("main");

        slot.addEventListener("slotchange", () => {
            const isAuto = slot
                .assignedElements()
                .some((el) => el.classList.contains("auto-width"));

            main.dataset.autoWidth = isAuto.toString();
        });
    }

    disconnectedCallback() {
        this.headerNode.removeEventListener(
            "pointerdown",
            this.handleMouseDown,
        );
        this.removeEventListener("pointermove", this.handleMouseMove);
        this.removeEventListener("pointerup", this.handleMouseUp);
    }

    handleMouseDown(e) {
        this.#isDragging = true;
        this.#startX = e.clientX - this.mainContainer.offsetLeft;
        this.#startY = e.clientY - this.mainContainer.offsetTop;
        this.headerNode.style.cursor = "grabbing";
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.#isDragging) return;
        this.mainContainer.style.left = `${e.clientX - this.#startX}px`;
        this.mainContainer.style.top = `${e.clientY - this.#startY}px`;
    }

    handleMouseUp() {
        this.#isDragging = false;
        this.headerNode.style.cursor = "move";
    }

    open() {
        return this.promise;
    }

    get mainContainer() {
        return (this.#mainContainer ??= this.shadowRoot.querySelector("main"));
    }
}

const CSS = css`
    main {
        position: absolute;
    }
`;

Dialogue.template = html`
    <style>
        ${MODAL_BASE_CSS}
        ${CSS}
    </style>
    ${MODAL_TEMPLATE_BEGIN}
    <slot></slot>
    ${MODAL_TEMPLATE_END}
`;

export { Dialogue };
