import { TYPE_VIDEO } from "../Streams";
import { Crop } from "../../../Models/Filters/Crop";

/**
 * @param {Crop} model
 */
export const requestCrop = async function (model) {
    if (!model) {
        model = new Crop();
    }

    try {
        const m = document.createElement("modal-window");
        const d = document.createElement("dialogue-cropper");

        m.header = "Cropper";
        m.classList.add("no-shadow");
        d.filterIndex = model.filterIndex;

        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);

        d.crop = model;
        d.path = this.item.path;

        d.addEventListener(
            "cropper-initialized",
            () => {
                d.aspectRatio = `${d.video.width}:${d.video.height}`;
            },
            { once: true },
        );

        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        logInfo(this.item.path, model);
        this.crop = model;
        if (isNaN(parseInt(model.filterIndex))) {
            this.filterGraph.push(model);
        }
        this.saveSettings();
    } catch (error) {
        if (error !== "cancel") {
            console.error(error);
        }
    }
};

const logInfo = function (path, model) {
    console.info(
        "Crop video file %s to %dx%d at %d/%d",
        path,
        model.cw,
        model.ch,
        model.cx,
        model.cy,
    );
};
