import subprocess
import os

test_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
<rect width="600" height="400" fill="#FAF9F5"/>
<text x="300" y="200" font-family="Caveat, cursive" font-size="48" font-weight="700" text-anchor="middle" fill="#1E293B">Handwritten Architecture</text>
</svg>"""

with open("/tmp/test_hand.svg", "w") as f:
    f.write(test_svg)

res = subprocess.run(["vectorcraft-cli", "convert", "/tmp/test_hand.svg", "/tmp/test_hand.png", "--scale", "1"], capture_output=True, text=True)
print("VectorCraft stdout:", res.stdout)
print("VectorCraft stderr:", res.stderr)
print("VectorCraft exit code:", res.returncode)

if os.path.exists("/tmp/test_hand.png"):
    print("PNG size:", os.path.getsize("/tmp/test_hand.png"))
else:
    print("PNG not generated")
