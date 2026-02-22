import fitz
import re
import json
import time

# Commercial PDF chapter to IR chapter mapping
# Map chapters found in PDF to meaningful IR chapter names
CHAPTER_TITLES = {
    "1": "IFR Regulations & Pilot Requirements",
    "2": "IFR Flight Planning & Weather Services",
    "3": "Meteorology & Weather Products",
    "4": "IFR En Route Operations",
    "5": "IFR Approach Procedures & Minima",
    "6": "Navigation Systems & GPS",
    "7": "Aircraft Instruments & Avionics",
    "8": "Aeromedical Factors & Aeronautical Decision Making",
    "9": "Aircraft Systems & Performance",
    "10": "Cross-Country IFR Operations",
    "11": "Emergency Procedures & Crew Resource Management",
    "12": "IFR Meteorology & PIREPS",
    "13": "Instrument Approach & Departure Procedures",
    "14": "IFR Navigation & Communication",
}

def extract_all_questions(pdf_path):
    print("Extracting all questions from Commercial Test Guide for IR bank...")
    start_time = time.time()
    
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text("text") + "\n"
    
    print(f"Extracted {len(full_text):,} chars in {time.time()-start_time:.1f}s")
    
    # More flexible pattern - ID with optional PLT code
    q_pattern = r'(\d+-\d+)\s*\n([A-Za-z0-9\.\*\-]{3,20})\s*\n(.*?)(?=\n\d+-\d+\s*\n[A-Za-z0-9]{3,20}\s*\n|\n\d+-\d+\.\s*Answer|\Z)'
    
    questions = {}
    
    for match in re.finditer(q_pattern, full_text, flags=re.DOTALL | re.MULTILINE):
        q_id = match.group(1).strip()
        plt = match.group(2).strip()
        raw_body = match.group(3).strip()
        
        # Skip if PLT looks like a chapter header
        if plt.startswith('CHAPTER') or plt.startswith('Building') or plt.startswith('Chapter'):
            continue
        
        chapter_num = int(q_id.split('-')[0])
        
        # Find A/B/C/D options
        opt_pattern = r'(?:^|\n)\s*([A-D])\s*[-\u2014]\s*(.*?)(?=\n\s*[A-D]\s*[-\u2014]|\Z)'
        opt_matches = list(re.finditer(opt_pattern, raw_body, flags=re.DOTALL))
        
        if len(opt_matches) < 2:
            continue
        
        first_opt_start = opt_matches[0].start()
        q_text = raw_body[:first_opt_start].strip()
        q_text = re.sub(r'\s+', ' ', q_text).strip()
        
        # Remove common junk prefixes from OCR
        q_text = re.sub(r'^[■·•\-\s]*', '', q_text).strip()
        
        if len(q_text) < 15:
            continue
        
        options = {}
        for o_match in opt_matches:
            opt_letter = o_match.group(1)
            opt_text = re.sub(r'\s+', ' ', o_match.group(2)).strip()
            opt_text = re.sub(r'^[■·•\-\s]*', '', opt_text).strip()
            if opt_text and len(opt_text) > 2:
                options[opt_letter] = opt_text
        
        if len(options) < 2:
            continue
        
        questions[q_id] = {
            "id": q_id,
            "plt": plt,
            "text": q_text,
            "options": options
        }
    
    print(f"Found {len(questions)} potential questions")
    
    # Extract answers
    a_pattern = r'(\d+-\d+)\.\s*Answer\s+([A-D])\.(.*?)(?=\n\d+-\d+\.\s*Answer|\Z)'
    
    ans_count = 0
    for match in re.finditer(a_pattern, full_text, flags=re.DOTALL):
        q_id = match.group(1).strip()
        ans = match.group(2).strip()
        exp = re.sub(r'\s+', ' ', match.group(3)).strip()
        # Clean OCR artifacts from explanation
        exp = re.sub(r'MuPDF error.*?format\s*', '', exp).strip()
        
        if q_id in questions:
            ans_count += 1
            questions[q_id]["correct"] = ans
            questions[q_id]["explanation"] = exp
    
    print(f"Matched {ans_count} answers")
    
    # Filter valid questions
    final_questions = [
        q for q in questions.values()
        if "correct" in q and len(q["options"]) >= 2
    ]
    
    print(f"Final valid questions: {len(final_questions)}")
    
    # Remap chapter IDs so they start at 1
    # First get existing chapter numbers
    all_chapters = sorted(set(int(q["id"].split('-')[0]) for q in final_questions))
    chapter_remap = {old: new+1 for new, old in enumerate(all_chapters)}
    
    for q in final_questions:
        old_ch = int(q["id"].split('-')[0])
        q_num = q["id"].split('-')[1]
        new_ch = chapter_remap[old_ch]
        q["id"] = f"{new_ch}-{q_num}"
    
    with open("ir_questions.json", "w", encoding="utf-8") as f:
        json.dump(final_questions, f, indent=2, ensure_ascii=False)
    
    print("Saved to ir_questions.json")
    print("\nFinal chapter distribution:")
    chapter_dist = {}
    for q in final_questions:
        ch = q["id"].split("-")[0]
        chapter_dist[ch] = chapter_dist.get(ch, 0) + 1
    for ch in sorted(chapter_dist.keys(), key=lambda x: int(x)):
        print(f"  Chapter {ch}: {chapter_dist[ch]} questions")
    
    return final_questions

if __name__ == "__main__":
    extract_all_questions("Commercial Airmen Knowledge Test Guide 2021.pdf")
