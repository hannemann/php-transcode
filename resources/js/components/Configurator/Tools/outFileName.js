export const requestOutFileName = async function () {
    try {
        const m = document.createElement("modal-dialogue");
        const d = document.createElement("dialogue-outfilename");
        d.classList.add("auto-width");
        m.header = "Output Filename";

        d.path = this.item.path;
        d.fileName = this.outFile;

        document.body.appendChild(m);
        m.appendChild(d);
        await m.open();
        logInfo(this.item.path, d.fileName);
        this.outFile = d.fileName;
        this.saveSettings();
    } catch (error) {
        if (error !== "cancel") {
            console.error(error);
        }
    }
};

const logInfo = function (path, fileName) {
    console.info("Rename video file %s to %s", path, fileName);
};
