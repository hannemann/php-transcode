import { TYPE_VIDEO } from "../Streams";

export const requestCrop = async function (type, id = NaN, data = null) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Cropper";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-cropper");
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
        d.type = type;
        requestAnimationFrame(() => {
            d.crop = this.crop;
            d.markers = this.clips;
            d.mirror = false;
            d.width = d.video.width;
            d.height = d.video.height;
            d.replaceBlackBorders = true;
            if (id !== null && data) {
                d.mirror = data.mirror;
                d.replaceBlackBorders = data.replaceBlackBorders;
                d.mirror = data.mirror;
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
            "Crop video file %s to %dx%d at %d/%d and scale to %d pixel height with an aspect-ratio of %s",
            this.item.path,
            d.crop.cw,
            d.crop.ch,
            d.crop.cx,
            d.crop.cy,
            d.crop.height,
            d.crop.aspect,
        );
        this.crop = d.crop;
        const filterData = {
            cw: d.crop.cw,
            ch: d.crop.ch,
            cx: d.crop.cx,
            cy: d.crop.cy,
            filterType: "crop",
        };
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
