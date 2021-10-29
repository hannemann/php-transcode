import { Request } from "@/components/Request";
import { TYPE_VIDEO } from "../Streams";

export const requestRemovelogo = async function (type) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Removelogo";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-removelogo");
        d.video = {
            ...this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0],
            duration: parseFloat(this.format.duration),
        };
        d.path = this.item.path;
        d.type = type;
        m.appendChild(d);
        document.body.appendChild(m);
        await m.open();
        console.info("Removelogo video file %s.", this.item.path);
        await Request.post(
            `/removelogo/${encodeURIComponent(this.item.path)}`,
            {
                ts: d.timestamp(),
                w: d.video.width,
                h: d.video.height,
                type,
            }
        );
    } catch (error) {}
};
