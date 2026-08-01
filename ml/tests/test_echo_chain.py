from techiewithbeard_ai.chains.echo_chain import build_echo_chain


def test_echo_chain_returns_demo_title():
    chain = build_echo_chain()

    result = chain.invoke({"topic": "RAG chat"})

    assert result == "AI Demo: RAG chat"
