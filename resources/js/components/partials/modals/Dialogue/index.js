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
    open() {
        return this.promise;
    }
}

Dialogue.template = /*html*/ `
${MODAL_BASE_CSS}
${MODAL_TEMPLATE_BEGIN}
    <slot></slot>
${MODAL_TEMPLATE_END}
`;

export { Dialogue };
