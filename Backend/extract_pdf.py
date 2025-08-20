import fitz 
from PIL import Image
import io
import os
import re
import json

def parse_pdf(file_input):
    all_text = []
    
    try:
        doc = fitz.open(file_input)
        
        # Extract normal text
        for page_num, page in enumerate(doc):
            text = page.get_text()
            all_text.append(f"\n--- Page {page_num + 1}---\n{text}")
    
        doc.close()
        return "\n".join(all_text)
        
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")
    
def parse_pdf_questions(raw_text):
    questions = []
    page_pattern = re.compile(r"--- Page (\d+)---")
    qnum_pattern = re.compile(r"^(\d+)\.\u200b?(.*)")
    ans_pattern = re.compile(r"Ans:\s*([A-D])")
    
    lines = raw_text.splitlines()
    current_page = None
    next_page = None
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Detect page number
        page_match = page_pattern.match(line)
        if page_match:
            current_page = int(page_match.group(1))
            i += 1
            continue
        # Detect question start
        qnum_match = qnum_pattern.match(line)
        if qnum_match:
            start_page = current_page
            qnum = qnum_match.group(1)
            question_text = qnum_match.group(2).strip()
            options = []
            correct_option = None
            i += 1
            # Collect question text and options
            while i < len(lines):
                l = lines[i].strip()
                # Option line
                if re.match(r"^[A-D]\s*–", l):
                    options.append(l)
                # Answer line
                ans_match = ans_pattern.match(l)
                if ans_match:
                    correct_option = ans_match.group(1)
                    i += 1
                    break
                # Next question or page
                if page_pattern.match(l) or qnum_pattern.match(l):
                    break
                # Add to question text if not option or answer or Ref
                if not l.startswith("Ref:") and not re.match(r"^[A-D]\s*–", l) and not ans_pattern.match(l):
                    if l:
                        question_text += " " + l
                i += 1
            # Find end page (look ahead for next page marker)
            end_page = start_page
            for j in range(i, len(lines)):
                if page_pattern.match(lines[j].strip()):
                    end_page = int(page_pattern.match(lines[j].strip()).group(1))
                    break
            questions.append({
                "question": question_text.strip(),
                "options": options,
                "correct_option": correct_option,
                "start_page": start_page,
                "end_page": end_page
            })
        else:
            i += 1
    return questions


def save_questions_to_json(questions, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=4)


def extract():
    save_questions_to_json(parse_pdf_questions(parse_pdf("ref.pdf")), "sample.json")