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

    static openFilterLogoPixelsDialog() {
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

        thresholdInput.oninput = update;
        haloInput.oninput = update;
        update();
    }

    static filterLogoPixels(p, threshold = 140, radius = 1) {
        if (!p) return;
        const canvas = Paint.canvas;
        const ctx = canvas.getContext("2d");

        // 1. Sicherheit: Originaldaten initialisieren, falls noch nicht vorhanden
        if (!Paint.originalImageData) {
            Paint.originalImageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );
        }

        // 2. Kopie der Originaldaten erstellen, damit wir die Vorschau zerstörungsfrei berechnen
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

        // A: Adaptive Detektion
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

        // B: Halo erzeugen
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

        // C: Auf tempImageData anwenden
        for (let i = 0; i < data.length; i += 4) {
            const isWhite = finalMask[i / 4] === 1;
            data[i] = data[i + 1] = data[i + 2] = isWhite ? 255 : 0;
            data[i + 3] = 255;
        }

        // Hier wird nun explizit ein korrektes ImageData-Objekt übergeben
        ctx.putImageData(tempImageData, 0, 0);
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

    static get filterLogoPixelsIcon() {
        return `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M15,3H12V6H15V3M19,3H16V6H19V3M15,7H12V10H15V7M19,7H16V10H19V7M11,3H8V6H11V3M7,3H4V6H7V3M11,7H8V10H11V7M7,7H4V10H7V7M21,11V21H3V11H21M19,19V13H5V19H19Z"/></svg>')}`;
    }

    /**
     * obtain canvas element
     */
    static get canvas() {
        return paintArea.querySelector("canvas");
    }
}

const STATUS_CSS = css`
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
            gap: 10px;
            font-size: 11px;
            color: #888;

            input {
                flex: 1;
                cursor: pointer;
            }

            .current-value {
                text-align: center;
                font-size: 13px;
                margin-top: 5px;
                color: var(--clr-bg-400); /* Oder eine deiner Akzentfarben */
            }
        }
    }
`;

/**
 * Dialog Template Definition (Außerhalb der Klasse)
 */
Paint.dialogTemplate = html`
    <style>
        ${EXTRACT_WHITE_CSS}
    </style>
    <div class="slider-container">
        <span class="label">Schwellwert</span>
        <div class="slider-row">
            <span>20</span>
            <input type="range" id="threshold" min="20" max="250" value="140" />
            <span>250</span>
        </div>
        <div class="current-value">
            Wert: <span id="val-threshold">140</span>
        </div>
    </div>
    <div class="slider-container">
        <span class="label">Halo (Radius)</span>
        <div class="slider-row">
            <span>0</span>
            <input type="range" id="halo" min="0" max="2" value="1" />
            <span>2</span>
        </div>
        <div class="current-value">Wert: <span id="val-halo">1</span></div>
    </div>
`;
