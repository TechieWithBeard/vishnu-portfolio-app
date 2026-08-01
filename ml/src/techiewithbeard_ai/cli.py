import typer

from .config import get_settings
from .chains.echo_chain import build_echo_chain

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


if __name__ == "__main__":
    app()
