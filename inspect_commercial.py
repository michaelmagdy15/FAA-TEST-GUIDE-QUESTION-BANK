import fitz

def inspect_pdf_pages(pdf_path, start_page=0, num_pages=5):
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    for i in range(start_page, min(start_page + num_pages, doc.page_count)):
        page = doc.load_page(i)
        text = page.get_text("text")
        if text.strip():
            print(f"\n{'='*60}")
            print(f"PAGE {i+1}")
            print('='*60)
            print(text[:2000])

if __name__ == "__main__":
    # Inspect first 20 pages of Commercial test guide to see format
    inspect_pdf_pages("Commercial Airmen Knowledge Test Guide 2021.pdf", 0, 20)
