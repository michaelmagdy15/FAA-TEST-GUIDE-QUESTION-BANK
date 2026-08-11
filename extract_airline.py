"""
Extract and organize Airline Basic Course Summary PDF into structured data.
"""

import fitz
import re
import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = 'PDFS/Airline Basic Course Summary.pdf'
OUTPUT_PATH = 'pilot-test-guide/src/data/airline_content.json'


def extract_full_text(pdf_path):
    """Extract all text from PDF."""
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        full_text += text + "\n"
    doc.close()
    return full_text


def organize_into_chapters(full_text):
    """Organize content into chapters based on the PDF structure."""
    
    # Define chapters based on the table of contents and content
    chapters = {
        "1": {
            "id": "1",
            "title": "Performance",
            "description": "Jet performance, takeoff speeds, climb, cruise, descent, and landing",
            "topics": []
        },
        "2": {
            "id": "2",
            "title": "Meteorology",
            "description": "Weather phenomena, atmospheric science, and weather services",
            "topics": []
        },
        "3": {
            "id": "3",
            "title": "Aerodynamics",
            "description": "High-speed aerodynamics, flight principles, and aircraft performance",
            "topics": []
        },
        "4": {
            "id": "4",
            "title": "Flight Controls",
            "description": "Primary and secondary flight controls, hydraulic and electronic systems",
            "topics": []
        },
        "5": {
            "id": "5",
            "title": "Instrument Navigation",
            "description": "Navigation systems, ILS, VOR, GPS, and inertial navigation",
            "topics": []
        },
        "6": {
            "id": "6",
            "title": "Weight and Balance",
            "description": "Aircraft weight management, center of gravity, and loading",
            "topics": []
        },
        "7": {
            "id": "7",
            "title": "Flight Planning",
            "description": "Route planning, fuel planning, and flight documentation",
            "topics": []
        },
        "8": {
            "id": "8",
            "title": "Jeppesen",
            "description": "Jeppesen charts, planning, and navigation materials",
            "topics": []
        },
        "9": {
            "id": "9",
            "title": "ATC",
            "description": "Air traffic control procedures, communications, and regulations",
            "topics": []
        },
        "10": {
            "id": "10",
            "title": "Propulsion System",
            "description": "Gas turbine engines, fuel systems, and engine operations",
            "topics": []
        }
    }
    
    # Parse content and organize into topics
    # Split by major sections
    sections = re.split(r'\n(?=[A-Z][A-Z\s]+(?:PAGE|Page))', full_text)
    
    current_chapter = None
    current_topic = None
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        # Detect chapter changes
        if 'PERFORMANCE' in section[:100] and 'PAGE' in section[:100]:
            current_chapter = "1"
        elif 'METEOROLOGY' in section[:100]:
            current_chapter = "2"
        elif 'AERODYNAMICS' in section[:100]:
            current_chapter = "3"
        elif 'FLIGHT CONTROLS' in section[:100]:
            current_chapter = "4"
        elif 'INSTRUMENT NAVIGATION' in section[:100] or 'NAVIGATION' in section[:100]:
            current_chapter = "5"
        elif 'WEIGHT AND BALANCE' in section[:100]:
            current_chapter = "6"
        elif 'FLIGHT PLANNING' in section[:100]:
            current_chapter = "7"
        elif 'JEPPESEN' in section[:100]:
            current_chapter = "8"
        elif 'ATC' in section[:100]:
            current_chapter = "9"
        elif 'PROPULSION' in section[:100]:
            current_chapter = "10"
        
        if current_chapter and len(section) > 50:
            # Extract key concepts
            concepts = extract_concepts(section)
            if concepts:
                chapters[current_chapter]["topics"].extend(concepts)
    
    return chapters


def extract_concepts(text):
    """Extract key concepts from text section."""
    concepts = []
    
    # Look for definitions and key terms
    lines = text.split('\n')
    current_concept = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Detect concept headers (usually uppercase or bold)
        if re.match(r'^[A-Z][A-Z\s]+$', line) and len(line) > 3:
            if current_concept and current_concept.get('content'):
                concepts.append(current_concept)
            current_concept = {
                'title': line.title(),
                'content': '',
                'key_points': []
            }
        elif current_concept and line:
            # Check if it's a key point (starts with number or bullet)
            if re.match(r'^\d+[\.\)]\s', line) or line.startswith('•'):
                current_concept['key_points'].append(line)
            else:
                current_concept['content'] += line + ' '
    
    if current_concept and current_concept.get('content'):
        concepts.append(current_concept)
    
    return concepts


def create_study_material(chapters):
    """Create structured study material from chapters."""
    
    study_material = {}
    
    for ch_id, chapter in chapters.items():
        study_material[ch_id] = {
            "id": ch_id,
            "title": chapter["title"],
            "description": chapter["description"],
            "sections": []
        }
        
        # Group topics into sections
        for topic in chapter["topics"]:
            if topic.get('title') and topic.get('content'):
                section = {
                    "title": topic["title"],
                    "content": topic["content"].strip(),
                    "key_points": topic.get("key_points", [])[:5]  # Limit to 5 key points
                }
                study_material[ch_id]["sections"].append(section)
    
    return study_material


def generate_questions(study_material):
    """Generate study questions from the material."""
    
    questions = []
    question_id = 1
    
    for ch_id, chapter in study_material.items():
        for section in chapter.get("sections", []):
            # Generate questions based on content
            if section.get("content") and len(section["content"]) > 50:
                # Create a question for each major concept
                words = section["content"].split()
                if len(words) > 20:
                    # Extract key term for question
                    key_term = section["title"]
                    
                    question = {
                        "id": f"airline-{ch_id}-{question_id:03d}",
                        "plt": f"ATP{question_id:03d}",
                        "category": chapter["title"],
                        "text": f"Regarding {key_term.lower()}, which statement is correct?",
                        "options": {
                            "A": f"{key_term} is an important concept in airline operations.",
                            "B": f"Understanding {key_term.lower()} is essential for flight safety.",
                            "C": f"Knowledge of {key_term.lower()} is required for airline pilots."
                        },
                        "correct": "A",
                        "explanation": section["content"][:200] + "..." if len(section["content"]) > 200 else section["content"],
                        "figureRef": None
                    }
                    questions.append(question)
                    question_id += 1
    
    return questions


def main():
    print("Extracting Airline Basic Course Summary...")
    full_text = extract_full_text(PDF_PATH)
    print(f"Extracted {len(full_text):,} characters")
    
    print("\nOrganizing into chapters...")
    chapters = organize_into_chapters(full_text)
    
    for ch_id, chapter in chapters.items():
        print(f"  Chapter {ch_id}: {chapter['title']} - {len(chapter['topics'])} topics")
    
    print("\nCreating study material...")
    study_material = create_study_material(chapters)
    
    # Save study material
    output = {
        "chapters": study_material,
        "metadata": {
            "source": "Airline Basic Course Summary",
            "total_chapters": len(study_material),
            "version": "1.0"
        }
    }
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Saved study material to {OUTPUT_PATH}")
    
    # Generate questions
    print("\nGenerating questions...")
    questions = generate_questions(study_material)
    print(f"Generated {len(questions)} questions")
    
    # Save questions
    questions_path = 'pilot-test-guide/src/data/airline_questions.json'
    with open(questions_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"Saved questions to {questions_path}")


if __name__ == '__main__':
    main()
