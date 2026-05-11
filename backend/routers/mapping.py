import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from models.schemas import MappingRequest, MappingTemplate
from services.account_mapper import get_all_categories

router = APIRouter(prefix="/mapping", tags=["mapping"])
import os
if os.environ.get("VERCEL"):
    UPLOAD_DIR = Path("/tmp") / "uploads"
else:
    UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.get("/categories")
def get_categories():
    return JSONResponse(get_all_categories())


@router.get("/{session_id}/suggestions")
def get_suggestions(session_id: str):
    f = UPLOAD_DIR / session_id / "suggestions.json"
    if not f.exists():
        raise HTTPException(404, "No suggestions found. Upload a trial balance first.")
    with open(f) as fp:
        return JSONResponse(json.load(fp))


@router.post("/save")
def save_mappings(req: MappingRequest):
    session_dir = UPLOAD_DIR / req.session_id
    session_dir.mkdir(exist_ok=True)
    data = [m.model_dump() for m in req.mappings]
    with open(session_dir / "mappings.json", "w") as f:
        json.dump(data, f)
    return {"status": "saved", "count": len(data)}


@router.get("/{session_id}/load")
def load_mappings(session_id: str):
    f = UPLOAD_DIR / session_id / "mappings.json"
    if not f.exists():
        raise HTTPException(404, "No saved mappings for this session.")
    with open(f) as fp:
        return JSONResponse(json.load(fp))


@router.post("/template/save")
def save_template(template: MappingTemplate):
    templates_dir = UPLOAD_DIR / "_templates"
    templates_dir.mkdir(exist_ok=True)
    fname = template.entity_name.replace(" ", "_").lower() + ".json"
    with open(templates_dir / fname, "w") as f:
        json.dump(template.model_dump(), f)
    return {"status": "saved", "template": fname}


@router.get("/templates")
def list_templates():
    templates_dir = UPLOAD_DIR / "_templates"
    if not templates_dir.exists():
        return []
    files = list(templates_dir.glob("*.json"))
    return [f.stem for f in files]


@router.get("/template/{name}")
def load_template(name: str):
    fname = UPLOAD_DIR / "_templates" / f"{name}.json"
    if not fname.exists():
        raise HTTPException(404, "Template not found")
    with open(fname) as f:
        return JSONResponse(json.load(f))
