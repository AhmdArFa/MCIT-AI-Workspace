import subprocess

def run_cmd(cmd):
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if p.returncode != 0:
        print(f"Error running {cmd}: {p.stderr}")
    else:
        print(f"OK: {cmd}")

# Copy into mcit-ai-mcit-ai-1
files_mcit = [
    ("frontend/public/favicon.ico", "/app/frontend/public/favicon.ico"),
    ("frontend/public/favicon-32x32.ico", "/app/frontend/public/favicon-32x32.ico"),
    ("frontend/public/favicon.ico", "/app/frontend/src/app/favicon.ico"),
    ("frontend/public/favicon.ico", "/app/frontend/.next/server/app/favicon.ico"),
    ("frontend/public/favicon.ico", "/app/frontend/.next/server/app/favicon.ico.body"),
    ("frontend/public/favicon.ico", "/app/frontend/.next/static/media/favicon.2vob68tjqpejf.ico"),
    ("frontend/public/apple-touch-icon.png", "/app/frontend/public/apple-touch-icon.png"),
    ("frontend/public/icon-192.png", "/app/frontend/public/icon-192.png")
]

for src, dst in files_mcit:
    run_cmd(f"docker cp \"{src}\" mcit-ai-mcit-ai-1:\"{dst}\"")

# Copy into mcit-ai-tut-agent-1
agent_dirs = [
    "/app/public",
    "/app/public/_spa",
    "/app/public/_spa-auth",
    "/app/dist/desktop",
    "/app/dist/mobile"
]

agent_files = [
    "favicon.ico",
    "favicon-32x32.ico",
    "favicon-dev.ico",
    "favicon-32x32-dev.ico",
    "favicon-done.ico",
    "favicon-32x32-done.ico",
    "favicon-done-dev.ico",
    "favicon-32x32-done-dev.ico",
    "favicon-error.ico",
    "favicon-32x32-error.ico",
    "favicon-error-dev.ico",
    "favicon-32x32-error-dev.ico",
    "favicon-32x-32-error.ico",
    "favicon-progress.ico",
    "favicon-32x32-progress.ico",
    "favicon-progress-dev.ico",
    "favicon-32x32-progress-dev.ico",
    "apple-touch-icon.png"
]

for d in agent_dirs:
    for f in agent_files:
        run_cmd(f"docker cp \"agent/public/{f}\" mcit-ai-tut-agent-1:\"{d}/{f}\"")

print("All favicons copied into containers successfully!")
