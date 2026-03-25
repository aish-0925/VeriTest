from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.db import Base, engine
from app.routes.auth_routes import router as auth_router
from app.routes.requirement_routes import router as requirement_router

#  ADD THESE IMPORTS
from app.routes.dashboard_routes import router as dashboard_router

#   Import models so SQLAlchemy knows them
from app.models.user_model import User
from app.models.project_model import Project
from app.models.execution_model import Execution, ExecutionResult

app = FastAPI()

#  CORS CONFIG
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (safe even if already exist)
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth_router)

#  ADD THIS
app.include_router(dashboard_router)

app.include_router(requirement_router)


@app.get("/")
def home():
    return {"message": "VeriTest Backend Running"}