import os
from dotenv import load_dotenv
import faiss
import numpy as np
from huggingface_hub import InferenceClient

load_dotenv()

DATA_PATH = "data/info.txt"
INDEX_PATH = "faiss_index.index"
TEXTS_PATH = "text_chunks.npy"
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HF_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

if not HF_API_TOKEN:
    raise ValueError("HUGGINGFACE_API_TOKEN is required in .env")

hf_client = InferenceClient(token=HF_API_TOKEN)

# Step 1: Read file
with open(DATA_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# Step 2: Split text (simple chunking)
def chunk_text(text, chunk_size=300):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunks.append(" ".join(words[i:i+chunk_size]))
    return chunks

chunks = chunk_text(text)

# Step 3: Create embeddings
def get_embedding(text):
    features = hf_client.feature_extraction(text, model=HF_EMBEDDING_MODEL)
    return np.array(features, dtype="float32")

embeddings = [get_embedding(chunk) for chunk in chunks]

# Convert to numpy
embedding_matrix = np.array(embeddings).astype("float32")

# Step 4: FAISS index
dimension = embedding_matrix.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embedding_matrix)

# Save index and chunks
faiss.write_index(index, INDEX_PATH)
np.save(TEXTS_PATH, chunks)

print("✅ Ingestion complete!")