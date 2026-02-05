import Painterro from "painterro";

// https://github.com/devforth/painterro?tab=readme-ov-file#ui-color-scheme
const COLOR_SCHEME = {
    backgroundColor: "var(--clr-bg-0)",
    main: "var(--clr-bg-150)",
    control: "var(--clr-bg-140)",
    activeControl: "var(--clr-bg-400)",
    activeControlContent: "var(--clr-bg-0)",
    controlContent: "var(--clr-text-0)",
    controlShadow: "0px 0px 3px 1px var(--clr-bg-200)",
    inputBackground: "var(--clr-bg-140)",
    inputText: "var(--clr-text-0)",
    hoverControl: "var(--clr-bg-300)",
    hoverControlContent: "var(--clr-text-100)",
};

const ID = "painterro-paintarea";
const paintArea = document.createElement("div");
paintArea.id = ID;

export default class Paint {
    static Painterro;

    /**
     * @param {Function} saveHandler    callback function to save resulting image
     * @param {Function} closeHandler   callback to handle close event
     * @returns {Painterro}
     */
    static init(saveHandler, closeHandler) {
        paintArea.innerHTML = STATUS_CSS;
        document.body.insertBefore(
            paintArea,
            document.querySelector("transcoder-toast"),
        );
        Paint.Painterro = Painterro({
            id: ID,
            colorScheme: COLOR_SCHEME,
            backgroundFillColor: "#000000",
            activeColor: "#000000",
            activeFillColor: "#000000",
            availableLineWidths: [20, 50, 100, 150, 500],
            defaultLineWidth: 150,
            defaultTool: "brush",
            language: "de",
            imageFormat: "png",
            customTools: [
                {
                    name: "White-Pixels",
                    iconUrl: Paint.statusFakeIcon,
                    callback: () => {},
                },
            ],
            onChange: () => {
                const indicator = paintArea.querySelector(
                    'button[title="White-Pixels"]',
                );
                if (!indicator) return;
                const percent = Paint.getWhitePixelPercent();
                indicator.dataset.white = `White Pixels: ${percent}%`;
                indicator.classList.toggle("load-warning", percent > 10);
            },
            onClose: async () => {
                if ("function" === typeof closeHandler) {
                    await closeHandler();
                }
                document.body.removeChild(paintArea);
            },
            saveHandler: function (image, callback) {
                Paint.save.call(this, saveHandler, image, callback);
            },
        });
        return Paint.Painterro;
    }

    /**
     * compute white pixel percentage
     * @returns {Number}
     */
    static getWhitePixelPercent() {
        const canvas = Paint.canvas;
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let whitePixels = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 10 || data[i + 1] > 10 || data[i + 2] > 10) {
                whitePixels++;
            }
        }

        return ((whitePixels / (canvas.width * canvas.height)) * 100).toFixed(
            2,
        );
    }

    /**
     * wrapper for save handler
     * @param {Function} saveHandler
     * @param {*} image
     * @param {Function} callback
     */
    static async save(saveHandler, image, callback) {
        let success = true;
        try {
            await saveHandler(image);
        } catch (error) {
            success = false;
        } finally {
            callback(success);
            success && Paint.Painterro.close();
        }
    }

    /**
     * obtain fake icon for white pixel indicator
     */
    static get statusFakeIcon() {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    /**
     * obtain canvas element
     */
    static get canvas() {
        return paintArea.querySelector("canvas");
    }
}

const STATUS_CSS = html` <style>
    #painterro-paintarea button[title="White-Pixels"] {
        min-width: 100px;
        position: relative;
        cursor: default;
        pointer-events: none;

        &::after {
            content: attr(data-white);
            position: absolute;
            inset: 0;
            display: grid;
            place-content: center;
            color: var(--clr-text-success);
            font-size: 13px;
        }

        &.load-warning::after {
            color: var(--clr-text-error);
        }
    }
</style>`;
