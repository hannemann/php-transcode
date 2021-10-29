import { requestScale } from "./scale.js";
import { requestConcat } from "./concat.js";
import { requestCrop } from "./crop.js";
import { requestRemux } from "./remux.js";
import { clipper } from "./clipper.js";
import { requestDelogo } from "./delogo.js";
import { requestRemovelogo } from "./removelogo.js";

export const toolProxy = function (e) {
    const args = e.target.value.split(":");
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
    }
};
