import fitz
import re
import json
import time

def parse_pdf_dynamic(pdf_path):
    print("Starting PDF parsing...")
    start_time = time.time()
    
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
        
    print(f"Extracted length: {len(full_text)}")
    print(f"Time taken to extract text: {time.time() - start_time:.2f} seconds")
    
    # regex for questions with ID and PLT
    q_pattern = r'(\d+-\d+)\s*\n([A-Z0-9]{3,8})\s*\n(.*?)(?=\n\d+-\d+\s*\n[A-Z0-9]{3,8}|\n\d+-\d+\.\s*Answer|\Z|^\d+-\d+$|Section [A-Z])'
    
    questions = {}
    
    for match in re.finditer(q_pattern, full_text, flags=re.DOTALL | re.MULTILINE):
        q_id = match.group(1).strip()
        plt = match.group(2).strip()
        raw_body = match.group(3).strip()
        
        # Now find the options within this raw_body
        # We look for A- ..., B- ..., C- ..., D- ...
        # Can split by these prefixes or use regex
        
        opt_matches = list(re.finditer(r'(?:^|\s+)([A-D])[-\."]\s*(.*?)(?=(?:\s+[A-D][-\."]\s*)|\Z)', raw_body, flags=re.DOTALL))
        
        if not opt_matches:
            continue
            
        # The question text is everything before the first option match
        first_opt_start = opt_matches[0].start()
        q_text = raw_body[:first_opt_start].strip().replace('\n', ' ')
        
        options = {}
        for o_match in opt_matches:
            opt_letter = o_match.group(1)
            opt_text = o_match.group(2).strip().replace('\n', ' ')
            options[opt_letter] = opt_text
            
        questions[q_id] = {
            "id": q_id,
            "plt": plt,
            "text": q_text,
            "options": options
        }
        
    print(f"Found {len(questions)} potential questions")
    
    # regex for answers
    a_pattern = r'(\d+-\d+)\.\s*Answer\s*([A-D])\.(.*?)(?=\n\d+-\d+\.\s*Answer|\Z)'
    
    ans_count = 0
    for match in re.finditer(a_pattern, full_text, flags=re.DOTALL):
        q_id = match.group(1).strip()
        ans = match.group(2).strip()
        exp = match.group(3).strip().replace('\n', ' ')
        
        if q_id in questions:
            ans_count += 1
            questions[q_id]["correct"] = ans
            questions[q_id]["explanation"] = exp
            
    print(f"Found {ans_count} explanations matched")
    
    # Filter valid
    final_questions = [q for q in questions.values() if "correct" in q and len(q["options"]) > 0]
    print(f"Final valid questions count: {len(final_questions)}")
    
    opt_d_count = sum(1 for q in final_questions if 'D' in q['options'])
    print(f"Questions with D option: {opt_d_count}")
    
    with open("questions_v2.json", "w") as f:
        json.dump(final_questions, f, indent=4)

if __name__ == "__main__":
    parse_pdf_dynamic("Jeppesen Private Pilot Test Guide.pdf")
