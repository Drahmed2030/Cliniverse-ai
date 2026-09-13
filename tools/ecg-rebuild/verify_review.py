"""Compare a reconstructed PDF to the retained reviewed artifact; never promotes eligibility."""
import argparse
import hashlib
import importlib.metadata
import json
import platform
import subprocess
import tempfile
from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageChops

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--reference', type=Path, required=True)
p.add_argument('--rebuilt', type=Path, required=True)
p.add_argument('--inputs', type=Path, required=True)
p.add_argument('--output', type=Path, required=True)
a = p.parse_args()
if a.output.exists():
    raise FileExistsError('Refusing to overwrite evidence')
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
reference_sha = sha(a.reference)
if reference_sha != '237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5':
    raise ValueError('Reference is not the retained reviewed PDF')
r, b = PdfReader(a.reference), PdfReader(a.rebuilt)
if len(r.pages) != 4 or len(b.pages) != 4:
    raise ValueError('Expected four pages in each artifact')
pages = []
with tempfile.TemporaryDirectory() as directory:
    root = Path(directory)
    for name, pdf in [('reference', a.reference), ('rebuilt', a.rebuilt)]:
        subprocess.run(['pdftoppm', '-scale-to', '1200', '-png', str(pdf.resolve()), str(root / name)], check=True, capture_output=True)
    for i, (rp, bp) in enumerate(zip(r.pages, b.pages), 1):
        with Image.open(root / f'reference-{i}.png') as ri, Image.open(root / f'rebuilt-{i}.png') as bi:
            pixels_equal = ri.size == bi.size and ImageChops.difference(ri.convert('RGB'), bi.convert('RGB')).getbbox() is None
        pages.append({'page': i, 'content_stream_equal': rp.get_contents().get_data() == bp.get_contents().get_data(), 'media_box_equal': list(rp.mediabox) == list(bp.mediabox), 'text_equal': rp.extract_text() == bp.extract_text(), 'raster_equal_at_max_1200px': pixels_equal})
report = {
    'schema': 'cliniverse-record10-renderer-reconstruction-v1',
    'reference_sha256': reference_sha, 'rebuilt_sha256': sha(a.rebuilt),
    'renderer_sha256': sha(Path(__file__).with_name('build_review.py')),
    'verifier_sha256': sha(Path(__file__)),
    'measurements_sha256': sha(Path(__file__).with_name('measurements.json')),
    'inputs': {name: sha(a.inputs / name) for name in ['00010_hr.dat', '00010_hr.hea.txt', '00010_lr.dat', '00010_lr.hea.txt']},
    'runtime': {'python': platform.python_version(), **{name: importlib.metadata.version(name) for name in ['numpy', 'scipy', 'reportlab', 'pypdf', 'Pillow']}, 'poppler': subprocess.run(['pdftoppm', '-v'], capture_output=True, text=True, check=True).stderr.splitlines()[0]},
    'pages': pages,
    'comparison_passed': all(all(v for k, v in page.items() if k != 'page') for page in pages),
    'scope': 'Drawing/text/raster equivalence only. No device, printing, publisher checksum, clinical or learner eligibility approval is issued by this tool.'
}
a.output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'comparison_passed': report['comparison_passed'], 'pages': pages}))
if not report['comparison_passed']:
    raise SystemExit(1)
