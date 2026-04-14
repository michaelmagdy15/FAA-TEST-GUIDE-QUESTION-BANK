const fs = require('fs');
const path = require('path');

const BANK_FILES = [
    { file: 'questions_v2.json', bank: 'ppl', prefix: 'ppl' },
    { file: 'ir_questions.json', bank: 'ir', prefix: 'ir' },
    { file: 'cpl_questions.json', bank: 'cpl', prefix: 'cpl' }
];

const BASE_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(BASE_DIR, 'cleaned');

// ---------------------------------------------------------------------------
// Category mapping
// ---------------------------------------------------------------------------

// PPL: chapter number -> human-readable topic
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

// CPL/IR: ACS Roman numeral area -> topic
// e.g. CA.I -> Preflight, CA.II -> Preflight Procedures, etc.
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
    // id is like 'ppl-4-59' -> chapter '4'
    const chapter = id.split('-')[1];
    return PPL_CHAPTER_CATEGORIES[chapter] || 'General';
}

function getCplCategory(plt) {
    // plt is like 'CA.II.B.K2' -> area 'II'
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

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// ---------------------------------------------------------------------------
// OCR correction table — map known bad strings to correct ones
// ---------------------------------------------------------------------------
const OCR_FIXES = [
    // l/1 confusion
    [/\bAirp1ane\b/g, 'Airplane'],
    [/\bairp1ane\b/g, 'airplane'],
    [/\btl1e\b/g, 'the'],
    [/\bweatl1er\b/g, 'weather'],
    [/\bl1igh\b/g, 'high'],
    [/\bpil0t\b/g, 'pilot'],
    [/\bcontr o1\b/g, 'control'],
    // Complex OCR corruption
    [/\bv;eather\b/gi, 'weather'],
    [/\bphenon1enon\b/gi, 'phenomenon'],
    [/\ban1il\b/gi, 'anvil'],
    [/\ban,il\b/gi, 'anvil'],
    [/\bMa~imun1\b/g, 'Maximum'],
    [/\bma~imun1\b/g, 'maximum'],
    [/gro[,·\u00B7\s]+th/gi, 'growth'], // middle-dot (U+00B7) hides between ,, and th
    [/thunderstomf/gi, 'thunderstorm'],
    [/\bmaximun1\b/gi, 'maximum'],
    [/\bmiimum\b/gi, 'minimum'],
    [/\bseea-weatl='ter\b/gi, 'clear weather'],
    // Hyphenated line-break artifacts (e.g. "air- craft" → "aircraft")
    [/(\w+)-\s+(\w)/g, '$1$2'],
    // Stray tilde used as dash/bullet
    [/\s~\s/g, ' '],
    // Superscript/subscript OCR artifacts
    [/•3\s/g, ''],
    [/§\s*/g, ''],
];

// ---------------------------------------------------------------------------
// cleanString — run all transforms on any string field
// isExplanation flag uses a tighter citation strip to avoid eating content
// ---------------------------------------------------------------------------
function cleanString(str, isExplanation = false) {
    if (!str) return '';
    let s = str;

    // 1. Strip question-number + answer prefix at start of field
    //    Handles: "1-1. Answer B. GFDIC..." and ". Answer B. GFDIC..."
    s = s.replace(/^\s*\d+-\d+\.?\s*(Answer\s+[A-D]\.?)?\s*/gi, '');
    s = s.replace(/^\s*\.\s*Answer\s+[A-D]\.?\s*/gi, '');

    // 2. Strip leading book/source references — two different strategies:
    if (isExplanation) {
        // Explanations: citation always ends at a double-space before actual text.
        // e.g. "GFDPP 4-21, AIM  With wind from the northwest..."
        //       ^^^^^^^^^^^^^^^^^^ strip this part only
        s = s.replace(/^\s*GFD\w*\s+[\w.,/\s-]+?\s{2,}/i, '');
    } else {
        // Question text: citation is tightly coupled with only a single space before content.
        // e.g. "GFDIC 1 B, FAR 61.31 To act as PIC..." or "GFDIC A, AFH ~ To establish..."
        s = s.replace(/^\s*GFD[A-Z]{0,4}\s+[\w\s,-]+(?:,\s*(?:FAR|AIM|PHB|AFH|ATPH)\s*[\w.\s-]*)?\s*~?\s*/gi, '');
        s = s.replace(/^\s*(?:FAR|AIM|PHB|AFH)\s+[\d.\s]+\s*/gi, '');
    }

    // 3. Cut explanation bleed — everything from the next question header onward
    //    Pattern 1: "  4-60  PLT140  ..."
    s = s.replace(/\s{2,}\d+-\d+\s+PLT\d+[\s\S]*$/, '');
    //    Pattern 2: "  ll-75  PLT438 ..." (with OCR l→l)
    s = s.replace(/\s{2,}[lI1]{0,1}[\d]+-\d+\s+PLT\d+[\s\S]*$/, '');
    //    Pattern 3: " Section CFR Part..." or "Section [Letter] -..."
    s = s.replace(/\s+Section\s+CFR\s+Part[\s\S]*$/, '');
    //    Pattern 4: Chart/legend dump that starts with "LEGENDS ~"
    s = s.replace(/\s+(?:FAA\s+)?LEGENDS\s*~[\s\S]*$/, '');
    //    Pattern 5: Sectional chart legend blocks
    s = s.replace(/\s+SECTIONAL\s+AERONAUTICAL\s+CHART[\s\S]*$/, '');
    //    Pattern 6: CA.I.A.K-style codes (IR/CPL next-question headers)
    s = s.replace(/\s{2,}[A-Z]{2}\.[IVX]+\.[A-Z]+\.K[\w.]*[\s\S]*$/, '');

    // 4. Strip chapter / section page headers that bled into option text
    s = s.replace(/\s{2,}Chapter\s+\d+[\s\S]*/gi, '');
    s = s.replace(/\s{2,}Section\s+[A-Z]\s*-[\s\S]*/gi, '');

    // 5. Remove known document section headings that sometimes appear
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
    ];
    headings.forEach(p => { s = s.replace(p, ''); });

    // 6. Strip margin / sidebar OCR artifacts
    //    e.g. "C: (l) 0) ~ <( ~ I ,_ -~"
    s = s.replace(/[A-Z]:\s*\(l?\)\s*(?:0\)\s*~|E\s*Cl\))[^.]*?(?=[A-Z]|$)/g, '');
    s = s.replace(/Cl\)\s+E\s+Cl\)[^.]*$/gi, '');
    s = s.replace(/\s[A-Z]\s+Cl\)\s+E\s+Cl\)[^.]*$/gi, '');
    // Stray paragraph/page numbers at very end
    s = s.replace(/\s+\d{1,3}\s*$/, '');

    // 7. Apply OCR corrections
    OCR_FIXES.forEach(([pattern, replacement]) => {
        s = s.replace(pattern, replacement);
    });

    // 8. Remove stray bullet / box characters
    s = s.replace(/[■·•►▪]/g, '');

    // 9. Normalize whitespace
    s = s.replace(/\s+/g, ' ').trim();

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
// processBank
// ---------------------------------------------------------------------------
function processBank(bankConfig) {
    console.log(`\nProcessing ${bankConfig.bank.toUpperCase()}...`);
    const filePath = path.join(BASE_DIR, bankConfig.file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const seenTexts = new Set();
    const cleaned = [];
    let stats = { removed_duplicates: 0, removed_invalid_answer: 0 };

    for (const q of data) {
        // Normalize ID
        const id = `${bankConfig.prefix}-${q.id}`;

        // Clean text
        const text = cleanString(q.text || '');

        // Skip empty or near-empty questions (extraction artifacts)
        if (text.length < 10) continue;

        // Deduplicate on cleaned text
        if (seenTexts.has(text)) { stats.removed_duplicates++; continue; }
        seenTexts.add(text);

        // Validate answer key
        const correct = (q.correct || '').trim().toUpperCase();
        if (!['A', 'B', 'C'].includes(correct)) { stats.removed_invalid_answer++; continue; }

        // Normalize PLT field — strip IDs that crept in
        const plt = (q.plt && /^\d+-\d+$/.test(q.plt)) ? '' : (q.plt || '');

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
    console.log(`  Removed:  ${stats.removed_duplicates} duplicates, ${stats.removed_invalid_answer} invalid-answer`);
    console.log(`  Input:    ${data.length}  →  Output: ${cleaned.length}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
BANK_FILES.forEach(processBank);
console.log('\nAll banks cleaned.');
