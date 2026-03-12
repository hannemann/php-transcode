export const VIDEO_STANDARDS = new Map();

VIDEO_STANDARDS.set("576p", {
    width: 1024,
    height: 576,
    name: "PAL 16:9",
    standard: "DVD",
});

VIDEO_STANDARDS.set("720p", {
    width: 1280,
    height: 720,
    name: "HD",
    standard: "HDTV",
});

VIDEO_STANDARDS.set("1080p", {
    width: 1920,
    height: 1080,
    name: "Full HD",
    standard: "HDTV",
});

/**
 * obtain video standard by height as array
 * name: index 0
 * data: index 1
 * @param {Number} height
 * @returns {String[]}
 */
export const getStandardByHeight = function (height) {
    return [...VIDEO_STANDARDS].find(([key, value]) => value.height >= height);
};
