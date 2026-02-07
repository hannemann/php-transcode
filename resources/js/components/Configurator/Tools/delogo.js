import { TYPE_VIDEO } from "../Streams";

export const requestDelogo = async function (type, id = null, data = null) {
    try {
        const clips = this.clips; // for some reaseon we have to cache clips before saving
        await this.saveSettings();
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
        d.filterIndex = id;
        d.configurator = this;
        requestAnimationFrame(() => (d.markers = clips));
        m.appendChild(d);
        d.addEventListener(
            "delogo-updated",
            () => {
                if (d.filterIndex !== null && data) {
                    d.applyFilterData(data);
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
        saveDelogo.call(this, type, d, !!data);
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};

export function saveDelogo(type, delogo, isEdit = false) {
    if (delogo.saved) return;
    this.delogo = { ...delogo.coords, ...[type], between: delogo.between };
    console.info(
        "Delogo video file %s. x: %d, x: %d, w: %d, h: %d, from: %s, to: %s, type: %s",
        this.item.path,
        this.delogo.x,
        this.delogo.y,
        this.delogo.w,
        this.delogo.h,
        this.delogo.between.from?.toString() || "n/a",
        this.delogo.between.to?.toString() || "n/a",
        type,
    );
    const filterData = {
        filterType: "delogo",
        ...this.delogo,
    };
    if (delogo.filterIndex !== null && isEdit) {
        this.filterGraph[delogo.filterIndex] = filterData;
    } else {
        this.filterGraph.push(filterData);
    }
    this.saveSettings();
    delogo.saved = true;
}
