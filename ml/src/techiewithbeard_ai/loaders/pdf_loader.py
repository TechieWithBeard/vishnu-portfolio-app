import argparse
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv(dotenv_path=Path(__file__).resolve().parents[3] / ".env")

from techiewithbeard_ai.retrievers.embeddings import get_ollama_embeddings, upload_embeddings_to_chroma
import uuid


def main() -> None:
    parser = argparse.ArgumentParser(description="Load a PDF with LangChain's PyPDFLoader.")
    parser.add_argument("file_path", help="Path to the PDF file to load.")
    args = parser.parse_args()
    documents = pdf_loader(args.file_path)
    print(f"Loaded {len(documents)} document page(s).")


def pdf_loader(file_path: str) -> list[Document]:
    """Load a PDF file and return a list of Document objects."""
    path = Path(file_path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {path}")

    loader = PyPDFLoader(file_path)
    documents = loader.load()
    for i, doc in enumerate(documents):
        doc.metadata["source"] = f"{path} - page {i + 1}"
        # print(f"Document {i+1} Content Preview: {doc}")
        # print(f"Metadata: {doc.metadata}")
        recursive_splitter(doc.page_content,doc.metadata["source"])  # Call the recursive_splitter function to split the content

    return documents

def recursive_splitter(text: str,metadata: str) -> None:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_text(text)
    # add id in each chunk along with the metadata
    chunk_records = []
    for i, chunk in enumerate(chunks):
        chunk_id = str(uuid.uuid4())
        chunk_records.append(
            {
                "chunk_id": chunk_id,
                "chunk_index": i,
                "chunk_size": len(chunk),
                "source": metadata,
            }
        )
        # print(f"Chunk {i+1} Content Preview: {chunk[:200]}...")
        # print(f"Metadata: {chunk_metadata}")
    # print(f"chunk data: {(text)} chars")
    # print(f"Original length: {len(text)} chars")
    # print(f"Number of chunks: {len(chunks)}")
    # print(f"Chunk sizes: {[len(c) for c in chunks]}")
    # print(f"\nFirst chunk preview:\n{chunks[0][:200]}...")
    embeddings=get_ollama_embeddings(chunks)
    upload_embeddings_to_chroma(
        embeddings=embeddings,
        texts=chunks,
        metadatas=chunk_records,
        ids=[record["chunk_id"] for record in chunk_records],
        collection_name="example_collection",
    )

if __name__ == "__main__":
    main()
