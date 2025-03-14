export class BrCustomDateRangePicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.startDate = null;
        this.endDate = null;
        this.currentMonth = new Date();
        this.isSelecting = false;
        this.currentView = 'date'; // 'date', 'month', or 'year'
        this.selectedYear = new Date().getFullYear();
        this.yearRange = 12; // Number of years to show in year view
        this.selectionMode = 'range'; // default to range selection

        // Define theme colors
        this.themes = {
            light: {
                primary: '#4a90e2',
                background: '#ffffff',
                text: '#333333',
                border: '#e0e0e0',
                hover: 'rgba(74, 144, 226, 0.1)',
                range: 'rgba(74, 144, 226, 0.2)',
                shadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            },
            dark: {
                primary: '#5c9cf5',
                background: '#2c2c2c',
                text: '#ffffff',
                border: '#404040',
                hover: 'rgba(92, 156, 245, 0.2)',
                range: 'rgba(92, 156, 245, 0.3)',
                shadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
            },
            strawberry: {
                primary: '#ff4d6d',
                background: '#ffffff',
                text: '#2c2c2c',
                border: '#ffccd5',
                hover: 'rgba(255, 77, 109, 0.1)',
                range: 'rgba(255, 77, 109, 0.2)',
                shadow: '0 4px 20px rgba(255, 77, 109, 0.15)'
            },
            green: {
                primary: '#2ecc71',
                background: '#ffffff',
                text: '#2c2c2c',
                border: '#e8f5e9',
                hover: 'rgba(46, 204, 113, 0.1)',
                range: 'rgba(46, 204, 113, 0.2)',
                shadow: '0 4px 20px rgba(46, 204, 113, 0.15)'
            },
            violet: {
                primary: '#9c27b0',
                background: '#ffffff',
                text: '#2c2c2c',
                border: '#f3e5f5',
                hover: 'rgba(156, 39, 176, 0.1)',
                range: 'rgba(156, 39, 176, 0.2)',
                shadow: '0 4px 20px rgba(156, 39, 176, 0.15)'
            },
            seaBlue: {
                primary: '#00acc1',
                background: '#ffffff',
                text: '#2c2c2c',
                border: '#e0f7fa',
                hover: 'rgba(0, 172, 193, 0.1)',
                range: 'rgba(0, 172, 193, 0.2)',
                shadow: '0 4px 20px rgba(0, 172, 193, 0.15)'
            },
            blue: {
                primary: '#2196f3',
                background: '#ffffff',
                text: '#2c2c2c',
                border: '#e3f2fd',
                hover: 'rgba(33, 150, 243, 0.1)',
                range: 'rgba(33, 150, 243, 0.2)',
                shadow: '0 4px 20px rgba(33, 150, 243, 0.15)'
            }
        };

        this.positions = {
            bottom: 'bottom',
            top: 'top',
            left: 'left',
            right: 'right'
        };

        // Add new properties
        this.minDate = null;
        this.maxDate = null;
        this.dateFormat = null;
        this.customFormatter = null;
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Default callbacks
        this.callbacks = {
            onSelect: null,
            onChange: null,
            onOpen: null,
            onClose: null,
            onError: null
        };
    }

    static get observedAttributes() {
        return ['theme', 'min-date', 'max-date', 'mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'min-date':
                this.minDate = newValue ? new Date(newValue) : null;
                if (this.isConnected) {
                    this.updateCalendar();
                }
                break;
            case 'max-date':
                this.maxDate = newValue ? new Date(newValue) : null;
                if (this.isConnected) {
                    this.updateCalendar();
                }
                break;
            case 'theme':
                if (this.isConnected) {
                    this.updateTheme(newValue);
                }
                break;
            case 'mode':
                this.selectionMode = newValue;
                if (this.isConnected) {
                    this.updateCalendar();
                }
                break;
        }
    }

    updateTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.light;
        const root = this.shadowRoot.host;

        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--background-color', theme.background);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--border-color', theme.border);
        root.style.setProperty('--hover-color', theme.hover);
        root.style.setProperty('--range-color', theme.range);
        root.style.setProperty('--shadow', theme.shadow);
    }

    connectedCallback() {
        // Check for selection mode attribute
        if (this.hasAttribute('mode')) {
            this.selectionMode = this.getAttribute('mode');
        }

        // Check for placeholder text
        const placeholder = this.getAttribute('placeholder') ||
            (this.selectionMode === 'single' ? 'Select date' : 'Select date range');

        // First render the component
        this.render(placeholder);

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            this.setupEventListeners();
            this.updateTheme(this.getCurrentTheme());
        });
    }

    render(placeholder) {
        const styles = `
            *{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            :host {
                --primary-color: #4a90e2;
                --background-color: #ffffff;
                --text-color: #333333;
                --border-color: #e0e0e0;
                --hover-color: rgba(74, 144, 226, 0.1);
                --range-color: rgba(74, 144, 226, 0.2);
                --shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                --disabled-color: #373737
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .date-range-container {
                position: relative;
                width: 100%;
            }

            .date-input {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                font-size: 14px;
                outline: none;
                transition: all 0.2s;
                background: var(--background-color);
                color: var(--text-color);
            }

            .calendar {
                display: none;
                position: fixed;
                background: var(--background-color);
                border-radius: 12px;
                box-shadow: var(--shadow);
                padding: 16px;
                z-index: 1000;
                min-width: 280px;
                animation: fadeIn 0.2s ease-out;
            }

            .calendar[data-position*="top"] {
                animation: fadeInTop 0.2s ease-out;
            }

            .calendar[data-position*="bottom"] {
                animation: fadeInBottom 0.2s ease-out;
            }

            @keyframes fadeInTop {
                from { 
                    opacity: 0;
                    transform: translateY(10px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fadeInBottom {
                from { 
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .calendar.active {
                display: block;
            }

            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 0 8px;
            }

            .current-month-year {
                font-weight: 500;
                font-size: 16px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                color: var(--text-color);
            }

            .current-month-year:hover {
                background-color: var(--hover-color);
            }

            .nav-button {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: var(--text-color);
                font-size: 18px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
            }

            .nav-button:hover {
                background-color: var(--hover-color);
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                margin-bottom: 8px;
            }

            .weekday {
                font-size: 12px;
                padding: 8px 0;
                text-align: center;
                font-weight: 500;
                color: var(--text-color);
            }

            .date {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 4px;
                font-size: 14px;
                transition: all 0.2s;
                border: 2px solid transparent;
                user-select: none;
                color: var(--text-color);
            }

            .date:hover:not(.empty) {
                background-color: var(--hover-color);
                color: var(--text-color);
            }
            .date.selected:hover:not(.empty) {
                background-color: var(--primary-color);
                color: white;
            }

            .date.selected {
                background-color: var(--primary-color);
                color: white;
                font-weight: 500;
            }

            .date.in-range {
                background-color: var(--range-color);
            }

            .date.today {
                border-color: var(--primary-color);
                font-weight: 500;
            }

            .date.empty {
                cursor: default;
            }

            .date.disabled {
                color: var(--disabled-color);
                cursor: not-allowed;
                opacity: 0.5;
                pointer-events: none;
            }

            .date.disabled:hover {
                background-color: transparent;
            }

            .calendar-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--border-color);
            }

            .today-btn {
                background: none;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                padding: 8px 12px;
                font-size: 14px;
                border-radius: 4px;
                font-weight: 500;
            }

            .today-btn:hover {
                background-color: var(--hover-color);
            }

            .select-btn {
                background-color: var(--primary-color);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .select-btn:hover:not(:disabled) {
                filter: brightness(1.1);
            }

            .select-btn:disabled {
                background-color: var(--disabled-color);
                cursor: not-allowed;
            }

            /* Month and Year grid styles */
            .month-grid, .year-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                padding: 8px;
            }

            .month-cell, .year-cell {
                padding: 12px 8px;
                text-align: center;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 14px;
                color: var(--text-color);
            }

            .month-cell:hover, .year-cell:hover {
                background-color: var(--hover-color);
            }

            .month-cell.selected, .year-cell.selected {
                background-color: var(--primary-color);
                color: white;
            }

            /* Mobile optimizations */
            @media (hover: none) and (pointer: coarse) {
                .date, .month-cell, .year-cell {
                    min-height: 44px;
                    min-width: 44px;
                }

                .nav-button {
                    min-width: 44px;
                    min-height: 44px;
                }

                .calendar {
                    position: fixed;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%);
                    margin: 0;
                    width: 90%;
                    max-width: 360px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
            }

            /* Animations */
            @keyframes fadeIn {
                from { 
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .calendar.active {
                animation: fadeIn 0.2s ease-out;
            }
        `;

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="date-range-container">
                <input 
                    type="text" 
                    class="date-input" 
                    readonly 
                    placeholder="${placeholder}"
                    aria-label="${this.selectionMode === 'single' ? 'Date selector' : 'Date range selector'}"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    role="combobox"
                >
                <div 
                    class="calendar" 
                    role="dialog"
                    aria-label="Calendar"
                    aria-modal="true"
                >
                    <div class="calendar-header" role="navigation">
                        <button 
                            class="nav-button prev-month" 
                            aria-label="Previous month"
                        >←</button>
                        <span 
                            class="current-month-year" 
                            role="heading" 
                            aria-live="polite"
                        ></span>
                        <button 
                            class="nav-button next-month" 
                            aria-label="Next month"
                        >→</button>
                    </div>
                    <div 
                        class="calendar-grid" 
                        role="grid" 
                        aria-label="Calendar dates"
                    >
                        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                .map(day => `
                                <div class="weekday" role="columnheader" aria-label="${day}">
                                    ${day}
                                </div>
                            `).join('')}
                    </div>
                    <div 
                        class="month-grid" 
                        role="grid" 
                        aria-label="Month selector"
                        style="display: none;"
                    ></div>
                    <div 
                        class="year-grid" 
                        role="grid" 
                        aria-label="Year selector"
                        style="display: none;"
                    ></div>
                    <div class="calendar-footer">
                        <button 
                            class="today-btn"
                            aria-label="Go to today"
                        >Today</button>
                        ${this.selectionMode === 'range' ? `
                            <button 
                                class="select-btn" 
                                disabled
                                aria-label="Confirm date selection"
                            >Select</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const input = this.shadowRoot.querySelector('.date-input');
        const calendar = this.shadowRoot.querySelector('.calendar');
        const prevButton = this.shadowRoot.querySelector('.prev-month');
        const nextButton = this.shadowRoot.querySelector('.next-month');
        const todayBtn = this.shadowRoot.querySelector('.today-btn');
        const selectBtn = this.shadowRoot.querySelector('.select-btn');

        input.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCalendar();
        });

        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateMonth(-1);
        });

        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateMonth(1);
        });

        todayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const today = new Date();
            if (!this.startDate) {
                this.handleDateClick(today);
            } else {
                this.startDate = today;
                this.endDate = null;
                this.updateInput();
                this.updateCalendar();
            }
            this.currentMonth = new Date(today);
            this.updateCalendar();
        });

        if (selectBtn) {
            selectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.startDate && this.endDate) {
                    this.hideCalendar();
                    this.dispatchEvent(new CustomEvent('datechange', {
                        detail: {
                            startDate: this.startDate,
                            endDate: this.endDate
                        }
                    }));
                }
            });
        }

        calendar.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        const monthYearLabel = this.shadowRoot.querySelector('.current-month-year');
        monthYearLabel.addEventListener('click', () => {
            if (this.currentView === 'date') {
                this.currentView = 'month';
            } else if (this.currentView === 'month') {
                this.currentView = 'year';
            } else {
                this.currentView = 'date';
            }
            this.updateCalendarView();
        });

        this.updateCalendarView();

        // Add keyboard navigation
        this.shadowRoot.addEventListener('keydown', (e) => {
            const calendar = this.shadowRoot.querySelector('.calendar');
            if (!calendar.classList.contains('active')) return;

            const currentView = this.currentView;
            const focusedElement = this.shadowRoot.activeElement;

            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (focusedElement && focusedElement.classList.contains('date')) {
                        focusedElement.click();
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    this.hideCalendar();
                    break;

                case 'Tab':
                    if (!e.shiftKey && focusedElement.classList.contains('last-focusable')) {
                        e.preventDefault();
                        this.shadowRoot.querySelector('.first-focusable').focus();
                    }
                    break;

                case 'ArrowRight':
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowDown':
                    e.preventDefault();
                    this.handleArrowNavigation(e.key, currentView);
                    break;
            }
        });

        // Touch events
        calendar.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        calendar.addEventListener('touchmove', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const xDiff = this.touchStartX - e.touches[0].clientX;
            const yDiff = this.touchStartY - e.touches[0].clientY;

            // If horizontal swipe is greater than vertical, prevent scrolling
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                e.preventDefault();
            }
        });

        calendar.addEventListener('touchend', (e) => {
            const xDiff = this.touchStartX - e.changedTouches[0].clientX;
            const yDiff = this.touchStartY - e.changedTouches[0].clientY;

            // Minimum swipe distance
            const minSwipeDistance = 50;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (Math.abs(xDiff) > minSwipeDistance) {
                    if (xDiff > 0) {
                        this.navigateMonth(1); // Swipe left
                    } else {
                        this.navigateMonth(-1); // Swipe right
                    }
                }
            }

            this.touchStartX = null;
            this.touchStartY = null;
        }, { passive: true });
    }

    toggleCalendar() {
        const calendar = this.shadowRoot.querySelector('.calendar');
        const isActive = calendar.classList.contains('active');

        if (!isActive) {
            calendar.classList.add('active');
            this.updateCalendar();

            // Use requestAnimationFrame to ensure calendar is rendered
            requestAnimationFrame(() => {
                this.updateCalendarPosition();
                this.setupPositionListeners();
            });
        } else {
            calendar.classList.remove('active');
            this.removePositionListeners();
        }
    }

    hideCalendar() {
        const calendar = this.shadowRoot.querySelector('.calendar');
        calendar.classList.remove('active');
    }

    navigateMonth(delta) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
        this.updateCalendar();
    }

    updateCalendar() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const currentMonthLabel = this.shadowRoot.querySelector('.current-month-year');
        const calendarGrid = this.shadowRoot.querySelector('.calendar-grid');

        // Check if elements exist before proceeding
        if (!currentMonthLabel || !calendarGrid) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        currentMonthLabel.textContent = `${monthNames[month]} ${year}`;

        // Clear existing dates but keep weekday headers
        const weekdayElements = Array.from(calendarGrid.querySelectorAll('.weekday'));
        calendarGrid.innerHTML = '';
        weekdayElements.forEach(el => calendarGrid.appendChild(el));

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Add days of month
        for (let day = 1; day <= totalDays; day++) {
            const dateCell = document.createElement('div');
            const currentDate = new Date(year, month, day);
            currentDate.setHours(0, 0, 0, 0);

            // Set the date number
            dateCell.textContent = day;
            dateCell.className = 'date';

            // Check if date should be disabled
            const isDisabled = !this.isDateValid(currentDate);
            if (isDisabled) {
                dateCell.classList.add('disabled');
            }

            // Add other classes
            if (this.isToday(currentDate)) {
                dateCell.classList.add('today');
            }

            if (this.isDateSelected(currentDate)) {
                dateCell.classList.add('selected');
            }

            if (this.isDateInRange(currentDate)) {
                dateCell.classList.add('in-range');
            }

            // Add click handler only if date is not disabled
            if (!isDisabled) {
                dateCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDateClick(currentDate);
                });
            }

            calendarGrid.appendChild(dateCell);
        }
    }

    handleDateClick(date) {
        if (!this.isDateValid(date)) {
            // Trigger error callback if set
            this.callbacks?.onError?.({
                type: 'invalid_date',
                date: date,
                minDate: this.minDate,
                maxDate: this.maxDate
            });
            return;
        }

        if (this.selectionMode === 'single') {
            this.startDate = date;
            this.endDate = null;
            this.hideCalendar();
        } else {
            if (!this.startDate || (this.startDate && this.endDate) || date < this.startDate) {
                this.startDate = date;
                this.endDate = null;
            } else {
                // Validate the entire range
                if (this.isValidDateRange(this.startDate, date)) {
                    this.endDate = date;
                    this.hideCalendar();
                } else {
                    this.callbacks?.onError?.({
                        type: 'invalid_range',
                        startDate: this.startDate,
                        endDate: date,
                        minDate: this.minDate,
                        maxDate: this.maxDate
                    });
                    return;
                }
            }
        }

        this.updateInput();
        this.updateCalendar();
    }

    isDateInRange(date) {
        if (this.selectionMode === 'single' || !this.startDate || !this.endDate) {
            return false;
        }

        return date > this.startDate && date < this.endDate;
    }

    isDateSelected(date) {
        if (this.selectionMode === 'single') {
            return this.startDate &&
                date.getTime() === this.startDate.getTime();
        }

        return (this.startDate && date.getTime() === this.startDate.getTime()) ||
            (this.endDate && date.getTime() === this.endDate.getTime());
    }

    formatDate(date) {
        if (!date) return '';

        // Use custom formatter if provided
        if (this.customFormatter) {
            return this.customFormatter(date);
        }

        // Use specified format string
        if (this.dateFormat) {
            return this.formatDateWithPattern(date, this.dateFormat);
        }

        // Use locale formatting
        const locale = this.getAttribute('locale') || 'en-US';
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };

        return date.toLocaleDateString(locale, options);
    }

    formatDateWithPattern(date, pattern) {
        const map = {
            'yyyy': date.getFullYear(),
            'MM': String(date.getMonth() + 1).padStart(2, '0'),
            'M': date.getMonth() + 1,
            'dd': String(date.getDate()).padStart(2, '0'),
            'd': date.getDate(),
            'MMMM': date.toLocaleString('default', { month: 'long' }),
            'MMM': date.toLocaleString('default', { month: 'short' }),
            'EEE': date.toLocaleString('default', { weekday: 'short' }),
            'EEEE': date.toLocaleString('default', { weekday: 'long' })
        };

        return pattern.replace(/yyyy|MM?M?M?|dd?|EEE?E?/g, matched => map[matched]);
    }

    updateInput() {
        const input = this.shadowRoot.querySelector('.date-input');

        if (this.selectionMode === 'single') {
            input.value = this.startDate ? this.formatDate(this.startDate) : '';
        } else {
            if (this.startDate && this.endDate) {
                input.value = `${this.formatDate(this.startDate)} to ${this.formatDate(this.endDate)}`;
            } else if (this.startDate) {
                input.value = this.formatDate(this.startDate);
            } else {
                input.value = '';
            }
        }
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    renderMonthView() {
        const monthGrid = this.shadowRoot.querySelector('.month-grid');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        monthGrid.innerHTML = '';
        months.forEach((month, index) => {
            const monthCell = document.createElement('div');
            monthCell.className = 'month-cell';

            // Check if this month is in the selected range
            const currentMonthDate = new Date(this.selectedYear, index, 1);
            if (this.startDate && this.endDate) {
                const startMonth = this.startDate.getMonth();
                const endMonth = this.endDate.getMonth();
                const startYear = this.startDate.getFullYear();
                const endYear = this.endDate.getFullYear();

                if (this.selectedYear === startYear && index === startMonth ||
                    this.selectedYear === endYear && index === endMonth) {
                    monthCell.classList.add('selected');
                } else if (this.isDateInRange(currentMonthDate)) {
                    monthCell.classList.add('in-range');
                }
            }

            monthCell.textContent = month;
            monthCell.addEventListener('click', () => {
                this.currentMonth.setMonth(index);
                this.currentView = 'date';
                this.updateCalendarView();
            });
            monthGrid.appendChild(monthCell);
        });
    }

    renderYearView() {
        const yearGrid = this.shadowRoot.querySelector('.year-grid');
        const currentYear = this.selectedYear;
        const startYear = currentYear - (this.yearRange / 2);

        yearGrid.innerHTML = '';
        for (let i = 0; i < this.yearRange; i++) {
            const year = startYear + i;
            const yearCell = document.createElement('div');
            yearCell.className = 'year-cell';

            // Check if this year is in the selected range
            if (this.startDate && this.endDate) {
                const startYear = this.startDate.getFullYear();
                const endYear = this.endDate.getFullYear();

                if (year === startYear || year === endYear) {
                    yearCell.classList.add('selected');
                } else if (year > startYear && year < endYear) {
                    yearCell.classList.add('in-range');
                }
            }

            yearCell.textContent = year;
            yearCell.addEventListener('click', () => {
                this.selectedYear = year;
                this.currentMonth.setFullYear(year);
                this.currentView = 'month';
                this.updateCalendarView();
            });
            yearGrid.appendChild(yearCell);
        }
    }

    updateCalendarView() {
        const dateGrid = this.shadowRoot.querySelector('.calendar-grid');
        const monthGrid = this.shadowRoot.querySelector('.month-grid');
        const yearGrid = this.shadowRoot.querySelector('.year-grid');
        const header = this.shadowRoot.querySelector('.current-month-year');
        const prevBtn = this.shadowRoot.querySelector('.prev-month');
        const nextBtn = this.shadowRoot.querySelector('.next-month');
        const selectBtn = this.shadowRoot.querySelector('.select-btn');

        // Maintain select button state only if it exists
        if (selectBtn && this.selectionMode === 'range') {
            selectBtn.disabled = !(this.startDate && this.endDate);
        }

        // Hide all views first
        dateGrid.style.display = 'none';
        monthGrid.style.display = 'none';
        yearGrid.style.display = 'none';

        switch (this.currentView) {
            case 'date':
                dateGrid.style.display = 'grid';
                this.updateCalendar();
                break;
            case 'month':
                monthGrid.style.display = 'grid';
                header.textContent = this.selectedYear;
                this.renderMonthView();
                break;
            case 'year':
                yearGrid.style.display = 'grid';
                header.textContent = `${this.selectedYear - this.yearRange / 2} - ${this.selectedYear + this.yearRange / 2 - 1}`;
                this.renderYearView();
                break;
        }

        // Update navigation button behavior
        prevBtn.onclick = () => {
            if (this.currentView === 'date') this.navigateMonth(-1);
            else if (this.currentView === 'year') this.selectedYear -= this.yearRange;
            this.updateCalendarView();
        };

        nextBtn.onclick = () => {
            if (this.currentView === 'date') this.navigateMonth(1);
            else if (this.currentView === 'year') this.selectedYear += this.yearRange;
            this.updateCalendarView();
        };
    }

    getCurrentTheme() {
        return this.getAttribute('theme') || 'light';
    }

    calculatePosition(calendar) {
        const input = this.shadowRoot.querySelector('.date-input');
        const inputRect = input.getBoundingClientRect();
        const calendarRect = calendar.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate available space in each direction
        const spaceAbove = inputRect.top;
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceLeft = inputRect.left;
        const spaceRight = viewportWidth - inputRect.right;

        // Default position
        let position = 'bottom-left';

        // Determine vertical position
        if (spaceBelow < calendarRect.height && spaceAbove > spaceBelow) {
            position = position.replace('bottom', 'top');
        }

        // Determine horizontal position
        if (spaceRight < calendarRect.width && spaceLeft > spaceRight) {
            position = position.replace('left', 'right');
        }

        return position;
    }

    updateCalendarPosition() {
        const calendar = this.shadowRoot.querySelector('.calendar');
        if (!calendar || !calendar.classList.contains('active')) return;

        const position = this.calculatePosition(calendar);
        calendar.setAttribute('data-position', position);

        // Reset any previous positioning
        calendar.style.top = '';
        calendar.style.bottom = '';
        calendar.style.left = '';
        calendar.style.right = '';

        // Apply new positioning
        const input = this.shadowRoot.querySelector('.date-input');
        const inputRect = input.getBoundingClientRect();
        const calendarRect = calendar.getBoundingClientRect();

        if (position.includes('top')) {
            calendar.style.bottom = `${window.innerHeight - inputRect.top}px`;
        } else {
            calendar.style.top = `${inputRect.bottom}px`;
        }

        if (position.includes('right')) {
            calendar.style.right = `${window.innerWidth - inputRect.right}px`;
        } else {
            calendar.style.left = `${inputRect.left}px`;
        }

        // Adjust for viewport edges
        const finalRect = calendar.getBoundingClientRect();
        if (finalRect.right > window.innerWidth) {
            calendar.style.left = 'auto';
            calendar.style.right = '0';
        }
        if (finalRect.left < 0) {
            calendar.style.left = '0';
            calendar.style.right = 'auto';
        }
    }

    setupPositionListeners() {
        this.positionListener = () => {
            requestAnimationFrame(() => {
                this.updateCalendarPosition();
            });
        };

        window.addEventListener('resize', this.positionListener);
        window.addEventListener('scroll', this.positionListener, true);
    }

    removePositionListeners() {
        if (this.positionListener) {
            window.removeEventListener('resize', this.positionListener);
            window.removeEventListener('scroll', this.positionListener, true);
        }
    }

    disconnectedCallback() {
        this.removePositionListeners();
    }

    // Add method for handling arrow key navigation
    handleArrowNavigation(key, view) {
        const grid = this.shadowRoot.querySelector(
            view === 'date' ? '.calendar-grid' :
                view === 'month' ? '.month-grid' : '.year-grid'
        );

        const cells = Array.from(grid.querySelectorAll('[role="gridcell"]'));
        const focusedCell = this.shadowRoot.activeElement;
        const currentIndex = cells.indexOf(focusedCell);

        if (currentIndex === -1) {
            cells[0]?.focus();
            return;
        }

        let newIndex;
        const columns = view === 'date' ? 7 : 3;

        switch (key) {
            case 'ArrowRight':
                newIndex = currentIndex + 1;
                break;
            case 'ArrowLeft':
                newIndex = currentIndex - 1;
                break;
            case 'ArrowUp':
                newIndex = currentIndex - columns;
                break;
            case 'ArrowDown':
                newIndex = currentIndex + columns;
                break;
        }

        if (newIndex >= 0 && newIndex < cells.length) {
            cells[newIndex].focus();
        }
    }

    // Add method to announce changes to screen readers
    announceToScreenReader(message) {
        const announcer = this.shadowRoot.querySelector('.sr-announcer') ||
            (() => {
                const div = document.createElement('div');
                div.className = 'sr-announcer';
                div.setAttribute('aria-live', 'polite');
                div.setAttribute('aria-atomic', 'true');
                div.style.position = 'absolute';
                div.style.width = '1px';
                div.style.height = '1px';
                div.style.padding = '0';
                div.style.margin = '-1px';
                div.style.overflow = 'hidden';
                div.style.clip = 'rect(0, 0, 0, 0)';
                div.style.border = '0';
                this.shadowRoot.appendChild(div);
                return div;
            })();

        announcer.textContent = message;
    }

    // Add method to set date restrictions
    setDateRestrictions(minDate, maxDate) {
        // Convert string dates to Date objects if necessary
        this.minDate = minDate ? new Date(minDate) : null;
        this.maxDate = maxDate ? new Date(maxDate) : null;

        // Reset time portion to start of day
        if (this.minDate) {
            this.minDate.setHours(0, 0, 0, 0);
        }
        if (this.maxDate) {
            this.maxDate.setHours(0, 0, 0, 0);
        }

        // Update calendar if it's already rendered
        this.updateCalendar();
    }

    // Add method to set custom date formatter
    setDateFormatter(formatter) {
        if (typeof formatter === 'function') {
            this.customFormatter = formatter;
        } else if (typeof formatter === 'string') {
            this.dateFormat = formatter;
        }
        this.updateInput();
    }

    // Add method to set callbacks
    setCallbacks(callbacks) {
        Object.keys(callbacks).forEach(key => {
            if (typeof callbacks[key] === 'function') {
                this.callbacks[key] = callbacks[key];
            }
        });
    }

    // Enhanced keyboard navigation
    setupKeyboardNavigation() {
        const handleKeyDown = (e) => {
            const focused = this.shadowRoot.activeElement;

            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (focused?.classList.contains('date')) {
                        this.handleDateClick(this.getDateFromCell(focused));
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    this.hideCalendar();
                    break;

                case 'PageUp':
                    e.preventDefault();
                    this.navigateMonth(e.shiftKey ? -12 : -1);
                    break;

                case 'PageDown':
                    e.preventDefault();
                    this.navigateMonth(e.shiftKey ? 12 : 1);
                    break;

                case 'Home':
                    e.preventDefault();
                    if (focused?.classList.contains('date')) {
                        this.focusFirstDayOfMonth();
                    }
                    break;

                case 'End':
                    e.preventDefault();
                    if (focused?.classList.contains('date')) {
                        this.focusLastDayOfMonth();
                    }
                    break;

                // ... existing arrow key handling ...
            }
        };

        this.shadowRoot.addEventListener('keydown', handleKeyDown);
    }

    // Add validation method
    isDateValid(date) {
        if (!date) return false;

        // Reset time portion for comparison
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        if (this.minDate && compareDate < this.minDate) {
            console.log('Date before minimum date');
            return false;
        }

        if (this.maxDate && compareDate > this.maxDate) {
            console.log('Date after maximum date');
            return false;
        }

        return true;
    }

    // Add method to validate date range
    isValidDateRange(startDate, endDate) {
        // Check if any date in the range is invalid
        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (this.minDate && start < this.minDate) return false;
        if (this.maxDate && end > this.maxDate) return false;

        return true;
    }
}

// customElements.define('br-date-range-picker', BrCustomDateRangePicker);
