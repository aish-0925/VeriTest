from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.db import get_db
from app.models.requirement_model import Requirement
from app.models.project_model import Project
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/generate", tags=["Generate"])

def build_selenium_script(title: str, description: str):
    test_name = title.replace(" ", "_").lower()

    desc = description.lower()

    actions = []
    assertions = []

    # 🔍 Basic NLP logic (extend later)
    if "login" in desc:
        actions = [
            'driver.find_element(By.ID, "email").send_keys("test@example.com")',
            'driver.find_element(By.ID, "password").send_keys("password")',
            'driver.find_element(By.ID, "login-btn").click()'
        ]
        assertions = ['assert "dashboard" in driver.title.lower()']

    elif "register" in desc or "signup" in desc:
        actions = [
            'driver.find_element(By.ID, "name").send_keys("Test User")',
            'driver.find_element(By.ID, "email").send_keys("test@example.com")',
            'driver.find_element(By.ID, "password").send_keys("password")',
            'driver.find_element(By.ID, "register-btn").click()'
        ]
        assertions = ['assert "welcome" in driver.page_source.lower()']

    else:
        actions = [
            '# TODO: Add steps based on requirement'
        ]
        assertions = ['assert True']

    # 🧪 Build script
    script = f"""import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By


class Test{test_name.capitalize()}:

    def setup_method(self):
        self.driver = webdriver.Chrome()
        self.driver.get("https://example.com")

    def teardown_method(self):
        self.driver.quit()

    def test_{test_name}(self):
        driver = self.driver

"""

    for act in actions:
        script += f"        {act}\n"

    script += "\n"
    for a in assertions:
        script += f"        {a}\n"

    return script, actions, assertions

@router.post("/script/{requirement_id}")
def generate_script(
    requirement_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    #  Check requirement belongs to user
    req = db.query(Requirement).join(Project).filter(
        Requirement.id == requirement_id,
        Project.user_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    #  Generate script
    script, actions, assertions = build_selenium_script(
        req.title,
        req.description
    )

    #  Update DB
    req.status = "generated"
    req.scripts_count = (req.scripts_count or 0) + 1

    db.commit()

    #  Response
    return {
        "requirement_id": req.id,
        "code": script,
        "parsed": {
            "actions": actions,
            "assertions": assertions,
            "confidence": 0.9
        }
    }