import { FilterModel } from "./FilterModel";
import { Enable } from "./Filters/Enable";

/**
 * @typedef {Object} DelogoData
 * @property {Number} [filterIndex]             idx of filter in filterGraph array
 * @property {String} [filterType]              delogo
 * @property {Number} [x]                       x coordinate
 * @property {Number} [y]                       y coordinate
 * @property {Number} [w]                       width
 * @property {Number} [h]                       height
 * @property {EnableData|Enable} [between]      enable between
 */

export class Delogo extends FilterModel {
    static filterType = "delogo";
    filterType = Delogo.filterType;
    type = "cpu";

    /**
     *
     * @param {Number} filterIndex
     * @param {DelogoData} options
     */
    constructor(
        filterIndex = null,
        { x = null, y = null, w = null, h = null, between = null } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        if (between instanceof Enable) {
            this.between = between;
        } else {
            this.between = new Enable(between?.from, between?.to);
        }
    }

    /**
     * returns filter data string representation
     * @returns {String}
     */
    toJSON() {
        return {
            filterIndex: this.filterIndex,
            filterType: this.filterType,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            between: this.between,
        };
    }

    set coords(value) {
        ({ x: this.x, y: this.y, w: this.w, h: this.h } = value);
    }

    get coords() {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
        };
    }
}
