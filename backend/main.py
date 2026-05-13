import os
from fastapi import FastAPI
from pydantic import BaseModel
import faiss
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from google import genai                          # ✅ new package
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# ✅ New client-based setup
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.0-flash"               # ✅ current model

model = SentenceTransformer('all-MiniLM-L6-v2')

INDEX_PATH = "faiss_index.index"
TEXTS_PATH = "text_chunks.npy"

index = faiss.read_index(INDEX_PATH)
chunks = np.load(TEXTS_PATH, allow_pickle=True)

class Query(BaseModel):
    question: str

def get_embedding(text):
    return model.encode(text).astype("float32")

def search(query, k=3):
    query_vector = get_embedding(query)
    distances, indices = index.search(np.array([query_vector]), k)
    return [chunks[i] for i in indices[0]]

@app.post("/chat")
def chat(query: Query):
    context_chunks = search(query.question)
    context = " ".join(context_chunks)
    prompt = f"""
    Answer the question ONLY using the context below.
    If the answer is not in the context, say "I don't know".

    Context:
    {context}

    Question:
    {query.question}
    """
    # ✅ New API call style
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return {
        "answer": response.text,
        "context_used": context_chunks
    }