from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from datetime import datetime

from app.config.db import SessionLocal
from app.models.execution_model import Execution, ExecutionResult
from app.models.project_model import Project
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------
# 📊 COMPLIANCE API
# --------------------------------------------------
@router.get("/")
def get_compliance(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get user projects
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    project_ids = [p.id for p in projects]

    executions = db.query(Execution).filter(
        Execution.project_id.in_(project_ids)
    ).all()

    execution_ids = [e.id for e in executions]

    results = db.query(ExecutionResult).filter(
        ExecutionResult.execution_id.in_(execution_ids)
    ).all()

    total = len(results)

    if total == 0:
        return {
            "coveragePct": 0,
            "overallStatus": "PENDING",
            "passed": 0,
            "failed": 0,
            "errors": 0,
            "generatedAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "sections": []
        }

    # Counts
    passed = len([r for r in results if r.status == "PASS"])
    failed = len([r for r in results if r.status == "FAIL"])

    coverage = (passed / total) * 100

    # Overall status
    if failed > 0:
        overall_status = "FAIL"
    elif coverage == 100:
        overall_status = "PASS"
    else:
        overall_status = "PENDING"

    # Section breakdown (by project)
    section_map = defaultdict(lambda: {"total": 0, "passed": 0, "failed": 0})

    for r in results:
        execution = next((e for e in executions if e.id == r.execution_id), None)
        if not execution:
            continue

        key = f"Project {execution.project_id}"

        section_map[key]["total"] += 1

        if r.status == "PASS":
            section_map[key]["passed"] += 1
        elif r.status == "FAIL":
            section_map[key]["failed"] += 1

    sections = []

    for name, sec in section_map.items():
        total_sec = sec["total"]
        passed_sec = sec["passed"]

        sec_coverage = (passed_sec / total_sec) * 100 if total_sec else 0

        if sec["failed"] > 0:
            status = "FAIL"
        elif sec_coverage == 100:
            status = "PASS"
        else:
            status = "PENDING"

        sections.append({
            "name": name,
            "coverage": round(sec_coverage),
            "status": status
        })

    return {
        "coveragePct": round(coverage),
        "overallStatus": overall_status,
        "passed": passed,
        "failed": failed,
        "errors": 0,
        "generatedAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "sections": sections
    }