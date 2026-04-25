from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MachineStatus(str, Enum):
    maintenance = "maintenance"
    waiting_parts = "waiting_parts"
    testing = "testing"
    ready = "ready"
    completed = "completed"


class ServiceStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class PartStatus(str, Enum):
    available = "available"
    ordered = "ordered"
    out_of_stock = "out_of_stock"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ── Machine ─────────────────────────────────────────────────────────────────

class MachineBase(BaseModel):
    serial_number: str
    brand: str
    model: str
    location: Optional[str] = None
    status: MachineStatus = MachineStatus.maintenance
    urgent: bool = False


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    serial_number: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    location: Optional[str] = None
    status: Optional[MachineStatus] = None
    urgent: Optional[bool] = None


class Machine(MachineBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Service ──────────────────────────────────────────────────────────────────

class ServiceBase(BaseModel):
    machine_id: str
    description: str
    status: ServiceStatus = ServiceStatus.pending


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[ServiceStatus] = None


class Service(ServiceBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Part ─────────────────────────────────────────────────────────────────────

class PartBase(BaseModel):
    name: str
    quantity: int = Field(ge=0, default=0)
    status: PartStatus = PartStatus.available
    machine_id: Optional[str] = None


class PartCreate(PartBase):
    pass


class PartUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    status: Optional[PartStatus] = None
    machine_id: Optional[str] = None


class Part(PartBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Task ─────────────────────────────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str
    priority: TaskPriority = TaskPriority.medium
    machine_id: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[TaskPriority] = None
    machine_id: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None


class Task(TaskBase):
    id: str
    completed: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Stats ─────────────────────────────────────────────────────────────────────

class Stats(BaseModel):
    total_machines: int
    total_services: int
    total_parts: int
    total_tasks: int
    urgent_machines: int
    pending_tasks: int
    machines_by_status: dict[str, int]
    services_by_status: dict[str, int]
