/**
 * ePalika.com - Database Engine & Initial Reference State
 * Fully relational local client-side database replicating MySQL schema
 */

const ePalikaDB = (function() {
    const STORAGE_KEY = 'epalika_production_database_v2';

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
            { id: 13, name_ne: 'पूर्वाधार विकास शाखा' },
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
                designation_id: 1, // प्रमुख प्रशासकीय अधिकृत
                level_id: 1, // उपसचिव
                service_id: 3, // प्रशासन
                group_id: 1, // सामान्य प्रशासन
                qualification_id: 4, // स्नातकोत्तर
                department_id: 11, // नगरपालिकाको कार्यालय
                office_id: 1, // नगरपालिकाको कार्यालय
                ward_id: null,
                employment_type_id: 1, // स्थायी
                service_type_id: 1, // निजामती
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
                designation_id: 2, // प्रशासकीय अधिकृत
                level_id: 4, // सातौं
                service_id: 3,
                group_id: 1,
                qualification_id: 3, // स्नातक
                department_id: 14, // प्रशासन शाखा
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
                designation_id: 9, // इन्जिनियर
                level_id: 4, // सातौं
                service_id: 1, // इन्जिनियरिङ्ग
                group_id: 4, // सिभिल
                qualification_id: 3,
                department_id: 13, // पूर्वाधार विकास शाखा
                office_id: 1,
                ward_id: null,
                employment_type_id: 1,
                service_type_id: 2, // स्थानीय
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
            },
            {
                id: 4,
                employee_code: 'EMP-004',
                serial_number: '४',
                full_name_ne: 'प्रकाश आचार्य',
                gender: 'पुरुष',
                dob: '1990-07-25',
                age: 36,
                position_code_id: 4,
                designation_id: 7, // असिस्टेन्ट सब इन्जिनियर
                level_id: 6, // पाँचौं
                service_id: 1,
                group_id: 4,
                qualification_id: 5, // सि.टि.ई.भि.टि.
                department_id: 27, // वडा नं. ०४
                office_id: 2, // वडा कार्यालय
                ward_id: 4,
                employment_type_id: 2, // करार
                service_type_id: 2,
                staff_quota: 'करार',
                duty_status: 'कार्यरत',
                email: 'prakash.subeng@gmail.com',
                mobile_number: '९८५७०२०००४',
                family_contact_number: '९८४७३३४४५५',
                permanent_address: 'बाणगंगा-४, कपिलवस्तु',
                current_address: 'ठाकुरपुर, कपिलवस्तु',
                initial_appointment_date: '2019-05-10',
                current_position_appointment_date: '2019-05-10',
                current_position_joining_date: '2019-05-15',
                current_office_joining_date: '2021-07-01',
                transfer_release_date: null,
                transferred_from_office: 'पूर्वाधार विकास शाखा',
                personnel_sheet_roll_no: 'SKN-98124',
                provident_fund_no: 'PF-71234',
                cit_insurance_no: 'CIT-20412',
                investment_fund_no: 'INV-5561',
                status: 'active'
            },
            {
                id: 5,
                employee_code: 'EMP-005',
                serial_number: '५',
                full_name_ne: 'सुनिता थारु',
                gender: 'महिला',
                dob: '1995-10-12',
                age: 31,
                position_code_id: 6,
                designation_id: 3, // अ.न.मी.
                level_id: 6, // पाँचौं
                service_id: 11, // स्वास्थ्य
                group_id: 5, // कम्युनिटी नर्सिङ
                qualification_id: 1, // +2
                department_id: 8, // गजेहडा स्वास्थ्य चौकी
                office_id: 3, // स्वास्थ्य संस्था
                ward_id: 2,
                employment_type_id: 2, // करार
                service_type_id: 4, // प्रदेश विशेष कार्यक्रम
                staff_quota: 'करार',
                duty_status: 'कार्यरत',
                email: 'sunita.anm@gmail.com',
                mobile_number: '९८५७०६६७७८',
                family_contact_number: '९८४७४४५५६६',
                permanent_address: 'बाणगंगा-१, कपिलवस्तु',
                current_address: 'गजेहडा, कपिलवस्तु',
                initial_appointment_date: '2020-11-01',
                current_position_appointment_date: '2020-11-01',
                current_position_joining_date: '2020-11-05',
                current_office_joining_date: '2020-11-05',
                transfer_release_date: null,
                transferred_from_office: 'स्वास्थ्य निर्देशनालय, बुटवल',
                personnel_sheet_roll_no: 'SKN-99120',
                provident_fund_no: 'PF-80123',
                cit_insurance_no: 'CIT-30219',
                investment_fund_no: 'INV-5580',
                status: 'active'
            },
            {
                id: 6,
                employee_code: 'EMP-006',
                serial_number: '६',
                full_name_ne: 'रामचन्द्र भुसाल',
                gender: 'पुरुष',
                dob: '1985-03-30',
                age: 41,
                position_code_id: 2,
                designation_id: 28, // प्राविधिक सहायक
                level_id: 6,
                service_id: 3,
                group_id: 1,
                qualification_id: 3,
                department_id: 24, // वडा नं. ०१
                office_id: 2,
                ward_id: 1,
                employment_type_id: 1,
                service_type_id: 3, // स्थानीय निजामती
                staff_quota: 'स्वीकृत',
                duty_status: 'कार्यरत',
                email: 'ward1@bangangamun.gov.np',
                mobile_number: '९८५७०२०००१',
                family_contact_number: '९८४७५५६६७७',
                permanent_address: 'बाणगंगा-१, कपिलवस्तु',
                current_address: 'उत्तमनगर',
                initial_appointment_date: '2012-01-20',
                current_position_appointment_date: '2019-04-10',
                current_position_joining_date: '2019-04-15',
                current_office_joining_date: '2019-04-15',
                transfer_release_date: null,
                transferred_from_office: 'वडा कार्यालय २',
                personnel_sheet_roll_no: 'SKN-85123',
                provident_fund_no: 'PF-45120',
                cit_insurance_no: 'CIT-85123',
                investment_fund_no: 'INV-5599',
                status: 'active'
            },
            {
                id: 7,
                employee_code: 'EMP-007',
                serial_number: '७',
                full_name_ne: 'दिपक बेल्बासे',
                gender: 'पुरुष',
                dob: '1987-09-08',
                age: 39,
                position_code_id: 2,
                designation_id: 28,
                level_id: 6,
                service_id: 3,
                group_id: 1,
                qualification_id: 3,
                department_id: 28, // वडा नं. ०५
                office_id: 2,
                ward_id: 5,
                employment_type_id: 1,
                service_type_id: 3,
                staff_quota: 'स्वीकृत',
                duty_status: 'कार्यरत',
                email: 'ward5@bangangamun.gov.np',
                mobile_number: '९८५७०२०००५',
                family_contact_number: '९८४७६६७७८८',
                permanent_address: 'बाणगंगा-५, कपिलवस्तु',
                current_address: 'कोपवा',
                initial_appointment_date: '2015-06-12',
                current_position_appointment_date: '2021-02-14',
                current_position_joining_date: '2021-02-18',
                current_office_joining_date: '2021-02-18',
                transfer_release_date: null,
                transferred_from_office: 'राजस्व शाखा',
                personnel_sheet_roll_no: 'SKN-89104',
                provident_fund_no: 'PF-55102',
                cit_insurance_no: 'CIT-89410',
                investment_fund_no: 'INV-5610',
                status: 'active'
            },
            {
                id: 8,
                employee_code: 'EMP-008',
                serial_number: '८',
                full_name_ne: 'गोविन्द अर्याल',
                gender: 'पुरुष',
                dob: '1996-01-15',
                age: 30,
                position_code_id: 7,
                designation_id: 19, // कार्यालय सहयोगी
                level_id: 9, // विहिन
                service_id: 3,
                group_id: 1,
                qualification_id: 1,
                department_id: 11,
                office_id: 1,
                ward_id: null,
                employment_type_id: 3, // ज्यालादारी
                service_type_id: 7, // आन्तरिक
                staff_quota: 'ज्यालादारी',
                duty_status: 'कार्यरत',
                email: 'govinda.peon@gmail.com',
                mobile_number: '९८५७०९९११२',
                family_contact_number: '९८४७७७८८९९',
                permanent_address: 'बाणगंगा-२, कपिलवस्तु',
                current_address: 'जीतपुर, कपिलवस्तु',
                initial_appointment_date: '2023-01-01',
                current_position_appointment_date: '2023-01-01',
                current_position_joining_date: '2023-01-02',
                current_office_joining_date: '2023-01-02',
                transfer_release_date: null,
                transferred_from_office: null,
                personnel_sheet_roll_no: null,
                provident_fund_no: null,
                cit_insurance_no: null,
                investment_fund_no: null,
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
                renewal_date: '2026-04-09',
                executive_head: 'कृष्णप्रसाद ज्ञवाली',
                members_count: 1450,
                capital_investment: 45000000.00,
                status: 'active'
            },
            {
                id: 2,
                category: 'cooperative',
                reg_number: 'COOP-028',
                name_ne: 'हरियाली कृषि सहकारी संस्था लि.',
                ward_id: 2,
                address: 'बाणगंगा-२, पिपेरा',
                contact_person: 'श्यामसुन्दर थारु',
                contact_phone: '९८५७०८८१०२',
                registration_date: '2018-09-15',
                renewal_date: '2026-09-14',
                executive_head: 'माया घर्ती',
                members_count: 820,
                capital_investment: 18500000.00,
                status: 'active'
            },
            {
                id: 3,
                category: 'drinking_water',
                reg_number: 'DW-003',
                name_ne: 'बाणगंगा बृहत् खानेपानी तथा सरसफाइ उपभोक्ता समिति',
                ward_id: 4,
                address: 'बाणगंगा-४, जीतपुर',
                contact_person: 'हरिहर खनाल',
                contact_phone: '९८५७०८८१०३',
                registration_date: '2012-02-18',
                renewal_date: '2027-02-17',
                executive_head: 'चन्द्रकान्त पोखरेल',
                members_count: 5200,
                capital_investment: 120000000.00,
                status: 'active'
            },
            {
                id: 4,
                category: 'drinking_water',
                reg_number: 'DW-007',
                name_ne: 'कोपवा खानेपानी उपभोक्ता संस्था',
                ward_id: 5,
                address: 'बाणगंगा-५, कोपवा',
                contact_person: 'विदुर शर्मा',
                contact_phone: '९८५७०८८१०४',
                registration_date: '2017-08-22',
                renewal_date: '2026-08-21',
                executive_head: 'भेषराज मरासिनी',
                members_count: 1600,
                capital_investment: 35000000.00,
                status: 'active'
            },
            {
                id: 5,
                category: 'forest',
                reg_number: 'CF-009',
                name_ne: 'सिद्धबाबा सामुदायिक वन उपभोक्ता समूह',
                ward_id: 1,
                address: 'बाणगंगा-१, उत्तमनगर',
                contact_person: 'धनबहादुर पुन',
                contact_phone: '९८५७०८८१०५',
                registration_date: '2005-06-11',
                renewal_date: '2026-06-10',
                executive_head: 'इन्द्रबहादुर थापा',
                members_count: 640,
                capital_investment: 8500000.00,
                status: 'active'
            },
            {
                id: 6,
                category: 'forest',
                reg_number: 'CF-015',
                name_ne: 'मधुवन सामुदायिक वन उपभोक्ता समूह',
                ward_id: 3,
                address: 'बाणगंगा-३, राजापानी',
                contact_person: 'केशव आचार्य',
                contact_phone: '९८५७०८८१०६',
                registration_date: '2009-11-04',
                renewal_date: '2026-11-03',
                executive_head: 'पार्वती मरासिनी',
                members_count: 890,
                capital_investment: 11200000.00,
                status: 'active'
            },
            {
                id: 7,
                category: 'organization',
                reg_number: 'NGO-004',
                name_ne: 'बाणगंगा युवा सरोकार मञ्च',
                ward_id: 4,
                address: 'बाणगंगा-४, जीतपुर',
                contact_person: 'अशोक क्षेत्री',
                contact_phone: '९८५७०८८१०७',
                registration_date: '2019-01-12',
                renewal_date: '2026-01-11',
                executive_head: 'सुनील खत्री',
                members_count: 120,
                capital_investment: 1500000.00,
                status: 'active'
            },
            {
                id: 8,
                category: 'organization',
                reg_number: 'NGO-012',
                name_ne: 'कपिलवस्तु महिला सशक्तीकरण केन्द्र',
                ward_id: 2,
                address: 'बाणगंगा-२, पिपेरा',
                contact_person: 'सरिता अर्याल',
                contact_phone: '९८५७०८८१०८',
                registration_date: '2015-07-29',
                renewal_date: '2026-07-28',
                executive_head: 'कमला देवी थारु',
                members_count: 450,
                capital_investment: 4800000.00,
                status: 'active'
            }
        ],
        users: [
            { id: 1, name: 'प्रणाली प्रशासक', user_code: 'ADMIN001', role: 'Super Admin', role_id: 1, category: 'कर्मचारी', is_internal: true, mobile_number: '9857000001', ward_id: null, status: 'active' },
            { id: 2, name: 'भक्तराज जोशी (CAO)', user_code: 'CAO001', role: 'Admin', role_id: 2, category: 'कर्मचारी', is_internal: true, mobile_number: '9857033333', ward_id: null, status: 'active' },
            { id: 3, name: 'रामचन्द्र भुसाल (वडा १ सचिव)', user_code: 'WARD01', role: 'Ward User', role_id: 4, category: 'कर्मचारी', is_internal: true, mobile_number: '9857020001', ward_id: 1, status: 'active' },
            { id: 4, name: 'रामप्रसाद घिमिरे (मुक्तिनाथ सहकारी)', user_code: 'COOP001', role: 'Institution User', role_id: 5, category: 'सहकारी', is_internal: false, mobile_number: '9857088101', ward_id: 4, status: 'active' },
            { id: 5, name: 'सुरेश पोखरेल (कर्मचारी)', user_code: 'EMP001', role: 'Employee', role_id: 3, category: 'कर्मचारी', is_internal: true, mobile_number: '9857034444', ward_id: null, status: 'active' }
        ],
        auditLogs: [
            { id: 1, user_name: 'प्रणाली प्रशासक', action: 'SYSTEM_BOOT', module: 'system', details: 'बाणगंगा नगरपालिका आन्तरिक प्रशासन प्रणाली सफलतापूर्वक सञ्चालन भयो।', timestamp: new Date().toLocaleString('ne-NP') }
        ]
    };

    // Load data from Storage or initialize
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
        getMunicipality: function() {
            return getStore().municipality;
        },
        updateMunicipality: function(updated) {
            const store = getStore();
            store.municipality = { ...store.municipality, ...updated };
            this.addAuditLog('UPDATE', 'municipality', 'पालिका प्रोफाइल अद्यावधिक गरियो।');
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
                    (e.mobile_number && e.mobile_number.includes(s)) ||
                    (e.personnel_sheet_roll_no && e.personnel_sheet_roll_no.toLowerCase().includes(s))
                );
            }

            if (filters.department_id && filters.department_id.length > 0) {
                const depIds = Array.isArray(filters.department_id) ? filters.department_id.map(Number) : [Number(filters.department_id)];
                list = list.filter(e => depIds.includes(Number(e.department_id)));
            }

            if (filters.designation_id && filters.designation_id.length > 0) {
                const desIds = Array.isArray(filters.designation_id) ? filters.designation_id.map(Number) : [Number(filters.designation_id)];
                list = list.filter(e => desIds.includes(Number(e.designation_id)));
            }

            if (filters.level_id && filters.level_id.length > 0) {
                const levIds = Array.isArray(filters.level_id) ? filters.level_id.map(Number) : [Number(filters.level_id)];
                list = list.filter(e => levIds.includes(Number(e.level_id)));
            }

            if (filters.office_id && filters.office_id.length > 0) {
                const offIds = Array.isArray(filters.office_id) ? filters.office_id.map(Number) : [Number(filters.office_id)];
                list = list.filter(e => offIds.includes(Number(e.office_id)));
            }

            if (filters.employment_type_id && filters.employment_type_id.length > 0) {
                const empIds = Array.isArray(filters.employment_type_id) ? filters.employment_type_id.map(Number) : [Number(filters.employment_type_id)];
                list = list.filter(e => empIds.includes(Number(e.employment_type_id)));
            }

            if (filters.gender) {
                list = list.filter(e => e.gender === filters.gender);
            }

            // Hydrate relational data
            return list.map(emp => {
                const designation = store.designations.find(d => d.id == emp.designation_id)?.name_ne || '-';
                const level = store.levels.find(l => l.id == emp.level_id)?.name_ne || '-';
                const department = store.departments.find(dp => dp.id == emp.department_id)?.name_ne || '-';
                const office = store.offices.find(o => o.id == emp.office_id)?.name_ne || '-';
                const employmentType = store.employmentTypes.find(et => et.id == emp.employment_type_id)?.name_ne || '-';
                const service = store.services.find(s => s.id == emp.service_id)?.name_ne || '-';
                const qualification = store.qualifications.find(q => q.id == emp.qualification_id)?.name_ne || '-';
                return {
                    ...emp,
                    designation_name: designation,
                    level_name: level,
                    department_name: department,
                    office_name: office,
                    employment_type_name: employmentType,
                    service_name: service,
                    qualification_name: qualification
                };
            });
        },
        getEmployeeById: function(id) {
            const list = this.getEmployees();
            return list.find(e => e.id == id);
        },
        saveEmployee: function(employeeData) {
            const store = getStore();
            if (employeeData.id) {
                // Update
                const index = store.employees.findIndex(e => e.id == employeeData.id);
                if (index !== -1) {
                    store.employees[index] = { ...store.employees[index], ...employeeData };
                    this.addAuditLog('UPDATE', 'employee', `कर्मचारी '${employeeData.full_name_ne}' को विवरण अद्यावधिक गरियो।`);
                }
            } else {
                // Create
                const newId = store.employees.length > 0 ? Math.max(...store.employees.map(e => e.id)) + 1 : 1;
                const newEmp = {
                    ...employeeData,
                    id: newId,
                    status: 'active'
                };
                store.employees.unshift(newEmp);
                this.addAuditLog('CREATE', 'employee', `नयाँ कर्मचारी '${newEmp.full_name_ne}' (${newEmp.employee_code}) थप गरियो।`);
            }
            saveStore(store);
            return true;
        },
        deleteEmployee: function(id) {
            const store = getStore();
            const emp = store.employees.find(e => e.id == id);
            if (emp) {
                store.employees = store.employees.filter(e => e.id != id);
                this.addAuditLog('DELETE', 'employee', `कर्मचारी '${emp.full_name_ne}' हटाइयो।`);
                saveStore(store);
                return true;
            }
            return false;
        },
        getWards: function() {
            const store = getStore();
            const employees = store.employees;
            const institutions = store.institutions;
            return store.wards.map(w => ({
                ...w,
                employees_count: employees.filter(e => e.ward_id == w.id).length,
                institutions_count: institutions.filter(i => i.ward_id == w.id).length
            }));
        },
        getInstitutions: function(category = null, filters = {}) {
            const store = getStore();
            let list = [...store.institutions];
            if (category) {
                list = list.filter(i => i.category === category);
            }
            if (filters.search) {
                const s = filters.search.toLowerCase();
                list = list.filter(i => 
                    i.name_ne.toLowerCase().includes(s) ||
                    i.reg_number.toLowerCase().includes(s) ||
                    i.contact_person.toLowerCase().includes(s)
                );
            }
            if (filters.ward_id) {
                list = list.filter(i => i.ward_id == filters.ward_id);
            }
            return list.map(inst => ({
                ...inst,
                ward_name: store.wards.find(w => w.id == inst.ward_id)?.office_name_ne || '-'
            }));
        },
        saveInstitution: function(instData) {
            const store = getStore();
            if (instData.id) {
                const idx = store.institutions.findIndex(i => i.id == instData.id);
                if (idx !== -1) {
                    store.institutions[idx] = { ...store.institutions[idx], ...instData };
                    this.addAuditLog('UPDATE', instData.category, `संस्था '${instData.name_ne}' अद्यावधिक गरियो।`);
                }
            } else {
                const newId = store.institutions.length > 0 ? Math.max(...store.institutions.map(i => i.id)) + 1 : 1;
                const newInst = { ...instData, id: newId, status: 'active' };
                store.institutions.unshift(newInst);
                this.addAuditLog('CREATE', newInst.category, `नयाँ संस्था '${newInst.name_ne}' (${newInst.reg_number}) दर्ता भयो।`);
            }
            saveStore(store);
            return true;
        },
        deleteInstitution: function(id) {
            const store = getStore();
            const item = store.institutions.find(i => i.id == id);
            if (item) {
                store.institutions = store.institutions.filter(i => i.id != id);
                this.addAuditLog('DELETE', item.category, `संस्था '${item.name_ne}' हटाइयो।`);
                saveStore(store);
                return true;
            }
            return false;
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
            this.addAuditLog('CREATE_MASTER', 'settings', `नयाँ मास्टर मान थपियो: [${type}] ${name}`);
            saveStore(store);
            return true;
        },
        getUsers: function() {
            return getStore().users;
        },
        saveUser: function(userData) {
            const store = getStore();
            const newId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
            const newUser = {
                ...userData,
                id: newId,
                status: 'active'
            };
            store.users.unshift(newUser);
            this.addAuditLog('CREATE_USER', 'auth', `नयाँ प्रयोगकर्ता '${newUser.name}' दर्ता गरियो।`);
            saveStore(store);
            return newUser;
        },
        getAuditLogs: function() {
            return getStore().auditLogs;
        },
        addAuditLog: function(action, module, details) {
            const store = getStore();
            const newLog = {
                id: (store.auditLogs.length > 0 ? Math.max(...store.auditLogs.map(l => l.id)) : 0) + 1,
                user_name: 'प्रणाली प्रशासक',
                action: action,
                module: module,
                details: details,
                timestamp: new Date().toLocaleString('ne-NP')
            };
            store.auditLogs.unshift(newLog);
            if (store.auditLogs.length > 100) store.auditLogs.pop();
            saveStore(store);
        },
        resetToDefault: function() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return true;
        }
    };
})();
