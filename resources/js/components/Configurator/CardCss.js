const CARD_CSS = /*css*/`
<style>
main {
    background-color: var(--clr-bg-100);
    border-radius: .75rem;
    padding: .75rem;
}
main h2 {
    margin: 0;
    padding: 0;
    font-size: 1rem;
    user-select: none;
}
section, .sortable-placeholder {
    background-color: var(--clr-bg-150);
    border-radius: .5rem;
    padding: .5rem;
    margin: .35rem 0;
    font-size: --var(--font-size-50);
    flex-grow: 1;

    &.sortable-placeholder {
        opacity: .5;
        min-height: 1.2rem;
    }
}
section:last-child {
    margin-bottom: 0;
}
section.toggle > div {
    display: none;
}
section.toggle > div.visible {
    display: flex;
    align-items: center;
}
section.toggle > div[data-toggle="true"] {
    cursor: pointer;
}
section.toggle > div:not([data-toggle="true"]) {
    padding-left: 1rem;
}
div.stream {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;

    & > section {
        opacity: 1;
        transition: opacity var(--transition-slow) linear;
    }
}
div.stream[data-active]:not(:hover, [data-active="true"]) > section {
    opacity: .5;
}
</style>
`

export default CARD_CSS