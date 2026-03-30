import { RemoveLogo } from "../../../Models/Filters/RemoveLogo";
import { TYPE_VIDEO } from "../Streams";
import { VTime } from "../../../Helper/Time";

export const requestRemovelogo = async function (model) {
    model = model || new RemoveLogo();

    try {
        const m = document.createElement("modal-window");
        m.header = "Removelogo";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-removelogo");

        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);

        d.path = this.item.path;
        d.filterIndex = model.filterIndex;
        d.model = model;
        requestAnimationFrame(() => {
            d.markers = this.clips;
        });
        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();

        model.timestamp = new VTime(d.current).coord;
        model.w = d.width;
        model.h = d.height;

        logInfo(this.item.path, model);
        this.removeLogo = model;
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
        "Removelogo video file %s. Create logomask at timestamp %s, width: %s, height: %s, Enable between %s, %s",
        path,
        model.timestamp,
        model.w,
        model.h,
        model.between.from,
        model.between.to,
    );
};
