import json
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from services.data_parser import parse_file, extract_trial_balance, extract_ar_aging, extract_ap_aging, extract_fixed_assets
from services.account_mapper import suggest_mappings

router = APIRouter(prefix="/upload", tags=["upload"])

import os
if os.environ.get("VERCEL"):
    UPLOAD_DIR = Path("/tmp") / "uploads"
else:
    UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

FILE_TYPE_PARSERS = {
    "trial_balance": extract_trial_balance,
    "ar_aging": extract_ar_aging,
    "ap_aging": extract_ap_aging,
    "fixed_assets": extract_fixed_assets,
}


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    session_id: str = Form(None),
):
    if file_type not in FILE_TYPE_PARSERS:
        raise HTTPException(400, f"Unknown file_type: {file_type}. Must be one of {list(FILE_TYPE_PARSERS)}")

    if not session_id:
        session_id = str(uuid.uuid4())

    session_dir = UPLOAD_DIR / session_id
    session_dir.mkdir(exist_ok=True)

    contents = await file.read()
    if not contents:
        raise HTTPException(400, "Uploaded file is empty.")

    try:
        df, meta = parse_file(contents, file.filename)
    except Exception as e:
        raise HTTPException(400, f"Could not parse '{file.filename}': {e}")

    if df.empty:
        raise HTTPException(400, "No data found in the file after parsing.")

    parser = FILE_TYPE_PARSERS[file_type]
    try:
        records = parser(df, meta)
    except Exception as e:
        raise HTTPException(400, f"Error extracting {file_type} data: {e}")

    if not records:
        raise HTTPException(400, f"No valid {file_type.replace('_', ' ')} rows found. Check that your file has an Account Name column and data rows.")

    # Persist parsed data
    data_file = session_dir / f"{file_type}.json"
    with open(data_file, "w") as f:
        json.dump(records, f)

    # If trial balance, also generate mapping suggestions
    suggestions = []
    if file_type == "trial_balance":
        suggestions = suggest_mappings(records)
        sugg_file = session_dir / "suggestions.json"
        with open(sugg_file, "w") as f:
            json.dump(suggestions, f)

    # Build a preview (first 50 rows)
    preview_cols = list(df.columns)
    preview_rows = df.head(50).astype(str).replace("None", "").replace("nan", "").values.tolist()

    return JSONResponse({
        "session_id": session_id,
        "file_type": file_type,
        "filename": file.filename,
        "row_count": len(records),
        "meta": meta,
        "preview": {"columns": preview_cols, "rows": preview_rows},
        "records": records[:200],
        "suggestions": suggestions,
    })
