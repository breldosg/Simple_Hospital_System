import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class ReceiveIntakeBatchPopUpView {
constructor() {
window.Search_medicine_and_consumable = this.Search_medicine_and_consumable.bind(this);
this.batch_id = null;
this.batchNumber = 1; // Keep track of current batch
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
document.getElementById('input_slide').scrollIntoView({ behavior: 'smooth' });

}


ViewReturn() {
return `
<div class="container receive_intake_batch_popup">

    <div class="left">

        <div class="slider" id="search_slide">
            <p class="heading">Select Product</p>
            <div class="search_cont_cont">

                <br-form callback="Search_medicine_and_consumable">
                    <div class="search_cont">
                        <br-input label="Product Name" name="query" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;"></br-input>

                    </div>
                </br-form>


            </div>

            <div class="result_cont">
                <div class="start_view">
                    <p class="start_view_overlay">Search Now</p>
                </div>
            </div>


        </div>

        <div class="slider" id="input_slide">

        </div>

    </div>
    <div class="line"></div>
    <div class="right">

        

    </div>

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

async fetch_data(searchTerm) {
try {
const response = await fetch('/api/pharmacy/medicine_list', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
query: searchTerm,
batch: this.batchNumber,
})
});

if (!response.ok) {
throw new Error('Server Error');
}

const result = await response.json();

return result.success ? result.data : [];
} catch (error) {
console.error('Error:', error);
notify('top_left', error.message, 'error');
return null;
}
}

async Search_medicine_and_consumable(query) {
const data = await this.fetch_data(query.query);

const tableBody = document.querySelector('.result_cont');
if (!tableBody) {
return;
}
// check if the batch number is 1
if (this.batchNumber === 1) {
tableBody.innerHTML = '';
}

if (data.medicineList.length > 0) {
data.medicineList.forEach((medicine) => {
const row = document.createElement('div');
row.classList.add('row');
row.setAttribute('data_src', medicine.id);
row.setAttribute('title', medicine.name);
row.innerHTML = `
<div class="name">${medicine.name}</div>
<div class="type">Drug</div>
`;
// Attach click event listener to the row
row.addEventListener('click', () => {
this.open_fill_form(medicine.id, medicine.name)
});
tableBody.appendChild(row);
});
} else {
tableBody.innerHTML = `
<div class="start_view">
    <p class="start_view_overlay">No Results Found</p>
</div>
`;
}
}

open_fill_form(id, name) {
document.getElementById('input_slide').scrollIntoView({ behavior: 'smooth' });

}

}