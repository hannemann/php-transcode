import { Slim, Iconify } from "@/components/lib";
import { ICON_STACK_CSS } from "../../Icons/Stack.css";

class AbstractModal extends Slim {
    constructor() {
        super();
        this.cancelAction = this.cancelAction.bind(this);
        this.confirmAction = this.confirmAction.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }

    async onAdded() {
        document.body.style.overflow = "hidden";
        requestAnimationFrame(this.show.bind(this));
        try {
            const p = () => this.promise;
            await p();
            if (!this.skipConfirm) {
                this.dispatchEvent(new CustomEvent("confirm"));
            }
        } catch (error) {
            this.dispatchEvent(new CustomEvent("cancel"));
            if (error) {
                console.error(error);
            }
        } finally {
            this.hide();
        }
    }

    show() {
        Iconify.scan(this.shadowRoot);
        if (this.cancelButton) {
            this.cancelButton.focus();
        }
        this.addEventListener(
            "transitionend",
            () => {
                document.dispatchEvent(
                    new CustomEvent("modal-show", { detail: true })
                );
                document.addEventListener("keyup", this.handleKey);
            },
            { once: true }
        );
        requestAnimationFrame(() => {
            this.classList.add("fade-in");
        });
    }

    hide() {
        document.removeEventListener("keyup", this.handleKey);
        this.addEventListener(
            "transitionend",
            () => {
                this.className = "";
                document.body.removeChild(this);
                document.body.style.overflow = "";
                document.dispatchEvent(
                    new CustomEvent("modal-show", { detail: false })
                );
            },
            { once: true }
        );
        this.classList.add("fade-out");
    }

    confirmAction() {
        this.resolve();
    }

    cancelAction() {
        this.reject();
    }

    closeAction() {
        this.skipConfirm = true;
        this.resolve();
    }

    handleKey(e) {
        if (this.cancelButton) {
            switch (e.key) {
                case "Escape":
                    this.reject();
                    break;
                case "ArrowLeft":
                    if (this.okButton.matches(":focus")) {
                        this.cancelButton.focus();
                    }
                    break;
                case "ArrowRight":
                    if (this.cancelButton.matches(":focus")) {
                        this.okButton.focus();
                    }
                    break;
            }
        }
    }

    canClose() {
        return this.dataset.closeButton;
    }
}

const MODAL_BASE_CSS = /*html*/ `<style>
:host {
    position: fixed;
    inset: 0;
    display: flex;
    transition: opacity var(--transition-medium) linear;
    justify-content: center;
    align-items: center;
    opacity: 0;
}
:host(.fade-in) {
    opacity: 1;
}
:host(.fade-out) {
    transition-duration: var(--transition-slow);
    opacity: 0;
}
main {
    max-width: 600px;
    min-width: 300px;
    background: var(--clr-bg-0);
    box-shadow: 0 0 10vw 3vw var(--clr-shadow-0);
    border: var(--window-border);
    border-radius: .5rem;
    padding: 1rem;
}
header {
    font-weight: bold;
    padding-bottom: 1em;
    border-bottom: 2px solid var(--clr-bg-100);
    user-select: none;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
}
section {
    padding-block: 1rem;
    overflow-wrap: break-word;
}
footer {
    padding: .5rem;
    display: flex;
    justify-content: flex-end;
    gap: .5rem;
}
button {
    background: var(--clr-bg-200);
    border: 2px solid var(--clr-bg-100);
    color: var(--clr-text-100);
    border-radius: 0;
    padding: .5rem;
    font-size: 1rem;
}
:host:not([data-close-button]) .close-button {
    display: none;
}
.close-button {
    font-size: 1.5rem;
}
:host([data-no-footer]) footer {
    display: none;
}
</style>
`;

const MODAL_TEMPLATE_BEGIN = /*html*/ `
${ICON_STACK_CSS}
<main>
    <header>
        {{ this.header }}
        <div @click="{{ this.closeAction() }}" class="icon-stack close-button">
            <span class="iconify" data-icon="mdi-close"></span>
            <span class="iconify hover" data-icon="mdi-close"></span>
        </div>
    </header>
    <section>
`;

const MODAL_TEMPLATE_END = /*html*/ `
    </section>
    <footer>
        <theme-button @click="{{ this.cancelAction() }}" #ref="cancelButton">Cancel</theme-button>
        <theme-button @click="{{ this.confirmAction() }}" #ref="okButton">OK</theme-button>
    </footer>
</main>
`;

export {
    AbstractModal,
    MODAL_BASE_CSS,
    MODAL_TEMPLATE_BEGIN,
    MODAL_TEMPLATE_END,
};
