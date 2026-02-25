import { TYPE_VIDEO } from "../Streams";

export const requestPad = async function (type, id = NaN, data = null) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Pad Video";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-pad");
        d.filterIndex = id;
        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        const dim = d.outputDimensions;
        d.video = {
            ...d.video,
            duration: parseFloat(this.format.duration),
            width: dim.width,
            height: dim.height,
            display_aspect_ratio: `${dim.width}:${dim.height}`,
        };
        d.path = this.item.path;
        d.type = type;
        requestAnimationFrame(() => {
            d.pad = this.pad || {
                color: "#000000",
                cw: d.video.width,
                ch: d.video.height,
                cx: 0,
                cy: 0,
            };
            d.markers = this.clips;
            d.width = d.video.width;
            d.height = d.video.height;
            if (id !== null && data) {
                d.addEventListener(
                    "cropper-updated",
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
            "Place video file %s %dx%d on %s canvas at %d/%d",
            this.item.path,
            d.pad.cw,
            d.pad.ch,
            d.color,
            d.pad.cx,
            d.pad.cy,
        );
        this.pad = d.pad;
        const filterData = { ...d.pad, ...{ filterType: "pad" } };
        if (id !== null && data) {
            this.filterGraph[id] = filterData;
        } else {
            this.filterGraph.push(filterData);
        }
        this.saveSettings();
    } catch (error) {
        if (error !== "cancel") {
            console.error(error);
        }
    }
};
