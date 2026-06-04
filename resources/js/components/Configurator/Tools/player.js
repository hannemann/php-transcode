import { VTime } from "../../../Helper/Time";
import "../Dialogues/Player";

export const requestPlay = async function (startTime, endTime) {
    const m = document.createElement("modal-window");
    const d = m.appendChild(document.createElement("dialogue-player"));
    try {
        d.path = this.item.path;
        d.config = this.config;
        d.aspectRatio = this.streams
            .filter((s) => s.codec_type === "video")[0]
            .display_aspect_ratio.replace(":", "/");

        d.duration = new VTime(VTime.calcCut(this.clips.clips)).seconds;
        d.startTime = startTime;
        d.endTime = endTime;

        m.dataset.closeButton = "true";
        m.dataset.noFooter = "true";
        m.header = "Player";
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();
    } catch (error) {
        if (error !== "cancel") {
            console.error(error);
        }
    }
};
