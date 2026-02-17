import { TYPE_VIDEO } from "../Streams";

export const requestFillborders = async function (
    type,
    id = null,
    data = null,
) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Fillborders";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-fillborders");
        d.filterIndex = id;
        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        const dim = d.outputDimensions;
        d.video = {
            ...d.video,
            duration: parseFloat(this.format.duration),
            width: dim.width,
            height: dim.height,
        };
        d.path = this.item.path;
        requestAnimationFrame(() => {
            d.fillborders = data ?? this.fillborders;
            d.markers = this.clips;
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
