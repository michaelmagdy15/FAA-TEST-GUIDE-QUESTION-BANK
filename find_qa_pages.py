import fitz
import re

def find_question_pages(pdf_path, sample_size=50):
    """Find pages with question ID patterns like 1-1, 2-5 etc and show them."""
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    found = 0
    
    for i in range(doc.page_count):
        page = doc.load_page(i)
        text = page.get_text("text")
        # Look for Answer patterns
        if re.search(r'\d+-\d+\.\s*Answer\s+[A-D]', text):
            print(f"\n{'='*60}")
            print(f"PAGE {i+1} — has Answer patterns")
            print('='*60)
            print(text[:2500])
            found += 1
            if found >= sample_size:
                break

if __name__ == "__main__":
    find_question_pages("Commercial Airmen Knowledge Test Guide 2021.pdf", 5)
