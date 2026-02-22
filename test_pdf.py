import fitz  # PyMuPDF

def extract_text(pdf_path, start_page, end_page):
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(start_page, end_page):
            page = doc.load_page(page_num)
            text = page.get_text()
            print(f"--- Page {page_num + 1} ---")
            print(text)
            print("----------------------\n")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text("Jeppesen Private Pilot Test Guide.pdf", 40, 45)
