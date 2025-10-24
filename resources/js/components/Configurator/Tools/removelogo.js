import { Request } from "@/components/Request";
import { TYPE_VIDEO } from "../Streams";

export const requestRemovelogo = async function (type) {
    try {
        const m = document.createElement("modal-window");
        m.canCancel = false;
        m.header = "Removelogo";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-removelogo");
        d.video = {
            ...this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0],
            duration: parseFloat(this.format.duration),
        };
        d.path = this.item.path;
        d.type = type;
        d.markers = this.clips;
        m.appendChild(d);
        document.body.insertBefore(m, document.querySelector('transcoder-toast'));
        await m.open();
        console.info("Removelogo video file %s. Create logomask at timestamp %s, width: %s, height: %s, type: %s",
            this.item.path,
            d.removeLogo.timestamp,
            d.removeLogo.w,
            d.removeLogo.h,
            d.removeLogo.type
        );
        this.removeLogo = d.removeLogo;
        if (this.startRemoveLogo) {
            await Request.post(
                `/removelogo/${encodeURIComponent(this.item.path)}`,
                d.removeLogo
            );
        } else {
            const filterData = {...this.removeLogo, ...{filterType: 'removeLogo'}};
            const idx = this.filterGraph.findIndex(f => f.filterType === 'removeLogo');
            if (idx > -1) {
                const m = document.createElement("modal-confirm");
                m.header = "Replace existing filter?";
                m.content = "RemoveLogo filter can only be applied once.";
                document.body.appendChild(m);
                try {
                    await m.confirm();
                    this.filterGraph[idx] = filterData;
                    console.log("Replace removeLogo filter confirmed");
                } catch (error) {
                    console.log("Replace removeLogo filter canceled");
                    return;
                }
            } else {
                this.filterGraph.push(filterData);
            }
            this.saveSettings();
        }
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};
