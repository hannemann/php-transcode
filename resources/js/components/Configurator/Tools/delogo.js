import { DeLogo } from "../Dialogues/Delogo";
import { TYPE_VIDEO } from "../Streams";

export const requestDelogo = async function (model) {
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
                if (d.filterIndex !== null && model) {
                    d.applyFilterData(model);
                } else {
                    d.addNext();
                }
            },
            { once: true },
        );
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        saveDelogo.call(this, d, !!model);
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
    this.delogo = delogo.filterData;
    console.info(
        "Delogo video file %s. x: %d, x: %d, w: %d, h: %d, from: %s, to: %s",
        this.item.path,
        this.delogo.x,
        this.delogo.y,
        this.delogo.w,
        this.delogo.h,
        this.delogo.between.from?.seconds || "n/a",
        this.delogo.between.to?.seconds || "n/a",
    );
    if (this.delogo.filterIndex !== null && isEdit) {
        this.filterGraph[delogo.filterIndex] = this.delogo;
    } else {
        const lastDelogo = this.filterGraph.findLastIndex(
            (i) => i.filterType === "delogo",
        );
        if (lastDelogo > -1) {
            this.filterGraph.splice(lastDelogo + 1, 0, this.delogo);
        } else {
            this.filterGraph.push(this.delogo);
        }
    }
    this.saveSettings();
    delogo.saved = true;
}
