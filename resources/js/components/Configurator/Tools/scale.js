import { Request } from "@/components/Request";
import { TYPE_VIDEO } from "../Streams";

export const requestScale = async function (type) {
    const m = document.createElement("modal-dialogue");
    m.header = "Scale";
    const d = m.appendChild(document.createElement("dialogue-scale"));

    d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
    ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
    d.video.duration = parseFloat(this.format.duration);

    document.body.appendChild(m);
    if (d.video) {
        d.aspectRatio = d.video.display_aspect_ratio;
        d.height = d.video.height;
        d.calculateWidth();
    }
    try {
        await m.open();
        const filterSettings = {
            filterType: "scale",
            width: d.width,
            height: d.height,
            aspect: d.aspectRatio,
            type: type,
        };
        console.info(
            "Scale video file %s to %dx%d with an aspect-ratio of %s",
            this.item.path,
            filterSettings.width,
            filterSettings.height,
            filterSettings.aspect,
            type,
        );
        this.filterGraph.push(filterSettings);
        this.saveSettings();
    } catch (error) {
        if (error !== "cancel") {
            console.error(error);
        }
    }
};
