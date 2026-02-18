import { FilterModel } from "./FilterModel";
import { Enable } from "./Filters/Enable";

/**
 * @typedef {Object} FillBordersData
 * @property {Number} [filterIndex]     idx of filter in filterGraph array
 * @property {String} [filterType]      delogo
 * @property {String} [color]           color
 * @property {String} [mode]            mode
 * @property {Number} [top]             top height
 * @property {Number} [right]           right width
 * @property {Number} [bottom]          bottom height
 * @property {Number} [left]            left width
 * @property {EnableData} [between]     enable between
 */

const filterType = "fillborders";

export class FillBorders extends FilterModel {
    filterType = filterType;
    type = "cpu";

    /**
     *
     * @param {Number} filterIndex
     * @param {FillBordersData} options
     */
    constructor(
        filterIndex = null,
        {
            color = "#000000",
            mode = "fixed",
            top = null,
            right = null,
            bottom = null,
            left = null,
            between: { from = null, to = null } = {},
        } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.color = color;
        this.mode = mode;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
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
            color: this.color,
            mode: this.mode,
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
            between: this.between,
        };
    }

    set borders(value) {
        ({
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
        } = value);
    }

    get borders() {
        return {
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
        };
    }
}
