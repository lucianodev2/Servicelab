from fastapi import APIRouter

from models.models import Stats
import database as db

router = APIRouter(prefix="/api/stats", tags=["Stats"])


@router.get("", response_model=Stats)
def get_stats():
    machines_by_status: dict[str, int] = {}
    for m in db.machines.values():
        key = m["status"].value if hasattr(m["status"], "value") else m["status"]
        machines_by_status[key] = machines_by_status.get(key, 0) + 1

    services_by_status: dict[str, int] = {}
    for s in db.services.values():
        key = s["status"].value if hasattr(s["status"], "value") else s["status"]
        services_by_status[key] = services_by_status.get(key, 0) + 1

    return Stats(
        total_machines=len(db.machines),
        total_services=len(db.services),
        total_parts=len(db.parts),
        total_tasks=len(db.tasks),
        urgent_machines=sum(1 for m in db.machines.values() if m.get("urgent")),
        pending_tasks=sum(1 for t in db.tasks.values() if not t.get("completed")),
        machines_by_status=machines_by_status,
        services_by_status=services_by_status,
    )
