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
}
section {
    background-color: var(--clr-bg-150);
    border-radius: .5rem;
    padding: .5rem;
    margin: .35rem 0;
    font-size: --var(--font-size-50);
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
</style>
`

export default CARD_CSS