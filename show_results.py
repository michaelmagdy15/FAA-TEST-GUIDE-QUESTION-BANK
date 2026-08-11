import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Mi5a/Desktop/FAA-TEST-GUIDE-QUESTION-BANK/comparison_results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== MISSING FROM NEW JEPPESEN (not in our bank) ===')
print('Total missing:', len(data['missing_from_new_jeppesen']))
for q in data['missing_from_new_jeppesen']:
    ch = q['id'].split('-')[0]
    plt = q.get('plt', 'N/A')
    text = q['text'][:100]
    ans = q.get('correct', 'N/A')
    print('  {} (Ch{}, {}) Ans={}: {}'.format(q['id'], ch, plt, ans, text))

print()
print('=== ONLY IN NEW JEPPESEN (not in old PDF either) ===')
print('Total:', len(data['only_in_new_jeppesen']))
for q in data['only_in_new_jeppesen']:
    ch = q['id'].split('-')[0]
    plt = q.get('plt', 'N/A')
    text = q['text'][:100]
    ans = q.get('correct', 'N/A')
    print('  {} (Ch{}, {}) Ans={}: {}'.format(q['id'], ch, plt, ans, text))
