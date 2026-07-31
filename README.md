# ThesisFinder — 로컬 변환 및 검색 서버 설치 안내

이 안내서는 로컬에서 변환 API와 검색 기능을 실행하는 방법을 설명합니다.

구성요소
- `backend/app.py` : FastAPI 서버 (변환 및 검색 엔드포인트)
- `papers.json` : 로컬에 등록된 샘플 논문 데이터

설치 (권장: 가상환경)
1. Python 3.10+ 설치
2. 가상환경 생성 및 활성화

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

3. 의존성 설치
```bash
cd backend
pip install -r requirements.txt
```

실행
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

변환 동작 설정
- 이 프로젝트는 서버에서 실제 파일 변환을 수행하기 위해 ConvertAPI(서드파티 서비스)를 사용하는 옵션을 제공합니다.
- 무료 또는 상용 키를 발급받아 환경변수 `CONVERTAPI_SECRET`에 설정하면 업로드된 파일을 ConvertAPI로 전달하여 변환합니다.

예 (Linux / macOS):
```bash
export CONVERTAPI_SECRET="your-secret-here"
uvicorn app:app --reload
```

예 (Windows PowerShell):
```powershell
$env:CONVERTAPI_SECRET = 'your-secret-here'
uvicorn app:app --reload
```

로컬 논문 검색
- `papers.json`에 논문을 추가하면 `POST /api/search`가 로컬 데이터를 사용해 키워드 검색을 수행합니다.

프론트엔드 연동
- `thesisfinder.html`의 업로드 UI는 `/api/convert`로 파일을 전송합니다. 변환이 성공하면 브라우저가 변환된 파일을 다운로드합니다.
- 검색은 `/api/search`로 쿼리를 전송하며 로컬 DB가 없으면 Semantic Scholar API로 폴백됩니다.

주의
- HWP/HWPX 변환은 ConvertAPI 같은 서드파티 서비스나 서버에 별도 변환 툴(예: 한컴 관련 유틸리티)이 필요합니다. 변환을 서버에서 직접 처리하려면 해당 툴을 설치하고 `app.py`에 통합하세요.
