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
class Confirm extends AbstractModal {
    confirm() {
        return this.promise;
    }
}

Confirm.template = /*html*/ `
${MODAL_BASE_CSS}
${MODAL_TEMPLATE_BEGIN}
    {{ this.content }}
${MODAL_TEMPLATE_END}
`;

export { Confirm };
