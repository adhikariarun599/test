/**
 * =============================================================================
 * ePalika - Nepali Unicode Smart Transliteration Engine
 * Converts Romanized English to Devanagari Nepali Unicode in real-time as you type.
 * बाणगंगा नगरपालिका - आन्तरिक नियन्त्रण प्रणाली
 * =============================================================================
 */

(function (window) {
    'use strict';

    // Extensive Dictionary for Instant Perfect Match of Common Nepali Names & Surnames
    const NEPALI_NAME_DICT = {
        // First Names
        'bhaktaraj': 'भक्तराज',
        'bhakta': 'भक्त',
        'ram': 'राम',
        'shyam': 'श्याम',
        'hari': 'हरि',
        'gita': 'गीता',
        'geeta': 'गीता',
        'sita': 'सीता',
        'seeta': 'सीता',
        'krishna': 'कृष्ण',
        'bishnu': 'विष्णु',
        'vishnu': 'विष्णु',
        'shiva': 'शिव',
        'laxmi': 'लक्ष्मी',
        'lakshmi': 'लक्ष्मी',
        'laxman': 'लक्ष्मण',
        'bharat': 'भरत',
        'satrughan': 'शत्रुघ्न',
        'narayan': 'नारायण',
        'ganesh': 'गणेश',
        'govinda': 'गोविन्द',
        'gobinda': 'गोविन्द',
        'madhav': 'माधव',
        'keshav': 'केशव',
        'arjun': 'अर्जुन',
        'bhim': 'भीम',
        'kiran': 'किरण',
        'roshan': 'रोशन',
        'arun': 'अरुण',
        'suresh': 'सुरेश',
        'santosh': 'सन्तोष',
        'santos': 'सन्तोष',
        'mahesh': 'महेश',
        'dinesh': 'दिनेश',
        'ramesh': 'रमेश',
        'rajesh': 'राजेश',
        'raj': 'राज',
        'kumar': 'कुमार',
        'prasad': 'प्रसाद',
        'bahadur': 'बहादुर',
        'manoj': 'मनोज',
        'sunil': 'सुनिल',
        'anil': 'अनिल',
        'bikash': 'विकास',
        'vikash': 'विकास',
        'vikas': 'विकास',
        'sanjay': 'सञ्जय',
        'deepak': 'दीपक',
        'dipak': 'दिपक',
        'prakash': 'प्रकाश',
        'binod': 'विनोद',
        'vinod': 'विनोद',
        'kamal': 'कमल',
        'bimal': 'विमल',
        'nirmal': 'निर्मल',
        'nabaraj': 'नवराज',
        'navaraj': 'नवराज',
        'ishwor': 'ईश्वर',
        'iswor': 'ईश्वर',
        'badri': 'बद्री',
        'rudra': 'रुद्र',
        'damodar': 'दामोदर',
        'ganga': 'गंगा',
        'jamuna': 'जमुना',
        'maya': 'माया',
        'kumari': 'कुमारी',
        'devi': 'देवी',
        'shanti': 'शान्ति',
        'sarita': 'सरिता',
        'sunita': 'सुनिता',
        'anita': 'अनिता',
        'sushila': 'सुशीला',
        'parbati': 'पार्वती',
        'radha': 'राधा',
        'pratima': 'प्रतिमा',
        'pramila': 'प्रमिला',
        'sarmila': 'शर्मिला',
        'sabitra': 'साबित्रा',
        'manju': 'मञ्जु',
        'kabita': 'कविता',
        'sabina': 'सविना',
        'puja': 'पूजा',
        'pooja': 'पूजा',
        'rupa': 'रूपा',
        'punam': 'पूनम',
        'poonam': 'पूनम',
        'manisha': 'मनिषा',
        'asmita': 'अस्मिता',
        'anjana': 'अञ्जना',
        'sandhya': 'सन्ध्या',
        'alisha': 'अलिशा',
        'sagar': 'सागर',
        'bijay': 'विजय',
        'vijay': 'विजय',
        'nabin': 'नवीन',
        'navin': 'नवीन',
        'rabin': 'रबिन',
        'shankar': 'शंकर',
        'mukesh': 'मुकेश',
        'naresh': 'नरेश',
        'umesh': 'उमेश',
        'dhan': 'धन',
        'dharma': 'धर्म',
        'durga': 'दुर्गा',
        'indra': 'इन्द्र',
        'som': 'सोम',
        'bhanu': 'भानु',
        'jagdish': 'जगदीश',
        'janak': 'जनक',
        'jagat': 'जगत',
        'madan': 'मदन',
        'madhu': 'मधु',
        'mukunda': 'मुकुन्द',
        'muna': 'मुना',
        'nanda': 'नन्द',
        'narendra': 'नरेन्द्र',
        'netra': 'नेत्र',
        'om': 'ओम',
        'padam': 'पदम',
        'pradeep': 'प्रदीप',
        'pradip': 'प्रदिप',
        'prahlad': 'प्रह्लाद',
        'pramod': 'प्रमोद',
        'purushottam': 'पुरुषोत्तम',
        'rajendra': 'राजेन्द्र',
        'rajkumar': 'राजकुमार',
        'ranjit': 'रणजीत',
        'ratna': 'रत्न',
        'ravindra': 'रविन्द्र',
        'rabindra': 'रविन्द्र',
        'rishi': 'ऋषि',
        'rohit': 'रोहित',
        'sachin': 'सचिन',
        'samir': 'समीर',
        'sandip': 'सन्दीप',
        'saroj': 'सरोज',
        'satish': 'सतीश',
        'saurav': 'सौरभ',
        'sekhar': 'शेखर',
        'shashi': 'शशि',
        'shishir': 'शिशिर',
        'shobha': 'शोभा',
        'sudhir': 'सुधीर',
        'sujan': 'सुजन',
        'suman': 'सुमन',
        'sushant': 'सुशान्त',
        'sushil': 'सुशील',
        'tanka': 'टंक',
        'tara': 'तारा',
        'thakur': 'ठाकुर',
        'tirtha': 'तीर्थ',
        'tulsi': 'तुलसी',
        'ujjwal': 'उज्ज्वल',
        'upendra': 'उपेन्द्र',
        'uttam': 'उत्तम',
        'yadav': 'यादव',
        'yam': 'यम',
        'yubaraj': 'युवराज',
        'yuvaraj': 'युवराज',

        // Surnames / Castes
        'joshi': 'जोशी',
        'shrestha': 'श्रेष्ठ',
        'adhikari': 'अधिकारी',
        'bhattarai': 'भट्टराई',
        'pokharel': 'पोखरेल',
        'pokhrel': 'पोखरेल',
        'thapa': 'थापा',
        'magar': 'मगर',
        'gurung': 'गुरुङ',
        'tamang': 'तामाङ',
        'rai': 'राई',
        'limbu': 'लिम्बु',
        'chaudhary': 'चौधरी',
        'chaudhari': 'चौधरी',
        'bhandari': 'भण्डारी',
        'pandey': 'पाण्डेय',
        'pande': 'पाण्डे',
        'subedi': 'सुवेदी',
        'regmi': 'रेग्मी',
        'karki': 'कार्की',
        'khadka': 'खड्का',
        'paudel': 'पौडेल',
        'poudel': 'पौडेल',
        'dahal': 'दाहाल',
        'acharya': 'आचार्य',
        'bhatta': 'भट्ट',
        'ghimire': 'घिमिरे',
        'bista': 'विष्ट',
        'kc': 'केसी',
        'oli': 'ओली',
        'kharel': 'खरेल',
        'bhusal': 'भुसाल',
        'khanal': 'खनाल',
        'rijal': 'रिजाल',
        'parajuli': 'पराजुली',
        'basnet': 'बस्नेत',
        'singh': 'सिंह',
        'giri': 'गिरी',
        'puri': 'पुरी',
        'rawal': 'रावल',
        'chhetri': 'क्षेत्री',
        'baniya': 'बानियाँ',
        'devkota': 'देवकोटा',
        'bastola': 'बास्तोला',
        'sapkot': 'सापकोटा',
        'sapkota': 'सापकोटा',
        'tiwari': 'तिवारी',
        'upadhyay': 'उपाध्याय',
        'upadhyaya': 'उपाध्याय',
        'pathak': 'पाठक',
        'neupane': 'न्यौपाने',
        'kattel': 'कट्टेल',
        'kafle': 'काफ्ले',
        'luitel': 'लुइटेल',
        'timilsina': 'तििमल्सिना',
        'dhamala': 'धमाला',
        'panta': 'पन्त',
        'koirala': 'कोइराला',
        'baral': 'बराल',
        'aryal': 'अर्याल',

        // Places & Municipal Terms
        'nepal': 'नेपाल',
        'banganga': 'बाणगंगा',
        'kapilvastu': 'कपिलवस्तु',
        'kapilbastu': 'कपिलवस्तु',
        'lumbini': 'लुम्बिनी',
        'jitpur': 'जीतपुर',
        'ward': 'वडा',
        'karyalaya': 'कार्यालय',
        'nagarpalika': 'नगरपालिका',
        'epalika': 'इपालिका'
    };

    // Phonetic Rules Table
    const CONSONANTS = {
        'ksha': 'क्ष', 'chhya': 'क्ष', 'chha': 'छ',
        'gya': 'ज्ञ', 'gy': 'ज्ञ्', 'tra': 'त्र', 'tr': 'त्र्',
        'shra': 'श्र', 'shr': 'श्र्',
        'chh': 'छ्', 'kh': 'ख्', 'gh': 'घ्', 'ch': 'च्',
        'jh': 'झ्', 'th': 'थ्', 'dh': 'ध्', 'bh': 'भ्',
        'sh': 'श्', 'shh': 'ष्', 'ph': 'फ्', 'ng': 'ङ्',
        'yn': 'ञ्', 'Th': 'ठ्', 'Dh': 'ढ्',
        'k': 'क्', 'g': 'ग्', 'j': 'ज्', 't': 'त्', 'd': 'द्',
        'T': 'ट्', 'D': 'ड्', 'n': 'न्', 'N': 'ण्', 'p': 'प्',
        'f': 'फ्', 'b': 'ब्', 'm': 'म्', 'y': 'य्', 'r': 'र्',
        'l': 'ल्', 'v': 'व्', 'w': 'व्', 's': 'स्', 'h': 'ह्'
    };

    const VOWEL_MATRAS = {
        'aa': 'ा', 'A': 'ा',
        'ee': 'ी', 'I': 'ी',
        'oo': 'ू', 'U': 'ू',
        'ai': 'ै', 'au': 'ौ',
        'a': '', // schwa clears virama
        'i': 'ि', 'u': 'ु', 'e': 'े', 'o': 'ो',
        'ri': 'ृ'
    };

    const INDEPENDENT_VOWELS = {
        'aa': 'आ', 'A': 'आ',
        'ee': 'ई', 'I': 'ई',
        'oo': 'ऊ', 'U': 'ऊ',
        'ai': 'ऐ', 'au': 'औ',
        'a': 'अ', 'i': 'इ', 'u': 'उ', 'e': 'ए', 'o': 'ओ',
        'ri': 'ऋ'
    };

    const DIGITS = {
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };

    /**
     * Algorithmic Phonetic Transliteration of a single word
     */
    function phoneticConvert(word) {
        if (!word) return '';

        // Check if digits
        let res = '';
        let i = 0;
        let lastWasConsonantWithVirama = false;

        while (i < word.length) {
            const ch = word[i];

            // Digits
            if (DIGITS[ch] !== undefined) {
                res += DIGITS[ch];
                lastWasConsonantWithVirama = false;
                i++;
                continue;
            }

            // Explicit halant / virama escape
            if (ch === '\\' || ch === '_') {
                if (res.length > 0 && !res.endsWith('्')) {
                    res += '्';
                }
                lastWasConsonantWithVirama = true;
                i++;
                continue;
            }

            // Anusvara (M or am/an)
            if (ch === 'M') {
                res += 'ं';
                lastWasConsonantWithVirama = false;
                i++;
                continue;
            }
            if (ch === 'H') {
                res += 'ः';
                lastWasConsonantWithVirama = false;
                i++;
                continue;
            }

            // Check 4-char, 3-char, 2-char, 1-char combinations
            const slice4 = word.substr(i, 4);
            const slice3 = word.substr(i, 3);
            const slice2 = word.substr(i, 2);
            const slice1 = word.substr(i, 1);

            // Check Vowels
            let matchedVowel = null;
            let vowelLen = 0;
            if (VOWEL_MATRAS[slice2] !== undefined) {
                matchedVowel = slice2;
                vowelLen = 2;
            } else if (VOWEL_MATRAS[slice1] !== undefined) {
                matchedVowel = slice1;
                vowelLen = 1;
            }

            if (matchedVowel !== null) {
                if (lastWasConsonantWithVirama) {
                    // Replace virama with matra
                    res = res.slice(0, -1) + VOWEL_MATRAS[matchedVowel];
                } else {
                    // Independent initial vowel
                    res += INDEPENDENT_VOWELS[matchedVowel] || matchedVowel;
                }
                lastWasConsonantWithVirama = false;
                i += vowelLen;
                continue;
            }

            // Check Consonants
            let matchedConsonant = null;
            let cLen = 0;
            if (CONSONANTS[slice4] !== undefined) {
                matchedConsonant = CONSONANTS[slice4];
                cLen = 4;
            } else if (CONSONANTS[slice3] !== undefined) {
                matchedConsonant = CONSONANTS[slice3];
                cLen = 3;
            } else if (CONSONANTS[slice2] !== undefined) {
                matchedConsonant = CONSONANTS[slice2];
                cLen = 2;
            } else if (CONSONANTS[slice1] !== undefined) {
                matchedConsonant = CONSONANTS[slice1];
                cLen = 1;
            }

            if (matchedConsonant !== null) {
                res += matchedConsonant;
                lastWasConsonantWithVirama = matchedConsonant.endsWith('्');
                i += cLen;
                continue;
            }

            // Other character (symbols, punctuation, etc.)
            res += ch;
            lastWasConsonantWithVirama = false;
            i++;
        }

        // Natural Nepali convention: A trailing virama at the end of a word is stripped
        // (e.g. "bhaktaraj" -> भक्तराज not भक्तराज्; "ram" -> राम not राम्)
        if (res.endsWith('्')) {
            res = res.slice(0, -1);
        }

        return res;
    }

    /**
     * Transliterate a single word (Checks dictionary first, then algorithm)
     */
    function transliterateWord(word) {
        if (!word) return '';
        // If entirely non-ASCII (already Nepali), keep as is
        if (!/[a-zA-Z]/.test(word)) return word;

        const lower = word.toLowerCase();
        if (NEPALI_NAME_DICT[lower]) {
            return NEPALI_NAME_DICT[lower];
        }

        return phoneticConvert(word);
    }

    /**
     * Transliterate a full text string
     */
    function transliterateText(text) {
        if (!text) return '';
        // Tokenize by words and spaces/punctuation
        return text.replace(/([a-zA-Z0-9_\\]+)/g, function (match) {
            return transliterateWord(match);
        });
    }

    /**
     * Attach smart live transliteration to an input or textarea
     */
    function attach(input, options = {}) {
        if (!input || input.__nepaliUnicodeAttached) return;
        input.__nepaliUnicodeAttached = true;

        let enabled = options.enabled !== undefined ? options.enabled : true;

        // Visual indicator / toggle button if requested
        if (options.showToggle !== false) {
            const toggleContainer = document.createElement('span');
            toggleContainer.className = 'unicode-toggle-pill';
            toggleContainer.title = 'नेपाली युनिकोड (क्लिक गरेर अन/अफ गर्नुहोस् वा Ctrl+G थिच्नुहोस्)';
            toggleContainer.innerHTML = `<span class="badge ${enabled ? 'bg-success' : 'bg-secondary'} user-select-none" style="cursor:pointer; font-size:0.7rem;"><i class="fa-solid fa-keyboard me-1"></i>${enabled ? 'नेपाली युनिकोड' : 'English'}</span>`;

            toggleContainer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                enabled = !enabled;
                updateToggleUI();
                input.focus();
            });

            function updateToggleUI() {
                const badge = toggleContainer.querySelector('.badge');
                if (badge) {
                    badge.className = `badge ${enabled ? 'bg-success' : 'bg-secondary'} user-select-none`;
                    badge.innerHTML = `<i class="fa-solid fa-keyboard me-1"></i>${enabled ? 'नेपाली युनिकोड' : 'English'}`;
                }
            }

            if (input.parentNode) {
                // If input is inside an input-group or div
                input.parentNode.style.position = 'relative';
                // Add right margin or place nicely
            }
        }

        // Live input conversion
        input.addEventListener('input', function (e) {
            if (!enabled) return;

            // Only convert if there are Roman letters
            const val = this.value;
            if (!/[a-zA-Z]/.test(val)) return;

            const start = this.selectionStart;
            const end = this.selectionEnd;

            const converted = transliterateText(val);

            if (converted !== val) {
                this.value = converted;
                // Preserve cursor position gracefully at end or approximate
                const newPos = Math.max(0, start + (converted.length - val.length));
                this.setSelectionRange(newPos, newPos);
            }
        });

        // Toggle with Ctrl + G
        input.addEventListener('keydown', function (e) {
            if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
                e.preventDefault();
                enabled = !enabled;
                if (options.onToggle) options.onToggle(enabled);
            }
        });

        return {
            toggle: () => { enabled = !enabled; return enabled; },
            isEnabled: () => enabled
        };
    }

    // Public API
    window.NepaliUnicode = {
        transliterateWord: transliterateWord,
        transliterateText: transliterateText,
        attach: attach,
        dictionary: NEPALI_NAME_DICT
    };

})(window);
