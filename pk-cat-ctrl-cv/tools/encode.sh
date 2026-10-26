#!/bin/bash
# frames → H.264 High, yuv420p, bt709, CRF 14, preset slow, +faststart ; master audio muxed as AAC 192k
S=/tmp/claude-0/-home-user-good60613-github-io/8bbb7392-4dad-520a-861f-d7073f2ddf7a/scratchpad
OUT=${1:-$S/out/pk-cat-ctrl-cv.mp4}
GAIN=${2:-12.2}
# 24-bit master: compressor → gain → look-ahead limiter (applied in ffmpeg after Web Audio, as in the pack)
ffmpeg -y -hide_banner -loglevel error -i $S/out/audio_raw.wav -af "acompressor=threshold=-22dB:ratio=3.5:attack=4:release=80:knee=5:makeup=1,volume=${GAIN}dB,alimiter=limit=0.72:attack=3:release=50:level=disabled" -c:a pcm_s24le $S/out/master.wav
ffmpeg -y -hide_banner -loglevel error -framerate 60 -i $S/frames/f%04d.png -i $S/out/master.wav \
  -c:v libx264 -profile:v high -preset slow -crf 14 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -vf "scale=out_color_matrix=bt709:out_range=tv" -movflags +faststart -c:a aac -b:a 192k -shortest "$OUT"
ls -la "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr '\n' ' '; echo
