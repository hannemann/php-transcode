import { ComboButton } from "./buttons/ComboButton";
import COMBO_BUTTON_CSS from './buttons/ComboButton/CSS'
import { ThemeButton } from "./buttons/ThemedButton";
import { Confirm } from "./modals/Confirm";
import { Dialogue } from "./modals/Dialogue";

customElements.define("theme-button", ThemeButton);
customElements.define("combo-button", ComboButton);
customElements.define("modal-confirm", Confirm);
customElements.define("modal-dialogue", Dialogue);

export {
    COMBO_BUTTON_CSS
}