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
        this.delogo = {...d.coords, ...[type]};
        console.info(
            "Delogo video file %s. x: %d, x: %d, w: %d, h: %d, type: %s",
            this.item.path,
            this.delogo.x,
            this.delogo.y,
            this.delogo.w,
            this.delogo.h,
            type
        );
        if (this.startDelogo) {
            await Request.post(`/delogo/${encodeURIComponent(this.item.path)}`, this.delogo);
        } else {
            const filterData = {...this.delogo, ...{filterType: 'delogo'}}
            const idx = this.filterGraph.findIndex(f => f.filterType === 'delogo');
            if (idx > -1) {
                const m = document.createElement("modal-confirm");
                m.header = "Replace existing filter?";
                m.content = "Delogo filter can only be applied once.";
                document.body.appendChild(m);
                try {
                    await m.confirm();
                    this.filterGraph[idx] = filterData;
                    console.log("Replace delogo filter confirmed");
                } catch (error) {
                    console.log("Replace delogo filter canceled");
                    return;
                }
            } else {
                this.filterGraph.push(filterData);
            }
            this.saveSettings();
        }
    } catch (error) {
        console.error(error);
    }
};
