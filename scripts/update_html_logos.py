import re

path = r"C:\Users\abdoh\OneDrive\Documents\Desktop\TuT_AI_Marketing_Pitch_Deck.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

logo_tag = '<img src="mcit-logo.png" onerror="this.src=\'docs/mcit-logo.png\'" alt="MCIT" class="mcit-logo-top">'
cover_logo = '<img src="mcit-logo.png" onerror="this.src=\'docs/mcit-logo.png\'" alt="Ministry of Communications and Information Technology (MCIT)" class="mcit-cover-logo" style="margin-bottom: 20px;">'

lines = content.splitlines(keepends=True)
new_lines = []
for idx, line in enumerate(lines):
    new_lines.append(line)
    if '<div class="slide">' in line:
        # Check if next line already has mcit-logo-top
        next_line = lines[idx+1] if idx+1 < len(lines) else ""
        if 'mcit-logo-top' not in next_line:
            new_lines.append(f"      {logo_tag}\n")
    elif '<!-- Slide 14: Conclusion -->' in line:
        pass

result = "".join(new_lines)

# Handle Slide 14 cover slide
if '<!-- Slide 14: Conclusion -->' in result and 'mcit-cover-logo' not in result.split('<!-- Slide 14: Conclusion -->')[1][:150]:
    result = result.replace(
        '<!-- Slide 14: Conclusion -->\n    <div class="slide cover-slide">',
        f'<!-- Slide 14: Conclusion -->\n    <div class="slide cover-slide">\n      {cover_logo}'
    )

with open(path, "w", encoding="utf-8") as f:
    f.write(result)

print("Updated HTML slides with Ministry Logo successfully!")
