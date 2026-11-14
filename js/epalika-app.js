/**
 * ePalika.com - बाणगंगा नगरपालिका, कपिलवस्तु
 * आन्तरिक नियन्त्रण प्रणाली (Official UI Controller)
 * Matches reference PDF Page 1 & Page 2 identically.
 */

document.addEventListener('DOMContentLoaded', function() {
    let activeTab = 'employees';
    let currentRole = 'Super Admin';
    let filterState = {};
    let selectedEmployeeId = null;

    const mainContainer = document.getElementById('main-content-display');
    const roleSwitcher = document.getElementById('header-role-switcher');
    const toastMount = document.getElementById('toast-mount');

    init();

    function init() {
        setupTabs();
        setupRoleSwitcher();
        renderTab('employees');
    }

    function setupTabs() {
        document.querySelectorAll('.official-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                window.switchTab(tab);
            });
        });
    }

    window.switchTab = function(tab) {
        activeTab = tab;
        document.querySelectorAll('.official-tab-btn').forEach(b => {
            if (b.getAttribute('data-tab') === tab) b.classList.add('active');
            else b.classList.remove('active');
        });
        renderTab(tab);
        window.scrollTo(0, 0);
    };

    function setupRoleSwitcher() {
        if (roleSwitcher) {
            roleSwitcher.addEventListener('change', function() {
                currentRole = this.value;
                showToast(`भूमिका परिवर्तन: ${currentRole}`, 'info');
                renderTab(activeTab);
            });
        }
    }

    function renderTab(tab) {
        switch(tab) {
            case 'employees':
                renderEmployeesTab();
                break;
            case 'settings':
                renderSettingsTab();
                break;
            case 'palika_profile':
                renderPalikaProfileTab();
                break;
            case 'wards':
                renderWardsTab();
                break;
            case 'cooperative':
                renderInstitutionTab('cooperative', 'सहकारी');
                break;
            case 'drinking_water':
                renderInstitutionTab('drinking_water', 'खानेपानी');
                break;
            case 'forest':
                renderInstitutionTab('forest', 'सामुदायिक वन');
                break;
            case 'organization':
                renderInstitutionTab('organization', 'संघसंस्था');
                break;
            default:
                renderEmployeesTab();
        }
    }

    // =========================================================================
    // 1. कर्मचारी (EMPLOYEE MANAGEMENT) - Exact Form from PDF Screenshot
    // =========================================================================
    function renderEmployeesTab() {
        const masters = ePalikaDB.getMasters();
        const employees = ePalikaDB.getEmployees(filterState);
        const totalCount = employees.length;

        // Selected employee or empty default
        const emp = selectedEmployeeId ? (ePalikaDB.getEmployeeById(selectedEmployeeId) || {}) : (employees[0] || {});

        const isPublic = currentRole === 'Public';

        mainContainer.innerHTML = `
            <!-- Informational Guideline Badge from Reference PDF -->
            <div class="alert alert-secondary py-2 px-3 small border d-flex justify-content-between align-items-center mb-3 bg-white">
                <div>
                    <span class="badge bg-primary me-2">कर्मचारी मोड्युल</span>
                    ${isPublic ? 
                        `<strong>बाहिरी प्रयोगकर्ता मोड:</strong> कर्मचारीको वर्गको आधारमा संख्या मात्र हेर्न सकिनेछ।` : 
                        `<strong>भित्री प्रयोगकर्ता मोड:</strong> कार्यालयगत, समूहगत रुपमा फिल्टर गरेर हेर्न र सम्पर्क नम्बरहरु हेर्न सकिनेछ।`
                    }
                </div>
                <div class="small text-muted font-devanagari">
                    Admin ले निम्नानुसार सबै सेटिङ गर्न सक्ने व्यवस्था।
                </div>
            </div>

            <!-- The Exact Official Form Grid Container from PDF -->
            <div class="emp-ref-form-container ${isPublic ? 'd-none' : ''}">
                <form id="ref-employee-form">
                    <table class="form-grid-table">
                        <!-- Row 1 -->
                        <tr>
                            <td class="form-field-label">कर्मचारीको कोड:</td>
                            <td style="width: 25%;">
                                <div class="d-flex gap-1">
                                    <input type="text" id="f-emp-code" class="form-field-input fw-bold" value="${emp.employee_code || ''}" placeholder="EMP-...">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-show-all-records" title="Show All Records" style="white-space:nowrap; font-size:0.75rem;">
                                        Show All Records
                                    </button>
                                </div>
                            </td>
                            <td class="form-field-label">कार्यालय:</td>
                            <td style="width: 25%;">
                                <div class="select-with-icon">
                                    <select id="f-office" class="form-field-select">
                                        ${masters.offices.map(o => `<option value="${o.id}" ${emp.office_id == o.id ? 'selected':''}>${o.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('offices', 'कार्यालय')" title="मास्टर थप/सम्पादन">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">हालको पदमा नियुक्ति:</td>
                            <td style="width: 25%;">
                                <input type="date" id="f-curr-app-date" class="form-field-input" value="${emp.current_position_appointment_date || ''}">
                            </td>
                        </tr>

                        <!-- Row 2 -->
                        <tr>
                            <td class="form-field-label">क्र.सं.:</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <input type="text" id="f-serial-no" class="form-field-input" style="width:70px;" value="${emp.serial_number || ''}">
                                    <span class="form-field-label">लिङ्ग:</span>
                                    <select id="f-gender" class="form-field-select">
                                        <option value="पुरुष" ${emp.gender==='पुरुष'?'selected':''}>पुरुष</option>
                                        <option value="महिला" ${emp.gender==='महिला'?'selected':''}>महिला</option>
                                        <option value="अन्य" ${emp.gender==='अन्य'?'selected':''}>अन्य</option>
                                    </select>
                                </div>
                            </td>
                            <td class="form-field-label">स्थायी/करार:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-employment-type" class="form-field-select">
                                        ${masters.employmentTypes.map(et => `<option value="${et.id}" ${emp.employment_type_id == et.id ? 'selected':''}>${et.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('employmentTypes', 'स्थायी/करार')" title="मास्टर थप">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">हालको पदमा हाजिर:</td>
                            <td>
                                <input type="date" id="f-curr-join-date" class="form-field-input" value="${emp.current_position_joining_date || ''}">
                            </td>
                        </tr>

                        <!-- Row 3 -->
                        <tr>
                            <td class="form-field-label">कर्मचारीको नाम:</td>
                            <td>
                                <input type="text" id="f-name-ne" class="form-field-input fw-bold text-primary" value="${emp.full_name_ne || ''}" placeholder="पूरा नाम...">
                            </td>
                            <td class="form-field-label">सेवाको किसिम:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-service-type" class="form-field-select">
                                        ${masters.serviceTypes.map(st => `<option value="${st.id}" ${emp.service_type_id == st.id ? 'selected':''}>${st.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('serviceTypes', 'सेवाको किसिम')" title="मास्टर थप">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">यस कार्यालयमा हाजिर:</td>
                            <td>
                                <input type="date" id="f-office-join-date" class="form-field-input" value="${emp.current_office_joining_date || ''}">
                            </td>
                        </tr>

                        <!-- Row 4 -->
                        <tr>
                            <td class="form-field-label">पदको कोड:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-pos-code" class="form-field-select">
                                        <option value="POS-001">POS-001</option>
                                        <option value="POS-002">POS-002</option>
                                        <option value="POS-003">POS-003</option>
                                        <option value="POS-004">POS-004</option>
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('designations', 'पदको कोड')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">दरबन्दी:</td>
                            <td>
                                <input type="text" id="f-staff-quota" class="form-field-input" value="${emp.staff_quota || 'स्वीकृत'}">
                            </td>
                            <td class="form-field-label">रमानाभई आएको मिति:</td>
                            <td>
                                <input type="date" id="f-transfer-date" class="form-field-input" value="${emp.transfer_release_date || ''}">
                            </td>
                        </tr>

                        <!-- Row 5 -->
                        <tr>
                            <td class="form-field-label">पद:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-designation" class="form-field-select">
                                        ${masters.designations.map(d => `<option value="${d.id}" ${emp.designation_id == d.id ? 'selected':''}>${d.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('designations', 'पद')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">बहाल विदा वा अन्य:</td>
                            <td>
                                <select id="f-duty-status" class="form-field-select">
                                    <option value="कार्यरत" ${emp.duty_status==='कार्यरत'?'selected':''}>कार्यरत</option>
                                    <option value="विदा" ${emp.duty_status==='विदा'?'selected':''}>विदा</option>
                                    <option value="काज" ${emp.duty_status==='काज'?'selected':''}>काज</option>
                                    <option value="सरुवा" ${emp.duty_status==='सरुवा'?'selected':''}>सरुवा</option>
                                </select>
                            </td>
                            <td class="form-field-label">कर्मचारी संकेत नं:</td>
                            <td>
                                <input type="text" id="f-sheet-roll" class="form-field-input" value="${emp.personnel_sheet_roll_no || ''}">
                            </td>
                        </tr>

                        <!-- Row 6 -->
                        <tr>
                            <td class="form-field-label">तह:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-level" class="form-field-select">
                                        ${masters.levels.map(l => `<option value="${l.id}" ${emp.level_id == l.id ? 'selected':''}>${l.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('levels', 'तह')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">ई-मेल:</td>
                            <td>
                                <input type="email" id="f-email" class="form-field-input" value="${emp.email || ''}">
                            </td>
                            <td class="form-field-label">संचयकोष नं:</td>
                            <td>
                                <input type="text" id="f-pf-no" class="form-field-input" value="${emp.provident_fund_no || ''}">
                            </td>
                        </tr>

                        <!-- Row 7 -->
                        <tr>
                            <td class="form-field-label">सेवा:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-service" class="form-field-select">
                                        ${masters.services.map(s => `<option value="${s.id}" ${emp.service_id == s.id ? 'selected':''}>${s.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('services', 'सेवा')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">मोबाईल नं:</td>
                            <td>
                                <input type="text" id="f-mobile" class="form-field-input" value="${emp.mobile_number || ''}">
                            </td>
                            <td class="form-field-label">ना.जि.वि.ना नं:</td>
                            <td>
                                <input type="text" id="f-cit-no" class="form-field-input" value="${emp.cit_insurance_no || ''}">
                            </td>
                        </tr>

                        <!-- Row 8 -->
                        <tr>
                            <td class="form-field-label">समूह:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-group" class="form-field-select">
                                        ${masters.groups.map(g => `<option value="${g.id}" ${emp.group_id == g.id ? 'selected':''}>${g.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('groups', 'समूह')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">यस कार्यालयमा आएको कार्यालय:</td>
                            <td>
                                <input type="text" id="f-transferred-from" class="form-field-input" value="${emp.transferred_from_office || ''}">
                            </td>
                            <td class="form-field-label">लगानीकोष नं:</td>
                            <td>
                                <input type="text" id="f-inv-no" class="form-field-input" value="${emp.investment_fund_no || ''}">
                            </td>
                        </tr>

                        <!-- Row 9 -->
                        <tr>
                            <td class="form-field-label">शैक्षिक योग्यता:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-qualification" class="form-field-select">
                                        ${masters.qualifications.map(q => `<option value="${q.id}" ${emp.qualification_id == q.id ? 'selected':''}>${q.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('qualifications', 'शैक्षिक योग्यता')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">परिवारको सम्पर्क नं:</td>
                            <td>
                                <input type="text" id="f-family-contact" class="form-field-input" value="${emp.family_contact_number || ''}">
                            </td>
                            <td class="form-field-label">सुरु नियुक्ती:</td>
                            <td>
                                <input type="date" id="f-initial-app" class="form-field-input" value="${emp.initial_appointment_date || ''}">
                            </td>
                        </tr>

                        <!-- Row 10 -->
                        <tr>
                            <td class="form-field-label">शाखा:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-department" class="form-field-select">
                                        ${masters.departments.map(dp => `<option value="${dp.id}" ${emp.department_id == dp.id ? 'selected':''}>${dp.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('departments', 'शाखा')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">जन्म मिति:</td>
                            <td>
                                <input type="date" id="f-dob" class="form-field-input" value="${emp.dob || ''}">
                            </td>
                            <td class="form-field-label">उमेर:</td>
                            <td>
                                <span id="f-age-text" class="fw-bold text-dark font-devanagari ps-2">${emp.age ? emp.age + ' वर्ष' : '........'}</span>
                            </td>
                        </tr>
                    </table>

                    <!-- Action Toolbar Row (Exact Buttons matching reference screenshot) -->
                    <div class="emp-action-bar">
                        <div class="emp-count-text">
                            कर्मचारी संख्या: <span class="badge bg-primary px-2 py-1 fs-6 font-devanagari">${totalCount}</span>
                        </div>

                        <div class="action-buttons-group">
                            <!-- Quick Search Bar -->
                            <div class="input-group input-group-sm" style="width: 170px;">
                                <input type="text" id="quick-search-box" class="form-control form-control-sm" placeholder="नाम/कोड..." value="${filterState.search || ''}">
                                <button type="button" class="btn btn-ref-search" id="btn-ref-search">
                                    Search
                                </button>
                            </div>

                            <button type="button" class="btn-ref btn-ref-multi" id="btn-ref-multifilter">
                                Filterby MultiSelection
                            </button>

                            <button type="button" class="btn-ref btn-ref-excel" id="btn-ref-excel">
                                Excel
                            </button>

                            <button type="button" class="btn-ref btn-ref-new" id="btn-ref-new">
                                New
                            </button>

                            <button type="button" class="btn-ref btn-ref-save" id="btn-ref-save">
                                Save
                            </button>

                            <button type="button" class="btn-ref btn-ref-update" id="btn-ref-update">
                                Update
                            </button>

                            <button type="button" class="btn-ref btn-ref-delete" id="btn-ref-delete">
                                Delete
                            </button>

                            <button type="button" class="btn-ref btn-ref-exit" onclick="window.print()">
                                Exit
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Public Mode Stat Counter (if Public role is active) -->
            ${isPublic ? `
                <div class="gov-panel p-4 text-center">
                    <h5 class="fw-bold text-navy mb-3">कर्मचारीको वर्गको आधारमा संख्या (सार्वजनिक विवरण)</h5>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="p-3 bg-light border rounded">
                                <h3 class="fw-bold text-primary">${employees.filter(e=>e.employment_type_name==='स्थायी').length}</h3>
                                <div>स्थायी कर्मचारी</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 bg-light border rounded">
                                <h3 class="fw-bold text-warning">${employees.filter(e=>e.employment_type_name==='करार').length}</h3>
                                <div>करार कर्मचारी</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 bg-light border rounded">
                                <h3 class="fw-bold text-danger">${employees.filter(e=>e.employment_type_name==='ज्यालादारी').length}</h3>
                                <div>ज्यालादारी कर्मचारी</div>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Employee List Table Below (Click row to load into form) -->
            <div class="gov-panel mt-4">
                <div class="gov-panel-header">
                    <span class="gov-panel-title">
                        <i class="fa-solid fa-list me-1"></i> कर्मचारी अभिलेख सूची (तलको कुनै पनि कर्मचारीमा क्लिक गरी माथिको फारममा हेर्न र सम्पादन गर्न सक्नुहुन्छ)
                    </span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> प्रिन्ट
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table-gov">
                        <thead>
                            <tr>
                                <th>क्र.सं.</th>
                                <th>कोड</th>
                                <th>कर्मचारीको नाम</th>
                                <th>लिङ्ग</th>
                                <th>पद</th>
                                <th>तह</th>
                                <th>शाखा</th>
                                <th>कार्यालय</th>
                                <th>प्रकार</th>
                                ${!isPublic ? `<th>मोबाईल नं</th>` : ''}
                                <th>स्थिति</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map((e, idx) => `
                                <tr style="cursor:pointer;" class="emp-row-select ${emp.id == e.id ? 'table-primary':''}" data-id="${e.id}">
                                    <td>${idx + 1}</td>
                                    <td><span class="badge bg-light text-dark border">${e.employee_code}</span></td>
                                    <td class="fw-bold text-primary">${e.full_name_ne}</td>
                                    <td>${e.gender}</td>
                                    <td>${e.designation_name}</td>
                                    <td>${e.level_name}</td>
                                    <td>${e.department_name}</td>
                                    <td>${e.office_name}</td>
                                    <td><span class="badge bg-info-subtle text-dark">${e.employment_type_name}</span></td>
                                    ${!isPublic ? `<td>${e.mobile_number}</td>` : ''}
                                    <td><span class="badge bg-success-subtle text-success">कार्यरत</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        attachEmployeeRefEvents();
    }

    function attachEmployeeRefEvents() {
        // DOB change -> auto age update
        const dobInput = document.getElementById('f-dob');
        const ageText = document.getElementById('f-age-text');
        if (dobInput) {
            dobInput.addEventListener('change', function() {
                if (this.value) {
                    const yr = new Date(this.value).getFullYear();
                    const age = new Date().getFullYear() - yr;
                    ageText.textContent = (age > 0 ? age : 0) + ' वर्ष';
                }
            });
        }

        // Show All Records
        const btnShowAll = document.getElementById('btn-show-all-records');
        if (btnShowAll) {
            btnShowAll.addEventListener('click', () => {
                filterState = {};
                renderEmployeesTab();
                showToast('सबै रेकर्डहरू देखाइयो।', 'info');
            });
        }

        // Click row to load in form
        document.querySelectorAll('.emp-row-select').forEach(row => {
            row.addEventListener('click', function() {
                selectedEmployeeId = Number(this.getAttribute('data-id'));
                renderEmployeesTab();
            });
        });

        // Search Button
        const btnSearch = document.getElementById('btn-ref-search');
        const quickSearch = document.getElementById('quick-search-box');
        if (btnSearch && quickSearch) {
            const doSearch = () => {
                filterState.search = quickSearch.value.trim();
                renderEmployeesTab();
            };
            btnSearch.addEventListener('click', doSearch);
            quickSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
        }

        // Filterby MultiSelection Button
        const btnMulti = document.getElementById('btn-ref-multifilter');
        if (btnMulti) {
            btnMulti.addEventListener('click', openMultiFilterModal);
        }

        // Excel Export Button
        const btnExcel = document.getElementById('btn-ref-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', exportEmployeesToCSV);
        }

        // New Button
        const btnNew = document.getElementById('btn-ref-new');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                selectedEmployeeId = null;
                document.getElementById('ref-employee-form').reset();
                const newCode = 'EMP-' + String(Math.floor(100 + Math.random() * 900));
                document.getElementById('f-emp-code').value = newCode;
                document.getElementById('f-age-text').textContent = '........';
                showToast('नयाँ कर्मचारी फारम तयार भयो। विवरण भरेर Save थिच्नुहोस्।', 'info');
            });
        }

        // Save Button (New Entry)
        const btnSave = document.getElementById('btn-ref-save');
        if (btnSave) {
            btnSave.addEventListener('click', () => saveOrUpdateEmployee(false));
        }

        // Update Button
        const btnUpdate = document.getElementById('btn-ref-update');
        if (btnUpdate) {
            btnUpdate.addEventListener('click', () => saveOrUpdateEmployee(true));
        }

        // Delete Button
        const btnDelete = document.getElementById('btn-ref-delete');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                if (!selectedEmployeeId) {
                    showToast('कृपया हटाउनको लागि पहिले तलको सूचीबाट कर्मचारी छनोट गर्नुहोस्।', 'error');
                    return;
                }
                const emp = ePalikaDB.getEmployeeById(selectedEmployeeId);
                if (confirm(`के तपाईं निश्चित हुनुहुन्छ? कर्मचारी '${emp.full_name_ne}' लाई मेटाउन चाहनुहुन्छ?`)) {
                    ePalikaDB.deleteEmployee(selectedEmployeeId);
                    showToast(`कर्मचारी '${emp.full_name_ne}' हटाइयो।`, 'success');
                    selectedEmployeeId = null;
                    renderEmployeesTab();
                }
            });
        }
    }

    function saveOrUpdateEmployee(isUpdate) {
        const code = document.getElementById('f-emp-code').value.trim();
        const name = document.getElementById('f-name-ne').value.trim();
        const mobile = document.getElementById('f-mobile').value.trim();

        if (!code || !name) {
            showToast('कृपया कर्मचारीको कोड र नाम अनिवार्य भर्नुहोस्।', 'error');
            return;
        }

        const data = {
            id: isUpdate ? selectedEmployeeId : null,
            employee_code: code,
            serial_number: document.getElementById('f-serial-no').value,
            full_name_ne: name,
            gender: document.getElementById('f-gender').value,
            dob: document.getElementById('f-dob').value,
            office_id: Number(document.getElementById('f-office').value),
            employment_type_id: Number(document.getElementById('f-employment-type').value),
            service_type_id: Number(document.getElementById('f-service-type').value),
            designation_id: Number(document.getElementById('f-designation').value),
            level_id: Number(document.getElementById('f-level').value),
            service_id: Number(document.getElementById('f-service').value),
            group_id: Number(document.getElementById('f-group').value),
            qualification_id: Number(document.getElementById('f-qualification').value),
            department_id: Number(document.getElementById('f-department').value),
            staff_quota: document.getElementById('f-staff-quota').value,
            duty_status: document.getElementById('f-duty-status').value,
            email: document.getElementById('f-email').value,
            mobile_number: mobile,
            family_contact_number: document.getElementById('f-family-contact').value,
            transferred_from_office: document.getElementById('f-transferred-from').value,
            current_position_appointment_date: document.getElementById('f-curr-app-date').value,
            current_position_joining_date: document.getElementById('f-curr-join-date').value,
            current_office_joining_date: document.getElementById('f-office-join-date').value,
            transfer_release_date: document.getElementById('f-transfer-date').value,
            initial_appointment_date: document.getElementById('f-initial-app').value,
            personnel_sheet_roll_no: document.getElementById('f-sheet-roll').value,
            provident_fund_no: document.getElementById('f-pf-no').value,
            cit_insurance_no: document.getElementById('f-cit-no').value,
            investment_fund_no: document.getElementById('f-inv-no').value
        };

        if (data.dob) {
            const yr = new Date(data.dob).getFullYear();
            data.age = new Date().getFullYear() - yr;
        }

        ePalikaDB.saveEmployee(data);
        showToast(isUpdate ? `कर्मचारी विवरण अद्यावधिक भयो।` : `नयाँ कर्मचारी सुरक्षित गरियो।`, 'success');
        renderEmployeesTab();
    }

    // =========================================================================
    // 2. सेटिङ (SETTINGS) - Matching PDF Diagram, User Creation & Password SMS
    // =========================================================================
    function renderSettingsTab() {
        const users = ePalikaDB.getUsers();
        const masters = ePalikaDB.getMasters();

        mainContainer.innerHTML = `
            <div class="row g-4">
                <!-- Left: Exact Diagram from PDF Page 1 -->
                <div class="col-lg-6">
                    <div class="settings-diagram-card">
                        <!-- 3 Sub Buttons: नयाँ प्रयोगकर्ता थप, पासवर्ड वितरण, बाहिर -->
                        <div class="settings-sub-btns">
                            <div class="settings-btn-box active" id="btn-sub-new-user">
                                नयाँ प्रयोगकर्ता थप
                            </div>
                            <div class="settings-btn-box" id="btn-sub-pass-dist">
                                पासवर्ड वितरण
                            </div>
                            <div class="settings-btn-box" onclick="alert('लगआउट गरियो।');">
                                बाहिर
                            </div>
                        </div>

                        <!-- Form matching PDF Page 1 Diagram Box -->
                        <div class="p-3 border rounded bg-light">
                            <table class="settings-form-table">
                                <tr>
                                    <td class="form-field-label">नाम:</td>
                                    <td><input type="text" id="s-name" class="form-field-input" placeholder="पूरा नाम..."></td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">प्रयोगकर्ता संकेत:</td>
                                    <td><input type="text" id="s-user-code" class="form-field-input fw-bold" placeholder="User ID (उदा: EMP009)..."></td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">वर्ग:</td>
                                    <td>
                                        <select id="s-category" class="form-field-select fw-bold text-primary">
                                            <option value="कर्मचारी">कर्मचारी</option>
                                            <option value="सहकारी">सहकारी</option>
                                            <option value="खानेपानी">खानेपानी</option>
                                            <option value="वन">वन</option>
                                            <option value="संघसंस्था">संघसंस्था</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">मोबाईल नं.:</td>
                                    <td><input type="text" id="s-mobile" class="form-field-input" placeholder="९८xxxxxxxx"></td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">आन्तरिक/वाह्य:</td>
                                    <td>
                                        <select id="s-internal" class="form-field-select">
                                            <option value="1">आन्तरिक (Internal)</option>
                                            <option value="0">वाह्य (External)</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td class="pt-2">
                                        <button type="button" class="btn btn-primary fw-bold px-4 py-2" id="btn-trigger-password-sms">
                                            <i class="fa-solid fa-key me-1"></i> पासवर्ड (Password Dispatch)
                                        </button>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- PDF Note representation -->
                        <div class="mt-3 p-3 bg-white border rounded small">
                            <i class="fa-solid fa-circle-info text-primary me-1"></i>
                            <strong>निर्देशिका (PDF Note):</strong> पासवर्ड मा क्लिक गरिसकेपछि सम्बन्धित मोबाईलमा प्रयोगकर्ता संकेत, पासवर्ड (User ID र Password) पठाइनेछ र प्रयोगकर्ताले तत्काल लगईन गर्न सक्नेछन्।
                        </div>
                    </div>
                </div>

                <!-- Right: Registered Users List -->
                <div class="col-lg-6">
                    <div class="gov-panel">
                        <div class="gov-panel-header">
                            <span class="gov-panel-title">दर्ता प्रयोगकर्ताहरूको सूची</span>
                        </div>
                        <div class="table-responsive">
                            <table class="table-gov">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>नाम</th>
                                        <th>वर्ग</th>
                                        <th>मोबाईल नं</th>
                                        <th>कार्य</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(u => `
                                        <tr>
                                            <td><span class="badge bg-light text-dark border">${u.user_code}</span></td>
                                            <td class="fw-bold">${u.name}</td>
                                            <td><span class="badge bg-secondary">${u.category}</span></td>
                                            <td>${u.mobile_number}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary py-0 px-2 btn-resend-pass" data-name="${u.name}" data-code="${u.user_code}" data-phone="${u.mobile_number}">
                                                    पासवर्ड पठाउनुहोस्
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Password dispatch handler
        document.getElementById('btn-trigger-password-sms').addEventListener('click', () => {
            const name = document.getElementById('s-name').value.trim();
            const code = document.getElementById('s-user-code').value.trim();
            const cat = document.getElementById('s-category').value;
            const mobile = document.getElementById('s-mobile').value.trim();

            if (!name || !code || !mobile) {
                showToast('कृपया नाम, प्रयोगकर्ता संकेत र मोबाईल नम्बर भर्नुहोस्।', 'error');
                return;
            }

            const tempPass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);

            ePalikaDB.saveUser({
                name: name,
                user_code: code,
                category: cat,
                role: cat === 'कर्मचारी' ? 'Employee' : 'Institution User',
                mobile_number: mobile,
                is_internal: document.getElementById('s-internal').value === '1'
            });

            showPasswordSMSModal(name, code, mobile, tempPass);
            renderSettingsTab();
        });

        document.querySelectorAll('.btn-resend-pass').forEach(btn => {
            btn.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                const code = this.getAttribute('data-code');
                const phone = this.getAttribute('data-phone');
                const tempPass = 'Banganga@' + Math.floor(100 + Math.random() * 900);
                showPasswordSMSModal(name, code, phone, tempPass);
            });
        });
    }

    function showPasswordSMSModal(name, code, phone, pass) {
        const mount = document.getElementById('master-quick-modal-mount');
        mount.innerHTML = `
            <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-paper-plane me-2"></i> पासवर्ड वितरण सम्पन्न (SMS Delivered)</h5>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('master-quick-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 text-center">
                            <h5 class="fw-bold mb-1">${name}</h5>
                            <div class="text-muted small mb-3">मोबाईल नं.: <strong>${phone}</strong></div>
                            
                            <div class="p-3 bg-light border rounded text-start mb-3">
                                <div><strong>प्रयोगकर्ता संकेत (User ID):</strong> <code class="fs-6 text-primary">${code}</code></div>
                                <div><strong>पासवर्ड (Password):</strong> <code class="fs-6 text-danger">${pass}</code></div>
                            </div>

                            <p class="small text-muted mb-0">
                                📱 सम्बन्धित मोबाईल नम्बरमा User ID र Password को SMS पठाइएको छ। प्रयोगकर्ताले तुरुन्त लगईन गर्न सक्नेछन्।
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary btn-sm" onclick="document.getElementById('master-quick-modal-mount').innerHTML='';">सम्पन्न</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 3. पालिका प्रोफाइल (PALIKA PROFILE - Scrolling & Subject Downloads)
    // =========================================================================
    function renderPalikaProfileTab() {
        const mun = ePalikaDB.getMunicipality();

        mainContainer.innerHTML = `
            <!-- Scrolling Palika Profile matching PDF instruction -->
            <div class="gov-panel p-4 mb-4 bg-white text-center">
                <div class="brand-epalika mb-2">ePalika.com</div>
                <h2 class="fw-bold text-navy font-devanagari mb-1">${mun.name_ne}</h2>
                <div class="text-muted mb-2">${mun.address_ne}, ${mun.district_ne} | ${mun.province_ne}</div>
                <p class="text-secondary max-w-700 mx-auto small p-3 bg-light rounded">${mun.profile_summary}</p>
            </div>

            <!-- Subject-wise Downloads (विषयगत रुपमा डाउनलोड) -->
            <div class="gov-panel p-4 mb-4">
                <div class="gov-panel-header px-0 pt-0 bg-transparent">
                    <span class="gov-panel-title">
                        <i class="fa-solid fa-file-arrow-down text-primary me-2"></i> विषयगत प्रोफाइल डाउनलोड (Subject-wise Profile Downloads)
                    </span>
                    <span class="text-muted small">सम्बन्धित विषयगत प्रोफाइल डाउनलोड गर्न क्लिक गर्नुहोस्</span>
                </div>
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1"><i class="fa-solid fa-wheat-awn text-success me-1"></i> कृषि विकास प्रोफाइल</h6>
                                <div class="small text-muted">तथ्याङ्क तथा बाली उत्पादन विवरण</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('कृषि विकास प्रोफाइल डाउनलोड हुँदैछ...');">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1"><i class="fa-solid fa-heart-pulse text-danger me-1"></i> स्वास्थ्य सेवा प्रोफाइल</h6>
                                <div class="small text-muted">अस्पताल, स्वास्थ्य चौकी तथा जनशक्ति</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('स्वास्थ्य सेवा प्रोफाइल डाउनलोड हुँदैछ...');">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1"><i class="fa-solid fa-road text-secondary me-1"></i> पूर्वाधार विकास प्रोफाइल</h6>
                                <div class="small text-muted">सडक, पुल, भवन र सहरी योजना</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('पूर्वाधार विकास प्रोफाइल डाउनलोड हुँदैछ...');">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1"><i class="fa-solid fa-tree text-success me-1"></i> वन तथा वातावरण प्रोफाइल</h6>
                                <div class="small text-muted">सामुदायिक वन तथा जलाधार संरक्षण</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('वन तथा वातावरण प्रोफाइल डाउनलोड हुँदैछ...');">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1"><i class="fa-solid fa-handshake-angle text-teal me-1"></i> सहकारी संस्था प्रोफाइल</h6>
                                <div class="small text-muted">बचत तथा कृषि सहकारी पुँजी विश्लेषण</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('सहकारी प्रोफाइल डाउनलोड हुँदैछ...');">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1"><i class="fa-solid fa-graduation-cap text-primary me-1"></i> शिक्षा तथा सामाजिक विकास</h6>
                                <div class="small text-muted">विद्यालय, विद्यार्थी तथा साक्षरता दर</div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('शिक्षा प्रोफाइल डाउनलोड हुँदैछ...');">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Leadership Contacts -->
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="p-3 border rounded bg-white text-center">
                        <div class="badge bg-primary mb-2">नगर प्रमुख (Mayor)</div>
                        <h5 class="fw-bold text-dark">${mun.mayor_name}</h5>
                        <div class="text-primary fw-semibold"><i class="fa-solid fa-phone me-1"></i> ${mun.mayor_phone}</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border rounded bg-white text-center">
                        <div class="badge bg-danger mb-2">उप-प्रमुख (Deputy Mayor)</div>
                        <h5 class="fw-bold text-dark">${mun.deputy_mayor_name}</h5>
                        <div class="text-danger fw-semibold"><i class="fa-solid fa-phone me-1"></i> ${mun.deputy_mayor_phone}</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border rounded bg-white text-center">
                        <div class="badge bg-secondary mb-2">प्रमुख प्रशासकीय अधिकृत (CAO)</div>
                        <h5 class="fw-bold text-dark">${mun.chief_officer_name}</h5>
                        <div class="text-dark fw-semibold"><i class="fa-solid fa-phone me-1"></i> ${mun.chief_officer_phone}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 4. वडा कार्यालय (WARD OFFICES)
    // =========================================================================
    function renderWardsTab() {
        const wards = ePalikaDB.getWards();

        mainContainer.innerHTML = `
            <div class="gov-panel p-3 mb-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-navy m-0"><i class="fa-solid fa-map-location-dot me-2"></i> बाणगंगा नगरपालिकाका वडा कार्यालयहरू (Wards 1-11)</h5>
                <button class="btn btn-sm btn-outline-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i> प्रिन्ट</button>
            </div>

            <div class="row g-3">
                ${wards.map(w => `
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary">वडा नं. ${w.ward_number}</span>
                                <span class="text-muted small">जनसंख्या: ${w.population}</span>
                            </div>
                            <h6 class="fw-bold text-dark mb-2">${w.office_name_ne}</h6>
                            <div class="small text-muted mb-2"><i class="fa-solid fa-location-dot text-danger me-1"></i> ${w.address}</div>
                            <div class="small p-2 bg-light rounded mb-2">
                                <div><strong>अध्यक्ष:</strong> ${w.chairperson_name} (${w.chairperson_phone})</div>
                                <div><strong>सचिव:</strong> ${w.secretary_name} (${w.secretary_phone})</div>
                            </div>
                            <div class="small fw-semibold text-primary">
                                कर्मचारी संख्या: ${w.employees_count}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // =========================================================================
    // 5. INSTITUTIONS (सहकारी, खानेपानी, वन, संघसंस्था)
    // =========================================================================
    function renderInstitutionTab(categoryKey, categoryName) {
        const institutions = ePalikaDB.getInstitutions(categoryKey);

        mainContainer.innerHTML = `
            <div class="gov-panel p-3 mb-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-navy m-0"><i class="fa-solid fa-building me-2"></i> दर्ता ${categoryName} संस्था अभिलेख</h5>
                <div>
                    <button class="btn btn-sm btn-success me-1" onclick="exportEmployeesToCSV()"><i class="fa-solid fa-file-excel"></i> Excel</button>
                    <button class="btn btn-sm btn-primary" onclick="alert('नयाँ संस्था दर्ता फारम चाँडै उपलब्ध हुनेछ।');"><i class="fa-solid fa-plus"></i> नयाँ संस्था थप</button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-gov">
                    <thead>
                        <tr>
                            <th>क्र.सं.</th>
                            <th>दर्ता नं</th>
                            <th>संस्थाको नाम</th>
                            <th>ठेगाना</th>
                            <th>सम्पर्क व्यक्ति</th>
                            <th>सम्पर्क फोन</th>
                            <th>सदस्य संख्या</th>
                            <th>पुँजी लगानी (रू)</th>
                            <th>स्थिति</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${institutions.map((inst, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><span class="badge bg-light text-dark border">${inst.reg_number}</span></td>
                                <td class="fw-bold text-primary">${inst.name_ne}</td>
                                <td>${inst.address}</td>
                                <td>${inst.contact_person}</td>
                                <td>${inst.contact_phone}</td>
                                <td>${inst.members_count}</td>
                                <td class="fw-semibold">${inst.capital_investment ? inst.capital_investment.toLocaleString('ne-NP') : '-'}</td>
                                <td><span class="badge bg-success-subtle text-success">सक्रिय</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // =========================================================================
    // Quick Master Dropdown Modal (Allows Admin to Add/Edit dropdown options directly)
    // =========================================================================
    window.openQuickMasterModal = function(type, label) {
        const name = prompt(`नयाँ ${label} प्रविष्ट गर्नुहोस्:`);
        if (name && name.trim()) {
            ePalikaDB.addMasterItem(type, name.trim());
            showToast(`नयाँ ${label} '${name.trim()}' सुरक्षित गरियो।`, 'success');
            renderEmployeesTab();
        }
    };

    // MultiSelection Filter Modal
    function openMultiFilterModal() {
        const masters = ePalikaDB.getMasters();
        const mount = document.getElementById('multifilter-modal-mount');

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-navy text-white" style="background:var(--primary-blue);">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-filter me-2"></i> Filterby MultiSelection</h5>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('multifilter-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small">शाखा (Departments):</label>
                                    <select class="form-select form-select-sm" id="mf-dept" multiple size="4">
                                        ${masters.departments.map(d => `<option value="${d.id}">${d.name_ne}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small">पद (Designations):</label>
                                    <select class="form-select form-select-sm" id="mf-des" multiple size="4">
                                        ${masters.designations.map(d => `<option value="${d.id}">${d.name_ne}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small">तह (Level):</label>
                                    <select class="form-select form-select-sm" id="mf-lev" multiple size="3">
                                        ${masters.levels.map(l => `<option value="${l.id}">${l.name_ne}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small">रोजगार प्रकार (Type):</label>
                                    <select class="form-select form-select-sm" id="mf-typ" multiple size="3">
                                        ${masters.employmentTypes.map(t => `<option value="${t.id}">${t.name_ne}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="filterState={}; document.getElementById('multifilter-modal-mount').innerHTML=''; renderEmployeesTab();">सबै हटाउनुहोस्</button>
                            <button type="button" class="btn btn-primary btn-sm" id="btn-apply-mf">फिल्टर लागु गर्नुहोस्</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-apply-mf').addEventListener('click', () => {
            const getVals = (id) => Array.from(document.getElementById(id).selectedOptions).map(o => Number(o.value));
            const dept = getVals('mf-dept');
            const des = getVals('mf-des');
            const lev = getVals('mf-lev');
            const typ = getVals('mf-typ');

            filterState = {};
            if (dept.length > 0) filterState.department_id = dept;
            if (des.length > 0) filterState.designation_id = des;
            if (lev.length > 0) filterState.level_id = lev;
            if (typ.length > 0) filterState.employment_type_id = typ;

            mount.innerHTML = '';
            renderEmployeesTab();
            showToast('फिल्टर लागु भयो।', 'success');
        });
    }

    // CSV Export
    function exportEmployeesToCSV() {
        const list = ePalikaDB.getEmployees(filterState);
        let csv = "\uFEFFक्र.सं.,कर्मचारी कोड,नाम,लिङ्ग,पद,तह,शाखा,कार्यालय,सेवा प्रकार,मोबाईल नं\n";
        list.forEach((e, idx) => {
            csv += `${idx + 1},"${e.employee_code}","${e.full_name_ne}","${e.gender}","${e.designation_name}","${e.level_name}","${e.department_name}","${e.office_name}","${e.employment_type_name}","${e.mobile_number}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `banganga_employees_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        showToast('Excel/CSV फाइल डाउनलोड भयो।', 'success');
    }

    // Toast Notice
    function showToast(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = 'toast-notice';
        div.innerHTML = `<strong>${type==='error'?'त्रुटि':'सूचना'}:</strong> ${msg}`;
        toastMount.appendChild(div);
        setTimeout(() => div.remove(), 3500);
    }
});
