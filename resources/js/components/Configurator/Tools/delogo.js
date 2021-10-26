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
        console.info("Delogo video file %s at", this.item.path);
        // this.crop = d.crop;
        // if (d.startCrop) {
        //     await Request.post(
        //         `/crop/${encodeURIComponent(this.item.path)}`,
        //         d.crop
        //     );
        // }
    } catch (error) {}
};
