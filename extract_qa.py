import fitz
import re
import json
import time

def parse_pdf(pdf_path, start_page=1, end_page=None):
    print("Starting PDF parsing...")
    start_time = time.time()
    
    doc = fitz.open(pdf_path)
    if end_page is None:
        end_page = doc.page_count
    
    full_text = ""
    for page_num in range(start_page, end_page):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
        
    print(f"Extracted length: {len(full_text)}")
    print(f"Time taken to extract text: {time.time() - start_time:.2f} seconds")
    
    questions = {}
    
    q_pattern = r'(\d+-\d+)\s*\n([A-Z0-9]{3,8})\s*\n(.*?)\s*\nA-\s*(.*?)\s*\nB-\s*(.*?)\s*\nC-\s*(.*?)(?=\n\d+-\d+\s*\n[A-Z0-9]{3,8}|\n\d+-\d+\.\s*Answer|\Z|^\d+-\d+$|Section [A-Z])'
    
    for match in re.finditer(q_pattern, full_text, flags=re.DOTALL | re.MULTILINE):
        q_id = match.group(1).strip()
        plt = match.group(2).strip()
        text = match.group(3).strip().replace('\n', ' ')
        opt_a = match.group(4).strip().replace('\n', ' ')
        opt_b = match.group(5).strip().replace('\n', ' ')
        opt_c = match.group(6).strip().replace('\n', ' ')
        
        questions[q_id] = {
            "id": q_id,
            "plt": plt,
            "text": text,
            "options": {
                "A": opt_a,
                "B": opt_b,
                "C": opt_c
            }
        }
        
    print(f"Found {len(questions)} questions")
    
    a_pattern = r'(\d+-\d+)\.\s*Answer\s*([A-C])\.(.*?)(?=\n\d+-\d+\.\s*Answer|\Z)'
    
    ans_count = 0
    for match in re.finditer(a_pattern, full_text, flags=re.DOTALL):
        q_id = match.group(1).strip()
        ans = match.group(2).strip()
        exp = match.group(3).strip().replace('\n', ' ')
        
        ans_count += 1
        if q_id in questions:
            questions[q_id]["correct"] = ans
            questions[q_id]["explanation"] = exp
            
    print(f"Found {ans_count} explanations")
    
    # Filter questions without a correct answer set
    final_questions = [q for q in questions.values() if "correct" in q]
    print(f"Final valid questions count: {len(final_questions)}")
    
    with open("questions.json", "w") as f:
        json.dump(final_questions, f, indent=4)

if __name__ == "__main__":
    parse_pdf("Jeppesen Private Pilot Test Guide.pdf", 1) 
