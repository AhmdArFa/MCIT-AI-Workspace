import requests
import json
import time

def test_notebooks_upload():
    print("\n--- Testing Notebooks Source File Upload ---")
    session = requests.Session()
    # 1. Login
    login_res = session.post(
        "http://127.0.0.1:8502/api/auth/login",
        json={"username": "admin", "password": "1234"},
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    if login_res.status_code != 200:
        print(f"Notebook login failed: {login_res.status_code} {login_res.text}")
        return False
    token = login_res.json().get("token")
    session.headers.update({"Authorization": f"Bearer {token}"})
    print(f"Notebooks Login OK, token length: {len(token)}")

    # 2. Upload a test text file as source
    files = {
        'file': ('test_upload.txt', b'This is a test upload for TuT AI Notebooks verification.\n', 'text/plain')
    }
    data = {
        'type': 'upload',
        'async_processing': 'false',
        'embed': 'false'
    }
    upload_res = session.post(
        "http://127.0.0.1:8502/api/sources",
        files=files,
        data=data,
        timeout=15
    )
    print(f"Notebooks Source Upload response: status={upload_res.status_code}")
    if upload_res.status_code in [200, 201]:
        print(f"Notebooks Source Upload SUCCESS: {upload_res.json()}")
        return True
    else:
        print(f"Notebooks Source Upload FAILED: {upload_res.text}")
        return False

def test_agent_upload():
    print("\n--- Testing TuT Agent File Upload ---")
    session = requests.Session()
    # 1. Check if S3 / RustFS is reachable
    try:
        r = requests.get("http://localhost:9000/tut", timeout=5)
        print(f"RustFS direct response: status={r.status_code}")
    except Exception as e:
        print(f"RustFS direct connect failed: {e}")

    # 2. Test pre-signed PUT upload to RustFS directly
    test_key = "files/test_direct_put.txt"
    test_content = b"TuT Agent direct storage upload test"
    # Call S3 presigned PUT via agent or upload directly to RustFS
    print("Testing direct PUT to RustFS bucket 'tut'...")
    try:
        # Generate an authenticated or public test
        pass
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_notebooks_upload()
    test_agent_upload()
