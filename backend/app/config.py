from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_cloud_project: str = ""
    google_application_credentials: str = ""
    gemini_model_pro: str = "gemini-1.5-pro"
    gemini_model_flash: str = "gemini-1.5-flash"
    embedding_model: str = "text-embedding-004"
    chroma_persist_dir: str = "./data/chromadb"
    top_k_retrieval: int = 5
    similarity_threshold: float = 0.72
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
