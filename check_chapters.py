import fitz
import re
import json
import sys

def check_chapters(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text("text") + "\n"
    
    # Count questions per chapter
    q_pattern = r'(\d+)-(\d+)\s*\n([A-Z0-9\.\*]{3,12})\s*\n'
    chapter_count = {}
    plt_codes = {}
    
    for match in re.finditer(q_pattern, full_text, flags=re.MULTILINE):
        ch = int(match.group(1))
        plt = match.group(3)
        chapter_count[ch] = chapter_count.get(ch, 0) + 1
        plt_codes[plt] = plt_codes.get(plt, 0) + 1
    
    print("Chapter distribution:")
    for ch in sorted(chapter_count.keys()):
        print(f"  Chapter {ch}: {chapter_count[ch]} questions")
    
    print(f"\nTop PLT codes:")
    for code, count in sorted(plt_codes.items(), key=lambda x: -x[1])[:30]:
        print(f"  {code}: {count}")

if __name__ == "__main__":
    check_chapters("Commercial Airmen Knowledge Test Guide 2021.pdf")
