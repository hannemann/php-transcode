import { TYPE_VIDEO } from "../Streams";
import { FillBorders } from "../../../Models/Filters/FillBorders";

export const requestFillborders = async function (model) {
    const last = this.filterGraph.getLastOfType("fillborders");
    if (!model) {
        model = new FillBorders(null, last?.borders);
    }
    try {
        const m = document.createElement("modal-window");
        m.header = "Fillborders";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-fillborders");
        d.filterIndex = model.filterIndex;

        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);

        d.path = this.item.path;
        d.configurator = this;
        d.model = model;
        requestAnimationFrame(() => {
            d.markers = this.clips;
            d.width = d.video.width;
            d.height = d.video.height;
            d.mode = model.mode;
            d.addEventListener(
                "fillborders-updated",
                () => {
                    d.run();
                },
                { once: true },
            );
        });
        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        model.mode = d.mode;
        model.color = d.color;
        logInfo(this.item.path, model);
        this.fillborders = model;
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
        "Fillborders on video file %s: top: %d, right: %d, bottom: %d, left: %d, mode: %s, color: %s",
        path,
        model.top,
        model.right,
        model.bottom,
        model.left,
        model.mode ?? "n/a",
        model.color ?? "n/a",
    );
};
