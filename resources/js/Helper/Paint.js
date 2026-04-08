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

const BRUSH_PRESETS = [
    { name: "Small", size: 20, color: "#000000" },
    { name: "Medium", size: 100, color: "#000000" },
    { name: "Large", size: 500, color: "#000000" },
    { name: "White", size: 150, color: "#FFFFFF" },
];

const ID = "painterro-paintarea";
const paintArea = document.createElement("div");
paintArea.id = ID;

const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

export default class Paint {
    static Painterro;

    /**
     * @param {Function} saveHandler    callback function to save resulting image
     * @param {Function} closeHandler   callback to handle close event
     * @returns {Painterro}
     */
    static init(saveHandler, closeHandler) {
        paintArea.innerHTML = `<style>${STATUS_CSS}</style>`;
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
                {
                    name: "Filter Logo Pixels",
                    iconUrl: Paint.filterLogoPixelsIcon,
                    callBack: () => {
                        Paint.openFilterLogoPixelsDialog();
                        Paint.Painterro.closeActiveTool(
                            Paint.Painterro.activeTool,
                        );
                    },
                },
                {
                    name: "Small Brush White",
                    iconUrl: Paint.filterLogoPixelsIcon,
                    callBack: () => {
                        const color = {
                            palleteColor: "#FFFFFF",
                            alpha: 1,
                            alphaColor: "#FFFFFF",
                        };
                        Paint.Painterro.setLineWidth(20);
                        Paint.Painterro.setColor.call(Paint.Painterro, [
                            "bg",
                            color,
                        ]);
                        Paint.Painterro.closeActiveTool(
                            Paint.Painterro.activeTool,
                        );
                    },
                },
                {
                    name: "Medium Brush Black",
                    iconUrl: Paint.filterLogoPixelsIcon,
                    callBack: () => {
                        const color = {
                            palleteColor: "#000000",
                            alpha: 1,
                            alphaColor: "#000000",
                        };
                        Paint.Painterro.setLineWidth(150);
                        Paint.Painterro.setColor.call(Paint.Painterro, [
                            "bg",
                            color,
                        ]);
                        Paint.Painterro.closeActiveTool(
                            Paint.Painterro.activeTool,
                        );
                    },
                },
                {
                    name: "Big Brush Black",
                    iconUrl: Paint.filterLogoPixelsIcon,
                    callBack: () => {
                        const color = {
                            palleteColor: "#000000",
                            alpha: 1,
                            alphaColor: "#000000",
                        };
                        Paint.Painterro.setLineWidth(500);
                        Paint.Painterro.setColor.call(Paint.Painterro, [
                            "bg",
                            color,
                        ]);
                        Paint.Painterro.closeActiveTool(
                            Paint.Painterro.activeTool,
                        );
                    },
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
                Paint.clearPaintArea();
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
     * Initializes the filter logo pixels dialog.
     * Captures the current canvas state as a non-destructive original,
     * injects the filter configuration UI into the modal-dialogue component,
     * and sets up live-preview bindings for threshold and halo parameters.
     * @returns {void}
     */
    static async openFilterLogoPixelsDialog() {
        if (document.getElementById("logofilter-settings-dialog")) return;

        const ctx = Paint.canvas.getContext("2d");
        Paint.originalImageData = ctx.getImageData(
            0,
            0,
            Paint.canvas.width,
            Paint.canvas.height,
        );

        const dialog = document.createElement("modal-dialogue");
        dialog.header = "Filter Logo Settings";
        dialog.id = "logofilter-settings-dialog";
        dialog.innerHTML = Paint.dialogTemplate;
        document.body.appendChild(dialog);

        const thresholdInput = dialog.querySelector("#threshold");
        const valThreshold = dialog.querySelector("#val-threshold");
        const haloInput = dialog.querySelector("#halo");
        const valHalo = dialog.querySelector("#val-halo");

        const update = () => {
            const threshold = parseInt(thresholdInput.value);
            const radius = parseInt(haloInput.value);
            valThreshold.innerText = threshold;
            valHalo.innerText = radius;
            Paint.filterLogoPixels(Paint.Painterro, threshold, radius);
        };

        const debouncedUpdate = debounce(update, 100);

        try {
            thresholdInput.addEventListener("input", debouncedUpdate);
            haloInput.addEventListener("input", debouncedUpdate);
            update();

            await dialog.open();
            Paint.Painterro.worklog.captureState(false);
        } catch (error) {
            if (error === "cancel") {
                if (Paint.originalImageData) {
                    ctx.putImageData(Paint.originalImageData, 0, 0);
                }
            } else {
                console.error(error);
            }
        } finally {
            Paint.Painterro.params.onChange();
            if (Paint.originalImageData) {
                Paint.originalImageData = null;
            }
            thresholdInput.removeEventListener("input", debouncedUpdate);
            haloInput.removeEventListener("input", debouncedUpdate);
        }
    }

    /**
     * Applies a non-destructive logo filter to the canvas based on local contrast detection.
     * Extracts white pixels to form a mask and applies a dilation (halo) effect.
     * @param {Object} p - The Painterro instance or current paint context.
     * @param {number} [threshold=140] - The sensitivity threshold for logo pixel detection (0-255).
     * @param {number} [radius=1] - The dilation radius to create a halo around detected edges.
     * @returns {void}
     */
    static filterLogoPixels(p, threshold = 140, radius = 1) {
        if (!p) return;
        const canvas = Paint.canvas;
        const ctx = canvas.getContext("2d");

        // 1. Create a copy of the original data to calculate the preview non-destructively
        const tempImageData = new ImageData(
            new Uint8ClampedArray(Paint.originalImageData.data),
            Paint.originalImageData.width,
            Paint.originalImageData.height,
        );

        const data = tempImageData.data;
        const width = tempImageData.width;
        const height = tempImageData.height;
        const buffer = new Uint8ClampedArray(data);
        const detectionMask = new Uint8Array(width * height);

        // A: Adaptive Detection
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                const lum =
                    0.299 * buffer[i] +
                    0.587 * buffer[i + 1] +
                    0.114 * buffer[i + 2];

                let neighborLum = 0;
                for (let ny = -1; ny <= 1; ny++) {
                    for (let nx = -1; nx <= 1; nx++) {
                        const ni = ((y + ny) * width + (x + nx)) * 4;
                        neighborLum +=
                            0.299 * buffer[ni] +
                            0.587 * buffer[ni + 1] +
                            0.114 * buffer[ni + 2];
                    }
                }
                neighborLum /= 8;

                if (lum - neighborLum > threshold / 10 || lum > threshold) {
                    detectionMask[y * width + x] = 1;
                }
            }
        }

        // B: create white halo around detected pixels
        const finalMask = new Uint8Array(detectionMask);
        if (radius > 0) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (detectionMask[y * width + x] === 1) continue;
                    for (let ny = -radius; ny <= radius; ny++) {
                        for (let nx = -radius; nx <= radius; nx++) {
                            const ty = y + ny,
                                tx = x + nx;
                            if (
                                tx >= 0 &&
                                tx < width &&
                                ty >= 0 &&
                                ty < height &&
                                detectionMask[ty * width + tx] === 1
                            ) {
                                finalMask[y * width + x] = 1;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // C: apply to tempImageData
        for (let i = 0; i < data.length; i += 4) {
            const isWhite = finalMask[i / 4] === 1;
            data[i] = data[i + 1] = data[i + 2] = isWhite ? 255 : 0;
            data[i + 3] = 255;
        }

        // write image data to canvas context
        ctx.putImageData(tempImageData, 0, 0);
        Paint.Painterro.params.onChange();
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

    static clearPaintArea() {
        Paint.paintArea.innerHTML = "";
    }

    static get checkWhitePixelCanvas() {
        let canvas = Paint.paintArea.querySelector(
            "canvas[data-white-pixel-check]",
        );
        if (canvas) return canvas;
        canvas = document.createElement("canvas");
        canvas.dataset.whitePixelCheck = "";
        canvas.style.display = "none";
        Paint.paintArea.append(canvas);
        return canvas;
    }

    /**
     * @param {HTMLImageElement} image
     */
    static set checkImage(image) {
        const canvas = Paint.checkWhitePixelCanvas;
        const ctx = canvas.getContext("2d");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
    }

    /**
     * obtain fake icon for white pixel indicator
     */
    static get statusFakeIcon() {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    /**
     * Obtain logo filter icon with color from COLOR_SCHEME
     */
    static get filterLogoPixelsIcon() {
        const svg = `<svg fill="${COLOR_SCHEME.controlContent}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path></g></svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Obtain brush icon with color from COLOR_SCHEME
     */
    static get brushIcon() {
        const svg = `<svg fill="${COLOR_SCHEME.controlContent}" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 444.892 444.892" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_476_"> <path id="XMLID_503_" d="M440.498,173.103c5.858-5.857,5.858-15.355,0-21.213l-22.511-22.511c-5.091-5.091-13.084-5.846-19.038-1.8 l-47.332,32.17l31.975-47.652c3.993-5.951,3.219-13.897-1.85-18.964l-48.83-48.83c-4.508-4.508-11.372-5.675-17.114-2.908 l-8.443,4.065l4.043-8.97c2.563-5.685,1.341-12.361-3.068-16.771L293.002,4.393c-5.857-5.857-15.355-5.857-21.213,0 l-119.06,119.059l168.71,168.71L440.498,173.103z"></path> <path id="XMLID_1199_" d="M130.56,145.622l-34.466,34.466c-2.813,2.813-4.394,6.628-4.394,10.606s1.58,7.794,4.394,10.606 l32.694,32.694c6.299,6.299,9.354,14.992,8.382,23.849c-0.971,8.851-5.843,16.677-13.366,21.473 C27.736,340.554,18.781,349.51,15.839,352.453c-21.119,21.118-21.119,55.48,0,76.6c21.14,21.14,55.504,21.098,76.6,0 c2.944-2.943,11.902-11.902,73.136-107.965c4.784-7.505,12.607-12.366,21.462-13.339c8.883-0.969,17.575,2.071,23.859,8.354 l32.694,32.694c5.857,5.857,15.356,5.857,21.213,0l34.467-34.467L130.56,145.622z M70.05,404.825c-8.28,8.28-21.704,8.28-29.983,0 c-8.28-8.28-8.28-21.704,0-29.983c8.28-8.28,21.704-8.28,29.983,0C78.33,383.121,78.33,396.545,70.05,404.825z"></path> </g> </g></svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * obtain canvas element
     */
    static get canvas() {
        return paintArea.querySelector("canvas");
    }

    static get paintArea() {
        return paintArea;
    }
}

const STATUS_CSS = css`
    #painterro-paintarea {
        button:has([src*="data:image/svg+xml"]) {
            position: relative;

            img {
                display: none;
            }

            &::after {
                content: "";
                display: inline-block;
                width: 14px;
                aspect-ratio: 1;
                background-color: var(--clr-text-0);

                -webkit-mask-repeat: no-repeat;
                mask-repeat: no-repeat;
                -webkit-mask-position: center;
                mask-position: center;
                -webkit-mask-size: contain;
                mask-size: contain;
            }

            &[title="Filter Logo Pixels"]::after {
                -webkit-mask-image: url(${Paint.filterLogoPixelsIcon});
                mask-image: url(${Paint.filterLogoPixelsIcon});
            }

            &[title*=" Brush "]::after {
                -webkit-mask-image: url(${Paint.brushIcon});
                mask-image: url(${Paint.brushIcon});
            }

            &[title*=" Brush White"]::after {
                background-color: white;
            }

            &[title*=" Brush Black"]::after {
                background-color: black;
            }

            &[title*="Small Brush"]::after {
                width: 0.6rem;
            }

            &[title*="Medium Brush"]::after {
                width: 0.9rem;
            }

            &[title*="Big Brush"]::after {
                width: 1.2rem;
            }
        }

        button[title="White-Pixels"] {
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
    }

    #logofilter-settings-dialog {
        z-index: 99999;
    }
`;

const EXTRACT_WHITE_CSS = css`
    .slider-container {
        margin-bottom: 15px;

        .label {
            font-size: 12px;
            color: #aaa;
            display: block;
            margin-bottom: 5px;
        }

        .slider-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.65rem;

            input {
                flex: 1;
                cursor: pointer;
            }
        }

        .current-value {
            text-align: center;
            margin-top: 0.5rem;
            font-size: 0.85rem;
        }
    }
`;

/**
 * Dialogue Template Definition
 */
Paint.dialogTemplate = html`
    <style>
        ${EXTRACT_WHITE_CSS}
    </style>
    <div class="slider-container">
        <span class="label">Threshold</span>
        <div class="slider-row">
            <span>20</span>
            <input type="range" id="threshold" min="20" max="250" value="140" />
            <span>250</span>
        </div>
        <div class="current-value">
            <span id="val-threshold">140</span>
        </div>
    </div>
    <div class="slider-container">
        <span class="label">Dilation (Radius)</span>
        <div class="slider-row">
            <span>0</span>
            <input type="range" id="halo" min="0" max="2" value="1" />
            <span>2</span>
        </div>
        <div class="current-value">
            <span id="val-halo">1</span>
        </div>
    </div>
`;
