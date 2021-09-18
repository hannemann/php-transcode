const ICON_STACK_CSS = /*css*/`
<style>
.icon-stack {
    position: relative;
    width: 1em;
}
button.icon-stack {
    border: unset;
    background: unset;
}
.icon-stack svg {
    position: absolute;
    inset: 0;
    opacity: 1;
}
.icon-stack svg {
    transition: opacity var(--transition-medium) ease-out, color var(--transition-medium) ease-out;
}
.icon-stack svg {
    color: var(--clr-text-0);
}
.icon-stack:disabled svg {
    color: var(--clr-disabled);
}
.icon-stack:disabled svg.hover {
    opacity: 0;
}
.icon-stack:not(:disabled) svg.hover,
.icon-stack:not(:disabled) svg.active,
.icon-stack:not(:disabled).active svg.inactive {
    opacity: 0;
}
.icon-stack:not(:disabled) svg.hover,
.icon-stack:not(:disabled) svg.active {
    color: var(--active-icon-clr);
    filter: var(--active-icon-glow);
}
.icon-stack:not(:disabled):hover svg.hover,
.icon-stack:not(:disabled).active svg.active {
    opacity: 1;
}
.icon-stack:not(:disabled).active:hover svg.hover {
    opacity: 0;
}
</style>
`

export {ICON_STACK_CSS};