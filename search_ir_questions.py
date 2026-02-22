import fitz
import re

def search_for_questions(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    
    # Look through all pages for question-like patterns
    for i in range(doc.page_count):
        page = doc.load_page(i)
        text = page.get_text("text")
        if text.strip():
            # Look for common question patterns
            if re.search(r'\d+-\d+', text) or re.search(r'Answer\s+[A-D]', text) or re.search(r'[A-D]-\s', text):
                print(f"\nPage {i+1} has question-like content:")
                print(text[:1000])
                print("---")

if __name__ == "__main__":
    search_for_questions("IR Test guide figures.pdf")
