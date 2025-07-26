export default /*html*/ `
<style>
combo-button::part(button) {
    font-size: 1rem;
    color: var(--clr-text-100);
    background: var(--clr-bg-100);
    border: 2px  solid var(--clr-bg-200);
    transition-property: text-shadow, box-shadow, border-color, background-color, color;
    transition-timing-function: ease-out;
    transition-duration: var(--transition-medium);
    padding: 0;
}
combo-button:hover::part(button) {
    color: var(--clr-enlightened);
    background: var(--clr-bg-200);
    border-color: var(--clr-enlightened);
    text-shadow: 0 0 5px var(--clr-enlightened-glow), 0 0 10px var(--clr-enlightened-glow);
    box-shadow: 0 0 20px 0 var(--clr-enlightened-glow), 0 0 10px 0 inset var(--clr-enlightened-glow);
}
combo-button::part(icon-hover) {
    color: var(--active-icon-clr);
    filter: var(--active-icon-glow);
}
combo-button::part(label) {
    padding: .5rem;
}
combo-button::part(toggle) {
    position: relative;
    padding: .5rem;
}
combo-button::part(toggle)::before {
    content: '';
    position: absolute;
    left: -2px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--clr-bg-200);
}
combo-button:hover::part(toggle)::before {
    background: var(--clr-bg-200);
    box-shadow: 0 0 20px 0 var(--clr-enlightened-glow), 0 0 10px 0 inset var(--clr-enlightened-glow);
}
combo-button option {
    display: none;
}
</style>
`