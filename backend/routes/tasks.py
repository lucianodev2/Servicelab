from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from models.models import Task, TaskCreate, TaskUpdate
import database as db

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=list[Task])
def list_tasks():
    return list(db.tasks.values())


@router.post("", response_model=Task, status_code=201)
def create_task(data: TaskCreate):
    if data.machine_id and data.machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    task = {
        "id": str(uuid.uuid4()),
        "completed": False,
        "created_at": datetime.utcnow(),
        **data.model_dump(),
    }
    db.tasks[task["id"]] = task
    return task


@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, data: TaskUpdate):
    task = db.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    if data.machine_id and data.machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    task.update(updates)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str):
    if task_id not in db.tasks:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    del db.tasks[task_id]


@router.patch("/{task_id}/complete", response_model=Task)
def complete_task(task_id: str):
    task = db.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    task["completed"] = True
    return task
