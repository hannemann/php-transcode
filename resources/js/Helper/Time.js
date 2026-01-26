const toSeconds = (coord) => {
    const [hours, minutes, seconds] = coord.split(":");
    return (
        parseFloat(hours) * 60 * 60 +
        parseFloat(minutes) * 60 +
        parseFloat(seconds)
    );
};

const toMilliseconds = (coord) => {
    return toSeconds(coord) * 1000;
};

const toCoord = (ts) => {
    return new Date(ts).toISOString().split("T").pop().replace("Z", "");
};

class VTime {
    date;
    #asTime = false;

    /**
     * @param {String|Number|Date} time coord, numeric (milliseconds) or Date object
     */
    constructor(time) {
        if (VTime.isCoord(time)) {
            // console.log("Is Coord", time);
            this.date = new Date(toMilliseconds(time));
        }
        if (VTime.isNumeric(time)) {
            // console.log("Is Numeric", time);
            this.date = new Date(parseFloat(time));
        }
        if (VTime.isDate(time)) {
            // console.log("Is Date", time);
            this.date = time;
        }
    }

    /**
     * check if given string matches format HH:MM:SS.MS
     * @param {any} ts
     * @returns {Boolean}
     */
    static isCoord(ts) {
        return /^\d{2}:\d{2}:\d{2}\.\d{1,3}$/.test(ts);
    }

    /**
     * @param {any} ts
     * @returns {Boolean}
     */
    static isNumeric(ts) {
        return !VTime.isCoord(ts) && !isNaN(parseFloat(ts));
    }

    /**
     * @param {any} ts
     * @returns {Boolean}
     */
    static isDate(ts) {
        return ts instanceof Date;
    }

    /**
     * @param {any} ts
     * @returns Boolean
     */
    static isVtime(ts) {
        return ts instanceof VTime;
    }

    /**
     * Sum up durations of clips
     * @param {{from: Number, to: Number}[]} clips
     * @returns
     */
    static sumClips(clips) {
        if (!clips.length) return 0;

        return new VTime(
            clips.reduce((acc, cur) => {
                if (cur.from && cur.to) {
                    acc += new VTime(cur.to).delta(new VTime(cur.from));
                }
                return acc;
            }, 0),
        ).coord;
    }

    /**
     * calculate given point in time in edited video
     * return result as coord in format HH:MM:SS.MS
     * @param {{raw:{start:Number,end:Number}}[]|{from:Number,to:Number}[]} clips
     * @param {Number} current
     * @returns {String}
     */
    static calcCut(clips, current) {
        const cut = clips.reduce((acc, cur) => {
            const from = cur.raw
                ? cur.raw.start || 0
                : cur.from
                  ? new VTime(cur.from).milliseconds
                  : 0;
            const to = cur.raw
                ? cur.raw.end || current
                : cur.to
                  ? new VTime(cur.to).milliseconds
                  : current;
            if (from > current) return acc;
            if (to > current) {
                return acc + current - from;
            }
            return acc + to - from;
        }, 0);
        return new VTime(cut).coord;
    }

    /**
     * Check if given value is instance of VTime
     * @param {any} ts
     */
    #checkIsVtime(ts) {
        if (!VTime.isVtime(ts)) {
            throw new Error(
                "Comparison only possible against instances of VTime",
            );
        }
    }

    /**
     * returns milliseconds of internal Date object
     * @returns {Number}
     */
    valueOf() {
        return this.date.valueOf();
    }

    /**
     * obtain string representation in coord or time format
     * @returns {String}
     */
    toString() {
        return this.date ? (this.#asTime ? this.time : this.coord) : "n/a";
    }

    /**
     * obtain milliseconds delta of two VTime Objects
     * @param {VTime} ts
     * @returns {Number}
     */
    delta(ts) {
        this.#checkIsVtime(ts);
        return Math.abs(this.date.valueOf() - ts.date.valueOf());
    }

    /**
     * flag if toString method should return milliseconds aswell
     * inspect toString, coord and time methods for reference
     * @param {Boolean} value
     * @returns
     */
    asTime(value = true) {
        this.#asTime = !!value;
        return this;
    }

    /**
     * returns {Number}
     */
    get milliseconds() {
        return this.date.valueOf();
    }

    /**
     * returns {Number}
     */
    get seconds() {
        return this.milliseconds / 1000;
    }

    /**
     * return coord in format HH:MM:SS.MS
     * returns {String}
     */
    get coord() {
        return toCoord(this.date.valueOf());
    }

    /**
     * return coord in format HH:MM:SS
     * returns {String}
     */
    get time() {
        return this.coord.split(".").shift();
    }
}

export { VTime };
