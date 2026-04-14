import json
import re
import os

def audit_file(filepath):
    print(f"Auditing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Pattern for question headers (e.g. 1-1 \n PLT123)
    header_pattern = re.compile(r'\d+-\d+\s+PLT\d+')
    # Alternative header pattern found in some files
    header_pattern_2 = re.compile(r'\d+-\d+\s+CA\.[A-Z]\.[A-Z]\.[A-Z]\d+')

    issue_count = 0
    for q in data:
        q_id = q.get('id')
        for field in ['text', 'options', 'explanation']:
            val = q.get(field)
            if isinstance(val, dict):
                val = " ".join(val.values())
            
            if val:
                if header_pattern.search(val) or header_pattern_2.search(val):
                    print(f"Issue in {q_id}: Bleed-over detected in {field}")
                    issue_count += 1
                    break
    
    print(f"Total bleed-over issues: {issue_count} / {len(data)}")
    print("-" * 20)

if __name__ == "__main__":
    base_dir = r"h:\FAA TEST GUIDE QUESTION BANK"
    audit_file(os.path.join(base_dir, "ir_questions.json"))
    audit_file(os.path.join(base_dir, "cpl_questions.json"))
    audit_file(os.path.join(base_dir, "questions_v2.json"))
