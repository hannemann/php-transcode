import { TYPE_VIDEO } from "../Streams";

export const requestDeinterlace = async function (type) {
    try {
        const m = document.createElement("modal-confirm");
        m.header = "Deinterlace";
        m.content = "Add Deinterlace filter to filtergraph?";
        document.body.appendChild(m);
        await m.confirm();
        const idx = this.filterGraph.findIndex(f => f.filterType === 'deinterlace');
        if (idx > -1) {
            this.filterGraph.splice(idx, 1);
        }
        this.filterGraph.unshift({filterType: 'deinterlace'});
        this.saveSettings();
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};