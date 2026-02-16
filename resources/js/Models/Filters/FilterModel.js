export class FilterModel {
    static #configurator;

    filterIndex = -1;

    constructor() {
        if (new.target === FilterModel) {
            throw new Error(
                "Abstract class 'FilterModel' cannot be instantiated.",
            );
        }
    }

    get configurator() {
        if (!FilterModel.#configurator) {
            FilterModel.#configurator =
                document.querySelector("ffmpeg-transcoder").configurator;
        }
        return FilterModel.#configurator;
    }

    get isActive() {
        return this.configurator.filterIndex === this.filterIndex;
    }
}
