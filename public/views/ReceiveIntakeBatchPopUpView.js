import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class ReceiveIntakeBatchPopUpView {
constructor() {
window.UpdateCategory = this.UpdateCategory.bind(this);
this.batch_id = null;
}

async PreRender(params) {
// Render the initial structure with the loader
const check_dashboard = document.querySelector('.update_cont');
if (!check_dashboard) {
await screenCollection.dashboardScreen.PreRender();
}

this.batch_id = params.b_id;


const cont = document.querySelector('.popup');
cont.classList.add('active');
cont.innerHTML = this.ViewReturn(params, 'active');

// Now call render which will fetch data and populate it

// this.attachListeners()
}


ViewReturn(params, loader = '') {
return `
<div class="container receive_intake_batch_popup">

    

</div>
`;
}

// attachListeners() {
// const cancel_btn = document.querySelector('br-button[type="cancel"]');

// cancel_btn.addEventListener('click', () => {
// const cont = document.querySelector('.popup');
// cont.classList.remove('active');
// cont.innerHTML = '';

// });
// }

async UpdateCategory(data_old) {
const btn_submit = document.querySelector('br-button[type="submit"]');
btn_submit.setAttribute('loading', true);

var data = {
...data_old,
id: this.batch_id
}

try {
const response = await fetch('/api/pharmacy/update_category', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(data)
});

if (!response.ok) {
throw new Error('failed To create visit. Server Error');
}

const result = await response.json();

if (result.success) {
notify('top_left', result.message, 'success');
// After successful creation, clear the popup and close it
const popup_cont = document.querySelector('.popup');
popup_cont.innerHTML = ''; // Clear the popup and close it
popup_cont.classList.remove('active');

dashboardController.singleMedicineCategoryView.PreRender(
{
id: this.batch_id
});

} else {
notify('top_left', result.message, 'warning');
}
} catch (error) {
notify('top_left', error.message, 'error');
}
finally {
btn_submit.setAttribute('loading', false);
}
}
}