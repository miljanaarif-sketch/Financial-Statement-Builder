import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.schemas import ExportRequest
from services.export_service import export_excel, export_pdf, export_word

router = APIRouter(prefix="/export", tags=["export"])
import os
if os.environ.get("VERCEL"):
    UPLOAD_DIR = Path("/tmp") / "uploads"
else:
    UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def _load(session_id: str):
    session_dir = UPLOAD_DIR / session_id
    sf = session_dir / "statements.json"
    nf = session_dir / "notes.json"
    if not sf.exists():
        raise HTTPException(404, "Statements not found. Generate them first.")
    with open(sf) as f:
        statements = json.load(f)
    notes = []
    if nf.exists():
        with open(nf) as f:
            notes = json.load(f)
    return statements, notes


@router.post("/excel")
def export_to_excel(req: ExportRequest):
    statements, notes = _load(req.session_id)
    statements.update({"entity_name": req.entity_name, "period_end": req.period_end})
    payload = export_excel(statements, notes if req.include_notes else [], req.currency)
    filename = f"{req.entity_name.replace(' ', '_')}_FinancialStatements.xlsx"
    return Response(
        content=payload,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/pdf")
def export_to_pdf(req: ExportRequest):
    statements, notes = _load(req.session_id)
    statements.update({"entity_name": req.entity_name, "period_end": req.period_end})
    payload = export_pdf(statements, notes if req.include_notes else [], req.currency)
    filename = f"{req.entity_name.replace(' ', '_')}_FinancialStatements.pdf"
    return Response(
        content=payload,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/word")
def export_to_word(req: ExportRequest):
    statements, notes = _load(req.session_id)
    statements.update({"entity_name": req.entity_name, "period_end": req.period_end})
    payload = export_word(statements, notes if req.include_notes else [], req.currency)
    filename = f"{req.entity_name.replace(' ', '_')}_FinancialStatements.docx"
    return Response(
        content=payload,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
