import fitz
import re

def check_for_d(pdf_path):
    print("Checking for D options...")
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
        
    matches = re.finditer(r'\nC-\s*(.*?)\s*\nD-\s*(.*?)(?=\n\d+-\d+\s*\n[A-Z0-9]{3,8}|\n\d+-\d+\.\s*Answer|\Z|^\d+-\d+$|Section [A-Z])', full_text, flags=re.DOTALL | re.MULTILINE)
    
    count = 0
    for match in matches:
        count += 1
        print(f"Found D option: {match.group(2)[:50]}...")
        if count > 5:
            break
            
    print(f"Total found: {count}")
    
    # Also just find `\nD- ` anywhere to be sure
    d_matches = re.findall(r'\nD-\s+', full_text)
    print(f"Raw D- matches: {len(d_matches)}")

if __name__ == "__main__":
    check_for_d("Jeppesen Private Pilot Test Guide.pdf")
