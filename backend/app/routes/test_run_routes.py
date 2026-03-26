from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import time
import json

from app.config.db import get_db
from app.models.test_run_model import TestRun
from app.models.requirement_model import Requirement
from app.utils.dependencies import get_current_user
from app.models.project_model import Project
from app.models.execution_model import Execution, ExecutionResult

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

router = APIRouter(
    prefix="/test-runs",
    tags=["Test Runs"]
)

# --------------------------------------------------
#  RUN TEST
# --------------------------------------------------
@router.post("/run/{requirement_id}")
def run_test(requirement_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    requirement = db.query(Requirement).filter(
        Requirement.id == requirement_id
    ).first()

    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    start_time = time.time()

    #  CREATE EXECUTION
    execution = Execution(
        project_id=requirement.project_id,
        status="RUNNING",
        started_at=datetime.utcnow()
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        driver.get(requirement.url)
        time.sleep(2)

        #  CHECK RESULT
        if requirement.expected_text:
            body = driver.find_element(By.TAG_NAME, "body").text

            if requirement.expected_text in body:
                status = "PASS"
            else:
                status = "FAIL"
        else:
            status = "PASS"

        driver.quit()

    except Exception as e:
        status = "FAIL"

    end_time = time.time()
    duration_seconds = end_time - start_time

    #  INSERT RESULT
    result = ExecutionResult(
        execution_id=execution.id,
        testcase_id=1,
        status=status,
        duration=duration_seconds
    )
    db.add(result)

    #  UPDATE EXECUTION
    execution.status = status
    execution.ended_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Test executed successfully",
        "execution_id": execution.id,
        "status": status
    }

# --------------------------------------------------
#  GET ALL TEST RUNS
# --------------------------------------------------
@router.get("/")
def get_all_test_runs(db: Session = Depends(get_db), user=Depends(get_current_user)):

    executions = db.query(Execution)\
        .join(Project)\
        .filter(Project.user_id == user.id)\
        .order_by(Execution.id.desc())\
        .all()

    data = []

    for e in executions:
        # get results
        results = db.query(ExecutionResult).filter(
            ExecutionResult.execution_id == e.id
        ).all()

        total = len(results)
        passed = sum(1 for r in results if r.status == "PASS")

        coverage = int((passed / total) * 100) if total else 0

        data.append({
            "id": f"RUN-{e.id}",
            "script_name": "auto_test.py",
            "requirement": f"REQ-{e.project_id}",  # you can improve later
            "status": e.status,
            "coverage": coverage,
            "created_at": e.started_at,
            "duration": f"{int((e.ended_at - e.started_at).total_seconds())}s" if e.ended_at else "-"
        })

    return {
        "count": len(data),
        "data": data
    }

# --------------------------------------------------
#  GET SINGLE TEST RUN
# --------------------------------------------------
@router.get("/{test_run_id}")
def get_single_test_run(test_run_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    run = db.query(TestRun).filter(
        TestRun.id == test_run_id
    ).first()

    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    return {
        "id": run.id,
        "script_name": run.script_name,
        "requirement_id": run.requirement_id,
        "project_id": run.project_id,
        "status": run.status,
        "coverage": run.coverage,
        "created_at": run.created_at,
        "duration": run.duration,
        "logs": json.loads(run.logs) if run.logs else []
    }
