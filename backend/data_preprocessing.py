import re
import pandas as pd

def clean(text):
    if pd.isna(text):
        return ''
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    text = re.sub(r'[^\w\s\.\,\?\!]', ' ', text) # Remove special characters except for punctuation
    text = text.lower()
    text = text.strip()  # Remove leading and trailing spaces
    return text

def chunking(text):
    chunk_size = 500
    overlap = 50
    words = text.split()
    chunks = []
    for i in range(0,len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def preprocess():
    df = pd.read_csv('data/data.csv')
    documents = []

    for _,row in df.iterrows():
        context = clean(row['Context'])
        response = clean(row['Response'])

        data = f"Question: {context}\nAnswer: {response}" #This needs to be vectorized

        chunks = chunking(data)

        for chunk in chunks:
            document = {
                'context': context,
                'response': response,
                'data': chunk,
                'metadata': {
                    'original_context': row['Context'],
                    'response': len(documents)
                }
            }
            documents.append(document)

    return documents

#print(preprocess())
