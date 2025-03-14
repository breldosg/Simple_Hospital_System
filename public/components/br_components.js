import { BrCustomAlert } from "./br_alert.js";
import { BrCustomButton } from "./br_button.js";
import { BrCustomDateRangePicker } from "./br_date_range_picker.js";
import { BrCustomForm } from "./br_form.js";
import { BrCustomInput } from "./br_input.js";
import { BrCustomMultipleSelect } from "./br_multiple_select.js";
import { BrCustomNavigation } from "./br_navigation.js";
import { BrCustomOption } from "./br_option.js";
import { BrCustomSelect } from "./br_select.js";


customElements.define('br-select', BrCustomSelect);
customElements.define('br-form', BrCustomForm);
customElements.define('br-option', BrCustomOption);
customElements.define('br-multiple-select', BrCustomMultipleSelect);
customElements.define('br-input', BrCustomInput);
customElements.define('br-navigation', BrCustomNavigation);
customElements.define('br-alert', BrCustomAlert);
customElements.define('br-button', BrCustomButton);
customElements.define('br-date-range-picker', BrCustomDateRangePicker);

