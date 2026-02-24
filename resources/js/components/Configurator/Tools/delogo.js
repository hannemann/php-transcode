import { Delogo } from "../../../Models/Filters/Delogo";
import { FilterGraph } from "../../../Models/Filters/FilterGraph";
import { DeLogo } from "../Dialogues/Delogo";
import { TYPE_VIDEO } from "../Streams";

export const requestDelogo = async function (model) {
    const backup = JSON.stringify(this.filterGraph);
    model =
        model || new Delogo(this.filterGraph.getProposedFilterIndex("delogo"));
    const m = document.createElement("modal-window");
    const d = document.createElement("dialogue-delogo");
    try {
        m.header = "Delogo";
        m.classList.add("no-shadow");
        d.video = {
            ...this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0],
            duration: parseFloat(this.format.duration),
        };
        d.path = this.item.path;
        d.filterIndex = model.filterIndex;
        d.configurator = this;
        requestAnimationFrame(() => (d.markers = this.clips));
        m.appendChild(d);
        d.addEventListener(
            "delogo-updated",
            () => {
                d.model = model;
                d.run();
            },
            { once: true },
        );
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        saveDelogo.call(this, d);
    } catch (error) {
        // 1. Silent Rollback: User actively clicked "Cancel" or pressed "Escape"
        if (error === "cancel") {
            console.info("Rolling back changes.");
        }
        // 2. Error Rollback: Something actually crashed
        else if (error) {
            console.error("Critical error during Delogo operation:", error);
        }

        // Always restore the backup to ensure UI and data consistency
        this.filterGraph = new FilterGraph(JSON.parse(backup));
        this.saveSettings();
    }
};

/**
 *
 * @param {DeLogo} delogo
 * @param {Boolean} isEdit
 * @returns
 */
export function saveDelogo(delogo) {
    if (delogo.saved) return;
    this.delogo = delogo.model;
    console.info(
        "Delogo video file %s. x: %d, x: %d, w: %d, h: %d, from: %s, to: %s",
        this.item.path,
        this.delogo.x,
        this.delogo.y,
        this.delogo.w,
        this.delogo.h,
        this.delogo.between.from?.coord || "n/a",
        this.delogo.between.to?.coord || "n/a",
    );
    if (!this.filterGraph.includes(delogo.model)) {
        this.filterGraph.splice(this.delogo.filterIndex, 0, this.delogo);
    }
    this.saveSettings();
    delogo.saved = true;
}
