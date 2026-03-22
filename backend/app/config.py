from pathlib import Path
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model_pro: str = "gemini-1.5-pro"
    gemini_model_flash: str = "gemini-1.5-flash"
    embedding_model: str = "gemini-embedding-001"
    chroma_persist_dir: str = str(BACKEND_DIR / "data" / "chromadb")
    top_k_retrieval: int = 5
    similarity_threshold: float = 0.72
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = str(BACKEND_DIR / ".env")


settings = Settings()
