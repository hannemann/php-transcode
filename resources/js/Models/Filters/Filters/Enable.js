import { VTime } from "../../../Helper/Time";

/**
 * @typedef {Object} EnableData
 * @property {Number} from      start time in seconds
 * @property {Number} to        end time in seconds
 */

export class Enable {
    static #cache = new Map();

    #from;
    #to;
    linkId = null; // Speichert die Verknüpfungs-ID
    groupId = null; // Speichert die relative Gruppen-ID

    /**
     * Creates a new Enable instance.
     * Note: For shared/linked instances, use Enable.getOrCreate() instead.
     *
     * @param {Number|null} [from=null] - Start time in seconds.
     * @param {Number|null} [to=null]   - End time in seconds.
     * @param {String|null} [linkId=null] - Optional ID to identify linked filter timings.
     */
    constructor(from = null, to = null, linkId = null, groupId = null) {
        this.from = from;
        this.to = to;
        this.linkId = linkId;
        this.groupId = groupId;
    }

    /**
     * Factory method to manage shared instances via a static cache.
     *
     * @param {String|null} linkId - The connection ID
     * @param {Number} from - Fallback start time if new instance is created
     * @param {Number} to - Fallback end time if new instance is created
     * @returns {Enable} Returns a cached instance if linkId exists, otherwise a new one
     */
    static getOrCreate(linkId, from, to) {
        if (!linkId) return new Enable(from, to);

        if (!this.#cache.has(linkId)) {
            this.#cache.set(linkId, new Enable(from, to, linkId));
        }
        return this.#cache.get(linkId);
    }

    /**
     * Clears the internal cache.
     * Call this when switching projects to avoid memory leaks or ID collisions.
     */
    static clearCache() {
        this.#cache.clear();
    }

    toJSON() {
        return {
            from: this.from.seconds,
            to: this.to.seconds,
            linkId: this.linkId,
            groupId: this.groupId,
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
