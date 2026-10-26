#!/bin/bash
# usage: master.sh in.wav out.wav gainDb   → compressor → gain → look-ahead limiter
IN=$1; OUT=$2; G=$3
ffmpeg -y -hide_banner -loglevel error -i "$IN" -af "acompressor=threshold=-22dB:ratio=3.5:attack=4:release=80:knee=5:makeup=1,volume=${G}dB,alimiter=limit=0.72:attack=3:release=50:level=disabled" -c:a pcm_s24le "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr '\n' ' '; echo
