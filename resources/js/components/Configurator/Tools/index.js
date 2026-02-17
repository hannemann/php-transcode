import { requestScale } from "./scale.js";
import { requestConcat } from "./concat.js";
import { requestCrop } from "./crop.js";
import { requestRemux } from "./remux.js";
import { clipper } from "./clipper.js";
import { requestDelogo } from "./delogo.js";
import { requestRemovelogo } from "./removelogo.js";
import { requestPlay } from "./player.js";
import { requestDeinterlace } from "./deinterlace.js";
import { requestFillborders } from "./fillborders.js";
import { requestChaptersKeep } from "./chaptersKeep.js";
import { requestPad } from "./pad.js";

export const toolProxy = async function (e) {
    const args = e.target.value.split(":");
    const instantOpen = args.includes("instantOpen");
    if (instantOpen) (args.splice(args.indexOf("instantOpen")), 1);
    if (e.type === "change" && !instantOpen) return;

    await this.saveSettings(false, true);
    switch (args.shift()) {
        case "concat":
            requestConcat.apply(this, args);
            break;
        case "scale":
            requestScale.apply(this, args);
            break;
        case "remux":
            requestRemux.apply(this, args);
            break;
        case "crop":
            requestCrop.apply(this, args);
            break;
        case "clip":
            clipper.apply(this, args);
            break;
        case "delogo":
            requestDelogo.apply(this, args);
            break;
        case "removelogo":
            requestRemovelogo.apply(this, args);
            break;
        case "play":
            requestPlay.apply(this, args);
            break;
        case "deinterlace":
            requestDeinterlace.apply(this, args);
            break;
        case "chapters_keep":
            requestChaptersKeep.apply(this, args);
            break;
        case "fillborders":
            requestFillborders.apply(this, args);
            break;
        case "pad":
            requestPad.apply(this, args);
            break;
    }
};
