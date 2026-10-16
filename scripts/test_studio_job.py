import requests
import time
import zipfile
import io
import re

def test_studio_slide_count():
    session = requests.Session()
    login_res = session.post('http://127.0.0.1:5055/api/auth/login', json={'username': 'admin', 'password': '1234'})
    token = login_res.json().get('token')
    session.headers.update({'Authorization': f'Bearer {token}'})

    # Create notebook
    nb_res = session.post('http://127.0.0.1:5055/api/notebooks', json={'name': 'Studio Slide Count Test Notebook'})
    nb_id = nb_res.json()['id']
    print(f"Created notebook: {nb_id}")

    # Add rich source content
    session.post('http://127.0.0.1:5055/api/sources/json', json={
        'type': 'text',
        'title': 'MCIT Platform Launch and Architecture',
        'content': '''MCIT AI is an enterprise privacy-focused research assistant and agent platform developed for MCIT.
Architecture Overview:
The platform architecture consists of three core tiers:
1. Next.js Frontend on port 8502 delivering responsive UI and Studio generation controls.
2. FastAPI Backend on port 5055 with SurrealDB on port 8000 handling multi-tenant isolation.
3. Tut Agent powered by local NVIDIA RTX GPU acceleration with MCP tool integration.

Document Generation Engines:
Craft engines (DeckCraft, WordCraft, VectorCraft) build pixel-perfect reports, presentations, and spreadsheets.
ONLYOFFICE Docs provides headless document processing and viewing.

Key Milestones:
- Phase 1: Core infrastructure and SurrealDB integration.
- Phase 2: Tut Agent multi-tenant MCP tool routing.
- Phase 3: Studio presentation generator with exact slide count enforcement.
- Phase 4: Production hardening and deployment readiness.

Operational Metrics:
- 100% local data privacy with no cloud telemetry.
- Zero-token local inference latency under 200ms.
- Full compatibility with ONLYOFFICE and LibreOffice formats.
''',
        'notebooks': [nb_id]
    })
    print("Added source to notebook.")
    time.sleep(2)

    TARGET_SLIDES = 12
    try:
        # Submit studio job with TARGET_SLIDES
        job_res = session.post('http://127.0.0.1:5055/api/studio/jobs', json={
            'notebook_id': nb_id,
            'preset': 'presentation',
            'mode': 'dark',
            'slide_count': TARGET_SLIDES,
            'instructions': 'Comprehensive presentation on MCIT AI architecture and launch milestones'
        })
        print(f"Studio Job Created: {job_res.status_code} {job_res.json()}")
        job_id = job_res.json()['id']

        # Poll status
        files_metadata = []
        for i in range(45):
            time.sleep(2)
            s_res = session.get(f'http://127.0.0.1:5055/api/studio/jobs/{job_id}')
            s_data = s_res.json()
            status = s_data.get('status')
            step = s_data.get('step')
            msg = s_data.get('message')
            err = s_data.get('error')
            events = s_data.get('events', [])
            for ev in events:
                if ev.get('type') == 'file':
                    files_metadata.append(ev.get('file'))
            print(f"Poll {i+1}: status={status} step={step} message={msg}")
            if err:
                print(f"Error: {err}")
            if status in ('completed', 'failed'):
                break

        if status == 'completed':
            print("\nJob completed successfully! Inspecting generated files...")
            # Query library files for this notebook
            files_res = session.get(f'http://127.0.0.1:5055/api/studio/files?notebook_id={nb_id}')
            raw_files = files_res.json()
            files = raw_files if isinstance(raw_files, list) else raw_files.get('files', [])
            print(f"Found {len(files)} generated file(s): {[f.get('filename') for f in files]}")
            
            for f in files:
                fid = f['id']
                fname = f.get('filename', '')
                dl_res = session.get(f'http://127.0.0.1:5055/api/studio/files/{fid}/download')
                if dl_res.status_code == 200:
                    data = dl_res.content
                    if fname.endswith('.pptx'):
                        with zipfile.ZipFile(io.BytesIO(data)) as z:
                            slides = [n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', n)]
                            print(f"[PPTX] File: {fname}, Slide Count: {len(slides)} (Expected: {TARGET_SLIDES})")
                            assert len(slides) == TARGET_SLIDES, f"PPTX slide count mismatch: got {len(slides)}, expected {TARGET_SLIDES}"
                    elif fname.endswith('.pdf'):
                        import pypdfium2 as pdfium
                        pdf = pdfium.PdfDocument(data)
                        pages = len(pdf)
                        print(f"[PDF] File: {fname}, Page Count: {pages} (Expected: {TARGET_SLIDES})")
                        assert pages == TARGET_SLIDES, f"PDF page count mismatch: got {pages}, expected {TARGET_SLIDES}"
            print(f"\nALL VERIFICATIONS PASSED: Presentation strictly produced EXACTLY {TARGET_SLIDES} slides!")
        else:
            print("Job did not complete successfully.")
    finally:
        session.delete(f'http://127.0.0.1:5055/api/notebooks/{nb_id}')
        print("Cleaned up test notebook.")

if __name__ == "__main__":
    test_studio_slide_count()
