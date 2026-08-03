"""AI lab package for LangChain, RAG, and agent experiments."""

from .config import Settings
from techiewithbeard_ai.utils.environment import clear_proxy_env

clear_proxy_env()

__all__ = ["Settings"]
