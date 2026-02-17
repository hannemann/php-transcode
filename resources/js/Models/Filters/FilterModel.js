import ConfiguratorHelper from "../../Helper/Configurator";

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

    /**
     * Updates the internal index.
     * Can be overridden by subclasses to trigger side effects.
     * @param {number} newIndex
     */
    setIndex(newIndex) {
        this.filterIndex = newIndex;
    }

    static get configurator() {
        if (!FilterModel.#configurator) {
            FilterModel.#configurator = ConfiguratorHelper.configurator;
        }
        return FilterModel.#configurator;
    }

    get isActive() {
        return FilterModel.configurator.filterIndex === this.filterIndex;
    }
}
