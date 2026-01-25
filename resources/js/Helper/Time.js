class Time {
    static toSeconds(coord) {
        const [hours, minutes, seconds] = coord.split(":");
        return (
            parseFloat(hours) * 60 * 60 +
            parseFloat(minutes) * 60 +
            parseFloat(seconds)
        );
    }

    static milliSeconds(coord) {
        return Time.toSeconds(coord) * 1000;
    }

    static fromMilliSeconds(millis) {
        return new Date(millis)
            .toISOString()
            .replace(/^[0-9-]+T/, "")
            .replace(/z$/i, "");
    }

    static fromSeconds(seconds) {
        return Time.fromMilliSeconds(seconds * 1000);
    }

    static calculateClipsDuration(clips) {
        if (!clips.length) return 0;

        return Time.fromSeconds(
            clips.reduce((acc, cur) => {
                if (cur.from && cur.to) {
                    acc +=
                        Time.milliSeconds(cur.to) - Time.milliSeconds(cur.from);
                }
                return acc;
            }, 0) / 1000,
        );
    }

    static calculateCutTimestamp(clips, current) {
        const cut = clips.reduce((acc, cur) => {
            const from = cur.raw
                ? cur.raw.start || 0
                : cur.from
                  ? Time.milliSeconds(cur.from)
                  : 0;
            const to = cur.raw
                ? cur.raw.end || current
                : cur.to
                  ? Time.milliSeconds(cur.to)
                  : current;
            if (from > current) return acc;
            if (to > current) {
                return acc + current - from;
            }
            return acc + to - from;
        }, 0);
        return Time.fromMilliSeconds(cut);
    }

    static duration(date) {
        return date.toISOString().split("T").pop().split(".").shift();
    }

    static deltaDuration(from, to) {
        return Time.duration(new Date(to - from));
    }
}

class VTime {
    date;

    /**
     * @param {Number} time coord, numeric (milliseconds) or Date object
     */
    constructor(time) {
        if (VTime.isCoord(time)) {
            // console.log("Is Coord", time);
            this.date = new Date(Time.milliSeconds(time));
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

    static isCoord(ts) {
        return /^\d{2}:\d{2}:\d{2}\.\d{1,3}$/.test(ts);
    }

    static isNumeric(ts) {
        return !VTime.isCoord(ts) && !isNaN(parseFloat(ts));
    }

    static isDate(ts) {
        return ts instanceof Date;
    }

    static isVtime(ts) {
        return ts instanceof VTime;
    }

    #checkIsVtime(ts) {
        if (!VTime.isVtime(ts)) {
            throw new Error(
                "Comparison only possible against instances of VTime",
            );
        }
    }

    gt(ts) {
        this.#checkIsVtime(ts);
        return this.date > ts.date;
    }

    gte(ts) {
        this.#checkIsVtime(ts);
        return this.date >= ts.date;
    }

    delta(ts) {
        this.#checkIsVtime(ts);
        return Math.abs(this.date.valueOf() - ts.date.valueOf());
    }

    get milliseconds() {
        return this.date.valueOf();
    }

    get seconds() {
        return this.milliseconds / 1000;
    }

    get coord() {
        return this.date.toISOString().split("T").pop().replace("Z", "");
    }
}

export { Time, VTime };
