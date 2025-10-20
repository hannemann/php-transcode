import { Request } from "@/components/Request";
import { TYPE_VIDEO } from "../Streams";

export const requestScale = async function (type) {
    const m = document.createElement("modal-dialogue");
    m.header = "Scale";
    const d = m.appendChild(document.createElement("dialogue-scale"));
    const video = this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0];
    if (video) {
        d.setHeight(video.height);
        d.setAspectRatio(video.display_aspect_ratio);
    }
    document.body.appendChild(m);
    try {
        await m.open();
        console.info(
            "Scale video file %s to %dx%d with an aspect-ratio of %s",
            this.item.path,
            d.scale.width,
            d.scale.height,
            d.scale.aspectRatio,
            type
        );
        await Request.post(`/scale/${encodeURIComponent(this.item.path)}`, {
            width: d.scale.width,
            height: d.scale.height,
            aspect: d.scale.aspectRatio,
            type: type,
        });
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};
