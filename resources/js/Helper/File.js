import { VIDEO_EXTENSIONS } from "../Models/VideoStandards";

class FileHelper {
    static fileSizeH(size, precision = 1) {
        let base = 0;
        if (size > 0) {
            base = Math.log(size) / Math.log(1000);
            size = Math.pow(1000, base - Math.floor(base)).toFixed(precision);
        }
        return [size, FileHelper.fileSizeSuffix[Math.floor(base)]].join(" ");
    }

    static guessFileName(fileName) {
        const hasEpisode = FileHelper.#hasEpisode(fileName);
        if (hasEpisode) {
            const { episode, title, ext } = hasEpisode.groups;
            fileName = `${episode}.${title}.${ext}`;
        } else {
            fileName = fileName
                .replace(/---/g, " - ")
                .replace(/([^\s])-([^\s])/g, "$1 $2");
        }
        return fileName;
    }

    /**
     * detect episode descriptor
     * @param {String} filename
     * @returns
     */
    static #hasEpisode(filename) {
        const episode = "(?<episode>S[0-9]{2}E[0-9]{2})";
        const title = "(?<title>.*)";
        const ext = `\.(?<ext>(${VIDEO_EXTENSIONS.join("|")}))`;
        const reg = new RegExp(`.*${episode}(?:-*)${title}${ext}$`);
        return filename.match(reg);
    }
}

Object.defineProperty(FileHelper, "fileSizeSuffix", {
    value: ["Bytes", "KB", "MB", "GB", "TB"],
    writable: false,
    configurable: false,
    enumerable: false,
});

export default FileHelper;
