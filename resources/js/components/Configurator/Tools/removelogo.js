import { RemoveLogo } from "../../../Models/Filters/RemoveLogo";
import { TYPE_VIDEO } from "../Streams";
import { FilterGraph } from "../../../Models/Filters/FilterGraph";
import { Request } from "../../Request";
import { STATE_INFO, STATE_ERROR } from "../../Toast";
import Paint from "../../../Helper/Paint";
import { alertWhitePixelError } from "../Dialogues/RemoveLogo";

export const requestRemovelogo = async function (model) {
    const backup = JSON.stringify(this.filterGraph);
    model = model || new RemoveLogo();

    try {
        const m = document.createElement("modal-window");
        m.header = "Removelogo";
        m.classList.add("no-shadow");

        m.confirmBeforeAction = async () => {
            Paint.checkImage = d.maskThumb;
            const nonBlackPercent = Paint.getWhitePixelPercent();
            Paint.clearPaintArea();
            if (nonBlackPercent > 10) {
                throw new Error(await alertWhitePixelError(nonBlackPercent));
            }
        };

        const d = document.createElement("dialogue-removelogo");
        d.video = this.streams.find((s) => s.codec_type === TYPE_VIDEO);
        ({ width: d.video.width, height: d.video.height } = d.outputDimensions);
        d.video.duration = parseFloat(this.format.duration);

        model.w = d.video.width;
        model.h = d.video.height;
        d.path = this.item.path;
        d.filterIndex = model.filterIndex;
        d.configurator = this;
        d.model = model;
        requestAnimationFrame(() => {
            d.markers = this.clips;
        });
        m.appendChild(d);
        document.body.insertBefore(
            m,
            document.querySelector("transcoder-toast"),
        );
        await m.open();

        model.timestamp = d.current;

        logInfo(this.item.path, model);
        this.removeLogo = model;
        if (isNaN(parseInt(model.filterIndex))) {
            this.filterGraph.push(model);
        }
        await this.saveSettings();
    } catch (error) {
        // 1. Silent Rollback: User actively clicked "Cancel" or pressed "Escape"
        if (error === "cancel") {
            console.info("Rolling back changes.");
        }
        // 2. Error Rollback: Something actually crashed
        else if (error) {
            console.error("Critical error during Removelogo operation:", error);
        }

        // Always restore the backup to ensure UI and data consistency

        // restore/delete image
        const path = encodeURIComponent(this.item.path);
        const fileId = model.fileId;
        let response;
        if (model.originalMaskData) {
            // overwrite mask saved by dialogue
            response = await Request.post(
                `/removelogoCustomMask/${path}/${fileId}`,
                { image: model.originalMaskData },
            );
            delete model.originalMaskData;
        } else if (model.hasFilterIndex) {
            // delete mask
            response = await Request.delete(
                `/removelogoImage/${path}/${fileId}`,
            );
        }
        if (response) {
            const result = await response.json();
            document.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        message: "Restore backup: " + result.message,
                        type: STATE_INFO,
                    },
                }),
            );
        }
        this.filterGraph = new FilterGraph(JSON.parse(backup));
        this.saveSettings();
    }
};

const logInfo = function (path, model) {
    console.info(
        "Removelogo video file %s. Create logomask at timestamp %s, width: %s, height: %s, Enable between %s, %s",
        path,
        model.timestamp,
        model.w,
        model.h,
        model.between.from,
        model.between.to,
    );
};
