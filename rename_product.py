import os
import sys

root_dir = '/home/mnvgowda/MNVProjects/UX-Friction-FL-GenAI'

replacements = [
    ('PrivacyEdge', 'ZeroBanner'),
    ('privacyedge', 'zerobanner'),
    ('PRIVACYEDGE', 'ZEROBANNER'),
    ('Privacyedge', 'ZeroBanner'),
    ('UX-Friction', 'ZeroBanner'),
    ('ux-friction', 'zerobanner'),
    ('UX-FRICTION', 'ZEROBANNER'),
    ('UXFriction', 'ZeroBanner'),
    ('uxfriction', 'zerobanner')
]

ignore_dirs = {'.git', 'node_modules', '.next', 'uxfriction', 'zerobanner', '.venv', '__pycache__', 'dist', 'build', '.gemini'}

updated_files = 0

for root, dirs, files in os.walk(root_dir):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if file.endswith('.onnx') or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.pyc') or file == 'rename_product.py':
            continue
            
        file_path = os.path.join(root, file)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements:
                new_content = new_content.replace(old, new)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {file_path}")
                updated_files += 1
        except Exception as e:
            # likely binary or decoding error
            pass

print(f"\nDone! Updated {updated_files} files.")
