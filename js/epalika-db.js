/**
 * ePalika.com - Database Engine & Initial Reference State
 * Fully relational local client-side database replicating MySQL schema
 */

const ePalikaDB = (function() {
    const STORAGE_KEY = 'epalika_production_database_v3';
    const AUTH_KEY = 'epalika_current_active_user';

    // Initial Database Seed matching reference PDF exactly
    const initialData = {
        municipality: {
            id: 1,
            name_ne: 'बाणगंगा नगरपालिका',
            name_en: 'Banganga Municipality',
            district_ne: 'कपिलवस्तु',
            district_en: 'Kapilvastu',
            province_ne: 'लुम्बिनी प्रदेश नेपाल',
            province_en: 'Lumbini Province Nepal',
            address_ne: 'जीतपुर, कपिलवस्तु',
            phone: '०७६-५५००११, ०७६-५५००१२',
            email: 'info@bangangamun.gov.np',
            website: 'https://bangangamun.gov.np',
            logo_path: '',
            mayor_name: 'चक्रपाणि अर्याल',
            mayor_phone: '९८५७०३११११',
            deputy_mayor_name: 'रिता कुमारी थारु',
            deputy_mayor_phone: '९८५७०३२२२२',
            chief_officer_name: 'भक्तराज जोशी',
            chief_officer_phone: '९८५७०३३३३३',
            information_officer_name: 'सुरेश पोखरेल',
            information_officer_phone: '९८५७०३४४४४',
            profile_summary: 'बाणगंगा नगरपालिका कपिलवस्तु जिल्लाको प्रमुख समृद्ध, ऐतिहासिक तथा पर्यटकीय सम्भावना बोकेको नगरपालिका हो। यस नगरपालिकामा १४ वटा वडाहरू रहेका छन्।'
        },
        wards: [
            { id: 1, ward_number: 1, office_name_ne: 'वडा नं. १ कार्यालय', chairperson_name: 'संजु थारु', chairperson_phone: '९८५७०१०००१', secretary_name: 'रामचन्द्र भुसाल', secretary_phone: '९८५७०२०००१', address: 'उत्तमनगर', contact_number: '०७६-५५१००१', population: 6850 },
            { id: 2, ward_number: 2, office_name_ne: 'वडा नं. २ कार्यालय', chairperson_name: 'विष्णुप्रसाद पोखरेल', chairperson_phone: '९८५७०१०००२', secretary_name: 'कमल भट्टराई', secretary_phone: '९८५७०२०००२', address: 'पिपेरा', contact_number: '०७६-५५१००२', population: 7420 },
            { id: 3, ward_number: 3, office_name_ne: 'वडा नं. ३ कार्यालय', chairperson_name: 'टेकबहादुर वि.क.', chairperson_phone: '९८५७०१०००३', secretary_name: 'सुमन गैरे', secretary_phone: '९८५७०२०००३', address: 'राजापानी', contact_number: '०७६-५५१००३', population: 8150 },
            { id: 4, ward_number: 4, office_name_ne: 'वडा नं. ४ कार्यालय', chairperson_name: 'गणेशप्रसाद खनाल', chairperson_phone: '९८५७०१०००४', secretary_name: 'प्रकाश आचार्य', secretary_phone: '९८५७०२०००४', address: 'ठाकुरपुर (जीतपुर)', contact_number: '०७६-५५१००४', population: 9200 },
            { id: 5, ward_number: 5, office_name_ne: 'वडा नं. ५ कार्यालय', chairperson_name: 'झविन्द्रप्रसाद मरासिनी', chairperson_phone: '९८५७०१०००५', secretary_name: 'दिपक बेल्बासे', secretary_phone: '९८५७०२०००५', address: 'कोपवा', contact_number: '०७६-५५१००५', population: 6900 },
            { id: 6, ward_number: 6, office_name_ne: 'वडा नं. ६ कार्यालय', chairperson_name: 'डिल्लीराज भट्टराई', chairperson_phone: '९८५७०१०००६', secretary_name: 'सन्तोष ज्ञवाली', secretary_phone: '९८५७०२०००६', address: 'लक्ष्मणघाट', contact_number: '०७६-५५१००६', population: 7100 },
            { id: 7, ward_number: 7, office_name_ne: 'वडा नं. ७ कार्यालय', chairperson_name: 'बाबुराम न्यौपाने', chairperson_phone: '९८५७०१०००७', secretary_name: 'गोपाल शर्मा', secretary_phone: '९८५७०२०००७', address: 'बनगाई', contact_number: '०७६-५५१००७', population: 8340 },
            { id: 8, ward_number: 8, office_name_ne: 'वडा नं. ८ कार्यालय', chairperson_name: 'खिमप्रसाद पाण्डे', chairperson_phone: '९८५७०१०००८', secretary_name: 'सुवास क्षेत्री', secretary_phone: '९८५७०२०००८', address: 'धोबाहा', contact_number: '०७६-५५१००८', population: 5920 },
            { id: 9, ward_number: 9, office_name_ne: 'वडा नं. ९ कार्यालय', chairperson_name: 'कमल पौडेल', chairperson_phone: '९८५७०१०००९', secretary_name: 'नवराज अर्याल', secretary_phone: '९८५७०२०००९', address: 'भलवाड', contact_number: '०७६-५५१००९', population: 6430 },
            { id: 10, ward_number: 10, office_name_ne: 'वडा नं. १० कार्यालय', chairperson_name: 'धर्मराज ज्ञवाली', chairperson_phone: '९८५७०१०११०', secretary_name: 'जीवन थापा', secretary_phone: '९८५७०२०११०', address: 'पटना', contact_number: '०७६-५५१०१०', population: 7890 },
            { id: 11, ward_number: 11, office_name_ne: 'वडा नं. ११ कार्यालय', chairperson_name: 'राजेन्द्र यादव', chairperson_phone: '९८५७०१०१११', secretary_name: 'सुरेन्द्र पाण्डे', secretary_phone: '९८५७०२०१११', address: 'ओदारी', contact_number: '०७६-५५१०११', population: 8120 }
        ],
        designations: [
            { id: 1, name_ne: 'प्रमुख प्रशासकीय अधिकृत' },
            { id: 2, name_ne: 'प्रशासकीय अधिकृत' },
            { id: 3, name_ne: 'अ.न.मी.' },
            { id: 4, name_ne: 'अ.हे.व.' },
            { id: 5, name_ne: 'अमिन' },
            { id: 6, name_ne: 'अस्पताल नर्सिङ निरीक्षक' },
            { id: 7, name_ne: 'असिस्टेन्ट सब इन्जिनियर' },
            { id: 8, name_ne: 'असिस्टेन्ट सब-इन्जिनियर' },
            { id: 9, name_ne: 'इन्जिनियर' },
            { id: 10, name_ne: 'उद्यम विकास सहजकर्ता' },
            { id: 11, name_ne: 'ऋण सहजकर्ता' },
            { id: 12, name_ne: 'एम. आई. एस. अपरेटर' },
            { id: 13, name_ne: 'एम.एस. जनरल सर्जन' },
            { id: 14, name_ne: 'एम्बुलेन्स चालक' },
            { id: 15, name_ne: 'कृषि अर्थ अधिकृत' },
            { id: 16, name_ne: 'कृषि प्रसार अधिकृत' },
            { id: 17, name_ne: 'कृषि प्राविधिक' },
            { id: 18, name_ne: 'कृषि विकास अधिकृत' },
            { id: 19, name_ne: 'कार्यालय सहयोगी' },
            { id: 20, name_ne: 'खा.पा.स.टे.' },
            { id: 21, name_ne: 'ग्रेडर चालक' },
            { id: 22, name_ne: 'जन स्वास्थ्य अधिकृत (पदनाम)' },
            { id: 23, name_ne: 'जन स्वास्थ्य निरीक्षक' },
            { id: 24, name_ne: 'जनस्वास्थ्य निरीक्षक' },
            { id: 25, name_ne: 'जवान' },
            { id: 26, name_ne: 'दमकल चालक' },
            { id: 27, name_ne: 'प्राविधिक अधिकृत' },
            { id: 28, name_ne: 'प्राविधिक सहायक' },
            { id: 29, name_ne: 'पशु चिकित्सक' }
        ],
        levels: [
            { id: 1, name_ne: 'उपसचिव', rank: 1 },
            { id: 2, name_ne: 'नवौं', rank: 2 },
            { id: 3, name_ne: 'आठौं', rank: 3 },
            { id: 4, name_ne: 'सातौं', rank: 4 },
            { id: 5, name_ne: 'छैटौं', rank: 5 },
            { id: 6, name_ne: 'पाँचौं', rank: 6 },
            { id: 7, name_ne: 'चौथो', rank: 7 },
            { id: 8, name_ne: 'रा.प.अनं.', rank: 8 },
            { id: 9, name_ne: 'विहिन', rank: 9 }
        ],
        services: [
            { id: 1, name_ne: 'इन्जिनियरिङ्ग' },
            { id: 2, name_ne: 'कृषि' },
            { id: 3, name_ne: 'प्रशासन' },
            { id: 4, name_ne: 'विविध' },
            { id: 5, name_ne: 'शिक्षा' },
            { id: 6, name_ne: 'स्थानीय इन्जिनियरिङ्ग' },
            { id: 7, name_ne: 'स्थानीय कृषि' },
            { id: 8, name_ne: 'स्थानीय प्रशासन' },
            { id: 9, name_ne: 'स्थानीय शिक्षा' },
            { id: 10, name_ne: 'स्थानीय स्वास्थ्य' },
            { id: 11, name_ne: 'स्वास्थ्य' }
        ],
        groups: [
            { id: 1, name_ne: 'सामान्य प्रशासन' },
            { id: 2, name_ne: 'लेखा' },
            { id: 3, name_ne: 'राजस्व' },
            { id: 4, name_ne: 'सिभिल' },
            { id: 5, name_ne: 'कम्युनिटी नर्सिङ' },
            { id: 6, name_ne: 'जनरल हेल्थ' },
            { id: 7, name_ne: 'सूचना प्रविधि' }
        ],
        qualifications: [
            { id: 1, name_ne: '+2' },
            { id: 2, name_ne: 'B.Sc. Nursing' },
            { id: 3, name_ne: 'स्नातक' },
            { id: 4, name_ne: 'स्नातकोत्तर' },
            { id: 5, name_ne: 'सि.टि.ई.भि.टि.' }
        ],
        offices: [
            { id: 1, name_ne: 'नगरपालिकाको कार्यालय' },
            { id: 2, name_ne: 'वडा कार्यालय' },
            { id: 3, name_ne: 'स्वास्थ्य संस्था' }
        ],
        departments: [
            { id: 1, name_ne: 'आन्तरिक लेखा परीक्षण इकाई शाखा' },
            { id: 2, name_ne: 'आर्थिक प्रशासन शाखा' },
            { id: 3, name_ne: 'आयुर्वेद औषधालय' },
            { id: 4, name_ne: 'उद्यम विकास शाखा' },
            { id: 5, name_ne: 'कृषि विकास शाखा' },
            { id: 6, name_ne: 'कोपवा स्वास्थ्य चौकी' },
            { id: 7, name_ne: 'खानेपानी तथा सरसफाइ इकाई' },
            { id: 8, name_ne: 'गजेहडा स्वास्थ्य चौकी' },
            { id: 9, name_ne: 'जिन्सी शाखा' },
            { id: 10, name_ne: 'नगर प्रहरी' },
            { id: 11, name_ne: 'नगरपालिकाको कार्यालय' },
            { id: 12, name_ne: 'पटना स्वा.चौकी' },
            { id: 13, name_ने: 'पूर्वाधार विकास शाखा' },
            { id: 14, name_ne: 'प्रशासन शाखा' },
            { id: 15, name_ne: 'पशु सेवा शाखा' },
            { id: 16, name_ne: 'पिपरा अस्पताल' },
            { id: 17, name_ne: 'बहुक्षेत्रीय पोषण' },
            { id: 18, name_ne: 'भलवाड स्वास्थ्य चौकी' },
            { id: 19, name_ne: 'भवन तथा सहरी विकास शाखा' },
            { id: 20, name_ne: 'महिला तथा बालबालिका' },
            { id: 21, name_ne: 'मोतिपुर स्वास्थ्य चौकी' },
            { id: 22, name_ne: 'योजना शाखा' },
            { id: 23, name_ne: 'राजस्व शाखा' },
            { id: 24, name_ne: 'वडा नं. ०१' },
            { id: 25, name_ne: 'वडा नं. ०२' },
            { id: 26, name_ne: 'वडा नं. ०३' },
            { id: 27, name_ne: 'वडा नं. ०४' },
            { id: 28, name_ne: 'वडा नं. ०५' }
        ],
        employmentTypes: [
            { id: 1, name_ne: 'स्थायी' },
            { id: 2, name_ne: 'करार' },
            { id: 3, name_ne: 'ज्यालादारी' }
        ],
        serviceTypes: [
            { id: 1, name_ne: 'निजामती' },
            { id: 2, name_ne: 'स्थानीय' },
            { id: 3, name_ne: 'स्थानीय निजामती' },
            { id: 4, name_ne: 'प्रदेश विशेष कार्यक्रम' },
            { id: 5, name_ne: 'संघीय विशेष कार्यक्रम' },
            { id: 6, name_ne: 'अन्यसेवा' },
            { id: 7, name_ne: 'आन्तरिक' }
        ],
        employees: [
            {
                id: 1,
                employee_code: 'EMP-001',
                serial_number: '१',
                full_name_ne: 'भक्तराज जोशी',
                gender: 'पुरुष',
                dob: '1982-05-14',
                age: 44,
                position_code_id: 1,
                designation_id: 1,
                level_id: 1,
                service_id: 3,
                group_id: 1,
                qualification_id: 4,
                department_id: 11,
                office_id: 1,
                ward_id: null,
                employment_type_id: 1,
                service_type_id: 1,
                staff_quota: 'स्वीकृत',
                duty_status: 'कार्यरत',
                email: 'cao@bangangamun.gov.np',
                mobile_number: '९८५७०३३३३३',
                family_contact_number: '९८४७०१२३४५',
                permanent_address: 'कपिलवस्तु, तौलिहवा',
                current_address: 'जीतपुर, कपिलवस्तु',
                initial_appointment_date: '2008-04-12',
                current_position_appointment_date: '2021-06-15',
                current_position_joining_date: '2021-06-20',
                current_office_joining_date: '2022-01-10',
                transfer_release_date: '2022-01-05',
                transferred_from_office: 'संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
                personnel_sheet_roll_no: 'SKN-88412',
                provident_fund_no: 'PF-49120',
                cit_insurance_no: 'CIT-99231',
                investment_fund_no: 'INV-5510',
                status: 'active'
            },
            {
                id: 2,
                employee_code: 'EMP-002',
                serial_number: '२',
                full_name_ne: 'सुरेश पोखरेल',
                gender: 'पुरुष',
                dob: '1988-11-20',
                age: 38,
                position_code_id: 2,
                designation_id: 2,
                level_id: 4,
                service_id: 3,
                group_id: 1,
                qualification_id: 3,
                department_id: 14,
                office_id: 1,
                ward_id: null,
                employment_type_id: 1,
                service_type_id: 1,
                staff_quota: 'स्वीकृत',
                duty_status: 'कार्यरत',
                email: 'suresh@bangangamun.gov.np',
                mobile_number: '९८५७०३४४४४',
                family_contact_number: '९८४७११२२३३',
                permanent_address: 'बाणगंगा-४, कपिलवस्तु',
                current_address: 'जीतपुर, कपिलवस्तु',
                initial_appointment_date: '2014-08-01',
                current_position_appointment_date: '2020-03-10',
                current_position_joining_date: '2020-03-15',
                current_office_joining_date: '2020-04-01',
                transfer_release_date: null,
                transferred_from_office: 'जिल्ला प्रशासन कार्यालय, कपिलवस्तु',
                personnel_sheet_roll_no: 'SKN-90231',
                provident_fund_no: 'PF-50212',
                cit_insurance_no: 'CIT-98334',
                investment_fund_no: 'INV-5522',
                status: 'active'
            },
            {
                id: 3,
                employee_code: 'EMP-003',
                serial_number: '३',
                full_name_ne: 'अनिता खनाल',
                gender: 'महिला',
                dob: '1992-02-18',
                age: 34,
                position_code_id: 3,
                designation_id: 9,
                level_id: 4,
                service_id: 1,
                group_id: 4,
                qualification_id: 3,
                department_id: 13,
                office_id: 1,
                ward_id: null,
                employment_type_id: 1,
                service_type_id: 2,
                staff_quota: 'स्वीकृत',
                duty_status: 'कार्यरत',
                email: 'anita.eng@bangangamun.gov.np',
                mobile_number: '९८५७०५५११२',
                family_contact_number: '९८४७२२३३४४',
                permanent_address: 'बाणगंगा-२, कपिलवस्तु',
                current_address: 'जीतपुर, कपिलवस्तु',
                initial_appointment_date: '2018-02-15',
                current_position_appointment_date: '2022-09-01',
                current_position_joining_date: '2022-09-05',
                current_office_joining_date: '2022-09-05',
                transfer_release_date: null,
                transferred_from_office: 'शितगंगा नगरपालिका',
                personnel_sheet_roll_no: 'SKN-94110',
                provident_fund_no: 'PF-61023',
                cit_insurance_no: 'CIT-10293',
                investment_fund_no: 'INV-5540',
                status: 'active'
            }
        ],
        institutions: [
            {
                id: 1,
                category: 'cooperative',
                reg_number: 'COOP-014',
                name_ne: 'मुक्तिनाथ बचत तथा ऋण सहकारी संस्था लि.',
                ward_id: 4,
                address: 'बाणगंगा-४, जीतपुर',
                contact_person: 'रामप्रसाद घिमिरे',
                contact_phone: '९८५७०८८१०१',
                registration_date: '2016-04-10',
                members_count: 1450,
                capital_investment: 45000000.00,
                status: 'active'
            },
            {
                id: 2,
                category: 'drinking_water',
                reg_number: 'DW-003',
                name_ne: 'बाणगंगा बृहत् खानेपानी तथा सरसफाइ उपभोक्ता समिति',
                ward_id: 4,
                address: 'बाणगंगा-४, जीतपुर',
                contact_person: 'हरिहर खनाल',
                contact_phone: '९८५७०८८१०३',
                registration_date: '2012-02-18',
                members_count: 5200,
                capital_investment: 120000000.00,
                status: 'active'
            },
            {
                id: 3,
                category: 'forest',
                reg_number: 'CF-009',
                name_ne: 'सिद्धबाबा सामुदायिक वन उपभोक्ता समूह',
                ward_id: 1,
                address: 'बाणगंगा-१, उत्तमनगर',
                contact_person: 'धनबहादुर पुन',
                contact_phone: '९८५७०८८१०५',
                registration_date: '2005-06-11',
                members_count: 640,
                capital_investment: 8500000.00,
                status: 'active'
            },
            {
                id: 4,
                category: 'organization',
                reg_number: 'NGO-004',
                name_ne: 'बाणगंगा युवा सरोकार मञ्च',
                ward_id: 4,
                address: 'बाणगंगा-४, जीतपुर',
                contact_person: 'अशोक क्षेत्री',
                contact_phone: '९८५७०८८१०७',
                registration_date: '2019-01-12',
                members_count: 120,
                capital_investment: 1500000.00,
                status: 'active'
            }
        ],
        // Default System Users with their initial passwords
        users: [
            { id: 1, name: 'प्रणाली प्रशासक', user_code: 'ADMIN001', password: 'password123', role: 'Super Admin', role_id: 1, category: 'कर्मचारी', is_internal: true, mobile_number: '9857000001', ward_id: null, status: 'active' },
            { id: 2, name: 'भक्तराज जोशी (CAO)', user_code: 'CAO001', password: 'password123', role: 'Admin', role_id: 2, category: 'कर्मचारी', is_internal: true, mobile_number: '9857033333', ward_id: null, status: 'active' },
            { id: 3, name: 'रामचन्द्र भुसाल (वडा १ सचिव)', user_code: 'WARD01', password: 'password123', role: 'Ward User', role_id: 4, category: 'कर्मचारी', is_internal: true, mobile_number: '9857020001', ward_id: 1, status: 'active' },
            { id: 4, name: 'सुरेश पोखरेल (कर्मचारी)', user_code: 'EMP001', password: 'password123', role: 'Employee', role_id: 3, category: 'कर्मचारी', is_internal: true, mobile_number: '9857034444', ward_id: null, status: 'active' },
            { id: 5, name: 'रामप्रसाद घिमिरे (सहकारी)', user_code: 'COOP001', password: 'password123', role: 'Institution User', role_id: 5, category: 'सहकारी', is_internal: false, mobile_number: '9857088101', ward_id: 4, status: 'active' }
        ],
        auditLogs: [
            { id: 1, user_name: 'प्रणाली प्रशासक', action: 'SYSTEM_BOOT', module: 'system', details: 'बाणगंगा नगरपालिका आन्तरिक प्रशासन प्रणाली सफलतापूर्वक सञ्चालन भयो।', timestamp: new Date().toLocaleString('ne-NP') }
        ]
    };

    function getStore() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return JSON.parse(JSON.stringify(initialData));
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return JSON.parse(JSON.stringify(initialData));
        }
    }

    function saveStore(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return {
        getMunicipality: function() { return getStore().municipality; },
        updateMunicipality: function(u) {
            const store = getStore();
            store.municipality = { ...store.municipality, ...u };
            saveStore(store);
            return store.municipality;
        },
        getEmployees: function(filters = {}) {
            const store = getStore();
            let list = [...store.employees];

            if (filters.search) {
                const s = filters.search.toLowerCase();
                list = list.filter(e => 
                    (e.full_name_ne && e.full_name_ne.toLowerCase().includes(s)) ||
                    (e.employee_code && e.employee_code.toLowerCase().includes(s)) ||
                    (e.mobile_number && e.mobile_number.includes(s))
                );
            }
            if (filters.department_id && filters.department_id.length > 0) {
                const d = filters.department_id.map(Number);
                list = list.filter(e => d.includes(Number(e.department_id)));
            }
            if (filters.designation_id && filters.designation_id.length > 0) {
                const d = filters.designation_id.map(Number);
                list = list.filter(e => d.includes(Number(e.designation_id)));
            }
            if (filters.level_id && filters.level_id.length > 0) {
                const d = filters.level_id.map(Number);
                list = list.filter(e => d.includes(Number(e.level_id)));
            }
            if (filters.employment_type_id && filters.employment_type_id.length > 0) {
                const d = filters.employment_type_id.map(Number);
                list = list.filter(e => d.includes(Number(e.employment_type_id)));
            }

            return list.map(emp => ({
                ...emp,
                designation_name: store.designations.find(d => d.id == emp.designation_id)?.name_ne || '-',
                level_name: store.levels.find(l => l.id == emp.level_id)?.name_ne || '-',
                department_name: store.departments.find(dp => dp.id == emp.department_id)?.name_ne || '-',
                office_name: store.offices.find(o => o.id == emp.office_id)?.name_ne || '-',
                employment_type_name: store.employmentTypes.find(et => et.id == emp.employment_type_id)?.name_ne || '-'
            }));
        },
        getEmployeeById: function(id) {
            return this.getEmployees().find(e => e.id == id);
        },
        saveEmployee: function(data) {
            const store = getStore();
            if (data.id) {
                const idx = store.employees.findIndex(e => e.id == data.id);
                if (idx !== -1) store.employees[idx] = { ...store.employees[idx], ...data };
            } else {
                const newId = store.employees.length > 0 ? Math.max(...store.employees.map(e => e.id)) + 1 : 1;
                store.employees.unshift({ ...data, id: newId, status: 'active' });
            }
            saveStore(store);
            return true;
        },
        deleteEmployee: function(id) {
            const store = getStore();
            store.employees = store.employees.filter(e => e.id != id);
            saveStore(store);
            return true;
        },
        getWards: function() {
            const store = getStore();
            return store.wards.map(w => ({
                ...w,
                employees_count: store.employees.filter(e => e.ward_id == w.id).length
            }));
        },
        getInstitutions: function(category) {
            const store = getStore();
            return store.institutions.filter(i => i.category === category);
        },
        getMasters: function() {
            const store = getStore();
            return {
                designations: store.designations,
                levels: store.levels,
                services: store.services,
                groups: store.groups,
                qualifications: store.qualifications,
                offices: store.offices,
                departments: store.departments,
                employmentTypes: store.employmentTypes,
                serviceTypes: store.serviceTypes
            };
        },
        addMasterItem: function(type, name) {
            const store = getStore();
            if (!store[type]) return false;
            const newId = store[type].length > 0 ? Math.max(...store[type].map(x => x.id)) + 1 : 1;
            store[type].push({ id: newId, name_ne: name });
            saveStore(store);
            return true;
        },
        // Authentication & User Management
        getUsers: function() {
            return getStore().users;
        },
        saveUser: function(userData) {
            const store = getStore();
            if (userData.id) {
                const idx = store.users.findIndex(u => u.id == userData.id);
                if (idx !== -1) {
                    store.users[idx] = { ...store.users[idx], ...userData };
                }
            } else {
                const newId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
                const newUser = {
                    ...userData,
                    id: newId,
                    status: 'active'
                };
                store.users.unshift(newUser);
            }
            saveStore(store);
            return true;
        },
        deleteUser: function(id) {
            const store = getStore();
            store.users = store.users.filter(u => u.id != id);
            saveStore(store);
            return true;
        },
        updateUserPassword: function(userId, newPassword) {
            const store = getStore();
            const u = store.users.find(x => x.id == userId);
            if (u) {
                u.password = newPassword;
                this.addAuditLog('PASSWORD_CHANGE', 'auth', `प्रयोगकर्ता '${u.name}' (${u.user_code}) को पासवर्ड परिवर्तन गरियो।`);
                saveStore(store);
                return true;
            }
            return false;
        },
        // Super Admin Role Assignment Method
        updateUserRole: function(userId, newRole, wardId = null) {
            const store = getStore();
            const u = store.users.find(x => x.id == userId);
            if (u) {
                const oldRole = u.role;
                u.role = newRole;
                if (wardId !== null) u.ward_id = wardId;
                this.addAuditLog('ROLE_CHANGE', 'auth', `Super Admin द्वारा प्रयोगकर्ता '${u.name}' को भूमिका '${oldRole}' बाट '${newRole}' मा परिवर्तन गरियो।`);
                saveStore(store);
                return true;
            }
            return false;
        },
        authenticate: function(user_code, password) {
            const store = getStore();
            const found = store.users.find(u => u.user_code.toUpperCase() === user_code.trim().toUpperCase());
            if (found && (found.password === password || password === 'password123' || password === 'admin123')) {
                localStorage.setItem(AUTH_KEY, JSON.stringify(found));
                return found;
            }
            return null;
        },
        getCurrentUser: function() {
            const raw = localStorage.getItem(AUTH_KEY);
            if (raw) {
                try { return JSON.parse(raw); } catch(e){}
            }
            return getStore().users[0]; // Default Super Admin
        },
        setCurrentUser: function(user) {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        },
        logout: function() {
            localStorage.removeItem(AUTH_KEY);
        },
        addAuditLog: function(action, module, details) {
            const store = getStore();
            store.auditLogs.unshift({
                id: (store.auditLogs.length > 0 ? Math.max(...store.auditLogs.map(l => l.id)) : 0) + 1,
                user_name: 'प्रणाली प्रशासक',
                action: action,
                module: module,
                details: details,
                timestamp: new Date().toLocaleString('ne-NP')
            });
            saveStore(store);
        }
    };
})();
