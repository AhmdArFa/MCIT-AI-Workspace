import os
from PIL import Image, ImageDraw

def build_all_favicons():
    source_path = 'brand-pack/Thoth-Brand-Pack-v1/cartouche/icons/Thoth-Icon-1024.png'
    src = Image.open(source_path).convert('RGBA')
    bbox = (139, 241, 874, 783) # 735 x 542
    mark = src.crop(bbox)

    def generate_canvas(status=None):
        size = 1024
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # OLED True Black squircle
        radius = 180
        draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=(0, 0, 0, 255))
        
        # Maximize size: 930px wide
        new_w = 930
        new_h = int(mark.height * (new_w / mark.width))
        scaled = mark.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        paste_x = (size - new_w) // 2
        paste_y = (size - new_h) // 2
        canvas.alpha_composite(scaled, (paste_x, paste_y))
        
        if status == 'done':
            draw.ellipse([size - 220, size - 220, size - 40, size - 40], fill=(16, 185, 129, 255), outline=(0, 0, 0, 255), width=24)
        elif status == 'error':
            draw.ellipse([size - 220, size - 220, size - 40, size - 40], fill=(239, 68, 68, 255), outline=(0, 0, 0, 255), width=24)
        elif status == 'progress':
            draw.ellipse([size - 220, size - 220, size - 40, size - 40], fill=(6, 182, 212, 255), outline=(0, 0, 0, 255), width=24)
            
        return canvas

    master_default = generate_canvas(None)
    master_done = generate_canvas('done')
    master_error = generate_canvas('error')
    master_progress = generate_canvas('progress')

    ico_sizes_full = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    ico_sizes_32 = [(32, 32), (16, 16)]

    # 1. Frontend public
    frontend_pub = 'frontend/public'
    master_default.save(os.path.join(frontend_pub, 'favicon.ico'), format='ICO', sizes=ico_sizes_full)
    master_default.save(os.path.join(frontend_pub, 'favicon-32x32.ico'), format='ICO', sizes=ico_sizes_32)
    master_default.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(frontend_pub, 'icon-192.png'))
    master_default.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(frontend_pub, 'apple-touch-icon.png'))
    
    # Frontend src/app
    frontend_app = 'frontend/src/app'
    if os.path.exists(frontend_app):
        master_default.save(os.path.join(frontend_app, 'favicon.ico'), format='ICO', sizes=ico_sizes_full)

    # 2. Agent public
    agent_pub = 'agent/public'
    if os.path.exists(agent_pub):
        # Default
        for fn in ['favicon.ico', 'favicon-dev.ico']:
            master_default.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_full)
        for fn in ['favicon-32x32.ico', 'favicon-32x32-dev.ico']:
            master_default.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_32)
            
        # Done
        for fn in ['favicon-done.ico', 'favicon-done-dev.ico']:
            master_done.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_full)
        for fn in ['favicon-32x32-done.ico', 'favicon-32x32-done-dev.ico']:
            master_done.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_32)
            
        # Error
        for fn in ['favicon-error.ico', 'favicon-error-dev.ico', 'favicon-32x-32-error.ico']:
            master_error.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_full)
        for fn in ['favicon-32x32-error.ico', 'favicon-32x32-error-dev.ico']:
            master_error.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_32)
            
        # Progress
        for fn in ['favicon-progress.ico', 'favicon-progress-dev.ico']:
            master_progress.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_full)
        for fn in ['favicon-32x32-progress.ico', 'favicon-32x32-progress-dev.ico']:
            master_progress.save(os.path.join(agent_pub, fn), format='ICO', sizes=ico_sizes_32)
            
        master_default.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(agent_pub, 'apple-touch-icon.png'))

    print('Favicons successfully built across frontend and agent!')

if __name__ == '__main__':
    build_all_favicons()
