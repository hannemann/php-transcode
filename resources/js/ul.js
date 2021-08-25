import { Slim } from 'slim-js';
import '../../node_modules/slim-js/dist/directives/all';

class AwesomeUl extends Slim {

    constructor() {
        super();
        this.items = []
    }
    setItems() {
        this.items = [
            {name: 'lala', type: 'd'},
            {name: 'boing', type: 'f'}
        ]
    }
}

AwesomeUl.template = /*html*/`
    <div>
        <div><h1 @click="this.setItems()"><slot></slot></h1></div>
        <div *foreach="{{this.items}}">{{ item.name }}</div>
    </div>
`;

customElements.define('awesome-ul', AwesomeUl);