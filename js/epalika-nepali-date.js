/**
 * =============================================================================
 * ePalika - Nepali Bikram Sambat (वि.सं.) Date Picker & Engine
 * बाणगंगा नगरपालिका - आन्तरिक नियन्त्रण प्रणाली
 * =============================================================================
 */

(function (window) {
    'use strict';

    const NEPALI_MONTHS = [
        { id: 1, name: 'बैशाख', days: 31 },
        { id: 2, name: 'जेठ', days: 31 },
        { id: 3, name: 'असार', days: 32 },
        { id: 4, name: 'साउन', days: 32 },
        { id: 5, name: 'भदौ', days: 31 },
        { id: 6, name: 'असोज', days: 30 },
        { id: 7, name: 'कात्तिक', days: 30 },
        { id: 8, name: 'मंसिर', days: 29 },
        { id: 9, name: 'पुस', days: 30 },
        { id: 10, name: 'माघ', days: 29 },
        { id: 11, name: 'फागुन', days: 30 },
        { id: 12, name: 'चैत', days: 30 }
    ];

    const NEPALI_NUMS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const ENG_TO_NEP_DIGITS = {
        '0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'
    };
    const NEP_TO_ENG_DIGITS = {
        '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'
    };

    function toEnglishDigits(str) {
        if (!str) return '';
        return String(str).replace(/[०-९]/g, ch => NEP_TO_ENG_DIGITS[ch] || ch);
    }

    function toNepaliDigits(str) {
        if (!str) return '';
        return String(str).replace(/[0-9]/g, ch => ENG_TO_NEP_DIGITS[ch] || ch);
    }

    // Shared popup element
    let datepickerPopup = null;
    let activeInput = null;

    function createPopupDOM() {
        if (datepickerPopup) return datepickerPopup;

        datepickerPopup = document.createElement('div');
        datepickerPopup.id = 'epalika-nepali-datepicker-popup';
        datepickerPopup.className = 'nepali-calendar-popup shadow-lg';
        datepickerPopup.style.display = 'none';

        datepickerPopup.innerHTML = `
            <div class="nepali-cal-header">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-navy small font-devanagari">
                        <i class="fa-solid fa-calendar-days text-primary me-1"></i>नेपाली मिति (वि.सं.)
                    </span>
                    <button type="button" class="btn-close btn-close-white small p-1" id="cal-btn-close" aria-label="Close" style="font-size:0.65rem;"></button>
                </div>
                <div class="d-flex gap-2">
                    <select id="cal-select-year" class="form-select form-select-sm py-1 font-devanagari fw-bold" style="font-size:0.8rem;"></select>
                    <select id="cal-select-month" class="form-select form-select-sm py-1 font-devanagari fw-bold" style="font-size:0.8rem;"></select>
                </div>
            </div>
            <div class="nepali-cal-body">
                <div class="cal-days-header font-devanagari">
                    <span>आइत</span><span>सोम</span><span>मङ्गल</span><span>बुध</span><span>बिही</span><span>शुक्र</span><span>शनि</span>
                </div>
                <div class="cal-days-grid" id="cal-days-grid"></div>
            </div>
            <div class="nepali-cal-footer d-flex justify-content-between align-items-center p-2 border-top">
                <button type="button" class="btn btn-xs btn-outline-secondary font-devanagari" id="cal-btn-clear" style="font-size:0.75rem; padding: 2px 8px;">खाली गर्नुहोस्</button>
                <button type="button" class="btn btn-xs btn-primary font-devanagari fw-bold" id="cal-btn-today" style="font-size:0.75rem; padding: 2px 8px;">आज (Today)</button>
            </div>
        `;

        document.body.appendChild(datepickerPopup);

        // Populate Years (2001 to 2095)
        const yearSelect = datepickerPopup.querySelector('#cal-select-year');
        for (let y = 2095; y >= 2001; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `${y} वि.सं.`;
            if (y === 2081) opt.selected = true;
            yearSelect.appendChild(opt);
        }

        // Populate Months
        const monthSelect = datepickerPopup.querySelector('#cal-select-month');
        NEPALI_MONTHS.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.name} (${String(m.id).padStart(2, '0')})`;
            monthSelect.appendChild(opt);
        });

        // Events
        yearSelect.addEventListener('change', renderDaysGrid);
        monthSelect.addEventListener('change', renderDaysGrid);

        datepickerPopup.querySelector('#cal-btn-close').addEventListener('click', hidePopup);
        datepickerPopup.querySelector('#cal-btn-clear').addEventListener('click', () => {
            if (activeInput) {
                activeInput.value = '';
                activeInput.dispatchEvent(new Event('input', { bubbles: true }));
                activeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            hidePopup();
        });

        datepickerPopup.querySelector('#cal-btn-today').addEventListener('click', () => {
            // Approx current BS date (e.g., 2081-08-01 or calculated from AD)
            const todayBS = getTodayBS();
            selectDate(todayBS.year, todayBS.month, todayBS.day);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (datepickerPopup && datepickerPopup.style.display !== 'none') {
                if (!datepickerPopup.contains(e.target) && (!activeInput || !activeInput.contains(e.target)) && !e.target.closest('.nepali-date-btn')) {
                    hidePopup();
                }
            }
        });

        return datepickerPopup;
    }

    function getTodayBS() {
        // Fallback default: Current Nepali year 2081
        const now = new Date();
        const adYear = now.getFullYear();
        const adMonth = now.getMonth() + 1;
        const adDay = now.getDate();

        // Approximate BS year is AD + 56 / 57
        const bsYear = adYear + 57;
        const bsMonth = ((adMonth + 8) % 12) || 12;
        const bsDay = Math.min(adDay, 29);
        return { year: bsYear, month: bsMonth, day: bsDay };
    }

    function renderDaysGrid() {
        if (!datepickerPopup) return;
        const year = parseInt(datepickerPopup.querySelector('#cal-select-year').value, 10);
        const month = parseInt(datepickerPopup.querySelector('#cal-select-month').value, 10);
        const monthInfo = NEPALI_MONTHS.find(m => m.id === month) || NEPALI_MONTHS[0];

        const grid = datepickerPopup.querySelector('#cal-days-grid');
        grid.innerHTML = '';

        // Current selected day in active input if matching
        let selDay = 0;
        if (activeInput && activeInput.value) {
            const parts = toEnglishDigits(activeInput.value).split(/[-/]/);
            if (parts.length >= 3 && parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === month) {
                selDay = parseInt(parts[2], 10);
            }
        }

        const totalDays = monthInfo.days || 30;

        for (let d = 1; d <= totalDays; d++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = `cal-day-cell ${d === selDay ? 'active' : ''}`;
            dayBtn.textContent = d;
            dayBtn.setAttribute('data-day', d);

            dayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectDate(year, month, d);
            });

            grid.appendChild(dayBtn);
        }
    }

    function selectDate(year, month, day) {
        if (!activeInput) return;
        const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        activeInput.value = formatted;
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
        activeInput.dispatchEvent(new Event('change', { bubbles: true }));
        hidePopup();
    }

    function showPopup(input) {
        createPopupDOM();
        activeInput = input;

        // Parse initial value if present
        let y = 2081, m = 1;
        if (input.value) {
            const parts = toEnglishDigits(input.value).split(/[-/]/);
            if (parts.length >= 2) {
                const py = parseInt(parts[0], 10);
                const pm = parseInt(parts[1], 10);
                if (py >= 2000 && py <= 2095) y = py;
                if (pm >= 1 && pm <= 12) m = pm;
            }
        }

        const yearSelect = datepickerPopup.querySelector('#cal-select-year');
        const monthSelect = datepickerPopup.querySelector('#cal-select-month');
        if (yearSelect) yearSelect.value = y;
        if (monthSelect) monthSelect.value = m;

        renderDaysGrid();

        // Position popup right below the input
        const rect = input.getBoundingClientRect();
        const popupWidth = 280;
        let left = rect.left + window.scrollX;
        let top = rect.bottom + window.scrollY + 4;

        if (left + popupWidth > window.innerWidth) {
            left = window.innerWidth - popupWidth - 10;
        }

        datepickerPopup.style.left = `${Math.max(10, left)}px`;
        datepickerPopup.style.top = `${top}px`;
        datepickerPopup.style.display = 'block';
        datepickerPopup.style.zIndex = '99999';
    }

    function hidePopup() {
        if (datepickerPopup) {
            datepickerPopup.style.display = 'none';
        }
    }

    /**
     * Attach Nepali Datepicker to an input
     */
    function attachDatePicker(input) {
        if (!input || input.__nepaliDatePickerAttached) return;
        input.__nepaliDatePickerAttached = true;

        input.setAttribute('autocomplete', 'off');
        input.setAttribute('placeholder', 'YYYY-MM-DD (वि.सं.)');
        input.classList.add('nepali-date-input');

        // On Click / Focus
        input.addEventListener('click', function(e) {
            e.stopPropagation();
            showPopup(this);
        });

        // Auto format and normalize on manual typing
        input.addEventListener('input', function() {
            let val = toEnglishDigits(this.value);
            // allow only numbers and dashes/slashes
            val = val.replace(/[^0-9\-/]/g, '');
            if (val !== this.value) {
                this.value = val;
            }
        });

        // Trigger icon button if present next to input
        const parent = input.closest('.nepali-date-wrapper') || input.parentNode;
        if (parent) {
            const btn = parent.querySelector('.nepali-date-btn');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showPopup(input);
                });
            }
        }
    }

    // Public API
    window.NepaliDatePicker = {
        attach: attachDatePicker,
        show: showPopup,
        hide: hidePopup,
        toEnglishDigits: toEnglishDigits,
        toNepaliDigits: toNepaliDigits
    };

})(window);
