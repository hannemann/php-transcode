import { TYPE_VIDEO } from "../Streams";

export const requestFillborders = async function (
    type,
    id = null,
    data = null,
) {
    try {
        const clips = this.clips; // for some reaseon we have to cache clips before saving
        await this.saveSettings();
        const m = document.createElement("modal-window");
        m.header = "Fillborders";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-fillborders");
        const video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        const scaleFilter = this.filterGraph.find((f, idx) => {
            if (!isNaN(id) && idx > id) return false;
            return f.filterType === "scale";
        });
        d.video = {
            ...video,
            duration: parseFloat(this.format.duration),
            width: scaleFilter?.width || video.coded_width,
            height: scaleFilter?.height || video.coded_height,
        };
        d.path = this.item.path;
        d.filterIndex = id;
        requestAnimationFrame(() => {
            d.fillborders = data ?? this.fillborders;
            d.markers = clips;
            d.mirror = false;
            d.width = d.video.width;
            d.height = d.video.height;
            if (id !== null && data) {
                d.mode = data.mode;
                d.addEventListener(
                    "fillborders-updated",
                    () => {
                        d.applyFilterData(data);
                    },
                    { once: true },
                );
            }
        });
        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
        console.info(
            "Fillborders on video file %s: top: %d, right: %d, bottom: %d, left: %d, mode: %s, color: %s",
            this.item.path,
            d.fillborders.top,
            d.fillborders.right,
            d.fillborders.bottom,
            d.fillborders.left,
            d.fillborders.mode ?? "n/a",
            d.fillborders.color ?? "n/a",
        );
        this.fillborders = d.fillborders;
        const filterData = { filterType: "fillborders", ...d.fillborders };
        if (id !== null && data) {
            this.filterGraph[id] = filterData;
        } else {
            this.filterGraph.push(filterData);
        }
        this.saveSettings();
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};
