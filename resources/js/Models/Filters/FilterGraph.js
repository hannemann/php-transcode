import { FilterModel } from "./FilterModel";
import { Crop } from "./Crop";
import { Delogo } from "./Delogo";
import { FillBorders } from "./FillBorders";
import { Scale } from "./Scale";
import { Pad } from "./Pad";
import { RemoveLogo } from "./RemoveLogo";
import { Enable } from "./Filters/Enable";

const modelMap = {
    crop: Crop,
    delogo: Delogo,
    fillborders: FillBorders,
    scale: Scale,
    pad: Pad,
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

    // Falls das Raw-Objekt eine linkId hat, nutze den Cache
    if (item.between && item.between.linkId) {
        item.between = Enable.getOrCreate(
            item.between.linkId,
            item.between.from,
            item.between.to,
        );
    }

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

    /**
     * obtain all filters of specific type
     * @param {String} filterType
     * @returns {FilterModel|Object.<filterType: String>}
     */
    getAllOfType(filterType) {
        return this.filter((f) => f.filterType === filterType);
    }

    /**
     * obtain proposed index for next item of grouped filters
     * @param {String} filterType
     * @returns {Number}
     */
    getProposedFilterIndex(filterType) {
        const all = this.getAllOfType(filterType);
        if (all.length > 0) {
            return all.at(-1).filterIndex + 1;
        }
        return this.length;
    }

    /**
     * obtain last of type if exists
     * @param {String} type
     * @returns {FilterModel|undefined}
     */
    getLastOfType(type) {
        return this.findLast((f) => f.filterType === type);
    }

    linkEnable(filters) {
        if (filters.length < 2) return;

        // Erzeuge eine neue ID für diese Gruppe
        const newGroupId = crypto.randomUUID();

        // Nimm die Zeiten vom ersten markierten Filter als Basis
        const masterFrom = filters[0].between.from.seconds;
        const masterTo = filters[0].between.to.seconds;

        // Erstelle das Master-Objekt im Cache
        const sharedEnable = Enable.getOrCreate(
            newGroupId,
            masterFrom,
            masterTo,
        );

        // Weise es allen Filtern zu
        filters.forEach((f) => {
            f.between = sharedEnable;
        });
    }

    /**
     * Unlinks a filter from a shared timing group.
     * The filter keeps its current time values but gets a unique 'Enable' instance.
     *
     * @param {FilterModel} filter - The filter model to decouple.
     * @returns {FilterModel} The decoupled filter model.
     */
    unlinkEnable(filter) {
        if (!filter.between || !filter.between.linkId) {
            return filter; // Not linked, nothing to do
        }

        // Extract current seconds to create a fresh, independent instance
        const fromSec = filter.between.from.seconds;
        const toSec = filter.between.to.seconds;

        // Assign a new Enable instance without a linkId (bypassing the cache)
        filter.between = new Enable(fromSec, toSec, null);

        return filter;
    }

    /**
     * Finds all filters that share the same linkId.
     * Useful for highlighting linked filters in the UI.
     *
     * @param {String} linkId - The ID to search for.
     * @returns {FilterModel[]} Array of filters belonging to the same timing group.
     */
    getEnableGroupMembers(linkId) {
        if (!linkId) return [];
        return this.filter((f) => f.between && f.between.linkId === linkId);
    }

    clearEnableCache() {
        Enable.clearCache();
    }

    /**
     * Generates a consistent HSL color based on a string ID.
     * @param {String} str - The linkId to hash.
     * @returns {String} CSS HSL color string.
     */
    getGroupColor = (str) => {
        if (!str) return "";

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Use the hash to get a degree between 0 and 360
        const hue = Math.abs(hash % 360);
        // Fixed saturation and lightness for better UI consistency
        return `hsl(${hue}, 70%, 50%)`;
    };
}
