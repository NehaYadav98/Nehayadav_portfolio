import os
from fastapi import FastAPI
from pydantic import BaseModel
import faiss
import numpy as np
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
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
MODEL_NAME = "openai/gpt-oss-20b"              # ✅ current model
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HF_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

if not HF_API_TOKEN:
    raise ValueError("HUGGINGFACE_API_TOKEN is required in .env")

hf_client = InferenceClient(token=HF_API_TOKEN)

INDEX_PATH = "faiss_index.index"
TEXTS_PATH = "text_chunks.npy"

index = faiss.read_index(INDEX_PATH)
chunks = np.load(TEXTS_PATH, allow_pickle=True)
client = Groq()

class Query(BaseModel):
    question: str

def get_embedding(text):
    features = hf_client.feature_extraction(text, model=HF_EMBEDDING_MODEL)
    return np.array(features, dtype="float32")

def search(query, k=3):
    query_vector = get_embedding(query)
    distances, indices = index.search(np.array([query_vector]), k)
    return [chunks[i] for i in indices[0]]

@app.post("/chat")
def chat(query: Query):
    # 1. Retrieve relevant chunks from your vector database
    context_chunks = search(query.question)

    # 2. Combine the retrieved chunks
    context = " ".join(context_chunks)

    # 3. Create the RAG prompt
    prompt = f"""
Answer the question ONLY using the context below.
If the answer is not in the context, say "I don't know".

Context:
{context}

Question:
{query.question}
"""

    # 4. Send the prompt + context to the new model
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    # 5. Get the model's answer
    answer = completion.choices[0].message.content

    return answer
