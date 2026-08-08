const fs = require('fs');
const path = require('path');

const BANK_FILES = [
    { file: 'questions_v2.json', bank: 'ppl', prefix: 'ppl' },
    { file: 'ir_questions.json', bank: 'ir', prefix: 'ir' },
    { file: 'cpl_questions.json', bank: 'cpl', prefix: 'cpl' }
];

const BASE_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(BASE_DIR, 'cleaned');
const APP_DATA_DIR = path.join(BASE_DIR, 'pilot-test-guide', 'src', 'data');

const APP_OUTPUT_FILES = {
    ppl: 'questions.json',
    ir: 'ir_questions.json',
    cpl: 'cpl_questions.json'
};

// ---------------------------------------------------------------------------
// Category mapping
// ---------------------------------------------------------------------------

const PPL_CHAPTER_CATEGORIES = {
    '1':  'Aviation Fundamentals',
    '2':  'Aircraft Systems',
    '3':  'Aerodynamics',
    '4':  'Flight Environment',
    '5':  'Weather',
    '6':  'Flight Instruments',
    '7':  'Navigation',
    '8':  'Cross-Country Flying',
    '9':  'Night Flying',
    '10': 'Emergency Procedures',
    '11': 'Special Operations',
    '12': 'Regulations & Airspace',
};

const CPL_ACS_CATEGORIES = {
    'I':    'Pilot Qualifications',
    'II':   'Preflight Procedures',
    'III':  'Airport & Airspace Operations',
    'IV':   'Takeoffs, Landings & Go-Arounds',
    'V':    'Performance Maneuvers',
    'VI':   'Navigation',
    'VII':  'Slow Flight & Stalls',
    'VIII': 'Emergency Operations',
    'IX':   'Postflight Procedures',
};

function getPplCategory(id) {
    const chapter = id.split('-')[1];
    return PPL_CHAPTER_CATEGORIES[chapter] || 'General';
}

function getCplCategory(plt) {
    if (!plt) return 'General';
    const m = plt.match(/^[A-Z]{2,3}\.([IVX]+)\./);
    if (!m) return 'General';
    return CPL_ACS_CATEGORIES[m[1]] || 'General';
}

// ---------------------------------------------------------------------------
// Figure reference extraction (PPL only)
// ---------------------------------------------------------------------------
const FIGURE_RE = /\(Refer to (?:figure|figures?)\s+(\d+)[^)]*\)/gi;

function extractFigureRef(text) {
    FIGURE_RE.lastIndex = 0;
    const m = FIGURE_RE.exec(text);
    return m ? parseInt(m[1], 10) : null;
}

// ---------------------------------------------------------------------------
// OCR correction table — map known bad strings to correct ones
// ---------------------------------------------------------------------------
const OCR_FIXES = [
    // l/1 confusion in common words
    [/\bAirp1ane\b/g, 'Airplane'],
    [/\bairp1ane\b/g, 'airplane'],
    [/\btl1e\b/g, 'the'],
    [/\bweatl1er\b/g, 'weather'],
    [/\bl1igh\b/g, 'high'],
    [/\bl1and\b/g, 'land'],
    [/\bwou1d\b/g, 'would'],
    [/\bpi1ot\b/g, 'pilot'],
    [/\bp1ane\b/g, 'plane'],
    [/\bs1gnals?\b/g, 'signals'],
    [/\bmin1mum\b/gi, 'minimum'],
    [/\bmaximun1\b/gi, 'maximum'],
    [/\bma~imun1\b/g, 'Maximum'],
    [/\bmiimum\b/gi, 'minimum'],
    [/\bav1ng\b/gi, 'having'],
    [/\bpil0t\b/g, 'pilot'],
    [/\bcontr o1\b/g, 'control'],
    [/\b1m\b/gi, 'in'],       // "• • gain 1n power" -> "in"
    [/\b1s\b/gi, 'is'],       // OCR "is" -> "1s"
    [/\b1f\b/gi, 'if'],
    [/\b1n\b/gi, 'in'],
    [/\b1t\b/gi, 'it'],
    [/\b1ce\b/gi, 'ice'],
    [/\b1mpulse\b/gi, 'impulse'],
    // Complex OCR corruption
    [/\bv;eather\b/gi, 'weather'],
    [/\bphenon1enon\b/gi, 'phenomenon'],
    [/\ban1il\b/gi, 'anvil'],
    [/\ban,il\b/gi, 'anvil'],
    [/gro[,·\u00B7\s]+th/gi, 'growth'],
    [/thunderstomf/gi, 'thunderstorm'],
    [/\bseea-weatl='ter\b/gi, 'clear weather'],
    [/\baero·dynamic\b/gi, 'aerodynamic'],
    // position → position (1 = i), confirms → confirms
    [/\bpos1t1on\b/gi, 'position'],
    [/\bconfrrm\b/gi, 'confirm'],
    [/\bconfrrms\b/gi, 'confirms'],
    // tilde = corrupted letter (curated, safe cases only)
    [/\bi~crease\b/gi, 'increase'],
    [/\bi~creases\b/gi, 'increases'],
    [/\bpo~er\b/gi, 'power'],
    [/\bre~uced\b/gi, 'reduced'],
    [/\bre~uces\b/gi, 'reduces'],
    [/\bre~uce\b/gi, 'reduce'],
    [/\bth~(?!\w)/gi, 'the'],
    [/\ba~d\b/gi, 'and'],
    [/\bgree~(?!\w)/gi, 'green'],
    [/\bC~Iosed\b/g, 'Closed'],
    [/\bA~RPORT\b/g, 'AIRPORT'],
    [/\bA~M\b/g, 'AIM'],
    [/\baux~liary\b/gi, 'auxiliary'],
    [/~ltemate\b/gi, 'alternate'],
    [/\blogbook~s\b/gi, 'logbooks'],
    [/\bSubtotal1~(?!\w)/gi, 'Subtotal'],
    [/\bma~imun1\b/gi, 'Maximum'],
    [/~\s*n\b/gi, 'on'],
    [/\bwa~e\b/gi, 'wake'],
    [/~\s*ounds\b/gi, 'pounds'],
    [/(\d)~\s*(?=[A-Z])/g, '$1. '],
    [/\bAinnen\b/gi, 'Airmen'],
    [/121,\s*TZ5~~l35/gi, '121,125,135'],
    [/the["”]?\s*~+[''’]/gi, 'the "L"'],
    [/,+\.{2,}\s+/g, '... '],
    // Hyphenated line-break artifacts (e.g. "air- craft" → "aircraft")
    [/(\w+)-\s+(\w)/g, '$1$2'],
    // Stray tilde used as dash/bullet
    [/\s~\s/g, ' '],
    // Superscript/subscript OCR artifacts
    [/•3\s/g, ''],
    [/§\s*/g, ''],
];

// ---------------------------------------------------------------------------
// Hard-stop markers — content is truncated at the earliest of these.
// They signal bleed from the next question / page headers / sidebar margin OCR.
// ---------------------------------------------------------------------------
const HARD_STOP_RE = [
    /\bC\s+Cl\)\s*E\s+Cl\)/,            // sidebar "C Cl) E Cl)"
    /\bCV\s+E\s+CV/,                    // sidebar "C CV E CV"
    /\b0\s+1-u\b/,                      // sidebar "0 1-u"
    /\b1-u\b/,                          // sidebar tail "1-u"
    /!:::/,                             // sidebar "!:::"
    /"'/,                               // sidebar marker  '"' 
    /\b·o\b/,                           // middot-o OCR
    /\b-ta\s+·o/,                       // "-ta ·o" OCR
    /:::/,                              // sidebar ":::"
    /■/,                                // box glyph
    /\s+[a-z]\s+[a-z]\s+[a-z]\s+/,      // single-letter garbage run "m g m a"
    /\bLEGENDS\b/,                      // chart legend bleed
    /\bSECTIONAL\s+AERONAUTICAL\s+CHART\b/,
    /\bBuilding Professional Experience\b/,
    /\bCHAPTER\s+\d+\b/,                // all-caps page header "CHAPTER 1"
    /\bChapter\s+\d+\s*[-–—]/i,         // "Chapter 2 - Airplane Systems"
    /\s+Section\s+[A-Z]\s*[-–—]/i,      // "Section B - Airports"
    /\s+The\s+Flight\s+Environment\b/,  // chapter-title bleed
    /\s+[A-Z][A-Za-z ]{2,}SECTION\s+[A-Z]\s*\.{2,}/, // table-of-contents bleed ".. SECTION A ....."
    /\s+[a-z],\s+u\s+C\s+[a-z]+\s+E\s+[.I]{2,}/,     // sidebar "a, u C ca E I..g"
    /(?:[A-Za-z]\.)?\s*\d+-\d+\.\s*Answer\s+[A-D]\./i, // next answer-key line
    /\s+\d+-\d+\s+PLT\d+/,              // next question header
    /\s+\d+-\d+\s+[A-Z]{2,3}\.[0-9IVXLE]+\.[A-Z]\.?/, // next question (ACS)
];

function cutAtHardStop(s) {
    let cut = -1;
    for (const re of HARD_STOP_RE) {
        const m = s.match(re);
        if (m && (cut === -1 || m.index < cut)) cut = m.index;
    }
    return cut === -1 ? s : s.slice(0, cut);
}

// ---------------------------------------------------------------------------
// cleanString — run all transforms on any string field
// isExplanation flag uses a tighter citation strip to avoid eating content
// ---------------------------------------------------------------------------
function cleanString(str, isExplanation = false) {
    if (!str) return '';
    let s = String(str);

    // 1. Normalize OCR punctuation
    //    "2·12" → "2-12", "2•34" → "2-34" (page/answer refs)
    s = s.replace(/(\d)[·•](\d)/g, '$1-$2');
    //    stray box / bullet glyphs
    s = s.replace(/[■□▪►●]/g, '');
    //    tildes before punctuation / at end ("~.", "~ ", "...~..")
    s = s.replace(/~\.\./g, '...');
    s = s.replace(/~+(?=[\s.,;!?]|$)/g, '');
    //    leading tilde/bullet before a capital letter ("~ (Refer to Figure", "'- The objective")
    s = s.replace(/^[~'\u00B7\u2022\u2013-]+\s*(?=[A-Z(])/, '');
    //    section headers made of OCR garbage like "LONGITUiDINAL" / "ABNORMAb"
    s = s.replace(/\b(LONGITUiDINAL|ABNORMAb)\b/g, (m) => m.charAt(0) + m.slice(1).toLowerCase());

    // 2. Strip question-number + answer prefix at start of field
    s = s.replace(/^\s*\d+-\d+\.?\s*(Answer\s+[A-D]\.?)?\s*/i, '');
    s = s.replace(/^\s*\.\s*Answer\s+[A-D]\.?\s*/i, '');

    // 3. Strip leading book/source references from QUESTION TEXT
    if (!isExplanation) {
        // "GFDIC 1 B, FAR 61.31 <text>", "GFDIC 1 C, PHB ■ <text>", "GF0IC 20, FAR 91.171 <text>"
        s = s.replace(/^\s*GFD[A-Za-z]{0,6}\s+[\w.,~-]+(?:\s+[A-Za-z](?=[,\s]))?,?\s*(?:FAR|AIM|PHB|AFH|ATPH)\s*[\w.]*\s*[•·~■]*\s*/i, '');
        // "FAR 61.31 <text>", "AIM 4-3-2 <text>"
        s = s.replace(/^\s*(?:FAR|AIM|PHB|AFH|ATPH)\s+[\d.]+\s*[•·~■]*\s*/i, '');
        // ACS learning-code prefix: "CA.I.A.K2", "PLT138 CA.I.G.K1d", "CA.I.B.K1, CA.II.A.K2, 3"
        s = s.replace(/^\s*(?:PLT\d+\s+)?(?:[A-Z]{2,3}\.[0-9IVXLE]+\.[A-Z]\.?K?\w*(?:\s*,\s*[A-Z]{2,3}\.[0-9IVXLE]+\.[A-Z]\.?K?\w*|\s*,\s*\d+[a-z]*)*)\*?\s*/i, '');
        // Stray leading digit: "4 If you experience an engine failure..."
        s = s.replace(/^\s*\d+\s+(?=[A-Z])/, '');
        // Leading "Building Professional Experience" page header
        s = s.replace(/^Building Professional Experience\s*/i, '');
    } else {
        // Explanation citation prefix: "GFDIC 3A, Chart Legend, AIM ...",
        // "GFDPP 4-51, Chart Legend The ...", "GFDIC 1B, FAR 119.1 ...", "GFDIC ~A, AIM ..."
        s = s.replace(/^\s*GFD[A-Za-z]{0,6}\s+[\w.,~-]+(?:\s+[A-Za-z](?=[,\s]))?,?\s*(?:Chart\s+Legend\s*,?\s*)?(?:AIM\s+)?/i, '');
        // Standalone handbook tag right after the citation ("GFDIC 128, PHB To determine...")
        s = s.replace(/^\s*(?:PHB|AFH|ATPH)\s+/, '');
    }

    // 4. Cut at earliest hard-stop (bleed / sidebar garbage / next question)
    s = cutAtHardStop(s);
    //    Drop a dangling single-letter fragment left behind ("... expires.) t." → "... expires.)")
    s = s.replace(/\s+[A-Za-z]\.$/, '');

    // 5. Explanation-specific bleed tails (single-space tolerant)
    s = s.replace(/\s+\d+-\d+\.?\s*Answer\s+[A-D]\.?[\s\S]*$/i, '');
    s = s.replace(/\s+\d+-\d+\s+PLT\d+[\s\S]*$/, '');
    s = s.replace(/\s+\d+-\d+\s+[A-Z]{2,3}\.[0-9IVXLE]+\.[A-Z]\.?[\s\S]*$/, '');
    s = s.replace(/\s+Section\s+CFR\s+Part[\s\S]*$/i, '');

    // 6. Remove known document section headings that sometimes appear
    const headings = [
        /Building Professional Experience/gi,
        /One of the unique joys of aviation.*?this section\./gis,
        /REFRESHER TRAINING.*?training\./gis,
        /NEW AVIATION EXPERIENCES.*?horizons\./gis,
        /AVIATION CAREERS.*?hospitals\./gis,
        /ORGANIZATIONS.*?female pilots\./gis,
        /ADDITIONAL RATINGS.*?ATP certificate\./gis,
        /INTRODUCTION TO HUMAN FACTORS/gi,
        /SINGLE-PILOT RESOURCE MANAGEMENT/gi,
        /PILOT IN COMMAND RESPONSIBILITY/gi,
        /SITUATIONAL AWARENESS/gi,
        /AVIATION PHYSIOLOGY/gi,
        /PRESSURE EFFECTS/gi,
        /MOTION SICKNESS/gi,
        /STRESS AND FATIGUE/gi,
    ];
    headings.forEach(p => { s = s.replace(p, ''); });

    // 7. Strip margin / sidebar OCR artifacts
    s = s.replace(/[A-Z]:\s*\(l?\)\s*(?:0\)\s*~|E\s*Cl\))[^.]*?(?=[A-Z]|$)/g, '');
    s = s.replace(/Cl\)\s+E\s+Cl\)[^.]*$/gi, '');
    s = s.replace(/\s[A-Z]\s+Cl\)\s+E\s+Cl\)[^.]*$/gi, '');
    s = s.replace(/\.\s*\.\s*\d+-\d+\s*$/, '.');
    // Stray paragraph/page numbers at very end
    s = s.replace(/\s+\d{1,3}\s*$/, '');

    // 8. Apply OCR corrections
    OCR_FIXES.forEach(([pattern, replacement]) => {
        s = s.replace(pattern, replacement);
    });

    // 9. Remove stray bullet / box characters + stray middots
    s = s.replace(/[■·•►▪]/g, '');
    //    Tildes left adjacent to punctuation after glyph removal ("~~" → "")
    s = s.replace(/~+(?=[\s.,;!?]|$)/g, '');

    // 10. Normalize whitespace (including space-before-period, double spaces)
    s = s.replace(/\s+/g, ' ').trim();
    s = s.replace(/\s+([.,;!?])/g, '$1');
    s = s.replace(/\s+([-])\s*/g, ' $1 ');

    return s;
}

// ---------------------------------------------------------------------------
// cleanOptions — clean each option, drop non A/B/C keys, fix missing periods
// ---------------------------------------------------------------------------
function cleanOptions(options) {
    if (!options) return options;
    const valid = {};
    for (const key of ['A', 'B', 'C']) {
        if (!(key in options)) continue;
        let val = cleanString(options[key]);
        // Add trailing period if the option is a complete phrase lacking one
        if (val && val.length > 3 && !/[.!?]$/.test(val)) val += '.';
        valid[key] = val;
    }
    return valid;
}

// ---------------------------------------------------------------------------
// normalizePlt — fix OCR in ACS learning codes ("CA.I.A.Kl" -> "CA.I.A.K1")
// ---------------------------------------------------------------------------
function normalizePlt(plt) {
    if (!plt) return '';
    let p = String(plt).trim();
    // Strip trailing garbage: spaces, commas, periods, stray asterisks-spacing
    p = p.replace(/[\s.,]+$/g, '');
    p = p.replace(/\s*\*\s*/g, '*');
    // Fix OCR Roman numerals: "CA.111.B." -> "CA.III.B.", "CA.11.D." -> "CA.II.D."
    p = p.replace(/(^|[A-Z]{2,3}\.)([0-9lL]{2,4})(?=\.)/g, (m, pre, roman) =>
        pre + roman.replace(/[0-9lL]/g, (c) => (c === '0' ? 'O' : 'I'))
    );
    // Fix merged "CA.LE." -> "CA.I.E." (missing dot after roman I)
    p = p.replace(/^CA\.[lL1]E\./g, 'CA.I.E.');
    // Fix sub-code digit l/1 confusion: "Kl" -> "K1", "Rl" -> "R1"
    p = p.replace(/([KR])l/g, '$11');
    // Trailing lowercase-l used as digit
    p = p.replace(/l(?=[,\s*]|$)/g, '1');
    return p;
}

// ---------------------------------------------------------------------------
// processBank
// ---------------------------------------------------------------------------
function processBank(bankConfig) {
    console.log(`\nProcessing ${bankConfig.bank.toUpperCase()}...`);
    const filePath = path.join(BASE_DIR, bankConfig.file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const seenTexts = new Set();
    const cleaned = [];
    let stats = { removed_duplicates: 0, removed_invalid_answer: 0, removed_too_short: 0 };

    for (const q of data) {
        // Normalize ID
        const id = `${bankConfig.prefix}-${q.id}`;

        // Clean text
        const raw = q.text || '';
        let text = cleanString(raw);

        // Whole-page section bleed (e.g. cpl-12-62): keep only the trailing
        // question keyed by "QID  ACS_CODE ... question stem". Must run on the
        // raw string because the hard-stop cut would strip the tail first.
        const tailKey = /\s+\d+-\d+\s+[A-Z]{2,3}\.[0-9IVXLE]+\.[A-Z][\w.]*\s*(?:,\s*[A-Za-z]+)?\s+(.+)$/s;
        if (raw.length > 800 && /^SECTION\s+[A-Z]/.test(raw.trim()) && tailKey.test(raw)) {
            text = cleanString(raw.match(tailKey)[1]);
            // Drop a trailing sidebar remnant like "... about its u z"
            text = text.replace(/\s+[A-Za-z]\s+[A-Za-z]$/, '');
        }

        // Skip empty or near-empty questions (extraction artifacts)
        if (text.length < 10) { stats.removed_too_short++; continue; }

        // Deduplicate on cleaned text
        if (seenTexts.has(text)) { stats.removed_duplicates++; continue; }
        seenTexts.add(text);

        // Validate answer key
        const correct = (q.correct || '').trim().toUpperCase();
        if (!['A', 'B', 'C'].includes(correct)) { stats.removed_invalid_answer++; continue; }

        // Normalize PLT field — strip IDs that crept in, fix OCR
        const rawPlt = (q.plt || '').trim();
        const plt = /^\d+-\d+$/.test(rawPlt) ? '' : normalizePlt(rawPlt);

        // Category
        let category;
        if (bankConfig.bank === 'ppl') {
            category = getPplCategory(id);
        } else {
            category = getCplCategory(plt);
        }

        // Figure reference (PPL only)
        const figureRef = bankConfig.bank === 'ppl' ? extractFigureRef(text) : null;

        const entry = {
            id,
            bank: bankConfig.bank,
            plt,
            category,
            text,
            options: cleanOptions(q.options),
            correct,
            explanation: cleanString(q.explanation, true),
        };
        if (figureRef !== null) entry.figureRef = figureRef;

        cleaned.push(entry);
    }

    const outPath = path.join(OUTPUT_DIR, `${bankConfig.bank}_cleaned.json`);
    fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2));
    console.log(`  Saved:    ${cleaned.length} questions → ${outPath}`);
    console.log(`  Removed:  ${stats.removed_duplicates} duplicates, ${stats.removed_invalid_answer} invalid-answer, ${stats.removed_too_short} too-short`);
    console.log(`  Input:    ${data.length}  →  Output: ${cleaned.length}`);

    // Emit an app-consumable copy with unprefixed ids (the app prefixes them itself)
    const appFile = APP_OUTPUT_FILES[bankConfig.bank];
    if (appFile) {
        const appOutPath = path.join(APP_DATA_DIR, appFile);
        const appCopy = cleaned.map(({ id, bank, ...rest }) => ({ ...rest, id: id.slice(bankConfig.prefix.length + 1) }));
        fs.writeFileSync(appOutPath, JSON.stringify(appCopy, null, 2));
        console.log(`  Saved:    ${appCopy.length} questions → ${appOutPath} (unprefixed ids)`);
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
BANK_FILES.forEach(processBank);
console.log('\nAll banks cleaned.');
