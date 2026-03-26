from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.config.db import get_db
from app.models.test_run_model import TestRun
from app.models.project_model import Project
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])


@router.get("/")
def get_compliance(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 🔒 user projects
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    project_ids = [p.id for p in projects]

    runs = db.query(TestRun).filter(
        TestRun.project_id.in_(project_ids)
    ).all()

    total = len(runs)

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

    # ✅ counts
    passed = len([r for r in runs if r.status == "Passed"])
    failed = len([r for r in runs if r.status == "Failed"])
    running = len([r for r in runs if r.status == "Running"])

    coverage = (passed / total) * 100

    # ✅ overall status
    if failed > 0:
        overall_status = "FAIL"
    elif running > 0:
        overall_status = "RUNNING"
    elif coverage == 100:
        overall_status = "PASS"
    else:
        overall_status = "PENDING"

    # ✅ section breakdown (by project)
    sections = []

    for p in projects:
        proj_runs = [r for r in runs if r.project_id == p.id]

        if not proj_runs:
            continue

        total_sec = len(proj_runs)
        passed_sec = len([r for r in proj_runs if r.status == "Passed"])
        failed_sec = len([r for r in proj_runs if r.status == "Failed"])

        sec_coverage = (passed_sec / total_sec) * 100 if total_sec else 0

        if failed_sec > 0:
            status = "FAIL"
        elif sec_coverage == 100:
            status = "PASS"
        else:
            status = "PENDING"

        sections.append({
            "name": p.name,   # ✅ better than "Project 1"
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