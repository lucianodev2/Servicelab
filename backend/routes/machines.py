from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from models.models import Machine, MachineCreate, MachineUpdate
import database as db

router = APIRouter(prefix="/api/machines", tags=["Machines"])


@router.get("", response_model=list[Machine])
def list_machines():
    return list(db.machines.values())


@router.post("", response_model=Machine, status_code=201)
def create_machine(data: MachineCreate):
    machine = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.utcnow(),
        **data.model_dump(),
    }
    db.machines[machine["id"]] = machine
    return machine


@router.get("/{machine_id}", response_model=Machine)
def get_machine(machine_id: str):
    machine = db.machines.get(machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return machine


@router.put("/{machine_id}", response_model=Machine)
def update_machine(machine_id: str, data: MachineUpdate):
    machine = db.machines.get(machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    machine.update(updates)
    return machine


@router.delete("/{machine_id}", status_code=204)
def delete_machine(machine_id: str):
    if machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    del db.machines[machine_id]
