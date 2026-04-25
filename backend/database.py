from datetime import datetime
from models.models import (
    Machine, Service, Part, Task,
    MachineStatus, ServiceStatus, PartStatus, TaskPriority,
)

# ── In-memory store ───────────────────────────────────────────────────────────

machines: dict[str, dict] = {}
services: dict[str, dict] = {}
parts: dict[str, dict] = {}
tasks: dict[str, dict] = {}


def _seed():
    """Populate the store with realistic sample data on startup."""

    now = datetime.utcnow()

    _machines = [
        {
            "id": "m1",
            "serial_number": "HP-001",
            "brand": "HP",
            "model": "LaserJet Pro M404n",
            "location": "Sala TI — Rack A",
            "status": MachineStatus.maintenance,
            "urgent": True,
            "created_at": now,
        },
        {
            "id": "m2",
            "serial_number": "EPS-002",
            "brand": "Epson",
            "model": "EcoTank L3150",
            "location": "Recepção",
            "status": MachineStatus.waiting_parts,
            "urgent": False,
            "created_at": now,
        },
        {
            "id": "m3",
            "serial_number": "CAN-003",
            "brand": "Canon",
            "model": "PIXMA G3010",
            "location": "Contabilidade",
            "status": MachineStatus.testing,
            "urgent": False,
            "created_at": now,
        },
        {
            "id": "m4",
            "serial_number": "BRO-004",
            "brand": "Brother",
            "model": "MFC-L2700DW",
            "location": "RH",
            "status": MachineStatus.ready,
            "urgent": False,
            "created_at": now,
        },
    ]

    _services = [
        {
            "id": "s1",
            "machine_id": "m1",
            "description": "Troca de fusível e limpeza interna",
            "status": ServiceStatus.in_progress,
            "created_at": now,
        },
        {
            "id": "s2",
            "machine_id": "m2",
            "description": "Substituição do cabeçote de impressão",
            "status": ServiceStatus.pending,
            "created_at": now,
        },
        {
            "id": "s3",
            "machine_id": "m3",
            "description": "Calibração de cores pós-limpeza",
            "status": ServiceStatus.completed,
            "created_at": now,
        },
    ]

    _parts = [
        {
            "id": "p1",
            "name": "Fusível 5A",
            "quantity": 3,
            "status": PartStatus.available,
            "machine_id": "m1",
            "created_at": now,
        },
        {
            "id": "p2",
            "name": "Cabeçote Epson L3150",
            "quantity": 0,
            "status": PartStatus.ordered,
            "machine_id": "m2",
            "created_at": now,
        },
        {
            "id": "p3",
            "name": "Toner HP CF258A",
            "quantity": 2,
            "status": PartStatus.available,
            "machine_id": None,
            "created_at": now,
        },
    ]

    _tasks = [
        {
            "id": "t1",
            "title": "Realizar teste de impressão após manutenção",
            "priority": TaskPriority.high,
            "machine_id": "m1",
            "completed": False,
            "due_date": None,
            "created_at": now,
        },
        {
            "id": "t2",
            "title": "Encomendar cabeçote reserva",
            "priority": TaskPriority.medium,
            "machine_id": "m2",
            "completed": False,
            "due_date": None,
            "created_at": now,
        },
        {
            "id": "t3",
            "title": "Atualizar firmware da Brother MFC",
            "priority": TaskPriority.low,
            "machine_id": "m4",
            "completed": True,
            "due_date": None,
            "created_at": now,
        },
    ]

    for m in _machines:
        machines[m["id"]] = m
    for s in _services:
        services[s["id"]] = s
    for p in _parts:
        parts[p["id"]] = p
    for t in _tasks:
        tasks[t["id"]] = t


_seed()
