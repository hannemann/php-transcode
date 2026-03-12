export default css`
    .combo-button-dropdown {
        color: var(--clr-text-100);
        background: var(--clr-bg-100);
        border: 2px solid var(--clr-bg-200);
        position: absolute;
    }
    .combo-button-dropdown option {
        padding-inline: 0.5rem;
        text-align: right;
    }
    .combo-button-dropdown option:not([disabled]):hover {
        background: var(--clr-bg-200);
        text-shadow:
            0 0 5px var(--clr-enlightened-glow),
            0 0 10px var(--clr-enlightened-glow);
        color: var(--clr-enlightened);
    }
`;
