import { FilterModel } from "./FilterModel";

/**
 * @typedef {Object} CropData
 * @property {Number} [filterIndex]     idx of filter in filterGraph array
 * @property {String} [filterType]      pad
 * @property {Number} [cw]              width
 * @property {Number} [ch]              height
 * @property {Number} [cy]              top
 * @property {Number} [cx]              left
 */

const filterType = "crop";

export class Crop extends FilterModel {
    filterType = filterType;

    /**
     * @param {Number} [filterIndex]
     * @param {CropData} [options]
     */
    constructor(
        filterIndex = null,
        { cw = null, ch = null, cy = null, cx = null } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.cw = cw;
        this.ch = ch;
        this.cx = cx;
        this.cy = cy;
    }

    /**
     * returns filter data string representation
     * @returns {String}
     */
    toJSON() {
        return {
            filterIndex: this.filterIndex,
            filterType: this.filterType,
            cw: this.cw,
            ch: this.ch,
            cx: this.cx,
            cy: this.cy,
        };
    }
}
