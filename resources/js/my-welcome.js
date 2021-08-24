import { Slim } from 'slim-js';
import '../../node_modules/slim-js/dist/directives/all';

class Greeter extends Slim {

    onRender() {this.greet(this.dataset.whoToGreet)}

    greet(value) {
        console.log(this);
        this.shadowRoot.querySelector('my-greeting').who = value;
    }
}

Greeter.template = /*html*/ `
<style>

    input {
        color: var(--clr);
    }

</style>
<input placeholder="Who would you like to greet?" @input="this.greet(event.target.value)">
<hr/>
<my-greeting .who="{{this.whoToGreet}}"></my-greeting>
`;

customElements.define('welcome-app', Greeter);