"""
Extract missing figures from the Jeppesen PDF.
Figures 7, 30, 62, 63 are referenced but missing.
"""

import fitz
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = 'PDFS/Private Pilot FAA Airman Knowledge Test Guide.pdf'
OUTPUT_DIR = 'pilot-test-guide/src/assets/figures'


def extract_figures_from_pdf(pdf_path, output_dir):
    """Extract figure images from the PDF."""
    print(f"Opening PDF: {pdf_path}")
    doc = fitz.open(pdf_path)
    print(f"Total pages: {doc.page_count}")
    
    # Missing figures we need to find
    missing_figures = {7, 30, 62, 63}
    found_figures = {}
    
    # Search through all pages for figure references
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        
        # Check if this page contains any of our missing figures
        for fig_num in missing_figures:
            # Look for figure references like "figure 7" or "fig. 7" or "Figure 7"
            patterns = [
                rf'figure\s+{fig_num}\b',
                rf'fig\.?\s*{fig_num}\b',
                rf'Figure\s+{fig_num}\b',
                rf'FIGURE\s+{fig_num}\b',
            ]
            
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    if fig_num not in found_figures:
                        found_figures[fig_num] = page_num + 1  # 1-indexed
                        print(f"Found reference to figure {fig_num} on page {page_num + 1}")
    
    print(f"\nFound references for {len(found_figures)} missing figures")
    
    # Extract images from pages containing figures
    for fig_num, page_num in found_figures.items():
        print(f"\nExtracting figure {fig_num} from page {page_num}...")
        page = doc.load_page(page_num - 1)  # 0-indexed
        
        # Get all images on this page
        images = page.get_images(full=True)
        print(f"  Found {len(images)} images on page {page_num}")
        
        if images:
            # Extract the largest image (likely the figure)
            max_size = 0
            max_img_idx = 0
            
            for idx, img in enumerate(images):
                xref = img[0]
                base_image = doc.extract_image(xref)
                img_size = base_image["width"] * base_image["height"]
                if img_size > max_size:
                    max_size = img_size
                    max_img_idx = idx
            
            # Extract the largest image
            img = images[max_img_idx]
            xref = img[0]
            base_image = doc.extract_image(xref)
            img_bytes = base_image["image"]
            img_ext = base_image["ext"]
            
            # Save as JPG
            output_path = os.path.join(output_dir, f"figure_{fig_num}.jpg")
            
            # Convert to JPG if needed
            if img_ext != "jpg":
                # Use PIL to convert
                from PIL import Image
                import io
                img_data = io.BytesIO(img_bytes)
                pil_img = Image.open(img_data)
                if pil_img.mode in ('RGBA', 'P'):
                    pil_img = pil_img.convert('RGB')
                pil_img.save(output_path, 'JPEG', quality=95)
                print(f"  Saved as JPG: {output_path}")
            else:
                with open(output_path, 'wb') as f:
                    f.write(img_bytes)
                print(f"  Saved: {output_path}")
    
    # Also try to extract figures by looking at the appendix pages
    # Figures are typically in the appendix at the end of the book
    print("\nSearching appendix pages for figures...")
    for page_num in range(doc.page_count - 50, doc.page_count):
        if page_num < 0:
            continue
        page = doc.load_page(page_num)
        text = page.get_text("text")
        
        for fig_num in missing_figures:
            if fig_num in found_figures:
                continue
                
            # Check for figure header
            if re.search(rf'Figure\s+{fig_num}[\s\.]', text):
                print(f"Found figure {fig_num} header on page {page_num + 1}")
                images = page.get_images(full=True)
                if images:
                    # Find the figure image
                    for img in images:
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        img_bytes = base_image["image"]
                        img_ext = base_image["ext"]
                        
                        # Check if image is large enough to be a figure
                        if base_image["width"] > 200 and base_image["height"] > 200:
                            output_path = os.path.join(output_dir, f"figure_{fig_num}.jpg")
                            
                            if img_ext != "jpg":
                                from PIL import Image
                                import io
                                img_data = io.BytesIO(img_bytes)
                                pil_img = Image.open(img_data)
                                if pil_img.mode in ('RGBA', 'P'):
                                    pil_img = pil_img.convert('RGB')
                                pil_img.save(output_path, 'JPEG', quality=95)
                            else:
                                with open(output_path, 'wb') as f:
                                    f.write(img_bytes)
                            
                            found_figures[fig_num] = page_num + 1
                            print(f"  Extracted figure {fig_num} to {output_path}")
                            break
    
    doc.close()
    
    # Report results
    still_missing = missing_figures - set(found_figures.keys())
    if still_missing:
        print(f"\nWarning: Could not find figures: {sorted(still_missing)}")
    else:
        print("\nAll missing figures extracted successfully!")
    
    return found_figures


if __name__ == '__main__':
    extract_figures_from_pdf(PDF_PATH, OUTPUT_DIR)
