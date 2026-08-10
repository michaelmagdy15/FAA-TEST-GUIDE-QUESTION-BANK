import pymupdf
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pdf_path = r"PDFS\Pilot Institute Private Pilot Study Sheet.pdf"
doc = pymupdf.open(pdf_path)

print(f"Total pages: {doc.page_count}")

all_content = []
for page_num in range(doc.page_count):
    page = doc[page_num]
    text = page.get_text("text")
    if text.strip():
        all_content.append({
            "page": page_num + 1,
            "text": text.strip()
        })

# Save to JSON
with open("ppl_guide_content.json", "w", encoding="utf-8") as f:
    json.dump(all_content, f, indent=2, ensure_ascii=False)

# Print all pages
for entry in all_content:
    print(f"\n{'='*80}")
    print(f"PAGE {entry['page']}")
    print("="*80)
    print(entry['text'])

doc.close()
print(f"\n\nDone. {len(all_content)} pages extracted.")
