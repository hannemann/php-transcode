import { FilterModel } from "./FilterModel";
import { Enable } from "./Filters/Enable";
import { VTime } from "../../Helper/Time";

/**
 * @typedef {Object} RemoveLogoData
 * @property {Number} [filterIndex]       idx of filter in filterGraph array
 * @property {String} [filterType]        removeLogo
 * @property {String} [timestamp]         time coord in format 00:00:00.000
 * @property {Number} [w]                 width
 * @property {Number} [h]                 height
 * @property {String} [fileId]            uuid
 * @property {EnableData} [between]       enable between
 */

export class RemoveLogo extends FilterModel {
    filterType = "removeLogo";
    type = "cpu";

    #timestamp;

    /**
     *
     * @param {Number} filterIndex
     * @param {RemoveLogoData} options
     */
    constructor(
        filterIndex = null,
        {
            w = null,
            h = null,
            timestamp = null,
            between: { from = null, to = null } = {},
            fileId = null,
        } = {},
    ) {
        super();
        this.filterIndex = filterIndex;
        this.timestamp = timestamp;
        this.w = w;
        this.h = h;
        this.between = new Enable(from, to);
        this.fileId = fileId || crypto.randomUUID();
    }

    /**
     * returns filter data string representation
     * @returns {String}
     */
    toJSON() {
        return {
            filterIndex: this.filterIndex,
            filterType: this.filterType,
            timestamp: this.#timestamp.coord,
            y: this.y,
            w: this.w,
            h: this.h,
            between: this.between,
            fileId: this.fileId,
        };
    }

    set timestamp(value) {
        this.#timestamp = new VTime(value);
    }

    get timestamp() {
        return this.#timestamp;
    }
}
