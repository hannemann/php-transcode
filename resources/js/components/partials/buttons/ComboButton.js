import { Slim, Iconify } from "@/components/lib";

class ComboButton extends Slim {
    constructor() {
        super();
        this.click = this.click.bind(this);
        this.toggle = this.toggle.bind(this);
        this.setValue = this.setValue.bind(this);
        this.options = this.querySelectorAll("option");
        this.selectedIndex = 0;
        this.value = this.options[0].value;
        this.label = this.options[0].textContent;
        this.nodeId = `combo-button-${performance.now()}`;
    }

    onAdded() {
        requestAnimationFrame(() => {
            Iconify.scan(this.shadowRoot);
            this.addOptionWrapperStylesheet();
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

    addOptionWrapperStylesheet() {
        let style = document.createElement("style");
        let css = `#${this.nodeId} {`;
        css += this.getCssRules(this.dropdown);
        css += `} #${this.nodeId} option {`;
        css += this.getCssRules(this.dummyOption);
        css += `} #${this.nodeId} option:hover {`;
        css += this.getCssRules(this.dummyOptionHover);
        css += "}";
        style.appendChild(document.createTextNode(css));
        document.querySelector(":root head").appendChild(style);
    }

    getCssRules(el) {
        let styles = getComputedStyle(el);
        let defaultStyles = getDefaultComputedStyle(el);
        let css = "";
        Array.from(styles).forEach((key) => {
            let value = styles.getPropertyValue(key);
            let priority = styles.getPropertyPriority(key);
            if (
                value != defaultStyles.getPropertyValue(key) ||
                priority != defaultStyles.getPropertyPriority(key)
            ) {
                css += `${key}: ${value} ${priority};`;
            }
        });
        return css;
    }

    /**
     * @param {ClickEvent} e
     */
    toggle(e) {
        const path = e.composedPath()
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
            this.noScroll = document.body.appendChild(document.createElement('div'))
            this.noScroll.style.position = 'fixed'
            this.noScroll.style.inset = 0
            this.wrapper = document.createElement("div");
            this.options.forEach((o) => {
                this.wrapper.appendChild(o.cloneNode(true));
            });
            document.body.appendChild(this.wrapper);
            document.addEventListener("click", this.toggle, { once: true });
            this.wrapper.id = this.nodeId;
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
            "border-left-width"
        )} - ${styles.getPropertyValue("border-right-width")})`;
        this.wrapper.style.display = "revert";
        const wrapperDim = this.wrapper.getBoundingClientRect();
        if (wrapperDim.bottom > window.innerHeight) {
            this.wrapper.style.top = `${
                dim.top - wrapperDim.height + document.scrollingElement.scrollTop
            }px`;
        }
        this.wrapper.style.transform = "translate(-100%)";
    }

    /**
     * @param {ClickEvent} e
     */
    setValue(e) {
        this.value = e.target.value;
        this.label = e.target.textContent;
        this.selectedIndex = Array.from(this.options).indexOf(
            e.explicitOriginalTarget
        );
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
    ::slotted(*) {
        display: none;
    }
</style>
<button #ref="button" part="button">
    <span class="label" part="label">{{ this.label }}</span>
    <div class="toggle" @click="this.toggle" part="toggle">
        <span class="iconify" data-icon="mdi-menu-down-outline"></span>
        <span class="iconify hover" data-icon="mdi-menu-down-outline"></span>
    </div>
</button>
<slot></slot>
<div class="dropdown" #ref="dropdown" part="dropdown">
    <option part="option" #ref="dummyOption"/>
    <option part="option-hover" #ref="dummyOptionHover"/>
</div>
`;

export { ComboButton };
