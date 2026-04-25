from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from models.models import Part, PartCreate, PartUpdate
import database as db

router = APIRouter(prefix="/api/parts", tags=["Parts"])


@router.get("", response_model=list[Part])
def list_parts():
    return list(db.parts.values())


@router.post("", response_model=Part, status_code=201)
def create_part(data: PartCreate):
    if data.machine_id and data.machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    part = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.utcnow(),
        **data.model_dump(),
    }
    db.parts[part["id"]] = part
    return part


@router.put("/{part_id}", response_model=Part)
def update_part(part_id: str, data: PartUpdate):
    part = db.parts.get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Peça não encontrada")
    if data.machine_id and data.machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    part.update(updates)
    return part


@router.delete("/{part_id}", status_code=204)
def delete_part(part_id: str):
    if part_id not in db.parts:
        raise HTTPException(status_code=404, detail="Peça não encontrada")
    del db.parts[part_id]
