import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[3] / ".env")

from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings


def get_chroma_connection_kwargs() -> dict:
    """Return cloud Chroma connection kwargs when the project environment is configured."""
    api_key = os.getenv("CHROMA_API_KEY")
    tenant = os.getenv("CHROMA_TENANT")
    database = os.getenv("CHROMA_DATABASE")

    if api_key and tenant and database:
        return {
            "chroma_cloud_api_key": api_key,
            "tenant": tenant,
            "database": database,
        }

    return {}


def get_ollama_embeddings(chunks: list[str]) -> OllamaEmbeddings:
    embeddings = OllamaEmbeddings(
        model="embeddinggemma:latest",
        base_url="http://localhost:11434",
    )

    embeds = embeddings.embed_documents(chunks)
    print(f"Embeddings for multiple texts: {embeds}")
    print(f"Number of embeddings returned: {len(embeds)}")
    print(f"Length of each embedding: {len(embeds[0])}")

    return embeddings


def get_cloud_chroma_store(collection_name: str = "example_collection") -> Chroma:
    embeddings = OllamaEmbeddings(
        model="embeddinggemma:latest",
        base_url="http://localhost:11434",
    )

    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        **get_chroma_connection_kwargs(),
    )


def upload_embeddings_to_chroma(
    embeddings: OllamaEmbeddings,
    texts: list[str],
    metadatas: list[dict],
    collection_name: str,
    ids: Optional[list[str]] = None,
):
    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        **get_chroma_connection_kwargs(),
    )
    vector_store.add_texts(texts=texts, metadatas=metadatas, ids=ids)
    print(f"Uploaded {len(texts)} embeddings to Chroma collection '{collection_name}'.")
    return vector_store


