
import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import faiss
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

import google.generativeai as genai


# =========================
# FASTAPI APP
# =========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# LOAD ENV VARIABLES
# =========================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini setup
genai.configure(api_key=GEMINI_API_KEY)

gemini_model = genai.GenerativeModel(
    "gemini-1.5-flash-latest"
)


# =========================
# LOAD EMBEDDING MODEL
# =========================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# =========================
# LOAD FAISS INDEX
# =========================

INDEX_PATH = "faiss_index.index"
TEXTS_PATH = "text_chunks.npy"

index = faiss.read_index(INDEX_PATH)

chunks = np.load(
    TEXTS_PATH,
    allow_pickle=True
)


# =========================
# REQUEST MODEL
# =========================

class Query(BaseModel):
    question: str


# =========================
# EMBEDDING FUNCTION
# =========================

def get_embedding(text):
    return embedding_model.encode(text).astype("float32")


# =========================
# VECTOR SEARCH
# =========================

def search(query, k=3):

    query_vector = get_embedding(query)

    distances, indices = index.search(
        np.array([query_vector]),
        k
    )

    return [chunks[i] for i in indices[0]]


# =========================
# CHAT ENDPOINT
# =========================

@app.post("/chat")
def chat(query: Query):

    context_chunks = search(query.question)

    context = " ".join(context_chunks)

    prompt = f"""
    You are Neha Yadav's AI portfolio assistant.

    Answer the question ONLY using the context below.

    If the answer is not available,
    say "I don't know based on the portfolio."

    CONTEXT:
    {context}

    QUESTION:
    {query.question}
    """

    response = gemini_model.generate_content(
        prompt
    )

    return {
        "answer": response.text,
        "context_used": context_chunks
    }
