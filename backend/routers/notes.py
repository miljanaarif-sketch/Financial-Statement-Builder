import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from models.schemas import NotesRequest

router = APIRouter(prefix="/notes", tags=["notes"])
import os
if os.environ.get("VERCEL"):
    UPLOAD_DIR = Path("/tmp") / "uploads"
else:
    UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/save")
def save_notes(req: NotesRequest):
    session_dir = UPLOAD_DIR / req.session_id
    session_dir.mkdir(exist_ok=True)
    data = [n.model_dump() for n in req.notes]
    with open(session_dir / "notes.json", "w") as f:
        json.dump(data, f)
    return {"status": "saved", "count": len(data)}


@router.get("/{session_id}")
def get_notes(session_id: str):
    f = UPLOAD_DIR / session_id / "notes.json"
    if not f.exists():
        raise HTTPException(404, "No notes for this session.")
    with open(f) as fp:
        return JSONResponse(json.load(fp))
