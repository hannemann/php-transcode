import { Slim, Iconify } from "@/components/lib";

class ThemeButton extends Slim {
    focus() {
        requestAnimationFrame(() => {
            this.button.focus();
        });
    }
    blur() {
        requestAnimationFrame(() => {
            this.button.blur();
        });
    }
    matches(selector) {
        if (selector === ":focus") {
            return this.button.matches(":focus");
        }
        return super.matches(selector);
    }
}

ThemeButton.template = /*html*/ `
<style>
button {
    background: var(--clr-bg-100);
    color: var(--clr-text-100);
    font-size: 1rem;
    padding: .5rem;
    border: 2px solid var(--clr-bg-200);
    transition-property: text-shadow, box-shadow, border-color, background-color;
    transition-timing-function: ease-out;
    transition-duration: var(--transition-medium);
}
button:focus {
    border-color: var(--clr-enlightened);
    color: var(--clr-enlightened);
    background:var(--clr-bg-200);
}
button:focus-visible {
    outline: none;
}
button:hover {
    background:var(--clr-bg-200);
    color: var(--clr-enlightened);
    text-shadow: 0 0 5px var(--clr-enlightened-glow), 0 0 10px var(--clr-enlightened-glow);
    border-color: var(--clr-enlightened);
    box-shadow: 0 0 20px 0 var(--clr-enlightened-glow), 0 0 10px 0 inset var(--clr-enlightened-glow);
}</style>
<button part="button" #ref="button">
    <slot></slot>
</button>
`;

export { ThemeButton };
