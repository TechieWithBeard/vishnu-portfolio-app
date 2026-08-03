import os
from pathlib import Path
from typing import Any
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_ollama import ChatOllama, OllamaEmbeddings

load_dotenv(dotenv_path=Path(__file__).resolve().parents[3] / ".env")


def get_vector_store(collection_name: str = "example_collection") -> Chroma:
    """Return the configured cloud-backed Chroma vector store for the ML app."""
    embeddings = OllamaEmbeddings(
        model="embeddinggemma:latest",
        base_url="http://localhost:11434",
    )

    api_key = os.getenv("CHROMA_API_KEY")
    tenant = os.getenv("CHROMA_TENANT")
    database = os.getenv("CHROMA_DATABASE")
    
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        chroma_cloud_api_key=api_key,
        tenant=tenant,
        database=database,
    )


def _collection_count(vector_store: Any) -> int:
    """Return the number of indexed records using the Chroma API supported in this runtime."""
    if hasattr(vector_store, "count"):
        return int(vector_store.count())

    collection = getattr(vector_store, "_collection", None)
    if collection is not None and hasattr(collection, "count"):
        return int(collection.count())

    try:
        return len(vector_store.get()["documents"])
    except Exception:
        return 0


def _get_relevant_docs(question: str, k: int = 5) -> list[tuple[Any, float]]:
    vector_store = get_vector_store()
    if _collection_count(vector_store) == 0:
        return []
    return vector_store.similarity_search_with_score(question, k=k)


def _build_rag_answer(question: str, docs: list[tuple[Any, float]]) -> str:
    if not docs:
        return "No matching data found in the vector store. Please index the PDF content first."

    context = "\n\n".join(
        f"Document {index}:\n{doc.page_content}\nMetadata: {doc.metadata}"
        for index, (doc, _) in enumerate(docs, start=1)
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are answering from the retrieved document context. Be concise, grounded in the provided context, and say 'I couldn't find it in the retrieved context' if the answer is not present.",
            ),
            (
                "human",
                "Question: {question}\n\nContext:\n{context}",
            ),
        ]
    )

    def _invoke_llm(prompt_value: Any) -> str:
        try:
            llm = ChatOllama(
                model="gemma4:e4b",
                base_url="http://localhost:11434",
                temperature=0.0,
            )
            return str(llm.invoke(prompt_value))
        except Exception:
            return f"Answering from context: {question}"

    return (prompt | RunnableLambda(_invoke_llm) | StrOutputParser()).invoke(
        {
            "question": question,
            "context": context,
        }
    )


def build_rag_chain():
    """Return a reusable chain that checks the vector store and answers from retrieved context."""
    
    def retrieve_documents(payload: dict[str, Any]) -> dict[str, Any]:
        question = payload["query"]
        docs = _get_relevant_docs(question)
        return {
            "query": question,
            "retrieved_documents": docs,
        }

    def finalize_answer(payload: dict[str, Any]) -> dict[str, Any]:
        question = payload["query"]
        docs = payload["retrieved_documents"]
        answer = _build_rag_answer(question, docs)
        return {
            "query": question,
            "retrieved_documents": docs,
            "answer": answer,
        }

    return RunnableLambda(retrieve_documents) | RunnableLambda(finalize_answer)


def build_rag_agent():
    """Return an agent-style wrapper that fails gracefully when no vector data exists."""

    def agent(payload: dict[str, Any]) -> dict[str, Any]:
        question = payload["query"]
        vector_store = get_vector_store()

        if _collection_count(vector_store) == 0:
            return {
                "query": question,
                "status": "no_data",
                "answer": "No matching data found in the vector store. Index a PDF first before asking questions.",
                "retrieved_documents": [],
            }

        docs = vector_store.similarity_search_with_score(question, k=5)
        return {
            "query": question,
            "status": "ok",
            "answer": _build_rag_answer(question, docs),
            "retrieved_documents": docs,
        }

    return RunnableLambda(agent)
