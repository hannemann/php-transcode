import { Request } from "@/components/Request";

export const requestConcat = async function (container) {
    const m = document.createElement("modal-dialogue");
    const d = m.appendChild(document.createElement("dialogue-concat"));
    try {
        m.header = "Concat";
        d.streams = this.streams;
        d.files = this.item?.parent?.videoFiles?.filter((f) => !f.internal);
        document.body.appendChild(m);
        await m.open();
        console.info(
            "Concat video files in %s",
            this.item.path,
            container,
            d.files,
            d.streams
        );
        await Request.post(`/concat/${encodeURIComponent(this.item.path)}`, {
            container,
            streams: d.streams.map((s) => s.index),
            files: d.files.map((f) => f.name),
        });
    } catch (error) {
        console.error(error);
    }
};
