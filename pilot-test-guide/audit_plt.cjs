const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'questions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const findings = [];

// Comprehensive "answer is X" patterns
function extractStatedAnswer(explanation) {
  const patterns = [
    /answer\s+is\s+([A-D])/gi,
    /correct\s+answer\s+is\s+([A-D])/gi,
    /the\s+correct\s+choice\s+is\s+([A-D])/gi,
    /the\s+answer\s+should\s+be\s+([A-D])/gi,
    /answer\s+should\s+be\s+([A-D])/gi,
    /the\s+correct\s+response\s+is\s+([A-D])/gi,
    /correct\s+response\s+is\s+([A-D])/gi,
    /the\s+correct\s+answer\s+is\s+([A-D])/gi,
    /correct\s+answer\s+is\s+([A-D])/gi,
    // Patterns from explanations that reference option letters
    /(?:letter|option)\s+([A-D])\s+is\s+(?:the\s+)?correct/gi,
    /choose\s+([A-D])\b/gi,
    /select\s+([A-D])\b/gi,
    /option\s+([A-D])\b/gi,
    // Line-ending patterns
    /(?:^|\.\s+)([A-D])\s*$/gm,
  ];
  const matches = [];
  for (const pat of patterns) {
    let m;
    pat.lastIndex = 0;
    while ((m = pat.exec(explanation)) !== null) {
      matches.push(m[1].toUpperCase());
    }
  }
  return [...new Set(matches)];
}

// Garbled option detection
function detectGarbled(text) {
  const issues = [];
  if (/^(KTS|MST|PST|kts|mst|pst)\.?\s*$/.test(text)) issues.push('number missing (OCR)');
  if (/\.\.\.\./.test(text)) issues.push('4+ dots');
  if (/\d+-\d+\s/.test(text) && text.length < 40) issues.push('page ref in option');
  return issues;
}

for (const q of data) {
  const issues = [];

  // Test 1: explicit answer patterns
  const statedAnswers = extractStatedAnswer(q.explanation);
  if (statedAnswers.length > 0 && !statedAnswers.includes(q.correct)) {
    issues.push(
      `HARD MISMATCH: explanation states "${statedAnswers.join('/')}" but correct="${q.correct}"`
    );
  }

  // Test 2: garbled options
  for (const [key, text] of Object.entries(q.options)) {
    const g = detectGarbled(text);
    if (g.length > 0) issues.push(`GARBLED opt ${key}: ${g.join('; ')} -- "${text}"`);
  }

  // Test 3: PLT code anomaly
  if (q.plt.length > 6 || /PLT[A-Z]{2,}/.test(q.plt)) {
    issues.push(`SUSPECT PLT: "${q.plt}"`);
  }

  // Test 4: Question/options mismatch (options don't match question topic)
  const qLower = q.text.toLowerCase();
  const hasAltitudeQ = /altitude|elevation|height|feet|msl|agl/.test(qLower);
  const hasFreqQ = /frequency|mhz|radio|channel/.test(qLower);
  if (hasAltitudeQ) {
    const optTexts = Object.values(q.options).join(' ');
    if (/MHz|mhz|frequency/i.test(optTexts) && !/feet|msl|agl/i.test(optTexts)) {
      issues.push('OPTIONS LOOK LIKE FREQUENCIES but question asks about altitude');
    }
  }
  if (hasFreqQ) {
    const optTexts = Object.values(q.options).join(' ');
    if (/feet|msl|agl/i.test(optTexts) && !/MHz|mhz/i.test(optTexts)) {
      issues.push('OPTIONS LOOK LIKE ALTITUDES but question asks about frequency');
    }
  }

  // Test 5: Fog question with cloud options (or vice versa)
  const hasFogQ = /\bfog\b/.test(qLower);
  const hasCloudOpts = /cumulus|cumulonimbus|nimbostratus|lenticular|stratus/i.test(
    Object.values(q.options).join(' ')
  );
  if (hasFogQ && hasCloudOpts) {
    issues.push('QUESTION asks about fog but OPTIONS are cloud types');
  }

  if (issues.length > 0) {
    findings.push({
      id: q.id, plt: q.plt, correct: q.correct,
      questionText: q.text, options: q.options,
      issues, explanation: q.explanation,
    });
  }
}

// Print
console.log(`\nTotal questions: ${data.length}`);
console.log(`Total flagged: ${findings.length}\n`);

for (const f of findings) {
  console.log('─'.repeat(70));
  console.log(`ID: ${f.id} | PLT: ${f.plt} | correct="${f.correct}"`);
  console.log(`Q: ${f.questionText}`);
  for (const [k, v] of Object.entries(f.options)) {
    console.log(`  ${k}: ${v}`);
  }
  for (const i of f.issues) console.log(`>> ${i}`);
  console.log(`Explanation: ${f.explanation.slice(0, 250)}`);
  console.log('');
}
