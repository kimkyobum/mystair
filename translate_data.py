import json
import re

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will just print the file so I can see what I'm dealing with.
    print(filename, len(content))

process_file('src/data/mbtiData.ts')
process_file('src/data/hollandData.ts')
