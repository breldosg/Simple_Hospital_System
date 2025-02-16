import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, notify } from "../script/index.js";

export class VisitsLaboratoryResultPopUpView {
    constructor() {
        this.data = null;
        this.active_tab = '';
    }

    async PreRender(params = '') {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.data = params.data ? params.data : '';
        console.log(this.data);


        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(this.data);

        this.container = document.querySelector('.laboratory_result_popup');

        this.attachListeners();

        this.render_switching_tab(this.data);

    }


    ViewReturn() {
        return `
<div class="container laboratory_result_popup">
    <div class="cont_heading">
        <h4 class="heading">${this.data.lab_test_name} </h4>
        <div class="close_btn" id="confirm_cancel">
            <span class="switch_icon_close"></span>
        </div>

    </div>

    <div class="body">


    </div>

</div>
`;
    }

    render_switching_tab(data) {
        const cont = this.container.querySelector('.body');
        cont.innerHTML = '';

        var switcher_btns = [
            {
                title: 'Results',
                active: true
            },
            {
                title: 'Attachment',
                active: false
            }

        ];

        const switcher_cont = document.createElement('div');
        switcher_cont.className = 'switcher_cont';

        for (let i = 0; i < switcher_btns.length; i++) {
            const switcher_btn = document.createElement('div');
            switcher_btn.className = 'switcher_btn';

            if (switcher_btns[i].active) {
                switcher_btn.classList.add('active');
                this.active_tab = switcher_btn;
            }

            switcher_btn.innerHTML = `
            <p class="title">${switcher_btns[i].title}</p>
            `;



            switcher_btn.addEventListener('click', () => {
                this.active_tab.classList.remove('active');
                this.active_tab = switcher_btn;
                this.active_tab.classList.add('active');

                // scroll section with that id in view
                const section = this.container.querySelector('#' + switcher_btns[i].title.toLocaleLowerCase());
                section.scrollIntoView({ behavior: 'smooth' });

            });


            switcher_cont.appendChild(switcher_btn);

        }

        cont.prepend(switcher_cont);

        this.render_sections(data);


    }

    render_sections(data) {
        const cont = this.container.querySelector('.body');

        var sections = [
            {
                title: 'results',
                class: 'results',
                active: true
            },

            {
                title: 'attachment',
                class: 'file_list scroll_bar',
                active: false
            }
        ]

        const section_cont = document.createElement('div');
        section_cont.className = 'section_cont';

        for (let i = 0; i < sections.length; i++) {
            const section = document.createElement('div');
            section.className = 'section ' + sections[i].class;
            section.id = sections[i].title;

            section_cont.appendChild(section);
        }

        cont.appendChild(section_cont);
        this.render_results_section(data);
        this.render_file_list_section(data.report_attachment);

    }

    render_results_section(data) {
        const cont = this.container.querySelector('#results');
        cont.innerHTML = '';

        if (data.lab_test_items.length == 0) {
            cont.innerHTML = `<div class="example">
                <p>No results found</p>
            </div>`;
            return;
        }



        var results_items = data.lab_test_items;

        const report_info = document.createElement('div');
        report_info.className = 'report_info';

        const date = document.createElement('p');
        date.className = 'date';
        date.innerHTML = data.created_at;

        report_info.appendChild(date);

        const report_by = document.createElement('p');
        report_by.className = 'report_by';
        report_by.innerHTML = 'Served By: ' + data.created_by;

        report_info.appendChild(report_by);

        cont.appendChild(report_info);

        const report_content = document.createElement('div');
        report_content.className = 'report_content scroll_bar';

        results_items.forEach(item => {
            const report_item = document.createElement('div');
            report_item.className = 'content';
                report_item.innerHTML = `
                <div class="header">
                    <p class="title">${item.name}</p>
                    <p class="unit">${item.unit}</p>
                </div>
                <p>${item.result}</p>
            `;
            report_content.appendChild(report_item);
        });


        // for (let i = 0; i < results_items.length; i++) {
        //     const report_item = document.createElement('div');
        //     report_item.className = 'content';
        //     report_item.innerHTML = `
        //     <div class="header">
        //         <p class="title">${report_items[i]}</p>
        //     </div>
        //     <p>${data[report_items[i].toLowerCase()]}</p>
        //     `;
        //     report_content.appendChild(report_item);
        // }

        cont.appendChild(report_content);


    }

    render_file_list_section(data_array) {
        const cont = this.container.querySelector('#attachment');
        cont.innerHTML = '';

        data_array.forEach(data => {
            var file_card = document.createElement('div');
            file_card.className = 'file_card';

            var img_cont = document.createElement('div');
            img_cont.className = 'img_cont';

            var img = document.createElement('img');
            img.src = data.url;
            img.alt = data.file_name;


            img_cont.appendChild(img);

            var overlay = document.createElement('div');
            overlay.className = 'overlay';

            var open_with = document.createElement('span');
            open_with.className = 'switch_icon_open_with';

            overlay.appendChild(open_with);
            img_cont.appendChild(overlay);

            var words = document.createElement('div');
            words.className = 'words';

            var posted_by = document.createElement('p');
            posted_by.className = 'posted_by';
            posted_by.innerHTML = data.created_by;


            var submit_date = document.createElement('p');
            submit_date.className = 'submit_date';
            submit_date.innerHTML = data.created_at;

            file_card.addEventListener('click', () => {
                window.open(data.url, '_blank');
            });


            words.appendChild(posted_by);

            words.appendChild(submit_date);

            file_card.appendChild(img_cont);
            file_card.appendChild(words);

            cont.appendChild(file_card);
        });



        // <div class="file_card">
        //             <div class="img_cont">
        //                 <img src="/attachments/radiology_attach-67a7118396e7b0.19549613.png" alt="">
        //                 <div class="overlay">
        //                     <span class='switch_icon_open_with'></span>

        //                 </div>
        //             </div>

        //             <div class="words">
        //                 <p class="posted_by">Dr. John Doe</p>
        //                 <p class="submit_date">Feb 8, 2025, 11:10:43 AM</p>
        //             </div>
        //         </div>

    }


    attachListeners() {
        const cancel_btn = this.container.querySelector('#confirm_cancel');
        cancel_btn.addEventListener('click', () => {
            this.close();
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }


}
