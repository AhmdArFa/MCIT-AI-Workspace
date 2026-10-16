with open(r"C:\MCIT AI Final\frontend\src\app\globals.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

tut_css = "".join(lines[460:]) # from line 461 to end

with open(r"C:\MCIT AI Final\scripts\tut_patch.css", "w", encoding="utf-8") as f:
    f.write("\n/* === TUT.HTML INJECTED STYLES === */\n" + tut_css)

print("Generated tut_patch.css, length:", len(tut_css))
