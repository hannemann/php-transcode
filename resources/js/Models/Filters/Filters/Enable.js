import { VTime } from "../../../Helper/Time";

/**
 * @typedef {Object} EnableData
 * @property {Number} from      start time in seconds
 * @property {Number} to        end time in seconds
 */

export class Enable {
    #from;
    #to;
    /**
     * @param {Number} [from]   start time in seconds
     * @param {Number} [to]     end time in seconds
     */
    constructor(from = null, to = null) {
        this.from = from;
        this.to = to;
    }

    toJSON() {
        return {
            from: this.from.seconds,
            to: this.to.seconds,
        };
    }

    get from() {
        return this.#from;
    }

    set from(value) {
        if (VTime.isNumeric(value)) {
            value *= 1000;
        }
        this.#from = new VTime(value);
    }

    get to() {
        return this.#to;
    }

    set to(value) {
        if (VTime.isNumeric(value)) {
            value *= 1000;
        }
        this.#to = new VTime(value);
    }
}
