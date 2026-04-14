"""
Column-aware CPL question extractor for Commercial Airmen Knowledge Test Guide 2021.pdf

PDF layout (confirmed by block inspection):
  Left column  x0 < 315  : question ID, ACS code, "QID. Answer X. SOURCE", question text, options A/B/C
  Right column 315 <= x0 < 580 : explanation text ("QID. Answer X. <explanation>")
  Sidebar      x0 >= 580 : margin notes — ignored
"""

import fitz
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

LEFT_COL_MAX = 295   # gap confirmed: left blocks ≤285, right blocks ≥301
SIDEBAR_MIN = 580

PDF_PATH = 'Commercial Airmen Knowledge Test Guide 2021.pdf'
OUTPUT_PATH = 'cpl_questions.json'


# ---------------------------------------------------------------------------
# Step 1 — collect column text from every page
# ---------------------------------------------------------------------------

def collect_columns(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"PDF: {doc.page_count} pages")

    left_parts = []
    right_parts = []

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        blocks = page.get_text("blocks")  # (x0,y0,x1,y1,text,block_no,type)

        page_left = []
        page_right = []

        for block in sorted(blocks, key=lambda b: b[1]):  # sort top-to-bottom
            x0, y0, x1, y1 = block[:4]
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


# ---------------------------------------------------------------------------
# Step 2 — parse questions from left-column text
# ---------------------------------------------------------------------------

# ACS code looks like: CA.I.A.K1  CA.II.B.K2  IR.III.A.K3  etc.
ACS_RE = re.compile(r'^[A-Z]{2,3}\.[IVX]+\.[A-Z]+\.', re.MULTILINE)

# QID lines are bare: "1-1", "3-14" etc.
QID_LINE_RE = re.compile(r'^(\d+-\d+)\s*$', re.MULTILINE)

# Answer-key line inside left column (artifact from question block spanning columns):
# "1-1. Answer B. GFDIC 1 B, FAR 61.31"
ANSWER_LINE_RE = re.compile(r'^\d+-\d+\.\s*Answer\s+[A-C]\..*$', re.MULTILINE)

# Option lines: "A - text"  or  "A— text"
OPTION_RE = re.compile(
    r'(?:^|\n)([A-C])\s*[-\u2014]\s*(.*?)(?=\n[A-C]\s*[-\u2014]|\Z)',
    re.DOTALL
)


def parse_questions(left_text):
    """Parse all questions from left-column text. Returns {qid: {...}} dict."""
    questions = {}

    # Find positions of all bare QID lines
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
        skip = 1  # skip QID line itself

        # Skip ACS code line if present
        if skip < len(lines) and ACS_RE.match(lines[skip].strip()):
            plt = lines[skip].strip()
            skip += 1
        else:
            plt = ''

        # Skip "QID. Answer X. SOURCE" artifact line
        if skip < len(lines) and ANSWER_LINE_RE.match(lines[skip].strip()):
            skip += 1

        remaining = '\n'.join(lines[skip:]).strip()

        # Extract options
        opt_matches = list(OPTION_RE.finditer(remaining))
        if not opt_matches:
            continue

        q_text = remaining[:opt_matches[0].start()].strip()
        q_text = re.sub(r'\s+', ' ', q_text)

        # Strip leading chapter-header bleed: "Title CHAPTER N [QID ACS_codes] "
        # e.g. "Aerodynamics and Performance Limitations CHAPTER 12 12-44 CA.I.D.K3a "
        q_text = re.sub(
            r'^[A-Za-z][^\n]+?CHAPTER\s+\d+[\s\d\-]*(?:[A-Z]{2,3}\.[A-Z0-9.,\s*]+)?\s*',
            '', q_text, flags=re.I
        ).strip()

        # Strip any leading "Building Professional Experience" page header
        q_text = re.sub(r'^Building Professional Experience\s*', '', q_text, flags=re.I).strip()

        if len(q_text) < 15:
            continue

        options = {}
        for om in opt_matches:
            letter = om.group(1)
            val = re.sub(r'\s+', ' ', om.group(2)).strip()
            # Drop trailing QID bleed ("... 2-3")
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


# ---------------------------------------------------------------------------
# Step 3 — parse answers + explanations from right-column text
# ---------------------------------------------------------------------------

ANS_RE = re.compile(
    r'(\d+-\d+)\.\s*Answer\s+([A-C])\.\s*(.*?)(?=\n\d+-\d+\.\s*Answer\s+[A-C]\.|\Z)',
    re.DOTALL
)


def parse_answers(right_text, questions):
    """Attach correct answer + explanation to each question dict in-place."""
    matched = 0
    for m in ANS_RE.finditer(right_text):
        q_id = m.group(1)
        ans = m.group(2)
        exp = re.sub(r'\s+', ' ', m.group(3)).strip()
        # Remove MuPDF error artifacts
        exp = re.sub(r'MuPDF error[^\n]*', '', exp).strip()

        if q_id in questions:
            questions[q_id]['correct'] = ans
            questions[q_id]['explanation'] = exp
            matched += 1

    print(f"  Right column: matched {matched} answers")
    return matched


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def extract_cpl(pdf_path=PDF_PATH, output_path=OUTPUT_PATH):
    print(f"\nExtracting CPL questions from: {pdf_path}")

    left_text, right_text = collect_columns(pdf_path)
    print(f"  Left text:  {len(left_text):,} chars")
    print(f"  Right text: {len(right_text):,} chars")

    questions = parse_questions(left_text)
    parse_answers(right_text, questions)

    # Keep only fully matched questions with at least 2 options
    final = [
        q for q in questions.values()
        if 'correct' in q and len(q.get('options', {})) >= 2
    ]
    print(f"  Valid questions: {len(final)}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final, f, indent=2, ensure_ascii=False)
    print(f"  Saved → {output_path}")

    # Chapter distribution
    ch_dist = {}
    for q in final:
        ch = q['id'].split('-')[0]
        ch_dist[ch] = ch_dist.get(ch, 0) + 1
    print("\nChapter distribution:")
    for ch in sorted(ch_dist, key=int):
        print(f"  Chapter {ch}: {ch_dist[ch]} questions")

    return final


if __name__ == '__main__':
    extract_cpl()
