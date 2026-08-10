const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'ir_questions.json');
const questions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`Total questions: ${questions.length}\n`);

const allIssues = [];

for (const q of questions) {
  const id = q.id || '(no id)';
  const plt = q.plt || '(no plt)';
  const correct = q.correct;
  const text = q.text || '';
  const explanation = q.explanation || '';
  const options = q.options || {};
  const issues = [];

  // --- CATEGORY 1: Mismatched question + options ---
  // The question asks one thing but the options are clearly from a different question.
  // Detect by checking if the option text has words totally unrelated to the question text.
  const qWords = new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));

  // Check for garbled question text
  const garbledPattern = /[^\x20-\x7E]/;
  const garbledCluster = /[^\w\s.,;:!?'"()\-–—\/°%]{2,}/;

  if (garbledPattern.test(text) || garbledCluster.test(text)) {
    issues.push('GARBLED QUESTION TEXT');
  }

  // Check each option for garbled text
  for (const [letter, optText] of Object.entries(options)) {
    if (!optText) {
      issues.push(`Option ${letter}: EMPTY`);
    } else if (garbledPattern.test(optText)) {
      issues.push(`Option ${letter}: garbled (non-ASCII): "${optText.substring(0, 80)}"`);
    } else if (optText.trim().length < 5) {
      issues.push(`Option ${letter}: too short/suspicious: "${optText}"`);
    }
  }

  // Check if explanation is garbled
  if (garbledPattern.test(explanation) || garbledCluster.test(explanation)) {
    issues.push('EXPLANATION TEXT IS GARBLED');
  }

  // --- CATEGORY 2: Question/options mismatch ---
  // Options seem to be answers to a completely different question
  // Heuristic: check if any option contains a number + unit that has nothing to do with question
  // More reliable: check if options look like they belong to different topics

  // Simple keyword overlap check - if 0 option keywords overlap with question, it's suspicious
  let optionKeywordOverlap = 0;
  for (const [letter, optText] of Object.entries(options)) {
    const optWords = new Set(optText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    let overlap = 0;
    for (const w of optWords) {
      if (qWords.has(w)) overlap++;
    }
    if (overlap > 0) optionKeywordOverlap++;
  }
  // If none of the 3 options share ANY keywords with the question, the options are likely wrong
  if (optionKeywordOverlap === 0 && Object.keys(options).length === 3 && qWords.size > 5) {
    issues.push('QUESTION/OPTIONS MISMATCH: options appear to belong to a different question');
  }

  // --- CATEGORY 3: Explanation doesn't match the question ---
  // Check if explanation keywords overlap with question keywords
  const explWords = new Set(explanation.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
  let explOverlap = 0;
  for (const w of qWords) {
    if (explWords.has(w)) explOverlap++;
  }
  if (explOverlap === 0 && qWords.size > 5 && explWords.size > 5) {
    issues.push('EXPLANATION/QUESTION MISMATCH: explanation appears to be for a different question');
  }

  // --- CATEGORY 4: Correct answer vs explanation ---
  // Check for "answer is X" patterns in explanation
  const explLower = explanation.toLowerCase();
  const answerPatterns = [
    { re: /answer\s+is\s+([A-D])\b/i, label: '"answer is X"' },
    { re: /\bthe\s+correct\s+answer\s+is\s+([A-D])\b/i, label: '"correct answer is X"' },
  ];
  for (const { re, label } of answerPatterns) {
    const m = explLower.match(re);
    if (m && m[1].toUpperCase() !== correct) {
      issues.push(`EXPLANATION CONTRADICTS: ${label} says ${m[1]} but correct=${correct}`);
    }
  }

  // Check if explanation starts with a letter + " - " that describes an option
  // Pattern: "A - description... B - description..."
  // If the "correct" description in the explanation doesn't match correct field
  const optionDescRe = /\b([A-D])\s*[-–—]\s*([^\n]{10,})/g;
  let descMatch;
  while ((descMatch = optionDescRe.exec(explanation)) !== null) {
    const letter = descMatch[1].toUpperCase();
    const desc = descMatch[2].trim();
    // If this description text appears to be describing the correct answer
    // but the letter is different from correct field
    if (letter !== correct && desc.length > 20) {
      // Check if the description contains positive/assertive language suggesting it's the answer
      if (/\bmust\b|\brequired\b|\bshall\b|\bcorrect\b/.test(desc.toLowerCase())) {
        issues.push(`EXPLANATION: Option ${letter} described with positive language but correct=${correct}: "${desc.substring(0, 80)}..."`);
      }
    }
  }

  // --- CATEGORY 5: Options that are clearly wrong content ---
  // Check for options that are fragments like "Principles of Instrument Flight"
  for (const [letter, optText] of Object.entries(options)) {
    if (optText && /principles of instrument flight/i.test(optText)) {
      issues.push(`Option ${letter}: contains "Principles of Instrument Flight" (corrupt/placeholder)`);
    }
  }

  // --- CATEGORY 6: Cross-question contamination ---
  // Check if the explanation text contains text that looks like a different question
  const explanationHasQuestionPattern = /(?:refer to figure|which is true|what is the|which would|in accordance with)/i;

  // --- CATEGORY 7: Options look like they're from another question ---
  // Check for options that are just "NM.", "SM.", "Gs.", "10." etc (truncated fragments)
  for (const [letter, optText] of Object.entries(options)) {
    if (optText && /^[A-Z]{1,2}\.$/.test(optText.trim())) {
      issues.push(`Option ${letter}: just a unit abbreviation "${optText}" (truncated/missing content)`);
    }
    if (optText && /^\d+\.?$/.test(optText.trim())) {
      issues.push(`Option ${letter}: just a number "${optText}" (truncated/missing content)`);
    }
  }

  // --- CATEGORY 8: Check for obvious correct-answer contradictions ---
  // If the explanation clearly says something like "the answer is NOT X" for the correct answer
  if (explLower.includes(`not ${correct.toLowerCase()}`) && explLower.includes('answer')) {
    // Could be a contradiction
  }

  // --- CATEGORY 9: Options text duplicated from question text ---
  // Some corruption causes option text to be the question text of another question

  if (issues.length > 0) {
    allIssues.push({ id, plt, correct, text: text.substring(0, 120), issues });
  }
}

// Sort by issue count (most issues first)
allIssues.sort((a, b) => b.issues.length - a.issues.length);

console.log(`Questions with issues: ${allIssues.length}\n`);

for (const item of allIssues) {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`ID: ${item.id}  |  PLT: ${item.plt}  |  Correct: ${item.correct}`);
  console.log(`Q: ${item.text}`);
  for (const issue of item.issues) {
    console.log(`  ⚠ ${issue}`);
  }
  console.log('');
}

// Also print a table summary
console.log('\n\n===== ISSUE SUMMARY TABLE =====\n');
const issueCounts = {};
for (const item of allIssues) {
  for (const issue of item.issues) {
    const cat = issue.split(':')[0];
    issueCounts[cat] = (issueCounts[cat] || 0) + 1;
  }
}
for (const [cat, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${count}x  ${cat}`);
}
