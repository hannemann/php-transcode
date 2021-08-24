import { Slim } from 'slim-js';
import '../../node_modules/slim-js/dist/directives/all';

import './my-welcome';
import './ul';

class AwesomeComponent extends Slim {
  constructor() {
    super();
    this.username = 'John Jimmy Junior';
  }

  click(event) {
    console.log(event)
  }
}

AwesomeComponent.template = /*html*/`<h1 @click="this.click(event)">Welcome, {{this.username}}!</h1>`;

customElements.define('my-awesome-component', AwesomeComponent);

Slim.element(
  'my-counter',
  `
    <button @click="this.dec()"> - </button>
    <span>{{this.count}}</span>
    <button @click="this.inc()"> + </button>
  `,
  class MyCounter extends Slim {
    constructor() {
      super();
      this.count = 0;
    }
    inc() {
      this.count++
    }
    dec() {
      this.count--
    }
  }
);


Slim.element(
  'my-greeting',
  /*html*/ `
    <h1>Hello, {{this.who}}!</h1>
  `
);

