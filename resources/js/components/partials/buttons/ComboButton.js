import { Iconify } from "@/components/lib";
import COMBO_BUTTON_DROPDOWN_CSS from "./ComboButton/DropdownCSS";
import { DomHelper } from "../../../Helper/Dom";

class ComboButton extends HTMLElement {
    connectedCallback() {
        this.initListeners().initDom().addListeners();

        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
            requestAnimationFrame(() => {
                this.shadowRoot
                    .querySelector("svg")
                    .setAttribute("part", "icon");
                this.shadowRoot
                    .querySelector("svg.hover")
                    .setAttribute("part", "icon icon-hover");
            });
        });
    }

    disconnecteCallback() {
        this.removeListeners();
    }

    initListeners() {
        this.click = this.click.bind(this);
        this.toggle = this.toggle.bind(this);
        this.setValue = this.setValue.bind(this);

        return this;
    }

    initDom() {
        const importNode = DomHelper.fromTemplate.call(this);
        this.button = importNode.querySelector("button");
        this.dropdown = importNode.querySelector(".dropdown");
        this.label = importNode.querySelector(".label");
        this.options = this.querySelectorAll("option");
        this.dummyOption = importNode.querySelector('[part="option"]');
        this.dummyOptionHover = importNode.querySelector(
            '[part="option-hover"]',
        );
        this.btnToggle = importNode.querySelector(".toggle");
        this.selectedIndex = this.options.length - 1;
        this.value = this.options[this.selectedIndex].value;
        this.label.innerText = this.options[this.selectedIndex].textContent;

        DomHelper.appendShadow.call(this, importNode);
        return this;
    }

    addListeners() {
        this.btnToggle.addEventListener("click", this.toggle);
    }

    removeListeners() {
        this.btnToggle.removeEventListener("click", this.toggle);
    }

    /**
     * @param {ClickEvent} e
     */
    toggle(e) {
        const path = e.composedPath();
        if (path.indexOf(this.wrapper) > -1 || path.indexOf(this) > -1) {
            e.stopPropagation();
        }
        if (this.wrapper) {
            if (
                e.target.tagName === "OPTION" &&
                path.indexOf(this.wrapper) > -1
            ) {
                this.setValue(e);
            }
            this.wrapper.remove();
            this.noScroll.remove();
            delete this.wrapper;
            delete this.noScroll;
            document.removeEventListener("click", this.toggle, { once: true });
        } else {
            this.noScroll = document.body.appendChild(
                document.createElement("div"),
            );
            this.noScroll.style.position = "fixed";
            this.noScroll.style.inset = 0;
            this.wrapper = document.createElement("div");
            this.options.forEach((o) => {
                this.wrapper.appendChild(o.cloneNode(true));
            });
            document.body.appendChild(this.wrapper);
            document.addEventListener("click", this.toggle, { once: true });
            this.wrapper.classList.add("combo-button-dropdown");
            this.applyWrapperPosition();
        }
    }

    applyWrapperPosition() {
        const styles = getComputedStyle(this.dropdown);
        const dim = this.button.getBoundingClientRect();
        this.wrapper.style.left = `${dim.right}px`;
        this.wrapper.style.top = `${
            dim.bottom + document.scrollingElement.scrollTop
        }px`;
        this.wrapper.style.minWidth = `calc(${
            dim.width
        }px - ${styles.getPropertyValue(
            "border-left-width",
        )} - ${styles.getPropertyValue("border-right-width")})`;
        this.wrapper.style.display = "revert";
        const wrapperDim = this.wrapper.getBoundingClientRect();
        if (wrapperDim.bottom > window.innerHeight) {
            this.wrapper.style.top = `${
                dim.top -
                wrapperDim.height +
                document.scrollingElement.scrollTop
            }px`;
        }
        this.wrapper.style.transform = "translate(-100%)";
    }

    /**
     * @param {ClickEvent} e
     */
    setValue(e) {
        this.value = e.target.value;
    }

    get value() {
        return this.options[this.selectedIndex].value;
    }

    set value(value) {
        const option = [...this.options].find((o) => o.value === value);
        if (!option) return;
        this.selectedIndex = [...this.options].findIndex((o) => o === option);
        this.label.innerText = option.textContent;
        this.dispatchEvent(new CustomEvent("change"));
    }
}

ComboButton.template = /*html*/ `
<style>
    :host {
        display: inline-block;
    }
    button {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }
    button:hover svg:not(.hover),
    button svg.hover {
        display: none;
    }
    button:hover svg.hover {
        display: revert;
    }
    .label {
        display: inline-block;
        flex-grow: 1;
    }
    .toggle {
        display: flex;
        align-items: center;
        padding-inline-start: inherit;
        margin-left: 1ch;
        cursor: pointer;
    }
    .dropdown {
        display: none;
        position: absolute;
        background: white;
    }
    ::slotted(option) {
        display: none;
    }
    ::slotted(.icon-stack) {
        margin-inline-start: .5rem;
    }
</style>
<button part="button">
    <slot name="icon"></slot>
    <span class="label" part="label"></span>
    <div class="toggle" part="toggle">
        <span class="iconify" data-icon="mdi-menu-down-outline"></span>
        <span class="iconify hover" data-icon="mdi-menu-down-outline"></span>
    </div>
</button>
<slot name="options"></slot>
<div class="dropdown" part="dropdown">
    <option part="option" />
    <option part="option-hover" />
</div>
`;

const dropDownStyle = document.createElement("style");
dropDownStyle.appendChild(document.createTextNode(COMBO_BUTTON_DROPDOWN_CSS));
document.querySelector(":root head").appendChild(dropDownStyle);

export { ComboButton };
