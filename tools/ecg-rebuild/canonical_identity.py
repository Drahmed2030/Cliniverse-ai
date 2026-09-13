"""Content identity: compact sorted-key UTF-8 JSON, integer microvolts, frame-major."""
import argparse, hashlib, json, struct
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('--inputs',type=Path,required=True); a=p.parse_args()
manifest=json.loads(Path(__file__).with_name('reconstruction-evidence.json').read_text())
for name, expected in manifest['inputs'].items():
 if hashlib.sha256((a.inputs/name).read_bytes()).hexdigest()!=expected: raise ValueError('Input identity mismatch: '+name)
records=[]
for kind,rate,count in [('hr',500,5000),('lr',100,1000)]:
 raw=(a.inputs/f'00010_{kind}.dat').read_bytes()
 values=struct.unpack('<'+'h'*(count*12),raw)
 records.append({'sampleRateHz':rate,'sampleCount':count,'samplesMicrovolts':list(values)})
# Under the validated fixed profile 1000 digital units/mV and baseline zero,
# each integer ADC unit is exactly one microvolt; no rounding is performed.
value={'version':'record10-content-json-v1','leadOrder':['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'],'layout':'frame-major','records':records}
print(hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=True).encode('utf-8')).hexdigest())
