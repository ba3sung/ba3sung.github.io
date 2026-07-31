from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import os
import shutil
import uuid
import aiofiles
import requests
from typing import Optional

app = FastAPI()

WORK_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TEMP_DIR = os.path.join(WORK_DIR, 'tmp')
os.makedirs(TEMP_DIR, exist_ok=True)


def save_upload_tmp(upload_file: UploadFile) -> str:
    ext = os.path.splitext(upload_file.filename)[1]
    dest = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}{ext}")
    with open(dest, 'wb') as f:
        shutil.copyfileobj(upload_file.file, f)
    return dest


@app.post('/api/convert')
async def convert(file: UploadFile = File(...), target: str = Form(...)):
    """Convert uploaded file to target format.

    Implementation options:
    - If CONVERTAPI_SECRET env var is provided, forward to ConvertAPI (https://www.convertapi.com/)
    - Otherwise return 501 with instructions to install/enable a converter.
    """
    secret = os.getenv('CONVERTAPI_SECRET')
    src_path = save_upload_tmp(file)

    if secret:
        # Use ConvertAPI v2 for conversion
        to_ext = target.lower().lstrip('.')
        url = f"https://v2.convertapi.com/convert/{to_ext}?Secret={secret}"
        with open(src_path, 'rb') as f:
            files = {'File': (os.path.basename(src_path), f)}
            resp = requests.post(url, files=files)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail='Conversion service failed')
        data = resp.json()
        # ConvertAPI returns file info and a URL — download first file
        if 'Files' in data and len(data['Files']) > 0:
            file_url = data['Files'][0].get('Url')
            r = requests.get(file_url, stream=True)
            out_path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}.{to_ext}")
            with open(out_path, 'wb') as out_f:
                for chunk in r.iter_content(chunk_size=8192):
                    out_f.write(chunk)
            return FileResponse(out_path, filename=os.path.basename(out_path))
        raise HTTPException(status_code=502, detail='Unexpected conversion response')
    else:
        # No external converter configured
        return JSONResponse(status_code=501, content={
            'error': 'No converter available on server',
            'message': 'Set CONVERTAPI_SECRET env var for ConvertAPI, or install server-side converters and enable them.'
        })


@app.post('/api/search')
async def search(query: str = Form(...)):
    """Search registered papers (local papers.json) or fallback to Semantic Scholar."""
    local_db = os.path.join(WORK_DIR, 'papers.json')
    results = []
    if os.path.exists(local_db):
        import json
        with open(local_db, 'r', encoding='utf-8') as f:
            papers = json.load(f)
        q = query.lower()
        for p in papers:
            text = ' '.join([p.get('title',''), p.get('abstract',''), ' '.join(p.get('authors',[]))]).lower()
            if q in text:
                results.append(p)
        return {'data': results}
    else:
        # Fallback to Semantic Scholar public API
        try:
            resp = requests.get(
                'https://api.semanticscholar.org/graph/v1/paper/search',
                params={'query': query, 'limit': 9, 'fields': 'title,authors,year,abstract,url,venue'}
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e))
