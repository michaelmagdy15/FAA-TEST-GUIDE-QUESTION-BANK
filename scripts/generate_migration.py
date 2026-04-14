import json
import os

def escape_sql(text):
    if text is None:
        return 'NULL'
    return "'" + str(text).replace("'", "''") + "'"

def migrate():
    modes = {
        'ppl': 'pilot-test-guide/src/data/questions.json',
        'ir': 'pilot-test-guide/src/data/ir_questions.json',
        'cpl': 'pilot-test-guide/src/data/cpl_questions.json'
    }
    
    output_file = 'migrate_data.sql'
    with open(output_file, 'w', encoding='utf-8') as f_out:
        f_out.write("INSERT INTO questions (id, json_id, test_mode, plt, text, options, correct, explanation, chapter) VALUES\n")
        
        first = True
        for mode, path in modes.items():
            if not os.path.exists(path):
                print(f"Skipping {path}")
                continue
                
            with open(path, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                for q in questions:
                    if not first:
                        f_out.write(",\n")
                    
                    json_id = q.get('id', 'N/A')
                    composite_id = f"{mode}:{json_id}"
                    plt = q.get('plt', '')
                    text = q.get('text', '')
                    options = json.dumps(q.get('options', {}))
                    correct = q.get('correct', '')
                    explanation = q.get('explanation', '')
                    chapter = json_id.split('-')[0] if '-' in json_id else ''
                    
                    values = [
                        escape_sql(composite_id),
                        escape_sql(json_id),
                        escape_sql(mode),
                        escape_sql(plt),
                        escape_sql(text),
                        escape_sql(options),
                        escape_sql(correct),
                        escape_sql(explanation),
                        escape_sql(chapter)
                    ]
                    f_out.write(f"({', '.join(values)})")
                    first = False
        
        f_out.write("\nON CONFLICT (id) DO UPDATE SET\n")
        f_out.write("json_id = EXCLUDED.json_id,\n")
        f_out.write("test_mode = EXCLUDED.test_mode,\n")
        f_out.write("plt = EXCLUDED.plt,\n")
        f_out.write("text = EXCLUDED.text,\n")
        f_out.write("options = EXCLUDED.options,\n")
        f_out.write("correct = EXCLUDED.correct,\n")
        f_out.write("explanation = EXCLUDED.explanation,\n")
        f_out.write("chapter = EXCLUDED.chapter;\n")

if __name__ == "__main__":
    migrate()
