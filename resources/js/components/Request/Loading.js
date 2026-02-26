import { DomHelper } from "../../Helper/Dom";
import Iconify from "@iconify/iconify";

class Loading extends HTMLElement {
    connectedCallback() {
        DomHelper.initDom.call(this);
        document.addEventListener("loading", (e) =>
            this.classList.toggle("active", !!e.detail),
        );
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }
}

const CSS = css`
    :host {
        position: fixed;
        inset: 0;
        background-color: transparent;
        transition: var(--loading-transition);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    :host(.active) {
        background-color: var(--clr-bg-0-translucent);
    }
    :host(:not(.active)) {
        display: none;
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @keyframes pulse {
        from {
            opacity: 0.25;
        }
        to {
            opacity: 1;
        }
    }
    main {
        animation: spin 1s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
        font-size: 5rem;
        position: relative;
        width: 1em;
        height: 1em;
    }
    svg {
        animation: pulse 500ms infinite alternate linear;
        color: var(--clr-disabled);
        position: absolute;
        inset: 0;
    }
    svg.glow {
        color: var(--active-icon-clr);
        filter: var(--active-icon-glow);
    }
`;

Loading.template = html`
    <style>
        ${CSS}
    </style>
    <main>
        <span class="iconify" data-icon="mdi-circle-outline"></span>
        <span class="iconify glow" data-icon="mdi-loading"></span>
    </main>
`;

customElements.define("transcoder-loading", Loading);
