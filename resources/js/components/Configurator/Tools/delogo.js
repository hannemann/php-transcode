import { TYPE_VIDEO } from "../Streams";

export const requestDelogo = async function (type, id = null, data = null) {
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
        d.type = type;
        d.markers = this.clips;
        m.appendChild(d);
        if (id !== null && data) {
            d.addEventListener('delogo-updated', () => {
                d.applyFilterData(data);
            }, {once: true});
        }
        document.body.insertBefore(m, document.querySelector('transcoder-toast'));
        await m.open();
        this.delogo = {...d.coords, ...[type], between: d.between};
        console.info(
            "Delogo video file %s. x: %d, x: %d, w: %d, h: %d, from: %s, to: %s, type: %s",
            this.item.path,
            this.delogo.x,
            this.delogo.y,
            this.delogo.w,
            this.delogo.h,
            this.delogo.between.from?.toString() || 'n/a',
            this.delogo.between.to?.toString() || 'n/a',
            type
        );
        const filterData = {
            filterType: 'delogo',
            ...this.delogo
        };
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
