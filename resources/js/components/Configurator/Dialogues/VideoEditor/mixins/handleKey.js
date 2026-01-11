const update = function (updateIndex) {
    if (updateIndex > -1) {
        this.raw.splice(updateIndex, 1, this.current);
        this.raw.sort((a, b) => a > b);
        this.calculateClips();
    }
    this.updateImages();
    delete this.updateTimeout;
};

const arrow = function (e, back) {
    const idx = this.raw.indexOf(this.current);
    const canSkip = back
        ? canSkipBwd.call(this, idx)
        : canSkipFwd.call(this, idx);

    if (e.ctrlKey && e.shiftKey && canSkip) {
        //console.log('Skip', e);
        jump.call(this, back ? idx - 1 : idx + 1);
        return;
    }
    
    if (e.ctrlKey != e.shiftKey) {
        //console.log('2s/5s', e);
        (back ? rwd : ffwd).call(this, e.shiftKey ? 2000 : 5000);
        return;
    }

    // custom duration
    if (e.duration) {
        // console.log(`${e.duration / 1000}`, e);
        (back ? rwd : ffwd).call(this, e.duration);
        return;
    }
     
    //console.log('1 Frame', 1000 / this.fps, e);
    (back ? rwd : ffwd).call(this, 1000 / this.fps);
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

export const handleKeyDown = function(e) {
    const hasChanged =  e.ctrlKey != this.isKeyDown?.ctrlKey
        || e.shiftKey != this.isKeyDown?.shiftKey
        || e.altKey != this.isKeyDown?.altKey
        || e.key != this.isKeyDown?.key;

    if (this.isKeyDown && !hasChanged) return;
    this.isKeyDown = e;

    if (!this.imageLoadHandler) {
        this.imageLoadHandler = () => this.image.decode().then(() => {
            setTimeout(() => {
                delete this.isKeyDown;
            }, 100);
        });
        this.image.addEventListener('load', this.imageLoadHandler);
    }
    handleKey.call(this, e);
}

export const handleKeyUp = function() {
    this.image.removeEventListener('load', this.imageLoadHandler);
    delete this.isKeyDown;
    delete this.imageLoadHandler;
}

export const handleKey = function (e) {
    clearTimeout(this.updateTimeout);
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
            ffwd.call(this, e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
            action = true;
            break;
        case "ArrowDown":
            rwd.call(this, e.shiftKey ? 300000 : e.ctrlKey ? 600000 : 60000);
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
        if (e instanceof KeyboardEvent) {
            e.preventDefault();
            e.stopPropagation();
        }
        update.call(this, updateIndex);
    }
};

const rwd = function (seconds) {
    this.current = Math.max(this.start * 1000, this.current - seconds);
};

const ffwd = function (seconds) {
    this.current = Math.min(
        this.duration - 1000 / this.fps,
        this.current + seconds
    );
};
