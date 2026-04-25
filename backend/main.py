from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.machines import router as machines_router
from routes.services import router as services_router
from routes.parts import router as parts_router
from routes.tasks import router as tasks_router
from routes.stats import router as stats_router

app = FastAPI(
    title="Service Lab API",
    description="Backend para gerenciamento de equipamentos, serviços, peças e tarefas do Service Lab.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(machines_router)
app.include_router(services_router)
app.include_router(parts_router)
app.include_router(tasks_router)
app.include_router(stats_router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Service Lab API está no ar."}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
