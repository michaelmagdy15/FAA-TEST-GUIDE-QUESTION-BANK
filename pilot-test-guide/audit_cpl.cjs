const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'cpl_questions.json');
const raw = fs.readFileSync(filePath, 'utf8');
const questions = JSON.parse(raw);

let issues = 0;

function report(q, issue) {
  issues++;
  const text80 = q.text.replace(/\n/g, ' ').substring(0, 80);
  console.log(`\n--- Issue #${issues} ---`);
  console.log(`  id:       ${q.id}`);
  console.log(`  plt:      ${q.plt}`);
  console.log(`  correct:  ${q.correct}`);
  console.log(`  question: "${text80}"`);
  console.log(`  ISSUE:    ${issue}`);
}

for (const q of questions) {
  const opts = q.options || {};
  const optKeys = Object.keys(opts);
  const correct = (q.correct || '').trim().toUpperCase();
  const explanation = (q.explanation || '').toLowerCase();
  const questionText = (q.text || '').toLowerCase();

  // ---- CHECK 1: Explanation explicitly says "answer is X" where X differs from correct ----
  const answerPhrases = [
    /answer\s+is\s+([A-D])/gi,
    /correct\s+answer\s+is\s+([A-D])/gi,
    /the\s+answer\s+is\s+([A-D])/gi,
    /\banswer\s+([A-D])\b/gi,
  ];
  for (const regex of answerPhrases) {
    let m;
    while ((m = regex.exec(q.explanation || '')) !== null) {
      const stated = m[1].toUpperCase();
      if (stated !== correct) {
        report(q, `Explanation says "answer is ${stated}" but correct field is "${correct}"`);
      }
    }
  }

  // Also check if the question text itself embeds the answer (OCR artifact or bad merge)
  for (const regex of answerPhrases) {
    let m;
    while ((m = regex.exec(q.text || '')) !== null) {
      const stated = m[1].toUpperCase();
      if (stated !== correct) {
        report(q, `Question text contains "answer ${stated}" but correct field is "${correct}" (possible merge artifact)`);
      }
    }
  }

  // ---- CHECK 2: Garbled options ----
  for (const key of optKeys) {
    const val = opts[key] || '';
    const valClean = val.replace(/\s+/g, ' ').trim();

    // Too short
    if (valClean.length < 4 && valClean.length > 0) {
      report(q, `Option ${key} is very short: "${valClean}"`);
    }

    // Garbled patterns: "..", "...", random symbols
    if (/\.{2,}/.test(valClean)) {
      report(q, `Option ${key} contains ".." garble: "${valClean.substring(0, 80)}"`);
    }
    if (/[^\w\s.,;:!?\-'"()\/°%$#@&*+=<>[\]{}|\\~`^]+/.test(valClean)) {
      // Filter out common legal chars; flag if lots of random symbols
      const symbolCount = (valClean.match(/[^\w\s.,;:!?\-'"()\/°%$#@&*+=<>[\]{}|\\~`^]/g) || []).length;
      if (symbolCount > 2) {
        report(q, `Option ${key} has ${symbolCount} random symbols: "${valClean.substring(0, 80)}"`);
      }
    }

    // Check for garbled fragments that look like OCR artifacts: "co z", "0 u", "CST. co z.", etc.
    if (/\bco\s*z\.?\b/i.test(valClean) || /\b0\s*u\s+co\s*z/i.test(valClean)) {
      report(q, `Option ${key} has OCR garble: "${valClean.substring(0, 80)}"`);
    }
    if (/^[A-Z]\s*[A-Z]\.?\s*$/i.test(valClean) && valClean.length < 5) {
      report(q, `Option ${key} is just letters/garble: "${valClean}"`);
    }

    // Only contains numbers and symbols, no real words
    if (/^[\d\s.,;:!?\-'"()\/°%$#@&*+=<>[\]{}|\\~`^A-Za-z]{0,3}$/.test(valClean) && valClean.length > 0) {
      // Skip if it's a reasonable short answer like "B" or "30"
    }
  }

  // ---- CHECK 2b: Options missing expected letters ----
  // Check if options A, B, C are all present (some questions have only A, B or just a couple)
  const expectedKeys = ['A', 'B', 'C'];
  const missingKeys = expectedKeys.filter(k => !opts[k]);
  if (missingKeys.length > 0) {
    const present = optKeys.filter(k => opts[k]).join(',');
    const hasJunk = optKeys.some(k => {
      const v = (opts[k] || '').trim();
      return v.length < 3 || /^[\s\d.,;:!?\-'"()\/°%$#@&*+=<>[\]{}|\\~`^A-Za-z]{0,3}$/i.test(v);
    });
    if (hasJunk || optKeys.length < 3) {
      report(q, `Missing option(s): ${missingKeys.join(',')}. Present: [${present}]. Option values: ${optKeys.map(k => `"${k}=${(opts[k]||'').substring(0,40)}"`).join(', ')}`);
    }
  }

  // ---- CHECK 2c: Option text looks like it belongs to a different question ----
  // Check if any option starts with "Answer" or has a question number prefix
  for (const key of optKeys) {
    const val = (opts[key] || '').trim();
    if (/^answer\s/i.test(val)) {
      report(q, `Option ${key} starts with "Answer": "${val.substring(0, 80)}"`);
    }
    if (/^\d+-\d+\.\s/i.test(val)) {
      report(q, `Option ${key} has question number prefix: "${val.substring(0, 80)}"`);
    }
    // Check if option contains "Answer B" or "Answer C" type content (answer key leaked into option)
    if (/answer\s+[A-D]\b/i.test(val)) {
      report(q, `Option ${key} contains answer key leak: "${val.substring(0, 80)}"`);
    }
  }

  // ---- CHECK 3: Question text seems garbled (major OCR artifacts) ----
  if (q.text) {
    // Check for lots of special characters that look like OCR noise
    const garbageChars = (q.text.match(/[^\w\s.,;:!?\-'"()\/°%$#@&*+=<>[\]{}|\\~`^—–]/g) || []);
    if (garbageChars.length > 5) {
      report(q, `Question text has ${garbageChars.length} garbled characters: "${q.text.substring(0, 80)}"`);
    }
    // Check for "0 u co z" type patterns
    if (/\b0\s*u\s+co\s*z/i.test(q.text)) {
      report(q, `Question text contains OCR garble "0 u co z": "${q.text.substring(0, 80)}"`);
    }
    // Check for embedded answer in question text like "...The carriage of passengers" appended
    if (/[A-Z][a-z]+\s+the\s+carriage/i.test(q.text) && q.text.length > 150) {
      // Question seems to have extra text appended
    }
  }

  // ---- CHECK 4: Explanation seems about a different topic ----
  // Basic keyword overlap check between question and explanation
  const qWords = new Set((q.text || '').toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const eWords = new Set((q.explanation || '').toLowerCase().split(/\W+/).filter(w => w.length > 3));
  let overlap = 0;
  for (const w of qWords) {
    if (eWords.has(w)) overlap++;
  }
  const qWordCount = qWords.size;
  if (qWordCount > 3 && qWordCount > 0) {
    const overlapRatio = overlap / qWordCount;
    if (overlapRatio < 0.08) {
      report(q, `Very low keyword overlap (${(overlapRatio*100).toFixed(1)}%) between question and explanation — possible topic mismatch`);
    }
  }

  // ---- CHECK 5: correct field points to a missing option ----
  if (correct && !opts[correct]) {
    report(q, `Correct answer "${correct}" does not match any option key. Options: [${optKeys.join(',')}]`);
  }

  // ---- CHECK 6: Option value is garbled with repeated answer-key text ----
  for (const key of optKeys) {
    const val = (opts[key] || '');
    // Patterns like "A: - ta o I. CV E." which look like answer key + random chars
    if (/^[A-Z]:\s*[-–]?\s*[a-z]+\s+[a-z]+\s+[A-Z]/i.test(val) && val.length < 80) {
      report(q, `Option ${key} looks like garbled answer-key fragment: "${val.substring(0, 80)}"`);
    }
  }

  // ---- CHECK 7: Options contain "Answer" references (answer key embedded) ----
  for (const key of optKeys) {
    const val = (opts[key] || '');
    if (/\banswer\s+[A-D]\b/i.test(val) && !val.toLowerCase().includes('correct answer')) {
      report(q, `Option ${key} contains embedded answer reference: "${val.substring(0, 80)}"`);
    }
  }

  // ---- CHECK 8: The explanation contains the same answer key for multiple questions ----
  // (We'll track this at the end)

  // ---- CHECK 9: Option text is clearly an answer key entry ----
  for (const key of optKeys) {
    const val = (opts[key] || '').trim();
    // "Answer B. GFDIC 18, FAR 61.15" type pattern
    if (/^answer\s+[A-D]\.?\s/i.test(val)) {
      report(q, `Option ${key} is an answer key entry: "${val.substring(0, 80)}"`);
    }
  }

  // ---- CHECK 10: Question text contains "The carriage of passengers" or similar appended text ----
  // Check for questions where the text seems to have the answer appended
  if (/the\s+carriage\s+of\s+passengers/i.test(q.text) && q.text.length > 100) {
    const textWithoutSuffix = q.text.replace(/the\s+carriage\s+of\s+passengers.*$/i, '').trim();
    if (textWithoutSuffix.length < q.text.length - 30) {
      report(q, `Question text appears to have appended answer fragment: "...${q.text.substring(q.text.length - 50)}"`);
    }
  }

  // ---- CHECK 11: Option contains only "NM" or "SM" (numbers lost in OCR) ----
  for (const key of optKeys) {
    const val = (opts[key] || '').trim();
    if (/^[NS]\s*[Mm]\.?$/.test(val) || /^[NS]\s*[Mm]\s+\d+[.,]?\s*$/.test(val)) {
      // Values like "NM." or "SM." — the actual number is missing
      if (val.length < 6) {
        report(q, `Option ${key} appears to be missing its numeric value: "${val}"`);
      }
    }
  }
}

// ---- CHECK 12: Duplicate question text ----
const textMap = {};
for (const q of questions) {
  const key = (q.text || '').toLowerCase().trim();
  if (key.length > 20) {
    if (!textMap[key]) textMap[key] = [];
    textMap[key].push(q.id);
  }
}
for (const [text, ids] of Object.entries(textMap)) {
  if (ids.length > 1) {
    console.log(`\n--- DUPLICATE QUESTION ---`);
    console.log(`  ids: ${ids.join(', ')}`);
    console.log(`  text: "${text.substring(0, 80)}"`);
    issues++;
  }
}

// ---- CHECK 13: Duplicate explanation text across different questions ----
const explMap = {};
for (const q of questions) {
  const key = (q.explanation || '').toLowerCase().trim();
  if (key.length > 50) {
    if (!explMap[key]) explMap[key] = [];
    explMap[key].push(q.id);
  }
}
for (const [expl, ids] of Object.entries(explMap)) {
  if (ids.length > 1) {
    console.log(`\n--- DUPLICATE EXPLANATION (${ids.length} questions) ---`);
    console.log(`  ids: ${ids.join(', ')}`);
    console.log(`  explanation: "${expl.substring(0, 100)}..."`);
    issues++;
  }
}

// ---- CHECK 14: Question text has answer choices merged into it ----
for (const q of questions) {
  if (!q.text) continue;
  // Pattern: question ends with "A" or "C" followed by answer text
  if (/[.,]\s+[A-Z]\s+[A-Z][a-z]/.test(q.text) && q.text.length > 120) {
    // Might have answer merged
  }
  // Check for "C" or "A" suffix with garbled text
  if (/\b[A-D]\s+[a-z]+\s+[a-z]+\s+[a-z]+.*[A-Z]\s+[a-z]+/i.test(q.text)) {
    // Possible answer text merged into question
  }
  // Simpler: check if question ends with answer choice text pattern
  if (/\bco\s*z\s*0?\s*t-u/i.test(q.text)) {
    report(q, `Question text has garbled answer-choice merge: "${q.text.substring(Math.max(0, q.text.length-60))}"`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`AUDIT COMPLETE: ${issues} issue(s) found across ${questions.length} questions.`);
console.log(`${'='.repeat(60)}`);
