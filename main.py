from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uvicorn

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Service Lab API",
    description="Gerenciamento de equipamentos, serviços, peças e tarefas.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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
    maintenance   = "maintenance"
    waiting_parts = "waiting_parts"
    testing       = "testing"
    ready         = "ready"
    completed     = "completed"

class ServiceStatus(str, Enum):
    pending     = "pending"
    in_progress = "in_progress"
    completed   = "completed"

class PartStatus(str, Enum):
    available    = "available"
    ordered      = "ordered"
    out_of_stock = "out_of_stock"

class TaskPriority(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

# ── Pydantic Models ───────────────────────────────────────────────────────────

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
    id: int
    created_at: datetime


class ServiceCreate(BaseModel):
    machine_id: int
    description: str
    status: ServiceStatus = ServiceStatus.pending

class ServiceUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[ServiceStatus] = None

class Service(ServiceCreate):
    id: int
    created_at: datetime


class PartCreate(BaseModel):
    name: str
    quantity: int = Field(ge=0, default=0)
    status: PartStatus = PartStatus.available
    machine_id: Optional[int] = None

class PartUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    status: Optional[PartStatus] = None
    machine_id: Optional[int] = None

class Part(PartCreate):
    id: int
    created_at: datetime


class TaskCreate(BaseModel):
    title: str
    priority: TaskPriority = TaskPriority.medium
    machine_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[TaskPriority] = None
    machine_id: Optional[int] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None

class Task(TaskCreate):
    id: int
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

# ── In-memory storage ─────────────────────────────────────────────────────────

machines_db:  list[dict] = []
services_db:  list[dict] = []
parts_db:     list[dict] = []
tasks_db:     list[dict] = []

_counters = {"machine": 0, "service": 0, "part": 0, "task": 0}

def next_id(entity: str) -> int:
    _counters[entity] += 1
    return _counters[entity]

def _now() -> datetime:
    return datetime.utcnow()

# Sample data
def _seed():
    now = _now()
    for m in [
        {"serial_number": "HP-001",  "brand": "HP",      "model": "LaserJet Pro M404n", "location": "Sala TI",       "status": "maintenance",   "urgent": True},
        {"serial_number": "EPS-002", "brand": "Epson",   "model": "EcoTank L3150",      "location": "Recepção",      "status": "waiting_parts", "urgent": False},
        {"serial_number": "CAN-003", "brand": "Canon",   "model": "PIXMA G3010",        "location": "Contabilidade", "status": "testing",       "urgent": False},
        {"serial_number": "BRO-004", "brand": "Brother", "model": "MFC-L2700DW",        "location": "RH",            "status": "ready",         "urgent": False},
    ]:
        machines_db.append({**m, "id": next_id("machine"), "created_at": now})

    for s in [
        {"machine_id": 1, "description": "Troca de fusível e limpeza interna",    "status": "in_progress"},
        {"machine_id": 2, "description": "Substituição do cabeçote de impressão", "status": "pending"},
        {"machine_id": 3, "description": "Calibração de cores pós-limpeza",       "status": "completed"},
    ]:
        services_db.append({**s, "id": next_id("service"), "created_at": now})

    for p in [
        {"name": "Fusível 5A",           "quantity": 3, "status": "available",    "machine_id": 1},
        {"name": "Cabeçote Epson L3150", "quantity": 0, "status": "ordered",      "machine_id": 2},
        {"name": "Toner HP CF258A",      "quantity": 2, "status": "available",    "machine_id": None},
    ]:
        parts_db.append({**p, "id": next_id("part"), "created_at": now})

    for t in [
        {"title": "Teste de impressão após manutenção", "priority": "high",   "machine_id": 1, "completed": False, "due_date": None},
        {"title": "Encomendar cabeçote reserva",        "priority": "medium", "machine_id": 2, "completed": False, "due_date": None},
        {"title": "Atualizar firmware Brother MFC",     "priority": "low",    "machine_id": 4, "completed": True,  "due_date": None},
    ]:
        tasks_db.append({**t, "id": next_id("task"), "created_at": now})

_seed()

# ── Helpers ───────────────────────────────────────────────────────────────────

def find(db: list[dict], id: int) -> Optional[dict]:
    return next((r for r in db if r["id"] == id), None)

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Service Lab API está no ar.", "docs": "/docs"}

# ── Machines ──────────────────────────────────────────────────────────────────

@app.get("/api/machines", response_model=list[Machine], tags=["Machines"])
def list_machines():
    return machines_db

@app.post("/api/machines", response_model=Machine, status_code=201, tags=["Machines"])
def create_machine(data: MachineCreate):
    machine = {"id": next_id("machine"), "created_at": _now(), **data.model_dump()}
    machines_db.append(machine)
    return machine

@app.get("/api/machines/{machine_id}", response_model=Machine, tags=["Machines"])
def get_machine(machine_id: int):
    machine = find(machines_db, machine_id)
    if not machine:
        raise HTTPException(404, "Máquina não encontrada")
    return machine

@app.put("/api/machines/{machine_id}", response_model=Machine, tags=["Machines"])
def update_machine(machine_id: int, data: MachineUpdate):
    machine = find(machines_db, machine_id)
    if not machine:
        raise HTTPException(404, "Máquina não encontrada")
    machine.update({k: v for k, v in data.model_dump().items() if v is not None})
    return machine

@app.delete("/api/machines/{machine_id}", status_code=204, tags=["Machines"])
def delete_machine(machine_id: int):
    machine = find(machines_db, machine_id)
    if not machine:
        raise HTTPException(404, "Máquina não encontrada")
    machines_db.remove(machine)

# ── Services ──────────────────────────────────────────────────────────────────

@app.get("/api/services", response_model=list[Service], tags=["Services"])
def list_services():
    return services_db

@app.post("/api/services", response_model=Service, status_code=201, tags=["Services"])
def create_service(data: ServiceCreate):
    if not find(machines_db, data.machine_id):
        raise HTTPException(404, "Máquina não encontrada")
    service = {"id": next_id("service"), "created_at": _now(), **data.model_dump()}
    services_db.append(service)
    return service

@app.get("/api/machines/{machine_id}/services", response_model=list[Service], tags=["Services"])
def list_machine_services(machine_id: int):
    if not find(machines_db, machine_id):
        raise HTTPException(404, "Máquina não encontrada")
    return [s for s in services_db if s["machine_id"] == machine_id]

@app.put("/api/services/{service_id}", response_model=Service, tags=["Services"])
def update_service(service_id: int, data: ServiceUpdate):
    service = find(services_db, service_id)
    if not service:
        raise HTTPException(404, "Serviço não encontrado")
    service.update({k: v for k, v in data.model_dump().items() if v is not None})
    return service

@app.delete("/api/services/{service_id}", status_code=204, tags=["Services"])
def delete_service(service_id: int):
    service = find(services_db, service_id)
    if not service:
        raise HTTPException(404, "Serviço não encontrado")
    services_db.remove(service)

# ── Parts ─────────────────────────────────────────────────────────────────────

@app.get("/api/parts", response_model=list[Part], tags=["Parts"])
def list_parts():
    return parts_db

@app.post("/api/parts", response_model=Part, status_code=201, tags=["Parts"])
def create_part(data: PartCreate):
    if data.machine_id and not find(machines_db, data.machine_id):
        raise HTTPException(404, "Máquina não encontrada")
    part = {"id": next_id("part"), "created_at": _now(), **data.model_dump()}
    parts_db.append(part)
    return part

@app.put("/api/parts/{part_id}", response_model=Part, tags=["Parts"])
def update_part(part_id: int, data: PartUpdate):
    part = find(parts_db, part_id)
    if not part:
        raise HTTPException(404, "Peça não encontrada")
    if data.machine_id and not find(machines_db, data.machine_id):
        raise HTTPException(404, "Máquina não encontrada")
    part.update({k: v for k, v in data.model_dump().items() if v is not None})
    return part

@app.delete("/api/parts/{part_id}", status_code=204, tags=["Parts"])
def delete_part(part_id: int):
    part = find(parts_db, part_id)
    if not part:
        raise HTTPException(404, "Peça não encontrada")
    parts_db.remove(part)

# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.get("/api/tasks", response_model=list[Task], tags=["Tasks"])
def list_tasks():
    return tasks_db

@app.post("/api/tasks", response_model=Task, status_code=201, tags=["Tasks"])
def create_task(data: TaskCreate):
    if data.machine_id and not find(machines_db, data.machine_id):
        raise HTTPException(404, "Máquina não encontrada")
    task = {"id": next_id("task"), "completed": False, "created_at": _now(), **data.model_dump()}
    tasks_db.append(task)
    return task

@app.put("/api/tasks/{task_id}", response_model=Task, tags=["Tasks"])
def update_task(task_id: int, data: TaskUpdate):
    task = find(tasks_db, task_id)
    if not task:
        raise HTTPException(404, "Tarefa não encontrada")
    if data.machine_id and not find(machines_db, data.machine_id):
        raise HTTPException(404, "Máquina não encontrada")
    task.update({k: v for k, v in data.model_dump().items() if v is not None})
    return task

@app.delete("/api/tasks/{task_id}", status_code=204, tags=["Tasks"])
def delete_task(task_id: int):
    task = find(tasks_db, task_id)
    if not task:
        raise HTTPException(404, "Tarefa não encontrada")
    tasks_db.remove(task)

@app.patch("/api/tasks/{task_id}/complete", response_model=Task, tags=["Tasks"])
def complete_task(task_id: int):
    task = find(tasks_db, task_id)
    if not task:
        raise HTTPException(404, "Tarefa não encontrada")
    task["completed"] = True
    return task

# ── Stats ─────────────────────────────────────────────────────────────────────

@app.get("/api/stats", response_model=Stats, tags=["Stats"])
def get_stats():
    machines_by_status: dict[str, int] = {}
    for m in machines_db:
        k = m["status"].value if hasattr(m["status"], "value") else m["status"]
        machines_by_status[k] = machines_by_status.get(k, 0) + 1

    return Stats(
        total_machines=len(machines_db),
        total_services=len(services_db),
        total_parts=len(parts_db),
        total_tasks=len(tasks_db),
        urgent_machines=sum(1 for m in machines_db if m.get("urgent")),
        pending_tasks=sum(1 for t in tasks_db if not t.get("completed")),
        machines_by_status=machines_by_status,
    )

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
