const ICON_STACK_CSS = /*css*/`
<style>
div.icon-stack {
    position: relative;
    width: 1em;
}
div.icon-stack svg {
    position: absolute;
    inset: 0;
    opacity: 1;
}
div.icon-stack svg {
    transition: opacity var(--transition-medium) ease-out;
}
div.icon-stack svg.inactive {
    color: var(--clr-disabled);
}
div.icon-stack svg.hover,
div.icon-stack svg.active,
div.icon-stack.active svg.inactive {
    opacity: 0;
}
div.icon-stack svg.hover,
div.icon-stack svg.active {
    color: var(--active-icon-clr);
    filter: var(--active-icon-glow);
}
div.icon-stack:hover svg.hover,
div.icon-stack.active svg.active {
    opacity: 1;
}
div.icon-stack.active:hover svg.hover {
    opacity: 0;
}
</style>
`

export {ICON_STACK_CSS};