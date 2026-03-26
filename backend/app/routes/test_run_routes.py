from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import time

from app.config.db import get_db
from app.models.test_run_model import TestRun
from app.models.requirement_model import Requirement
from app.utils.dependencies import get_current_user

# Selenium imports
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
def run_test(
    requirement_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    #  Check requirement exists
    requirement = db.query(Requirement).filter(
        Requirement.id == requirement_id
    ).first()

    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    #  Create test run entry
    test_run = TestRun(
        requirement_id=requirement.id,
        project_id=requirement.project_id,
        status="Running",
        started_at=datetime.utcnow()
    )

    db.add(test_run)
    db.commit()
    db.refresh(test_run)

    try:
        #  Setup Selenium (auto driver install)
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install())
        )

        driver.get(requirement.url)

        #  Wait for page load
        time.sleep(2)

        #  Validation logic
        if requirement.expected_text:
            body = driver.find_element(By.TAG_NAME, "body").text

            if requirement.expected_text in body:
                test_run.status = "Passed"
            else:
                test_run.status = "Failed"
        else:
            # If no validation rule → just mark passed
            test_run.status = "Passed"

        driver.quit()

    except Exception as e:
        test_run.status = "Failed"
        print("Error during test run:", str(e))

    #  Complete test run
    test_run.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(test_run)

    return {
        "message": "Test executed successfully",
        "test_run_id": test_run.id,
        "status": test_run.status
    }


# --------------------------------------------------
#  GET ALL TEST RUNS
# --------------------------------------------------
@router.get("/")
def get_all_test_runs(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    runs = db.query(TestRun).order_by(TestRun.id.desc()).all()

    return {
        "count": len(runs),
        "data": runs
    }


# --------------------------------------------------
#  GET TEST RUNS BY PROJECT
# --------------------------------------------------
@router.get("/project/{project_id}")
def get_test_runs_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    runs = db.query(TestRun).filter(
        TestRun.project_id == project_id
    ).order_by(TestRun.id.desc()).all()

    return {
        "count": len(runs),
        "data": runs
    }


# --------------------------------------------------
#  GET SINGLE TEST RUN
# --------------------------------------------------
@router.get("/{test_run_id}")
def get_single_test_run(
    test_run_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    run = db.query(TestRun).filter(
        TestRun.id == test_run_id
    ).first()

    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    return run


# --------------------------------------------------
#  DELETE TEST RUN (optional)
# --------------------------------------------------
@router.delete("/{test_run_id}")
def delete_test_run(
    test_run_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    run = db.query(TestRun).filter(
        TestRun.id == test_run_id
    ).first()

    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    db.delete(run)
    db.commit()

    return {"message": "Test run deleted successfully"}