from PIL import Image
import glob
import os

frames = sorted(glob.glob('snapshots/frame_*.png'))
if not frames:
    print('No frames found in snapshots/')
    raise SystemExit(1)

images = [Image.open(f) for f in frames]
# Convert to RGB if necessary
images = [im.convert('RGBA') for im in images]

out_path = 'snapshots/animation.gif'
# Save as GIF
images[0].save(out_path, save_all=True, append_images=images[1:], optimize=False, duration=100, loop=0)
print('Wrote', out_path)
