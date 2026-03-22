from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import elements, missions, keywords, chat, spawn, session

app = FastAPI(
    title="Hardwar Companion API",
    version="0.1.0",
    description="Backend API for the Hardwar Companion App",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(elements.router, prefix="/api")
app.include_router(missions.router, prefix="/api")
app.include_router(keywords.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(spawn.router, prefix="/api")
app.include_router(session.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
