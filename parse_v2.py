"""
Column-aware PPL question extractor for Jeppesen Private Pilot Test Guide.pdf

PDF layout (confirmed by block inspection, ~1295 pts wide):
  Left column   x0 < 500  : QID block (QID + PLT + question text) + option blocks
  Right column  x0 >= 600 : answer + explanation blocks ("QID. Answer X. SOURCE")
  Far right     x0 >= 1200: chapter labels, page numbers — ignored

QID block format:
  <QID>
  <PLT_CODE>
  <Question text...>
"""

import fitz
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = 'Jeppesen Private Pilot Test Guide.pdf'
OUTPUT_PATH = 'questions_v2.json'

LEFT_COL_MAX = 500    # questions + options
RIGHT_COL_MIN = 600   # answers + explanations
FAR_RIGHT = 1200      # page labels, chapter headers — skip


# ---------------------------------------------------------------------------
# Step 1 — collect column text from every page
# ---------------------------------------------------------------------------

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
            elif x0 < FAR_RIGHT:
                page_right.append((y0, text))

        if page_left:
            left_parts.append('\n'.join(t for _, t in sorted(page_left)))
        if page_right:
            right_parts.append('\n'.join(t for _, t in sorted(page_right)))

    return '\n\n'.join(left_parts), '\n\n'.join(right_parts)


# ---------------------------------------------------------------------------
# Step 2 — parse questions from left column
# Each question block begins with: QID\nPLT_CODE\n<text>
# ---------------------------------------------------------------------------

# Matches start of a question block: QID on line 1, PLT code on line 2
QID_PLT_RE = re.compile(r'^(\d+-\d+)\s*\n([A-Z0-9]{3,10})\s*\n', re.MULTILINE)

# Options: "A-", "B- ", "A— "
OPTION_RE = re.compile(
    r'(?:^|\n)([A-C])\s*[-\u2014]\s*(.*?)(?=\n[A-C]\s*[-\u2014]|\Z)',
    re.DOTALL
)

# Section/chapter headers that may appear in the left column
HEADER_RE = re.compile(
    r'^(?:Section\s+[A-Z]\s*[-\u2014].*|Chapter\s+\d+.*|SECTION\s+[A-Z].*)',
    re.MULTILINE | re.IGNORECASE
)


def parse_questions(left_text):
    questions = {}

    qid_matches = list(QID_PLT_RE.finditer(left_text))
    if not qid_matches:
        print("WARNING: no QID+PLT lines found in left column text")
        return questions

    for i, m in enumerate(qid_matches):
        q_id = m.group(1)
        plt = m.group(2)
        block_start = m.end()  # text starts after "QID\nPLT\n"
        block_end = qid_matches[i + 1].start() if i + 1 < len(qid_matches) else len(left_text)
        body = left_text[block_start:block_end]

        # Remove section/chapter header lines that bled in
        body = HEADER_RE.sub('', body)

        # Find options
        opt_matches = list(OPTION_RE.finditer(body))
        if not opt_matches:
            continue

        q_text = body[:opt_matches[0].start()].strip()
        q_text = re.sub(r'\s+', ' ', q_text)

        if len(q_text) < 10:
            continue

        options = {}
        for om in opt_matches:
            letter = om.group(1)
            val = re.sub(r'\s+', ' ', om.group(2)).strip()
            # Trim trailing QID bleed ("... 2-3") or section labels
            val = re.sub(r'\s+\d+-\d+\s*$', '', val).strip()
            val = re.sub(r'\s+(?:Section|Chapter)\s+.*$', '', val, flags=re.I).strip()
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
# Step 3 — parse answers + explanations from right column
# ---------------------------------------------------------------------------

ANS_RE = re.compile(
    r'(\d+-\d+)\.\s*Answer\s+([A-C])\.\s*(.*?)(?=\n\d+-\d+\.\s*Answer\s+[A-C]\.|\Z)',
    re.DOTALL
)


def parse_answers(right_text, questions):
    matched = 0
    for m in ANS_RE.finditer(right_text):
        q_id = m.group(1)
        ans = m.group(2)
        exp = re.sub(r'\s+', ' ', m.group(3)).strip()

        if q_id in questions:
            questions[q_id]['correct'] = ans
            questions[q_id]['explanation'] = exp
            matched += 1

    print(f"  Right column: matched {matched} answers")
    return matched


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def extract_ppl(pdf_path=PDF_PATH, output_path=OUTPUT_PATH):
    print(f"\nExtracting PPL questions from: {pdf_path}")

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
    extract_ppl()
