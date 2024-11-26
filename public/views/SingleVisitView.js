import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class SingleVisitView {
constructor() {
this.visit_id = null;
this.patient_name = null;

}
async PreRender(params) {
// Render the initial structure with the loader
const check_dashboard = document.querySelector('.update_cont');
if (!check_dashboard) {
await screenCollection.dashboardScreen.PreRender();
}


const cont = document.querySelector('.update_cont');
cont.innerHTML = this.ViewReturn('', 'active');

this.visit_id = params.id;
// Now call render which will fetch data and populate it
this.render(params.id);
}

async render(id) {
const cont = document.querySelector('.update_cont');
const patient_data = await this.fetchData(500); // Wait for fetchData to complete

this.patient_name = patient_data.name;

if (patient_data) {
cont.innerHTML = this.ViewReturn(patient_data);
this.attach_listeners()
} else {
// Handle case where no roles were returned, or an error occurred.
cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
}
}

ViewReturn(data, loader = '') {


return `
<div class="single_visit_cont">

    <div class="top_card">

        <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">

            <div class="card name_card">
                <div class="dit_group">
                    <p class="name">${data == '' ? '' : data.name}</p>
                    <p class="description"> Patient id: <span>${data == '' ? '' : data.id}</span></p>
                </div>

                <button type="button" data_src="${data == '' ? '' : data.id}" class="edit_btn">
                    <span class='switch_icon_edit'></span>
                </button>

            </div>

            <div class="card">
                <div class="icon_card">
                    <span class='switch_icon_user'></span>
                    <p>${data == '' ? '' : data.gender}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_calendar_check'></span>
                    <p>${date_formatter(data == '' ? '2001-02-01' : data.dob)} (${data == '' ? '' : data.age}
                        years)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_location_dot'></span>
                    <p>${data == '' ? '' : data.address} (<span>${data == '' ? '' : data.nationality}</span>)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_phone'></span>
                    <p>${data == '' ? '' : data.phone} <span>/</span> ${data == '' ? '' : data.alt_phone}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_briefcase'></span>
                    <p>${data == '' ? '' : data.occupation}</p>
                </div>

            </div>

        </div>

        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>

    <div class="more_visit_detail">

        <div class="more_visit_detail_card patient_note_cards_cont_cont">
            <div class="head_part">
                <h4 class="heading">Patient Note</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">

                <!-- no note show -->
                <!-- <div class="start_cont">
                    <p class="start_view_overlay">No Note Found</p>
                </div> -->

                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>



                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


            </div>

        </div>


        <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">Prescription</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


                <!-- <div class="note_card">
                    <div class="card_head">
                        <p class="title">Note Title</p>
                        <p class="date">${date_formatter(new Date())}</p> -->

            </div>

        </div>

        <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">General Examination</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div>

        </div>


        <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">Preminary Diagnisis</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div>

        </div>
        <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">Prescription</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


                <!-- <div class="note_card">
                    <div class="card_head">
                        <p class="title">Note Title</p>
                        <p class="date">${date_formatter(new Date())}</p> -->

            </div>

        </div>

        <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">General Examination</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div>

        </div>


        <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">Preminary Diagnisis</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div>

        </div>


        <!-- <div class="more_visit_detail_card">
            <div class="head_part">
                <h4 class="heading">Patient Note</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div>

        </div> -->

        <div class="add_card_btn">
            <div class="add_card_btn_in">
                <span class='switch_icon_add'></span>
            </div>
        </div>

    </div>

</div>
`;
}

attach_listeners() {



}

async fetchData(id) {
try {
const response = await fetch('/api/patient/single_patient', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
patient_id: id,
})
});

if (!response.ok) {
throw new Error('Server Error');
}

const result = await response.json();

if (result.success) {
return result.data;
} else {
notify('top_left', result.message, 'warning');
return null;
}
} catch (error) {
notify('top_left', error.message, 'error');
return null;
}
}

}