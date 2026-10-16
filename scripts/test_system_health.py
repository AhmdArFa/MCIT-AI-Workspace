import requests
import json
import time

def test_system():
    print("=== MCIT AI SYSTEM HEALTH CHECK ===")
    
    # 1. Check Backend Health
    try:
        r = requests.get("http://127.0.0.1:5055/health", timeout=5)
        print(f"[1/5] Backend Health: status={r.status_code}, body={r.text.strip()}")
    except Exception as e:
        print(f"[1/5] Backend Health FAILED: {e}")

    # 2. Authenticate to MCIT AI
    session = requests.Session()
    try:
        login_res = session.post(
            "http://127.0.0.1:5055/api/auth/login",
            json={"username": "admin", "password": "1234"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"[2/5] Admin Login: status={login_res.status_code}")
        token = login_res.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
    except Exception as e:
        print(f"[2/5] Admin Login FAILED: {e}")

    # 3. Check Models API
    try:
        models_res = session.get("http://127.0.0.1:5055/api/models", timeout=5)
        print(f"[3/5] Models API: status={models_res.status_code}")
        models_data = models_res.json()
        print(f"      Models available: {[m.get('name') for m in models_data]}")
    except Exception as e:
        print(f"[3/5] Models API FAILED: {e}")

    # 4. Check Ollama Direct GPU Bridge (Host 11430)
    try:
        t0 = time.time()
        bridge_res = requests.post(
            "http://127.0.0.1:11430/api/chat",
            json={
                "model": "gemma4:e4b",
                "messages": [{"role": "user", "content": "Ping"}],
                "stream": False
            },
            timeout=30
        )
        dt = time.time() - t0
        content = bridge_res.json().get("message", {}).get("content", "").strip()
        print(f"[4/7] Ollama GPU Bridge: responded in {dt:.2f}s -> '{content[:40]}...'")
    except Exception as e:
        print(f"[4/5] Ollama GPU Bridge FAILED: {e}")

    # 5. Check Tut Agent & UI (port 3210)
    try:
        tut_res = requests.get("http://localhost:3210/", allow_redirects=False, timeout=5)
        print(f"[5/6] Tut Agent UI (3210): status={tut_res.status_code}, location={tut_res.headers.get('Location')}")
    except Exception as e:
        print(f"[5/6] Tut Agent UI FAILED: {e}")

    # 6. End-to-End Notebook Chat Execution in MCIT AI
    try:
        # Create a test notebook
        nb_res = session.post("http://127.0.0.1:5055/api/notebooks", json={"name": "Health Check Notebook"})
        nb_id = nb_res.json()["id"]
        # Create a chat session
        sess_res = session.post("http://127.0.0.1:5055/api/chat/sessions", json={"notebook_id": nb_id, "title": "Health Check Chat"})
        sess_id = sess_res.json()["id"]
        # Execute chat
        t0 = time.time()
        chat_res = session.post(
            "http://127.0.0.1:5055/api/chat/execute",
            json={
                "session_id": sess_id,
                "message": "Respond with the single word: READY",
                "context": {}
            },
            timeout=30
        )
        dt = time.time() - t0
        chat_data = chat_res.json()
        ai_reply = chat_data["messages"][-1]["content"] if chat_data.get("messages") else "no messages"
        print(f"[6/6] MCIT AI Chat Execution: status={chat_res.status_code} in {dt:.2f}s -> reply: '{ai_reply.strip()}'")
        # Cleanup test notebook
        session.delete(f"http://127.0.0.1:5055/api/notebooks/{nb_id}")
    except Exception as e:
        print(f"[6/7] MCIT AI Chat Execution FAILED: {e}")

    # 7. Tut Agent S3 Presigned Upload & Download Check
    try:
        t0 = time.time()
        headers = {
            'x-api-key': 'sk-lh-mcitstudio000001',
            'Content-Type': 'application/json'
        }
        file_bytes = b"MCIT AI Tut Agent File Upload Health Verification - Success!"
        size = len(file_bytes)
        test_pathname = f"files/healthcheck/health_{int(time.time())}.txt"
        data = {
            '0': {
                'json': {
                    'pathname': test_pathname,
                    'size': size
                }
            }
        }
        presign_res = requests.post('http://127.0.0.1:3210/trpc/lambda/upload.createS3PreSignedUrl?batch=1', headers=headers, json=data, timeout=5)
        presigned_url = presign_res.json()[0]['result']['data']['json']
        
        # Test PUT to S3
        put_res = requests.put(presigned_url, data=file_bytes, headers={'Content-Type': 'text/plain', 'Content-Length': str(size)}, timeout=5)
        
        # Test DB registration
        create_res = requests.post('http://127.0.0.1:3210/trpc/lambda/file.createFile?batch=1', headers=headers, json={
            '0': {
                'json': {
                    'fileType': 'text/plain',
                    'hash': f'health_{int(time.time() * 1000)}',
                    'name': 'health.txt',
                    'size': size,
                    'url': test_pathname,
                    'metadata': {'filename': 'health.txt', 'path': test_pathname}
                }
            }
        }, timeout=5)
        file_id = create_res.json()[0]['result']['data']['json']['id']
        download_res = requests.get(f'http://127.0.0.1:3210/f/{file_id}', timeout=5)
        dt = time.time() - t0
        print(f"[7/7] Tut Agent S3 File Upload & Download: status={download_res.status_code} in {dt:.2f}s (file_id={file_id})")
    except Exception as e:
        print(f"[7/7] Tut Agent S3 File Upload FAILED: {e}")

    print("=== END SYSTEM HEALTH CHECK ===")

if __name__ == "__main__":
    test_system()

