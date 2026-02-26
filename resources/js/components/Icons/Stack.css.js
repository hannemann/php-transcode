export const ICON_STACK_CSS = css`
    .icon-stack {
        position: relative;
        width: 1em;
        height: 1em;

        &:is(button) {
            border: unset;
            background: unset;
        }

        svg {
            position: absolute;
            inset: 0;
            opacity: 1;
            transition:
                opacity var(--transition-medium) ease-out,
                color var(--transition-medium) ease-out;
            color: var(--clr-text-0);
        }

        &:disabled svg {
            color: var(--clr-disabled);

            &.hover {
                opacity: 0;
            }
        }

        &:not(:disabled) {
            svg:is(.hover, .active),
            &.active svg.inactive {
                opacity: 0;
            }

            svg:is(.hover, .active) {
                color: var(--active-icon-clr);
                filter: var(--active-icon-glow);
            }

            &:hover svg.hover,
            &.active svg.active {
                opacity: 1;
            }

            &.active:hover svg.hover {
                opacity: 0;
            }
        }
    }
`;
