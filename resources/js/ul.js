import { Slim } from 'slim-js';
import '../../node_modules/slim-js/dist/directives/all';

class AwesomeUl extends Slim {

    constructor() {
        super();
        this.items = ['Boing']
    }

}

AwesomeUl.template = /*html*/`
    <ul>
        <li><h1>Items:</h1></li>
        <li *foreach="{{this.items}}">{{ item }}</li>
    </ul>
`;

customElements.define('awesome-ul', AwesomeUl);