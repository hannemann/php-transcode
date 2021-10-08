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
class Alert extends AbstractModal {
    alert() {
        return this.promise;
    }
}

Alert.template = /*html*/ `
${MODAL_BASE_CSS}
${MODAL_TEMPLATE_BEGIN}
    <slot></slot>
    </section>
    <footer>
        <theme-button @click="{{ this.confirmAction() }}" #ref="okButton">OK</theme-button>
    </footer>
</main>
`;

export { Alert };
