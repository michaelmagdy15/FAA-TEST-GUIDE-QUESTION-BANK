"""
Extract missing questions from the new Jeppesen PDF - improved version.
Handles multi-line text and options properly.
"""

import fitz
import re
import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

NEW_JEPPESEN_PDF = 'PDFS/Private Pilot FAA Airman Knowledge Test Guide.pdf'
EXISTING_BANK = 'pilot-test-guide/src/data/questions.json'

CHAPTER_CATEGORIES = {
    '1': 'Aviation Fundamentals',
    '2': 'Aircraft Systems',
    '3': 'Aerodynamics',
    '4': 'Flight Environment',
    '5': 'Communication',
    '6': 'Meteorology',
    '7': 'Weather Data',
    '8': 'Performance',
    '9': 'Navigation',
    '10': 'Human Factors',
    '11': 'Cross-Country',
    '12': 'Regulations',
}


def extract_all_questions(pdf_path):
    """Extract all questions from the new Jeppesen PDF with full details."""
    print(f"Extracting from: {pdf_path}")
    
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    
    # Extract full text
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
    
    print(f"Total text length: {len(full_text):,} chars")
    
    questions = {}
    
    # Find question blocks using the pattern: QID PLT_CODE
    # Format: "2-34 \nPLT351\n" or "2-34\nPLT351\n"
    q_start_pattern = re.compile(r'(\d+-\d+)\s*\n([A-Z0-9]{3,10})\s*\n')
    
    qid_matches = list(q_start_pattern.finditer(full_text))
    print(f"Found {len(qid_matches)} question start markers")
    
    for i, m in enumerate(qid_matches):
        q_id = m.group(1)
        plt = m.group(2)
        
        # Get text block for this question (from after PLT code to next question or answer)
        block_start = m.end()
        
        # Find the next question start OR the answer for this question
        next_q = q_start_pattern.search(full_text, block_start) if i + 1 < len(qid_matches) else None
        next_q_start = next_q.start() if next_q else len(full_text)
        
        # Find the answer for this question
        ans_marker = re.search(r'\d+-\d+\.\s*Answer\s+[A-C]\.', full_text[block_start:next_q_start])
        if ans_marker:
            block_end = block_start + ans_marker.start()
        else:
            block_end = next_q_start
        
        block = full_text[block_start:block_end]
        
        # Find options: "A-", "B -", "C-", "A—"
        opt_matches = list(re.finditer(r'\n([A-C])\s*[-\u2014]\s*', block))
        
        if len(opt_matches) < 2:
            continue
        
        # Extract question text (before first option)
        q_text = block[:opt_matches[0].start()].strip()
        q_text = re.sub(r'\s+', ' ', q_text)
        
        if len(q_text) < 10:
            continue
        
        # Extract options
        options = {}
        for idx, om in enumerate(opt_matches):
            letter = om.group(1)
            opt_start = om.end()
            opt_end = opt_matches[idx + 1].start() if idx + 1 < len(opt_matches) else len(block)
            val = block[opt_start:opt_end].strip()
            val = re.sub(r'\s+', ' ', val)
            # Clean up trailing artifacts
            val = re.sub(r'\s+\d+-\d+\s*$', '', val).strip()
            if val and len(val) > 2:
                options[letter] = val
        
        questions[q_id] = {
            'id': q_id,
            'plt': plt,
            'text': q_text,
            'options': options,
        }
    
    print(f"Extracted {len(questions)} questions with options")
    
    # Find answers and explanations
    # Pattern: "2-34. Answer B. GFDPPM 2-39, PHB\nExplanation text..."
    ans_pattern = re.compile(
        r'(\d+-\d+)\.\s*Answer\s+([A-C])\.\s*(.*?)(?=\n\d+-\d+\.\s*Answer\s+[A-C]\.|\Z)',
        re.DOTALL
    )
    
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
    valid = {}
    for q_id, q in questions.items():
        if 'correct' in q and len(q.get('options', {})) >= 2:
            valid[q_id] = q
    
    print(f"Valid questions: {len(valid)}")
    
    return valid


def load_existing_bank():
    """Load existing question bank."""
    with open(EXISTING_BANK, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    bank = {}
    for q in questions:
        bank[q['id']] = q
    
    print(f"Loaded {len(bank)} questions from existing bank")
    return bank


def find_missing(existing, extracted):
    """Find questions in extracted that are not in existing."""
    missing = {}
    for q_id, q in extracted.items():
        if q_id not in existing:
            missing[q_id] = q
    
    print(f"Found {len(missing)} missing questions")
    return missing


def categorize_question(q_id):
    """Determine the category based on chapter number."""
    ch = q_id.split('-')[0]
    return CHAPTER_CATEGORIES.get(ch, 'General')


def format_question(q, category):
    """Format a question for the question bank."""
    return {
        'plt': q.get('plt', ''),
        'category': category,
        'text': q.get('text', ''),
        'options': q.get('options', {}),
        'correct': q.get('correct', ''),
        'explanation': q.get('explanation', ''),
        'id': q.get('id', ''),
    }


def add_to_bank(bank, missing_questions):
    """Add missing questions to the bank."""
    added = 0
    for q_id, q in missing_questions.items():
        category = categorize_question(q_id)
        formatted = format_question(q, category)
        bank[q_id] = formatted
        added += 1
    
    print(f"Added {added} questions to bank")
    return bank


def save_bank(bank):
    """Save the updated bank."""
    # Convert to list and sort by ID
    questions = list(bank.values())
    
    # Sort by chapter number then question number
    def sort_key(q):
        parts = q['id'].split('-')
        return (int(parts[0]), int(parts[1]))
    
    questions.sort(key=sort_key)
    
    with open(EXISTING_BANK, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(questions)} questions to {EXISTING_BANK}")


def verify_chapters(bank):
    """Verify all questions are in correct chapters."""
    print("\nVerifying chapter assignments...")
    
    issues = []
    chapter_counts = defaultdict(int)
    
    for q_id, q in bank.items():
        ch = q_id.split('-')[0]
        expected_chapter = CHAPTER_CATEGORIES.get(ch, 'General')
        
        chapter_counts[ch] += 1
        
        if q.get('category') != expected_chapter:
            issues.append(f"Question {q_id}: category '{q.get('category')}' != expected '{expected_chapter}'")
    
    if issues:
        print(f"Found {len(issues)} chapter issues:")
        for issue in issues[:10]:
            print(f"  - {issue}")
    else:
        print("All questions are correctly categorized!")
    
    print("\nChapter distribution:")
    for ch in sorted(chapter_counts, key=int):
        print(f"  Chapter {ch} ({CHAPTER_CATEGORIES.get(ch, 'Unknown')}): {chapter_counts[ch]} questions")
    
    return issues


def main():
    # Load existing bank
    existing = load_existing_bank()
    
    # Extract from new Jeppesen PDF
    extracted = extract_all_questions(NEW_JEPPESEN_PDF)
    
    # Find missing questions
    missing = find_missing(existing, extracted)
    
    if not missing:
        print("No missing questions found!")
        return
    
    # Show missing questions by chapter
    print("\nMissing questions by chapter:")
    by_chapter = defaultdict(list)
    for q_id, q in missing.items():
        ch = q_id.split('-')[0]
        by_chapter[ch].append(q)
    
    for ch in sorted(by_chapter, key=int):
        print(f"  Chapter {ch}: {len(by_chapter[ch])} questions")
        for q in by_chapter[ch][:3]:
            print(f"    - {q['id']}: {q['text'][:60]}...")
    
    # Add missing questions to bank
    updated_bank = add_to_bank(existing, missing)
    
    # Verify chapters
    verify_chapters(updated_bank)
    
    # Save updated bank
    save_bank(updated_bank)
    
    print(f"\nDone! Added {len(missing)} missing questions.")


if __name__ == '__main__':
    main()
