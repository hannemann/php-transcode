import { TYPE_VIDEO } from "../Streams";

export const requestCrop = async function (type, id = null, data = null) {
    try {
        const m = document.createElement("modal-window");
        m.header = "Cropper";
        m.classList.add("no-shadow");
        const d = document.createElement("dialogue-cropper");
        const video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        const scaleFilter = this.filterGraph.find(f => f.filterType === 'scale');
        d.video = {
            ...video,
            duration: parseFloat(this.format.duration),
            width: scaleFilter?.width || video.width,
            height: scaleFilter?.height || video.height
        };
        d.crop = this.crop;
        d.path = this.item.path;
        d.type = type;
        d.markers = this.clips;
        d.filterIndex = id;
        m.appendChild(d);
        requestAnimationFrame(() => {
            d.mirror = false;
            d.replaceBlackBorders = true;
            if (id !== null && data) {
                d.mirror = data.mirror;
                d.replaceBlackBorders = data.replaceBlackBorders;
                d.mirror = data.mirror;
                d.addEventListener('cropper-updated', () => {
                    d.applyFilterData(data);
                }, {once: true});
            }
        });
        document.body.insertBefore(m, document.querySelector('transcoder-toast'));
        await m.open();
        console.info(
            "Crop video file %s to %dx%d at %d/%d and scale to %d pixel height with an aspect-ratio of %s",
            this.item.path,
            d.crop.cw,
            d.crop.ch,
            d.crop.cx,
            d.crop.cy,
            d.crop.height,
            d.crop.aspect
        );
        this.crop = d.crop;
        const filterData = {...d.crop, ...{filterType: 'crop'}};
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
