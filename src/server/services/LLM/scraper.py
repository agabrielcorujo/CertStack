import requests
from bs4 import BeautifulSoup
import re

url = "" #url to scrape 
file_path = "LLM_Data/{filename}"

response = requests.get(url)
html = response.text

soup = BeautifulSoup(html, "html.parser")

text = soup.get_text()

# remove tabs
text = text.replace("\t", "")

# collapse multiple newlines into just one
clean_text = re.sub(r'\n+', '\n', text)

# remove trailing/leading whitespace
clean_text = clean_text.strip()

with open(file_path,"w") as f:
    f.write(clean_text)