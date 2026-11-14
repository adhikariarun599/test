/**
 * ePalika.com - बाणगंगा नगरपालिका, कपिलवस्तु
 * आन्तरिक नियन्त्रण प्रणाली (Official UI Controller)
 * Full Super Admin Exclusive Role Assignment, Password Management & System Operations
 */

document.addEventListener('DOMContentLoaded', function() {
    let activeTab = 'employees';
    let currentUser = ePalikaDB.getCurrentUser();
    let filterState = {};
    let selectedEmployeeId = null;

    const mainContainer = document.getElementById('main-content-display');
    const toastMount = document.getElementById('toast-mount');
    const loginModalMount = document.getElementById('login-modal-mount');
    const userRoleBadge = document.getElementById('current-user-role-badge');
    const userDisplayName = document.getElementById('current-user-display-name');
    const userCodeDisplay = document.getElementById('current-user-code-display');

    init();

    function init() {
        updateHeaderUserDisplay();
        setupTabs();
        setupLoginBtn();
        renderTab('employees');
    }

    function updateHeaderUserDisplay() {
        currentUser = ePalikaDB.getCurrentUser();
        if (userRoleBadge) {
            userRoleBadge.textContent = currentUser.role || 'Super Admin';
            userRoleBadge.className = currentUser.role === 'Super Admin' ? 'badge bg-danger font-devanagari' : 'badge bg-primary font-devanagari';
        }
        if (userDisplayName) userDisplayName.textContent = currentUser.name || 'प्रणाली प्रशासक';
        if (userCodeDisplay) userCodeDisplay.textContent = `(${currentUser.user_code || 'ADMIN001'})`;
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

    function setupLoginBtn() {
        const btnLogin = document.getElementById('btn-open-login-modal');
        if (btnLogin) {
            btnLogin.addEventListener('click', openLoginModal);
        }

        const btnLogout = document.getElementById('btn-header-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if (confirm('के तपाईं प्रणालीबाट लगआउट गर्न चाहनुहुन्छ?')) {
                    ePalikaDB.logout();
                    showToast('सफलतापूर्वक लगआउट भयो।', 'info');
                    openLoginModal();
                }
            });
        }
    }

    // =========================================================================
    // LOGIN & ACCOUNT SWITCHING MODAL
    // =========================================================================
    function openLoginModal() {
        const users = ePalikaDB.getUsers();

        loginModalMount.innerHTML = `
            <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-navy text-white" style="background: #0f3460;">
                            <h5 class="modal-title font-devanagari text-white">
                                <i class="fa-solid fa-lock me-2"></i> प्रयोगकर्ता लगईन तथा खाता छनोट
                            </h5>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('login-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <!-- Quick Switch Buttons -->
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted mb-2">⚡ १-क्लिक द्रुत लगईन (Quick Switch):</label>
                                <div class="d-flex flex-wrap gap-1">
                                    ${users.map(u => `
                                        <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 btn-quick-login" data-code="${u.user_code}" data-pass="${u.password || 'password123'}">
                                            <strong>${u.user_code}</strong> (${u.role})
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <hr class="my-3">

                            <!-- Standard Username & Password Form -->
                            <form id="login-form">
                                <div class="mb-3">
                                    <label class="form-label fw-bold small text-dark">प्रयोगकर्ता संकेत (Username / User ID):</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-white"><i class="fa-solid fa-user text-muted"></i></span>
                                        <input type="text" id="login-user-code" class="form-control" placeholder="उदा: ADMIN001, CAO001..." value="${currentUser.user_code}" required>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-bold small text-dark">पासवर्ड (Password):</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-white"><i class="fa-solid fa-key text-muted"></i></span>
                                        <input type="password" id="login-password" class="form-control" placeholder="पासवर्ड प्रविष्ट गर्नुहोस्..." value="password123" required>
                                        <button class="btn btn-outline-secondary" type="button" id="btn-toggle-login-pass">
                                            <i class="fa-solid fa-eye"></i>
                                        </button>
                                    </div>
                                    <div class="small text-muted mt-1">पूर्वनिर्धारित पासवर्ड: <code>password123</code></div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100 py-2 fw-bold font-devanagari">
                                    <i class="fa-solid fa-arrow-right-to-bracket me-1"></i> प्रणालीमा लगईन गर्नुहोस्
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-toggle-login-pass').addEventListener('click', function() {
            const input = document.getElementById('login-password');
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fa-solid fa-eye"></i>';
            }
        });

        document.querySelectorAll('.btn-quick-login').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                const pass = this.getAttribute('data-pass');
                document.getElementById('login-user-code').value = code;
                document.getElementById('login-password').value = pass;
                document.getElementById('login-form').dispatchEvent(new Event('submit'));
            });
        });

        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const code = document.getElementById('login-user-code').value.trim();
            const pass = document.getElementById('login-password').value.trim();

            const authed = ePalikaDB.authenticate(code, pass);
            if (authed) {
                currentUser = authed;
                updateHeaderUserDisplay();
                loginModalMount.innerHTML = '';
                showToast(`स्वागत छ! ${authed.name} (${authed.role}) को रूपमा लगईन हुनुभयो।`, 'success');
                renderTab(activeTab);
            } else {
                showToast('प्रयोगकर्ता संकेत वा पासवर्ड मिलेन।', 'error');
            }
        });
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
    // 1. कर्मचारी (EMPLOYEE MANAGEMENT)
    // =========================================================================
    function renderEmployeesTab() {
        const masters = ePalikaDB.getMasters();
        const employees = ePalikaDB.getEmployees(filterState);
        const totalCount = employees.length;

        const emp = selectedEmployeeId ? (ePalikaDB.getEmployeeById(selectedEmployeeId) || {}) : (employees[0] || {});
        const isPublic = currentUser.role === 'Public';

        mainContainer.innerHTML = `
            <div class="alert alert-secondary py-2 px-3 small border d-flex justify-content-between align-items-center mb-3 bg-white">
                <div>
                    <span class="badge bg-primary me-2">कर्मचारी मोड्युल</span>
                    ${isPublic ? 
                        `<strong>सार्वजनिक अवलोकन मोड:</strong> कर्मचारीको वर्गको आधारमा संख्या मात्र हेर्न सकिनेछ।` : 
                        `<strong>भित्री प्रशासनिक मोड:</strong> कार्यालयगत, समूहगत रुपमा फिल्टर गरेर हेर्न र सम्पर्क नम्बरहरु हेर्न सकिनेछ।`
                    }
                </div>
                <div class="small text-muted font-devanagari">
                    Admin ले निम्नानुसार सबै सेटिङ गर्न सक्ने व्यवस्था।
                </div>
            </div>

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

                    <div class="emp-action-bar">
                        <div class="emp-count-text">
                            कर्मचारी संख्या: <span class="badge bg-primary px-2 py-1 fs-6 font-devanagari">${totalCount}</span>
                        </div>

                        <div class="action-buttons-group">
                            <div class="input-group input-group-sm" style="width: 170px;">
                                <input type="text" id="quick-search-box" class="form-control form-control-sm" placeholder="नाम/कोड..." value="${filterState.search || ''}">
                                <button type="button" class="btn btn-ref-search" id="btn-ref-search">Search</button>
                            </div>

                            <button type="button" class="btn-ref btn-ref-multi" id="btn-ref-multifilter">Filterby MultiSelection</button>
                            <button type="button" class="btn-ref btn-ref-excel" id="btn-ref-excel">Excel</button>
                            <button type="button" class="btn-ref btn-ref-new" id="btn-ref-new">New</button>
                            <button type="button" class="btn-ref btn-ref-save" id="btn-ref-save">Save</button>
                            <button type="button" class="btn-ref btn-ref-update" id="btn-ref-update">Update</button>
                            <button type="button" class="btn-ref btn-ref-delete" id="btn-ref-delete">Delete</button>
                            <button type="button" class="btn-ref btn-ref-exit" onclick="window.print()">Exit</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Employee List Table Below -->
            <div class="gov-panel mt-4">
                <div class="gov-panel-header">
                    <span class="gov-panel-title">
                        <i class="fa-solid fa-list me-1"></i> कर्मचारी अभिलेख सूची (तलको कुनै पनि कर्मचारीमा क्लिक गरी माथिको फारममा सम्पादन गर्न सकिन्छ)
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

        const btnShowAll = document.getElementById('btn-show-all-records');
        if (btnShowAll) {
            btnShowAll.addEventListener('click', () => {
                filterState = {};
                renderEmployeesTab();
                showToast('सबै रेकर्डहरू देखाइयो।', 'info');
            });
        }

        document.querySelectorAll('.emp-row-select').forEach(row => {
            row.addEventListener('click', function() {
                selectedEmployeeId = Number(this.getAttribute('data-id'));
                renderEmployeesTab();
            });
        });

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

        const btnMulti = document.getElementById('btn-ref-multifilter');
        if (btnMulti) btnMulti.addEventListener('click', openMultiFilterModal);

        const btnExcel = document.getElementById('btn-ref-excel');
        if (btnExcel) btnExcel.addEventListener('click', exportEmployeesToCSV);

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

        const btnSave = document.getElementById('btn-ref-save');
        if (btnSave) btnSave.addEventListener('click', () => saveOrUpdateEmployee(false));

        const btnUpdate = document.getElementById('btn-ref-update');
        if (btnUpdate) btnUpdate.addEventListener('click', () => saveOrUpdateEmployee(true));

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
    // 2. सेटिङ (SETTINGS) - SUPER ADMIN EXCLUSIVE ROLE & USER MANAGEMENT
    // =========================================================================
    function renderSettingsTab() {
        const users = ePalikaDB.getUsers();
        const employees = ePalikaDB.getEmployees();
        const isSuperAdmin = currentUser.role === 'Super Admin';

        mainContainer.innerHTML = `
            <!-- Top Role Authority Status Banner -->
            <div class="alert ${isSuperAdmin ? 'alert-danger bg-white border-danger' : 'alert-warning bg-white border-warning'} p-3 mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="fw-bold mb-1 font-devanagari ${isSuperAdmin ? 'text-danger' : 'text-dark'}">
                        <i class="fa-solid fa-shield-halved me-2"></i> ${isSuperAdmin ? '👑 Super Admin नियन्त्रण कक्ष: भूमिका (Role) तथा पासवर्ड व्यवस्थापन' : '🔒 सीमित पहुँच: भूमिका परिवर्तन केवल Super Admin ले मात्र गर्न सक्ने'}
                    </h6>
                    <div class="small text-muted">
                        ${isSuperAdmin ? 
                            'कुन कर्मचारीलाई कुन Role (Super Admin, Admin/CAO, Ward User, Employee वा Institution) दिने भन्ने सम्पूर्ण अधिकार Super Admin मा सुरक्षित छ।' :
                            'तपाईं सामान्य प्रशासक/प्रयोगकर्ता हुनुहुन्छ। Role परिवर्तन गर्न Super Admin को रूपमा लगईन हुनुपर्नेछ।'
                        }
                    </div>
                </div>
                <div>
                    <span class="badge ${isSuperAdmin ? 'bg-danger' : 'bg-secondary'} font-devanagari fs-6 me-2">
                        तपाईंको भूमिका: ${currentUser.role}
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-primary fw-bold" onclick="window.openLoginModal();">
                        <i class="fa-solid fa-right-to-bracket me-1"></i> Super Admin लगईन
                    </button>
                </div>
            </div>

            <div class="row g-4">
                <!-- Left: Create User & Assign Role (Form matching PDF Page 1) -->
                <div class="col-lg-5">
                    <div class="settings-diagram-card">
                        <div class="settings-sub-btns">
                            <div class="settings-btn-box active">
                                नयाँ प्रयोगकर्ता / एडमिन थप
                            </div>
                            <div class="settings-btn-box" onclick="alert('पासवर्ड वितरण सूची दायाँपट्टि उपलब्ध छ।');">
                                पासवर्ड वितरण
                            </div>
                            <div class="settings-btn-box" onclick="if(confirm('लगआउट गर्न चाहनुहुन्छ?')) ePalikaDB.logout(); window.openLoginModal();">
                                बाहिर
                            </div>
                        </div>

                        <!-- Form matching PDF Page 1 Diagram Box -->
                        <div class="p-3 border rounded bg-light">
                            <!-- Optional: Select from existing Employee to auto-fill -->
                            <div class="mb-2">
                                <label class="form-label-gov small text-primary fw-bold">कर्मचारी सूचीबाट छनोट गर्नुहोस् (Auto-fill):</label>
                                <select id="s-pick-employee" class="form-field-select form-field-select-sm mb-2">
                                    <option value="">-- नयाँ सिधा नाम टाइप गर्ने वा कर्मचारी छान्ने --</option>
                                    ${employees.map(e => `<option value="${e.id}" data-name="${e.full_name_ne}" data-code="${e.employee_code}" data-phone="${e.mobile_number}">${e.full_name_ne} (${e.employee_code}) - ${e.designation_name}</option>`).join('')}
                                </select>
                            </div>

                            <table class="settings-form-table">
                                <tr>
                                    <td class="form-field-label">नाम:</td>
                                    <td><input type="text" id="s-name" class="form-field-input" placeholder="पूरा नाम..."></td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">प्रयोगकर्ता संकेत:</td>
                                    <td>
                                        <input type="text" id="s-user-code" class="form-field-input fw-bold text-primary" placeholder="User ID (उदा: ADMIN002)...">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">भूमिका (Role):</td>
                                    <td>
                                        <select id="s-role" class="form-field-select fw-bold text-danger" ${!isSuperAdmin ? 'disabled' : ''}>
                                            <option value="Super Admin">Super Admin (सम्पूर्ण प्रणाली नियन्त्रण)</option>
                                            <option value="Admin">Admin (प्रमुख प्रशासकीय अधिकृत - CAO)</option>
                                            <option value="Ward User">Ward User (वडा कार्यालय प्रयोगकर्ता)</option>
                                            <option value="Employee" selected>Employee (कर्मचारी - सामान्य पहुँच)</option>
                                            <option value="Institution User">Institution User (संस्था/सहकारी)</option>
                                        </select>
                                        ${!isSuperAdmin ? `<div class="small text-danger mt-1">🔒 भूमिका छनोट गर्न Super Admin चाहिन्छ।</div>` : ''}
                                    </td>
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
                                            <option value="1">आन्तरिक (Internal Staff)</option>
                                            <option value="0">वाह्य (External Entity)</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="form-field-label">पासवर्ड:</td>
                                    <td>
                                        <div class="input-group input-group-sm">
                                            <input type="text" id="s-password" class="form-control form-control-sm font-monospace" placeholder="पासवर्ड टाइप गर्नुहोस् वा Generate...">
                                            <button class="btn btn-outline-secondary" type="button" id="btn-generate-password-val" title="स्वचालित पासवर्ड">
                                                Generate
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td class="pt-3">
                                        <button type="button" class="btn btn-primary fw-bold px-4 py-2 w-100" id="btn-trigger-password-sms">
                                            <i class="fa-solid fa-key me-1"></i> पासवर्ड वितरण तथा दर्ता (Save & Distribute)
                                        </button>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <div class="mt-3 p-3 bg-white border rounded small">
                            <i class="fa-solid fa-circle-info text-primary me-1"></i>
                            <strong>निर्देशिका (PDF Note):</strong> पासवर्ड मा क्लिक गरिसकेपछि सम्बन्धित मोबाईलमा प्रयोगकर्ता संकेत, पासवर्ड (User ID र Password) पठाइनेछ र प्रयोगकर्ताले तत्काल लगईन गर्न सक्नेछन्।
                        </div>
                    </div>
                </div>

                <!-- Right: Registered Admin & Users List with Super Admin Role Assignment -->
                <div class="col-lg-7">
                    <div class="gov-panel">
                        <div class="gov-panel-header">
                            <span class="gov-panel-title">
                                <i class="fa-solid fa-users text-primary me-2"></i> दर्ता खाताहरू तथा भूमिका (Role) व्यवस्थापन
                            </span>
                            <span class="badge bg-primary font-devanagari">${users.length} खाताहरू</span>
                        </div>
                        <div class="table-responsive">
                            <table class="table-gov">
                                <thead>
                                    <tr>
                                        <th>User ID (Username)</th>
                                        <th>नाम</th>
                                        <th>तोकिएको भूमिका (Assigned Role)</th>
                                        <th>मोबाईल नं</th>
                                        <th>कार्य (Action)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(u => `
                                        <tr>
                                            <td>
                                                <code class="fw-bold fs-6 text-primary">${u.user_code}</code>
                                            </td>
                                            <td class="fw-bold text-dark">${u.name}</td>
                                            <td>
                                                <span class="badge ${u.role === 'Super Admin' ? 'bg-danger' : 'bg-primary-subtle text-primary'} border px-2 py-1">
                                                    ${u.role}
                                                </span>
                                            </td>
                                            <td>${u.mobile_number}</td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <!-- Super Admin Exclusive Role Changer Button -->
                                                    <button class="btn btn-outline-danger btn-sm btn-assign-role" data-id="${u.id}" data-name="${u.name}" data-code="${u.user_code}" data-role="${u.role}" ${!isSuperAdmin ? 'disabled title="केवल Super Admin ले मात्र Role परिवर्तन गर्न सक्छ"' : 'title="भूमिका / Role परिवर्तन गर्नुहोस्"'}>
                                                        <i class="fa-solid fa-user-shield me-1"></i> Role
                                                    </button>

                                                    <!-- Change Password Button -->
                                                    <button class="btn btn-outline-warning btn-sm btn-change-user-pass" data-id="${u.id}" data-name="${u.name}" data-code="${u.user_code}" title="पासवर्ड बदल्नुहोस्">
                                                        <i class="fa-solid fa-key"></i>
                                                    </button>

                                                    <!-- SMS Re-dispatch -->
                                                    <button class="btn btn-outline-success btn-sm btn-resend-pass" data-name="${u.name}" data-code="${u.user_code}" data-phone="${u.mobile_number}" data-pass="${u.password || 'password123'}" title="SMS मार्फत पठाउनुहोस्">
                                                        <i class="fa-solid fa-paper-plane"></i>
                                                    </button>

                                                    ${u.id !== 1 ? `
                                                        <button class="btn btn-outline-danger btn-sm btn-del-user" data-id="${u.id}" data-name="${u.name}" title="मेटाउनुहोस्">
                                                            <i class="fa-solid fa-trash"></i>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Role Assignment Modal Mount -->
            <div id="role-assignment-modal-mount"></div>
        `;

        // Pick Employee Dropdown Auto-Fill
        const pickEmp = document.getElementById('s-pick-employee');
        if (pickEmp) {
            pickEmp.addEventListener('change', function() {
                const opt = this.options[this.selectedIndex];
                if (opt.value) {
                    document.getElementById('s-name').value = opt.getAttribute('data-name');
                    document.getElementById('s-user-code').value = opt.getAttribute('data-code');
                    document.getElementById('s-mobile').value = opt.getAttribute('data-phone');
                    document.getElementById('s-category').value = 'कर्मचारी';
                }
            });
        }

        // Generate password button
        const btnGen = document.getElementById('btn-generate-password-val');
        if (btnGen) {
            btnGen.addEventListener('click', () => {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
                let p = '';
                for (let i = 0; i < 8; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
                document.getElementById('s-password').value = p;
            });
        }

        // Save User & Distribute Password Handler
        document.getElementById('btn-trigger-password-sms').addEventListener('click', () => {
            const name = document.getElementById('s-name').value.trim();
            const code = document.getElementById('s-user-code').value.trim().toUpperCase();
            const role = isSuperAdmin ? document.getElementById('s-role').value : 'Employee';
            const cat = document.getElementById('s-category').value;
            const mobile = document.getElementById('s-mobile').value.trim();
            let pass = document.getElementById('s-password').value.trim();

            if (!name || !code || !mobile) {
                showToast('कृपया नाम, प्रयोगकर्ता संकेत (Username) र मोबाईल नम्बर अनिवार्य भर्नुहोस्।', 'error');
                return;
            }

            if (!pass) {
                pass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
            }

            ePalikaDB.saveUser({
                name: name,
                user_code: code,
                category: cat,
                role: role,
                mobile_number: mobile,
                password: pass,
                is_internal: document.getElementById('s-internal').value === '1'
            });

            showPasswordSMSModal(name, code, mobile, pass);
            renderSettingsTab();
        });

        // Super Admin Exclusive Role Changer Modal Trigger
        document.querySelectorAll('.btn-assign-role').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!isSuperAdmin) {
                    alert('त्रुटि: कुन कर्मचारीलाई कुन Role दिने भनेर सेट गर्ने अधिकार केवल Super Admin लाई मात्र छ।');
                    return;
                }
                const uid = Number(this.getAttribute('data-id'));
                const name = this.getAttribute('data-name');
                const code = this.getAttribute('data-code');
                const currentRoleVal = this.getAttribute('data-role');

                openRoleAssignmentModal(uid, name, code, currentRoleVal);
            });
        });

        // Change Password Button
        document.querySelectorAll('.btn-change-user-pass').forEach(btn => {
            btn.addEventListener('click', function() {
                const uid = Number(this.getAttribute('data-id'));
                const name = this.getAttribute('data-name');
                const code = this.getAttribute('data-code');

                const newPass = prompt(`प्रयोगकर्ता '${name}' (${code}) को लागि नयाँ पासवर्ड प्रविष्ट गर्नुहोस्:`, 'password123');
                if (newPass && newPass.trim()) {
                    ePalikaDB.updateUserPassword(uid, newPass.trim());
                    showToast(`प्रयोगकर्ता '${name}' को नयाँ पासवर्ड सेट भयो!`, 'success');
                    renderSettingsTab();
                }
            });
        });

        // Resend SMS Button
        document.querySelectorAll('.btn-resend-pass').forEach(btn => {
            btn.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                const code = this.getAttribute('data-code');
                const phone = this.getAttribute('data-phone');
                const pass = this.getAttribute('data-pass');
                showPasswordSMSModal(name, code, phone, pass);
            });
        });

        // Delete user button
        document.querySelectorAll('.btn-del-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const uid = Number(this.getAttribute('data-id'));
                const name = this.getAttribute('data-name');
                if (confirm(`के तपाईं प्रयोगकर्ता '${name}' लाई मेटाउन चाहनुहुन्छ?`)) {
                    ePalikaDB.deleteUser(uid);
                    showToast(`प्रयोगकर्ता '${name}' हटाइयो।`, 'success');
                    renderSettingsTab();
                }
            });
        });
    }

    // =========================================================================
    // SUPER ADMIN EXCLUSIVE: ROLE ASSIGNMENT DIALOG
    // =========================================================================
    function openRoleAssignmentModal(uid, name, code, currentRoleVal) {
        const mount = document.getElementById('role-assignment-modal-mount');
        const wards = ePalikaDB.getWards();

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title font-devanagari text-white">
                                <i class="fa-solid fa-shield-halved me-2"></i> भूमिका (Role) तोक्ने प्यानल — Super Admin मात्र
                            </h5>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('role-assignment-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <div class="p-3 bg-white border rounded mb-3">
                                <div><strong>कर्मचारी / प्रयोगकर्ता:</strong> <span class="text-primary fw-bold">${name}</span></div>
                                <div><strong>प्रयोगकर्ता संकेत (User ID):</strong> <code>${code}</code></div>
                                <div><strong>हालको भूमिका:</strong> <span class="badge bg-secondary">${currentRoleVal}</span></div>
                            </div>

                            <form id="role-change-form">
                                <div class="mb-3">
                                    <label class="form-label fw-bold text-dark font-devanagari">नयाँ भूमिका (New Role) छनोट गर्नुहोस्:</label>
                                    <select id="modal-select-role" class="form-select form-select-lg fw-bold text-danger border-danger">
                                        <option value="Super Admin" ${currentRoleVal === 'Super Admin' ? 'selected' : ''}>👑 Super Admin (सुपर एडमिन - सम्पूर्ण प्रणाली नियन्त्रण)</option>
                                        <option value="Admin" ${currentRoleVal === 'Admin' ? 'selected' : ''}>🏛️ Admin (प्रशासक - CAO / कर्मचारी तथा पालिका व्यवस्थापन)</option>
                                        <option value="Ward User" ${currentRoleVal === 'Ward User' ? 'selected' : ''}>📍 Ward User (वडा प्रयोगकर्ता - सम्बन्धित वडा मात्र)</option>
                                        <option value="Employee" ${currentRoleVal === 'Employee' ? 'selected' : ''}>👤 Employee (कर्मचारी - सामान्य शाखा पहुँच)</option>
                                        <option value="Institution User" ${currentRoleVal === 'Institution User' ? 'selected' : ''}>🌾 Institution User (सहकारी/खानेपानी/वन/संस्था)</option>
                                    </select>
                                </div>

                                <div class="mb-3" id="ward-assign-box" style="display: ${currentRoleVal === 'Ward User' ? 'block' : 'none'};">
                                    <label class="form-label fw-bold text-dark small">कुन वडा कार्यालयको अधिकार दिने?</label>
                                    <select id="modal-select-ward" class="form-select form-select-sm">
                                        ${wards.map(w => `<option value="${w.id}">वडा नं. ${w.ward_number} - ${w.office_name_ne}</option>`).join('')}
                                    </select>
                                </div>

                                <div class="alert alert-warning py-2 small mb-0 font-devanagari">
                                    <i class="fa-solid fa-triangle-exclamation me-1"></i> यो परिवर्तनपछि उक्त कर्मचारीले तोकिएको भूमिका अनुसारका मेनु र अधिकार मात्र प्रयोग गर्न पाउनेछन्।
                                </div>

                                <div class="mt-4 d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('role-assignment-modal-mount').innerHTML='';">रद्द गर्नुहोस्</button>
                                    <button type="submit" class="btn btn-danger btn-sm fw-bold px-3">
                                        <i class="fa-solid fa-check me-1"></i> भूमिका सुरक्षित गर्नुहोस्
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const roleSelect = document.getElementById('modal-select-role');
        const wardBox = document.getElementById('ward-assign-box');
        roleSelect.addEventListener('change', function() {
            wardBox.style.display = this.value === 'Ward User' ? 'block' : 'none';
        });

        document.getElementById('role-change-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const newRole = document.getElementById('modal-select-role').value;
            const wardId = newRole === 'Ward User' ? Number(document.getElementById('modal-select-ward').value) : null;

            ePalikaDB.updateUserRole(uid, newRole, wardId);
            mount.innerHTML = '';
            showToast(`कर्मचारी '${name}' को भूमिका '${newRole}' मा सफलतापूर्वक परिवर्तन भयो!`, 'success');
            updateHeaderUserDisplay();
            renderSettingsTab();
        });
    }

    function showPasswordSMSModal(name, code, phone, pass) {
        const mount = document.getElementById('master-quick-modal-mount');
        mount.innerHTML = `
            <div class="modal fade show d-block" style="background:rgba(0,0,0,0.6);" tabindex="-1">
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
                                <div class="mb-2"><strong>प्रयोगकर्ता संकेत (Username):</strong> <code class="fs-6 text-primary">${code}</code></div>
                                <div><strong>पासवर्ड (Password):</strong> <code class="fs-6 text-danger">${pass}</code></div>
                            </div>

                            <p class="small text-muted mb-3">
                                📱 सम्बन्धित मोबाईल नम्बरमा User ID र Password को SMS पठाइएको छ।
                            </p>

                            <button class="btn btn-outline-primary btn-sm w-100" onclick="document.getElementById('master-quick-modal-mount').innerHTML=''; window.openLoginModal();">
                                <i class="fa-solid fa-right-to-bracket me-1"></i> यो खाताबाट तुरुन्त लगईन गर्नुहोस्
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('master-quick-modal-mount').innerHTML='';">बन्द गर्नुहोस्</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 3. पालिका प्रोफाइल (PALIKA PROFILE)
    // =========================================================================
    function renderPalikaProfileTab() {
        const mun = ePalikaDB.getMunicipality();

        mainContainer.innerHTML = `
            <div class="gov-panel p-4 mb-4 bg-white text-center">
                <div class="brand-epalika mb-2">ePalika.com</div>
                <h2 class="fw-bold text-navy font-devanagari mb-1">${mun.name_ne}</h2>
                <div class="text-muted mb-2">${mun.address_ne}, ${mun.district_ne} | ${mun.province_ne}</div>
                <p class="text-secondary max-w-700 mx-auto small p-3 bg-light rounded">${mun.profile_summary}</p>
            </div>

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

    // Quick Master Dropdown Modal
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
                        <div class="modal-header bg-navy text-white" style="background:#0f3460;">
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

    function showToast(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = 'toast-notice';
        div.innerHTML = `<strong>${type==='error'?'त्रुटि':'सूचना'}:</strong> ${msg}`;
        toastMount.appendChild(div);
        setTimeout(() => div.remove(), 3500);
    }

    window.openLoginModal = openLoginModal;
});
