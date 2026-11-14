/**
 * ePalika.com - Application Controller & User Interface Logic
 * बाणगंगा नगरपालिका, कपिलवस्तु - आन्तरिक नियन्त्रण प्रणाली
 */

document.addEventListener('DOMContentLoaded', function() {
    // Current Active User & Role
    let currentUser = {
        name: 'प्रणाली प्रशासक',
        user_code: 'ADMIN001',
        role: 'Super Admin',
        role_id: 1,
        ward_id: null
    };

    let currentModule = 'dashboard';
    let currentFilterState = {};
    let editingEmployeeId = null;
    let editingInstitutionId = null;

    // UI Elements
    const contentArea = document.getElementById('main-content-area');
    const pageTitleElem = document.getElementById('page-title-text');
    const toastContainer = document.getElementById('toast-container');
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('main-wrapper');
    const currentRoleBadge = document.getElementById('current-role-badge');
    const currentUserName = document.getElementById('current-user-name');

    // Initialize App
    init();

    function init() {
        setupSidebarToggle();
        setupNavigation();
        setupRoleSwitcher();
        renderModule('dashboard');
    }

    // -------------------------------------------------------------------------
    // Sidebar & Navigation
    // -------------------------------------------------------------------------
    function setupSidebarToggle() {
        const toggleBtn = document.getElementById('btn-toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    sidebar.classList.toggle('mobile-open');
                } else {
                    sidebar.classList.toggle('collapsed');
                    mainWrapper.classList.toggle('expanded');
                }
            });
        }
    }

    function setupNavigation() {
        document.querySelectorAll('.nav-link-custom[data-module]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const module = this.getAttribute('data-module');
                document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                if (window.innerWidth < 992) {
                    sidebar.classList.remove('mobile-open');
                }
                renderModule(module);
            });
        });
    }

    function setupRoleSwitcher() {
        const select = document.getElementById('role-switcher-select');
        if (select) {
            select.addEventListener('change', function() {
                const val = this.value;
                const users = ePalikaDB.getUsers();
                const matched = users.find(u => u.role === val) || users[0];
                currentUser = matched;
                currentRoleBadge.textContent = currentUser.role;
                currentUserName.textContent = currentUser.name;
                showToast(`भूमिका परिवर्तन भयो: ${currentUser.role}`, 'success');
                enforceRolePermissions();
                renderModule(currentModule);
            });
        }
    }

    function enforceRolePermissions() {
        // Hide or show sidebar items based on current role
        const role = currentUser.role;
        document.querySelectorAll('[data-module]').forEach(el => {
            const mod = el.getAttribute('data-module');
            if (role === 'Ward User') {
                if (['municipality', 'settings', 'users', 'audit'].includes(mod)) {
                    el.closest('.nav-item').style.display = 'none';
                } else {
                    el.closest('.nav-item').style.display = 'block';
                }
            } else if (role === 'Institution User') {
                if (['municipality', 'settings', 'users', 'audit', 'wards'].includes(mod)) {
                    el.closest('.nav-item').style.display = 'none';
                } else {
                    el.closest('.nav-item').style.display = 'block';
                }
            } else {
                el.closest('.nav-item').style.display = 'block';
            }
        });
    }

    // -------------------------------------------------------------------------
    // Main Module Router
    // -------------------------------------------------------------------------
    function renderModule(module) {
        currentModule = module;
        window.scrollTo(0, 0);

        switch(module) {
            case 'dashboard':
                pageTitleElem.textContent = 'प्रशासनिक ड्यासबोर्ड (Dashboard Overview)';
                renderDashboard();
                break;
            case 'employees':
                pageTitleElem.textContent = 'कर्मचारी प्रशासन तथा अभिलेख व्यवस्थापन (Employee Management)';
                renderEmployees();
                break;
            case 'municipality':
                pageTitleElem.textContent = 'पालिका प्रोफाइल तथा पहिचान (Municipality Profile)';
                renderMunicipality();
                break;
            case 'wards':
                pageTitleElem.textContent = 'वडा कार्यालय व्यवस्थापन (Ward Offices)';
                renderWards();
                break;
            case 'cooperative':
                pageTitleElem.textContent = 'सहकारी संस्था व्यवस्थापन (Cooperatives)';
                renderInstitutions('cooperative', 'सहकारी');
                break;
            case 'drinking_water':
                pageTitleElem.textContent = 'खानेपानी उपभोक्ता समिति (Drinking Water)';
                renderInstitutions('drinking_water', 'खानेपानी');
                break;
            case 'forest':
                pageTitleElem.textContent = 'सामुदायिक वन उपभोक्ता समूह (Community Forest)';
                renderInstitutions('forest', 'सामुदायिक वन');
                break;
            case 'organization':
                pageTitleElem.textContent = 'गैरसरकारी संघसंस्था व्यवस्थापन (Organizations / NGOs)';
                renderInstitutions('organization', 'संघसंस्था');
                break;
            case 'settings':
                pageTitleElem.textContent = 'मास्टर सेटिङ (Master Dropdown Management)';
                renderMasterSettings();
                break;
            case 'users':
                pageTitleElem.textContent = 'प्रयोगकर्ता तथा पासवर्ड वितरण (User Auth & Password)';
                renderUserPasswordDistribution();
                break;
            case 'reports':
                pageTitleElem.textContent = 'प्रतिवेदन तथा तथ्याङ्क विश्लेषण (Reports & Analytics)';
                renderReports();
                break;
            case 'audit':
                pageTitleElem.textContent = 'प्रणाली अडिट लग (System Audit Trail)';
                renderAuditLogs();
                break;
            default:
                renderDashboard();
        }
    }

    // -------------------------------------------------------------------------
    // 1. DASHBOARD MODULE
    // -------------------------------------------------------------------------
    function renderDashboard() {
        const mun = ePalikaDB.getMunicipality();
        const employees = ePalikaDB.getEmployees();
        const wards = ePalikaDB.getWards();
        const institutions = ePalikaDB.getInstitutions();
        const masters = ePalikaDB.getMasters();
        const auditLogs = ePalikaDB.getAuditLogs();

        const totalEmp = employees.length;
        const permanentEmp = employees.filter(e => e.employment_type_name === 'स्थायी').length;
        const contractEmp = employees.filter(e => e.employment_type_name === 'करार').length;
        const wageEmp = employees.filter(e => e.employment_type_name === 'ज्यालादारी').length;
        const maleEmp = employees.filter(e => e.gender === 'पुरुष').length;
        const femaleEmp = employees.filter(e => e.gender === 'महिला').length;

        // Group by department
        const deptCounts = {};
        employees.forEach(e => {
            const d = e.department_name || 'अन्य';
            deptCounts[d] = (deptCounts[d] || 0) + 1;
        });

        // Group by designation
        const desCounts = {};
        employees.forEach(e => {
            const des = e.designation_name || 'अन्य';
            desCounts[des] = (desCounts[des] || 0) + 1;
        });

        contentArea.innerHTML = `
            <!-- Top Alert Badge -->
            <div class="alert alert-primary bg-white border border-primary-subtle shadow-sm d-flex align-items-center justify-content-between mb-4 py-2 px-3">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary px-2 py-1">सूचना</span>
                    <span class="text-dark fw-medium font-devanagari">
                        <strong>${mun.name_ne}</strong> - आन्तरिक नियन्त्रण तथा कर्मचारी प्रशासन प्रणालीमा स्वागत छ।
                    </span>
                </div>
                <div class="text-muted small">
                    <i class="fa-regular fa-calendar-check me-1"></i> मिति: २०८३ वैशाख २८ गते
                </div>
            </div>

            <!-- KPI Cards Row -->
            <div class="row g-3 mb-4">
                <div class="col-xl-3 col-md-6">
                    <div class="stat-card blue">
                        <div>
                            <div class="stat-value font-devanagari">${totalEmp}</div>
                            <div class="stat-label">जम्मा कर्मचारी (Total Staff)</div>
                        </div>
                        <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stat-card green">
                        <div>
                            <div class="stat-value font-devanagari">${permanentEmp}</div>
                            <div class="stat-label">स्थायी कर्मचारी (Permanent)</div>
                        </div>
                        <div class="stat-icon"><i class="fa-solid fa-user-check"></i></div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stat-card amber">
                        <div>
                            <div class="stat-value font-devanagari">${contractEmp}</div>
                            <div class="stat-label">करार कर्मचारी (Contract)</div>
                        </div>
                        <div class="stat-icon"><i class="fa-solid fa-file-signature"></i></div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stat-card purple">
                        <div>
                            <div class="stat-value font-devanagari">${wards.length}</div>
                            <div class="stat-label">वडा कार्यालयहरू (Total Wards)</div>
                        </div>
                        <div class="stat-icon"><i class="fa-solid fa-landmark"></i></div>
                    </div>
                </div>
            </div>

            <!-- Second Stats Row -->
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card-custom h-100">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom"><i class="fa-solid fa-venus-mars text-primary"></i> लैङ्गिक तथ्याङ्क (Gender Ratio)</h5>
                        </div>
                        <div class="card-body-custom">
                            <div class="d-flex align-items-center justify-content-around mb-3">
                                <div class="text-center">
                                    <div class="display-6 fw-bold text-primary font-devanagari">${maleEmp}</div>
                                    <div class="text-muted small fw-semibold">पुरुष (Male)</div>
                                </div>
                                <div class="vr"></div>
                                <div class="text-center">
                                    <div class="display-6 fw-bold text-danger font-devanagari">${femaleEmp}</div>
                                    <div class="text-muted small fw-semibold">महिला (Female)</div>
                                </div>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: ${(maleEmp/totalEmp*100)||50}%"></div>
                                <div class="progress-bar bg-danger" role="progressbar" style="width: ${(femaleEmp/totalEmp*100)||50}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card-custom h-100">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom"><i class="fa-solid fa-building-flag text-teal"></i> दर्ता संस्थाहरू (Registered Entities)</h5>
                        </div>
                        <div class="card-body-custom">
                            <ul class="list-group list-group-flush small">
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>सहकारी संस्था</span>
                                    <span class="badge bg-primary-subtle text-primary rounded-pill font-devanagari">${institutions.filter(i=>i.category==='cooperative').length}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>खानेपानी उपभोक्ता</span>
                                    <span class="badge bg-info-subtle text-info rounded-pill font-devanagari">${institutions.filter(i=>i.category==='drinking_water').length}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>सामुदायिक वन</span>
                                    <span class="badge bg-success-subtle text-success rounded-pill font-devanagari">${institutions.filter(i=>i.category==='forest').length}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>संघसंस्था / गैरसरकारी</span>
                                    <span class="badge bg-warning-subtle text-warning rounded-pill font-devanagari">${institutions.filter(i=>i.category==='organization').length}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card-custom h-100">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom"><i class="fa-solid fa-clock-rotate-left text-secondary"></i> हालैका गतिविधि (Recent Activity)</h5>
                        </div>
                        <div class="card-body-custom p-2">
                            <div class="list-group list-group-flush small">
                                ${auditLogs.slice(0, 4).map(log => `
                                    <div class="list-group-item px-2 py-2">
                                        <div class="fw-semibold text-dark">${log.details}</div>
                                        <div class="text-muted" style="font-size:0.75rem;"><i class="fa-regular fa-clock"></i> ${log.timestamp}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Employees Table Card -->
            <div class="card-custom">
                <div class="card-header-custom">
                    <h5 class="card-title-custom"><i class="fa-solid fa-address-book text-primary"></i> हालसालै थपिएका कर्मचारीहरू (Recently Added Employees)</h5>
                    <button class="btn btn-sm btn-gov-primary" onclick="window.navigateToModule('employees')">
                        सबै कर्मचारी हेर्नुहोस् <i class="fa-solid fa-arrow-right ms-1"></i>
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th>कोड</th>
                                <th>कर्मचारीको नाम</th>
                                <th>पद</th>
                                <th>तह</th>
                                <th>शाखा/विभाग</th>
                                <th>प्रकार</th>
                                <th>मोबाईल नं</th>
                                <th>स्थिति</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.slice(0, 5).map(e => `
                                <tr>
                                    <td><span class="badge bg-light text-dark border font-devanagari">${e.employee_code}</span></td>
                                    <td class="fw-semibold text-dark">${e.full_name_ne}</td>
                                    <td>${e.designation_name}</td>
                                    <td>${e.level_name}</td>
                                    <td>${e.department_name}</td>
                                    <td>
                                        <span class="badge-status ${e.employment_type_name === 'स्थायी' ? 'permanent' : 'contract'}">
                                            ${e.employment_type_name}
                                        </span>
                                    </td>
                                    <td>${e.mobile_number}</td>
                                    <td><span class="badge-status active">कार्यरत</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // 2. EMPLOYEE MANAGEMENT MODULE (Exact match to reference PDF)
    // -------------------------------------------------------------------------
    function renderEmployees() {
        const employees = ePalikaDB.getEmployees(currentFilterState);
        const masters = ePalikaDB.getMasters();

        contentArea.innerHTML = `
            <!-- Reference Action Toolbar (Match PDF: Show All Records, Search, Filterby MultiSelection, Excel, New, Save, Update, Delete, Exit) -->
            <div class="reference-toolbar">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold text-dark font-devanagari">
                        <i class="fa-solid fa-users me-1 text-primary"></i> कर्मचारी संख्या: 
                        <span class="badge bg-primary px-2 py-1 ms-1 font-devanagari fs-6" id="emp-count-badge">${employees.length}</span>
                    </span>
                    <button class="btn btn-sm btn-gov-secondary ms-2" id="btn-show-all">
                        <i class="fa-solid fa-rotate"></i> Show All Records
                    </button>
                </div>

                <div class="btn-group-actions">
                    <!-- Search input -->
                    <div class="input-group input-group-sm" style="width: 220px;">
                        <input type="text" id="emp-search-input" class="form-control" placeholder="नाम / कोड / सम्पर्क..." value="${currentFilterState.search || ''}">
                        <button class="btn btn-gov-primary" id="btn-search-trigger">
                            <i class="fa-solid fa-search"></i> Search
                        </button>
                    </div>

                    <button class="btn btn-gov-secondary" id="btn-open-multifilter">
                        <i class="fa-solid fa-filter"></i> Filterby MultiSelection
                    </button>

                    <button class="btn btn-gov-excel" id="btn-export-excel">
                        <i class="fa-solid fa-file-excel"></i> Excel
                    </button>

                    <button class="btn btn-gov-print" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> Print
                    </button>

                    <button class="btn btn-gov-primary" id="btn-new-employee">
                        <i class="fa-solid fa-plus"></i> New (नयाँ थप)
                    </button>
                </div>
            </div>

            <!-- Active Filter Badges (if any applied) -->
            ${Object.keys(currentFilterState).length > 0 ? `
                <div class="d-flex align-items-center gap-2 mb-3 p-2 bg-light border rounded">
                    <span class="small fw-bold text-muted">सक्रिय फिल्टर:</span>
                    ${currentFilterState.search ? `<span class="badge bg-secondary">खोज: ${currentFilterState.search}</span>` : ''}
                    ${currentFilterState.department_id ? `<span class="badge bg-info text-dark">शाखा फिल्टर सक्रिय</span>` : ''}
                    ${currentFilterState.designation_id ? `<span class="badge bg-info text-dark">पद फिल्टर सक्रिय</span>` : ''}
                    ${currentFilterState.employment_type_id ? `<span class="badge bg-info text-dark">सेवा प्रकार सक्रिय</span>` : ''}
                    <button class="btn btn-link btn-sm text-danger p-0 ms-auto text-decoration-none" id="btn-clear-filters">
                        <i class="fa-solid fa-times"></i> सबै फिल्टर हटाउनुहोस्
                    </button>
                </div>
            ` : ''}

            <!-- Employee List Table -->
            <div class="table-wrapper mb-4">
                <div class="table-responsive">
                    <table class="table table-custom align-middle">
                        <thead>
                            <tr>
                                <th>क्र.सं.</th>
                                <th>कोड</th>
                                <th>कर्मचारीको नाम</th>
                                <th>लिङ्ग</th>
                                <th>पद</th>
                                <th>तह</th>
                                <th>शाखा/विभाग</th>
                                <th>कार्यालय</th>
                                <th>प्रकार</th>
                                <th>मोबाईल नं</th>
                                <th class="text-center no-print">कार्य (Actions)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.length === 0 ? `
                                <tr>
                                    <td colspan="11" class="text-center py-5 text-muted">
                                        <i class="fa-solid fa-folder-open fs-1 mb-2 d-block text-secondary opacity-50"></i>
                                        कुनै कर्मचारी फेला परेन।
                                    </td>
                                </tr>
                            ` : employees.map((emp, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><span class="badge bg-light text-dark border font-devanagari">${emp.employee_code}</span></td>
                                    <td class="fw-bold text-dark">
                                        <a href="#" class="text-decoration-none text-dark hover-primary btn-view-emp" data-id="${emp.id}">
                                            ${emp.full_name_ne}
                                        </a>
                                    </td>
                                    <td>${emp.gender}</td>
                                    <td>${emp.designation_name}</td>
                                    <td>${emp.level_name}</td>
                                    <td>${emp.department_name}</td>
                                    <td>${emp.office_name}</td>
                                    <td>
                                        <span class="badge-status ${emp.employment_type_name === 'स्थायी' ? 'permanent' : 'contract'}">
                                            ${emp.employment_type_name}
                                        </span>
                                    </td>
                                    <td>${emp.mobile_number}</td>
                                    <td class="text-center no-print">
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary btn-sm btn-view-emp" data-id="${emp.id}" title="विवरण हेर्नुहोस्">
                                                <i class="fa-solid fa-eye"></i>
                                            </button>
                                            <button class="btn btn-outline-warning btn-sm btn-edit-emp" data-id="${emp.id}" title="सम्पादन">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm btn-delete-emp" data-id="${emp.id}" data-name="${emp.full_name_ne}" title="हटाउनुहोस्">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Multi-Selection Filter Modal Container (Injected via JS) -->
            <div id="filter-modal-mount"></div>
            <!-- Employee Form Modal Container -->
            <div id="employee-modal-mount"></div>
            <!-- Employee Profile View Modal Container -->
            <div id="employee-profile-mount"></div>
        `;

        attachEmployeeEvents();
    }

    function attachEmployeeEvents() {
        // Show All Records
        const btnShowAll = document.getElementById('btn-show-all');
        if (btnShowAll) {
            btnShowAll.addEventListener('click', () => {
                currentFilterState = {};
                renderEmployees();
                showToast('सबै रेकर्डहरू देखाइयो।', 'info');
            });
        }

        // Search Trigger
        const btnSearch = document.getElementById('btn-search-trigger');
        const inputSearch = document.getElementById('emp-search-input');
        if (btnSearch && inputSearch) {
            const doSearch = () => {
                currentFilterState.search = inputSearch.value.trim();
                renderEmployees();
            };
            btnSearch.addEventListener('click', doSearch);
            inputSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') doSearch();
            });
        }

        // Clear Filters
        const btnClear = document.getElementById('btn-clear-filters');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                currentFilterState = {};
                renderEmployees();
            });
        }

        // MultiSelection Filter Modal
        const btnMulti = document.getElementById('btn-open-multifilter');
        if (btnMulti) {
            btnMulti.addEventListener('click', openMultiFilterModal);
        }

        // Excel Export
        const btnExcel = document.getElementById('btn-export-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', exportEmployeesToCSV);
        }

        // New Employee Form Modal
        const btnNew = document.getElementById('btn-new-employee');
        if (btnNew) {
            btnNew.addEventListener('click', () => openEmployeeFormModal(null));
        }

        // Edit Employee
        document.querySelectorAll('.btn-edit-emp').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                openEmployeeFormModal(id);
            });
        });

        // View Employee Profile
        document.querySelectorAll('.btn-view-emp').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                openEmployeeProfileModal(id);
            });
        });

        // Delete Employee
        document.querySelectorAll('.btn-delete-emp').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                if (confirm(`के तपाईं निश्चित हुनुहुन्छ? कर्मचारी '${name}' लाई मेटाउन चाहनुहुन्छ?`)) {
                    ePalikaDB.deleteEmployee(id);
                    showToast(`कर्मचारी '${name}' हटाइयो।`, 'success');
                    renderEmployees();
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // Multi-Selection Filter Modal (Exact match to Reference requirement)
    // -------------------------------------------------------------------------
    function openMultiFilterModal() {
        const masters = ePalikaDB.getMasters();
        const mount = document.getElementById('filter-modal-mount');

        mount.innerHTML = `
            <div class="modal fade show d-block" id="multiFilterModal" style="background: rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content shadow-lg border-0">
                        <div class="modal-header bg-navy text-white" style="background: var(--primary-navy);">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-filter me-2"></i> Filterby MultiSelection (बहु-मापदण्ड फिल्टर)</h5>
                            <button type="button" class="btn-close btn-close-white" id="btn-close-filter"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="multi-filter-form">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label-gov">शाखा / विभाग (Departments)</label>
                                        <select class="form-select form-select-sm" id="filter-departments" multiple size="4">
                                            ${masters.departments.map(d => `
                                                <option value="${d.id}" ${(currentFilterState.department_id || []).includes(d.id) ? 'selected' : ''}>${d.name_ne}</option>
                                            `).join('')}
                                        </select>
                                        <div class="text-muted small">Ctrl दबाएर बहु छनोट गर्न सक्नुहुन्छ</div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">पद (Designations)</label>
                                        <select class="form-select form-select-sm" id="filter-designations" multiple size="4">
                                            ${masters.designations.map(d => `
                                                <option value="${d.id}" ${(currentFilterState.designation_id || []).includes(d.id) ? 'selected' : ''}>${d.name_ne}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label-gov">तह (Level)</label>
                                        <select class="form-select form-select-sm" id="filter-levels" multiple size="3">
                                            ${masters.levels.map(l => `
                                                <option value="${l.id}" ${(currentFilterState.level_id || []).includes(l.id) ? 'selected' : ''}>${l.name_ne}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label-gov">कार्यालय (Office)</label>
                                        <select class="form-select form-select-sm" id="filter-offices" multiple size="3">
                                            ${masters.offices.map(o => `
                                                <option value="${o.id}" ${(currentFilterState.office_id || []).includes(o.id) ? 'selected' : ''}>${o.name_ne}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label-gov">रोजगार प्रकार (Employment Type)</label>
                                        <select class="form-select form-select-sm" id="filter-types" multiple size="3">
                                            ${masters.employmentTypes.map(t => `
                                                <option value="${t.id}" ${(currentFilterState.employment_type_id || []).includes(t.id) ? 'selected' : ''}>${t.name_ne}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">लिङ्ग (Gender)</label>
                                        <select class="form-select form-select-sm" id="filter-gender">
                                            <option value="">सबै (All)</option>
                                            <option value="पुरुष" ${currentFilterState.gender === 'पुरुष' ? 'selected' : ''}>पुरुष</option>
                                            <option value="महिला" ${currentFilterState.gender === 'महिला' ? 'selected' : ''}>महिला</option>
                                            <option value="अन्य" ${currentFilterState.gender === 'अन्य' ? 'selected' : ''}>अन्य</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-gov-secondary" id="btn-reset-filter-modal">रिसेट गर्नुहोस्</button>
                            <button type="button" class="btn btn-gov-primary" id="btn-apply-filter-modal">फिल्टर लागु गर्नुहोस्</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-close-filter').addEventListener('click', () => { mount.innerHTML = ''; });
        document.getElementById('btn-reset-filter-modal').addEventListener('click', () => {
            currentFilterState = {};
            mount.innerHTML = '';
            renderEmployees();
        });
        document.getElementById('btn-apply-filter-modal').addEventListener('click', () => {
            const getSelected = (id) => Array.from(document.getElementById(id).selectedOptions).map(o => Number(o.value));
            
            const dept = getSelected('filter-departments');
            const des = getSelected('filter-designations');
            const lev = getSelected('filter-levels');
            const off = getSelected('filter-offices');
            const typ = getSelected('filter-types');
            const gen = document.getElementById('filter-gender').value;

            currentFilterState = {};
            if (dept.length > 0) currentFilterState.department_id = dept;
            if (des.length > 0) currentFilterState.designation_id = des;
            if (lev.length > 0) currentFilterState.level_id = lev;
            if (off.length > 0) currentFilterState.office_id = off;
            if (typ.length > 0) currentFilterState.employment_type_id = typ;
            if (gen) currentFilterState.gender = gen;

            mount.innerHTML = '';
            renderEmployees();
            showToast('फिल्टर लागु भयो।', 'success');
        });
    }

    // -------------------------------------------------------------------------
    // Complete 32-Fields Employee Registration & Edit Form (Matching Reference Screenshot)
    // -------------------------------------------------------------------------
    function openEmployeeFormModal(empId = null) {
        editingEmployeeId = empId;
        const masters = ePalikaDB.getMasters();
        const wards = ePalikaDB.getWards();
        const emp = empId ? ePalikaDB.getEmployeeById(empId) : {
            employee_code: 'EMP-' + String(Math.floor(100 + Math.random() * 900)),
            serial_number: '',
            full_name_ne: '',
            gender: 'पुरुष',
            dob: '',
            age: '',
            position_code_id: 1,
            designation_id: 1,
            level_id: 4,
            service_id: 3,
            group_id: 1,
            qualification_id: 3,
            department_id: 11,
            office_id: 1,
            ward_id: '',
            employment_type_id: 1,
            service_type_id: 1,
            staff_quota: 'स्वीकृत',
            duty_status: 'कार्यरत',
            email: '',
            mobile_number: '',
            family_contact_number: '',
            permanent_address: '',
            current_address: '',
            transferred_from_office: '',
            initial_appointment_date: '',
            current_position_appointment_date: '',
            current_position_joining_date: '',
            current_office_joining_date: '',
            transfer_release_date: '',
            personnel_sheet_roll_no: '',
            provident_fund_no: '',
            cit_insurance_no: '',
            investment_fund_no: ''
        };

        const mount = document.getElementById('employee-modal-mount');

        mount.innerHTML = `
            <div class="modal fade show d-block" id="employeeFormModal" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content shadow-lg border-0">
                        <div class="modal-header text-white" style="background: var(--primary-navy);">
                            <h5 class="modal-title font-devanagari text-white">
                                <i class="fa-solid fa-id-card me-2"></i> ${empId ? 'कर्मचारी विवरण सम्पादन (Edit Employee)' : 'नयाँ कर्मचारी दर्ता फारम (Employee Registration Form)'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" id="btn-close-emp-modal"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <form id="employee-full-form">
                                <!-- Section 1: Basic & Personal Info -->
                                <div class="card-custom p-3 mb-3">
                                    <div class="form-section-title">
                                        <i class="fa-solid fa-user text-primary"></i> व्यक्तिगत तथा आधारभूत विवरण (Basic Details)
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-3">
                                            <label class="form-label-gov required">कर्मचारीको कोड:</label>
                                            <input type="text" id="f-emp-code" class="form-control-gov fw-bold" value="${emp.employee_code || ''}" required>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label-gov">क्र.सं.:</label>
                                            <input type="text" id="f-serial-no" class="form-control-gov" value="${emp.serial_number || ''}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label-gov required">कर्मचारीको नाम:</label>
                                            <input type="text" id="f-name-ne" class="form-control-gov fw-bold text-primary" value="${emp.full_name_ne || ''}" placeholder="नेपाली युनिकोडमा नाम..." required>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov required">लिङ्ग:</label>
                                            <select id="f-gender" class="form-select-gov">
                                                <option value="पुरुष" ${emp.gender === 'पुरुष' ? 'selected' : ''}>पुरुष (Male)</option>
                                                <option value="महिला" ${emp.gender === 'महिला' ? 'selected' : ''}>महिला (Female)</option>
                                                <option value="अन्य" ${emp.gender === 'अन्य' ? 'selected' : ''}>अन्य (Other)</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">जन्म मिति (DOB):</label>
                                            <input type="date" id="f-dob" class="form-control-gov" value="${emp.dob || ''}">
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label-gov">उमेर (Age):</label>
                                            <input type="number" id="f-age" class="form-control-gov bg-light" value="${emp.age || ''}" readonly placeholder="गणना...">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label-gov">शैक्षिक योग्यता:</label>
                                            <select id="f-qualification" class="form-select-gov">
                                                ${masters.qualifications.map(q => `
                                                    <option value="${q.id}" ${emp.qualification_id == q.id ? 'selected' : ''}>${q.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">कर्मचारी संकेत नं:</label>
                                            <input type="text" id="f-sheet-roll" class="form-control-gov" value="${emp.personnel_sheet_roll_no || ''}" placeholder="Sheet Roll No">
                                        </div>
                                    </div>
                                </div>

                                <!-- Section 2: Professional & Office Info -->
                                <div class="card-custom p-3 mb-3">
                                    <div class="form-section-title">
                                        <i class="fa-solid fa-briefcase text-primary"></i> पेशागत तथा पदस्थापन विवरण (Professional & Posting)
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label-gov required">पद (Designation):</label>
                                            <select id="f-designation" class="form-select-gov">
                                                ${masters.designations.map(d => `
                                                    <option value="${d.id}" ${emp.designation_id == d.id ? 'selected' : ''}>${d.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">तह (Level):</label>
                                            <select id="f-level" class="form-select-gov">
                                                ${masters.levels.map(l => `
                                                    <option value="${l.id}" ${emp.level_id == l.id ? 'selected' : ''}>${l.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-5">
                                            <label class="form-label-gov required">शाखा / विभाग (Branch/Dept):</label>
                                            <select id="f-department" class="form-select-gov">
                                                ${masters.departments.map(dp => `
                                                    <option value="${dp.id}" ${emp.department_id == dp.id ? 'selected' : ''}>${dp.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label-gov required">कार्यालय (Office):</label>
                                            <select id="f-office" class="form-select-gov">
                                                ${masters.offices.map(o => `
                                                    <option value="${o.id}" ${emp.office_id == o.id ? 'selected' : ''}>${o.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label-gov">वडा कार्यालय (यदि वडामा कार्यरत भए):</label>
                                            <select id="f-ward" class="form-select-gov">
                                                <option value="">-- केन्द्र / शाखा कार्यालय --</option>
                                                ${wards.map(w => `
                                                    <option value="${w.id}" ${emp.ward_id == w.id ? 'selected' : ''}>${w.office_name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label-gov">सेवा (Service):</label>
                                            <select id="f-service" class="form-select-gov">
                                                ${masters.services.map(s => `
                                                    <option value="${s.id}" ${emp.service_id == s.id ? 'selected' : ''}>${s.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>

                                        <div class="col-md-3">
                                            <label class="form-label-gov">समूह (Group):</label>
                                            <select id="f-group" class="form-select-gov">
                                                ${masters.groups.map(g => `
                                                    <option value="${g.id}" ${emp.group_id == g.id ? 'selected' : ''}>${g.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov required">स्थायी / करार:</label>
                                            <select id="f-employment-type" class="form-select-gov">
                                                ${masters.employmentTypes.map(et => `
                                                    <option value="${et.id}" ${emp.employment_type_id == et.id ? 'selected' : ''}>${et.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">सेवाको किसिम:</label>
                                            <select id="f-service-type" class="form-select-gov">
                                                ${masters.serviceTypes.map(st => `
                                                    <option value="${st.id}" ${emp.service_type_id == st.id ? 'selected' : ''}>${st.name_ne}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">बहाल विदा वा अन्य:</label>
                                            <select id="f-duty-status" class="form-select-gov">
                                                <option value="कार्यरत" ${emp.duty_status === 'कार्यरत' ? 'selected' : ''}>कार्यरत (On Duty)</option>
                                                <option value="विदा" ${emp.duty_status === 'विदा' ? 'selected' : ''}>विदा (On Leave)</option>
                                                <option value="काज" ${emp.duty_status === 'काज' ? 'selected' : ''}>काज (Deputation)</option>
                                                <option value="सरुवा" ${emp.duty_status === 'सरुवा' ? 'selected' : ''}>सरुवा (Transferred)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- Section 3: Contact & Address -->
                                <div class="card-custom p-3 mb-3">
                                    <div class="form-section-title">
                                        <i class="fa-solid fa-phone text-primary"></i> सम्पर्क तथा ठेगाना (Contact & Address)
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-3">
                                            <label class="form-label-gov required">मोबाईल नं:</label>
                                            <input type="text" id="f-mobile" class="form-control-gov" value="${emp.mobile_number || ''}" required>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">परिवारको सम्पर्क नं:</label>
                                            <input type="text" id="f-family-contact" class="form-control-gov" value="${emp.family_contact_number || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">ई-मेल:</label>
                                            <input type="email" id="f-email" class="form-control-gov" value="${emp.email || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">यस कार्यालयमा आएको कार्यालय:</label>
                                            <input type="text" id="f-transferred-from" class="form-control-gov" value="${emp.transferred_from_office || ''}" placeholder="साविक कार्यालय">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label-gov">स्थायी ठेगाना:</label>
                                            <input type="text" id="f-perm-addr" class="form-control-gov" value="${emp.permanent_address || ''}">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label-gov">हालको ठेगाना:</label>
                                            <input type="text" id="f-curr-addr" class="form-control-gov" value="${emp.current_address || ''}">
                                        </div>
                                    </div>
                                </div>

                                <!-- Section 4: Employment Dates & Fund Records -->
                                <div class="card-custom p-3 mb-3">
                                    <div class="form-section-title">
                                        <i class="fa-solid fa-calendar-days text-primary"></i> सेवा मिति तथा कोष नम्बरहरू (Dates & Funds)
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-3">
                                            <label class="form-label-gov">सुरु नियुक्ती:</label>
                                            <input type="date" id="f-init-app" class="form-control-gov" value="${emp.initial_appointment_date || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">हालको पदमा नियुक्ति:</label>
                                            <input type="date" id="f-curr-pos-app" class="form-control-gov" value="${emp.current_position_appointment_date || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">हालको पदमा हाजिर:</label>
                                            <input type="date" id="f-curr-pos-join" class="form-control-gov" value="${emp.current_position_joining_date || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">यस कार्यालयमा हाजिर:</label>
                                            <input type="date" id="f-curr-off-join" class="form-control-gov" value="${emp.current_office_joining_date || ''}">
                                        </div>

                                        <div class="col-md-3">
                                            <label class="form-label-gov">रमानाभई आएको मिति:</label>
                                            <input type="date" id="f-transfer-date" class="form-control-gov" value="${emp.transfer_release_date || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">संचयकोष नं (EPF):</label>
                                            <input type="text" id="f-pf-no" class="form-control-gov" value="${emp.provident_fund_no || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">ना.जि.वि.ना नं (CIT/Insurance):</label>
                                            <input type="text" id="f-cit-no" class="form-control-gov" value="${emp.cit_insurance_no || ''}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label-gov">लगानीकोष नं:</label>
                                            <input type="text" id="f-inv-no" class="form-control-gov" value="${emp.investment_fund_no || ''}">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-white border-top">
                            <button type="button" class="btn btn-gov-secondary" id="btn-cancel-emp-modal">
                                <i class="fa-solid fa-times me-1"></i> Exit (रद्द गर्नुहोस्)
                            </button>
                            <button type="button" class="btn btn-gov-success" id="btn-save-emp-modal">
                                <i class="fa-solid fa-check me-1"></i> Save (सुरक्षित गर्नुहोस्)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Calculate age automatically when DOB changes
        const dobInput = document.getElementById('f-dob');
        const ageInput = document.getElementById('f-age');
        dobInput.addEventListener('change', function() {
            if (this.value) {
                const birth = new Date(this.value);
                const diff = new Date().getFullYear() - birth.getFullYear();
                ageInput.value = diff > 0 ? diff : '';
            }
        });

        // Close handlers
        const closeModal = () => { mount.innerHTML = ''; };
        document.getElementById('btn-close-emp-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-emp-modal').addEventListener('click', closeModal);

        // Save handler
        document.getElementById('btn-save-emp-modal').addEventListener('click', () => {
            const nameNe = document.getElementById('f-name-ne').value.trim();
            const code = document.getElementById('f-emp-code').value.trim();
            const mobile = document.getElementById('f-mobile').value.trim();

            if (!nameNe || !code || !mobile) {
                showToast('कृपया अनिवार्य क्षेत्रहरू (नाम, कोड र मोबाईल नं) भर्नुहोस्।', 'error');
                return;
            }

            const data = {
                id: editingEmployeeId,
                employee_code: code,
                serial_number: document.getElementById('f-serial-no').value,
                full_name_ne: nameNe,
                gender: document.getElementById('f-gender').value,
                dob: document.getElementById('f-dob').value,
                age: Number(document.getElementById('f-age').value) || null,
                qualification_id: Number(document.getElementById('f-qualification').value),
                personnel_sheet_roll_no: document.getElementById('f-sheet-roll').value,
                designation_id: Number(document.getElementById('f-designation').value),
                level_id: Number(document.getElementById('f-level').value),
                department_id: Number(document.getElementById('f-department').value),
                office_id: Number(document.getElementById('f-office').value),
                ward_id: document.getElementById('f-ward').value ? Number(document.getElementById('f-ward').value) : null,
                service_id: Number(document.getElementById('f-service').value),
                group_id: Number(document.getElementById('f-group').value),
                employment_type_id: Number(document.getElementById('f-employment-type').value),
                service_type_id: Number(document.getElementById('f-service-type').value),
                duty_status: document.getElementById('f-duty-status').value,
                mobile_number: mobile,
                family_contact_number: document.getElementById('f-family-contact').value,
                email: document.getElementById('f-email').value,
                transferred_from_office: document.getElementById('f-transferred-from').value,
                permanent_address: document.getElementById('f-perm-addr').value,
                current_address: document.getElementById('f-curr-addr').value,
                initial_appointment_date: document.getElementById('f-init-app').value,
                current_position_appointment_date: document.getElementById('f-curr-pos-app').value,
                current_position_joining_date: document.getElementById('f-curr-pos-join').value,
                current_office_joining_date: document.getElementById('f-curr-off-join').value,
                transfer_release_date: document.getElementById('f-transfer-date').value,
                provident_fund_no: document.getElementById('f-pf-no').value,
                cit_insurance_no: document.getElementById('f-cit-no').value,
                investment_fund_no: document.getElementById('f-inv-no').value
            };

            ePalikaDB.saveEmployee(data);
            showToast(`कर्मचारी '${data.full_name_ne}' सफलतापूर्वक सुरक्षित गरियो।`, 'success');
            closeModal();
            renderEmployees();
        });
    }

    // -------------------------------------------------------------------------
    // Employee Profile Detailed View Modal
    // -------------------------------------------------------------------------
    function openEmployeeProfileModal(empId) {
        const emp = ePalikaDB.getEmployeeById(empId);
        if (!emp) return;
        const mount = document.getElementById('employee-profile-mount');

        mount.innerHTML = `
            <div class="modal fade show d-block" id="empProfileModal" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content shadow-lg border-0">
                        <div class="modal-header bg-navy text-white" style="background: var(--primary-navy);">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-address-card me-2"></i> कर्मचारी परिचय पत्र तथा विवरण (Employee Profile)</h5>
                            <button type="button" class="btn-close btn-close-white" id="btn-close-prof"></button>
                        </div>
                        <div class="modal-body p-4 bg-white">
                            <div class="d-flex align-items-center gap-3 pb-3 border-bottom mb-3">
                                <div class="stat-icon bg-primary text-white fs-2 rounded-circle" style="width: 60px; height: 60px;">
                                    <i class="fa-solid fa-user-tie"></i>
                                </div>
                                <div>
                                    <h4 class="mb-0 fw-bold text-dark font-devanagari">${emp.full_name_ne}</h4>
                                    <div class="text-muted small">
                                        <span class="badge bg-primary-subtle text-primary border me-1">${emp.employee_code}</span>
                                        <strong>${emp.designation_name}</strong> | ${emp.department_name}
                                    </div>
                                </div>
                                <span class="badge-status ${emp.employment_type_name === 'स्थायी' ? 'permanent' : 'contract'} ms-auto">
                                    ${emp.employment_type_name}
                                </span>
                            </div>

                            <div class="row g-3 small">
                                <div class="col-md-6">
                                    <table class="table table-sm table-borderless">
                                        <tr><td class="text-muted" style="width:40%;">लिङ्ग:</td><td class="fw-semibold">${emp.gender}</td></tr>
                                        <tr><td class="text-muted">तह:</td><td class="fw-semibold">${emp.level_name}</td></tr>
                                        <tr><td class="text-muted">सेवा:</td><td class="fw-semibold">${emp.service_name}</td></tr>
                                        <tr><td class="text-muted">कार्यालय:</td><td class="fw-semibold">${emp.office_name}</td></tr>
                                        <tr><td class="text-muted">योग्यता:</td><td class="fw-semibold">${emp.qualification_name}</td></tr>
                                        <tr><td class="text-muted">उमेर / जन्म:</td><td class="fw-semibold">${emp.age || '-'} वर्ष (${emp.dob || '-'})</td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <table class="table table-sm table-borderless">
                                        <tr><td class="text-muted" style="width:40%;">मोबाईल नं:</td><td class="fw-semibold text-primary">${emp.mobile_number}</td></tr>
                                        <tr><td class="text-muted">परिवार सम्पर्क:</td><td class="fw-semibold">${emp.family_contact_number || '-'}</td></tr>
                                        <tr><td class="text-muted">ई-मेल:</td><td class="fw-semibold">${emp.email || '-'}</td></tr>
                                        <tr><td class="text-muted">स्थायी ठेगाना:</td><td class="fw-semibold">${emp.permanent_address || '-'}</td></tr>
                                        <tr><td class="text-muted">हालको ठेगाना:</td><td class="fw-semibold">${emp.current_address || '-'}</td></tr>
                                        <tr><td class="text-muted">साविक कार्यालय:</td><td class="fw-semibold">${emp.transferred_from_office || '-'}</td></tr>
                                    </table>
                                </div>
                            </div>

                            <div class="p-3 bg-light rounded mt-2 border">
                                <h6 class="fw-bold mb-2 font-devanagari text-dark"><i class="fa-solid fa-file-invoice text-teal me-1"></i> कोष तथा अभिलेख विवरण:</h6>
                                <div class="row g-2 small">
                                    <div class="col-md-3"><strong>संकेत नं:</strong> ${emp.personnel_sheet_roll_no || '-'}</div>
                                    <div class="col-md-3"><strong>संचयकोष:</strong> ${emp.provident_fund_no || '-'}</div>
                                    <div class="col-md-3"><strong>ना.जि.वि.ना:</strong> ${emp.cit_insurance_no || '-'}</div>
                                    <div class="col-md-3"><strong>सुरु नियुक्ति:</strong> ${emp.initial_appointment_date || '-'}</div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button class="btn btn-gov-secondary btn-sm" onclick="window.print()"><i class="fa-solid fa-print me-1"></i> प्रिन्ट</button>
                            <button class="btn btn-gov-primary btn-sm" id="btn-close-prof-2">बन्द गर्नुहोस्</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-close-prof').addEventListener('click', () => { mount.innerHTML = ''; });
        document.getElementById('btn-close-prof-2').addEventListener('click', () => { mount.innerHTML = ''; });
    }

    // -------------------------------------------------------------------------
    // Excel / CSV Export Tool
    // -------------------------------------------------------------------------
    function exportEmployeesToCSV() {
        const employees = ePalikaDB.getEmployees(currentFilterState);
        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += "क्र.सं.,कर्मचारी कोड,कर्मचारीको नाम,लिङ्ग,पद,तह,शाखा,कार्यालय,सेवा प्रकार,मोबाईल नं,ई-मेल\n";

        employees.forEach((emp, i) => {
            const row = [
                i + 1,
                `"${emp.employee_code}"`,
                `"${emp.full_name_ne}"`,
                `"${emp.gender}"`,
                `"${emp.designation_name}"`,
                `"${emp.level_name}"`,
                `"${emp.department_name}"`,
                `"${emp.office_name}"`,
                `"${emp.employment_type_name}"`,
                `"${emp.mobile_number}"`,
                `"${emp.email || ''}"`
            ].join(',');
            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `banganga_employees_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('कर्मचारी तथ्याङ्क Excel/CSV मा डाउनलोड भयो।', 'success');
    }

    // -------------------------------------------------------------------------
    // 3. MUNICIPALITY PROFILE MODULE
    // -------------------------------------------------------------------------
    function renderMunicipality() {
        const mun = ePalikaDB.getMunicipality();

        contentArea.innerHTML = `
            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card-custom">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom"><i class="fa-solid fa-landmark text-primary"></i> पालिका आधारभूत प्रोफाइल (Profile Settings)</h5>
                        </div>
                        <div class="card-body-custom">
                            <form id="mun-profile-form">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">पालिकाको नाम (नेपाली):</label>
                                        <input type="text" id="m-name-ne" class="form-control-gov fw-bold" value="${mun.name_ne}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">Municipality Name (English):</label>
                                        <input type="text" id="m-name-en" class="form-control-gov" value="${mun.name_en}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">जिल्ला:</label>
                                        <input type="text" id="m-dist-ne" class="form-control-gov" value="${mun.district_ne}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">प्रदेश:</label>
                                        <input type="text" id="m-prov-ne" class="form-control-gov" value="${mun.province_ne}">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label-gov required">कार्यालयको ठेगाना:</label>
                                        <input type="text" id="m-addr-ne" class="form-control-gov" value="${mun.address_ne}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">सम्पर्क फोन नं.:</label>
                                        <input type="text" id="m-phone" class="form-control-gov" value="${mun.phone}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">ई-मेल:</label>
                                        <input type="email" id="m-email" class="form-control-gov" value="${mun.email}">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label-gov">आधिकारिक वेबसाइट:</label>
                                        <input type="url" id="m-web" class="form-control-gov" value="${mun.website}">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label-gov">पालिका परिचय तथा पृष्ठभूमि:</label>
                                        <textarea id="m-summary" class="form-control-gov" rows="3">${mun.profile_summary}</textarea>
                                    </div>
                                </div>
                                <hr class="my-4">
                                <h6 class="fw-bold mb-3 font-devanagari text-dark"><i class="fa-solid fa-users-gear text-teal me-1"></i> पदाधिकारी विवरण:</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label-gov">नगर प्रमुख (Mayor):</label>
                                        <input type="text" id="m-mayor" class="form-control-gov" value="${mun.mayor_name}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">नगर प्रमुख सम्पर्क:</label>
                                        <input type="text" id="m-mayor-phone" class="form-control-gov" value="${mun.mayor_phone}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">उप-प्रमुख (Deputy Mayor):</label>
                                        <input type="text" id="m-deputy" class="form-control-gov" value="${mun.deputy_mayor_name}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">उप-प्रमुख सम्पर्क:</label>
                                        <input type="text" id="m-deputy-phone" class="form-control-gov" value="${mun.deputy_mayor_phone}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">प्रमुख प्रशासकीय अधिकृत (CAO):</label>
                                        <input type="text" id="m-cao" class="form-control-gov" value="${mun.chief_officer_name}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">प्रमुख प्रशासकीय अधिकृत सम्पर्क:</label>
                                        <input type="text" id="m-cao-phone" class="form-control-gov" value="${mun.chief_officer_phone}">
                                    </div>
                                </div>
                                <div class="mt-4 text-end">
                                    <button type="button" class="btn btn-gov-success" id="btn-save-mun">
                                        <i class="fa-solid fa-save me-1"></i> पालिका प्रोफाइल अपडेट गर्नुहोस्
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-lg-5">
                    <!-- Public Profile Preview Card -->
                    <div class="card-custom bg-white">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom"><i class="fa-solid fa-globe text-primary"></i> सार्वजनिक पृष्ठ अवलोकन (Public Landing View)</h5>
                        </div>
                        <div class="card-body-custom text-center p-4">
                            <div class="stat-icon bg-light text-primary mx-auto mb-3" style="width:72px; height:72px; font-size:2rem;">
                                <i class="fa-solid fa-building-columns"></i>
                            </div>
                            <h4 class="fw-bold font-devanagari text-dark">${mun.name_ne}</h4>
                            <div class="text-muted small mb-2">${mun.address_ne}, ${mun.district_ne}</div>
                            <div class="badge bg-primary-subtle text-primary mb-3">${mun.province_ne}</div>
                            <p class="text-secondary small text-start p-3 bg-light rounded">${mun.profile_summary}</p>

                            <div class="d-grid gap-2 mt-3">
                                <a href="${mun.website}" target="_blank" class="btn btn-gov-secondary btn-sm">
                                    <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> आधिकारिक वेबसाइट खोल्नुहोस्
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-save-mun').addEventListener('click', () => {
            const updated = {
                name_ne: document.getElementById('m-name-ne').value,
                name_en: document.getElementById('m-name-en').value,
                district_ne: document.getElementById('m-dist-ne').value,
                province_ne: document.getElementById('m-prov-ne').value,
                address_ne: document.getElementById('m-addr-ne').value,
                phone: document.getElementById('m-phone').value,
                email: document.getElementById('m-email').value,
                website: document.getElementById('m-web').value,
                profile_summary: document.getElementById('m-summary').value,
                mayor_name: document.getElementById('m-mayor').value,
                mayor_phone: document.getElementById('m-mayor-phone').value,
                deputy_mayor_name: document.getElementById('m-deputy').value,
                deputy_mayor_phone: document.getElementById('m-deputy-phone').value,
                chief_officer_name: document.getElementById('m-cao').value,
                chief_officer_phone: document.getElementById('m-cao-phone').value
            };
            ePalikaDB.updateMunicipality(updated);
            showToast('पालिका प्रोफाइल सफलतापूर्वक अद्यावधिक गरियो।', 'success');
            renderMunicipality();
        });
    }

    // -------------------------------------------------------------------------
    // 4. WARD OFFICE MANAGEMENT MODULE
    // -------------------------------------------------------------------------
    function renderWards() {
        const wards = ePalikaDB.getWards();

        contentArea.innerHTML = `
            <div class="reference-toolbar">
                <span class="fw-bold text-dark font-devanagari">
                    <i class="fa-solid fa-landmark text-primary me-1"></i> जम्मा वडा कार्यालयहरू: 
                    <span class="badge bg-primary px-2 py-1 ms-1 font-devanagari">${wards.length}</span>
                </span>
                <button class="btn btn-gov-excel" onclick="window.print()">
                    <i class="fa-solid fa-print"></i> वडा प्रतिवेदन प्रिन्ट
                </button>
            </div>

            <div class="row g-3">
                ${wards.map(w => `
                    <div class="col-md-6 col-xl-4">
                        <div class="card-custom h-100 p-3">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <span class="badge bg-navy text-white px-2 py-1 font-devanagari" style="background:var(--primary-navy);">
                                    वडा नं. ${w.ward_number}
                                </span>
                                <span class="badge bg-light text-dark border font-devanagari">
                                    जनसंख्या: ${w.population.toLocaleString('ne-NP')}
                                </span>
                            </div>
                            <h5 class="fw-bold text-dark font-devanagari mb-2">${w.office_name_ne}</h5>
                            <div class="text-muted small mb-3"><i class="fa-solid fa-location-dot me-1 text-danger"></i> ${w.address}</div>
                            
                            <div class="p-2 bg-light rounded small mb-3">
                                <div><strong>वडा अध्यक्ष:</strong> ${w.chairperson_name} (${w.chairperson_phone})</div>
                                <div><strong>वडा सचिव:</strong> ${w.secretary_name} (${w.secretary_phone})</div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                                <span class="small text-muted font-devanagari">
                                    <i class="fa-solid fa-users text-primary me-1"></i> कर्मचारी: <strong>${w.employees_count}</strong>
                                </span>
                                <button class="btn btn-outline-primary btn-sm btn-filter-ward-emp" data-ward="${w.id}">
                                    कर्मचारी हेर्नुहोस् <i class="fa-solid fa-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.btn-filter-ward-emp').forEach(btn => {
            btn.addEventListener('click', function() {
                const wid = Number(this.getAttribute('data-ward'));
                currentFilterState = { office_id: [2] }; // ward offices
                document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
                document.querySelector('[data-module="employees"]').classList.add('active');
                renderModule('employees');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 5. PUBLIC UTILITIES / INSTITUTIONS MODULES (सहकारी, खानेपानी, वन, संघसंस्था)
    // -------------------------------------------------------------------------
    function renderInstitutions(categoryKey, titleNe) {
        const institutions = ePalikaDB.getInstitutions(categoryKey);
        const wards = ePalikaDB.getWards();

        contentArea.innerHTML = `
            <div class="reference-toolbar">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold text-dark font-devanagari">
                        <i class="fa-solid fa-building-flag text-primary me-1"></i> दर्ता ${titleNe} संस्था संख्या: 
                        <span class="badge bg-primary px-2 py-1 ms-1 font-devanagari">${institutions.length}</span>
                    </span>
                </div>
                <div class="btn-group-actions">
                    <button class="btn btn-gov-primary" id="btn-add-inst">
                        <i class="fa-solid fa-plus"></i> नयाँ ${titleNe} दर्ता
                    </button>
                    <button class="btn btn-gov-print" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> प्रिन्ट
                    </button>
                </div>
            </div>

            <div class="table-wrapper">
                <div class="table-responsive">
                    <table class="table table-custom align-middle">
                        <thead>
                            <tr>
                                <th>क्र.सं.</th>
                                <th>दर्ता नं.</th>
                                <th>संस्थाको नाम</th>
                                <th>ठेगाना</th>
                                <th>सम्पर्क व्यक्ति</th>
                                <th>सम्पर्क फोन</th>
                                <th>सदस्य संख्या</th>
                                <th>पुँजी लगानी (रू)</th>
                                <th>स्थिति</th>
                                <th class="text-center no-print">कार्य</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${institutions.length === 0 ? `
                                <tr>
                                    <td colspan="10" class="text-center py-4 text-muted">कुनै संस्था फेला परेन।</td>
                                </tr>
                            ` : institutions.map((inst, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td><span class="badge bg-light text-dark border font-devanagari">${inst.reg_number}</span></td>
                                    <td class="fw-bold text-dark">${inst.name_ne}</td>
                                    <td>${inst.address}</td>
                                    <td>${inst.contact_person}</td>
                                    <td>${inst.contact_phone}</td>
                                    <td class="font-devanagari">${inst.members_count || '-'}</td>
                                    <td class="font-devanagari fw-semibold">${inst.capital_investment ? inst.capital_investment.toLocaleString('ne-NP') : '-'}</td>
                                    <td><span class="badge-status active">सक्रिय</span></td>
                                    <td class="text-center no-print">
                                        <button class="btn btn-outline-danger btn-sm btn-del-inst" data-id="${inst.id}" data-name="${inst.name_ne}">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="inst-modal-mount"></div>
        `;

        document.getElementById('btn-add-inst').addEventListener('click', () => {
            openInstitutionModal(categoryKey, titleNe);
        });

        document.querySelectorAll('.btn-del-inst').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                if (confirm(`संस्था '${name}' मेटाउन निश्चित हुनुहुन्छ?`)) {
                    ePalikaDB.deleteInstitution(id);
                    showToast(`संस्था '${name}' हटाइयो।`, 'success');
                    renderInstitutions(categoryKey, titleNe);
                }
            });
        });
    }

    function openInstitutionModal(catKey, catTitle) {
        const mount = document.getElementById('inst-modal-mount');
        const wards = ePalikaDB.getWards();

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content shadow-lg border-0">
                        <div class="modal-header bg-navy text-white" style="background: var(--primary-navy);">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-plus-circle me-2"></i> नयाँ ${catTitle} संस्था दर्ता</h5>
                            <button type="button" class="btn-close btn-close-white" id="btn-close-inst-m"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <form id="inst-form">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label class="form-label-gov required">दर्ता नम्बर:</label>
                                        <input type="text" id="i-reg" class="form-control-gov" placeholder="REG-..." required>
                                    </div>
                                    <div class="col-md-8">
                                        <label class="form-label-gov required">संस्थाको नाम:</label>
                                        <input type="text" id="i-name" class="form-control-gov fw-bold" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">ठेगाना:</label>
                                        <input type="text" id="i-addr" class="form-control-gov" value="बाणगंगा, कपिलवस्तु" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">वडा:</label>
                                        <select id="i-ward" class="form-select-gov">
                                            ${wards.map(w => `<option value="${w.id}">${w.office_name_ne}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">सम्पर्क व्यक्ति:</label>
                                        <input type="text" id="i-contact" class="form-control-gov" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov required">सम्पर्क फोन / मोबाईल:</label>
                                        <input type="text" id="i-phone" class="form-control-gov" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">सदस्य संख्या:</label>
                                        <input type="number" id="i-members" class="form-control-gov" value="100">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label-gov">कुल पुँजी लगानी (रू):</label>
                                        <input type="number" id="i-capital" class="form-control-gov" value="1000000">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-white">
                            <button type="button" class="btn btn-gov-secondary" id="btn-cancel-inst-m">रद्द गर्नुहोस्</button>
                            <button type="button" class="btn btn-gov-success" id="btn-save-inst-m">सुरक्षित गर्नुहोस्</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-close-inst-m').addEventListener('click', () => mount.innerHTML = '');
        document.getElementById('btn-cancel-inst-m').addEventListener('click', () => mount.innerHTML = '');
        document.getElementById('btn-save-inst-m').addEventListener('click', () => {
            const name = document.getElementById('i-name').value.trim();
            const reg = document.getElementById('i-reg').value.trim();
            const contact = document.getElementById('i-contact').value.trim();
            const phone = document.getElementById('i-phone').value.trim();

            if (!name || !reg || !contact || !phone) {
                showToast('कृपया सबै अनिवार्य विवरणहरू भर्नुहोस्।', 'error');
                return;
            }

            const data = {
                category: catKey,
                reg_number: reg,
                name_ne: name,
                address: document.getElementById('i-addr').value,
                ward_id: Number(document.getElementById('i-ward').value),
                contact_person: contact,
                contact_phone: phone,
                members_count: Number(document.getElementById('i-members').value) || 0,
                capital_investment: Number(document.getElementById('i-capital').value) || 0
            };

            ePalikaDB.saveInstitution(data);
            showToast(`संस्था '${name}' दर्ता भयो।`, 'success');
            mount.innerHTML = '';
            renderInstitutions(catKey, catTitle);
        });
    }

    // -------------------------------------------------------------------------
    // 6. MASTER SETTINGS MODULE (Administrator Dropdown Management)
    // -------------------------------------------------------------------------
    function renderMasterSettings() {
        const masters = ePalikaDB.getMasters();

        contentArea.innerHTML = `
            <div class="card-custom">
                <div class="card-header-custom">
                    <h5 class="card-title-custom"><i class="fa-solid fa-sliders text-primary"></i> प्रशासक मास्टर सेटिङ (Dropdown Master Configuration)</h5>
                    <div class="text-muted small">प्रणालीका सबै ड्रपडाउन मानहरू यस प्यानलबाट थपघट गर्न सकिन्छ।</div>
                </div>
                <div class="card-body-custom">
                    <!-- Nav Tabs -->
                    <ul class="nav nav-tabs mb-4" id="masterTabs" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" data-bs-toggle="tab" data-target="#tab-designations">पद (Designations)</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-target="#tab-departments">शाखा/विभाग (Departments)</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-target="#tab-levels">तह (Levels)</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-target="#tab-services">सेवा (Services)</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-target="#tab-offices">कार्यालय (Offices)</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-target="#tab-qualifications">शैक्षिक योग्यता (Qualifications)</button>
                        </li>
                    </ul>

                    <div class="tab-content" id="masterTabsContent">
                        <!-- Designations Tab -->
                        <div class="tab-pane fade show active" id="tab-designations">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold font-devanagari mb-0">पदहरूको सूची (${masters.designations.length})</h6>
                                <button class="btn btn-sm btn-gov-primary btn-add-master-item" data-type="designations" data-label="पद">
                                    <i class="fa-solid fa-plus me-1"></i> नयाँ पद थप्नुहोस्
                                </button>
                            </div>
                            <div class="row g-2">
                                ${masters.designations.map(d => `
                                    <div class="col-md-4">
                                        <div class="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                                            <span>${d.name_ne}</span>
                                            <span class="badge bg-success-subtle text-success">सक्रिय</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Departments Tab -->
                        <div class="tab-pane fade" id="tab-departments">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold font-devanagari mb-0">शाखा तथा विभागहरूको सूची (${masters.departments.length})</h6>
                                <button class="btn btn-sm btn-gov-primary btn-add-master-item" data-type="departments" data-label="शाखा">
                                    <i class="fa-solid fa-plus me-1"></i> नयाँ शाखा थप्नुहोस्
                                </button>
                            </div>
                            <div class="row g-2">
                                ${masters.departments.map(dp => `
                                    <div class="col-md-4">
                                        <div class="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                                            <span>${dp.name_ne}</span>
                                            <span class="badge bg-success-subtle text-success">सक्रिय</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Levels Tab -->
                        <div class="tab-pane fade" id="tab-levels">
                            <div class="row g-2">
                                ${masters.levels.map(l => `
                                    <div class="col-md-3">
                                        <div class="p-2 border rounded bg-light"><strong>${l.name_ne}</strong></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Services Tab -->
                        <div class="tab-pane fade" id="tab-services">
                            <div class="row g-2">
                                ${masters.services.map(s => `
                                    <div class="col-md-4">
                                        <div class="p-2 border rounded bg-light">${s.name_ne}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Offices Tab -->
                        <div class="tab-pane fade" id="tab-offices">
                            <div class="row g-2">
                                ${masters.offices.map(o => `
                                    <div class="col-md-4">
                                        <div class="p-2 border rounded bg-light">${o.name_ne}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Qualifications Tab -->
                        <div class="tab-pane fade" id="tab-qualifications">
                            <div class="row g-2">
                                ${masters.qualifications.map(q => `
                                    <div class="col-md-4">
                                        <div class="p-2 border rounded bg-light">${q.name_ne}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Tab Switching Handler
        document.querySelectorAll('#masterTabs button').forEach(tabBtn => {
            tabBtn.addEventListener('click', function() {
                document.querySelectorAll('#masterTabs button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show', 'active'));
                this.classList.add('active');
                const target = document.querySelector(this.getAttribute('data-target'));
                if (target) target.classList.add('show', 'active');
            });
        });

        // Add Master Item Handler
        document.querySelectorAll('.btn-add-master-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const label = this.getAttribute('data-label');
                const val = prompt(`नयाँ ${label} को नाम प्रविष्ट गर्नुहोस्:`);
                if (val && val.trim()) {
                    ePalikaDB.addMasterItem(type, val.trim());
                    showToast(`नयाँ ${label} '${val}' थपियो।`, 'success');
                    renderMasterSettings();
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // 7. USER MANAGEMENT & PASSWORD DISTRIBUTION (Exact match to Reference PDF)
    // -------------------------------------------------------------------------
    function renderUserPasswordDistribution() {
        const users = ePalikaDB.getUsers();
        const wards = ePalikaDB.getWards();

        contentArea.innerHTML = `
            <div class="row g-4">
                <!-- Registration Form matching PDF Diagram -->
                <div class="col-lg-5">
                    <div class="card-custom">
                        <div class="card-header-custom" style="background:var(--primary-navy); color:#fff;">
                            <h5 class="card-title-custom text-white">
                                <i class="fa-solid fa-user-plus me-2"></i> नयाँ प्रयोगकर्ता थप (Add User)
                            </h5>
                        </div>
                        <div class="card-body-custom">
                            <form id="new-user-form">
                                <div class="mb-3">
                                    <label class="form-label-gov required">नाम (Name):</label>
                                    <input type="text" id="u-name" class="form-control-gov" placeholder="प्रयोगकर्ताको पूरा नाम..." required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label-gov required">प्रयोगकर्ता संकेत (User ID):</label>
                                    <input type="text" id="u-code" class="form-control-gov fw-bold" placeholder="उदा: EMP002, WARD02..." required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label-gov required">वर्ग (Category):</label>
                                    <select id="u-category" class="form-select-gov">
                                        <option value="कर्मचारी">कर्मचारी</option>
                                        <option value="सहकारी">सहकारी</option>
                                        <option value="खानेपानी">खानेपानी</option>
                                        <option value="वन">वन</option>
                                        <option value="संघसंस्था">संघसंस्था</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label-gov required">भूमिका (Role):</label>
                                    <select id="u-role" class="form-select-gov">
                                        <option value="Super Admin">Super Admin (सुपर एडमिन)</option>
                                        <option value="Admin">Admin (प्रशासक)</option>
                                        <option value="Employee" selected>Employee (कर्मचारी)</option>
                                        <option value="Ward User">Ward User (वडा प्रयोगकर्ता)</option>
                                        <option value="Institution User">Institution User (संस्था प्रयोगकर्ता)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label-gov required">मोबाईल नं.:</label>
                                    <input type="text" id="u-mobile" class="form-control-gov" placeholder="९८xxxxxxxx" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label-gov required">आन्तरिक / वाह्य:</label>
                                    <select id="u-internal" class="form-select-gov">
                                        <option value="1">आन्तरिक (Internal Staff)</option>
                                        <option value="0">वाह्य (External Entity)</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label-gov">प्रारम्भिक पासवर्ड:</label>
                                    <div class="input-group">
                                        <input type="text" id="u-password" class="form-control-gov" placeholder="पासवर्ड आफैं जेनेरेट गर्नुहोस्...">
                                        <button class="btn btn-outline-secondary" type="button" id="btn-gen-pass">Generate</button>
                                    </div>
                                    <div class="text-muted small mt-1">खाली छोडेमा स्वचालित सुरक्षित पासवर्ड तयार हुनेछ।</div>
                                </div>
                                <button type="button" class="btn btn-gov-primary w-100 py-2" id="btn-create-user">
                                    <i class="fa-solid fa-key me-1"></i> पासवर्ड वितरण तथा दर्ता गर्नुहोस्
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Users List & Credentials Dispatch Info -->
                <div class="col-lg-7">
                    <div class="card-custom">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom"><i class="fa-solid fa-users text-primary"></i> दर्ता प्रयोगकर्ता तथा पासवर्ड वितरण सूची</h5>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-custom">
                                <thead>
                                    <tr>
                                        <th>प्रयोगकर्ता संकेत</th>
                                        <th>नाम</th>
                                        <th>वर्ग</th>
                                        <th>भूमिका</th>
                                        <th>मोबाईल नं</th>
                                        <th>कार्य</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(u => `
                                        <tr>
                                            <td><span class="badge bg-light text-dark border font-devanagari">${u.user_code}</span></td>
                                            <td class="fw-bold">${u.name}</td>
                                            <td><span class="badge bg-secondary-subtle text-secondary">${u.category}</span></td>
                                            <td><span class="badge bg-primary-subtle text-primary">${u.role}</span></td>
                                            <td>${u.mobile_number}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary btn-dispatch-sms" data-name="${u.name}" data-code="${u.user_code}" data-phone="${u.mobile_number}">
                                                    <i class="fa-solid fa-paper-plane me-1"></i> पासवर्ड पठाउनुहोस्
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

            <div id="credential-modal-mount"></div>
        `;

        document.getElementById('btn-gen-pass').addEventListener('click', () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
            let pass = '';
            for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
            document.getElementById('u-password').value = pass;
        });

        document.getElementById('btn-create-user').addEventListener('click', () => {
            const name = document.getElementById('u-name').value.trim();
            const code = document.getElementById('u-code').value.trim();
            const mobile = document.getElementById('u-mobile').value.trim();
            const cat = document.getElementById('u-category').value;
            const role = document.getElementById('u-role').value;
            let pass = document.getElementById('u-password').value.trim();

            if (!name || !code || !mobile) {
                showToast('कृपया नाम, प्रयोगकर्ता संकेत र मोबाईल नम्बर भर्नुहोस्।', 'error');
                return;
            }

            if (!pass) {
                pass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
            }

            const newUser = ePalikaDB.saveUser({
                name: name,
                user_code: code,
                category: cat,
                role: role,
                mobile_number: mobile,
                is_internal: document.getElementById('u-internal').value === '1'
            });

            showCredentialsModal(name, code, mobile, pass);
            renderUserPasswordDistribution();
        });

        document.querySelectorAll('.btn-dispatch-sms').forEach(btn => {
            btn.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                const code = this.getAttribute('data-code');
                const phone = this.getAttribute('data-phone');
                const tempPass = 'Banganga@' + Math.floor(100 + Math.random() * 900);
                showCredentialsModal(name, code, phone, tempPass);
            });
        });
    }

    function showCredentialsModal(name, code, phone, pass) {
        const mount = document.getElementById('credential-modal-mount');
        mount.innerHTML = `
            <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content shadow-lg border-0">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-mobile-screen-button me-2"></i> पासवर्ड वितरण विवरण (SMS & Login Token)</h5>
                            <button type="button" class="btn-close btn-close-white" id="btn-close-cred"></button>
                        </div>
                        <div class="modal-body p-4 bg-light text-center">
                            <div class="stat-icon bg-success text-white mx-auto mb-3" style="width:54px; height:54px;">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <h5 class="fw-bold font-devanagari text-dark mb-1">${name}</h5>
                            <div class="text-muted small mb-3">मोबाईल नं.: <strong>${phone}</strong></div>

                            <div class="card p-3 bg-white border text-start mb-3">
                                <div class="mb-2"><strong>प्रयोगकर्ता संकेत (User ID):</strong> <code class="fs-6 text-primary">${code}</code></div>
                                <div><strong>अस्थायी पासवर्ड (Password):</strong> <code class="fs-6 text-danger">${pass}</code></div>
                            </div>

                            <div class="alert alert-info py-2 small mb-0 font-devanagari">
                                <i class="fa-solid fa-info-circle me-1"></i> सम्बन्धित मोबाईल नम्बरमा User ID र Password सफलतापूर्वक प्रेषण गरियो।
                            </div>
                        </div>
                        <div class="modal-footer bg-white">
                            <button class="btn btn-gov-primary btn-sm" id="btn-done-cred">सम्पन्न</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-close-cred').addEventListener('click', () => mount.innerHTML = '');
        document.getElementById('btn-done-cred').addEventListener('click', () => mount.innerHTML = '');
    }

    // -------------------------------------------------------------------------
    // 8. REPORTS MODULE
    // -------------------------------------------------------------------------
    function renderReports() {
        const employees = ePalikaDB.getEmployees();
        const wards = ePalikaDB.getWards();
        const masters = ePalikaDB.getMasters();

        contentArea.innerHTML = `
            <div class="reference-toolbar">
                <span class="fw-bold text-dark font-devanagari">
                    <i class="fa-solid fa-chart-pie text-primary me-1"></i> प्रशासनिक तथा कर्मचारी प्रतिवेदन केन्द्र
                </span>
                <button class="btn btn-gov-print" onclick="window.print()">
                    <i class="fa-solid fa-print"></i> सम्पूर्ण प्रतिवेदन प्रिन्ट
                </button>
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card-custom h-100">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom">शाखागत कर्मचारी संख्या (Department-wise Report)</h5>
                        </div>
                        <div class="card-body-custom p-0">
                            <table class="table table-sm table-custom mb-0">
                                <thead><tr><th>शाखाको नाम</th><th class="text-end">कर्मचारी संख्या</th></tr></thead>
                                <tbody>
                                    ${masters.departments.slice(0, 8).map(d => {
                                        const count = employees.filter(e => e.department_id == d.id).length;
                                        return `<tr><td>${d.name_ne}</td><td class="text-end font-devanagari fw-bold">${count}</td></tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card-custom h-100">
                        <div class="card-header-custom">
                            <h5 class="card-title-custom">वडागत कर्मचारी संख्या (Ward-wise Report)</h5>
                        </div>
                        <div class="card-body-custom p-0">
                            <table class="table table-sm table-custom mb-0">
                                <thead><tr><th>वडा कार्यालय</th><th class="text-end">कर्मचारी</th><th class="text-end">दर्ता संस्था</th></tr></thead>
                                <tbody>
                                    ${wards.map(w => `
                                        <tr>
                                            <td>${w.office_name_ne}</td>
                                            <td class="text-end font-devanagari">${w.employees_count}</td>
                                            <td class="text-end font-devanagari">${w.institutions_count}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // 9. AUDIT LOGS MODULE
    // -------------------------------------------------------------------------
    function renderAuditLogs() {
        const logs = ePalikaDB.getAuditLogs();

        contentArea.innerHTML = `
            <div class="card-custom">
                <div class="card-header-custom">
                    <h5 class="card-title-custom"><i class="fa-solid fa-shield-halved text-primary"></i> प्रणाली अडिट अभिलेख (System Audit Trail)</h5>
                    <div class="text-muted small">प्रणालीमा भएका हरेक थपघट, सम्पादन र सुरक्षा क्रियाकलापहरूको अभिलेख।</div>
                </div>
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th>क्र.सं.</th>
                                <th>कार्य (Action)</th>
                                <th>मोड्युल (Module)</th>
                                <th>प्रयोगकर्ता (User)</th>
                                <th>विवरण (Details)</th>
                                <th>समय (Timestamp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map((log, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td><span class="badge bg-primary-subtle text-primary">${log.action}</span></td>
                                    <td><span class="badge bg-light text-dark border">${log.module}</span></td>
                                    <td class="fw-semibold">${log.user_name}</td>
                                    <td>${log.details}</td>
                                    <td class="text-muted small">${log.timestamp}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // Toast Notification Utility
    // -------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-custom ${type}`;
        const icon = type === 'success' ? 'fa-circle-check text-success' : (type === 'error' ? 'fa-circle-xmark text-danger' : 'fa-circle-info text-primary');
        toast.innerHTML = `
            <i class="fa-solid ${icon} fs-5 mt-1"></i>
            <div>
                <div class="fw-bold font-devanagari text-dark">${type === 'success' ? 'सफल' : (type === 'error' ? 'त्रुटि' : 'जानकारी')}</div>
                <div class="small text-secondary">${message}</div>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Global navigation hook
    window.navigateToModule = function(mod) {
        document.querySelectorAll('.nav-link-custom').forEach(l => {
            if (l.getAttribute('data-module') === mod) l.classList.add('active');
            else l.classList.remove('active');
        });
        renderModule(mod);
    };
});
