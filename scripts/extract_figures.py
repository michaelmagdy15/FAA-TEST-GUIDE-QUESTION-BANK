"""
Extract FAA figure images from Jeppesen Private Pilot Test Guide.pdf (Appendix 2).

Scans appendix pages for "Figure N" labels, fills gaps by position,
then renders each page as a PNG at 150 DPI into:
  pilot-test-guide/src/assets/figures/figure_<N>.png

Only extracts figures that are actually referenced by PPL questions.
"""

import sys
import re
import json
import os
import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = 'Jeppesen Private Pilot Test Guide.pdf'
CLEANED_PPL = 'cleaned/ppl_cleaned.json'
OUT_DIR = 'pilot-test-guide/src/assets/figures'
DPI = 150
JPEG_QUALITY = 75   # 0-95; 75 gives good detail at ~10x smaller than PNG
APPENDIX_START = 267  # 0-indexed page where Appendix 2 begins


def build_figure_page_map(doc):
    """Scan appendix pages and map figure number -> 0-indexed page."""
    fig_pages = {}

    for i in range(APPENDIX_START, doc.page_count):
        page = doc.load_page(i)
        text = page.get_text('text')
        for m in re.finditer(r'Figure\s+(\d+)', text, re.IGNORECASE):
            fig_num = int(m.group(1))
            if fig_num not in fig_pages:
                fig_pages[fig_num] = i

    # Fill gaps: if figure N is missing but N-1 and N+1 are consecutive pages,
    # assign the page in between.
    all_nums = sorted(fig_pages.keys())
    for i in range(len(all_nums) - 1):
        a, b = all_nums[i], all_nums[i + 1]
        page_a, page_b = fig_pages[a], fig_pages[b]
        if b - a == 2 and page_b - page_a == 2:
            # gap of exactly 1 figure and 1 page
            fig_pages[a + 1] = page_a + 1

    return fig_pages


def get_referenced_figures(cleaned_ppl_path):
    """Return set of figure numbers referenced in PPL question text."""
    with open(cleaned_ppl_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    fig_re = re.compile(r'\(Refer to (?:figure|figures?)\s+(\d+)', re.IGNORECASE)
    nums = set()
    for q in data:
        for m in fig_re.finditer(q.get('text', '')):
            nums.add(int(m.group(1)))
        for opt in q.get('options', {}).values():
            for m in fig_re.finditer(opt):
                nums.add(int(m.group(1)))
    return nums


def render_page(doc, page_idx, out_path, dpi=DPI):
    page = doc.load_page(page_idx)
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    pix.save(out_path, jpg_quality=JPEG_QUALITY)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    doc = fitz.open(PDF_PATH)
    print(f'PDF: {doc.page_count} pages')

    fig_map = build_figure_page_map(doc)
    print(f'Figures found in appendix: {sorted(fig_map.keys())}')

    referenced = get_referenced_figures(CLEANED_PPL)
    print(f'Figures referenced by questions: {sorted(referenced)}')

    missing = referenced - set(fig_map.keys())
    if missing:
        print(f'WARNING: figures with no page mapping: {sorted(missing)}')

    extracted = 0
    for fig_num in sorted(referenced):
        if fig_num not in fig_map:
            continue
        page_idx = fig_map[fig_num]
        out_path = os.path.join(OUT_DIR, f'figure_{fig_num}.jpg')
        render_page(doc, page_idx, out_path)
        extracted += 1
        print(f'  Figure {fig_num} -> page {page_idx + 1} -> {out_path}')

    print(f'\nExtracted {extracted} figures to {OUT_DIR}/')

    # Write the mapping as a JSON file for the app to import
    mapping = {str(n): f'figure_{n}.png' for n in sorted(referenced) if n in fig_map}
    map_path = os.path.join(OUT_DIR, 'figure_map.json')
    with open(map_path, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2)
    print(f'Wrote figure map -> {map_path}')


if __name__ == '__main__':
    main()
