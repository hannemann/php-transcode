import { Slim } from 'slim-js';
import '../../../slim-directives';
import CARD_CSS from './CardCss';

class Clip extends Slim {}

Clip.template = /*html*/ `
${CARD_CSS}
<style>
div {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
<main>
    <h2>Clip</h2>
    <section>
        <div><span>From:</span><input></div>
        <div><span>To:</span><input></div>
    </section>
</main>
`

customElements.define('transcode-configurator-clip', Clip);