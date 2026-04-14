"""
Column-aware IR question extractor.

⚠️  SOURCE PDF MISMATCH WARNING  ⚠️
This script currently falls back to the Commercial Airmen Knowledge Test Guide 2021.pdf
because the Instrument Airmen Knowledge Test Guide PDF is not in this repository.

The correct source for IR questions is:
  "Instrument Airmen Knowledge Test Guide" (Jeppesen) — separate from the Commercial guide.

Until that PDF is added, running this script will produce Commercial Pilot questions in
the IR bank, which is INCORRECT for students studying for the Instrument Rating exam.

TODO: Add "Instrument Airmen Knowledge Test Guide 2021.pdf" (or equivalent) to this
      directory and update IR_PDF_PATH below.

Layout (same two-column structure as Commercial guide, confirmed by block inspection):
  Left column  x0 < 295  : question ID, ACS code, question text, options A/B/C
  Right column 295 <= x0 < 580 : explanation text
  Sidebar      x0 >= 580 : margin notes — ignored
"""

import fitz
import re
import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# ── Source PDF ──────────────────────────────────────────────────────────────
# Replace this path with the Instrument Airmen Knowledge Test Guide when available.
IR_PDF_PATH = 'Instrument Airmen Knowledge Test Guide 2021.pdf'
FALLBACK_PDF = 'Commercial Airmen Knowledge Test Guide 2021.pdf'
OUTPUT_PATH = 'ir_questions.json'

# ── Column thresholds (calibrated against Commercial guide; re-verify for IR guide) ──
LEFT_COL_MAX = 295   # gap confirmed: left blocks ≤285, right blocks ≥301
SIDEBAR_MIN = 580


def collect_columns(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"PDF: {doc.page_count} pages  ({pdf_path})")

    left_parts = []
    right_parts = []

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        blocks = page.get_text("blocks")

        page_left = []
        page_right = []

        for block in sorted(blocks, key=lambda b: b[1]):
            x0, y0 = block[0], block[1]
            text = block[4].strip()
            if not text:
                continue
            if x0 < LEFT_COL_MAX:
                page_left.append((y0, text))
            elif x0 < SIDEBAR_MIN:
                page_right.append((y0, text))

        if page_left:
            left_parts.append('\n'.join(t for _, t in sorted(page_left)))
        if page_right:
            right_parts.append('\n'.join(t for _, t in sorted(page_right)))

    return '\n\n'.join(left_parts), '\n\n'.join(right_parts)


# ── Parsing patterns ─────────────────────────────────────────────────────────
ACS_RE = re.compile(r'^[A-Z]{2,3}\.[IVX]+\.[A-Z]+\.', re.MULTILINE)
QID_LINE_RE = re.compile(r'^(\d+-\d+)\s*$', re.MULTILINE)
ANSWER_LINE_RE = re.compile(r'^\d+-\d+\.\s*Answer\s+[A-C]\..*$', re.MULTILINE)
OPTION_RE = re.compile(
    r'(?:^|\n)([A-C])\s*[-\u2014]\s*(.*?)(?=\n[A-C]\s*[-\u2014]|\Z)',
    re.DOTALL
)
ANS_RE = re.compile(
    r'(\d+-\d+)\.\s*Answer\s+([A-C])\.\s*(.*?)(?=\n\d+-\d+\.\s*Answer\s+[A-C]\.|\Z)',
    re.DOTALL
)


def parse_questions(left_text):
    questions = {}
    qid_matches = list(QID_LINE_RE.finditer(left_text))
    if not qid_matches:
        print("WARNING: no QID lines found in left column text")
        return questions

    for i, m in enumerate(qid_matches):
        q_id = m.group(1)
        block_start = m.start()
        block_end = qid_matches[i + 1].start() if i + 1 < len(qid_matches) else len(left_text)
        block = left_text[block_start:block_end]

        lines = block.split('\n')
        skip = 1  # skip QID line

        if skip < len(lines) and ACS_RE.match(lines[skip].strip()):
            plt = lines[skip].strip()
            skip += 1
        else:
            plt = ''

        if skip < len(lines) and ANSWER_LINE_RE.match(lines[skip].strip()):
            skip += 1

        remaining = '\n'.join(lines[skip:]).strip()

        opt_matches = list(OPTION_RE.finditer(remaining))
        if not opt_matches:
            continue

        q_text = remaining[:opt_matches[0].start()].strip()
        q_text = re.sub(r'\s+', ' ', q_text)

        # Strip leading chapter-header bleed
        q_text = re.sub(
            r'^[A-Za-z][^\n]+?CHAPTER\s+\d+[\s\d\-]*(?:[A-Z]{2,3}\.[A-Z0-9.,\s*]+)?\s*',
            '', q_text, flags=re.I
        ).strip()
        q_text = re.sub(r'^Building Professional Experience\s*', '', q_text, flags=re.I).strip()

        if len(q_text) < 15:
            continue

        options = {}
        for om in opt_matches:
            letter = om.group(1)
            val = re.sub(r'\s+', ' ', om.group(2)).strip()
            val = re.sub(r'\s+\d+-\d+\s*$', '', val).strip()
            if val and len(val) > 2:
                options[letter] = val

        if len(options) < 2:
            continue

        questions[q_id] = {
            'id': q_id,
            'plt': plt,
            'text': q_text,
            'options': options,
        }

    print(f"  Left column: found {len(questions)} questions")
    return questions


def parse_answers(right_text, questions):
    matched = 0
    for m in ANS_RE.finditer(right_text):
        q_id = m.group(1)
        ans = m.group(2)
        exp = re.sub(r'\s+', ' ', m.group(3)).strip()
        exp = re.sub(r'MuPDF error[^\n]*', '', exp).strip()
        if q_id in questions:
            questions[q_id]['correct'] = ans
            questions[q_id]['explanation'] = exp
            matched += 1
    print(f"  Right column: matched {matched} answers")
    return matched


def extract_ir(pdf_path=None, output_path=OUTPUT_PATH):
    # Pick PDF — prefer IR guide, fall back to Commercial with warning
    if pdf_path is None:
        if os.path.exists(IR_PDF_PATH):
            pdf_path = IR_PDF_PATH
        else:
            print(f"\n⚠️  WARNING: '{IR_PDF_PATH}' not found.")
            print(f"   Falling back to '{FALLBACK_PDF}' (WRONG SOURCE for IR questions).")
            print("   Add the Instrument Airmen Knowledge Test Guide PDF to fix this.\n")
            pdf_path = FALLBACK_PDF

    print(f"\nExtracting IR questions from: {pdf_path}")

    left_text, right_text = collect_columns(pdf_path)
    print(f"  Left text:  {len(left_text):,} chars")
    print(f"  Right text: {len(right_text):,} chars")

    questions = parse_questions(left_text)
    parse_answers(right_text, questions)

    final = [
        q for q in questions.values()
        if 'correct' in q and len(q.get('options', {})) >= 2
    ]
    print(f"  Valid questions: {len(final)}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final, f, indent=2, ensure_ascii=False)
    print(f"  Saved → {output_path}")

    ch_dist = {}
    for q in final:
        ch = q['id'].split('-')[0]
        ch_dist[ch] = ch_dist.get(ch, 0) + 1
    print("\nChapter distribution:")
    for ch in sorted(ch_dist, key=int):
        print(f"  Chapter {ch}: {ch_dist[ch]} questions")

    return final


if __name__ == '__main__':
    extract_ir()
