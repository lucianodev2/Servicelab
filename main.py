import os
import shutil
import uuid as uuid_module
from datetime import datetime
from enum import Enum
from typing import Optional, Generator

import uvicorn
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, Text, create_engine, func, inspect as sa_inspect, text,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

load_dotenv(encoding="utf-8-sig")

# ── Database connection ───────────────────────────────────────────────────────

DB_URL = (
    f"postgresql://{os.getenv('DB_USER', 'postgres')}"
    f":{os.getenv('DB_PASS', 'postgres')}"
    f"@{os.getenv('DB_HOST', 'localhost')}"
    f":{os.getenv('DB_PORT', '5432')}"
    f"/{os.getenv('DB_NAME', 'servicelab')}"
)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:4173,http://localhost:3000",
).split(",")

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

UPLOAD_DIR = "uploads"

engine = create_engine(DB_URL, echo=False, connect_args={"client_encoding": "utf8"})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


# ── SQLAlchemy ORM Models ─────────────────────────────────────────────────────

class MachineORM(Base):
    __tablename__ = "machines"

    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    serial_number       = Column(String(50), unique=True, nullable=False)
    brand               = Column(String(100), nullable=False)
    model               = Column(String(100), nullable=False)
    patrimony           = Column(String(100), nullable=True)
    location            = Column(String(200), nullable=True)
    technician          = Column(String(200), nullable=True)
    entry_date          = Column(DateTime, nullable=True)
    problem_description = Column(String(1000), nullable=True)
    status              = Column(String(30), nullable=False, default="maintenance")
    urgent              = Column(Boolean, nullable=False, default=False)
    completion_data     = Column(Text, nullable=True)
    created_at          = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at          = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

    services = relationship("ServiceORM", back_populates="machine", cascade="all, delete-orphan")
    parts    = relationship("PartORM",    back_populates="machine")
    tasks    = relationship("TaskORM",    back_populates="machine")
    photos   = relationship("PhotoORM",   back_populates="machine", cascade="all, delete-orphan")


class ServiceORM(Base):
    __tablename__ = "services"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id  = Column(Integer, ForeignKey("machines.id"), nullable=False)
    entry_type  = Column(String(30), nullable=False, default="action")
    description = Column(String(500), nullable=False)
    technician  = Column(String(200), nullable=True)
    created_at  = Column(DateTime, nullable=False, default=datetime.utcnow)

    machine = relationship("MachineORM", back_populates="services")


class PartORM(Base):
    __tablename__ = "parts"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name       = Column(String(200), nullable=False)
    quantity   = Column(Integer,     nullable=False, default=0)
    status     = Column(String(30),  nullable=False, default="available")
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True)
    created_at = Column(DateTime,    nullable=False, default=datetime.utcnow)

    machine = relationship("MachineORM", back_populates="parts")


class TaskORM(Base):
    __tablename__ = "tasks"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title      = Column(String(300), nullable=False)
    priority   = Column(String(10),  nullable=False, default="medium")
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True)
    completed  = Column(Boolean,     nullable=False, default=False)
    due_date   = Column(DateTime,    nullable=True)
    created_at = Column(DateTime,    nullable=False, default=datetime.utcnow)

    machine = relationship("MachineORM", back_populates="tasks")


class PhotoORM(Base):
    __tablename__ = "photos"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    filename   = Column(String(200), nullable=False)
    url        = Column(String(500), nullable=False)
    caption    = Column(String(500), nullable=True)
    created_at = Column(DateTime,    nullable=False, default=datetime.utcnow)

    machine = relationship("MachineORM", back_populates="photos")


class PurchaseORM(Base):
    __tablename__ = "purchases"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name        = Column(String(300), nullable=False)
    description = Column(String(500), nullable=True)
    quantity    = Column(Integer,     nullable=False, default=1)
    priority    = Column(String(10),  nullable=False, default="medium")
    status      = Column(String(20),  nullable=False, default="pending")
    created_at  = Column(DateTime,    nullable=False, default=datetime.utcnow)


# ── Enums ─────────────────────────────────────────────────────────────────────

class MachineStatus(str, Enum):
    maintenance   = "maintenance"
    waiting_parts = "waiting_parts"
    testing       = "testing"
    ready         = "ready"
    completed     = "completed"

class ServiceEntryType(str, Enum):
    action        = "action"
    test          = "test"
    note          = "note"
    part_replaced = "part_replaced"
    photo         = "photo"

class PartStatus(str, Enum):
    available    = "available"
    ordered      = "ordered"
    out_of_stock = "out_of_stock"

class TaskPriority(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class PhotoOut(BaseModel):
    id:         int
    machine_id: int
    filename:   str
    url:        str
    caption:    Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class MachineCreate(BaseModel):
    serial_number:       str
    brand:               str
    model:               str
    patrimony:           Optional[str]      = None
    location:            Optional[str]      = None
    technician:          Optional[str]      = None
    entry_date:          Optional[datetime] = None
    problem_description: Optional[str]      = None
    status:              MachineStatus      = MachineStatus.maintenance
    urgent:              bool               = False
    completion_data:     Optional[str]      = None

class MachineUpdate(BaseModel):
    serial_number:       Optional[str]          = None
    brand:               Optional[str]          = None
    model:               Optional[str]          = None
    patrimony:           Optional[str]          = None
    location:            Optional[str]          = None
    technician:          Optional[str]          = None
    entry_date:          Optional[datetime]     = None
    problem_description: Optional[str]          = None
    status:              Optional[MachineStatus] = None
    urgent:              Optional[bool]         = None
    completion_data:     Optional[str]          = None

class MachineOut(MachineCreate):
    id:         int
    created_at: datetime
    updated_at: Optional[datetime] = None
    photos:     list[PhotoOut] = []
    model_config = {"from_attributes": True}


class ServiceCreate(BaseModel):
    machine_id: int
    entry_type: ServiceEntryType = ServiceEntryType.action
    description: str
    technician: Optional[str] = None

class ServiceUpdate(BaseModel):
    entry_type:  Optional[ServiceEntryType] = None
    description: Optional[str]             = None
    technician:  Optional[str]             = None

class ServiceOut(ServiceCreate):
    id:         int
    created_at: datetime
    model_config = {"from_attributes": True}


class PartCreate(BaseModel):
    name:       str
    quantity:   int = Field(ge=0, default=0)
    status:     PartStatus = PartStatus.available
    machine_id: Optional[int] = None

class PartUpdate(BaseModel):
    name:       Optional[str]        = None
    quantity:   Optional[int]        = Field(default=None, ge=0)
    status:     Optional[PartStatus] = None
    machine_id: Optional[int]        = None

class PartOut(PartCreate):
    id:         int
    created_at: datetime
    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title:      str
    priority:   TaskPriority      = TaskPriority.medium
    machine_id: Optional[int]     = None
    due_date:   Optional[datetime] = None

class TaskUpdate(BaseModel):
    title:      Optional[str]          = None
    priority:   Optional[TaskPriority] = None
    machine_id: Optional[int]          = None
    completed:  Optional[bool]         = None
    due_date:   Optional[datetime]     = None

class TaskOut(TaskCreate):
    id:         int
    completed:  bool
    created_at: datetime
    model_config = {"from_attributes": True}


class PurchasePriority(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class PurchaseStatus(str, Enum):
    pending   = "pending"
    purchased = "purchased"

class PurchaseCreate(BaseModel):
    name:        str
    description: Optional[str]     = None
    quantity:    int                = Field(ge=1, default=1)
    priority:    PurchasePriority   = PurchasePriority.medium
    status:      PurchaseStatus     = PurchaseStatus.pending

class PurchaseUpdate(BaseModel):
    name:        Optional[str]             = None
    description: Optional[str]            = None
    quantity:    Optional[int]             = Field(default=None, ge=1)
    priority:    Optional[PurchasePriority] = None
    status:      Optional[PurchaseStatus]  = None

class PurchaseOut(PurchaseCreate):
    id:         int
    created_at: datetime
    model_config = {"from_attributes": True}


class Stats(BaseModel):
    total_machines:     int
    total_services:     int
    total_parts:        int
    total_tasks:        int
    urgent_machines:    int
    pending_tasks:      int
    machines_by_status: dict[str, int]

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Service Lab API",
    description="Gerenciamento de equipamentos, serviços, peças e tarefas.",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


def _run_migrations():
    insp = sa_inspect(engine)
    with engine.begin() as conn:
        if insp.has_table("machines"):
            existing = {c["name"] for c in insp.get_columns("machines")}
            for col, typedef in [
                ("patrimony",           "VARCHAR(100)"),
                ("technician",          "VARCHAR(200)"),
                ("entry_date",          "TIMESTAMP"),
                ("problem_description", "VARCHAR(1000)"),
                ("completion_data",     "TEXT"),
                ("updated_at",          "TIMESTAMP"),
            ]:
                if col not in existing:
                    conn.execute(text(f"ALTER TABLE machines ADD COLUMN {col} {typedef}"))

        if insp.has_table("services"):
            existing = {c["name"] for c in insp.get_columns("services")}
            if "status" in existing and "entry_type" not in existing:
                conn.execute(text("ALTER TABLE services RENAME COLUMN status TO entry_type"))
            elif "entry_type" not in existing:
                conn.execute(text("ALTER TABLE services ADD COLUMN entry_type VARCHAR(30) DEFAULT 'action'"))
            if "technician" not in existing:
                conn.execute(text("ALTER TABLE services ADD COLUMN technician VARCHAR(200)"))

        if insp.has_table("purchases"):
            existing = {c["name"] for c in insp.get_columns("purchases")}
            for col, typedef in [
                ("description", "VARCHAR(500)"),
                ("priority",    "VARCHAR(10) DEFAULT 'medium'"),
                ("status",      "VARCHAR(20) DEFAULT 'pending'"),
            ]:
                if col not in existing:
                    conn.execute(text(f"ALTER TABLE purchases ADD COLUMN {col} {typedef}"))
            # Remove colunas antigas se existirem (unit, reason)
            for old_col in ("unit", "reason"):
                if old_col in existing:
                    conn.execute(text(f"ALTER TABLE purchases DROP COLUMN {old_col}"))


@app.on_event("startup")
def startup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    _run_migrations()


# Servir arquivos estáticos (fotos)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ── DB Dependency ─────────────────────────────────────────────────────────────

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Service Lab API está no ar.", "docs": "/docs"}

# ── Machines ──────────────────────────────────────────────────────────────────

@app.get("/api/machines", response_model=list[MachineOut], tags=["Machines"])
def list_machines(db: Session = Depends(get_db)):
    return db.query(MachineORM).all()


@app.get("/api/machines/stock", response_model=list[MachineOut], tags=["Machines"])
def list_stock_machines(db: Session = Depends(get_db)):
    """Retorna máquinas prontas para entrega (estoque da oficina)."""
    return (
        db.query(MachineORM)
        .filter(MachineORM.status.in_(["ready"]))
        .order_by(MachineORM.entry_date.desc())
        .all()
    )


@app.post("/api/machines", response_model=MachineOut, status_code=201, tags=["Machines"])
def create_machine(data: MachineCreate, db: Session = Depends(get_db)):
    machine = MachineORM(**data.model_dump())
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


@app.get("/api/machines/{machine_id}", response_model=MachineOut, tags=["Machines"])
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(MachineORM).filter(MachineORM.id == machine_id).first()
    if not machine:
        raise HTTPException(404, "Máquina não encontrada")
    return machine


@app.put("/api/machines/{machine_id}", response_model=MachineOut, tags=["Machines"])
def update_machine(machine_id: int, data: MachineUpdate, db: Session = Depends(get_db)):
    machine = db.query(MachineORM).filter(MachineORM.id == machine_id).first()
    if not machine:
        raise HTTPException(404, "Máquina não encontrada")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(machine, key, val)
    machine.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(machine)
    return machine


@app.delete("/api/machines/{machine_id}", status_code=204, tags=["Machines"])
def delete_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(MachineORM).filter(MachineORM.id == machine_id).first()
    if not machine:
        raise HTTPException(404, "Máquina não encontrada")
    db.delete(machine)
    db.commit()

# ── Photos ────────────────────────────────────────────────────────────────────

@app.get("/api/machines/{machine_id}/photos", response_model=list[PhotoOut], tags=["Photos"])
def list_machine_photos(machine_id: int, db: Session = Depends(get_db)):
    if not db.query(MachineORM).filter(MachineORM.id == machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    return (
        db.query(PhotoORM)
        .filter(PhotoORM.machine_id == machine_id)
        .order_by(PhotoORM.created_at.asc())
        .all()
    )


@app.post("/api/machines/{machine_id}/photos", response_model=PhotoOut, status_code=201, tags=["Photos"])
async def upload_photo(
    machine_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not db.query(MachineORM).filter(MachineORM.id == machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "O arquivo deve ser uma imagem (JPG, PNG ou WebP)")

    ext = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
        if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
            ext = "jpg"

    filename = f"{uuid_module.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"{BASE_URL}/uploads/{filename}"

    photo = PhotoORM(machine_id=machine_id, filename=filename, url=url)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@app.delete("/api/photos/{photo_id}", status_code=204, tags=["Photos"])
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(PhotoORM).filter(PhotoORM.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Foto não encontrada")
    file_path = os.path.join(UPLOAD_DIR, photo.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    db.delete(photo)
    db.commit()

# ── Services ──────────────────────────────────────────────────────────────────

@app.get("/api/services", response_model=list[ServiceOut], tags=["Services"])
def list_services(db: Session = Depends(get_db)):
    return db.query(ServiceORM).all()


@app.post("/api/services", response_model=ServiceOut, status_code=201, tags=["Services"])
def create_service(data: ServiceCreate, db: Session = Depends(get_db)):
    if not db.query(MachineORM).filter(MachineORM.id == data.machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    service = ServiceORM(**data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@app.get("/api/machines/{machine_id}/services", response_model=list[ServiceOut], tags=["Services"])
def list_machine_services(machine_id: int, db: Session = Depends(get_db)):
    if not db.query(MachineORM).filter(MachineORM.id == machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    return db.query(ServiceORM).filter(ServiceORM.machine_id == machine_id).order_by(ServiceORM.created_at.desc()).all()


@app.put("/api/services/{service_id}", response_model=ServiceOut, tags=["Services"])
def update_service(service_id: int, data: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(ServiceORM).filter(ServiceORM.id == service_id).first()
    if not service:
        raise HTTPException(404, "Serviço não encontrado")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(service, key, val)
    db.commit()
    db.refresh(service)
    return service


@app.delete("/api/services/{service_id}", status_code=204, tags=["Services"])
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(ServiceORM).filter(ServiceORM.id == service_id).first()
    if not service:
        raise HTTPException(404, "Serviço não encontrado")
    db.delete(service)
    db.commit()

# ── Parts ─────────────────────────────────────────────────────────────────────

@app.get("/api/parts", response_model=list[PartOut], tags=["Parts"])
def list_parts(db: Session = Depends(get_db)):
    return db.query(PartORM).all()


@app.post("/api/parts", response_model=PartOut, status_code=201, tags=["Parts"])
def create_part(data: PartCreate, db: Session = Depends(get_db)):
    if data.machine_id and not db.query(MachineORM).filter(MachineORM.id == data.machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    part = PartORM(**data.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@app.put("/api/parts/{part_id}", response_model=PartOut, tags=["Parts"])
def update_part(part_id: int, data: PartUpdate, db: Session = Depends(get_db)):
    part = db.query(PartORM).filter(PartORM.id == part_id).first()
    if not part:
        raise HTTPException(404, "Peça não encontrada")
    if data.machine_id and not db.query(MachineORM).filter(MachineORM.id == data.machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(part, key, val)
    db.commit()
    db.refresh(part)
    return part


@app.delete("/api/parts/{part_id}", status_code=204, tags=["Parts"])
def delete_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(PartORM).filter(PartORM.id == part_id).first()
    if not part:
        raise HTTPException(404, "Peça não encontrada")
    db.delete(part)
    db.commit()

# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.get("/api/tasks", response_model=list[TaskOut], tags=["Tasks"])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(TaskORM).all()


@app.post("/api/tasks", response_model=TaskOut, status_code=201, tags=["Tasks"])
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    if data.machine_id and not db.query(MachineORM).filter(MachineORM.id == data.machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    task = TaskORM(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.put("/api/tasks/{task_id}", response_model=TaskOut, tags=["Tasks"])
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(TaskORM).filter(TaskORM.id == task_id).first()
    if not task:
        raise HTTPException(404, "Tarefa não encontrada")
    if data.machine_id and not db.query(MachineORM).filter(MachineORM.id == data.machine_id).first():
        raise HTTPException(404, "Máquina não encontrada")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(task, key, val)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}", status_code=204, tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskORM).filter(TaskORM.id == task_id).first()
    if not task:
        raise HTTPException(404, "Tarefa não encontrada")
    db.delete(task)
    db.commit()


@app.patch("/api/tasks/{task_id}/complete", response_model=TaskOut, tags=["Tasks"])
def toggle_task_complete(task_id: int, db: Session = Depends(get_db)):
    """Alterna o status de conclusão da tarefa (concluída/pendente)."""
    task = db.query(TaskORM).filter(TaskORM.id == task_id).first()
    if not task:
        raise HTTPException(404, "Tarefa não encontrada")
    task.completed = not task.completed
    db.commit()
    db.refresh(task)
    return task

# ── Purchases ─────────────────────────────────────────────────────────────────

@app.get("/api/purchases", response_model=list[PurchaseOut], tags=["Purchases"])
def list_purchases(db: Session = Depends(get_db)):
    return db.query(PurchaseORM).order_by(PurchaseORM.created_at.desc()).all()


@app.post("/api/purchases", response_model=PurchaseOut, status_code=201, tags=["Purchases"])
def create_purchase(data: PurchaseCreate, db: Session = Depends(get_db)):
    purchase = PurchaseORM(**data.model_dump())
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase


@app.put("/api/purchases/{purchase_id}", response_model=PurchaseOut, tags=["Purchases"])
def update_purchase(purchase_id: int, data: PurchaseUpdate, db: Session = Depends(get_db)):
    purchase = db.query(PurchaseORM).filter(PurchaseORM.id == purchase_id).first()
    if not purchase:
        raise HTTPException(404, "Item de compra não encontrado")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(purchase, key, val)
    db.commit()
    db.refresh(purchase)
    return purchase


@app.delete("/api/purchases/{purchase_id}", status_code=204, tags=["Purchases"])
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = db.query(PurchaseORM).filter(PurchaseORM.id == purchase_id).first()
    if not purchase:
        raise HTTPException(404, "Item de compra não encontrado")
    db.delete(purchase)
    db.commit()

# ── Stats ─────────────────────────────────────────────────────────────────────

@app.get("/api/stats", response_model=Stats, tags=["Stats"])
def get_stats(db: Session = Depends(get_db)):
    rows = db.query(MachineORM.status, func.count().label("n")).group_by(MachineORM.status).all()
    machines_by_status = {row.status: row.n for row in rows}

    return Stats(
        total_machines=db.query(func.count(MachineORM.id)).scalar(),
        total_services=db.query(func.count(ServiceORM.id)).scalar(),
        total_parts=db.query(func.count(PartORM.id)).scalar(),
        total_tasks=db.query(func.count(TaskORM.id)).scalar(),
        urgent_machines=db.query(func.count(MachineORM.id)).filter(MachineORM.urgent.is_(True)).scalar(),
        pending_tasks=db.query(func.count(TaskORM.id)).filter(TaskORM.completed.is_(False)).scalar(),
        machines_by_status=machines_by_status,
    )

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
