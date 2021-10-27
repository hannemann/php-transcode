import { Request } from "@/components/Request";
import { TYPE_VIDEO } from "../Streams";

export const requestDelogo = async function (type) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Delogo";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-delogo");
        d.video = {
            ...this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0],
            duration: parseFloat(this.format.duration),
        };
        d.path = this.item.path;
        d.type = type;
        m.appendChild(d);
        document.body.appendChild(m);
        await m.open();
        this.delogo = d.coords;
        console.info(
            "Delogo video file %s. x: %d, x: %d, w: %d, h: %d",
            this.item.path,
            this.delogo.x,
            this.delogo.y,
            this.delogo.w,
            this.delogo.h
        );
        await Request.post(`/delogo/${encodeURIComponent(this.item.path)}`, {
            ...this.delogo,
            type,
        });
    } catch (error) {}
};
