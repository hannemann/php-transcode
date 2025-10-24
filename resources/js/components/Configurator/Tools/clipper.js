import { TYPE_VIDEO } from "../Streams";

export const clipper = async function () {
    if (this.format.format_name === "mpegts") {
        const m = document.createElement("modal-alert");
        m.appendChild(
            document.createTextNode(
                "Clipper does not work with mpegts Files. Remux first."
            )
        );
        document.body.appendChild(m);
        await m.alert();
        return;
    }
    const m = document.createElement("modal-window");
    m.header = "Clipper";
    m.classList.add("no-shadow");
    const d = document.createElement("dialogue-clipper");
    d.setClips(this.clips.getTimestamps());
    d.video = {
        ...this.streams.filter((s) => s.codec_type === TYPE_VIDEO)?.[0],
        duration: parseFloat(this.format.duration),
    };
    d.path = this.item.path;
    d.markers = this.chapters;
    m.appendChild(d);
    document.body.insertBefore(m, document.querySelector('transcoder-toast'));
    try {
        await m.open();
        this.clips.clips = [];
        for (let i = 0; i < d.clips.length; i++) {
            this.clips.addClip(
                d.clips[i]?.timestamps.start ?? null,
                d.clips[i]?.timestamps.end ?? null
            );
        }
        this.clips.update();
        this.saveSettings();
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};
