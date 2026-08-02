from techiewithbeard_ai.chains.rag_chain import build_rag_chain, build_rag_agent


class FakeStore:
    def __init__(self, count: int = 2):
        self._count = count

    def count(self) -> int:
        return self._count

    def similarity_search_with_score(self, question: str, k: int = 5):
        return [
            (type("Doc", (), {"page_content": "doc content", "metadata": {"source": "pdf"}})(), 0.1),
        ]


def test_build_rag_chain_returns_retrieval_payload(monkeypatch):
    monkeypatch.setattr(
        "techiewithbeard_ai.chains.rag_chain.get_vector_store",
        lambda collection_name="example_collection": FakeStore(count=2),
    )
    monkeypatch.setattr(
        "techiewithbeard_ai.chains.rag_chain.ChatOllama",
        lambda *args, **kwargs: type("LLM", (), {"invoke": lambda self, messages: "answer"})(),
    )

    chain = build_rag_chain()
    result = chain.invoke({"query": "What is the candidate name?"})

    assert result["query"] == "What is the candidate name?"
    assert result["answer"] == "answer"
    assert len(result["retrieved_documents"]) == 1


def test_build_rag_agent_returns_fallback_when_store_empty(monkeypatch):
    monkeypatch.setattr(
        "techiewithbeard_ai.chains.rag_chain.get_vector_store",
        lambda collection_name="example_collection": FakeStore(count=0),
    )

    agent = build_rag_agent()
    result = agent.invoke({"query": "What is the candidate name?"})

    assert result["query"] == "What is the candidate name?"
    assert result["status"] == "no_data"
    assert "No matching data" in result["answer"]
