import { TYPE_VIDEO } from "../Streams";
import { Pad } from "../../../Models/Filters/Pad";

export const requestPad = async function (model) {
    if (!model) {
        model = new Pad();
    }
    try {
        const m = document.createElement("modal-window");
        m.header = "Pad Video";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-pad");
        d.filterIndex = model.filterIndex;

        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);

        if (!model.ch) {
            model.proposeStandard(d.video.height);
            d.isNew = true;
        }
        d.pad = model;
        d.path = this.item.path;

        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        logInfo(this.item.path, model);
        this.pad = model;
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
        "Place video file %s %dx%d on %s canvas at %d/%d",
        path,
        model.cw,
        model.ch,
        model.color,
        model.cx,
        model.cy,
    );
};
