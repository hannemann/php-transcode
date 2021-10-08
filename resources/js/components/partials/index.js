import { ComboButton } from "./buttons/ComboButton";
import COMBO_BUTTON_CSS from './buttons/ComboButton/CSS'
import { ThemeButton } from "./buttons/ThemedButton";
import { Alert } from "./modals/Alert";
import { Confirm } from "./modals/Confirm";
import { Dialogue } from "./modals/Dialogue";
import { Window } from "./modals/Window";

customElements.define("theme-button", ThemeButton);
customElements.define("combo-button", ComboButton);
customElements.define("modal-alert", Alert);
customElements.define("modal-confirm", Confirm);
customElements.define("modal-dialogue", Dialogue);
customElements.define("modal-window", Window);

export {
    COMBO_BUTTON_CSS
}