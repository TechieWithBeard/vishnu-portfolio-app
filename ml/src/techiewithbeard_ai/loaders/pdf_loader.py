import argparse
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader

load_dotenv()


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
        print(f"Document {i+1} Content Preview: {doc}")
        # print(f"Metadata: {doc.metadata}")

    return documents


if __name__ == "__main__":
    main()
