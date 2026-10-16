import os
import shutil
from pathlib import Path
from PIL import Image

BASE_DIR = Path(r"C:\MCIT AI Final")
BRAND_PACK_DIR = BASE_DIR / "brand-pack" / "Thoth-Brand-Pack-v1"
CARTOUCHE_DIR = BRAND_PACK_DIR / "cartouche"
LAYERED_U_DIR = BRAND_PACK_DIR / "layered-u"

FRONTEND_PUBLIC = BASE_DIR / "frontend" / "public"
AGENT_PUBLIC = BASE_DIR / "agent" / "public"

def main():
    print("=== Deploying TuT AI Brand Pack ===")
    assert CARTOUCHE_DIR.exists(), f"Cartouche dir missing: {CARTOUCHE_DIR}"

    # 1. Master PNGs
    icon_1024 = CARTOUCHE_DIR / "icons" / "Thoth-Icon-1024.png"
    icon_512 = CARTOUCHE_DIR / "icons" / "Thoth-Icon-512.png"
    icon_192 = CARTOUCHE_DIR / "icons" / "Thoth-Icon-192.png"
    icon_180 = CARTOUCHE_DIR / "icons" / "Thoth-Icon-180.png"
    icon_32 = CARTOUCHE_DIR / "icons" / "Thoth-Icon-32.png"
    svg_master = CARTOUCHE_DIR / "svg" / "thoth-cartouche-master.svg"

    # Replace root logo.png
    root_logo = BASE_DIR / "logo.png"
    shutil.copy2(icon_1024, root_logo)
    print(f"Updated {root_logo}")

    # Frontend public targets
    FRONTEND_PUBLIC.mkdir(parents=True, exist_ok=True)
    shutil.copy2(icon_1024, FRONTEND_PUBLIC / "tut-brand-1024.png")
    shutil.copy2(icon_512, FRONTEND_PUBLIC / "tut-brand.png")
    shutil.copy2(icon_192, FRONTEND_PUBLIC / "icon-192.png")
    shutil.copy2(icon_180, FRONTEND_PUBLIC / "apple-touch-icon.png")
    shutil.copy2(svg_master, FRONTEND_PUBLIC / "tut-brand.svg")
    shutil.copy2(svg_master, FRONTEND_PUBLIC / "logo.svg")

    # Generate multi-size favicon.ico for frontend
    img_1024 = Image.open(icon_1024)
    fe_ico_path = FRONTEND_PUBLIC / "favicon.ico"
    img_1024.save(fe_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    shutil.copy2(icon_32, FRONTEND_PUBLIC / "favicon-32x32.ico")
    print("Frontend public brand icons generated.")

    # Agent public targets
    AGENT_PUBLIC.mkdir(parents=True, exist_ok=True)
    shutil.copy2(icon_1024, AGENT_PUBLIC / "tut-brand-1024.png")
    shutil.copy2(icon_512, AGENT_PUBLIC / "tut-brand.png")
    shutil.copy2(icon_180, AGENT_PUBLIC / "apple-touch-icon.png")
    shutil.copy2(svg_master, AGENT_PUBLIC / "tut-brand.svg")

    # Convert to logo.webp
    logo_webp_path = AGENT_PUBLIC / "logo.webp"
    img_512 = Image.open(icon_512)
    img_512.save(logo_webp_path, format="WEBP")
    print(f"Generated {logo_webp_path}")

    # App icons for agent
    app_icons_dir = AGENT_PUBLIC / "app-icons"
    app_icons_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(icon_192, app_icons_dir / "icon-192x192.png")
    shutil.copy2(icon_192, app_icons_dir / "icon-192x192.maskable.png")
    shutil.copy2(icon_512, app_icons_dir / "icon-512x512.png")
    shutil.copy2(icon_512, app_icons_dir / "icon-512x512.maskable.png")

    # Replace agent favicons
    agent_ico = AGENT_PUBLIC / "favicon.ico"
    img_1024.save(agent_ico, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    for ico_name in [
        "favicon-32x32.ico",
        "favicon-dev.ico",
        "favicon-done.ico",
        "favicon-error.ico",
        "favicon-progress.ico",
        "favicon-32x32-dev.ico",
        "favicon-32x32-done.ico",
        "favicon-32x32-error.ico",
        "favicon-32x32-progress.ico",
        "favicon-done-dev.ico",
        "favicon-error-dev.ico",
        "favicon-progress-dev.ico",
        "favicon-32x-32-error.ico",
    ]:
        target = AGENT_PUBLIC / ico_name
        shutil.copy2(agent_ico, target)
    print("Agent public favicons updated.")

    # Copy full brand pack to both public/brand dirs
    for dest_root in [FRONTEND_PUBLIC / "brand", AGENT_PUBLIC / "brand"]:
        if dest_root.exists():
            shutil.rmtree(dest_root)
        shutil.copytree(BRAND_PACK_DIR, dest_root)
        print(f"Copied full brand pack to {dest_root}")

    print("=== Brand assets successfully deployed to host ===")

if __name__ == "__main__":
    main()
