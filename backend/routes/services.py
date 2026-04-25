from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from models.models import Service, ServiceCreate, ServiceUpdate
import database as db

router = APIRouter(tags=["Services"])


@router.get("/api/services", response_model=list[Service])
def list_services():
    return list(db.services.values())


@router.post("/api/services", response_model=Service, status_code=201)
def create_service(data: ServiceCreate):
    if data.machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    service = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.utcnow(),
        **data.model_dump(),
    }
    db.services[service["id"]] = service
    return service


@router.get("/api/machines/{machine_id}/services", response_model=list[Service])
def list_machine_services(machine_id: str):
    if machine_id not in db.machines:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return [s for s in db.services.values() if s["machine_id"] == machine_id]


@router.put("/api/services/{service_id}", response_model=Service)
def update_service(service_id: str, data: ServiceUpdate):
    service = db.services.get(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    service.update(updates)
    return service


@router.delete("/api/services/{service_id}", status_code=204)
def delete_service(service_id: str):
    if service_id not in db.services:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    del db.services[service_id]
