import { FilterModel } from "./FilterModel";

/**
 * @typedef {Object} ScaleData
 * @property {Number} [filterIndex]     idx of filter in filterGraph array
 * @property {String} [filterType]      scale
 * @property {Number} [width]           width
 * @property {Number} [height]          height
 * @property {String} [aspect]          aspect ratio
 */

const filterType = "scale";

export class Scale extends FilterModel {
    filterType = filterType;

    /**
     * @param {Number} [filterIndex]
     * @param {CropData} [options]
     */
    constructor(
        filterIndex = null,
        { width = null, height = null, aspect = null } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.width = width;
        this.height = height;
        this.aspect = aspect;
    }

    /**
     * returns filter data string representation
     * @returns {String}
     */
    toJSON() {
        return {
            filterIndex: this.filterIndex,
            filterType: this.filterType,
            width: this.width,
            height: this.height,
            aspect: this.aspect,
        };
    }
}
