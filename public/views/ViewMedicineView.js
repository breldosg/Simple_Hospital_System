import { screenCollection } from "../screens/ScreenCollection.js";

export class ViewMedicineView {
    constructor() {
        window.search_medicine = this.search_medicine.bind(this)
        this.medicineData = [];
        this.categoryData = [];
        this.batchNumber = 1; // Keep track of current batch
        this.total_page_num = 1; // Keep track of current batch
        this.total_data_num = 0; // Keep track of current batch
        this.show_count_num = 0; // Keep track of current batch
        this.searchTerm = '';  // Store the current search term
        this.category_value = '';
        this.category_elements = '';
    }

    async PreRender() {

        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        // Fetch the initial batch of medicine data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Search input event listener
        // const searchInput = document.querySelector('.search_cont input');
        // searchInput.addEventListener('keydown', async (event) => {
        //     if (event.key === 'Enter') {
        //         this.searchTerm = searchInput.value;
        //         this.batchNumber = 1; // Reset to batch 1 when searching
        //         await this.fetchAndRenderData();
        //     }
        // });

        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                await this.fetchAndRenderData();
            }
            // this.batchNumber += 1;
            // await this.fetchAndRenderData();
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (this.batchNumber > 1) {
                this.batchNumber -= 1;
                await this.fetchAndRenderData();
            }
        });
    }

    // row_listener() {
    //     // listeners for each row
    //     const rows = document.querySelectorAll('.table_body .tr');
    //     rows.forEach((row) => {
    //         row.addEventListener('click', async () => {
    //             const medicineId = row.getAttribute('data_src');
    //             frontRouter.navigate('/medicine/viewmedicine/' + medicineId);
    //         })
    //     });

    //     const createVisit_btn = document.querySelectorAll('#createVisit_btn');

    //     createVisit_btn.forEach(btn => {
    //         btn.addEventListener('click', async (event) => {
    //             // disable propagation
    //             event.stopPropagation();

    //             // get the btn closest with class tr
    //             const btnParent = btn.closest('.tr');
    //             const medicineId = btnParent.getAttribute('data_src');
    //             const medicineName = btnParent.getAttribute('title');

    //             dashboardController.createVisitPopUpView.PreRender(
    //                 {
    //                     id: medicineId,
    //                     p_name: medicineName,
    //                 })

    //         })
    //     });

    //     const checkOut_btn = document.querySelectorAll('#checkOut_btn');

    //     checkOut_btn.forEach(btn => {
    //         btn.addEventListener('click', async (event) => {
    //             // disable propagation
    //             event.stopPropagation();
    //             // Get the btn closest with class tr
    //             const btnParent = btn.closest('.tr');
    //             const medicineId = btnParent.getAttribute('data_src');

    //             const container = document.querySelector('.update_cont')
    //             container.insertAdjacentHTML('beforeend', dashboardController.loaderView.ViewReturn());

    //             const checkOut_response = await this.checkout_request(medicineId);

    //             if (checkOut_response.success) {
    //                 notify('top_left', checkOut_response.message, 'success');
    //                 await this.fetchAndRenderData();
    //                 const loader_cont = document.querySelector('.loader_cont.overlay')

    //                 // Check if loader element exists before removing
    //                 if (loader_cont) {
    //                     loader_cont.remove();  // Directly remove the loader
    //                 }

    //             } else {
    //                 notify('top_left', checkOut_response.message, 'error');
    //             }


    //         })
    //     });


    // }

    async fetchAndRenderData() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn(); // Show loader
        const medicineData = await this.fetchData(); // Fetch data with search term and batch number
        const categoryData = await this.fetchCategory(); // Fetch data with search term and batch number

        this.medicineData = medicineData || [];
        this.categoryData = categoryData || [];
        this.render();
        this.attachEventListeners();
    }

    render() {

        if (this.categoryData == '') {
            // Create roles elements
            const roles = (category_raw) => {
                var rolesElem = "";
                category_raw.forEach(data => {
                    rolesElem += `
                                <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                            `;
                });
                return rolesElem;
            };
            this.category_elements = roles(this.categoryData)
        }

        console.log(this.category_elements);
        console.log(this.categoryData);


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        if (this.medicineData.medicineList && this.medicineData.medicineList.length > 0) {
            this.populateTable(this.medicineData);
        } else {
            const show_count = document.querySelector('.show_count');
            const total_data = document.querySelector('.total_data');
            const total_page = document.querySelector('.total_page');
            show_count.innerText = 0;
            total_data.innerText = 0;
            total_page.innerText = 1;
            this.total_page_num = 1;
            this.show_count_num = 0;
            this.total_data_num = 0;
            document.querySelector('.start_page').style.display = 'flex'; // No data message
        }
        document.querySelector('.loader_cont').classList.remove('active');
    }

    populateTable(medicineData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');

        show_count.innerText = medicineData.showData;
        total_data.innerText = medicineData.total;
        total_page.innerText = medicineData.pages;
        this.total_page_num = medicineData.pages;
        this.show_count_num = medicineData.showData;
        this.total_data_num = medicineData.total;

        var deactivate_btn = '<button type="button" id="deactivate_btn" class="main_btn error">Deactivate</button>';
        var activate_btn = '<button type="button" id="activate_btn" class="main_btn">Activate</button>';

        medicineData.medicineList.forEach((medicine, index) => {
            const row = `
                <div class="tr d_flex flex__c_a" data_src="${medicine.id}" title="${medicine.name}">
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${medicine.name}</p>
                    <p class="name">${medicine.category}</p>
                    <p class="remain">0</p>
                    <p class="status">${medicine.status}</p>
                    <div class="action d_flex flex__c_c">
                        ${medicine.status === 'active' ? deactivate_btn : activate_btn}
                    </div>
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // this.row_listener();
    }

    async fetchData() {
        try {
            const response = await fetch('/api/medicine/medicine_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,  // Send search term
                    batch: this.batchNumber // Send current batch number
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async fetchCategory() {
        try {
            const response = await fetch('/api/medicine/get_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,  // Send search term
                    batch: this.batchNumber // Send current batch number
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async search_medicine(data) {
        this.searchTerm = data.query;
        this.category_value = data.category;
        this.batchNumber = 1; // Reset to batch 1 when searching
        await this.fetchAndRenderData();
    }

    date_formatter(ymd) {
        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }

    ViewReturn() {
        return `
    <div class="medicine_cont">
    
    <br-form callback="search_medicine" class="medicine_top">
    
        <h4>Search Medicine</h4>
    
        <div class="medicine_content">
            <br-input label="Medicine Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter medicine name" styles="
                        border-radius: var(--input_main_border_r);
                        width: 400px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;"></br-input>

            
            <br-select search name="category" fontSize="13px" label="Category" value="${this.category_value}" placeholder="Select Category" styles="
                                border-radius: var(--input_main_border_r);
                                width: 400px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;">

                                ${this.category_elements}

                </br-select>
    
            <div class="med_btn_cont">
                <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
            </div> 

        </div>
    
    </br-form>
    
    <div class="main_section medicine_table_out">
    
        <div class="in_table_top d_flex flex__u_s">
            <h4>Medicine List</h4>
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Category</p>
                <p class="remain">Remain Quantity</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body d_flex flex__co">
                <div class="start_page deactivate">
                    <p>There Is No Any Patient Registered</p>
                </div>
                <div class="loader_cont active"><div class="loader"></div></div>
            </div>
    
            <div class="table_footer d_flex flex__e_b">
                <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span class="total_data">${this.total_data_num}</span></p>
                <div class="pagenation d_flex flex__c_c">
                    <button type="button" class="main_btn prev">Prev</button>
                    <p class="page_no d_flex flex__c_c">${this.batchNumber}/<span class="total_page" >${this.total_page_num}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>
    
        </div>
    
    </div>
    
    </div>
    `;
    }

}


