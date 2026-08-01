# Techie With Beard AI Lab

Python workspace for ML, LangChain, RAG, agents, and AI interface prototypes that can later be surfaced in the portfolio demo hub.

## Setup

```bash
cd /Users/techiewithbeard/Downloads/vishnu-portfolio/vishnu-portfolio-app/ml
python3 -m venv .venv
source .venv/bin/activate
pip install ".[dev]"
cp .env.example .env
```

Add provider keys in `.env` only when needed.

## Run

```bash
python -m techiewithbeard_ai
pytest
```

Run a PDF loader module:

```bash
python -m techiewithbeard_ai.loaders.pdf_loader artifacts/your-file.pdf
```

## Structure

```text
ml/
├── src/techiewithbeard_ai/  # Reusable AI/LangChain code
├── tests/                   # Unit tests
├── notebooks/               # Exploration notebooks
├── data/                    # Local datasets, ignored by git
├── artifacts/               # Vector stores, outputs, ignored by git
├── .env.example             # Safe config template
└── pyproject.toml           # Python package + dependencies
```

## Next Ideas

- Add a document loader and splitter for a portfolio/resume RAG demo.
- Add vector store support with Chroma or FAISS.
- Add a Streamlit app for quick UI demos.
- Add a FastAPI endpoint that the Angular portfolio can call.
