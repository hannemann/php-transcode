import { FilterModel } from "./FilterModel";
import { Enable } from "./Filters/Enable";

/**
 * @typedef {Object} DelogoData
 * @property {Number} [filterIndex]      idx of filter in filterGraph array
 * @property {String} [filterType]        delogo
 * @property {Number} [x]                 x coordinate
 * @property {Number} [y]                 y coordinate
 * @property {Number} [w]                 width
 * @property {Number} [h]                 height
 * @property {EnableData} [between]       enable between
 */

export class Delogo extends FilterModel {
    filterType = "delogo";
    type = "cpu";

    /**
     *
     * @param {Number} filterIndex
     * @param {DelogoData} options
     */
    constructor(
        filterIndex = null,
        {
            x = null,
            y = null,
            w = null,
            h = null,
            between: { from = null, to = null } = {},
        } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.between = new Enable(from, to);
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
}
