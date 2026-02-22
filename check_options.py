import fitz
import re
import json

def analyze_pdf(pdf_path):
    print("Reading PDF...")
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
        
    print(f"Extracted length: {len(full_text)}")
    
    # Try to find sequences of A-, B-, C-, and optionally D-
    d_matches = re.finditer(r'\nA-\s*.*?\nB-\s*.*?\nC-\s*.*?\nD-\s*.*?(?=\n\d+-\d|\n\d+-\d+\.|\Z)', full_text, flags=re.DOTALL)
    
    d_count = sum(1 for _ in d_matches)
    print(f"Questions with D- options found: {d_count}")
    
    # Let's also check for D. or (D) instead of D-
    d_alt_matches = re.finditer(r'\n[A-C][-\.]\s*.*?\nD[-\.]\s*.*?', full_text, flags=re.DOTALL)
    print(f"Questions with D (any format): {sum(1 for _ in d_alt_matches)}")
    
if __name__ == "__main__":
    analyze_pdf("Jeppesen Private Pilot Test Guide.pdf")
