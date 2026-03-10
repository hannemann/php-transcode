import { TYPE_VIDEO } from "../Streams";

export const requestCrop = async function (id = NaN, data = null) {
    try {
        const m = document.createElement("modal-window");
        const d = document.createElement("dialogue-cropper");

        m.header = "Cropper";
        m.classList.add("no-shadow");
        d.filterIndex = id;

        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);
        d.path = this.item.path;

        d.addEventListener(
            "cropper-initialized",
            () => {
                d.aspectRatio = `${d.video.width}:${d.video.height}`;
            },
            { once: true },
        );

        requestAnimationFrame(() => {
            d.markers = this.clips;
            if (!isNaN(id) && data) {
                d.addEventListener(
                    "cropper-updated",
                    () => {
                        d.crop = {
                            x: data.cx,
                            y: data.cy,
                            w: data.cw,
                            h: data.ch,
                        };
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
            "Crop video file %s to %dx%d at %d/%d",
            this.item.path,
            d.crop.w,
            d.crop.h,
            d.crop.x,
            d.crop.y,
        );
        this.crop = d.crop;
        const filterData = {
            cw: d.crop.w,
            ch: d.crop.h,
            cx: d.crop.x,
            cy: d.crop.y,
            filterType: "crop",
        };
        if (!isNaN(id) && data) {
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
