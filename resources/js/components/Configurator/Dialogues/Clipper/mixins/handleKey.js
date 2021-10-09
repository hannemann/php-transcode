import { Utils } from "@/components/lib";

const update = function (updateIndex) {
    if (updateIndex > -1) {
        this.raw.splice(updateIndex, 1, this.current);
        this.raw.sort((a, b) => a > b);
        this.calculateClips();
    }
    Utils.forceUpdate(this);
    delete this.updateTimeout;
};

const arrow = function (e, back) {
    const idx = this.raw.indexOf(this.current);
    const canSkip = back
        ? canSkipBwd.call(this, idx)
        : canSkipFwd.call(this, idx);
    if (e.ctrlKey && e.shiftKey && canSkip) {
        jump.call(this, back ? idx - 1 : idx + 1);
    } else if (e.ctrlKey != e.shiftKey) {
        this[back ? "rwd" : "ffwd"](e.shiftKey ? 2000 : 5000);
    } else {
        this[back ? "rwd" : "ffwd"](1000 / this.fps);
    }
};

const arrowLeft = function (e) {
    const idx = this.raw.indexOf(this.current);
    if (e.ctrlKey && e.shiftKey && canSkipBwd.call(this, idx)) {
        jump.call(this, idx - 1);
    } else if (e.ctrlKey != e.shiftKey) {
        this.rwd(e.shiftKey ? 2000 : 5000);
    } else {
        this.rwd(1000 / this.fps);
    }
};

const jump = function (idx) {
    if (typeof this.raw[idx] !== "undefined") {
        this.current = this.raw[idx];
    }
};

const canSkipFwd = function (idx) {
    return !isLastClipEnd.call(this) && isClipEnd.call(this, idx);
};

const canSkipBwd = function (idx) {
    return !isFirstClipStart.call(this) && isClipStart.call(this, idx);
};

const isFirstClipStart = function () {
    return this.raw[0] === this.current;
};

const isLastClipEnd = function () {
    return this.raw[this.raw.length - 1] === this.current;
};

const isClipStart = function (idx) {
    return idx > -1 && idx % 2 === 0;
};

const isClipEnd = function (idx) {
    return idx > -1 && idx % 2 > 0;
};

export const handleKey = function (e) {
    // console.log(this);
    if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
    }
    let action = false;
    const updateIndex = e.altKey ? this.raw.indexOf(this.current) : -1;
    switch (e.key) {
        case "ArrowRight":
            arrow.call(this, e);
            action = true;
            break;
        case "ArrowLeft":
            arrow.call(this, e, true);
            action = true;
            break;
        case "ArrowUp":
            this.ffwd(e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
            action = true;
            break;
        case "ArrowDown":
            this.rwd(e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
            action = true;
            break;
        case "+":
            this.add();
            action = true;
            break;
        case "-": {
            this.remove();
            action = true;
            break;
        }
    }
    if (action) {
        e.preventDefault();
        e.stopPropagation();
        this.updateTimeout = setTimeout(update.bind(this, updateIndex), 150);
    }
};

export const rwd = function (seconds) {
    this.current = Math.max(this.start * 1000, this.current - seconds);
};

export const ffwd = function (seconds) {
    this.current = Math.min(this.duration * 1000, this.current + seconds);
};
