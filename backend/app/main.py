from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.db import Base, engine

# Routes
from app.routes.auth_routes import router as auth_router
from app.routes.requirement_routes import router as requirement_router
from app.routes.generate_routes import router as generate_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.test_run_routes import router as test_run_router
from app.routes.compliance_routes import router as compliance_router
from app.routes.project_routes import router as project_router

# Import models (IMPORTANT for table creation)
from app.models.user_model import User
from app.models.project_model import Project
from app.models.requirement_model import Requirement
from app.models.execution_model import Execution, ExecutionResult
from app.models.test_run_model import TestRun   #  ADD THIS


#  Initialize app
app = FastAPI(
    title="VeriTest API",
    version="1.0.0"
)

# --------------------------------------------------
#  CORS CONFIG
# --------------------------------------------------
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

# --------------------------------------------------
#  Create tables
# --------------------------------------------------
Base.metadata.create_all(bind=engine)

# --------------------------------------------------
#  Include routes
# --------------------------------------------------
#  FIXED VERSION
app.include_router(auth_router)
app.include_router(dashboard_router, prefix="/api")
app.include_router(requirement_router, prefix="/api")
app.include_router(generate_router, prefix="/api")
app.include_router(test_run_router, prefix="/api")
app.include_router(compliance_router, prefix="/api")
app.include_router(project_router, prefix="/api")

# --------------------------------------------------
#  Root route
# --------------------------------------------------
@app.get("/")
def home():
    return {
        "message": " VeriTest Backend Running",
        "status": "OK"
    }
