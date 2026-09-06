#!/usr/bin/env python3
"""Technical lab evidence only; never grants rights, privacy, clinical or release approval.
Usage: python scripts/inspect-echo-media.py MEDIA OUTPUT_DIRECTORY
Requires ffprobe, ffmpeg and Pillow. Run only after source-specific rights review.
Raw media and generated frames must stay outside public/ and outside tracked git files.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw

media, out = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
out.mkdir(parents=True, exist_ok=False)
def run(*args):
    return subprocess.check_output(args)
probe = json.loads(run('ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', str(media)))
(out / 'ffprobe.json').write_text(json.dumps(probe, indent=2))
video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
frames = out / 'frames'
frames.mkdir()
subprocess.run(['ffmpeg', '-v', 'error', '-i', str(media), '-map', '0:v:0', '-vsync', '0', str(frames / '%05d.png')], check=True)
files = sorted(frames.glob('*.png'))
assert len(files) == int(video['nb_read_frames']), 'Incomplete frame extraction'
# Preserve per-frame timestamps and decoded frame hashes, not just container metadata.
pts = json.loads(run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=best_effort_timestamp_time,pkt_duration_time', '-of', 'json', str(media)))
(out / 'timestamps.json').write_text(json.dumps(pts, indent=2))
(out / 'decoded.framemd5').write_bytes(run('ffmpeg', '-v', 'error', '-i', str(media), '-map', '0:v:0', '-f', 'framemd5', '-'))
contacts = []
for offset in range(0, len(files), 36):
    subset = files[offset:offset+36]
    sheet = Image.new('RGB', (1440, ((len(subset)+5)//6)*206), '#222222')
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(subset):
        im = Image.open(path).convert('RGB'); im.thumbnail((240, 180))
        x, y = (index % 6)*240, (index // 6)*206
        sheet.paste(im, (x, y+24)); draw.text((x+4, y+4), f'Frame {offset+index+1}', fill='white')
    name = f'contact-{offset//36+1:02d}.jpg'; sheet.save(out / name, quality=92); contacts.append(name)
times = [float(f['best_effort_timestamp_time']) for f in pts['frames'] if 'best_effort_timestamp_time' in f]
steps = [b-a for a,b in zip(times,times[1:])]
data = media.read_bytes()
result = {
    'sourceSha1': hashlib.sha1(data).hexdigest(), 'sourceSha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data),
    'codec': video['codec_name'], 'width': video['width'], 'height': video['height'],
    'frameRate': video['r_frame_rate'], 'averageFrameRate': video['avg_frame_rate'],
    'frameCount': len(files), 'durationSeconds': float(probe['format']['duration']),
    'audioStreams': [s for s in probe['streams'] if s['codec_type'] == 'audio'],
    'timestampCount': len(times), 'strictlyIncreasingTimestamps': all(x>0 for x in steps),
    'minFrameIntervalSeconds': min(steps) if steps else None, 'maxFrameIntervalSeconds': max(steps) if steps else None,
    'completeContactSheets': contacts, 'reviewState': 'technical-evidence-only-no-approval',
}
(out / 'technical.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['sourceSha256','codec','width','height','frameRate','frameCount','durationSeconds']}))
