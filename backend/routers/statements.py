import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from models.schemas import GenerateRequest, AccountMapping
from services.statement_generator import generate_statements
from services.notes_generator import generate_default_notes

router = APIRouter(prefix="/statements", tags=["statements"])
import os
if os.environ.get("VERCEL"):
    UPLOAD_DIR = Path("/tmp") / "uploads"
else:
    UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/generate")
def generate(req: GenerateRequest):
    session_dir = UPLOAD_DIR / req.session_id

    # Load trial balance
    tb_file = session_dir / "trial_balance.json"
    if not tb_file.exists():
        raise HTTPException(400, "No trial balance data found. Upload a trial balance first.")
    with open(tb_file) as f:
        trial_balance = json.load(f)

    # Load approved mappings (fallback to suggestions)
    mapping_file = session_dir / "mappings.json"
    sugg_file = session_dir / "suggestions.json"

    if mapping_file.exists():
        with open(mapping_file) as f:
            raw = json.load(f)
    elif sugg_file.exists():
        with open(sugg_file) as f:
            raw = json.load(f)
        # Convert suggestions to mapping format
        raw = [
            {
                "account_code": r.get("account_code", ""),
                "account_name": r.get("account_name", ""),
                "statement": r.get("suggested_statement", "unmapped"),
                "category": r.get("suggested_category", "Unmapped"),
                "subcategory": r.get("suggested_subcategory", "Unmapped"),
                "sign": r.get("sign", 1),
            }
            for r in raw
        ]
    else:
        raise HTTPException(400, "No mappings found. Please review and save mappings first.")

    mappings = [AccountMapping(**r) for r in raw]

    # Optional: load supplementary data
    ar_data, ap_data, fixed_assets = [], [], []
    for fname, varname in [("ar_aging.json", "ar_data"), ("ap_aging.json", "ap_data"), ("fixed_assets.json", "fixed_assets")]:
        fp = session_dir / fname
        if fp.exists():
            with open(fp) as f:
                if varname == "ar_data":
                    ar_data = json.load(f)
                elif varname == "ap_data":
                    ap_data = json.load(f)
                elif varname == "fixed_assets":
                    fixed_assets = json.load(f)

    statements = generate_statements(trial_balance, mappings, req.entity_name, req.period_end, req.currency)

    # Generate notes
    notes = generate_default_notes(statements, ar_data or None, ap_data or None, fixed_assets or None)

    # Persist
    with open(session_dir / "statements.json", "w") as f:
        json.dump(statements, f)
    with open(session_dir / "notes.json", "w") as f:
        json.dump(notes, f)

    return JSONResponse({"statements": statements, "notes": notes})


@router.get("/{session_id}")
def get_statements(session_id: str):
    f = UPLOAD_DIR / session_id / "statements.json"
    nf = UPLOAD_DIR / session_id / "notes.json"
    if not f.exists():
        raise HTTPException(404, "No generated statements. Run /generate first.")
    with open(f) as fp:
        statements = json.load(fp)
    notes = []
    if nf.exists():
        with open(nf) as fp:
            notes = json.load(fp)
    return JSONResponse({"statements": statements, "notes": notes})
