from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.db import SessionLocal
from app.models.execution_model import Execution, ExecutionResult
from app.models.project_model import Project
from app.utils.dependencies import get_current_user
from collections import defaultdict
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    # 🔐 Get user projects
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    project_ids = [p.id for p in projects]

    executions = db.query(Execution).filter(
        Execution.project_id.in_(project_ids)
    ).all()

    execution_ids = [e.id for e in executions]

    results = db.query(ExecutionResult).filter(
        ExecutionResult.execution_id.in_(execution_ids)
    ).all()

    # ------------------------
    # 📊 STATS
    # ------------------------

    total_tests = len(results)
    passed = len([r for r in results if r.status == "PASS"])
    failed = len([r for r in results if r.status == "FAIL"])

    pass_rate = (passed / total_tests * 100) if total_tests else 0
    active_runs = len([e for e in executions if e.status == "RUNNING"])

    stats = {
        "coverage": round(pass_rate, 2),
        "totalTests": total_tests,
        "passRate": round(pass_rate, 2),
        "activeRuns": active_runs
    }

    # ------------------------
    # 📈 HISTORY (GROUP BY DATE)
    # ------------------------

    history_map = defaultdict(lambda: {"passed": 0, "failed": 0})

    for r in results:
        date = r.id  # fallback if no timestamp
        key = str(date)

        if r.status == "PASS":
            history_map[key]["passed"] += 1
        elif r.status == "FAIL":
            history_map[key]["failed"] += 1

    history = []

    for k, v in history_map.items():
        total = v["passed"] + v["failed"]
        coverage = (v["passed"] / total * 100) if total else 0

        history.append({
            "date": k,
            "passed": v["passed"],
            "failed": v["failed"],
            "coverage": round(coverage, 2)
        })

    # ------------------------
    # 🧪 RECENT RUNS
    # ------------------------

    runs = []

    for e in executions[-5:]:
        run_results = [r for r in results if r.execution_id == e.id]

        total = len(run_results)
        passed = len([r for r in run_results if r.status == "PASS"])

        coverage = (passed / total * 100) if total else 0

        runs.append({
            "id": f"RUN-{e.id}",
            "script": "auto_test.py",  # can improve later
            "reqId": f"REQ-{e.project_id}",
            "status": e.status,
            "coverage": round(coverage),
            "duration": "2s"  # improve later
        })

    runs = list(reversed(runs))

    return {
        "stats": stats,
        "history": history,
        "runs": runs
    }