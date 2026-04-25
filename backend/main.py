from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid
import uvicorn

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Service Lab API",
    description="Gerenciamento de equipamentos, serviços, peças e tarefas.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Enums ─────────────────────────────────────────────────────────────────────

class MachineStatus(str, Enum):
    maintenance  = "maintenance"
    waiting_parts = "waiting_parts"
    testing      = "testing"
    ready        = "ready"
    completed    = "completed"

class ServiceStatus(str, Enum):
    pending     = "pending"
    in_progress = "in_progress"
    completed   = "completed"

class PartStatus(str, Enum):
    available   = "available"
    ordered     = "ordered"
    out_of_stock = "out_of_stock"

class TaskPriority(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

# ── Models ────────────────────────────────────────────────────────────────────

class MachineCreate(BaseModel):
    serial_number: str
    brand: str
    model: str
    location: Optional[str] = None
    status: MachineStatus = MachineStatus.maintenance
    urgent: bool = False

class MachineUpdate(BaseModel):
    serial_number: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    location: Optional[str] = None
    status: Optional[MachineStatus] = None
    urgent: Optional[bool] = None

class Machine(MachineCreate):
    id: str
    created_at: datetime


class ServiceCreate(BaseModel):
    machine_id: str
    description: str
    status: ServiceStatus = ServiceStatus.pending

class ServiceUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[ServiceStatus] = None

class Service(ServiceCreate):
    id: str
    created_at: datetime


class PartCreate(BaseModel):
    name: str
    quantity: int = Field(ge=0, default=0)
    status: PartStatus = PartStatus.available
    machine_id: Optional[str] = None

class PartUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    status: Optional[PartStatus] = None
    machine_id: Optional[str] = None

class Part(PartCreate):
    id: str
    created_at: datetime


class TaskCreate(BaseModel):
    title: str
    priority: TaskPriority = TaskPriority.medium
    machine_id: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[TaskPriority] = None
    machine_id: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None

class Task(TaskCreate):
    id: str
    completed: bool = False
    created_at: datetime


class Stats(BaseModel):
    total_machines: int
    total_services: int
    total_parts: int
    total_tasks: int
    urgent_machines: int
    pending_tasks: int
    machines_by_status: dict[str, int]
    services_by_status: dict[str, int]

# ── In-memory database ────────────────────────────────────────────────────────

now = datetime.utcnow()

machines: dict[str, dict] = {
    "m1": {"id": "m1", "serial_number": "HP-001",  "brand": "HP",     "model": "LaserJet Pro M404n", "location": "Sala TI",       "status": "maintenance",   "urgent": True,  "created_at": now},
    "m2": {"id": "m2", "serial_number": "EPS-002", "brand": "Epson",  "model": "EcoTank L3150",      "location": "Recepção",      "status": "waiting_parts", "urgent": False, "created_at": now},
    "m3": {"id": "m3", "serial_number": "CAN-003", "brand": "Canon",  "model": "PIXMA G3010",        "location": "Contabilidade", "status": "testing",       "urgent": False, "created_at": now},
    "m4": {"id": "m4", "serial_number": "BRO-004", "brand": "Brother","model": "MFC-L2700DW",        "location": "RH",            "status": "ready",         "urgent": False, "created_at": now},
}

services: dict[str, dict] = {
    "s1": {"id": "s1", "machine_id": "m1", "description": "Troca de fusível e limpeza interna",      "status": "in_progress", "created_at": now},
    "s2": {"id": "s2", "machine_id": "m2", "description": "Substituição do cabeçote de impressão",   "status": "pending",     "created_at": now},
    "s3": {"id": "s3", "machine_id": "m3", "description": "Calibração de cores pós-limpeza",         "status": "completed",   "created_at": now},
}

parts: dict[str, dict] = {
    "p1": {"id": "p1", "name": "Fusível 5A",          "quantity": 3, "status": "available",    "machine_id": "m1", "created_at": now},
    "p2": {"id": "p2", "name": "Cabeçote Epson L3150", "quantity": 0, "status": "ordered",     "machine_id": "m2", "created_at": now},
    "p3": {"id": "p3", "name": "Toner HP CF258A",      "quantity": 2, "status": "available",   "machine_id": None, "created_at": now},
}

tasks: dict[str, dict] = {
    "t1": {"id": "t1", "title": "Teste de impressão após manutenção", "priority": "high",   "machine_id": "m1", "completed": False, "due_date": None, "created_at": now},
    "t2": {"id": "t2", "title": "Encomendar cabeçote reserva",        "priority": "medium", "machine_id": "m2", "completed": False, "due_date": None, "created_at": now},
    "t3": {"id": "t3", "title": "Atualizar firmware Brother MFC",     "priority": "low",    "machine_id": "m4", "completed": True,  "due_date": None, "created_at": now},
}

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Service Lab API está no ar."}

# ── Machines ──────────────────────────────────────────────────────────────────

@app.get("/api/machines", response_model=list[Machine], tags=["Machines"])
def list_machines():
    return list(machines.values())

@app.post("/api/machines", response_model=Machine, status_code=201, tags=["Machines"])
def create_machine(data: MachineCreate):
    m = {"id": str(uuid.uuid4()), "created_at": datetime.utcnow(), **data.model_dump()}
    machines[m["id"]] = m
    return m

@app.get("/api/machines/{machine_id}", response_model=Machine, tags=["Machines"])
def get_machine(machine_id: str):
    m = machines.get(machine_id)
    if not m:
        raise HTTPException(404, "Máquina não encontrada")
    return m

@app.put("/api/machines/{machine_id}", response_model=Machine, tags=["Machines"])
def update_machine(machine_id: str, data: MachineUpdate):
    m = machines.get(machine_id)
    if not m:
        raise HTTPException(404, "Máquina não encontrada")
    m.update({k: v for k, v in data.model_dump().items() if v is not None})
    return m

@app.delete("/api/machines/{machine_id}", status_code=204, tags=["Machines"])
def delete_machine(machine_id: str):
    if machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    del machines[machine_id]

# ── Services ──────────────────────────────────────────────────────────────────

@app.get("/api/services", response_model=list[Service], tags=["Services"])
def list_services():
    return list(services.values())

@app.post("/api/services", response_model=Service, status_code=201, tags=["Services"])
def create_service(data: ServiceCreate):
    if data.machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    s = {"id": str(uuid.uuid4()), "created_at": datetime.utcnow(), **data.model_dump()}
    services[s["id"]] = s
    return s

@app.get("/api/machines/{machine_id}/services", response_model=list[Service], tags=["Services"])
def list_machine_services(machine_id: str):
    if machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    return [s for s in services.values() if s["machine_id"] == machine_id]

@app.put("/api/services/{service_id}", response_model=Service, tags=["Services"])
def update_service(service_id: str, data: ServiceUpdate):
    s = services.get(service_id)
    if not s:
        raise HTTPException(404, "Serviço não encontrado")
    s.update({k: v for k, v in data.model_dump().items() if v is not None})
    return s

@app.delete("/api/services/{service_id}", status_code=204, tags=["Services"])
def delete_service(service_id: str):
    if service_id not in services:
        raise HTTPException(404, "Serviço não encontrado")
    del services[service_id]

# ── Parts ─────────────────────────────────────────────────────────────────────

@app.get("/api/parts", response_model=list[Part], tags=["Parts"])
def list_parts():
    return list(parts.values())

@app.post("/api/parts", response_model=Part, status_code=201, tags=["Parts"])
def create_part(data: PartCreate):
    if data.machine_id and data.machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    p = {"id": str(uuid.uuid4()), "created_at": datetime.utcnow(), **data.model_dump()}
    parts[p["id"]] = p
    return p

@app.put("/api/parts/{part_id}", response_model=Part, tags=["Parts"])
def update_part(part_id: str, data: PartUpdate):
    p = parts.get(part_id)
    if not p:
        raise HTTPException(404, "Peça não encontrada")
    if data.machine_id and data.machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    p.update({k: v for k, v in data.model_dump().items() if v is not None})
    return p

@app.delete("/api/parts/{part_id}", status_code=204, tags=["Parts"])
def delete_part(part_id: str):
    if part_id not in parts:
        raise HTTPException(404, "Peça não encontrada")
    del parts[part_id]

# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.get("/api/tasks", response_model=list[Task], tags=["Tasks"])
def list_tasks():
    return list(tasks.values())

@app.post("/api/tasks", response_model=Task, status_code=201, tags=["Tasks"])
def create_task(data: TaskCreate):
    if data.machine_id and data.machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    t = {"id": str(uuid.uuid4()), "completed": False, "created_at": datetime.utcnow(), **data.model_dump()}
    tasks[t["id"]] = t
    return t

@app.put("/api/tasks/{task_id}", response_model=Task, tags=["Tasks"])
def update_task(task_id: str, data: TaskUpdate):
    t = tasks.get(task_id)
    if not t:
        raise HTTPException(404, "Tarefa não encontrada")
    if data.machine_id and data.machine_id not in machines:
        raise HTTPException(404, "Máquina não encontrada")
    t.update({k: v for k, v in data.model_dump().items() if v is not None})
    return t

@app.delete("/api/tasks/{task_id}", status_code=204, tags=["Tasks"])
def delete_task(task_id: str):
    if task_id not in tasks:
        raise HTTPException(404, "Tarefa não encontrada")
    del tasks[task_id]

@app.patch("/api/tasks/{task_id}/complete", response_model=Task, tags=["Tasks"])
def complete_task(task_id: str):
    t = tasks.get(task_id)
    if not t:
        raise HTTPException(404, "Tarefa não encontrada")
    t["completed"] = True
    return t

# ── Stats ─────────────────────────────────────────────────────────────────────

@app.get("/api/stats", response_model=Stats, tags=["Stats"])
def get_stats():
    machines_by_status: dict[str, int] = {}
    for m in machines.values():
        k = m["status"].value if hasattr(m["status"], "value") else m["status"]
        machines_by_status[k] = machines_by_status.get(k, 0) + 1

    services_by_status: dict[str, int] = {}
    for s in services.values():
        k = s["status"].value if hasattr(s["status"], "value") else s["status"]
        services_by_status[k] = services_by_status.get(k, 0) + 1

    return Stats(
        total_machines=len(machines),
        total_services=len(services),
        total_parts=len(parts),
        total_tasks=len(tasks),
        urgent_machines=sum(1 for m in machines.values() if m.get("urgent")),
        pending_tasks=sum(1 for t in tasks.values() if not t.get("completed")),
        machines_by_status=machines_by_status,
        services_by_status=services_by_status,
    )

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
