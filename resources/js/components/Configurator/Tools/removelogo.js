import { RemoveLogo } from "../../../Models/Filters/RemoveLogo";
import { TYPE_VIDEO } from "../Streams";

export const requestRemovelogo = async function (model) {
    model = model || new RemoveLogo();
    const presentRemoveLogo = RemoveLogo.configurator.filterGraph.find(
        (f) => f.filterType === model.filterType,
    );
    const isPresentRemoveLogo =
        RemoveLogo.configurator.filterGraph.indexOf(model) > -1;

    if (presentRemoveLogo && !isPresentRemoveLogo) {
        const m = document.createElement("modal-confirm");
        m.header = "Replace existing filter?";
        m.content = "RemoveLogo filter can only be applied once.";
        document.body.appendChild(m);
        try {
            await m.confirm();
            this.filterGraph[model.filterIndex] = { filterType: null };
            await this.saveSettings();
            console.log("Replace removeLogo filter confirmed");
        } catch (error) {
            console.log("Replace removeLogo filter canceled");
            return;
        }
    }

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
        d.filterIndex = model.filterIndex;
        requestAnimationFrame(() => {
            d.markers = this.clips;
            if (d.filterIndex !== null && model) {
                d.model = model;
            }
        });
        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        d.updateModel();
        console.info(
            "Removelogo video file %s. Create logomask at timestamp %s, width: %s, height: %s",
            this.item.path,
            model.timestamp,
            model.w,
            model.h,
        );
        this.removeLogo = model;
        if (!isPresentRemoveLogo) {
            this.filterGraph.push(model);
        }
        this.saveSettings();
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};
