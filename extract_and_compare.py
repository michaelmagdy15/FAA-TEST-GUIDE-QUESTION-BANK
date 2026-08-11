"""
Extract questions from both PDFs and compare with existing question bank.
Find missing questions and duplicates with newer versions.
"""

import fitz
import re
import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

# PDF paths
NEW_JEPPESEN_PDF = 'PDFS/Private Pilot FAA Airman Knowledge Test Guide.pdf'
OLD_JEPPESEN_PDF = 'Jeppesen Private Pilot Test Guide.pdf'
EXISTING_BANK = 'pilot-test-guide/src/data/questions.json'

def extract_questions_from_pdf(pdf_path, pdf_label):
    """Extract questions from a Jeppesen-style PDF."""
    print(f"\n{'='*60}")
    print(f"Extracting from: {pdf_label}")
    print(f"PDF: {pdf_path}")
    print(f"{'='*60}")
    
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
    
    print(f"Total text length: {len(full_text):,} chars")
    
    questions = {}
    
    # Pattern for question blocks: QID\nPLT_CODE\n<text>
    # Also handle questions without PLT code
    q_pattern = re.compile(
        r'(\d+-\d+)\s*\n(?:([A-Z0-9]{3,10})\s*\n)?(.*?)(?=\n[A-C]\s*[-\u2014]|\Z)',
        re.DOTALL | re.MULTILINE
    )
    
    # Pattern for options
    opt_pattern = re.compile(
        r'\n([A-C])\s*[-\u2014]\s*(.*?)(?=\n[A-C]\s*[-\u2014]|\n\d+-\d+\s*\n|\Z)',
        re.DOTALL
    )
    
    # Pattern for answers and explanations
    ans_pattern = re.compile(
        r'(\d+-\d+)\.\s*Answer\s+([A-C])\.\s*(.*?)(?=\n\d+-\d+\.\s*Answer\s+[A-C]\.|\Z)',
        re.DOTALL
    )
    
    # Find all question IDs
    qid_matches = list(re.finditer(r'(\d+-\d+)\s*\n([A-Z0-9]{3,10})\s*\n', full_text))
    
    print(f"Found {len(qid_matches)} question ID markers")
    
    for i, m in enumerate(qid_matches):
        q_id = m.group(1)
        plt = m.group(2)
        
        # Get text block for this question
        block_start = m.end()
        block_end = qid_matches[i + 1].start() if i + 1 < len(qid_matches) else len(full_text)
        block = full_text[block_start:block_end]
        
        # Find options in this block
        opts = list(opt_pattern.finditer('\n' + block))
        
        if len(opts) < 2:
            continue
        
        # Extract question text (before first option)
        q_text = block[:opts[0].start()].strip()
        q_text = re.sub(r'\s+', ' ', q_text)
        
        if len(q_text) < 10:
            continue
        
        # Extract options
        options = {}
        for om in opts:
            letter = om.group(1)
            val = re.sub(r'\s+', ' ', om.group(2)).strip()
            # Clean up trailing artifacts
            val = re.sub(r'\s+\d+-\d+\s*$', '', val).strip()
            if val and len(val) > 2:
                options[letter] = val
        
        questions[q_id] = {
            'id': q_id,
            'plt': plt,
            'text': q_text,
            'options': options,
            'source': pdf_label
        }
    
    print(f"Extracted {len(questions)} questions with options")
    
    # Find answers
    ans_matches = list(ans_pattern.finditer(full_text))
    print(f"Found {len(ans_matches)} answer markers")
    
    matched = 0
    for m in ans_matches:
        q_id = m.group(1)
        ans = m.group(2)
        exp = re.sub(r'\s+', ' ', m.group(3)).strip()
        
        if q_id in questions:
            questions[q_id]['correct'] = ans
            questions[q_id]['explanation'] = exp
            matched += 1
    
    print(f"Matched {matched} answers to questions")
    
    # Filter valid questions
    valid = [q for q in questions.values() if 'correct' in q and len(q.get('options', {})) >= 2]
    print(f"Valid questions: {len(valid)}")
    
    # Chapter distribution
    ch_dist = defaultdict(int)
    for q in valid:
        ch = q['id'].split('-')[0]
        ch_dist[ch] += 1
    
    print("\nChapter distribution:")
    for ch in sorted(ch_dist, key=int):
        print(f"  Chapter {ch}: {ch_dist[ch]} questions")
    
    return {q['id']: q for q in valid}


def load_existing_bank():
    """Load existing question bank."""
    print(f"\n{'='*60}")
    print(f"Loading existing question bank")
    print(f"{'='*60}")
    
    with open(EXISTING_BANK, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    bank = {}
    for q in questions:
        bank[q['id']] = q
    
    print(f"Loaded {len(bank)} questions from existing bank")
    
    # Chapter distribution
    ch_dist = defaultdict(int)
    for q in questions:
        ch = q['id'].split('-')[0]
        ch_dist[ch] += 1
    
    print("\nChapter distribution:")
    for ch in sorted(ch_dist, key=int):
        print(f"  Chapter {ch}: {ch_dist[ch]} questions")
    
    return bank


def compare_questions(existing, new_questions, source_name):
    """Compare existing bank with new extraction."""
    print(f"\n{'='*60}")
    print(f"Comparing with: {source_name}")
    print(f"{'='*60}")
    
    missing = []
    updated = []
    same = []
    
    for q_id, new_q in new_questions.items():
        if q_id not in existing:
            missing.append(new_q)
        else:
            existing_q = existing[q_id]
            # Check if text or options changed
            if (new_q.get('text', '') != existing_q.get('text', '') or
                new_q.get('options', {}) != existing_q.get('options', {}) or
                new_q.get('correct', '') != existing_q.get('correct', '')):
                updated.append({
                    'id': q_id,
                    'existing': existing_q,
                    'new': new_q
                })
            else:
                same.append(q_id)
    
    print(f"\nResults:")
    print(f"  Missing (not in bank): {len(missing)}")
    print(f"  Updated (different text/answer): {len(updated)}")
    print(f"  Same: {len(same)}")
    
    if missing:
        print(f"\n--- Missing Questions ---")
        for q in sorted(missing, key=lambda x: [int(n) for n in x['id'].split('-')]):
            print(f"\n{q['id']} ({q.get('plt', 'N/A')}):")
            print(f"  Chapter: {q['id'].split('-')[0]}")
            print(f"  Text: {q['text'][:100]}...")
            for opt in ['A', 'B', 'C']:
                if opt in q.get('options', {}):
                    print(f"  {opt}: {q['options'][opt][:80]}...")
            if 'correct' in q:
                print(f"  Answer: {q['correct']}")
    
    if updated:
        print(f"\n--- Updated Questions ---")
        for u in sorted(updated, key=lambda x: [int(n) for n in x['id'].split('-')]):
            print(f"\n{u['id']}:")
            print(f"  Existing text: {u['existing'].get('text', '')[:80]}...")
            print(f"  New text: {u['new'].get('text', '')[:80]}...")
            if u['existing'].get('correct') != u['new'].get('correct'):
                print(f"  Existing answer: {u['existing'].get('correct')}")
                print(f"  New answer: {u['new'].get('correct')}")
    
    return missing, updated


def check_chapter_leakage(bank):
    """Check for chapter leakage - questions in wrong chapters."""
    print(f"\n{'='*60}")
    print(f"Checking for chapter leakage")
    print(f"{'='*60}")
    
    # Load chapter titles from App.tsx to verify expected chapters
    ppl_chapters = {'1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'}
    
    issues = []
    for q_id, q in bank.items():
        ch = q_id.split('-')[0]
        if ch not in ppl_chapters:
            issues.append(f"Question {q_id} has unexpected chapter {ch}")
    
    if issues:
        print(f"Found {len(issues)} chapter issues:")
        for issue in issues[:20]:
            print(f"  - {issue}")
    else:
        print("No chapter leakage found")
    
    return issues


def main():
    # Load existing bank
    existing = load_existing_bank()
    
    # Extract from new Jeppesen PDF (314 pages)
    new_jeppesen = extract_questions_from_pdf(NEW_JEPPESEN_PDF, "New Jeppesen (2009)")
    
    # Extract from old Jeppesen PDF (used for existing bank)
    old_jeppesen = extract_questions_from_pdf(OLD_JEPPESEN_PDF, "Old Jeppesen")
    
    # Compare new Jeppesen with existing bank
    missing_new, updated_new = compare_questions(existing, new_jeppesen, "New Jeppesen")
    
    # Compare old Jeppesen with existing bank (should be mostly same)
    missing_old, updated_old = compare_questions(existing, old_jeppesen, "Old Jeppesen")
    
    # Check chapter leakage
    check_chapter_leakage(existing)
    
    # Find questions only in new Jeppesen (truly new)
    only_in_new = []
    for q_id, q in new_jeppesen.items():
        if q_id not in old_jeppesen:
            only_in_new.append(q)
    
    print(f"\n{'='*60}")
    print(f"Questions only in NEW Jeppesen (not in old): {len(only_in_new)}")
    print(f"{'='*60}")
    
    for q in sorted(only_in_new, key=lambda x: [int(n) for n in x['id'].split('-')])[:30]:
        print(f"\n{q['id']} ({q.get('plt', 'N/A')}):")
        print(f"  Chapter: {q['id'].split('-')[0]}")
        print(f"  Text: {q['text'][:120]}...")
        if 'correct' in q:
            print(f"  Answer: {q['correct']}")
    
    # Save results
    results = {
        'missing_from_new_jeppesen': missing_new,
        'updated_in_new_jeppesen': updated_new,
        'only_in_new_jeppesen': only_in_new
    }
    
    with open('comparison_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\nResults saved to comparison_results.json")


if __name__ == '__main__':
    main()
