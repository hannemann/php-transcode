export const requestChaptersKeep = async function (type) {
    try {
        const m = document.createElement("modal-confirm");
        m.header = "Keep Chapters";
        m.content = "Don't remove chapter metadata from output file?";
        document.body.appendChild(m);
        await m.confirm();
        const idx = this.filterGraph.findIndex(
            (f) => f.filterType === "chapters_keep",
        );
        if (idx > -1) {
            this.filterGraph.splice(idx, 1);
        }
        this.filterGraph.unshift({
            filterType: "chapters_keep",
            noProcessing: true,
        });
        this.saveSettings();
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};
