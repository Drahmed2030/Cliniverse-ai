"""Quarantined Echo batch recipe; no clinical/privacy/release approval.

python3 scripts/prepare-echo-pathology-batch.py LOCAL_SOURCE_ROOT NEW_OUTPUT_ROOT
Both paths must be outside Git. Uses pinned policy and the existing technical recipe
helpers. No download, crop, masking, enhancement, interpolation or speed conversion.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / 'app/lib/clinicalMedia/echoPathologyDerivativePolicy.json'
spec = importlib.util.spec_from_file_location('echo_technical', ROOT / 'scripts/prepare-echo-apical-hcm-derivative.py')
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)


def write(path, obj):
    path.write_text(json.dumps(obj, indent=2) + '\n')


def evaluate(screen):
    code = "import {evaluatePathologySource} from './app/lib/clinicalMedia/echoPathologyDerivativeReadiness.ts'; import {readFileSync} from 'node:fs'; console.log(JSON.stringify(evaluatePathologySource(JSON.parse(readFileSync(0,'utf8')))))"
    return json.loads(subprocess.check_output(['node', '--experimental-strip-types', '--input-type=module', '-e', code], input=json.dumps(screen), text=True, cwd=ROOT))


def faststart(path):
    data = path.read_bytes()
    boxes = []
    pos = 0
    while pos + 8 <= len(data):
        size = int.from_bytes(data[pos:pos+4], 'big')
        boxes.append(data[pos+4:pos+8].decode('ascii'))
        if size == 1:
            size = int.from_bytes(data[pos+8:pos+16], 'big')
        if size < 8:
            break
        pos += size
    return 'moov' in boxes and 'mdat' in boxes and boxes.index('moov') < boxes.index('mdat')


def process(rule, source_root, output_root):
    c = rule['candidateId']
    source_dir = source_root / c
    source, page = source_dir / 'original.webm', source_dir / 'source.html'
    old = json.loads((ROOT / 'docs/echo-media-lab-2026-09-06' / c / 'evidence.json').read_text())
    rights = old['rights']
    # Read-only verification precedes ffmpeg and candidate output creation.
    screen = dict(candidateId=c, sourceSha256=helpers.sha256(source) if source.exists() else None,
                  sourcePageSha256=helpers.sha256(page) if page.exists() else None,
                  commercialReuseVerified=rights.get('commercialReuseVerified') is True,
                  licenseId=rights['licenseId'], completeFrameReview=old['review']['allFramesContactSheetReviewed'] is True,
                  noDirectIdentifiers=old['review']['directPatientIdentifiersObserved'] is False,
                  noUnresolvedDateTime=old['review']['burnedInAcquisitionDateTimeObserved'] is False,
                  noUnexpectedAudio=old['technical']['audioStreams'] == [],
                  usableViewContext=not rule['specialistRequiredBeforeTransformation'], anatomyPreservable=True,
                  prohibitedClaims=rule['prohibitedClaims'])
    readiness = evaluate(screen)
    destdir = output_root / c
    destdir.mkdir()
    write(destdir / 'screen.json', screen)
    write(destdir / 'readiness.json', readiness)
    if readiness['disposition'] == 'reject' or not source.exists():
        return
    before_probe = helpers.probe(source)
    before = helpers.summarize(before_probe)
    for k in ('codec', 'width', 'height', 'frameRate', 'frameCount', 'durationSeconds'):
        if before[k] != old['technical'][k]:
            raise ValueError(f'{c}: source metadata mismatch {k}')
    pts = before['timestampsSeconds']
    if len(pts) != before['frameCount'] or any(b <= a for a, b in zip(pts, pts[1:])):
        raise ValueError(f'{c}: discontinuous timestamps')
    before_probe.pop('frames')
    write(destdir / 'source-ffprobe.json', before_probe)
    record = dict(candidateId=c, sourceSha1=hashlib.sha1(source.read_bytes()).hexdigest(),
                  sourceSha256=screen['sourceSha256'], sourcePageSha256=screen['sourcePageSha256'],
                  sourceBytes=source.stat().st_size, before=before, after=None,
                  derivativeFilename=None, derivativeSha256=None, derivativeBytes=None,
                  learnerReady=False, binaryCommitEligible=False)
    if readiness['disposition'] != 'process-derivative':
        write(destdir / 'technical.json', record)
        return
    width, height = before['width'], before['height']
    pad_x, pad_y = width % 2, height % 2
    filename = c + '-preview-v1.mp4'
    destination = destdir / filename
    parameters = ['-map', '0:v:0', '-map_metadata', '-1', '-map_chapters', '-1', '-an',
                  '-vf', f'pad={width+pad_x}:{height+pad_y}:0:0:black,setsar=1',
                  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high',
                  '-level:v', '3.1', '-pix_fmt', 'yuv420p', '-bf', '0', '-fps_mode', 'passthrough',
                  '-enc_time_base', '1:1000', '-video_track_timescale', '1000', '-movflags', '+faststart']
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-n', '-i', str(source), *parameters, str(destination)], check=True)
    after_probe = helpers.probe(destination)
    after = helpers.summarize(after_probe)
    if before['timestampsSeconds'] != after['timestampsSeconds'] or before['frameCount'] != after['frameCount']:
        raise ValueError(f'{c}: frame/timestamp preservation failed; output held')
    delta = round(after['durationSeconds']*1000) - round(before['durationSeconds']*1000)
    if abs(delta) > 1 or not faststart(destination):
        raise ValueError(f'{c}: duration/container validation failed; output held')
    after_probe.pop('frames')
    write(destdir / 'derivative-ffprobe.json', after_probe)
    record.update(derivativeFilename=filename, derivativeSha256=helpers.sha256(destination),
                  derivativeBytes=destination.stat().st_size, after=after, parameters=parameters,
                  timestampSequenceIdentical=True, durationDifferenceMilliseconds=delta,
                  durationNote='At most 1 ms final sample/container rounding; presentation times unchanged.',
                  padding=dict(rightPixels=pad_x, bottomPixels=pad_y, color='black'),
                  crop=None, mask=None, interpolation=False, framesInvented=False, speedChange=False,
                  faststart=True, decodeStatus='all-frames-decoded-without-reported-errors',
                  contactSheetReview='pending', audioState='no-source-or-derivative-audio',
                  ffmpegVersion=subprocess.check_output(['ffmpeg', '-version'], text=True).splitlines()[0])
    write(destdir / 'technical.json', record)
    print(c, record['derivativeSha256'], before['frameCount'], after['frameCount'], flush=True)


def main():
    source_root, output_root = [Path(p).resolve() for p in sys.argv[1:]]
    for p in (source_root, output_root):
        if p == ROOT or ROOT in p.parents:
            raise ValueError('Media paths must be outside repository')
    rules = json.loads(POLICY.read_text())
    if len({r['candidateId'] for r in rules}) != len(rules):
        raise ValueError('Duplicate candidate ID')
    output_root.mkdir(parents=True, exist_ok=False)
    for rule in rules:
        process(rule, source_root, output_root)


if __name__ == '__main__':
    main()
