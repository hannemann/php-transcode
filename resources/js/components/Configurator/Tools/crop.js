import { Request } from "@/components/Request";
import { TYPE_VIDEO } from "../Streams";

export const requestCrop = async function (type) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Cropper";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-cropper");
        d.video = {
            ...this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0],
            duration: parseFloat(this.format.duration),
        };
        d.crop = this.crop;
        d.path = this.item.path;
        d.type = type;
        m.appendChild(d);
        document.body.appendChild(m);
        await m.open();
        console.info(
            "Crop video file %s to %dx%d at %d/%d and scale to %d pixel height with an aspect-ratio of %s",
            this.item.path,
            d.crop.cw,
            d.crop.ch,
            d.crop.cx,
            d.crop.cy,
            d.crop.height,
            d.crop.aspect
        );
        this.crop = d.crop;
        if (d.startCrop) {
            await Request.post(
                `/crop/${encodeURIComponent(this.item.path)}`,
                d.crop
            );
        } else {
            this.filterGraph.push({...d.crop, ...{filterType: 'crop'}});
            this.saveSettings();
        }
    } catch (error) {}
};
