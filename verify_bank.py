import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Mi5a/Desktop/FAA-TEST-GUIDE-QUESTION-BANK/pilot-test-guide/src/data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print('Total questions:', len(questions))

ch_counts = defaultdict(int)
cat_by_ch = defaultdict(lambda: defaultdict(int))

for q in questions:
    ch = q['id'].split('-')[0]
    ch_counts[ch] += 1
    cat_by_ch[ch][q.get('category', 'NONE')] += 1

print('\nChapter distribution:')
for ch in sorted(ch_counts.keys(), key=int):
    cats = cat_by_ch[ch]
    cat_str = ', '.join(['{} ({})'.format(c, n) for c, n in cats.items()])
    print('  Chapter {}: {} questions - {}'.format(ch, ch_counts[ch], cat_str))

valid_chapters = {'1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'}
issues = []
for q in questions:
    ch = q['id'].split('-')[0]
    if ch not in valid_chapters:
        issues.append('Question {} has invalid chapter {}'.format(q['id'], ch))

if issues:
    print('\nFound {} chapter issues:'.format(len(issues)))
    for issue in issues[:10]:
        print('  - ' + issue)
else:
    print('\nNo chapter issues found - all questions are in valid chapters!')

print('\nSample of newly added questions:')
new_ids = ['1-5', '2-12', '3-13', '4-1', '6-20', '8-2', '9-12', '12-6']
for q in questions:
    if q['id'] in new_ids:
        print('  {} ({}): {}...'.format(q['id'], q['category'], q['text'][:80]))
