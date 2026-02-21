import { Delogo } from "../../../Models/Filters/Delogo";
import { DeLogo } from "../Dialogues/Delogo";
import { TYPE_VIDEO } from "../Streams";

export const requestDelogo = async function (model) {
    model =
        model || new Delogo(this.filterGraph.getProposedFilterIndex("delogo"));
    const isEdit = isNaN(parseInt(model.filterIndex));
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
        saveDelogo.call(this, d, isEdit);
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};

/**
 *
 * @param {DeLogo} delogo
 * @param {Boolean} isEdit
 * @returns
 */
export function saveDelogo(delogo, isEdit = false) {
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
    if (!isEdit) {
        this.filterGraph.splice(this.delogo.filterIndex, 0, this.delogo);
    }
    this.saveSettings();
    delogo.saved = true;
}
