import urllib.request
import urllib.parse
import json
import time

def test():
    # 1. Test upload.createS3PreSignedUrl
    url = "http://localhost:3210/trpc/lambda/upload.createS3PreSignedUrl?batch=1"
    headers = {
        "x-api-key": "sk-lh-mcitstudio000001",
        "Content-Type": "application/json"
    }
    pathname = f"files/test/{int(time.time())}_test.txt"
    payload = {"0": {"json": {"pathname": pathname, "size": 12}}}
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print("createS3PreSignedUrl response:", data)
            presigned_url = data[0]["result"]["data"]["json"]
    except Exception as e:
        print("Presign failed:", e)
        return

    # 2. Test PUT to presigned_url
    print("PUTing to:", presigned_url)
    req2 = urllib.request.Request(presigned_url, data=b"Hello World!", headers={"Content-Type": "text/plain"}, method="PUT")
    try:
        with urllib.request.urlopen(req2) as resp:
            print("S3 PUT status:", resp.status)
    except Exception as e:
        print("S3 PUT failed:", e)
        return

    # 3. Test file.createFile
    url3 = "http://localhost:3210/trpc/lambda/file.createFile?batch=1"
    payload3 = {
        "0": {
            "json": {
                "fileType": "text/plain",
                "hash": f"test_{int(time.time()*1000)}",
                "name": "test.txt",
                "size": 12,
                "url": pathname,
                "metadata": {"filename": "test.txt", "path": pathname}
            }
        }
    }
    req3 = urllib.request.Request(url3, data=json.dumps(payload3).encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req3) as resp:
            data3 = json.loads(resp.read().decode())
            print("createFile response:", data3)
            file_id = data3[0]["result"]["data"]["json"].get("id")
    except Exception as e:
        print("createFile failed:", e)
        return

    print("Created file_id:", file_id)

    # 4. Test accessing file via proxy /f/:id
    url4 = f"http://localhost:3210/f/{file_id}"
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    try:
        resp4 = opener.open(url4)
        print("Proxy /f/:id status:", resp4.status)
    except urllib.error.HTTPError as e:
        print("Proxy /f/:id HTTPError:", e.code, dict(e.headers))

test()
