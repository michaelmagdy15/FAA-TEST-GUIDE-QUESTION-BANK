# Question Bank Audit & Improvement Suggestions

Generated: 2026-04-14  
Scope: PPL (650 questions), IR (146 questions), CPL (146 questions)

---

## Critical Issues

### 1. IR & CPL Banks Are Nearly Identical (137/146 questions duplicated)
**Files:** `ir_questions.json`, `cpl_questions.json`  
**Impact:** Critical — students studying for CPL see the same questions as IR

137 of 146 questions are character-for-character identical across both files. The 9 differences are trivial (minor whitespace in the `text` field). These are two distinct FAA knowledge tests covering different material; the CPL bank should contain CPL-specific aeronautical knowledge questions, not a copy of the IR bank.

**Fix:** Source CPL questions from the *Commercial Airmen Knowledge Test Guide 2021.pdf* already in the repo. Use `extract_cpl.py` (already exists) to properly extract them, or replace with verified FAA question bank data.

---

### 2. Correct Answer Leaked Into Question Text — IR/CPL (8 questions)
**Files:** `ir_questions.json`, `cpl_questions.json`  
**Affected IDs:** 1-1, 1-21, 1-65, and 5 others

The `text` field contains the answer before the question, e.g.:
```
"text": "1-1. Answer B. GFDIC 1 B, FAR 61.31 To act as PIC of a complex airplane, you must have"
```

This completely defeats the purpose of the quiz — the answer is shown in the question stem.

**Fix:** Strip the `<id>. Answer <letter>. <source>` prefix from `text`. The source reference belongs in `explanation`. A regex fix: `text.replace(/^\d+-\d+\.\s+Answer [A-C]\.\s+[A-Z0-9, ]+\s+/, '')`.

---

### 3. PPL Explanations Bleed Into Subsequent Questions (182 questions)
**File:** `questions.json`  
**Impact:** High — explanations expose upcoming questions and their answers

The PDF extractor kept reading past the end of the explanation into the next question (and beyond). Example from question `4-59`:

```
"explanation": "...quartering headwind.   Section B - Airports  4-60  PLT140  
Who should not participate in tl1e Land and Hold Short Operations (LAHSO) program?  
A-Recreational pilots only.  B-Military pilots.  C-Student pilots.  4-61  PLT140..."
```

**Fix:** Truncate explanations at the next question number pattern. The correct cut point is the first occurrence of `\s+\d+-\d+\s+PLT\d+` in the explanation. A script to fix all 182:
```js
q.explanation = q.explanation.replace(/\s{2,}\d+-\d+\s+PLT\d+[\s\S]*$/, '').trim();
```

---

### 4. Chapter/Section Headers Appended to Option C (56 PPL questions)
**File:** `questions.json`

PDF page headers bled into the last answer option. Example from `1-4`:
```json
"C": "Transport, restricted, provisional.  Chapter 1- Discovering Aviation"
```

This is always Option C (the last option on the page before a chapter break), making Option C visually longer and potentially identifiable as correct/incorrect by formatting alone — a study bias risk.

**Fix:** Strip `\s{2,}(Chapter \d+|Section [A-Z]).*$` from all option values.

---

## High-Priority Issues

### 5. OCR Errors in Question Text (33+ PPL questions)
**File:** `questions.json`

PDF OCR confused `l` (lowercase L) with `1` (one) in common words:

| Corrupted | Correct |
|-----------|---------|
| `Airp1ane` | `Airplane` |
| `tl1e` | `the` |
| `pi1ot` | `pilot` |
| `contr o1` | `control` |

**Fix:** Run a targeted find-and-replace pass. Pattern: `\b(\w*)1(\w*)\b` where the surrounding chars are lowercase letters. A curated replacement dict for known OCR errors would be safer than a blanket regex.

---

### 6. Figure-Referencing Questions Have No Embedded Figures (186 PPL questions)
**File:** `questions.json`  
**Impact:** High — 29% of PPL questions are currently unanswerable in the app

186 questions contain `(Refer to figure X.)` but no figure image or data is included. Students must have the PDF open alongside the app to answer these.

**Fix options (choose one):**
- **Short term:** Add a `figureRef` field (e.g., `"figureRef": 51`) and display a link/modal to the corresponding figure from `IR Test guide figures.pdf` or the Jeppesen PDF.
- **Long term:** Extract figure images from the PDFs (using `pdfimages` or `pdf2image`) and embed them as assets. The app already imports from `src/assets/`.
- **Minimal:** Tag these questions with a `requiresFigure: true` flag and show a disclaimer, or group them separately so students know to have the figure supplement open.

---

### 7. Truncated Options Mid-Sentence (PPL: 139, IR/CPL: 91)
**Files:** All three

Many answer options end without terminal punctuation, indicating the text was cut off during extraction:
```json
"C": "Received and logged ground and flight"
```

**Fix:** These need manual review against the source PDFs. The pattern is consistent — the truncation occurs at a specific character limit. Check whether the original parser had a character cap on options and remove it, then re-extract.

---

### 8. Truncated Explanations (PPL: 144, IR/CPL: 29)
**Files:** All three

Explanations end mid-sentence without punctuation. Often these were cut off by the extraction script before reaching a period.

**Fix:** Re-run extraction with a larger lookahead window, or manually fill the most common ones from the source PDFs.

---

## Medium-Priority Issues

### 9. Duplicate Question Texts (17 PPL questions)
**File:** `questions.json`

17 question texts are identical to another question in the same bank. Some may be intentional (different figure references), but most are likely extraction duplicates.

**Fix:** Audit these 17 pairs. Remove true duplicates; for legitimate near-duplicates, ensure distinct IDs and verify answer keys independently.

---

### 10. Book/Source References Embedded in Question Text — IR/CPL (7 questions)
**File:** `ir_questions.json`

Source references like `GFDIC 1 B, FAR 61.31` appear in the `text` field instead of only in `explanation`:
```
"text": "1-1. Answer B. GFDIC 1 B, FAR 61.31 To act as PIC of a complex airplane..."
```

**Fix:** Covered by the fix in Issue #2. After stripping the prefix, source refs should live only in `explanation`.

---

### 11. Severely Uneven Chapter Coverage (PPL)
**File:** `questions.json`

| Chapter | Questions |
|---------|-----------|
| 1 - Discovering Aviation | 4 |
| 2 - Airplane Systems | 90 |
| 3 - The Pilot | 30 |
| 4 - The Flight Environment | 152 |
| 5 - Weather | 55 |
| 6 - Basic Instrument Maneuvers | 60 |
| 7 - Navigation | 67 |
| 8 - Cross-Country Flying | 53 |
| 9 - Night Flying | 31 |
| 10 - Emergency Procedures | 27 |
| 11 - Seaplane/Glider | 3 |
| 12 - (unlabeled) | 78 |

Chapter 1 has only 4 questions and Chapter 11 has 3. Chapter 4 has 38× more questions than Chapter 1.

**Fix:** This likely reflects extraction gaps. Verify whether chapters 1, 11, and 12 are fully extracted from the source PDFs. The FAA PPL knowledge test draws from all topic areas — a question bank that barely covers Chapter 1 leaves students unprepared for regulations questions.

---

## Structural / UX Suggestions

### 12. Add a `category` Field for Filtering
Currently questions only have `plt` (PLT learning objective code) and a chapter-embedded `id`. A human-readable `category` field (e.g., `"Weather"`, `"Regulations"`, `"Navigation"`) would enable the app to offer topic-based practice sessions — a high-value study feature.

### 13. Add a `difficulty` or `passFail` Field
Track which questions students historically miss most. Even a static `difficulty: "easy"|"medium"|"hard"` field based on PLT category statistics would let the app implement spaced repetition.

### 14. Normalize Question IDs Across Banks
PPL uses `"4-59"` (chapter-question), IR/CPL use `"1-1"` (same scheme). But the same ID exists in all three banks. If questions ever appear in a combined view, IDs will collide. Prefix with bank: `"ppl-4-59"`, `"ir-1-1"`, `"cpl-1-1"`.

### 15. Missing: Regulatory Timeliness Flag
FAR/AIM references change. Several questions reference specific regulation numbers (FAR 61.31, FAR 91.205, etc.). A `regulatoryRef` field listing the FAR/AIM citations would make it easy to flag and update questions when regulations change.

---

## Summary Counts

| Issue | PPL | IR | CPL | Priority |
|-------|-----|----|----|----------|
| Answer in question text | 0 | 8 | 8 | Critical |
| IR = CPL duplicate bank | — | — | 137/146 | Critical |
| Explanation bleed-through | 182 | 0 | 0 | Critical |
| Chapter header in Option C | 56 | 0 | 0 | High |
| OCR errors | 33+ | ? | ? | High |
| Figure questions (no image) | 186 | ? | ? | High |
| Truncated options | 139 | 91 | 91 | High |
| Truncated explanations | 144 | 29 | 29 | High |
| Duplicate question texts | 17 | ? | ? | Medium |
| Source ref in question text | 0 | 7 | 7 | Medium |
| Uneven chapter coverage | yes | ? | ? | Medium |
