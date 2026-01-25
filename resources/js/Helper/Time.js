class VTime {
    date;
    #asTime = false;

    /**
     * @param {Number} time coord, numeric (milliseconds) or Date object
     */
    constructor(time) {
        if (VTime.isCoord(time)) {
            // console.log("Is Coord", time);
            this.date = new Date(VTime.milliseconds(time));
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
    static seconds(coord) {
        const [hours, minutes, seconds] = coord.split(":");
        return (
            parseFloat(hours) * 60 * 60 +
            parseFloat(minutes) * 60 +
            parseFloat(seconds)
        );
    }

    static milliseconds(coord) {
        return VTime.seconds(coord) * 1000;
    }

    static coord(ts) {
        return new Date(ts).toISOString().split("T").pop().replace("Z", "");
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

    #checkIsVtime(ts) {
        if (!VTime.isVtime(ts)) {
            throw new Error(
                "Comparison only possible against instances of VTime",
            );
        }
    }

    valueOf() {
        return this.date.valueOf();
    }

    toString() {
        return this.date ? (this.#asTime ? this.time : this.coord) : "n/a";
    }

    delta(ts) {
        this.#checkIsVtime(ts);
        return Math.abs(this.date.valueOf() - ts.date.valueOf());
    }

    asTime(value = true) {
        this.#asTime = !!value;
        return this;
    }

    get milliseconds() {
        return this.date.valueOf();
    }

    get seconds() {
        return this.milliseconds / 1000;
    }

    get coord() {
        return VTime.coord(this.date.valueOf());
    }

    get time() {
        return this.coord.split(".").shift();
    }
}

export { VTime };
