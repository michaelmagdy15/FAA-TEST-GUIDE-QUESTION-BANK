import fitz
import sys

def inspect_pdf(pdf_path, pages=5):
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    for i in range(min(pages, doc.page_count)):
        print(f"\n{'='*60}")
        print(f"PAGE {i+1}")
        print('='*60)
        page = doc.load_page(i)
        text = page.get_text("text")
        print(text[:3000])

if __name__ == "__main__":
    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    inspect_pdf("IR Test guide figures.pdf", pages)
