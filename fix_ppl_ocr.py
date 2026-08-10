import json
import re

with open('pilot-test-guide/src/data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def fix_text(text):
    if not isinstance(text, str):
        return text
    # Recurring patterns
    text = text.replace('lighterthan-air', 'lighter-than-air')
    text = text.replace('t)1e', 'the')
    text = text.replace('lowert:d', 'lowered')
    text = text.replace('GF©PP', 'GFDPP')
    text = text.replace('a.nd', 'and')
    text = text.replace('longitudin.al', 'longitudinal')
    text = text.replace('tum', 'turn')
    text = text.replace('59°P', '59°F')
    text = text.replace('FA~s', "FAA's")
    text = text.replace('longfmide', 'longitude')
    text = text.replace('commu.nications', 'communications')
    text = text.replace('l 7L', '17L')
    text = text.replace('ten1perature', 'temperature')
    text = text.replace('IO knots', '10 knots')
    text = text.replace('111 °', '110°')
    text = text.replace('220oz', '2200Z')
    text = text.replace('08002', '0800Z')
    text = text.replace('02002', '0200Z')
    text = text.replace('05002', '0500Z')
    text = text.replace('06002', '0600Z')
    text = text.replace('12002', '1200Z')
    text = text.replace('14002', '1400Z')
    text = text.replace('18002', '1800Z')
    text = text.replace('19452', '1945Z')
    text = text.replace('S0°F', '50°F')
    text = text.replace('81 °P', '81°F')
    text = text.replace('50 °Pon', '50°F on')
    text = text.replace('l,750', '1,750')
    text = text.replace('l,350', '1,350')
    text = text.replace('k.nots', 'knots')
    text = text.replace('Ref er', 'Refer')
    text = text.replace('Detennine', 'Determine')
    text = text.replace('prima.ry', 'primary')
    text = text.replace('(areal)', '(area 1)')
    text = text.replace('( area I)', '(area 1)')
    text = text.replace('(area I)', '(area 1)')
    text = text.replace('figure I 6.', 'figure 16.')
    text = text.replace('figure 3 7.', 'figure 37.')
    text = text.replace('figure 3 5.', 'figure 35.')
    text = text.replace('Empty,veight', 'Empty weight')
    text = text.replace('1? pl Ot', 'pilot')
    text = text.replace('650feet.', '650 feet.')
    text = text.replace('TRAFFIC I 0', 'TRAFFIC 10')
    text = text.replace('beading', 'heading')
    text = text.replace('Comers', 'Corners')
    text = text.replace('Ajrport', 'Airport')
    text = text.replace('a=n-Qai~\'Pffttfltl4e flight VFR', 'required equipment for VFR flight')
    # Remove trailing artifacts
    text = re.sub(r'\s*\{4:.*$', '', text)
    # Fix 65°/o -> 65%
    text = text.replace('65°/o', '65%')
    text = text.replace('20.S~The', '20.5. The')

    # Fix specific questions
    text = text.replace('"which is a - class', '"which is a class')
    text = text.replace('101 °F', '101°F')
    return text

count = 0
for q in questions:
    for field in ['text', 'explanation']:
        if field in q and q[field]:
            original = q[field]
            q[field] = fix_text(q[field])
            if q[field] != original:
                count += 1
    for key in ['A', 'B', 'C', 'D']:
        if 'options' in q and key in q['options']:
            original = q['options'][key]
            q['options'][key] = fix_text(q['options'][key])
            if q['options'][key] != original:
                count += 1

# Fix specific question 2-62: missing numbers in options
for q in questions:
    if q['id'] == '2-62':
        q['options']['A'] = '208 KTS.'
        q['options']['B'] = '218 KTS.'
        q['options']['C'] = '228 KTS.'
        count += 1
    elif q['id'] == '8-7':
        q['options']['A'] = '158 KTS.'
        q['options']['B'] = '168 KTS.'
        q['options']['C'] = '178 KTS.'
        count += 1
    elif q['id'] == '8-64':
        q['options']['A'] = 'Corners 1 and 2.'
        q['options']['B'] = 'Corners 1 and 4.'
        q['options']['C'] = 'Corners 2 and 4 Flight Computers.'
        count += 1
    elif q['id'] == '7-39':
        q['text'] = q['text'].replace('1? pl Ot', 'pilot')
        count += 1
    elif q['id'] == '7-8':
        q['explanation'] = q['explanation'].replace('/TA M7/WV 08021/:', '(TEMPO 0800Z):')
        count += 1
    elif q['id'] == '7-19':
        q['explanation'] = q['explanation'].replace('08002', '0800Z')
        q['explanation'] = q['explanation'].replace('0600 08002', '0600-0800Z')
        count += 1
    elif q['id'] == '7-27':
        q['text'] = q['text'].replace('02002', '0200Z')
        q['text'] = q['text'].replace('05002', '0500Z')
        q['options']['B'] = q['options']['B'].replace('l 00', '100')
        count += 1

with open('pilot-test-guide/src/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f'Fixed {count} fields in {len(questions)} questions')
