from pathlib import Path
import numpy as np,json,hashlib,datetime
from scipy.signal import find_peaks
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import Paragraph,Table,TableStyle
from reportlab.lib.styles import ParagraphStyle
# Reconstructed from the retained original source, not the lost regenerated revision.
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--inputs',type=Path,required=True)
parser.add_argument('--measurements',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--prepared-label-date',required=True,help='Historical visible label for drawing comparison, not execution date')
args=parser.parse_args()
datetime.date.fromisoformat(args.prepared_label_date)
U=args.inputs;out=args.output
if out.exists():raise FileExistsError('Refusing to overwrite output')
# Validate the exact supported WFDB input profile before using inherited decoding.
for kind,fs,count in [('hr',500,5000),('lr',100,1000)]:
 lines=(U/f'00010_{kind}.hea.txt').read_text().strip().splitlines()
 if lines[0].split()!=[f'00010_{kind}','12',str(fs),str(count)]:raise ValueError('Unsupported WFDB dimensions')
 if len(lines)!=13:raise ValueError('Expected twelve leads')
 for line,lead in zip(lines[1:],['I','II','III','AVR','AVL','AVF','V1','V2','V3','V4','V5','V6']):
  fields=line.split()
  if fields[0]!=f'00010_{kind}.dat' or fields[1:5]!=['16','1000.0(0)/mV','16','0'] or fields[-1]!=lead:raise ValueError('Unsupported lead calibration or ordering')
 if (U/f'00010_{kind}.dat').stat().st_size!=count*12*2:raise ValueError('Wrong source size')
x={k:np.fromfile(U/f'00010_{k}.dat',dtype='<i2').reshape(-1,12)/1000 for k in ['hr','lr']}
expected={'hr':'e1ac8a8873741cb85d2533c9c3c79acfaa34b2f9f80a108b6b1dfc0635c0c2e5','lr':'64a407d42f60568f789cb301e839018050af2c6e57e57c3cd24f815ced86b525'}
for k in expected:assert hashlib.sha256((U/f'00010_{k}.dat').read_bytes()).hexdigest()==expected[k]
assert np.all(x['hr'][4947:]==x['hr'][-1])
m=json.loads(args.measurements.read_text())
peaks,_=find_peaks(x['hr'][:,1],height=.45,prominence=.4,distance=250);rr=np.diff(peaks)/500
leads=['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6']
navy=HexColor('#153f54');amber=HexColor('#946019')
c=canvas.Canvas(str(out),pagesize=(297*mm,420*mm),invariant=1);c.setTitle('PTB-XL record 10 - Review-only ECG and measurement sheet');c.setAuthor('Cliniverse AI - technical review preparation')
def txt(s,xp,yp,size=9,color=navy):
 c.setFillColor(color);c.setFont('Helvetica',size);c.drawString(xp*mm,yp*mm,s)
def wavepage(k,page):
 c.setPageSize((297*mm,420*mm));fs=500 if k=='hr' else 100
 txt('PTB-XL RECORD 10 | HUMAN CLINICAL REVIEW ONLY',15,406,15)
 txt(f'{fs} Hz received waveform | full 10-second record | all 12 leads simultaneous',15,398,10)
 txt('25 mm/s and 10 mm/mV at 100% print on A3. Do not use Fit to page for caliper measurement.',15,391,8)
 txt('No diagnosis assigned. Not learner-ready. Raw calibrated samples; no filtering, repair, cropping or normalization.',15,386,8)
 for j,lead in enumerate(leads):
  y=370-j*29;left=35;bottom=y-17;top=y+12
  c.setFillColor(HexColor('#fff2d9'));c.rect((left+9.894*25)*mm,bottom*mm,.106*25*mm,29*mm,stroke=0,fill=1)
  for n in range(251):
   c.setStrokeColor(HexColor('#e5bcbc') if n%5==0 else HexColor('#f6dddd'));c.setLineWidth(.25 if n%5==0 else .12);c.line((left+n)*mm,bottom*mm,(left+n)*mm,top*mm)
  for dy in range(-17,13):
   c.setStrokeColor(HexColor('#e5bcbc') if dy%5==0 else HexColor('#f6dddd'));c.setLineWidth(.25 if dy%5==0 else .12);c.line(left*mm,(y+dy)*mm,285*mm,(y+dy)*mm)
  c.setStrokeColor(navy);c.setLineWidth(.5);path=c.beginPath()
  for i,v in enumerate(x[k][:,j]):
   xx=(left+i/fs*25)*mm;yy=(y+v*10)*mm
   if i==0:path.moveTo(xx,yy)
   else:path.lineTo(xx,yy)
  c.drawPath(path)
  txt(lead,13,y+5,10);c.setLineWidth(.7)
  pulse=c.beginPath();pulse.moveTo(23*mm,y*mm);pulse.lineTo(24*mm,y*mm);pulse.lineTo(24*mm,(y+10)*mm);pulse.lineTo(29*mm,(y+10)*mm);pulse.lineTo(29*mm,y*mm);pulse.lineTo(31*mm,y*mm);c.drawPath(pulse)
  if j==1:
   for z,r in zip('ABC',[2.628,4.640,6.644]):txt(z,left+r*25-1,y+10,8,amber)
 for s in range(11):txt(str(s),35+s*25-1,29,8)
 txt('Time (s) | Separate calibration pulses at left: 1 mV x 200 ms. A/B/C identify measured beats.',15,22,8)
 txt('Amber band: [9.894, 10.000) s. HR has 53 identical terminal samples per lead; LR differs at the edge.',15,16,8,amber)
 txt(f'Original terminal behavior retained. No data extrapolated to 10.000 s. Page {page}/4',15,10,8)
 c.showPage()
wavepage('hr',1);wavepage('lr',2)
style=ParagraphStyle('body',fontName='Helvetica',fontSize=9,leading=12,textColor=navy)
def para(s,y,w=180):
 p=Paragraph(s,style);_,h=p.wrap(w*mm,800);p.drawOn(c,15*mm,y*mm-h);return y-h/mm-3

def table(rows,y,widths):
 data=[[Paragraph(str(v),style) for v in row] for row in rows]
 t=Table(data,colWidths=[v*mm for v in widths]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#eaf1f4')),('GRID',(0,0),(-1,-1),.3,HexColor('#ccd6da')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));_,h=t.wrap(180*mm,800);t.drawOn(c,15*mm,y*mm-h);return y-h/mm-4
c.setPageSize((210*mm,297*mm));txt('REVIEW-ONLY MEASUREMENT SHEET',15,283,15)
y=para('Waveform-derived values below are provisional estimates for clinician verification. They are not source labels, a diagnosis, or approved machine interpretation.',275)
y=table([['Quantity','Waveform-derived result'],['Ventricular rate',f'{60/rr.mean():.1f} bpm = 60 / mean RR; 11 complexes, 10 complete RR intervals.'],['RR regularity metrics',f'Mean {rr.mean()*1000:.1f} ms; median {np.median(rr)*1000:.0f} ms; range {rr.min()*1000:.0f}-{rr.max()*1000:.0f} ms. Sample SD {rr.std(ddof=1)*1000:.1f} ms; CV {rr.std(ddof=1)/rr.mean()*100:.2f}%; RMSSD of RR {np.sqrt(np.mean(np.diff(rr)**2))*1000:.1f} ms.'],['PR / QRS / QT estimates','Three-beat medians: PR 166 ms (about 170); QRS 82 ms (about 80); QT 322.8 ms (about 325). See landmarks below.'],['Corrected QT estimates','Median beat-specific QTc: Fridericia 322.8 ms; Bazett 322.8 ms (both about 325). Individual values differ; see table.'],['Frontal QRS axis estimate','Area-based median +52.9 degrees (about +53); three-beat range +52.0 to +58.2 degrees. Baseline and boundary dependent.'] ],y,[49,131])
y=para('Observed RR intervals are not constant; these short-record metrics describe variability only. No rhythm diagnosis or NN-beat classification was performed. SD and RMSSD here are not validated long-duration HRV measurements.',y)
y=table([['Beat (R time)','PR ms','QRS ms','QT ms','Prev. RR ms','QTcF / QTcB ms','Axis deg']]+[[f'{z} ({v["R"]:.3f} s)',f'{v["PR_ms"]:.0f}',f'{v["QRS_ms"]:.0f}',f'{v["QT_ms"]:.1f}',f'{v["RR_s"]*1000:.0f}',f'{v["QTcF_ms"]:.1f} / {v["QTcB_ms"]:.1f}',f'+{v["axis_deg"]:.1f}'] for z,v in zip('ABC',m)],y,[35,18,18,22,25,40,22])
y=para('<b>Candidate landmarks in seconds from record start</b> (sample grid = 2 ms; tangent intersections are calculated, not exact sampled endpoints).',y)
y=table([['Beat','P onset','QRS onset','QRS offset','V5 T end']]+[[z,f'{v["P_on"]:.3f}',f'{v["QRS_on"]:.3f}',f'{v["QRS_off"]:.3f}',f'{v["T_end_tangent"]:.4f}'] for z,v in zip('ABC',m)],y,[20,40,40,40,40])
y=para('<b>R-peak times (s):</b> '+', '.join(f'{v/500:.3f}' for v in peaks)+'.<br/><b>Complete RR intervals (ms):</b> '+', '.join(f'{v*1000:.0f}' for v in rr)+'.',y)
y=para('<b>Clinical review:</b> Reviewer __________________ Date __________<br/>PR ______ QRS ______ QT ______ QTc ______ Formula __________<br/>Axis ______ Terminal caveat accepted / further review required: __________',y)
assert y>12,y
txt('No clinical promotion. No repository, ledger, database or schema changes. Page 3/4',15,9,8);c.showPage()
c.setPageSize((210*mm,297*mm));txt('METHODS, PROVENANCE & LIMITATIONS',15,283,14)
y=275
y=para('<b>Signal provenance.</b> Only the already supplied 00010_hr.dat / 00010_lr.dat and their HEA.TXT headers were used as ECG data. Both byte hashes match the prior inspection. Header metadata: 12 channels; 500 / 100 Hz; 5,000 / 1,000 frames; 1,000 digital units/mV; baseline zero; WFDB format 16. Source metadata do not supply the reported rate or intervals. No diagnostic source labels were used.',y)
y=para('<b>Measurement method.</b> Measurements use only the 500 Hz original samples, decoded as little-endian signed 16-bit interleaved channels, divided by header gain. Rendering connects every sample; it does not resample or smooth. R candidates were detected in raw lead II (height 0.45 mV, prominence 0.40 mV, minimum separation 0.5 s) and visually checked against the full tracing. The first R is included for RR measurement; its preceding P is outside the record. No artificial preceding/following interval was added.',y)
y=para('<b>PR and QRS.</b> P onsets were visually estimated from low-amplitude lead II deflections with V5/V6 context. QRS onsets/offsets were visually estimated across I, II, V2, V5 and V6 on beats A-C. These are candidate multi-lead calipers, not validated earliest/latest global boundaries across all leads. PR = QRS onset - P onset; QRS duration = offset - onset. P onset ambiguity and QRS offset selection materially affect precision; displayed 2 ms landmarks do not imply 2 ms clinical accuracy.',y)
y=para('<b>QT and QTc.</b> QT = candidate QRS onset to tangent-defined T end in V5. On each selected beat, a least-squares 20 ms straight-line fit was moved over raw V5 samples, with window starts R+200 to R+318 ms; the most negative slope was selected. Its intersection with the median of the ten samples immediately preceding QRS onset defined T end. This local fitting estimates a caliper; it does not replace or filter any waveform samples. No validated automated delineator or independent clinician confirmation was used.',y)
y=para('Tangent fit windows A/B/C (s): 2.878-2.898 / 4.884-4.904 / 6.892-6.912. V5 reference levels (mV): -0.085 / -0.004 / -0.065. Gradual baseline changes and different T-end methods can shift QT. Tangent estimates need manual confirmation.<br/><b>Fridericia:</b> QTcF = QT / RR^(1/3). <b>Bazett:</b> QTcB = QT / sqrt(RR). QT and preceding RR are in seconds; result multiplied by 1,000 for ms. Corrections were calculated per beat, then summarized by median; not from a pooled average rate.',y)
y=para('<b>Frontal QRS axis.</b> Trapezoidal signed QRS areas in I and aVF over each candidate QRS window, after subtracting the per-lead median of the ten pre-onset samples for calculation only. Angle = atan2(2 x area(aVF) / sqrt(3), area(I)), expressed in degrees under ideal frontal limb-lead geometry. This is an area-based estimate, not a source-reported or peak-amplitude axis. Boundary/baseline uncertainty and electrode placement cannot be resolved from this short record.',y)
y=para('<b>Retained technical caveat.</b> HR samples 4947-4999 are constant per channel: 53 samples covering [9.894, 10.000) s, with last stored time 9.998 s. Cause remains undetermined. LR has edge differences, most visible in V2. Both versions are rendered in full; no crop, repair, interpolation, filter, or terminal replacement was applied. Beats A-C were chosen for measurement away from the boundary only; the original record remains intact. Interior constant runs and slow baseline variation remain visible. No confidence interval is established; human review may shift calipers by tens of milliseconds.',y)
for k in ['hr','lr']:
 y=para(f'<b>SHA-256 00010_{k}.dat</b><br/><font size="7">{expected[k]}</font>',y)
y=para('<b>Method references (no external ECG data imported):</b><br/>ESC, How to measure the QT interval (2024): escardio.org, Cardiogenomics Insights, volume 9.<br/>Vandenberk et al. Which QT Correction Formulae to Use for QT Monitoring? (2016), DOI: 10.1161/JAHA.116.003264.<br/>WFDB format specification: wfdb.io/spec/header-files.html and signal-files.html.<br/><b>Dataset attribution:</b> Wagner et al., PTB-XL v1.0.3, PhysioNet (2022), DOI: 10.13026/kfzx-aw45; CC BY 4.0 per existing manifest. Uploaded-byte SHA values are not an independent publisher digest verification.',y)
assert y>12,y
txt('Prepared '+args.prepared_label_date+' | Review only - not learner-ready. Page 4/4',15,9,8)
c.save();print(out);print('Page 4 remaining y mm',y)
