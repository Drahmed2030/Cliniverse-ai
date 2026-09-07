"""Local-only Apical HCM laboratory recipe. Does not grant privacy/clinical/release approval.

Usage: python3 scripts/prepare-echo-apical-hcm-derivative.py SOURCE_WEBM SOURCE_HTML OUTPUT_DIR
OUTPUT_DIR must be outside the repository and must not already exist.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "docs/echo-media-lab-2026-09-06/echo-a4c-apical-hcm-e00291/evidence.json"
FILENAME = "echo-a4c-apical-hcm-e00291-preview-v1.mp4"


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def probe(path):
    result = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-count_frames", "-show_streams",
        "-show_format", "-show_frames", "-of", "json", str(path),
    ]))
    result["format"]["filename"] = path.name
    return result


def summarize(data):
    streams = data["streams"]
    video = [s for s in streams if s["codec_type"] == "video"]
    if len(video) != 1 or len(streams) != 1:
        raise ValueError("Unexpected stream layout, including possible audio")
    v = video[0]
    return {
        "codec": v["codec_name"], "width": v["width"], "height": v["height"],
        "pixelFormat": v["pix_fmt"], "frameRate": v["r_frame_rate"],
        "averageFrameRate": v["avg_frame_rate"], "frameCount": int(v["nb_read_frames"]),
        "durationSeconds": float(data["format"]["duration"]), "audioStreams": [],
        "timestampsSeconds": [float(f["best_effort_timestamp_time"]) for f in data["frames"]],
    }


def main():
    source, page, output = [Path(p).resolve() for p in sys.argv[1:]]
    evidence = json.loads(EVIDENCE.read_text())
    if not evidence["rights"]["commercialReuseVerified"]:
        raise ValueError("Commercial reuse unverified")
    if evidence["technical"]["sourceSha256"] != "e23aa565789effcae9728fc8e9a4b71e6a90062e8c0014e4fe85899bd419f97a":
        raise ValueError("Recorded source checksum mismatch")
    if sha256(source) != evidence["technical"]["sourceSha256"]:
        raise ValueError("Source checksum mismatch")
    if sha256(page) != evidence["rights"]["sourcePageSha256"]:
        raise ValueError("License evidence checksum mismatch")
    if output == ROOT or ROOT in output.parents:
        raise ValueError("Media must stay outside the repository")
    before_probe = probe(source)
    before = summarize(before_probe)
    for key in ("codec", "width", "height", "frameRate", "frameCount", "durationSeconds"):
        if before[key] != evidence["technical"][key]:
            raise ValueError(f"Source metadata mismatch: {key}")
    output.mkdir(parents=True, exist_ok=False)
    destination = output / FILENAME
    parameters = [
        "-map", "0:v:0", "-map_metadata", "-1", "-map_chapters", "-1", "-an",
        "-vf", "pad=648:480:0:0:black,setsar=1", "-c:v", "libx264",
        "-preset", "slow", "-crf", "16", "-profile:v", "high", "-level:v", "3.1",
        "-pix_fmt", "yuv420p", "-bf", "0", "-fps_mode", "passthrough",
        "-enc_time_base", "1:1000", "-video_track_timescale", "1000",
        "-movflags", "+faststart",
    ]
    subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-n", "-i", str(source),
                    *parameters, str(destination)], check=True)
    after_probe = probe(destination)
    after = summarize(after_probe)
    if before["timestampsSeconds"] != after["timestampsSeconds"]:
        raise ValueError("Frame timestamps changed; derivative held")
    if before["frameCount"] != after["frameCount"]:
        raise ValueError("Frame count changed; derivative held")
    if abs(round(before["durationSeconds"] * 1000) - round(after["durationSeconds"] * 1000)) > 1:
        raise ValueError("Duration changed beyond 1 ms; derivative held")
    for label, data in (("source", before_probe), ("derivative", after_probe)):
        # Compact probe evidence; timestamp series is kept in the technical record.
        data.pop("frames")
        (output / f"{label}-ffprobe.json").write_text(json.dumps(data, indent=2) + "\n")
    record = {
        "candidateId": evidence["candidateId"], "derivativeFilename": FILENAME,
        "sourceSha1": hashlib.sha1(source.read_bytes()).hexdigest(),
        "sourceBytes": source.stat().st_size,
        "sourceSha256": sha256(source), "sourcePageSha256": sha256(page),
        "derivativeSha256": sha256(destination), "derivativeBytes": destination.stat().st_size,
        "ffmpegVersion": subprocess.check_output(["ffmpeg", "-version"], text=True).splitlines()[0],
        "parameters": parameters, "before": before, "after": after,
        "timestampSequenceIdentical": True, "crop": None, "mask": None,
        "padding": {"rightPixels": 1, "color": "black"}, "interpolation": False,
        "framesInvented": False, "metadataRemoved": True,
        "binaryCommitAllowed": False, "learnerReady": False,
        "reviewStatus": "technical-measurements-only-review-required",
    }
    (output / "technical.json").write_text(json.dumps(record, indent=2) + "\n")
    print(json.dumps({"filename": FILENAME, "sha256": record["derivativeSha256"],
                      "bytes": record["derivativeBytes"], "before": before, "after": after}))


if __name__ == "__main__":
    main()
