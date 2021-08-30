import { Utils, Slim } from 'slim-js'
import '../../../../slim-directives'

class Stream extends Slim {}

const MAINSTART = /*html*/ `
<main>
    <h2>{{ this.header }}</h2>
    <div *foreach="{{ this.streams }}">
`

const MAINEND = /*html*/ `
    </div>
</main>
`

export {Stream, MAINSTART, MAINEND}