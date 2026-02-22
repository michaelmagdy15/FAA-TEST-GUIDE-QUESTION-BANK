import fitz
import re
import json
import time

# CPL chapter titles from Commercial Airmen Knowledge Test Guide
# Based on the actual Jeppesen Commercial Test Guide structure
CPL_CHAPTER_TITLES = {
    "1": "Building Professional Experience",
    "2": "Airplane Systems",
    "3": "Meteorology for Commercial Pilots",
    "4": "IFR En Route & Navigation",
    "5": "Aerodynamics & Performance",
    "6": "Takeoff, Landing & Ground Operations",
    "7": "Emergency Procedures",
    "8": "Aeromedical Factors & Human Performance",
}

def extract_cpl_questions(pdf_path):
    print("Extracting all CPL questions from Commercial Test Guide...")
    start_time = time.time()
    
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text("text") + "\n"
    
    print(f"Extracted {len(full_text):,} chars in {time.time()-start_time:.1f}s")
    
    # Pattern to match question ID + PLT code + body
    q_pattern = r'(\d+-\d+)\s*\n([A-Za-z0-9\.\*\-]{3,20})\s*\n(.*?)(?=\n\d+-\d+\s*\n[A-Za-z0-9]{3,20}\s*\n|\n\d+-\d+\.\s*Answer|\Z)'
    
    questions = {}
    
    for match in re.finditer(q_pattern, full_text, flags=re.DOTALL | re.MULTILINE):
        q_id = match.group(1).strip()
        plt = match.group(2).strip()
        raw_body = match.group(3).strip()
        
        # Skip chapter header artifacts
        if re.match(r'^CHAPTER|^Building|^Chapter|^Airplane|^Weather|^Aerod|^Flight|^Emergency', plt, re.I):
            continue
        
        # Find A/B/C/D options
        opt_pattern = r'(?:^|\n)\s*([A-D])\s*[-\u2014]\s*(.*?)(?=\n\s*[A-D]\s*[-\u2014]|\Z)'
        opt_matches = list(re.finditer(opt_pattern, raw_body, flags=re.DOTALL))
        
        if len(opt_matches) < 2:
            continue
        
        first_opt_start = opt_matches[0].start()
        q_text = raw_body[:first_opt_start].strip()
        q_text = re.sub(r'\s+', ' ', q_text).strip()
        # Remove OCR artifacts from front
        q_text = re.sub(r'^[■·•\-\s°0-9\u2022]*', '', q_text).strip()
        
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
        exp = re.sub(r'MuPDF error[^\n]*', '', exp).strip()
        
        if q_id in questions:
            ans_count += 1
            questions[q_id]["correct"] = ans
            questions[q_id]["explanation"] = exp
    
    print(f"Matched {ans_count} answers")
    
    # Filter valid
    final_questions = [
        q for q in questions.values()
        if "correct" in q and len(q["options"]) >= 2
    ]
    
    print(f"Final valid CPL questions: {len(final_questions)}")
    
    # Remap chapter numbers to start at 1 continuously
    all_chapters = sorted(set(int(q["id"].split('-')[0]) for q in final_questions))
    chapter_remap = {old: new+1 for new, old in enumerate(all_chapters)}
    
    for q in final_questions:
        old_ch = int(q["id"].split('-')[0])
        q_num = q["id"].split('-')[1]
        new_ch = chapter_remap[old_ch]
        q["id"] = f"{new_ch}-{q_num}"
    
    with open("cpl_questions.json", "w", encoding="utf-8") as f:
        json.dump(final_questions, f, indent=2, ensure_ascii=False)
    
    print("Saved to cpl_questions.json")
    
    print("\nChapter distribution:")
    chapter_dist = {}
    for q in final_questions:
        ch = q["id"].split("-")[0]
        chapter_dist[ch] = chapter_dist.get(ch, 0) + 1
    for ch in sorted(chapter_dist.keys(), key=lambda x: int(x)):
        print(f"  Chapter {ch}: {chapter_dist[ch]} questions")
    
    # Print chapter mapping
    print("\nChapter remap:", chapter_remap)

if __name__ == "__main__":
    extract_cpl_questions("Commercial Airmen Knowledge Test Guide 2021.pdf")
