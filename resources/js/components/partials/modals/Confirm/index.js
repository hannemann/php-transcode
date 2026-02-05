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

    set content(value) {
        this.contentNode.innerText = value;
    }
}

Confirm.template = /*html*/ `
${MODAL_BASE_CSS}
<style>
    :host {
        z-index: 100;
    }
</style>
${MODAL_TEMPLATE_BEGIN}
${MODAL_TEMPLATE_END}
`;

export { Confirm };
