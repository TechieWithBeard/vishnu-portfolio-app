import typer

from .chains.echo_chain import build_echo_chain
from .chains.rag_chain import build_rag_chain
from .config import get_settings

app = typer.Typer(help="Techie With Beard AI lab commands.")


@app.command()
def doctor() -> None:
    """Print the active AI lab configuration without secrets."""
    settings = get_settings()
    typer.echo("AI lab ready")
    typer.echo(f"provider: {settings.model_provider}")
    typer.echo(f"model: {settings.model_name}")
    typer.echo(f"temperature: {settings.temperature}")
    typer.echo(f"openai key configured: {bool(settings.openai_api_key)}")


@app.command()
def echo(topic: str = typer.Argument("LangChain portfolio demo")) -> None:
    """Run a local no-API LangChain prompt pipeline."""
    chain = build_echo_chain()
    typer.echo(chain.invoke({"topic": topic}))


@app.command()
def rag(query: str = typer.Argument("What is the name of the candidate?")) -> None:
    """Run the local vectorstore-aware RAG chain and print the retrieved answer."""
    chain = build_rag_chain()
    typer.echo(chain.invoke({"query": query}))


if __name__ == "__main__":
    app()
