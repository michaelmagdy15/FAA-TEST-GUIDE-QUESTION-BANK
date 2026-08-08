#!/usr/bin/env node
/**
 * validate_questions.js — QA validator for the FAA question bank JSON files.
 *
 * Scans each bank for syntax issues and prints a report. Exits non-zero if any
 * ERROR-level issues are found.
 *
 * Checks:
 *   STRUCTURE  — id/text/options/correct/plt types, duplicate ids, option keys
 *   LEAK       — answer or source reference leaked into question text
 *   BLEED      — next-question headers / page headers / sidebar garbage in content
 *   OCR        — l/1 digit confusions, stray glyphs
 *   FORMAT     — whitespace, unbalanced parens/quotes, missing terminal punctuation
 *
 * Usage:
 *   node scripts/validate_questions.js [--strict] [file.json ...]
 *   (defaults to cleaned/ppl_cleaned.json, cleaned/ir_cleaned.json, cleaned/cpl_cleaned.json)
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

// Next-question header bleed: "4-60  PLT140", "1-2 CA.I.A.K1", "1-2  CA.I.A.Kl"
const BLEED_QID = /\d+-\d+\s+(?:PLT\d+|[A-Z]{2}\.\s*[IVX]+\s*\.\s*[A-Z]+\.?)/;
// "1-1. Answer B. GFDIC..." answer-key line inside content
const ANSWER_LINE = /[.\s]+\d+-\d+\.\s*Answer\s+[A-D]\./;
// Answer/source-ref prefix at start of a question text (may start with a stray "B,")
const TEXT_PREFIX = /^\s*(?:\d+-\d+\.?\s*)?(?:Answer\s+[A-D]\.?\s*)?(?:[A-D],\s*)?(?:GFD[A-Z]{0,4}\s+[\w.,\s-]+,?\s*(?:FAR|AIM|PHB|AFH|ATPH)?[^A-Za-z]{0,20}|(?:FAR|AIM|PHB|AFH)\s+[\d.]+\s+)/i;
// Residual fragment prefix like ".31 To act as PIC"
const FRAGMENT_PREFIX = /^\.\s*\d+\s+[A-Z]/;
// Page/chapter/section header bleed (case-sensitive per variant)
const HEADER_BLEED = /\bChapter\s+\d+\s*[-–—]|\bCHAPTER\s+\d+\b|Section\s+[A-Z]\s*[-–—]|SECTION\s+[A-Z]\b|Building Professional Experience|REFRESHER TRAINING|NEW AVIATION EXPERIENCES|AVIATION CAREERS|ORGANIZATIONS|ADDITIONAL RATINGS|INTRODUCTION TO HUMAN FACTORS|SINGLE-PILOT RESOURCE MANAGEMENT/;
// Chart-legend bleed (only the all-caps page headers, not prose)
const LEGEND_BLEED = /\bSECTIONAL\s+AERONAUTICAL\s+CHART\b|\bLEGENDS\b/;
// Sidebar / margin OCR garbage
const SIDEBAR_OCR = /C\s*Cl\)\s*E\s*Cl\)|!:::|\u00B7o\b|\b0\s+1-u|\b-·o\b|"'|\*\s*=|•3|§/;
// Garbage glyphs
const GLYPHS = /[■▪►●•·]|C\s+E\s+Cl\)|CV\s+E\s+CV|"'/;
// Standalone tilde: must have non-word context on BOTH sides (word-adjacent
// tildes are OCR letter corruption → WARN via WORD_TILDE)
const STANDALONE_TILDE = /(^|[\s(]|[.,;!?]|~+)~(?![A-Za-z0-9'"'"'‘’])/;
// Word-internal / word-adjacent tilde → OCR corruption
const WORD_TILDE = /(^|[\s(])~[A-Za-z]|[A-Za-z]~[A-Za-z]/;
// OCR l/1 confusion: digit surrounded by lowercase letters (av1ng, tl1e, wou1d)
const OCR_ONE = /\b[a-z]+[0-9][a-z]+\b/;
// Multiple consecutive spaces (after whitespace normalization this is a smell)
const DOUBLE_SPACE = /\s{2,}/;

// Known legit words that pass the OCR_ONE check but are actually fine
const OCR_ALLOW = new Set(['r1', 'd1']);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function checkString(str, field, id, label, issues) {
    if (typeof str !== 'string') {
        issues.push({ id, field, label, level: 'ERROR', check: 'type', detail: 'not a string' });
        return;
    }
    const s = str;

    const push = (level, check, detail) =>
        issues.push({ id, field, label, level, check, detail });

    if (BLEED_QID.test(s)) push('ERROR', 'bleed', 'next-question header leaked in');
    if (ANSWER_LINE.test(s)) push('ERROR', 'leak', 'answer-key line leaked in');
    if (HEADER_BLEED.test(s) || LEGEND_BLEED.test(s)) push('ERROR', 'header', 'page/chapter header leaked in');
    if (SIDEBAR_OCR.test(s)) push('ERROR', 'garbage', 'sidebar/margin OCR artifacts');
    if (GLYPHS.test(s)) push('ERROR', 'glyph', 'stray glyph / box-drawing chars');
    if (STANDALONE_TILDE.test(s)) push('ERROR', 'garbage', 'standalone tilde artifact');
    if (DOUBLE_SPACE.test(s)) push('WARN', 'whitespace', 'consecutive spaces');
    if (/[^\x20-\x7E\u2013\u2014\u2018\u2019\u201C\u201D°±×½¼¾µ²³]/u.test(s))
        push('WARN', 'charset', 'unusual non-ASCII character');

    if (WORD_TILDE.test(s)) push('WARN', 'ocr', 'word-internal tilde (unfixable OCR)');
    for (const m of s.match(new RegExp(OCR_ONE.source, 'g')) || []) {
        if (!OCR_ALLOW.has(m.toLowerCase())) push('WARN', 'ocr', `possible l/1 confusion: "${m}"`);
    }

    // Unbalanced punctuation
    const open = (s.match(/\(/g) || []).length;
    const close = (s.match(/\)/g) || []).length;
    if (open !== close) push('WARN', 'parens', `${open} '(' vs ${close} ')'`);
    if ((s.match(/"/g) || []).length % 2 !== 0) push('WARN', 'quotes', 'unbalanced double quotes');

    // Missing terminal punctuation on options / explanations (truncation smell)
    if (label !== 'text' && s.length > 3 && !/[.!?]/.test(s.trim().slice(-1)) && /\w$/.test(s.trim())) {
        push('WARN', 'punctuation', 'ends without terminal punctuation (possible truncation)');
    }
}

function checkTextPrefix(str, id, issues) {
    if (typeof str !== 'string') return;
    if (TEXT_PREFIX.test(str)) {
        issues.push({ id, field: 'text', label: 'text', level: 'ERROR', check: 'leak', detail: 'answer/source prefix leaked into text' });
    }
    if (FRAGMENT_PREFIX.test(str)) {
        issues.push({ id, field: 'text', label: 'text', level: 'ERROR', check: 'fragment', detail: 'residual number fragment at start of text' });
    }
}

function validateFile(filepath, strict = false) {
    const label = path.basename(filepath);
    const issues = [];
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
        console.log(`  ${label}: INVALID JSON — ${e.message}`);
        return { issues: [{ id: '-', field: 'file', label, level: 'ERROR', check: 'json', detail: e.message }], count: 0 };
    }
    if (!Array.isArray(data)) {
        console.log(`  ${label}: not an array`);
        return { issues: [{ id: '-', field: 'file', label, level: 'ERROR', check: 'structure', detail: 'not an array' }], count: 0 };
    }

    const seenIds = new Map();

    for (const q of data) {
        const id = q && q.id ? String(q.id) : '(no id)';

        // --- structure ---
        if (!q || typeof q !== 'object' || Array.isArray(q)) {
            issues.push({ id, field: 'entry', label, level: 'ERROR', check: 'structure', detail: 'entry is not an object' });
            continue;
        }
        if (seenIds.has(id)) issues.push({ id, field: 'id', label, level: 'ERROR', check: 'duplicate', detail: `duplicate id (first at index ${seenIds.get(id)})` });
        seenIds.set(id, data.indexOf(q));

        if (typeof q.text !== 'string' || q.text.length < 10) {
            issues.push({ id, field: 'text', label, level: 'ERROR', check: 'structure', detail: 'missing/too-short question text' });
        } else {
            checkTextPrefix(q.text, id, issues);
        }
        checkString(q.text, 'text', id, 'text', issues);

        if (!q.options || typeof q.options !== 'object' || Array.isArray(q.options)) {
            issues.push({ id, field: 'options', label, level: 'ERROR', check: 'structure', detail: 'missing options object' });
        } else {
            const keys = Object.keys(q.options);
            if (!keys.length) issues.push({ id, field: 'options', label, level: 'ERROR', check: 'structure', detail: 'empty options' });
            for (const k of keys) {
                if (!/^[A-D]$/.test(k)) {
                    issues.push({ id, field: 'options', label, level: 'ERROR', check: 'options', detail: `invalid option key "${k}"` });
                } else if (typeof q.options[k] !== 'string' || q.options[k].length < 2) {
                    issues.push({ id, field: 'options', label, level: 'ERROR', check: 'options', detail: `option ${k} missing/too short` });
                } else {
                    checkString(q.options[k], `options.${k}`, id, 'option', issues);
                }
            }
        }

        if (!q.correct || !/^[A-D]$/.test(String(q.correct).trim())) {
            issues.push({ id, field: 'correct', label, level: 'ERROR', check: 'structure', detail: `invalid correct answer "${q.correct}"` });
        }

        if (q.plt !== undefined && typeof q.plt !== 'string') {
            issues.push({ id, field: 'plt', label, level: 'WARN', check: 'structure', detail: 'plt is not a string' });
        }
        if (typeof q.explanation === 'string' && q.explanation.trim()) {
            checkString(q.explanation, 'explanation', id, 'explanation', issues);
        } else if (q.explanation !== undefined) {
            issues.push({ id, field: 'explanation', label, level: 'WARN', check: 'structure', detail: 'missing explanation' });
        }
    }

    const errors = issues.filter(i => i.level === 'ERROR');
    const warns = issues.filter(i => i.level === 'WARN');
    const fail = errors.length > 0 || (strict && warns.length > 0);

    return { issues, count: data.length, errors, warns, fail };
}

function printReport(result, filepath, strict) {
    const label = path.basename(filepath);
    const { count, errors, warns, fail } = result;
    console.log(`\n== ${label} (${count} questions) ==========`);
    console.log(`  ERRORS: ${errors.length}   WARNINGS: ${warns.length}`);

    const byCheck = {};
    for (const i of [...errors, ...warns]) {
        byCheck[i.check] = byCheck[i.check] || { errors: 0, warns: 0 };
        byCheck[i.check][i.level === 'ERROR' ? 'errors' : 'warns']++;
    }
    for (const [check, c] of Object.entries(byCheck)) {
        console.log(`  - ${check}: ${c.errors} errors, ${c.warns} warnings`);
    }

    const shown = new Set();
    for (const i of errors) {
        const key = `${i.field}|${i.check}`;
        if (shown.has(key) && [...shown].length >= 12) continue;
        shown.add(key);
        const excerpt = String(i.detail || '').slice(0, 120);
        console.log(`    ERROR  ${i.id} [${i.field}] ${i.check}: ${excerpt}`);
    }
    if (errors.length > 12) console.log(`    ... and ${errors.length - shown.size} more errors`);
    console.log(`  ${fail ? '✗ FAIL' : (warns.length ? '△ PASS (warnings)' : '✓ PASS')}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const files = args.filter(a => !a.startsWith('-'));

const defaults = [
    path.join(BASE_DIR, 'cleaned', 'ppl_cleaned.json'),
    path.join(BASE_DIR, 'cleaned', 'ir_cleaned.json'),
    path.join(BASE_DIR, 'cleaned', 'cpl_cleaned.json'),
];

const targets = files.length ? files : defaults;

let failed = false;
for (const f of targets) {
    if (!fs.existsSync(f)) {
        console.log(`\nSKIP: ${f} not found`);
        continue;
    }
    const result = validateFile(f, strict);
    printReport(result, f, strict);
    if (result.fail) failed = true;
}

process.exit(failed ? 1 : 0);
