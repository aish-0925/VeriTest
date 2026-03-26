from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from datetime import datetime

from app.config.db import SessionLocal
from app.models.execution_model import Execution, ExecutionResult
from app.models.project_model import Project
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # ------------------------
    # USER PROJECTS
    # ------------------------
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
    # STATS
    # ------------------------
    total_tests = len(results)
    passed = sum(1 for r in results if r.status == "PASS")
    failed = sum(1 for r in results if r.status == "FAIL")

    pass_rate = (passed / total_tests * 100) if total_tests else 0
    active_runs = sum(1 for e in executions if e.status == "RUNNING")

    stats = {
        "coverage": round(pass_rate, 2),
        "totalTests": total_tests,
        "passRate": round(pass_rate, 2),
        "activeRuns": active_runs
    }

    # ------------------------
    # HISTORY (FIXED)
    # ------------------------
    history_map = defaultdict(lambda: {"passed": 0, "failed": 0})

    for r in results:
        #  use timestamp if exists
        if hasattr(r, "created_at") and r.created_at:
            key = r.created_at.strftime("%Y-%m-%d")
        else:
            key = "unknown"

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

    #  sort by date
    history.sort(key=lambda x: x["date"])

    # ------------------------
    # RECENT RUNS (OPTIMIZED)
    # ------------------------
    result_map = defaultdict(list)

    for r in results:
        result_map[r.execution_id].append(r)

    runs = []

    for e in executions[-5:]:
        run_results = result_map.get(e.id, [])

        total = len(run_results)
        passed = sum(1 for r in run_results if r.status == "PASS")

        coverage = (passed / total * 100) if total else 0

        runs.append({
            "id": f"RUN-{e.id}",
            "script": getattr(e, "script_name", "auto_test.py"),
            "reqId": f"REQ-{e.project_id}",
            "status": e.status,
            "coverage": round(coverage),
            "duration": getattr(e, "duration", "2s")
        })

    runs.reverse()

    # ------------------------
    # FINAL RESPONSE
    # ------------------------
    return {
        "stats": stats,
        "history": history,
        "runs": runs
    }
