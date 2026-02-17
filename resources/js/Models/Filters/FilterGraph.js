import { Delogo } from "./Delogo";
import { FilterModel } from "./FilterModel";
import { RemoveLogo } from "./RemoveLogo";

const modelMap = {
    delogo: Delogo,
    removeLogo: RemoveLogo,
};

/**
 * Factory function to transform raw data into specific FilterModel instances.
 * @param {Object|FilterModel} item - The raw filter object or an existing instance.
 * @param {number} idx - The index within the collection (used for ID/sequence).
 * @returns {FilterModel|Object} A hydrated instance of the appropriate filter class.
 */
const mapFilterModel = function (item, idx) {
    if (item instanceof FilterModel) return item;
    if (modelMap[item.filterType]) {
        item = new modelMap[item.filterType](idx, item);
    }
    return item;
};

export class FilterGraph extends Array {
    /**
     * Overwrites the default species constructor.
     * @description
     * By default, derived array methods like `.map()`, `.filter()`, or `.slice()`
     * would attempt to return a new instance of `FilterGraph`. This is problematic
     * because the `FilterGraph` constructor is designed to hydrate raw JSON data.
     * * Setting `[Symbol.species]` to `Array` ensures that these methods return a
     * standard JavaScript Array, preventing unintended re-initialization of
     * already instantiated models and avoiding "single-number-constructor" pitfalls.
     * @static
     * @returns {ArrayConstructor} The base Array constructor for derived methods.
     */
    static get [Symbol.species]() {
        return Array;
    }

    /**
     * Creates a new FilterGraph collection.
     * @param {Array<Object|FilterModel>} [items=[]] - An array of raw filter data or
     * already instantiated models. Raw data will be automatically converted (hydrated)
     * into specific FilterModel or Delogo instances.
     */
    constructor(items = []) {
        super();
        if (Array.isArray(items)) {
            this.push(...items.map((item, idx) => mapFilterModel(item, idx)));
        }
    }

    /**
     * Synchronizes the internal index of each filter with its current position in the graph.
     * Useful after sorting, adding, or removing filters.
     * @returns {this} The reindexed collection.
     */
    reindex() {
        this.forEach((filter, idx) => {
            if (typeof filter.setIndex === "function") {
                filter.setIndex(idx);
            } else {
                filter.index = idx;
            }
        });
        return this;
    }
}
