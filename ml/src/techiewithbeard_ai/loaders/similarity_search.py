import os
from pathlib import Path

for proxy_var in (
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "GRPC_PROXY",
    "FTP_PROXY",
    "RSYNC_PROXY",
    "DOCKER_HTTP_PROXY",
    "DOCKER_HTTPS_PROXY",
    "CLOUDSDK_PROXY_ADDRESS",
    "CLOUDSDK_PROXY_PORT",
    "CLOUDSDK_PROXY_TYPE",
    "http_proxy",
    "https_proxy",
    "all_proxy",
    "grpc_proxy",
    "ftp_proxy",
    "rsync_proxy",
    "SOCKS_PROXY",
    "socks_proxy",
):
    os.environ.pop(proxy_var, None)

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[3] / ".env")

from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings


def query_chroma(question: str, k: int = 5):
    embeddings = OllamaEmbeddings(
        model="embeddinggemma:latest",
        base_url="http://localhost:11434",
    )

    kwargs = {}
    api_key = os.getenv("CHROMA_API_KEY")
    tenant = os.getenv("CHROMA_TENANT")
    database = os.getenv("CHROMA_DATABASE")
    if api_key and tenant and database:
        kwargs = {
            "chroma_cloud_api_key": api_key,
            "tenant": tenant,
            "database": database,
        }

    vector_store = Chroma(
        collection_name="example_collection",
        embedding_function=embeddings,
        **kwargs,
    )

    docs = vector_store.similarity_search_with_score(question, k=k)
    print(f"Retrieved {len(docs)} document(s) for the query: '{question}'")
    for doc, score in docs:
        print(f"* [SIM={score:.3f}] {doc.page_content[:200]} ...")
        print(f"  metadata={doc.metadata}")
    return docs


if __name__ == "__main__":
    query_chroma("What is the name of candidate?", k=5)