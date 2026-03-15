import { TYPE_VIDEO } from "../Streams";
import { Scale } from "../../../Models/Filters/Scale";

export const requestScale = async function (model) {
    try {
        const m = document.createElement("modal-dialogue");
        const d = document.createElement("dialogue-scale");
        m.header = "Scale";

        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);

        if (!model) {
            model = new Scale(null, {
                width: d.video.width,
                height: d.video.height,
                aspect: d.video.display_aspect_ratio,
            });
        }
        d.filterIndex = model.filterIndex;

        document.body.appendChild(m);
        d.scale = model;

        m.appendChild(d);
        await m.open();
        logInfo(this.item.path, model);
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
        "Scale video file %s to %dx%d with an aspect-ratio of %s",
        path,
        model.width,
        model.height,
        model.aspect,
    );
};
