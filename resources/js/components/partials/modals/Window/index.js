import {
    AbstractModal,
    MODAL_BASE_CSS,
    MODAL_TEMPLATE_BEGIN,
    MODAL_TEMPLATE_END,
} from "../Abstract";

class Window extends AbstractModal {
    open() {
        return this.promise;
    }
}

Window.template = /*html*/ `
${MODAL_BASE_CSS}
<style>
    main {
        position: absolute;
        box-shadow: 0 0 10vw 3vw var(--clr-shadow-0);
        inset: var(--window-inset);
        border-radius: var(--window-border-radius);
        background-color: var(--clr-bg-0);
        padding: min(30px, var(--rel-gutter-200));
        max-width: revert;
        min-width: revert;
        display: grid;
        grid-template-rows: max-content auto max-content;
    }
    :host(.no-shadow) main {
        box-shadow: none;
    }
    main > section {
        overflow-y: auto;
    }
</style>
${MODAL_TEMPLATE_BEGIN}
    <slot></slot>
${MODAL_TEMPLATE_END}
`;

export { Window };
