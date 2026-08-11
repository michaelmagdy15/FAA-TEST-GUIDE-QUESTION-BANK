"""
Fix chapter categorization for all questions in the bank.
Uses the majority category for each chapter from existing data.
"""

import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

EXISTING_BANK = 'pilot-test-guide/src/data/questions.json'


def main():
    with open(EXISTING_BANK, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f"Loaded {len(questions)} questions")
    
    # Build chapter -> category mapping based on majority
    ch_to_cat = defaultdict(lambda: defaultdict(int))
    for q in questions:
        ch = q['id'].split('-')[0]
        cat = q.get('category', '')
        ch_to_cat[ch][cat] += 1
    
    # Get the majority category for each chapter
    majority_cat = {}
    for ch, cats in ch_to_cat.items():
        majority_cat[ch] = max(cats, key=cats.get)
    
    print("\nMajority categories per chapter:")
    for ch in sorted(majority_cat.keys(), key=int):
        print(f"  Chapter {ch}: {majority_cat[ch]}")
    
    # Fix categories
    fixed = 0
    for q in questions:
        ch = q['id'].split('-')[0]
        expected_cat = majority_cat.get(ch, q.get('category', ''))
        if q.get('category') != expected_cat:
            q['category'] = expected_cat
            fixed += 1
    
    print(f"\nFixed {fixed} questions")
    
    # Save
    with open(EXISTING_BANK, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {EXISTING_BANK}")
    
    # Verify
    print("\nVerification - chapter distribution:")
    ch_counts = defaultdict(int)
    for q in questions:
        ch = q['id'].split('-')[0]
        ch_counts[ch] += 1
    
    for ch in sorted(ch_counts.keys(), key=int):
        print(f"  Chapter {ch} ({majority_cat.get(ch, 'Unknown')}): {ch_counts[ch]} questions")


if __name__ == '__main__':
    main()
