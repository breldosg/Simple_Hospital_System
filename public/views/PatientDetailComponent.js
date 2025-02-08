import { date_formatter, notify } from "../script/index.js";


export class PatientDetailComponent {

    async PreRender(params) {

        // receive parameters
        this.rendered_card = [];
        this.visit_id = params.visit_id ?? null;
        this.patient_id = params.patient_id ?? null;
        this.container = params.container ?? null;

        if (this.container == null) {
            // throw new Error
            throw new Error('container is required');
        }

        // Render initial structure
        // this.container.prepend(this.ViewReturn());
        this.container.insertAdjacentHTML('afterbegin', this.ViewReturn());


        this.render();
    }

    async render() {
        const patient_data = await this.fetchData();

        console.log('p_data', patient_data);
        if (!patient_data) return;

        // Render top patient card
        this.top_card_view(patient_data);

    }

    ViewReturn() {
        return `
    <div class="top_card">
        <div class="Patient_imag">
            <img src="" alt="">
        </div>
        <div class="patient_detail">
            <div class="card name_card">
                <div class="dit_group">
                    <p class="name"></p>
                    <p class="description"> Patient id: <span></span></p>
                </div>
                <button type="button" data_src="" class="edit_btn">
                    <span class='switch_icon_edit'></span>
                </button>
            </div>
            <div class="card">
                ${['user', 'calendar_check', 'location_dot', 'phone', 'briefcase']
                .map(icon => `
                <div class="icon_card">
                    <span class='switch_icon_${icon}'></span>
                    <p></p>
                </div>
                `).join('')}
            </div>
        </div>
        <div class="loader_cont active">
            <div class="loader"></div>
        </div>
    </div>
        `;
    }

    top_card_view(data) {
        const body = this.container.querySelector('.top_card');
        body.innerHTML = `
    <div class="Patient_imag">
        <img src="${data ? data.Patient_img : ''}" alt="">
    </div>
    
    <div class="patient_detail">
        <div class="card name_card">
            <div class="dit_group">
                <p class="name">${data ? data.name : ''}</p>
                <p class="description"> Patient id: <span>${data ? data.id : ''}</span></p>
            </div>
            <button type="button" data_src="${data ? data.id : ''}" class="edit_btn">
                <span class='switch_icon_edit'></span>
            </button>
        </div>
    
        <div class="card">
            ${[
                { icon: 'user', value: data ? data.gender : '' },
                {
                    icon: 'calendar_check',
                    value: data ? `${date_formatter(data.dob)} (${data.age.amount} ${data.age.unit})` : ''
                },
                {
                    icon: 'location_dot',
                    value: data ? `${data.address} (${data.nationality})` : ''
                },
                {
                    icon: 'phone',
                    value: data ? `${data.phone} / ${data.alt_phone}` : ''
                },
                { icon: 'briefcase', value: data ? data.occupation : '' }
            ].map(item => `
            <div class="icon_card">
                <span class='switch_icon_${item.icon}'></span>
                <p>${item.value}</p>
            </div>
            `).join('')}
        </div>
    </div>
    `;
    }

    async fetchData() {
        try {
            console.log('fetching data');
            const response = await fetch('/api/patient/single_visit_detail_by_patient_id_or_visit_id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    patient_id: this.patient_id,
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

