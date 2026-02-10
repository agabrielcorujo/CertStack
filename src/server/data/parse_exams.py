import requests
import json
import re
from typing import List, Dict, Any

def fetch_exam_markdown(exam_number: int) -> str:
    """Fetch the raw markdown content for a specific exam."""
    url = f"https://raw.githubusercontent.com/kananinirav/AWS-Certified-Cloud-Practitioner-Notes/master/practice-exam/practice-exam-{exam_number}.md"
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def parse_exam(markdown_content: str) -> Dict[str, Any]:
    """Parse markdown content and extract questions with answers."""
    questions = {}
    
    # Split content by numbered questions (1. 2. 3. etc at start of line)
    # Match pattern like "1. Question text" or just number followed by period and space
    parts = re.split(r'\n(\d+)\.\s+', markdown_content)
    
    # Process pairs of (question_number, content)
    for i in range(1, len(parts), 2):
        if i+1 >= len(parts):
            break
            
        question_num = parts[i]
        content = parts[i+1]
        
        # Extract question text (everything before the first choice)
        lines = content.split('\n')
        question_text = ""
        choices = []
        answer = None
        
        in_choices = False
        for line in lines:
            line_stripped = line.strip()
            
            # Skip empty lines
            if not line_stripped:
                continue
            
            # Check for answer in details block
            if 'Correct answer:' in line:
                answer_match = re.search(r'Correct answer:\s*([A-E,\s]+)', line)
                if answer_match:
                    answer_text = answer_match.group(1).strip()
                    # Split by comma and/or space
                    answer = [a.strip() for a in re.split(r'[,\s]+', answer_text) if a.strip() and a.strip() in ['A', 'B', 'C', 'D', 'E']]
                continue
            
            # Skip details tags and other markup
            if '<details' in line_stripped or '</details>' in line_stripped or '<summary' in line_stripped or '</summary>' in line_stripped:
                continue
            
            # Check for choice (starts with - A. or - B. etc)
            choice_match = re.match(r'^-\s+([A-E])\.\s*(.+)', line_stripped)
            if choice_match:
                in_choices = True
                letter = choice_match.group(1)
                text = choice_match.group(2).strip()
                choices.append(f"{letter}. {text}")
                continue
            
            # If we haven't hit choices yet, it's part of the question
            if not in_choices and not line_stripped.startswith('#') and not line_stripped.startswith('---'):
                question_text += " " + line_stripped
        
        question_text = question_text.strip()
        
        # Create question entry if we have valid data
        if question_text and choices and answer:
            # Determine if multi-select
            is_multi = len(answer) > 1
            
            # Format answer
            final_answer = answer if is_multi else answer[0]
            
            questions[f"question_{question_num}"] = {
                "question_number": int(question_num),
                "question": question_text,
                "choices": choices,
                "answer": final_answer,
                "is_multi_select": is_multi,
                "category": "Cloud Concepts",
                "tags": ["AWS", "Cloud Practitioner"],
                "difficulty": 2
            }
    
    return questions

def main():
    """Main function to fetch and parse all exams."""
    for exam_num in range(1, 11):
        print(f"Processing Exam {exam_num}...")
        
        try:
            # Fetch markdown content
            markdown = fetch_exam_markdown(exam_num)
            
            # Parse questions
            questions = parse_exam(markdown)
            
            # Save to JSON file
            output_file = f"aws_practice_exam_{exam_num}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ Created {output_file} with {len(questions)} questions")
            
        except Exception as e:
            print(f"  ✗ Error processing Exam {exam_num}: {str(e)}")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
