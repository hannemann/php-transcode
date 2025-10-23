class Time {

    static toSeconds(coord) {
        const [hours, minutes, seconds] = coord.split(":");
        return (
            parseFloat(hours) * 60 * 60 +
            parseFloat(minutes) * 60 +
            parseFloat(seconds)
        );
    }

    static fromSeconds(coord) {
        const d = new Date(null);
        d.setMilliseconds(coord * 1000);
        return `${d.getUTCHours().toString().padStart(2, "0")}:${d
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}:${d
            .getUTCSeconds()
            .toString()
            .padStart(2, "0")}.${d.getUTCMilliseconds()}`;
    }

    static milliSeconds(coord) {
        return Time.toSeconds(coord) * 1000;
    }

    static calculateClipsDuration(clips) {
        if (!clips.length) return 0;

        return Time.fromSeconds(clips.reduce((acc, cur) => {
            if (cur.from && cur.to) {
                acc += Time.milliSeconds(cur.to) - Time.milliSeconds(cur.from);
            }
            return acc;
        }, 0) / 1000);
    }

    static duration(date) {
        return date.toISOString()
            .split("T")
            .pop()
            .split(".")
            .shift();
    }

    static deltaDuration(from, to) {
        return Time.duration(new Date(to - from));
    }
}

export { Time };