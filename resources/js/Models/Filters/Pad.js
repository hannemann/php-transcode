import { FilterModel } from "./FilterModel";
import { getStandardByHeight } from "../VideoStandards";

/**
 * @typedef {Object} PadData
 * @property {Number} [filterIndex]     idx of filter in filterGraph array
 * @property {String} [filterType]      pad
 * @property {String} [color]           color
 * @property {Number} [top]             top height
 * @property {Number} [left]            right width
 * @property {Number} [width]           bottom height
 * @property {Number} [height]          left width
 */

const filterType = "pad";

export class Pad extends FilterModel {
    filterType = filterType;
    standard;

    /**
     * @param {Number} [filterIndex]
     * @param {PadData} [options]
     */
    constructor(
        filterIndex = null,
        { color = "#000000", cw = null, ch = null, cy = null, cx = null } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.color = color;
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
            color: this.color,
            cw: this.cw,
            ch: this.ch,
            cx: this.cx,
            cy: this.cy,
        };
    }

    proposeStandard(height) {
        const standard = getStandardByHeight(height);
        if (!standard) return;
        this.standard = standard[0];
        this.cw = standard[1].width;
        this.ch = standard[1].height;
    }
}
