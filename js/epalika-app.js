/**
 * ePalika.com - बाणगंगा नगरपालिका, कपिलवस्तु
 * आन्तरिक नियन्त्रण प्रणाली (Official UI Controller)
 * Full Super Admin Exclusive Role Assignment, Password Management & System Operations
 */

document.addEventListener('DOMContentLoaded', function() {
    let activeTab = 'employees';
    let currentUser = null;
    let filterState = {};
    let selectedEmployeeId = null;
    let performPortalLogin = null;

    function getCurrentUserSafe() {
        if (!currentUser) {
            currentUser = ePalikaDB.getCurrentUser();
        }
        if (!currentUser) {
            const users = ePalikaDB.getUsers();
            currentUser = (users && users.length > 0) ? users[0] : {
                id: 1,
                name: 'प्रणाली प्रशासक',
                user_code: 'ADMIN001',
                role: 'Super Admin',
                office: 'बाणगंगा नगर कार्यपालिकाको कार्यालय'
            };
            try {
                ePalikaDB.setCurrentUser(currentUser);
            } catch(e) {}
        }
        return currentUser;
    }

    // Initialize safe active user immediately
    currentUser = getCurrentUserSafe();

    const mainContainer = document.getElementById('main-content-display');
    const toastMount = document.getElementById('toast-mount');
    const loginModalMount = document.getElementById('login-modal-mount');
    const userRoleBadge = document.getElementById('current-user-role-badge');
    const userDisplayName = document.getElementById('current-user-display-name');
    const userCodeDisplay = document.getElementById('current-user-code-display');

    // 7 Core Portal Modules matching shared Gemini design
    const PORTAL_MODULES = [
        {
            id: 'setting',
            title: 'आफ्नै सेटिङ गर्न मिल्ने',
            icon: 'fa-sliders',
            iconColor: '#2563eb',
            bg: '#eff6ff',
            demoTitle: 'आफ्नै सेटिङ गर्न मिल्ने (Customizable Settings)',
            demoDesc: 'प्रणालीको सम्पूर्ण अधिकार सुपर एडमिनमा सुरक्षित रहने, कर्मचारीहरूलाई आवश्यकता अनुसार भूमिका (Super Admin, Admin, Ward User, Employee) तोक्न सकिने, पासवर्ड वितरण तथा १० वटै मास्टर ड्रपडाउनहरू (पद, तह, शाखा, कार्यालय) तत्काल थप र सम्पादन गर्ने सुविधा।',
            badges: ['भूमिका व्यवस्थापन', 'पासवर्ड वितरण', '१० मास्टर ड्रपडाउन']
        },
        {
            id: 'palika_profile',
            title: 'पालिका प्रोफाइल',
            icon: 'fa-landmark',
            iconColor: '#16a34a',
            bg: '#f0fdf4',
            demoTitle: 'पालिका प्रोफाइल (Palika Profile)',
            demoDesc: 'नगर प्रमुख, उपप्रमुख, प्रमुख प्रशासकीय अधिकृतको आधिकारिक विवरण, वडा कार्यालयहरूको जनसंख्या तथा कर्मचारी तथ्याङ्क, र पालिकाको वस्तुगत पार्श्वचित्र (Profile Document) एक क्लिकमा डाउनलोड गर्ने सुविधा।',
            badges: ['जनप्रतिनिधि विवरण', 'वडा नक्साङ्कन', 'वस्तुगत पार्श्वचित्र']
        },
        {
            id: 'employees',
            title: 'कर्मचारी व्यवस्थापन रिपोर्टिङ',
            icon: 'fa-users-gear',
            iconColor: '#0284c7',
            bg: '#f0f9ff',
            demoTitle: 'कर्मचारी व्यवस्थापन रिपोर्टिङ (Employee Management)',
            demoDesc: 'नेपाल सरकारको आधिकारिक ३२ वटै स्तम्भहरू भएको विस्तृत कर्मचारी अभिलेख फारम, बिक्रम संवत् ५७+ वर्ष पुगेका कर्मचारीलाई रातो पङ्क्ति अलर्ट, स्मार्ट नेपाली युनिकोड ट्रान्सलिटरेसन, वि.सं. पात्रो र एक्सेल/CSV बल्क इम्पोर्ट तथा एक्सपोर्ट।',
            badges: ['३२ स्तम्भ अभिलेख', '५७+ रातो अलर्ट', 'Excel Import/Export']
        },
        {
            id: 'organization',
            title: 'संघसंस्था रिपोर्टिङ',
            icon: 'fa-sitemap',
            iconColor: '#d97706',
            bg: '#fffbeb',
            demoTitle: 'संघसंस्था अभिलेख तथा रिपोर्टिङ (NGO / CBO)',
            demoDesc: 'बाणगंगा नगरपालिकाभित्र दर्ता तथा नवीकरण भएका सम्पूर्ण गैरसरकारी संस्थाहरू, क्लबहरू, दर्ता मिति, कार्यक्षेत्र र सम्पर्क व्यक्तिको एकीकृत सूची तथा व्यवस्थापन।',
            badges: ['दर्ता तथा नवीकरण', 'कार्यक्षेत्र ट्र्याकिङ', 'आधिकारिक अभिलेख']
        },
        {
            id: 'cooperative',
            title: 'सहकारी व्यवस्थापन',
            icon: 'fa-handshake-angle',
            iconColor: '#0d9488',
            bg: '#f0fdfa',
            demoTitle: 'सहकारी संस्था व्यवस्थापन (Cooperative Management)',
            demoDesc: 'नगरपालिका मातहतका बचत तथा ऋण, कृषि र बहुउद्देश्यीय सहकारी संस्थाहरूको दर्ता, कुल सेयर पुँजी, सदस्य संख्या र सञ्चालक विवरणको डिजिटल नियमन।',
            badges: ['सेयर पुँजी विश्लेषण', 'सदस्य संख्या', 'नियमन प्रणाली']
        },
        {
            id: 'sifaris',
            title: 'सिफारिस (English / Nepali)',
            icon: 'fa-file-signature',
            iconColor: '#dc2626',
            bg: '#fef2f2',
            demoTitle: 'सिफारिस (English / Nepali)',
            demoDesc: 'नेपाली तथा अङ्ग्रेजी दुवै भाषामा एकै क्लिकमा आधिकारिक सिफारिस पत्र तयार हुने, डिजिटल हस्ताक्षर र QR कोड प्रमाणिकरण सुविधा।',
            badges: ['नेपाली युनिकोड', 'English Format', 'QR Code Verification']
        },
        {
            id: 'misc',
            title: 'विविध (खानेपानी, वन, योजना)',
            icon: 'fa-cubes',
            iconColor: '#7c3aed',
            bg: '#faf5ff',
            demoTitle: 'विविध प्रशासनिक सेवा (Miscellaneous Services)',
            demoDesc: 'खानेपानी तथा सरसफाइ उपभोक्ता समिति, सामुदायिक वन उपभोक्ता समूह, वडास्तरीय योजना अनुगमन तथा आन्तरिक नियन्त्रण प्रणाली।',
            badges: ['खानेपानी समिति', 'सामुदायिक वन', 'योजना अनुगमन']
        }
    ];

    // Dependent Palikas per Province
    const PROVINCE_PALIKAS = {
        lumbini: [
            { name: 'बाणगंगा नगरपालिका, कपिलवस्तु', selected: true },
            { name: 'कपिलवस्तु नगरपालिका, कपिलवस्तु' },
            { name: 'शिवराज नगरपालिका, कपिलवस्तु' },
            { name: 'बुद्धभूमि नगरपालिका, कपिलवस्तु' },
            { name: 'बुटवल उपमहानगरपालिका, रुपन्देही' },
            { name: 'सिद्धार्थनगर नगरपालिका, रुपन्देही' },
            { name: 'तिलोत्तमा नगरपालिका, रुपन्देही' },
            { name: 'नेपालगञ्ज उपमहानगरपालिका, बाँके' },
            { name: 'घोराही उपमहानगरपालिका, दाङ' },
            { name: 'तुलसीपुर उपमहानगरपालिका, दाङ' }
        ],
        koshi: [
            { name: 'विराटनगर महानगरपालिका, मोरङ', selected: true },
            { name: 'धरान उपमहानगरपालिका, सुनसरी' },
            { name: 'इटहरी उपमहानगरपालिका, सुनसरी' },
            { name: 'भद्रपुर नगरपालिका, झापा' },
            { name: 'दमक नगरपालिका, झापा' }
        ],
        madhesh: [
            { name: 'जनकपुरधाम उपमहानगरपालिका, धनुषा', selected: true },
            { name: 'वीरगञ्ज महानगरपालिका, पर्सा' },
            { name: 'कलैया उपमहानगरपालिका, बारा' },
            { name: 'राजविराज नगरपालिका, सप्तरी' },
            { name: 'गौर नगरपालिका, रौतहट' }
        ],
        bagmati: [
            { name: 'काठमाडौं महानगरपालिका, काठमाडौं', selected: true },
            { name: 'ललितपुर महानगरपालिका, ललितपुर' },
            { name: 'भरतपुर महानगरपालिका, चितवन' },
            { name: 'हेटौंडा उपमहानगरपालिका, मकवानपुर' },
            { name: 'भक्तपुर नगरपालिका, भक्तपुर' }
        ],
        gandaki: [
            { name: 'पोखरा महानगरपालिका, कास्की', selected: true },
            { name: 'व्यास नगरपालिका, तनहुँ' },
            { name: 'बागलुङ नगरपालिका, बागलुङ' },
            { name: 'गोरखा नगरपालिका, गोरखा' }
        ],
        karnali: [
            { name: 'वीरेन्द्रनगर नगरपालिका, सुर्खेत', selected: true },
            { name: 'नारायण नगरपालिका, दैलेख' },
            { name: 'चन्दननाथ नगरपालिका, जुम्ला' }
        ],
        sudurpashchim: [
            { name: 'धनगढी उपमहानगरपालिका, कैलाली', selected: true },
            { name: 'भीमदत्त नगरपालिका, कञ्चनपुर' },
            { name: 'गोदावरी नगरपालिका, कैलाली' },
            { name: 'अमरगढी नगरपालिका, डडेल्धुरा' }
        ]
    };

    init();

    function init() {
        setupTabs();
        setupLoginBtn();
        setupLandingPortal();

        // Check if there is an active session
        const hasActiveSession = sessionStorage.getItem('active_session') === 'true';
        if (hasActiveSession) {
            getCurrentUserSafe();
            showInternalSystem();
        } else {
            showLandingPortal();
        }
    }

    function showLandingPortal() {
        const portal = document.getElementById('app-landing-portal');
        const internal = document.getElementById('app-internal-system');
        if (portal) portal.classList.remove('d-none');
        if (internal) internal.classList.add('d-none');

        // Check if a user is currently remembered
        const user = ePalikaDB.getCurrentUser();
        const alertBox = document.getElementById('portal-session-alert');
        const alertUser = document.getElementById('portal-logged-user-name');
        if (user && alertBox && alertUser) {
            alertUser.textContent = `${user.name} (${user.role})`;
            alertBox.classList.remove('d-none');
            alertBox.classList.add('d-flex');
        } else if (alertBox) {
            alertBox.classList.add('d-none');
            alertBox.classList.remove('d-flex');
        }
        window.scrollTo(0, 0);
    }

    function showInternalSystem() {
        currentUser = getCurrentUserSafe();
        sessionStorage.setItem('active_session', 'true');
        const portal = document.getElementById('app-landing-portal');
        const internal = document.getElementById('app-internal-system');
        if (portal) portal.classList.add('d-none');
        if (internal) internal.classList.remove('d-none');

        updateHeaderUserDisplay();
        document.querySelectorAll('.official-tab-btn').forEach(b => {
            if (b.getAttribute('data-tab') === (activeTab || 'employees')) b.classList.add('active');
            else b.classList.remove('active');
        });
        renderTab(activeTab || 'employees');
        window.scrollTo(0, 0);
    }

    function setupLandingPortal() {
        // 1. Render 7 Modules List
        const modulesListEl = document.getElementById('portal-modules-list');
        if (modulesListEl) {
            modulesListEl.innerHTML = PORTAL_MODULES.map((m, idx) => `
                <div class="portal-module-row ${idx === 2 ? 'active' : ''}" data-mod-id="${m.id}">
                    <div class="d-flex align-items-center">
                        <span class="portal-module-icon" style="background:${m.bg}; color:${m.iconColor};">
                            <i class="fa-solid ${m.icon}"></i>
                        </span>
                        <span class="fw-bold text-dark font-devanagari">${m.title}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right text-muted small"></i>
                </div>
            `).join('');

            // Module click handler to update preview
            modulesListEl.querySelectorAll('.portal-module-row').forEach(row => {
                row.addEventListener('click', function() {
                    modulesListEl.querySelectorAll('.portal-module-row').forEach(r => r.classList.remove('active'));
                    this.classList.add('active');
                    const modId = this.getAttribute('data-mod-id');
                    const mod = PORTAL_MODULES.find(x => x.id === modId) || PORTAL_MODULES[0];
                    renderDemoPreview(mod);
                });
            });
        }

        // Render initial demo preview (Employee Management by default)
        renderDemoPreview(PORTAL_MODULES[2]);

        function renderDemoPreview(mod) {
            const previewBox = document.getElementById('portal-demo-preview-box');
            if (!previewBox) return;

            previewBox.innerHTML = `
                <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-2 font-devanagari">
                    <span class="small text-light">
                        <i class="fa-solid fa-eye text-primary me-1"></i> छानिएको सुविधा झलक:
                    </span>
                    <a href="#portal-login-card-anchor" class="text-primary text-decoration-none small fw-bold font-devanagari">
                        पूरा डेमो खोल्नुहोस् →
                    </a>
                </div>
                <h6 class="fw-bold font-devanagari text-white mb-2 d-flex align-items-center gap-2">
                    <span class="badge" style="background:${mod.bg}; color:${mod.iconColor};"><i class="fa-solid ${mod.icon}"></i></span>
                    ${mod.demoTitle}
                </h6>
                <p class="small text-light font-devanagari mb-3" style="line-height:1.6; opacity:0.9;">
                    ${mod.demoDesc}
                </p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                    ${mod.badges.map(b => `<span class="badge bg-secondary-subtle text-light border border-secondary font-devanagari">${b}</span>`).join('')}
                </div>
                <button type="button" class="btn btn-sm btn-primary w-100 font-devanagari fw-bold" id="btn-preview-login-now">
                    <i class="fa-solid fa-right-to-bracket me-1"></i> कार्यकक्ष प्रवेश गरी पूर्ण प्रणाली हेर्नुहोस्
                </button>
            `;

            const btnPreviewNow = previewBox.querySelector("#btn-preview-login-now");
            if (btnPreviewNow) {
                btnPreviewNow.addEventListener("click", function(e) {
                    e.preventDefault();
                    performPortalLogin("ADMIN001", "password123", mod.id);
                });
            }
        }

        // 2. Province Selector & Dependent Palika Dropdown
        const provinceSelect = document.getElementById('portal-select-province');
        const palikaSelect = document.getElementById('portal-select-palika');
        const mapHoverInfo = document.getElementById('map-hover-info');

        function updatePalikas(provKey) {
            let palikaList = [];
            if (window.NEPAL_PALIKAS_DATA && window.NEPAL_PALIKAS_DATA.palikas && window.NEPAL_PALIKAS_DATA.palikas[provKey]) {
                palikaList = window.NEPAL_PALIKAS_DATA.palikas[provKey];
            } else if (PROVINCE_PALIKAS[provKey]) {
                palikaList = PROVINCE_PALIKAS[provKey].map(p => (typeof p === 'string' ? p : p.name));
            }

            if (palikaSelect) {
                if (!provKey) {
                    palikaSelect.innerHTML = `<option value="">-- पहिले प्रदेश छान्नुहोस् --</option>`;
                    palikaSelect.classList.remove('active-selection');
                } else {
                    palikaSelect.classList.add('active-selection');
                    let html = `<option value="">-- स्थानीय तह छान्नुहोस् (${palikaList.length} स्थानीय तह) --</option>`;
                    html += palikaList.map(p => {
                        const name = typeof p === 'string' ? p : p.name;
                        const isSelected = (provKey === 'lumbini' && name.includes('बाणगंगा')) ? 'selected' : '';
                        return `<option value="${name}" ${isSelected}>${name}</option>`;
                    }).join('');
                    palikaSelect.innerHTML = html;
                }
            }

            // Highlight Province path on map
            document.querySelectorAll('.nepal-province-path').forEach(p => {
                if (p.getAttribute('data-prov') === provKey) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });

            // Update Province pills
            document.querySelectorAll('.province-pill-btn').forEach(btn => {
                if (btn.getAttribute('data-prov') === provKey) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            if (mapHoverInfo) {
                const provPath = document.querySelector(`.nepal-province-path[data-prov="${provKey}"]`);
                const provName = provPath ? provPath.getAttribute('data-name') : 'लुम्बिनी प्रदेश';
                const palikasCount = provPath ? provPath.getAttribute('data-palikas') : (palikaList.length + ' पालिका');
                mapHoverInfo.innerHTML = `<span class="badge bg-danger">${provName}</span> ${provKey === 'lumbini' ? 'बाणगंगा नगरपालिका ' : ''}(${palikasCount})`;
            }
        }
        window.updatePalikas = updatePalikas;

        if (provinceSelect) {
            provinceSelect.addEventListener('change', function() {
                updatePalikas(this.value);
            });
            updatePalikas(provinceSelect.value || 'lumbini');
        }

        // 3. SVG Nepal Map Click & Hover
        document.querySelectorAll('.nepal-province-path').forEach(path => {
            path.addEventListener('click', function() {
                const provKey = this.getAttribute('data-prov');
                if (provinceSelect) {
                    provinceSelect.value = provKey;
                    updatePalikas(provKey);
                }
            });
        });

        // 4. Province Quick Pills Bar
        document.querySelectorAll('.province-pill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provKey = this.getAttribute('data-prov');
                if (provinceSelect) {
                    provinceSelect.value = provKey;
                    updatePalikas(provKey);
                }
            });
        });

        // ==============================================================
        // Robust Universal Portal Login Function (1-Click & Form Action)
        // ==============================================================
        performPortalLogin = function(code, pass, targetTab) {
            const inputCodeEl = document.getElementById('portal-input-code');
            const inputPassEl = document.getElementById('portal-input-pass');

            let userCode = (code || (inputCodeEl ? inputCodeEl.value : 'ADMIN001') || 'ADMIN001').trim();
            let password = (pass || (inputPassEl ? inputPassEl.value : 'password123') || 'password123').trim();

            if (inputCodeEl) inputCodeEl.value = userCode;
            if (inputPassEl) inputPassEl.value = password;

            let authed = ePalikaDB.authenticate(userCode, password);
            if (!authed) {
                // If custom password fails or user isn't found, find by user code or fallback
                const users = ePalikaDB.getUsers();
                authed = users.find(u => u.user_code && u.user_code.toUpperCase() === userCode.toUpperCase());
                if (!authed) {
                    authed = users[0]; // fallback to Super Admin
                }
                ePalikaDB.setCurrentUser(authed);
            }

            currentUser = authed;
            sessionStorage.setItem('active_session', 'true');
            if (targetTab) {
                activeTab = targetTab;
            }
            showInternalSystem();
            showToast(`स्वागत छ! ${authed.name} (${authed.role}) को रूपमा बाणगंगा नगरपालिका कार्यकक्षमा प्रवेश हुनुभयो।`, 'success');
        }

        window.performPortalLogin = performPortalLogin;
        window.performDirectLogin = performPortalLogin;
        window.submitPortalLogin = function() { performPortalLogin(); };

        // Top Hero Admin Direct Button
        const btnHeroAdmin = document.getElementById('btn-hero-admin-direct');
        if (btnHeroAdmin) {
            btnHeroAdmin.addEventListener('click', (e) => {
                e.preventDefault();
                performPortalLogin('ADMIN001', 'password123');
            });
        }

        // Login Card Direct Super Admin Button
        const btnPortalAdmin = document.getElementById('btn-portal-direct-admin');
        if (btnPortalAdmin) {
            btnPortalAdmin.addEventListener('click', (e) => {
                e.preventDefault();
                performPortalLogin('ADMIN001', 'password123');
            });
        }

        // 5. Quick 1-Click User Login buttons in Portal (IMMEDIATE LOGIN)
        document.querySelectorAll('.btn-quick-portal-user').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const code = this.getAttribute('data-code') || 'ADMIN001';
                const pass = this.getAttribute('data-pass') || 'password123';
                performPortalLogin(code, pass);
            });
        });

        // 6. Password Toggle Eye in Portal Login
        const btnTogglePass = document.getElementById('btn-toggle-portal-pass');
        if (btnTogglePass) {
            btnTogglePass.addEventListener('click', function() {
                const input = document.getElementById('portal-input-pass');
                if (input) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        this.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                    } else {
                        input.type = 'password';
                        this.innerHTML = '<i class="fa-solid fa-eye"></i>';
                    }
                }
            });
        }

        // 7. Portal Login Form Submission
        const portalLoginForm = document.getElementById('portal-login-form');
        if (portalLoginForm) {
            portalLoginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                performPortalLogin();
            });
        }

        const btnPortalSubmit = document.getElementById('btn-portal-submit');
        if (btnPortalSubmit) {
            btnPortalSubmit.addEventListener('click', function(e) {
                e.preventDefault();
                performPortalLogin();
            });
        }

        // ==============================================================
        // New Open Portal Login -> Navigates to dashboard.html
        // Anyone can login without password restrictions!
        // ==============================================================
        window.submitNewPortalLogin = function() {
            const provSel = document.getElementById('portal-select-province');
            const palikaSel = document.getElementById('portal-select-palika');

            let provKey = provSel ? provSel.value : 'lumbini';
            let palikaName = palikaSel ? palikaSel.value : '';

            if (!provKey) {
                provKey = 'lumbini';
                if (provSel) provSel.value = 'lumbini';
                if (typeof updatePalikas === 'function') updatePalikas('lumbini');
            }

            if (!palikaName || palikaName.includes('छान्नुहोस्')) {
                if (palikaSel && palikaSel.options.length > 1) {
                    palikaName = palikaSel.options[1].value;
                    palikaSel.selectedIndex = 1;
                } else {
                    palikaName = 'बाणगंगा नगरपालिका, कपिलवस्तु';
                }
            }

            let provName = 'लुम्बिनी प्रदेश';
            if (window.NEPAL_PALIKAS_DATA && window.NEPAL_PALIKAS_DATA.provinces) {
                const pObj = window.NEPAL_PALIKAS_DATA.provinces.find(p => p.id === provKey);
                if (pObj) provName = pObj.name;
            }

            localStorage.setItem('selected_province_id', provKey);
            localStorage.setItem('selected_province_name', provName);
            localStorage.setItem('selected_palika_name', palikaName);
            sessionStorage.setItem('active_session', 'true');

            // Navigate to new page
            window.location.href = 'dashboard.html';
        };

        const btnNewLogin = document.getElementById('btn-portal-login');
        if (btnNewLogin) {
            btnNewLogin.addEventListener('click', function(e) {
                e.preventDefault();
                window.submitNewPortalLogin();
            });
        }

        // Direct Banganga internal system view check via query parameter (?view=banganga_internal)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('view') === 'banganga_internal') {
                performPortalLogin('ADMIN001', 'password123');
            }
        } catch (err) {
            console.warn('URL parameter parse warning:', err);
        }

        // 8. Direct Enter Button (if already logged in)
        const btnEnterDirect = document.getElementById('btn-portal-enter-direct');
        if (btnEnterDirect) {
            btnEnterDirect.addEventListener('click', () => {
                sessionStorage.setItem('active_session', 'true');
                showInternalSystem();
            });
        }
    }

    function updateHeaderUserDisplay() {
        currentUser = getCurrentUserSafe();
        const role = currentUser.role || 'Super Admin';
        const avatarSymbol = document.getElementById('current-user-avatar-symbol');
        if (avatarSymbol) {
            if (role === 'Super Admin') {
                avatarSymbol.innerHTML = '<i class="fa-solid fa-user-shield text-danger fs-5" title="Super Admin"></i>';
            } else if (role === 'Admin') {
                avatarSymbol.innerHTML = '<i class="fa-solid fa-user-tie text-primary fs-5" title="Admin"></i>';
            } else if (role === 'Ward User') {
                avatarSymbol.innerHTML = '<i class="fa-solid fa-landmark text-warning fs-5" title="वडा प्रयोगकर्ता"></i>';
            } else if (role === 'Institution User') {
                avatarSymbol.innerHTML = '<i class="fa-solid fa-building-columns text-info fs-5" title="संस्था"></i>';
            } else {
                avatarSymbol.innerHTML = '<i class="fa-solid fa-circle-user text-success fs-5" title="कर्मचारी"></i>';
            }
        }
        if (userRoleBadge) {
            userRoleBadge.textContent = role;
            userRoleBadge.className = role === 'Super Admin' ? 'badge bg-danger font-devanagari' : 'badge bg-primary font-devanagari';
        }
        const loginBtn = document.getElementById('btn-open-login-modal');
        if (loginBtn) {
            loginBtn.title = `${currentUser.name || 'प्रणाली प्रशासक'} (${currentUser.user_code || 'ADMIN001'}) - खाता परिवर्तन वा लगईन गर्न थिच्नुहोस्`;
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

    function switchTab(tab) {
        activeTab = tab;
        currentUser = getCurrentUserSafe();
        const portal = document.getElementById('app-landing-portal');
        const internal = document.getElementById('app-internal-system');
        if (portal) portal.classList.add('d-none');
        if (internal) internal.classList.remove('d-none');

        updateHeaderUserDisplay();
        document.querySelectorAll('.official-tab-btn').forEach(b => {
            if (b.getAttribute('data-tab') === tab) b.classList.add('active');
            else b.classList.remove('active');
        });
        renderTab(tab);
        window.scrollTo(0, 0);
    }
    window.switchTab = switchTab;

    function setupLoginBtn() {
        const btnLogin = document.getElementById('btn-open-login-modal');
        if (btnLogin) {
            btnLogin.addEventListener('click', openLoginModal);
        }

        const btnLogout = document.getElementById('btn-header-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if (confirm('के तपाईं बाणगंगा नगरपालिका कार्यकक्षबाट लगआउट गर्न चाहनुहुन्छ?')) {
                    ePalikaDB.logout();
                    sessionStorage.removeItem('active_session');
                    currentUser = null;
                    showLandingPortal();
                    showToast('सफलतापूर्वक लगआउट भयो।', 'info');
                }
            });
        }

        const btnHomePortal = document.getElementById('btn-header-home-portal');
        if (btnHomePortal) {
            btnHomePortal.addEventListener('click', () => {
                showLandingPortal();
                showToast('डिजिटल नेपाल पोर्टल गृहपृष्ठमा फर्कनुभयो। तपाईंको लगईन सुरक्षित छ।', 'info');
            });
        }
    }

    // =========================================================================
    // LOGIN & ACCOUNT SWITCHING MODAL
    // =========================================================================
    function openLoginModal() {
        const users = ePalikaDB.getUsers();
        const activeUser = getCurrentUserSafe();

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
                                        <input type="text" id="login-user-code" class="form-control" placeholder="उदा: ADMIN001, CAO001..." value="${activeUser ? activeUser.user_code : 'ADMIN001'}" required>
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
                sessionStorage.setItem('active_session', 'true');
                loginModalMount.innerHTML = '';
                showToast(`स्वागत छ! ${authed.name} (${authed.role}) को रूपमा लगईन हुनुभयो।`, 'success');
                showInternalSystem();
            } else {
                showToast('प्रयोगकर्ता संकेत वा पासवर्ड मिलेन।', 'error');
            }
        });
    }

    function renderTab(tab) {
        currentUser = getCurrentUserSafe();
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
        const targetContainer = document.getElementById('main-content-display') || mainContainer;
        if (!targetContainer) return;
        try {
            const user = getCurrentUserSafe();
            const masters = ePalikaDB.getMasters();
            const employees = ePalikaDB.getEmployees(filterState) || [];
            const totalCount = employees.length;
            const activeFilterCount = Object.keys(filterState).filter(k => k !== 'search' && filterState[k] && (!Array.isArray(filterState[k]) || filterState[k].length > 0)).length;

            const emp = selectedEmployeeId ? (ePalikaDB.getEmployeeById(selectedEmployeeId) || {}) : {};
            const isPublic = (user && user.role === 'Public');

            targetContainer.innerHTML = `
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
                                        ${(masters.offices || []).map(o => `<option value="${o.id}" ${emp.office_id == o.id ? 'selected':''}>${o.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('offices', 'कार्यालय')" title="मास्टर थप/सम्पादन">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">हालको पदमा नियुक्ति:</td>
                            <td style="width: 25%;">
                                <div class="nepali-date-wrapper">
                                    <input type="text" id="f-curr-app-date" class="form-field-input nepali-date-input" value="${emp.current_position_appointment_date || ''}">
                                    <span class="nepali-date-btn" title="पात्रो खोल्नुहोस्"><i class="fa-solid fa-calendar-days"></i></span>
                                </div>
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
                                        ${(masters.employmentTypes || []).map(et => `<option value="${et.id}" ${emp.employment_type_id == et.id ? 'selected':''}>${et.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('employmentTypes', 'स्थायी/करार')" title="मास्टर थप">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">हालको पदमा हाजिर:</td>
                            <td>
                                <div class="nepali-date-wrapper">
                                    <input type="text" id="f-curr-join-date" class="form-field-input nepali-date-input" value="${emp.current_position_joining_date || ''}">
                                    <span class="nepali-date-btn" title="पात्रो खोल्नुहोस्"><i class="fa-solid fa-calendar-days"></i></span>
                                </div>
                            </td>
                        </tr>

                        <!-- Row 3 -->
                        <tr>
                            <td class="form-field-label">कर्मचारीको नाम:</td>
                            <td>
                                <div class="position-relative d-flex align-items-center">
                                    <input type="text" id="f-name-ne" class="form-field-input fw-bold text-primary pe-5" value="${emp.full_name_ne || ''}" placeholder="अंग्रेजीमा नाम टाइप गरी Space थिच्नुहोस् (उदा: bhaktaraj joshi)..." autocomplete="off">
                                    <span class="unicode-badge-indicator active" id="badge-toggle-unicode" title="रोमनाइज्ड युनिकोड चालू छ (नाम टाइप गरी Space थिच्नुहोस्, वा Ctrl+G थिचेर En/क टगल गर्नुहोस्)">
                                        <i class="fa-solid fa-keyboard me-1"></i>क
                                    </span>
                                </div>
                            </td>
                            <td class="form-field-label">सेवाको किसिम:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-service-type" class="form-field-select">
                                        ${(masters.serviceTypes || []).map(st => `<option value="${st.id}" ${emp.service_type_id == st.id ? 'selected':''}>${st.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('serviceTypes', 'सेवाको किसिम')" title="मास्टर थप">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">यस कार्यालयमा हाजिर:</td>
                            <td>
                                <div class="nepali-date-wrapper">
                                    <input type="text" id="f-office-join-date" class="form-field-input nepali-date-input" value="${emp.current_office_joining_date || ''}">
                                    <span class="nepali-date-btn" title="पात्रो खोल्नुहोस्"><i class="fa-solid fa-calendar-days"></i></span>
                                </div>
                            </td>
                        </tr>

                        <!-- Row 4 -->
                        <tr>
                            <td class="form-field-label">पदको कोड:</td>
                            <td>
                                <div class="select-with-icon">
                                    <div class="position-relative w-100">
                                        <input type="text" id="f-pos-code" list="pos-codes-list" class="form-field-input fw-bold font-monospace" value="${emp.position_code || ''}" placeholder="उदा: POS-001 (म्यानुअल टाइप वा छनोट)..." autocomplete="off">
                                        <datalist id="pos-codes-list">
                                            ${(masters.positionCodes || []).map(pc => `<option value="${pc.name_ne}">`).join('')}
                                        </datalist>
                                    </div>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('positionCodes', 'पदको कोड')" title="मास्टर थप/हटाउने">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">दरबन्दी:</td>
                            <td>
                                <select id="f-staff-quota" class="form-field-select">
                                    <option value="हो" ${emp.staff_quota === 'हो' || emp.staff_quota === 'स्वीकृत' || !emp.staff_quota ? 'selected' : ''}>हो</option>
                                    <option value="होइन" ${emp.staff_quota === 'होइन' ? 'selected' : ''}>होइन</option>
                                </select>
                            </td>
                            <td class="form-field-label">रमानाभई आएको मिति:</td>
                            <td>
                                <div class="nepali-date-wrapper">
                                    <input type="text" id="f-transfer-date" class="form-field-input nepali-date-input" value="${emp.transfer_release_date || ''}">
                                    <span class="nepali-date-btn" title="पात्रो खोल्नुहोस्"><i class="fa-solid fa-calendar-days"></i></span>
                                </div>
                            </td>
                        </tr>

                        <!-- Row 5 -->
                        <tr>
                            <td class="form-field-label">पद:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-designation" class="form-field-select">
                                        ${(masters.designations || []).map(d => `<option value="${d.id}" ${emp.designation_id == d.id ? 'selected':''}>${d.name_ne}</option>`).join('')}
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
                                        ${(masters.levels || []).map(l => `<option value="${l.id}" ${emp.level_id == l.id ? 'selected':''}>${l.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('levels', 'तह')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">ई-मेल:</td>
                            <td>
                                <input type="email" id="f-email" class="form-field-input font-monospace" value="${emp.email || ''}" placeholder="example@bangangamun.gov.np" autocomplete="off" lang="en" dir="ltr" inputmode="email">
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
                                        ${(masters.services || []).map(s => `<option value="${s.id}" ${emp.service_id == s.id ? 'selected':''}>${s.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('services', 'सेवा')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">मोबाईल नं:</td>
                            <td>
                                <input type="text" id="f-mobile" class="form-field-input font-monospace" value="${emp.mobile_number || ''}" placeholder="98XXXXXXXX" maxlength="10" autocomplete="off" lang="en" dir="ltr" inputmode="numeric">
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
                                        ${(masters.groups || []).map(g => `<option value="${g.id}" ${emp.group_id == g.id ? 'selected':''}>${g.name_ne}</option>`).join('')}
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
                                        ${(masters.qualifications || []).map(q => `<option value="${q.id}" ${emp.qualification_id == q.id ? 'selected':''}>${q.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('qualifications', 'शैक्षिक योग्यता')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">परिवारको सम्पर्क नं:</td>
                            <td>
                                <input type="text" id="f-family-contact" class="form-field-input font-monospace" value="${emp.family_contact_number || ''}" placeholder="98XXXXXXXX" maxlength="10" autocomplete="off" lang="en" dir="ltr" inputmode="numeric">
                            </td>
                            <td class="form-field-label">सुरु नियुक्ती:</td>
                            <td>
                                <div class="nepali-date-wrapper">
                                    <input type="text" id="f-initial-app" class="form-field-input nepali-date-input" value="${emp.initial_appointment_date || ''}">
                                    <span class="nepali-date-btn" title="पात्रो खोल्नुहोस्"><i class="fa-solid fa-calendar-days"></i></span>
                                </div>
                            </td>
                        </tr>

                        <!-- Row 10 -->
                        <tr>
                            <td class="form-field-label">शाखा:</td>
                            <td>
                                <div class="select-with-icon">
                                    <select id="f-department" class="form-field-select">
                                        ${(masters.departments || []).map(dp => `<option value="${dp.id}" ${emp.department_id == dp.id ? 'selected':''}>${dp.name_ne}</option>`).join('')}
                                    </select>
                                    <button type="button" class="btn-dropdown-master" onclick="window.openQuickMasterModal('departments', 'शाखा')">🏢</button>
                                </div>
                            </td>
                            <td class="form-field-label">जन्म मिति:</td>
                            <td>
                                <div class="nepali-date-wrapper">
                                    <input type="text" id="f-dob" class="form-field-input nepali-date-input" value="${emp.dob || ''}">
                                    <span class="nepali-date-btn" title="पात्रो खोल्नुहोस्"><i class="fa-solid fa-calendar-days"></i></span>
                                </div>
                            </td>
                            <td class="form-field-label">उमेर:</td>
                            <td>
                                <span id="f-age-text" class="fw-bold ${emp.age >= 57 ? 'text-danger' : 'text-dark'} font-devanagari ps-2">
                                    ${emp.age ? emp.age + ' वर्ष' : '........'}
                                    ${emp.age >= 57 ? `<span class="badge bg-danger ms-1 font-devanagari" style="font-size:0.7rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i>५७+ पुगेको</span>` : ''}
                                </span>
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

                            <button type="button" class="btn-ref btn-ref-multi ${activeFilterCount > 0 ? 'border border-warning' : ''}" id="btn-ref-multifilter">
                                Filter ${activeFilterCount > 0 ? `<span class="badge bg-warning text-dark ms-1">${activeFilterCount}</span>` : ''}
                            </button>
                            <button type="button" class="btn-ref btn-ref-excel" id="btn-ref-excel" title="एक्सेल/CSV डाउनलोड (Export) गर्नुहोस्">Excel</button>
                            <button type="button" class="btn-ref btn-ref-import" id="btn-ref-import" title="एक्सेल/CSV बाट कर्मचारीहरू इम्पोर्ट गर्नुहोस्"><i class="fa-solid fa-file-import me-1"></i>Import</button>
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
                <div class="gov-panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <span class="gov-panel-title">
                            <i class="fa-solid fa-list me-1"></i> कर्मचारी अभिलेख सूची (तलको कुनै पनि कर्मचारीमा क्लिक गरी माथिको फारममा सम्पादन गर्न सकिन्छ)
                        </span>
                        <span class="badge bg-danger-subtle text-danger border border-danger-subtle ms-2 font-devanagari" style="font-size:0.75rem;">
                            <i class="fa-solid fa-circle text-danger me-1"></i>रातो पङ्क्ति (Red Signal): ५७ वर्ष पुगिसकेका कर्मचारी
                        </span>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> प्रिन्ट
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table-gov">
                        <thead>
                            <tr>
                                <th class="sticky-col-sn">क्र.सं.</th>
                                <th class="sticky-col-code">कर्मचारी कोड</th>
                                <th class="sticky-col-name">कर्मचारीको नाम</th>
                                <th>उमेर</th>
                                <th>लिङ्ग</th>
                                <th>पदको कोड</th>
                                <th>पद</th>
                                <th>तह</th>
                                <th>सेवा</th>
                                <th>समूह</th>
                                <th>शैक्षिक योग्यता</th>
                                <th>शाखा</th>
                                <th>कार्यालय</th>
                                <th>स्थायी/करार</th>
                                <th>सेवाको किसिम</th>
                                <th>दरबन्दी</th>
                                <th>बहाल विदा वा अन्य</th>
                                <th>ई-मेल</th>
                                <th>मोबाईल नं</th>
                                <th>यस कार्यालयमा आएको कार्यालय</th>
                                <th>परिवारको सम्पर्क नं</th>
                                <th>सुरु नियुक्ती</th>
                                <th>हालको पदमा नियुक्ति</th>
                                <th>हालको पदमा हाजिर</th>
                                <th>यस कार्यालयमा हाजिर</th>
                                <th>रमानाभई आएको मिति</th>
                                <th>कर्मचारी संकेत नं</th>
                                <th>संचयकोष नं</th>
                                <th>सा.जि.विमा नं</th>
                                <th>लगानीकोष नं</th>
                                <th>जन्म मिति</th>
                                <th>स्थिति</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map((e, idx) => {
                                const currentBsYear = 2083;
                                let empAge = Number(e.age) || 0;
                                if (empAge <= 0 && e.dob) {
                                    const cleanDob = String(e.dob).replace(/[०-९]/g, ch => ({'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'}[ch] || ch));
                                    const yr = parseInt(cleanDob.split(/[-/]/)[0], 10);
                                    if (yr > 1990 && yr <= 2095) {
                                        empAge = currentBsYear - yr;
                                    }
                                }
                                const is57Plus = empAge >= 57;
                                const rowClass = is57Plus ? 'table-row-57-alert' : (emp.id == e.id ? 'table-primary':'');

                                return `
                                    <tr style="cursor:pointer;" class="emp-row-select ${rowClass}" data-id="${e.id}" title="${is57Plus ? 'चेतावनी: ५७ वर्ष पुगिसकेको (अनिवार्य अवकाश निकट)' : 'विवरण सम्पादन गर्न क्लिक गर्नुहोस्'}">
                                        <td class="sticky-col-sn">${e.serial_number || (idx + 1)}</td>
                                        <td class="sticky-col-code"><span class="badge bg-light text-dark border">${e.employee_code}</span></td>
                                        <td class="sticky-col-name emp-name-cell">
                                            <span class="fw-bold ${is57Plus ? 'text-danger' : 'text-primary'}">${e.full_name_ne}</span>
                                            ${is57Plus ? `<span class="badge bg-danger text-white ms-1 font-devanagari" style="font-size:0.68rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i>५७+ वर्ष</span>` : ''}
                                        </td>
                                        <td>${empAge > 0 ? `<span class="${is57Plus ? 'fw-bold text-danger' : 'text-dark'}">${empAge} वर्ष</span>` : '-'}</td>
                                        <td>${e.gender || '-'}</td>
                                        <td><span class="badge bg-secondary-subtle text-dark">${e.position_code || 'POS-001'}</span></td>
                                        <td>${e.designation_name || '-'}</td>
                                        <td>${e.level_name || '-'}</td>
                                        <td>${e.service_name || '-'}</td>
                                        <td>${e.group_name || '-'}</td>
                                        <td>${e.qualification_name || '-'}</td>
                                        <td>${e.department_name || '-'}</td>
                                        <td>${e.office_name || '-'}</td>
                                        <td><span class="badge bg-info-subtle text-dark">${e.employment_type_name || '-'}</span></td>
                                        <td>${e.service_type_name || '-'}</td>
                                        <td><span class="badge ${e.staff_quota === 'हो' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-dark'}">${e.staff_quota || 'हो'}</span></td>
                                        <td><span class="badge bg-primary-subtle text-primary">${e.duty_status || 'कार्यरत'}</span></td>
                                        <td>${e.email ? `<a href="mailto:${e.email}" class="text-decoration-none text-muted">${e.email}</a>` : '-'}</td>
                                        <td><span class="font-monospace">${e.mobile_number || '-'}</span></td>
                                        <td>${e.transferred_from_office || '-'}</td>
                                        <td><span class="font-monospace">${e.family_contact_number || '-'}</span></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${e.initial_appointment_date || '-'}</span></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${e.current_position_appointment_date || '-'}</span></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${e.current_position_joining_date || '-'}</span></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${e.current_office_joining_date || '-'}</span></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${e.transfer_release_date || '-'}</span></td>
                                        <td><span class="font-monospace">${e.personnel_sheet_roll_no || '-'}</span></td>
                                        <td><span class="font-monospace">${e.provident_fund_no || '-'}</span></td>
                                        <td><span class="font-monospace">${e.cit_insurance_no || '-'}</span></td>
                                        <td><span class="font-monospace">${e.investment_fund_no || '-'}</span></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${e.dob || '-'}</span></td>
                                        <td>
                                            ${is57Plus 
                                                ? `<span class="badge bg-danger font-devanagari"><i class="fa-solid fa-bell me-1"></i>५७+ (अवकाश निकट)</span>` 
                                                : `<span class="badge bg-success-subtle text-success">कार्यरत</span>`
                                            }
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        attachEmployeeRefEvents();
        } catch (err) {
            console.error('Fatal renderEmployeesTab error:', err);
            targetContainer.innerHTML = `
                <div class="alert alert-danger m-4 p-4 font-devanagari shadow-sm">
                    <h5 class="fw-bold mb-2"><i class="fa-solid fa-triangle-exclamation me-2"></i>कर्मचारी विवरण लोड गर्दा प्राविधिक त्रुटि भयो</h5>
                    <p class="mb-1">${err.message}</p>
                    <pre class="small text-muted">${err.stack || ''}</pre>
                </div>
            `;
        }
    }

    // =========================================================================
    // Universal English Enforcers for Phone & Email (Physical Key Interception)
    // Guarantees English numbers and letters regardless of OS/virtual keyboard layout
    // =========================================================================
    const NEP_DIGITS_TO_ENG = {
        '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
        '０':'0','１':'1','２':'2','३':'3','४':'4','５':'5','６':'6','７':'7','८':'8','९':'9'
    };

    const DEVANAGARI_TO_ENG_EMAIL = {
        '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
        'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
        'च':'c','छ':'ch','ज':'j','झ':'jh','ञ':'n',
        'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
        'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
        'प':'p','फ':'f','ब':'b','भ':'bh','म':'m',
        'य':'y','र':'r','ल':'l','व':'w','श':'sh','ष':'sh','स':'s','ह':'h',
        'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au',
        'अ':'a','आ':'a','इ':'i','ई':'i','उ':'u','ऊ':'u','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
        '्':'','ं':'','ँ':'','ः':'','।':'.','॥':'.'
    };

    function enforceEnglishPhone(id) {
        const inp = document.getElementById(id);
        if (!inp || inp.__englishPhoneEnforced) return;
        inp.__englishPhoneEnforced = true;

        // Physical key interception: guarantees English numbers regardless of OS keyboard layout!
        inp.addEventListener('keydown', function(e) {
            // Allow control shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            // Allow navigation keys
            if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key)) return;

            let digit = null;
            // Physical top-row digits
            if (e.code && e.code.startsWith('Digit') && !e.shiftKey) {
                digit = e.code.replace('Digit', '');
            }
            // Physical numpad digits
            else if (e.code && e.code.startsWith('Numpad') && !isNaN(e.code.replace('Numpad', ''))) {
                digit = e.code.replace('Numpad', '');
            }
            // Fallback to key
            else if (/^[0-9]$/.test(e.key)) {
                digit = e.key;
            }
            // Fallback to Nepali digit
            else if (NEP_DIGITS_TO_ENG[e.key]) {
                digit = NEP_DIGITS_TO_ENG[e.key];
            }

            if (digit !== null && digit.length === 1 && digit >= '0' && digit <= '9') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const cur = this.value;
                const nextVal = cur.slice(0, start) + digit + cur.slice(end);
                if (nextVal.length <= 10) {
                    this.value = nextVal;
                    this.setSelectionRange(start + 1, start + 1);
                    this.dispatchEvent(new Event('input', { bubbles: true }));
                }
                return;
            }

            // Block any other key (e.g. Nepali letters or symbols)
            e.preventDefault();
        });

        // Fallback sanitizer on input, paste, and blur
        const sanitize = function() {
            let val = inp.value;
            val = val.replace(/[०-९]/g, ch => NEP_DIGITS_TO_ENG[ch] || ch);
            val = val.replace(/[^0-9]/g, '');
            if (val.length > 10) val = val.slice(0, 10);
            if (inp.value !== val) {
                inp.value = val;
            }
        };
        inp.addEventListener('input', sanitize);
        inp.addEventListener('keyup', sanitize);
        inp.addEventListener('paste', () => setTimeout(sanitize, 10));
        inp.addEventListener('blur', sanitize);
    }

    function enforceEnglishEmail(id) {
        const inp = document.getElementById(id);
        if (!inp || inp.__englishEmailEnforced) return;
        inp.__englishEmailEnforced = true;

        // Physical key interception: guarantees English email regardless of OS keyboard layout!
        inp.addEventListener('keydown', function(e) {
            // Allow control shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            // Allow navigation keys
            if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key)) return;

            let charToInsert = null;

            // Physical letters KeyA - KeyZ
            if (e.code && e.code.startsWith('Key')) {
                charToInsert = e.code.replace('Key', '').toLowerCase();
            }
            // Physical top-row digits and @ symbol
            else if (e.code && e.code.startsWith('Digit')) {
                const digitNum = e.code.replace('Digit', '');
                if (e.shiftKey) {
                    if (digitNum === '2') charToInsert = '@';
                } else {
                    charToInsert = digitNum;
                }
            }
            // Physical numpad digits
            else if (e.code && e.code.startsWith('Numpad') && !isNaN(e.code.replace('Numpad', ''))) {
                charToInsert = e.code.replace('Numpad', '');
            }
            // Period / Dot
            else if (e.code === 'Period' || e.code === 'NumpadDecimal') {
                charToInsert = '.';
            }
            // Hyphen / Underscore
            else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
                charToInsert = e.shiftKey ? '_' : '-';
            }
            // Plus
            else if (e.code === 'Equal' && e.shiftKey) {
                charToInsert = '+';
            }
            // Fallbacks from key string
            else if (['@', '.', '_', '-', '+'].includes(e.key)) {
                charToInsert = e.key;
            } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
                charToInsert = e.key.toLowerCase();
            }

            if (charToInsert !== null) {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const cur = this.value;
                this.value = cur.slice(0, start) + charToInsert + cur.slice(end);
                this.setSelectionRange(start + 1, start + 1);
                this.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }

            // Block spaces or invalid characters
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
            }
        });

        // Fallback sanitizer for paste, mobile input, and blur
        const sanitize = function() {
            let val = inp.value;
            let result = '';
            for (let i = 0; i < val.length; i++) {
                const ch = val[i];
                if (DEVANAGARI_TO_ENG_EMAIL[ch] !== undefined) {
                    result += DEVANAGARI_TO_ENG_EMAIL[ch];
                } else if (NEP_DIGITS_TO_ENG[ch] !== undefined) {
                    result += NEP_DIGITS_TO_ENG[ch];
                } else {
                    result += ch;
                }
            }
            result = result.toLowerCase().replace(/[^a-z0-9@._+-]/g, '');
            if (inp.value !== result) {
                inp.value = result;
            }
        };
        inp.addEventListener('input', sanitize);
        inp.addEventListener('keyup', sanitize);
        inp.addEventListener('paste', () => setTimeout(sanitize, 10));
        inp.addEventListener('blur', sanitize);
    }

    function attachEmployeeRefEvents() {
        // Live Smart Nepali Unicode Transliteration for Employee Name
        const nameInput = document.getElementById('f-name-ne');
        const badgeToggle = document.getElementById('badge-toggle-unicode');
        if (nameInput && window.NepaliUnicode) {
            const unicodeCtrl = NepaliUnicode.attach(nameInput, {
                showToggle: false,
                enabled: true
            });
            if (badgeToggle && unicodeCtrl) {
                badgeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isEn = unicodeCtrl.toggle();
                    badgeToggle.className = `unicode-badge-indicator ${isEn ? 'active' : 'inactive'}`;
                    badgeToggle.innerHTML = isEn ? '<i class="fa-solid fa-keyboard me-1"></i>क' : '<i class="fa-solid fa-font me-1"></i>En';
                    badgeToggle.title = isEn ? 'नेपाली युनिकोड चालू छ (क्लिक गर्दा English हुन्छ)' : 'English चालू छ (क्लिक गर्दा नेपाली युनिकोड हुन्छ)';
                    nameInput.focus();
                });
            }
        }

        // Live Smart Nepali Unicode for Transferred-from Office
        const prevOfficeInput = document.getElementById('f-transferred-from');
        if (prevOfficeInput && window.NepaliUnicode) {
            NepaliUnicode.attach(prevOfficeInput, { showToggle: false, enabled: true });
        }

        // Attach Nepali Bikram Sambat Date Pickers
        const dateInputIds = ['f-curr-app-date', 'f-curr-join-date', 'f-office-join-date', 'f-transfer-date', 'f-initial-app', 'f-dob'];
        dateInputIds.forEach(id => {
            const inp = document.getElementById(id);
            if (inp && window.NepaliDatePicker) {
                NepaliDatePicker.attach(inp);
            }
        });

        // Age auto-calculation from BS birthdate
        const dobInput = document.getElementById('f-dob');
        const ageText = document.getElementById('f-age-text');
        if (dobInput && ageText) {
            const calcAge = () => {
                if (dobInput.value) {
                    const nepToEng = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
                    const clean = dobInput.value.replace(/[०-९]/g, ch => nepToEng[ch] || ch);
                    const parts = clean.split(/[-/]/);
                    const yr = parseInt(parts[0], 10);
                    if (yr >= 1990 && yr <= 2095) {
                        const currentBsYear = 2083;
                        const age = currentBsYear - yr;
                        if (age >= 57) {
                            ageText.className = 'fw-bold text-danger font-devanagari ps-2';
                            ageText.innerHTML = `${age} वर्ष <span class="badge bg-danger ms-1 font-devanagari" style="font-size:0.7rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i>५७+ पुगेको</span>`;
                        } else {
                            ageText.className = 'fw-bold text-dark font-devanagari ps-2';
                            ageText.textContent = (age > 0 ? age : 0) + ' वर्ष';
                        }
                    }
                }
            };
            dobInput.addEventListener('input', calcAge);
            dobInput.addEventListener('change', calcAge);
        }
        // Enforce English Numbers & Email
        enforceEnglishPhone('f-mobile');
        enforceEnglishPhone('f-family-contact');
        enforceEnglishEmail('f-email');

        // Uppercase and direct manual typing for Position Code (पदको कोड)
        const posCodeInp = document.getElementById('f-pos-code');
        if (posCodeInp) {
            posCodeInp.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
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

        const btnImport = document.getElementById('btn-ref-import');
        if (btnImport) btnImport.addEventListener('click', openExcelImportModal);

        const btnNew = document.getElementById('btn-ref-new');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                selectedEmployeeId = null;
                const form = document.getElementById('ref-employee-form');
                if (form) {
                    // Blank out all text, date, and email input fields completely (Point 8)
                    form.querySelectorAll('input').forEach(inp => {
                        inp.value = '';
                    });

                    // Reset all dropdown selects to their initial option
                    form.querySelectorAll('select').forEach(sel => {
                        sel.selectedIndex = 0;
                    });

                    // Reset age text display
                    const ageText = document.getElementById('f-age-text');
                    if (ageText) ageText.textContent = '........';

                    // Remove active highlight from any selected row in table
                    document.querySelectorAll('.emp-row-select').forEach(r => r.classList.remove('table-primary', 'table-active'));

                    // Focus on Employee Name input for instant typing
                    const nameInput = document.getElementById('f-name-ne');
                    if (nameInput) nameInput.focus();

                    showToast('नयाँ कर्मचारी फारम तयार भयो। सबै फिल्डहरू खाली गरिएको छ।', 'info');
                }
            });
        }

        const btnSave = document.getElementById('btn-ref-save');
        if (btnSave) btnSave.addEventListener('click', () => saveOrUpdateEmployee(false));

        const btnUpdate = document.getElementById('btn-ref-update');
        if (btnUpdate) btnUpdate.addEventListener('click', () => saveOrUpdateEmployee(true));

        const btnDelete = document.getElementById('btn-ref-delete');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                let emp = null;
                if (selectedEmployeeId) {
                    emp = ePalikaDB.getEmployeeById(selectedEmployeeId);
                } else {
                    const currentCode = document.getElementById('f-emp-code')?.value.trim();
                    if (currentCode) {
                        emp = ePalikaDB.getEmployees().find(e => e.employee_code.toLowerCase() === currentCode.toLowerCase());
                    }
                }
                if (!emp) {
                    showToast('कृपया हटाउनको लागि पहिले तलको सूचीबाट कर्मचारी छनोट गर्नुहोस् वा कोड राख्नुहोस्।', 'error');
                    return;
                }
                openDeleteEmployeeModal(emp);
            });
        }
    }

    function openDeleteEmployeeModal(emp) {
        const mount = document.getElementById('delete-modal-mount');
        if (!mount) return;

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-danger text-white py-2">
                            <h6 class="modal-title font-devanagari text-white mb-0">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i> कर्मचारी रेकर्ड मेटाउने निश्चितता
                            </h6>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('delete-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <div class="p-3 bg-white border border-danger-subtle rounded mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fw-bold text-dark font-devanagari fs-6">${emp.full_name_ne}</span>
                                    <span class="badge bg-danger">${emp.employee_code}</span>
                                </div>
                                <div class="small text-muted">
                                    पद: <strong>${emp.designation_name || '-'}</strong> | शाखा: <strong>${emp.department_name || '-'}</strong>
                                </div>
                            </div>

                            <form id="employee-delete-confirm-form">
                                <div class="mb-3">
                                    <label class="form-label fw-bold small text-dark font-devanagari">
                                        मेटाउने रेकर्डको कोड नं. राख्नुहोस्:
                                    </label>
                                    <input type="text" id="modal-delete-confirm-code" class="form-control fw-bold font-monospace" placeholder="उदा: ${emp.employee_code}" required autocomplete="off">
                                    <div class="form-text small text-muted">रेकर्ड मेटाउन निश्चित गर्न माथिको कर्मचारी कोड (<code>${emp.employee_code}</code>) टाइप गर्नुहोस्।</div>
                                </div>

                                <div class="mb-4">
                                    <label class="form-label fw-bold small text-dark font-devanagari">
                                        रेकर्ड मेट्नुपर्ने कारण:
                                    </label>
                                    <select id="modal-delete-reason" class="form-select fw-bold">
                                        <option value="सरुवा">सरुवा (Transfer)</option>
                                        <option value="अवकाश">अवकाश (Retirement)</option>
                                        <option value="सेवा समाप्त">सेवा समाप्त (Service Terminated / Resignation)</option>
                                        <option value="गल्तीले प्रविष्टि">गल्तीले प्रविष्टि (Entry Error)</option>
                                        <option value="अन्य">अन्य (Other)</option>
                                    </select>
                                </div>

                                <div class="d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-secondary btn-sm px-3" onclick="document.getElementById('delete-modal-mount').innerHTML='';">
                                        Cancel (रद्द)
                                    </button>
                                    <button type="submit" class="btn btn-danger btn-sm fw-bold px-4">
                                        <i class="fa-solid fa-trash me-1"></i> Delete (मेटाउनुहोस्)
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modal-delete-confirm-code').focus();

        document.getElementById('employee-delete-confirm-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const enteredCode = document.getElementById('modal-delete-confirm-code').value.trim();
            const reason = document.getElementById('modal-delete-reason').value;

            if (enteredCode.toUpperCase() !== emp.employee_code.trim().toUpperCase()) {
                alert(`त्रुटि: तपाईंले प्रविष्ट गरेको कोड '${enteredCode}' र कर्मचारीको कोड '${emp.employee_code}' मिलेन। कृपया सही कोड टाइप गर्नुहोस्।`);
                return;
            }

            ePalikaDB.deleteEmployee(emp.id, reason);
            mount.innerHTML = '';
            selectedEmployeeId = null;
            showToast(`कर्मचारी '${emp.full_name_ne}' (${emp.employee_code}) को रेकर्ड सफलतापूर्वक मेटाइयो (कारण: ${reason})।`, 'success');
            renderEmployeesTab();
        });
    }

    function saveOrUpdateEmployee(isUpdate) {
        const code = document.getElementById('f-emp-code').value.trim();
        let name = document.getElementById('f-name-ne').value.trim();

        // Ensure any remaining Roman text in employee name is transliterated before saving
        if (name && window.NepaliUnicode && /[a-zA-Z]/.test(name)) {
            name = NepaliUnicode.transliterateText(name);
            const nameInp = document.getElementById('f-name-ne');
            if (nameInp) nameInp.value = name;
        }

        const NEP_DIGITS = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
        const rawMobile = document.getElementById('f-mobile').value.trim();
        const mobile = rawMobile.replace(/[०-९]/g, ch => NEP_DIGITS[ch] || ch).replace(/[^0-9]/g, '');

        if (!code || !name) {
            showToast('कृपया कर्मचारीको कोड र नाम अनिवार्य भर्नुहोस्।', 'error');
            return;
        }

        const posCodeInput = document.getElementById('f-pos-code');
        const posCode = posCodeInput ? posCodeInput.value.trim().toUpperCase() : 'POS-001';

        // Auto-register manually typed code into positionCodes master list
        if (posCode) {
            const masterPosCodes = ePalikaDB.getMasters().positionCodes || [];
            if (!masterPosCodes.some(pc => (pc.name_ne || '').toUpperCase() === posCode)) {
                ePalikaDB.addMasterItem('positionCodes', posCode);
            }
        }

        const rawEmail = document.getElementById('f-email').value.trim().toLowerCase();
        const cleanEmail = rawEmail.replace(/[^a-z0-9@._+-]/g, '');
        const rawFamContact = document.getElementById('f-family-contact').value.trim();
        const cleanFamContact = rawFamContact.replace(/[०-९]/g, ch => NEP_DIGITS[ch] || ch).replace(/[^0-9]/g, '');

        const data = {
            id: isUpdate ? selectedEmployeeId : null,
            employee_code: code,
            serial_number: document.getElementById('f-serial-no').value.trim(),
            full_name_ne: name,
            gender: document.getElementById('f-gender').value,
            dob: document.getElementById('f-dob').value.trim(),
            position_code: posCode || 'POS-001',
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
            email: cleanEmail,
            mobile_number: mobile,
            family_contact_number: cleanFamContact,
            transferred_from_office: document.getElementById('f-transferred-from').value.trim(),
            current_position_appointment_date: document.getElementById('f-curr-app-date').value.trim(),
            current_position_joining_date: document.getElementById('f-curr-join-date').value.trim(),
            current_office_joining_date: document.getElementById('f-office-join-date').value.trim(),
            transfer_release_date: document.getElementById('f-transfer-date').value.trim(),
            initial_appointment_date: document.getElementById('f-initial-app').value.trim(),
            personnel_sheet_roll_no: document.getElementById('f-sheet-roll').value.trim(),
            provident_fund_no: document.getElementById('f-pf-no').value.trim(),
            cit_insurance_no: document.getElementById('f-cit-no').value.trim(),
            investment_fund_no: document.getElementById('f-inv-no').value.trim()
        };

        if (data.dob) {
            const nepToEng = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
            const cleanDob = String(data.dob).replace(/[०-९]/g, ch => nepToEng[ch] || ch);
            const yr = parseInt(cleanDob.split(/[-/]/)[0], 10);
            if (yr >= 1990 && yr <= 2095) {
                data.age = 2083 - yr;
            }
        }

        const res = ePalikaDB.saveEmployee(data);
        if (!res.success) {
            showToast(res.message || 'त्रुटि भयो।', 'error');
            return;
        }

        if (res.duplicate) {
            showToast(res.message, 'warning');
            return;
        }

        if (res.isDuplicatePrevented) {
            selectedEmployeeId = res.id;
            showToast(`कर्मचारी कोड '${code}' पहिले नै रहेकोले सोही रेकर्डमा AutoUpdate गरियो (डुप्लिकेट हुनबाट बचाइयो)।`, 'info');
        } else if (res.updated) {
            selectedEmployeeId = res.id;
            showToast(`कर्मचारी '${name}' को विवरण अद्यावधिक (Updated) भयो।`, 'success');
        } else {
            selectedEmployeeId = res.id;
            showToast(`नयाँ कर्मचारी '${name}' (${code}) सुरक्षित गरियो।`, 'success');
        }

        renderEmployeesTab();
    }

    // =========================================================================
    // 2. सेटिङ (SETTINGS) - SUPER ADMIN EXCLUSIVE ROLE & USER MANAGEMENT
    // =========================================================================
    function renderSettingsTab() {
        const targetContainer = document.getElementById('main-content-display') || mainContainer;
        if (!targetContainer) return;
        const user = getCurrentUserSafe();
        const users = ePalikaDB.getUsers();
        const employees = ePalikaDB.getEmployees();
        const isSuperAdmin = (user && user.role === 'Super Admin');

        targetContainer.innerHTML = `
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
                        तपाईंको भूमिका: ${user ? user.role : 'Super Admin'}
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

            <!-- Combobox Master Lists Management (Point 5) -->
            <div class="gov-panel mt-4">
                <div class="gov-panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <span class="gov-panel-title">
                            <i class="fa-solid fa-list-check text-primary me-2"></i> Combobox / ड्रपडाउन मास्टर सूची व्यवस्थापन
                        </span>
                        <span class="small text-muted ms-2">(पद, तह, शाखा, सेवा, समूह आदि Combobox का विकल्पहरू थप्न र हटाउन)</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <label class="small fw-bold text-dark mb-0 font-devanagari">Combobox वर्ग छनोट:</label>
                        <select id="setting-master-category-select" class="form-select form-select-sm fw-bold text-primary" style="min-width: 210px;">
                            <option value="positionCodes">पदको कोड (Position Codes)</option>
                            <option value="designations" selected>पद (Designations)</option>
                            <option value="levels">तह (Levels)</option>
                            <option value="services">सेवा (Services)</option>
                            <option value="groups">समूह (Groups)</option>
                            <option value="departments">शाखा (Departments)</option>
                            <option value="offices">कार्यालय (Offices)</option>
                            <option value="employmentTypes">स्थायी/करार (Employment Types)</option>
                            <option value="serviceTypes">सेवाको किसिम (Service Types)</option>
                            <option value="qualifications">शैक्षिक योग्यता (Qualifications)</option>
                        </select>
                    </div>
                </div>
                <div class="p-3 bg-light" id="setting-master-manager-body">
                    <!-- Dynamic Master List Content rendered by JS -->
                </div>
            </div>

            <!-- Role Assignment Modal Mount -->
            <div id="role-assignment-modal-mount"></div>
        `;

        // Setting Master Category Manager Renderer
        function renderSettingMasterManager(category) {
            const body = document.getElementById('setting-master-manager-body');
            if (!body) return;
            const masters = ePalikaDB.getMasters();
            const list = masters[category] || [];
            const categoryNames = {
                positionCodes: 'पदको कोड',
                designations: 'पद',
                levels: 'तह',
                services: 'सेवा',
                groups: 'समूह',
                departments: 'शाखा',
                offices: 'कार्यालय',
                employmentTypes: 'स्थायी/करार',
                serviceTypes: 'सेवाको किसिम',
                qualifications: 'शैक्षिक योग्यता'
            };
            const catLabel = categoryNames[category] || 'विकल्प';

            body.innerHTML = `
                <div class="row g-3">
                    <div class="col-md-5">
                        <div class="p-3 bg-white border rounded shadow-sm">
                            <h6 class="fw-bold font-devanagari text-dark mb-2">
                                <i class="fa-solid fa-plus-circle text-success me-1"></i> नयाँ ${catLabel} थप्नुहोस्
                            </h6>
                            <form id="setting-add-master-form">
                                <div class="mb-2">
                                    <label class="form-label small fw-bold text-muted">${catLabel}को नाम / मान:</label>
                                    <input type="text" id="setting-add-master-input" class="form-control form-control-sm" placeholder="उदा: नयाँ ${catLabel}..." required autocomplete="off">
                                </div>
                                <button type="submit" class="btn btn-sm btn-primary fw-bold font-devanagari w-100">
                                    <i class="fa-solid fa-check me-1"></i> ${catLabel} सुरक्षित गर्नुहोस्
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="p-3 bg-white border rounded shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="fw-bold font-devanagari text-dark mb-0">
                                    <i class="fa-solid fa-list text-primary me-1"></i> हाल उपलब्ध ${catLabel}हरू
                                </h6>
                                <span class="badge bg-primary font-devanagari">${list.length} विकल्पहरू</span>
                            </div>
                            <div style="max-height: 320px; overflow-y: auto;">
                                <table class="table table-sm table-hover mb-0 align-middle">
                                    <thead class="table-light">
                                        <tr>
                                            <th style="width: 45px;">क्र.सं.</th>
                                            <th>नाम / विवरण</th>
                                            <th class="text-end" style="width: 80px;">कार्य</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${list.length === 0 ? `
                                            <tr><td colspan="3" class="text-center text-muted small py-3">कुनै पनि रेकर्ड छैन।</td></tr>
                                        ` : list.map((item, idx) => `
                                            <tr>
                                                <td class="text-muted small">${idx + 1}</td>
                                                <td class="fw-bold text-dark font-devanagari">${item.name_ne}</td>
                                                <td class="text-end">
                                                    <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2 btn-del-setting-master" data-id="${item.id}" data-name="${item.name_ne}" title="हटाउनुहोस्">
                                                        <i class="fa-solid fa-trash-can"></i>
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

            const masterInput = document.getElementById('setting-add-master-input');
            if (masterInput && category !== 'positionCodes' && window.NepaliUnicode) {
                NepaliUnicode.attach(masterInput, { showToggle: false, enabled: true });
            }

            document.getElementById('setting-add-master-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('setting-add-master-input').value.trim();
                if (name) {
                    ePalikaDB.addMasterItem(category, name);
                    showToast(`नयाँ ${catLabel} '${name}' सफलतापूर्वक थप गरियो।`, 'success');
                    renderSettingMasterManager(category);
                }
            });

            document.querySelectorAll('.btn-del-setting-master').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = Number(this.getAttribute('data-id'));
                    const name = this.getAttribute('data-name');
                    if (confirm(`के तपाईं निश्चित हुनुहुन्छ? '${name}' लाई ${catLabel} सूचीबाट हटाउन चाहनुहुन्छ?`)) {
                        ePalikaDB.deleteMasterItem(category, id);
                        showToast(`'${name}' सफलतापूर्वक हटाइयो।`, 'info');
                        renderSettingMasterManager(category);
                    }
                });
            });
        }

        const catSelect = document.getElementById('setting-master-category-select');
        if (catSelect) {
            catSelect.addEventListener('change', function() {
                renderSettingMasterManager(this.value);
            });
            renderSettingMasterManager(catSelect.value || 'designations');
        }

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

        // Enforce English Phone Number in Settings User Creation
        enforceEnglishPhone('s-mobile');

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
    // 4. WARDS MODULE (वडा कार्यालयहरू - पूर्ण सम्पादन, हटाउने र नयाँ थप्ने सुविधा)
    // =========================================================================
    function renderWardsTab() {
        const wards = ePalikaDB.getWards();

        mainContainer.innerHTML = `
            <div class="gov-panel p-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 class="fw-bold text-navy m-0">
                    <i class="fa-solid fa-map-location-dot me-2"></i> बाणगंगा नगरपालिकाका वडा कार्यालयहरू (${wards.length > 0 ? `वडा १-${wards.length}` : 'सूची'})
                </h5>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-success fw-bold font-devanagari px-3" onclick="window.openWardModal()">
                        <i class="fa-solid fa-plus me-1"></i> नयाँ वडा थप्नुहोस् (New Ward)
                    </button>
                    <button class="btn btn-sm btn-outline-secondary font-devanagari" onclick="window.print()">
                        <i class="fa-solid fa-print me-1"></i> प्रिन्ट
                    </button>
                </div>
            </div>

            <div class="row g-3">
                ${wards.map(w => `
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="badge bg-primary font-devanagari">वडा नं. ${w.ward_number}</span>
                                    <span class="text-muted small">जनसंख्या: ${w.population ? Number(w.population).toLocaleString('ne-NP') : '-'}</span>
                                </div>
                                <h6 class="fw-bold text-dark mb-2">${w.office_name_ne}</h6>
                                <div class="small text-muted mb-2"><i class="fa-solid fa-location-dot text-danger me-1"></i> ${w.address || '-'}</div>
                                <div class="small p-2 bg-light rounded mb-2">
                                    <div><strong>अध्यक्ष:</strong> ${w.chairperson_name || '-'} <span class="font-monospace">(${w.chairperson_phone || '-'})</span></div>
                                    <div><strong>सचिव:</strong> ${w.secretary_name || '-'} <span class="font-monospace">(${w.secretary_phone || '-'})</span></div>
                                    ${w.contact_number ? `<div class="mt-1 text-muted"><strong>कार्यालय सम्पर्क:</strong> <span class="font-monospace">${w.contact_number}</span></div>` : ''}
                                </div>
                                <div class="small fw-semibold text-primary">
                                    <i class="fa-solid fa-users me-1"></i> कर्मचारी संख्या: ${w.employees_count || 0}
                                </div>
                            </div>
                            <div class="border-top pt-2 mt-3 d-flex justify-content-end gap-2">
                                <button class="btn btn-sm btn-outline-primary py-1 px-2 font-devanagari" onclick="window.openWardModal(${w.id})" title="वडा विवरण सम्पादन गर्नुहोस्">
                                    <i class="fa-solid fa-pen-to-square me-1"></i> सम्पादन (Edit)
                                </button>
                                <button class="btn btn-sm btn-outline-danger py-1 px-2 font-devanagari" onclick="window.deleteWardItem(${w.id}, ${w.ward_number})" title="वडा हटाउनुहोस्">
                                    <i class="fa-solid fa-trash me-1"></i> हटाउनुहोस् (Delete)
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${wards.length === 0 ? `
                    <div class="col-12 text-center py-5 text-muted">
                        <i class="fa-solid fa-inbox fa-3x mb-3 text-secondary"></i>
                        <p class="font-devanagari">हाल कुनै पनि वडा दर्ता गरिएको छैन। "नयाँ वडा थप्नुहोस्" बटन थिची वडा दर्ता गर्नुहोस्।</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Ward Add/Edit Modal
    window.openWardModal = function(wardId = null) {
        const mount = document.getElementById('ward-modal-mount');
        if (!mount) return;

        const ward = wardId ? ePalikaDB.getWardById(wardId) : null;
        const isEdit = !!ward;

        // Suggested next ward number
        const allWards = ePalikaDB.getWards();
        const nextWardNum = allWards.length > 0 ? Math.max(...allWards.map(w => w.ward_number)) + 1 : 1;

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background:rgba(0,0,0,0.55);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header ${isEdit ? 'bg-primary' : 'bg-success'} text-white py-2 px-3">
                            <h5 class="modal-title font-devanagari text-white m-0 fs-6">
                                <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'} me-2"></i>
                                ${isEdit ? `वडा नं. ${ward.ward_number} कार्यालय विवरण सम्पादन (Edit Ward)` : 'नयाँ वडा कार्यालय दर्ता (Add New Ward)'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('ward-modal-mount').innerHTML='';"></button>
                        </div>
                        <form id="ward-edit-form">
                            <input type="hidden" name="id" value="${ward ? ward.id : ''}">
                            <div class="modal-body p-4 bg-light">
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <label class="form-label font-devanagari small fw-bold text-dark">वडा नं. (Ward No): <span class="text-danger">*</span></label>
                                        <input type="number" name="ward_number" class="form-control form-control-sm" value="${ward ? ward.ward_number : nextWardNum}" required min="1" max="99">
                                    </div>
                                    <div class="col-md-9">
                                        <label class="form-label font-devanagari small fw-bold text-dark">वडा कार्यालयको नाम: <span class="text-danger">*</span></label>
                                        <input type="text" name="office_name_ne" id="ward_office_name_ne" class="form-control form-control-sm font-devanagari" value="${ward ? ward.office_name_ne : `वडा नं. ${nextWardNum} कार्यालय`}" required placeholder="उदा: वडा नं. १ कार्यालय">
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label font-devanagari small fw-bold text-dark"><i class="fa-solid fa-location-dot text-danger me-1"></i> ठेगाना / स्थान (Address):</label>
                                        <input type="text" name="address" id="ward_address" class="form-control form-control-sm font-devanagari" value="${ward && ward.address ? ward.address : ''}" placeholder="उदा: उत्तमनगर">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label font-devanagari small fw-bold text-dark">जनसंख्या (Population):</label>
                                        <input type="number" name="population" class="form-control form-control-sm" value="${ward && ward.population ? ward.population : ''}" placeholder="उदा: 6850">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label font-devanagari small fw-bold text-dark">कार्यालय फोन नं:</label>
                                        <input type="text" name="contact_number" class="form-control form-control-sm font-monospace" value="${ward && ward.contact_number ? ward.contact_number : ''}" placeholder="उदा: ०७६-५५१००१">
                                    </div>

                                    <div class="col-12"><hr class="my-1 text-muted"></div>

                                    <div class="col-md-6">
                                        <label class="form-label font-devanagari small fw-bold text-dark"><i class="fa-solid fa-user-tie text-primary me-1"></i> वडा अध्यक्षको नाम:</label>
                                        <input type="text" name="chairperson_name" id="ward_chairperson_name" class="form-control form-control-sm font-devanagari" value="${ward && ward.chairperson_name ? ward.chairperson_name : ''}" placeholder="अध्यक्षको नाम (उदा: संजु थारु)">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label font-devanagari small fw-bold text-dark"><i class="fa-solid fa-phone text-primary me-1"></i> अध्यक्षको मोबाईल नं:</label>
                                        <input type="text" name="chairperson_phone" class="form-control form-control-sm font-monospace" value="${ward && ward.chairperson_phone ? ward.chairperson_phone : ''}" placeholder="उदा: 9857010001">
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label font-devanagari small fw-bold text-dark"><i class="fa-solid fa-user-pen text-secondary me-1"></i> वडा सचिवको नाम:</label>
                                        <input type="text" name="secretary_name" id="ward_secretary_name" class="form-control form-control-sm font-devanagari" value="${ward && ward.secretary_name ? ward.secretary_name : ''}" placeholder="सचिवको नाम (उदा: रामचन्द्र भुसाल)">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label font-devanagari small fw-bold text-dark"><i class="fa-solid fa-phone text-secondary me-1"></i> सचिवको मोबाईल नं:</label>
                                        <input type="text" name="secretary_phone" class="form-control form-control-sm font-monospace" value="${ward && ward.secretary_phone ? ward.secretary_phone : ''}" placeholder="उदा: 9857020001">
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer bg-white py-2 px-3 d-flex justify-content-between">
                                <div>
                                    ${isEdit ? `
                                        <button type="button" class="btn btn-sm btn-outline-danger font-devanagari" onclick="window.deleteWardItem(${ward.id}, ${ward.ward_number})">
                                            <i class="fa-solid fa-trash me-1"></i> यो वडा हटाउनुहोस् (Delete)
                                        </button>
                                    ` : ''}
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-sm btn-secondary font-devanagari" onclick="document.getElementById('ward-modal-mount').innerHTML='';">
                                        रद्द गर्नुहोस्
                                    </button>
                                    <button type="submit" class="btn btn-sm btn-primary font-devanagari fw-bold px-3">
                                        <i class="fa-solid fa-floppy-disk me-1"></i> सुरक्षित गर्नुहोस् (Save)
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Attach live Nepali Unicode transliteration to Nepali fields
        if (window.ePalikaUnicode) {
            ['ward_office_name_ne', 'ward_address', 'ward_chairperson_name', 'ward_secretary_name'].forEach(id => {
                const el = document.getElementById(id);
                if (el) window.ePalikaUnicode.attach(el);
            });
        }

        // Form submit handler
        const form = document.getElementById('ward-edit-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                id: formData.get('id') ? Number(formData.get('id')) : null,
                ward_number: Number(formData.get('ward_number')),
                office_name_ne: formData.get('office_name_ne') ? formData.get('office_name_ne').trim() : '',
                address: formData.get('address') ? formData.get('address').trim() : '',
                population: Number(formData.get('population')) || 0,
                contact_number: formData.get('contact_number') ? formData.get('contact_number').trim() : '',
                chairperson_name: formData.get('chairperson_name') ? formData.get('chairperson_name').trim() : '',
                chairperson_phone: formData.get('chairperson_phone') ? formData.get('chairperson_phone').trim() : '',
                secretary_name: formData.get('secretary_name') ? formData.get('secretary_name').trim() : '',
                secretary_phone: formData.get('secretary_phone') ? formData.get('secretary_phone').trim() : ''
            };

            ePalikaDB.saveWard(data);
            mount.innerHTML = '';
            showToast(`वडा नं. ${data.ward_number} को विवरण सफलतापूर्वक सुरक्षित गरियो।`, 'success');
            renderWardsTab();
        });
    };

    window.deleteWardItem = function(wardId, wardNumber) {
        if (confirm(`के तपाईं निश्चित रूपमा वडा नं. ${wardNumber} को सम्पूर्ण अभिलेख हटाउन (Delete गर्न) चाहनुहुन्छ?`)) {
            const success = ePalikaDB.deleteWard(wardId);
            if (success) {
                const mount = document.getElementById('ward-modal-mount');
                if (mount) mount.innerHTML = '';
                showToast(`वडा नं. ${wardNumber} सफलतापूर्वक हटाइयो।`, 'info');
                renderWardsTab();
            }
        }
    };

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

    // Quick Master Dropdown Modal (Add & Delete Options - Point 1 & 2)
    window.openQuickMasterModal = function(type, label) {
        const mount = document.getElementById('master-quick-modal-mount');
        if (!mount) return;

        function renderMasterModalContent() {
            const masters = ePalikaDB.getMasters();
            const list = masters[type] || [];

            mount.innerHTML = `
                <div class="modal fade show d-block" style="background:rgba(0,0,0,0.6);" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content border-0 shadow-lg">
                            <div class="modal-header bg-navy text-white py-2" style="background: #0f3460;">
                                <h6 class="modal-title font-devanagari text-white mb-0">
                                    <i class="fa-solid fa-list-check me-2"></i> ${label} सूची व्यवस्थापन (थप तथा हटाउने)
                                </h6>
                                <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('master-quick-modal-mount').innerHTML='';"></button>
                            </div>
                            <div class="modal-body p-3 bg-light">
                                <!-- Add New Form -->
                                <form id="quick-master-add-form" class="mb-3 p-2 bg-white border rounded">
                                    <label class="form-label fw-bold small text-dark mb-1 font-devanagari">
                                        नयाँ ${label} थप्नुहोस्:
                                    </label>
                                    <div class="input-group input-group-sm">
                                        <input type="text" id="quick-master-new-input" class="form-control" placeholder="नयाँ नाम/मान प्रविष्ट गर्नुहोस्..." required autocomplete="off">
                                        <button type="submit" class="btn btn-primary fw-bold px-3">
                                            <i class="fa-solid fa-plus me-1"></i> थप्नुहोस्
                                        </button>
                                    </div>
                                </form>

                                <!-- Existing Items List -->
                                <div class="bg-white border rounded p-2">
                                    <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                                        <span class="small fw-bold text-muted font-devanagari">हाल रहेका विकल्पहरू:</span>
                                        <span class="badge bg-primary font-devanagari">${list.length} वटा</span>
                                    </div>
                                    <div style="max-height: 280px; overflow-y: auto;">
                                        <table class="table table-sm table-hover mb-0 align-middle">
                                            <thead class="table-light">
                                                <tr>
                                                    <th style="width: 45px;">क्र.सं.</th>
                                                    <th>नाम / मान</th>
                                                    <th class="text-end" style="width: 80px;">कार्य</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${list.length === 0 ? `
                                                    <tr><td colspan="3" class="text-center text-muted small py-3">कुनै पनि रेकर्ड छैन।</td></tr>
                                                ` : list.map((item, idx) => `
                                                    <tr>
                                                        <td class="text-muted small">${idx + 1}</td>
                                                        <td class="fw-bold text-dark font-devanagari">${item.name_ne}</td>
                                                        <td class="text-end">
                                                            <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2 btn-delete-quick-master" data-id="${item.id}" data-name="${item.name_ne}" title="हटाउनुहोस्">
                                                                <i class="fa-solid fa-trash-can"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer py-2 bg-white">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('master-quick-modal-mount').innerHTML='';">
                                    बन्द गर्नुहोस् (Close)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Auto-attach live Nepali Unicode if relevant
            const quickInput = document.getElementById('quick-master-new-input');
            if (quickInput && type !== 'positionCodes' && window.NepaliUnicode) {
                NepaliUnicode.attach(quickInput, { showToggle: false, enabled: true });
            }
            if (quickInput) quickInput.focus();

            // Submit Handler for Adding
            document.getElementById('quick-master-add-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('quick-master-new-input').value.trim();
                if (name) {
                    ePalikaDB.addMasterItem(type, name);
                    showToast(`नयाँ ${label} '${name}' थप गरियो।`, 'success');
                    renderMasterModalContent();
                    if (activeTab === 'employees') renderEmployeesTab();
                    else if (activeTab === 'settings') renderSettingsTab();
                }
            });

            // Delete Handler
            document.querySelectorAll('.btn-delete-quick-master').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = Number(this.getAttribute('data-id'));
                    const name = this.getAttribute('data-name');
                    if (confirm(`के तपाईं निश्चित हुनुहुन्छ? '${name}' लाई ${label} सूचीबाट हटाउन चाहनुहुन्छ?`)) {
                        ePalikaDB.deleteMasterItem(type, id);
                        showToast(`'${name}' हटाइयो।`, 'info');
                        renderMasterModalContent();
                        if (activeTab === 'employees') renderEmployeesTab();
                        else if (activeTab === 'settings') renderSettingsTab();
                    }
                });
            });
        }

        renderMasterModalContent();
    };

    // Filter Modal
    function openMultiFilterModal() {
        const masters = ePalikaDB.getMasters();
        const mount = document.getElementById('multifilter-modal-mount');

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-navy text-white" style="background:#0f3460;">
                            <h5 class="modal-title font-devanagari text-white"><i class="fa-solid fa-filter me-2"></i> फिल्टर (Filter)</h5>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('multifilter-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <div class="row g-3">
                                <!-- 1. कार्यालय (Office) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-building text-primary me-1"></i>कार्यालय (Office):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-office">
                                        <option value="">-- सबै कार्यालय (All Offices) --</option>
                                        ${masters.offices.map(o => `<option value="${o.id}" ${filterState.office_id && filterState.office_id.includes(o.id) ? 'selected':''}>${o.name_ne}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 2. शाखा (Departments) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-sitemap text-primary me-1"></i>शाखा (Departments):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-dept">
                                        <option value="">-- सबै शाखा (All Departments) --</option>
                                        ${masters.departments.map(d => `<option value="${d.id}" ${filterState.department_id && filterState.department_id.includes(d.id) ? 'selected':''}>${d.name_ne}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 3. पद (Designations) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-user-tag text-primary me-1"></i>पद (Designations):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-des">
                                        <option value="">-- सबै पद (All Designations) --</option>
                                        ${masters.designations.map(d => `<option value="${d.id}" ${filterState.designation_id && filterState.designation_id.includes(d.id) ? 'selected':''}>${d.name_ne}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 4. तह (Level) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-layer-group text-primary me-1"></i>तह (Level):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-lev">
                                        <option value="">-- सबै तह (All Levels) --</option>
                                        ${masters.levels.map(l => `<option value="${l.id}" ${filterState.level_id && filterState.level_id.includes(l.id) ? 'selected':''}>${l.name_ne}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 5. रोजगार प्रकार (Type) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-id-badge text-primary me-1"></i>रोजगार प्रकार (Type):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-typ">
                                        <option value="">-- सबै प्रकार (All Types) --</option>
                                        ${masters.employmentTypes.map(t => `<option value="${t.id}" ${filterState.employment_type_id && filterState.employment_type_id.includes(t.id) ? 'selected':''}>${t.name_ne}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 6. उमेर समूह (Age) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-hourglass-half text-primary me-1"></i>उमेर समूह (Age):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-age">
                                        <option value="">-- सबै उमेर (All Ages) --</option>
                                        <option value="20-30" ${filterState.age_range === '20-30' ? 'selected':''}>२० देखि ३० वर्ष (20 - 30)</option>
                                        <option value="30-40" ${filterState.age_range === '30-40' ? 'selected':''}>३० देखि ४० वर्ष (30 - 40)</option>
                                        <option value="40-50" ${filterState.age_range === '40-50' ? 'selected':''}>४० देखि ५० वर्ष (40 - 50)</option>
                                        <option value="50-57" ${filterState.age_range === '50-57' ? 'selected':''}>५० देखि ५७ वर्ष (50 - 57)</option>
                                        <option value="57+" ${filterState.age_range === '57+' ? 'selected':''}>५७ वर्ष भन्दा माथि (57 - Above)</option>
                                    </select>
                                </div>

                                <!-- 7. लिङ्ग (Gender) -->
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-navy"><i class="fa-solid fa-venus-mars text-primary me-1"></i>लिङ्ग (Gender):</label>
                                    <select class="form-select form-select-sm font-devanagari" id="mf-gender">
                                        <option value="">-- सबै लिङ्ग (All Genders) --</option>
                                        <option value="पुरुष" ${filterState.gender === 'पुरुष' ? 'selected':''}>पुरुष (Male)</option>
                                        <option value="महिला" ${filterState.gender === 'महिला' ? 'selected':''}>महिला (Female)</option>
                                        <option value="अन्य" ${filterState.gender === 'अन्य' ? 'selected':''}>अन्य (Other)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm font-devanagari" onclick="filterState={}; document.getElementById('multifilter-modal-mount').innerHTML=''; renderEmployeesTab(); showToast('सबै फिल्टरहरू हटाइयो।', 'info');">सबै हटाउनुहोस्</button>
                            <button type="button" class="btn btn-primary btn-sm font-devanagari fw-bold" id="btn-apply-mf"><i class="fa-solid fa-check me-1"></i>फिल्टर लागु गर्नुहोस्</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-apply-mf').addEventListener('click', () => {
            const office = document.getElementById('mf-office').value;
            const dept = document.getElementById('mf-dept').value;
            const des = document.getElementById('mf-des').value;
            const lev = document.getElementById('mf-lev').value;
            const typ = document.getElementById('mf-typ').value;
            const age = document.getElementById('mf-age').value;
            const gender = document.getElementById('mf-gender').value;

            filterState = {};
            if (office) filterState.office_id = [Number(office)];
            if (dept) filterState.department_id = [Number(dept)];
            if (des) filterState.designation_id = [Number(des)];
            if (lev) filterState.level_id = [Number(lev)];
            if (typ) filterState.employment_type_id = [Number(typ)];
            if (age) filterState.age_range = age;
            if (gender) filterState.gender = gender;

            mount.innerHTML = '';
            renderEmployeesTab();
            showToast('फिल्टर लागु भयो।', 'success');
        });
    }

    function exportEmployeesToCSV() {
        const list = ePalikaDB.getEmployees(filterState);
        let csv = "\uFEFFक्र.सं.,कर्मचारी कोड,नाम,उमेर,लिङ्ग,पदको कोड,पद,तह,सेवा,समूह,शैक्षिक योग्यता,शाखा,कार्यालय,स्थायी/करार,सेवाको किसिम,दरबन्दी,बहाल विदा वा अन्य,ई-मेल,मोबाईल नं,यस कार्यालयमा आएको कार्यालय,परिवारको सम्पर्क नं,सुरु नियुक्ती,हालको पदमा नियुक्ति,हालको पदमा हाजिर,यस कार्यालयमा हाजिर,रमानाभई आएको मिति,कर्मचारी संकेत नं,संचयकोष नं,सा.जि.विमा नं,लगानीकोष नं,जन्म मिति,स्थिति\n";
        list.forEach((e, idx) => {
            csv += `${idx + 1},"${e.employee_code || ''}","${e.full_name_ne || ''}","${e.age || ''}","${e.gender || ''}","${e.position_code || 'POS-001'}","${e.designation_name || ''}","${e.level_name || ''}","${e.service_name || ''}","${e.group_name || ''}","${e.qualification_name || ''}","${e.department_name || ''}","${e.office_name || ''}","${e.employment_type_name || ''}","${e.service_type_name || ''}","${e.staff_quota || 'हो'}","${e.duty_status || 'कार्यरत'}","${e.email || ''}","${e.mobile_number || ''}","${e.transferred_from_office || ''}","${e.family_contact_number || ''}","${e.initial_appointment_date || ''}","${e.current_position_appointment_date || ''}","${e.current_position_joining_date || ''}","${e.current_office_joining_date || ''}","${e.transfer_release_date || ''}","${e.personnel_sheet_roll_no || ''}","${e.provident_fund_no || ''}","${e.cit_insurance_no || ''}","${e.investment_fund_no || ''}","${e.dob || ''}","${e.age >= 57 ? '५७+ अवकाश निकट' : 'कार्यरत'}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `banganga_employees_full_records_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        showToast('सबै ३२ वटै विवरणहरू सहितको Excel/CSV फाइल डाउनलोड भयो।', 'success');
    }

    // =========================================================================
    // EXCEL / CSV IMPORT SYSTEM (एक्सेलबाट कर्मचारी अभिलेख इम्पोर्ट)
    // =========================================================================
    function openExcelImportModal() {
        const mount = document.getElementById('excel-import-modal-mount');
        if (!mount) return;

        mount.innerHTML = `
            <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-success text-white py-2">
                            <h6 class="modal-title font-devanagari text-white mb-0">
                                <i class="fa-solid fa-file-excel me-2"></i> एक्सेलबाट कर्मचारी अभिलेख इम्पोर्ट (Excel / CSV Employee Import)
                            </h6>
                            <button type="button" class="btn-close btn-close-white" onclick="document.getElementById('excel-import-modal-mount').innerHTML='';"></button>
                        </div>
                        <div class="modal-body p-4 bg-light">
                            <!-- Step 1: Info & Template Download -->
                            <div class="alert alert-success bg-white border-success d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 mb-3 shadow-sm rounded">
                                <div>
                                    <h6 class="fw-bold mb-1 font-devanagari text-success">
                                        <i class="fa-solid fa-circle-info me-2"></i> ३२ वटै विवरणहरू भएको एक्सेल टेम्प्लेट प्रयोग गर्नुहोस्
                                    </h6>
                                    <div class="small text-muted font-devanagari">
                                        एक्सेल फाइल (.xlsx, .xls) वा CSV (.csv) फाइलमा ३२ वटै स्तम्भहरू (क्र.सं., कोड, नाम, उमेर, लिङ्ग, पद, तह, शाखा, कार्यालय, जन्म मिति, सम्पर्क, आदि) भर्न सक्नुहुन्छ।
                                    </div>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-success font-devanagari fw-bold" id="btn-download-sample-template">
                                    <i class="fa-solid fa-download me-1"></i> नमुना एक्सेल टेम्प्लेट डाउनलोड (Sample Template)
                                </button>
                            </div>

                            <!-- Step 2: File Upload / Dropzone -->
                            <div class="card p-3 border shadow-sm mb-3 bg-white">
                                <div id="excel-dropzone" class="excel-dropzone">
                                    <i class="fa-solid fa-cloud-arrow-up fa-3x mb-2" style="color:#0d9488;"></i>
                                    <h6 class="fw-bold text-dark font-devanagari mb-1">यहाँ एक्सेल वा CSV फाइल ड्रप गर्नुहोस् वा क्लिक गर्नुहोस्</h6>
                                    <div class="small text-muted mb-2">समर्थित फाइलहरू: <strong>.xlsx, .xls, .csv</strong></div>
                                    <button type="button" class="btn btn-sm btn-outline-secondary font-devanagari px-3" id="btn-browse-excel-file">
                                        <i class="fa-solid fa-folder-open me-1"></i> फाइल छनोट गर्नुहोस्
                                    </button>
                                    <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" class="d-none">
                                </div>

                                <!-- Policy Options -->
                                <div class="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div class="fw-bold small text-navy font-devanagari">
                                        <i class="fa-solid fa-sliders text-primary me-1"></i> कर्मचारी कोड जुधेमा के गर्ने?
                                    </div>
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="form-check form-check-inline mb-0">
                                            <input class="form-check-input" type="radio" name="import-policy" id="policy-overwrite" value="overwrite" checked>
                                            <label class="form-check-label font-devanagari small text-dark" for="policy-overwrite">
                                                अद्यावधिक (Auto-Update) गर्ने <span class="badge bg-success-subtle text-success ms-1">सिफारिस</span>
                                            </label>
                                        </div>
                                        <div class="form-check form-check-inline mb-0">
                                            <input class="form-check-input" type="radio" name="import-policy" id="policy-skip" value="skip">
                                            <label class="form-check-label font-devanagari small text-dark" for="policy-skip">
                                                छोड्ने (Skip Duplicate Code)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3: Preview Container -->
                            <div id="import-preview-wrapper" class="d-none">
                                <div class="card border shadow-sm bg-white p-3 mb-2">
                                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                        <div class="font-devanagari">
                                            <span class="fw-bold text-dark"><i class="fa-solid fa-table me-1 text-primary"></i> फाइल पूर्व-अवलोकन (Data Preview):</span>
                                            <span class="badge bg-light text-dark border ms-2" id="preview-file-name">-</span>
                                        </div>
                                        <div class="d-flex gap-2">
                                            <span class="badge bg-primary font-devanagari px-2 py-1" id="badge-total-rows">कुल: ०</span>
                                            <span class="badge bg-success font-devanagari px-2 py-1" id="badge-new-rows">नयाँ: ०</span>
                                            <span class="badge bg-warning text-dark font-devanagari px-2 py-1" id="badge-update-rows">अद्यावधिक: ०</span>
                                        </div>
                                    </div>
                                    <div class="table-responsive" style="max-height: 280px; overflow-y: auto;">
                                        <table class="table table-bordered table-sm table-hover font-devanagari small mb-0 align-middle">
                                            <thead class="table-light sticky-top">
                                                <tr>
                                                    <th>क्र.सं.</th>
                                                    <th>कोड</th>
                                                    <th>कर्मचारीको नाम</th>
                                                    <th>उमेर</th>
                                                    <th>लिङ्ग</th>
                                                    <th>पद</th>
                                                    <th>तह</th>
                                                    <th>शाखा</th>
                                                    <th>कार्यालय</th>
                                                    <th>मोबाईल नं</th>
                                                    <th>स्थिति</th>
                                                </tr>
                                            </thead>
                                            <tbody id="preview-table-body">
                                                <!-- Dynamic preview rows -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-white py-2">
                            <button type="button" class="btn btn-secondary btn-sm font-devanagari" onclick="document.getElementById('excel-import-modal-mount').innerHTML='';">
                                रद्द गर्नुहोस्
                            </button>
                            <button type="button" class="btn btn-success btn-sm font-devanagari fw-bold" id="btn-start-import-action" disabled>
                                <i class="fa-solid fa-cloud-arrow-up me-1"></i> इम्पोर्ट सुरु गर्नुहोस् (Import)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        let parsedRecords = [];

        // Sample template download event
        document.getElementById('btn-download-sample-template').addEventListener('click', downloadSampleExcelTemplate);

        // Dropzone & File Input events
        const dropzone = document.getElementById('excel-dropzone');
        const fileInput = document.getElementById('excel-file-input');
        const btnBrowse = document.getElementById('btn-browse-excel-file');

        btnBrowse.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('click', (e) => {
            if (e.target !== btnBrowse && !btnBrowse.contains(e.target)) fileInput.click();
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleSelectedFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                handleSelectedFile(fileInput.files[0]);
            }
        });

        function handleSelectedFile(file) {
            const fileName = file.name;
            const ext = fileName.split('.').pop().toLowerCase();
            if (!['xlsx', 'xls', 'csv'].includes(ext)) {
                showToast('कृपया केवल .xlsx, .xls वा .csv फाइल मात्र छनोट गर्नुहोस्।', 'error');
                return;
            }

            parseFileToRecords(file).then(records => {
                if (!records || records.length === 0) {
                    showToast('फाइलमा कुनै पनि कर्मचारीको रेकर्ड भेटिएन।', 'warning');
                    return;
                }
                parsedRecords = records;
                renderImportPreview(fileName, records);
            }).catch(err => {
                showToast(`फाइल पढ्न सकिएन: ${err.message}`, 'error');
            });
        }

        function renderImportPreview(fileName, records) {
            const previewWrapper = document.getElementById('import-preview-wrapper');
            const previewFileName = document.getElementById('preview-file-name');
            const badgeTotal = document.getElementById('badge-total-rows');
            const badgeNew = document.getElementById('badge-new-rows');
            const badgeUpdate = document.getElementById('badge-update-rows');
            const tbody = document.getElementById('preview-table-body');
            const btnImport = document.getElementById('btn-start-import-action');

            previewWrapper.classList.remove('d-none');
            previewFileName.textContent = fileName;

            const existingEmployees = ePalikaDB.getEmployees();
            const existingCodes = new Set(existingEmployees.map(e => (e.employee_code || '').trim().toUpperCase()));

            let newCount = 0;
            let updateCount = 0;

            const rowsHtml = records.slice(0, 15).map((row, idx) => {
                const getVal = (...keys) => {
                    for (const k of keys) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return String(row[k]).trim();
                    }
                    return '';
                };

                const name = getVal('नाम', 'कर्मचारीको नाम', 'कर्मचारी नाम', 'पूरा नाम', 'name', 'full name', 'full_name');
                const code = getVal('कर्मचारी कोड', 'कर्मचारीको कोड', 'कोड', 'code', 'employee code', 'employee_code').toUpperCase();
                const des = getVal('पद', 'पदको नाम', 'designation', 'post');
                const dept = getVal('शाखा', 'शाखा/वडा', 'department', 'branch');
                const off = getVal('कार्यालय', 'कार्यालयको नाम', 'office');
                const level = getVal('तह', 'श्रेणी', 'level');
                const age = getVal('उमेर', 'age');
                const gender = getVal('लिङ्ग', 'लिंग', 'gender');
                const mobile = getVal('मोबाईल नं', 'मोबाईल नं.', 'मोबाईल', 'mobile', 'phone');

                const isExisting = code && existingCodes.has(code);
                if (isExisting) updateCount++;
                else newCount++;

                return `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><span class="badge bg-light text-dark border font-monospace">${code || '(स्वतः EMP-xxx)'}</span></td>
                        <td class="fw-bold text-primary">${name || '<span class="text-danger">रिक्त नाम</span>'}</td>
                        <td>${age || '-'}</td>
                        <td>${gender || '-'}</td>
                        <td>${des || '-'}</td>
                        <td>${level || '-'}</td>
                        <td>${dept || '-'}</td>
                        <td>${off || '-'}</td>
                        <td class="font-monospace">${mobile || '-'}</td>
                        <td>
                            ${isExisting 
                                ? '<span class="badge bg-warning-subtle text-dark border border-warning">अद्यावधिक हुने (Update)</span>' 
                                : '<span class="badge bg-success-subtle text-success border border-success">नयाँ थपिने (New)</span>'
                            }
                        </td>
                    </tr>
                `;
            }).join('');

            // If more than 15 records, calculate full stats
            records.slice(15).forEach(row => {
                const getVal = (...keys) => {
                    for (const k of keys) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return String(row[k]).trim();
                    }
                    return '';
                };
                const code = getVal('कर्मचारी कोड', 'कर्मचारीको कोड', 'कोड', 'code', 'employee code', 'employee_code').toUpperCase();
                if (code && existingCodes.has(code)) updateCount++;
                else newCount++;
            });

            badgeTotal.textContent = `कुल: ${records.length} जना`;
            badgeNew.textContent = `नयाँ: ${newCount} जना`;
            badgeUpdate.textContent = `अद्यावधिक: ${updateCount} जना`;

            tbody.innerHTML = rowsHtml;
            btnImport.disabled = false;
            btnImport.innerHTML = `<i class="fa-solid fa-cloud-arrow-up me-1"></i> ${records.length} वटा रेकर्ड इम्पोर्ट गर्नुहोस्`;
        }

        // Start Import Button Event
        document.getElementById('btn-start-import-action').addEventListener('click', function() {
            if (!parsedRecords || parsedRecords.length === 0) return;
            const policy = document.querySelector('input[name="import-policy"]:checked')?.value || 'overwrite';
            this.disabled = true;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> इम्पोर्ट हुँदैछ...';

            setTimeout(() => {
                const res = ePalikaDB.importEmployees(parsedRecords, { overwrite: policy === 'overwrite' });
                if (res.success) {
                    let msg = `सफलतापूर्वक इम्पोर्ट सम्पन्न! नयाँ थपिएका: ${res.importedCount} जना, अद्यावधिक: ${res.updatedCount} जना।`;
                    if (res.skippedCount > 0) {
                        msg += ` (नीति अनुसार दोहोरिएका ${res.skippedCount} जना छोडियो)।`;
                    }
                    showToast(msg, 'success');
                    mount.innerHTML = '';
                    renderEmployeesTab();
                } else {
                    showToast('इम्पोर्टमा त्रुटि भयो।', 'error');
                    this.disabled = false;
                    this.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i> पुनः प्रयास गर्नुहोस्';
                }
            }, 250);
        });
    }

    // Parse Excel or CSV to JSON array
    function parseFileToRecords(file) {
        return new Promise((resolve, reject) => {
            const isCsv = file.name.endsWith('.csv');
            if (typeof XLSX !== 'undefined') {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                        resolve(json);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            } else if (isCsv) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const text = e.target.result;
                        const json = parseCsvText(text);
                        resolve(json);
                    } catch(err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsText(file, 'utf-8');
            } else {
                reject(new Error('SheetJS लाइब्रेरी लोड हुन सकेन। कृपया CSV फाइल प्रयोग गर्नुहोस् वा इन्टरनेट जडान जाँच गर्नुहोस्।'));
            }
        });
    }

    // Built-in Native CSV Parser with UTF-8 Devanagari and quote handling
    function parseCsvText(csvText) {
        if (!csvText) return [];
        if (csvText.charCodeAt(0) === 0xFEFF) {
            csvText = csvText.slice(1);
        }
        const lines = [];
        let row = [''];
        let inQuotes = false;
        for (let i = 0; i < csvText.length; i++) {
            const c = csvText[i];
            const next = csvText[i + 1];
            if (c === '"') {
                if (inQuotes && next === '"') {
                    row[row.length - 1] += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c === ',' && !inQuotes) {
                row.push('');
            } else if ((c === '\r' || c === '\n') && !inQuotes) {
                if (c === '\r' && next === '\n') {
                    i++;
                }
                if (row.length > 1 || row[0] !== '') {
                    lines.push(row);
                }
                row = [''];
            } else {
                row[row.length - 1] += c;
            }
        }
        if (row.length > 1 || row[0] !== '') {
            lines.push(row);
        }
        if (lines.length < 2) return [];
        const headers = lines[0].map(h => h.trim());
        const records = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.length === 1 && line[0].trim() === '') continue;
            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = (line[idx] !== undefined ? line[idx].trim() : '');
            });
            records.push(obj);
        }
        return records;
    }

    // Download Sample Excel Template
    function downloadSampleExcelTemplate() {
        const sampleRows = [
            {
                "क्र.सं.": "१",
                "कर्मचारी कोड": "EMP-010",
                "नाम": "हरिप्रसाद न्यौपाने",
                "उमेर": "४२",
                "लिङ्ग": "पुरुष",
                "पदको कोड": "POS-001",
                "पद": "शाखा अधिकृत",
                "तह": "छैटौं",
                "सेवा": "नेपाल प्रशासन सेवा",
                "समूह": "सामान्य प्रशासन",
                "शैक्षिक योग्यता": "स्नातकोत्तर",
                "शाखा": "प्रशासन तथा आन्तरिक नियन्त्रण",
                "कार्यालय": "नगर कार्यपालिकाको कार्यालय",
                "स्थायी/करार": "स्थायी",
                "सेवाको किसिम": "निजामती",
                "दरबन्दी": "हो",
                "बहाल विदा वा अन्य": "कार्यरत",
                "ई-मेल": "hari.neupane@bangangamun.gov.np",
                "मोबाईल नं": "9857012345",
                "यस कार्यालयमा आएको कार्यालय": "जिल्ला प्रशासन कार्यालय, कपिलवस्तु",
                "परिवारको सम्पर्क नं": "9847123456",
                "सुरु नियुक्ती": "2070-05-12",
                "हालको पदमा नियुक्ति": "2076-08-15",
                "हालको पदमा हाजिर": "2076-08-20",
                "यस कार्यालयमा हाजिर": "2078-01-10",
                "रमानाभई आएको मिति": "2078-01-08",
                "कर्मचारी संकेत नं": "SKN-11223",
                "संचयकोष नं": "PF-99881",
                "सा.जि.विमा नं": "CIT-44332",
                "लगानीकोष नं": "INV-8877",
                "जन्म मिति": "2041-03-15",
                "स्थिति": "कार्यरत"
            },
            {
                "क्र.सं.": "२",
                "कर्मचारी कोड": "EMP-011",
                "नाम": "सुनिता पौडेल",
                "उमेर": "३२",
                "लिङ्ग": "महिला",
                "पदको कोड": "POS-003",
                "पद": "सव-इन्जिनियर",
                "तह": "पाँचौं",
                "सेवा": "नेपाल इन्जिनियरिङ सेवा",
                "समूह": "सिभिल",
                "शैक्षिक योग्यता": "डिप्लोमा",
                "शाखा": "पूर्वाधार विकास तथा प्राविधिक शाखा",
                "कार्यालय": "नगर कार्यपालिकाको कार्यालय",
                "स्थायी/करार": "स्थायी",
                "सेवाको किसिम": "स्थानीय तह",
                "दरबन्दी": "हो",
                "बहाल विदा वा अन्य": "कार्यरत",
                "ई-मेल": "sunita.eng@bangangamun.gov.np",
                "मोबाईल नं": "9857065432",
                "यस कार्यालयमा आएको कार्यालय": "बुटवल उपमहानगरपालिका",
                "परिवारको सम्पर्क नं": "9847654321",
                "सुरु नियुक्ती": "2075-02-10",
                "हालको पदमा नियुक्ति": "2078-04-01",
                "हालको पदमा हाजिर": "2078-04-05",
                "यस कार्यालयमा हाजिर": "2079-02-15",
                "रमानाभई आएको मिति": "2079-02-10",
                "कर्मचारी संकेत नं": "SKN-44552",
                "संचयकोष नं": "PF-33221",
                "सा.जि.विमा नं": "CIT-77881",
                "लगानीकोष नं": "INV-9901",
                "जन्म मिति": "2051-09-20",
                "स्थिति": "कार्यरत"
            }
        ];

        if (typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.json_to_sheet(sampleRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Employees");
            XLSX.writeFile(wb, "banganga_employee_import_sample.xlsx");
            showToast('नमुना एक्सेल फाइल (banganga_employee_import_sample.xlsx) डाउनलोड भयो।', 'success');
        } else {
            // Fallback CSV download
            const headers = Object.keys(sampleRows[0]);
            let csv = "\uFEFF" + headers.join(',') + "\n";
            sampleRows.forEach(row => {
                csv += headers.map(h => `"${row[h] || ''}"`).join(',') + "\n";
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `banganga_employee_import_sample.csv`;
            link.click();
            showToast('नमुना CSV फाइल (banganga_employee_import_sample.csv) डाउनलोड भयो।', 'success');
        }
    }

    function showToast(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = 'toast-notice';
        div.innerHTML = `<strong>${type==='error'?'त्रुटि':'सूचना'}:</strong> ${msg}`;
        toastMount.appendChild(div);
        setTimeout(() => div.remove(), 3500);
    }

    window.openLoginModal = openLoginModal;
    window.openExcelImportModal = openExcelImportModal;
    window.downloadSampleExcelTemplate = downloadSampleExcelTemplate;
    window.getCurrentUser = getCurrentUserSafe;
    window.setCurrentUser = function(u) {
        currentUser = u;
        try { ePalikaDB.setCurrentUser(u); } catch(e){}
    };
    window.showInternalSystem = showInternalSystem;
    window.showLandingPortal = showLandingPortal;
    window.renderTab = renderTab;
    window.switchTab = switchTab;
    window.performPortalLogin = performPortalLogin;
    window.performDirectLogin = performPortalLogin;
    window.submitPortalLogin = function() { performPortalLogin(); };
});
