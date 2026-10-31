#!/usr/bin/env bash
# Costo en peso y calidad de cada variante, sobre 8 cuadros representativos.
set -u
export PATH="$PATH:/c/Users/Hp/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin"
A="C:/Users/Hp/AppData/Local/Temp/claude/c--Users-Hp-Desktop-kaze-web/1db4f17d-d0dc-4d8d-a43e-55029b88ce60/scratchpad/audit"
C="C:/Users/Hp/Desktop/kaze-web/public/cinematic"
SW="-sws_flags lanczos+accurate_rnd+full_chroma_int"
G="curves=r='0/0 0.55/0.55 0.84/0.875 0.957/0.976 1/1':g='0/0 0.55/0.55 0.82/0.865 0.933/0.966 1/1':b='0/0 0.55/0.55 0.78/0.84 0.898/0.948 1/1'"
W="$A/weight"; mkdir -p "$W/src" "$W/enc" "$W/dec"

# 8 cuadros: dos por clip, fuera de los fundidos.
FR=("1:20" "1:100" "2:30" "2:90" "3:30" "3:90" "4:30" "4:90")
for s in "${FR[@]}"; do c=${s%%:*}; n=${s##*:}
  # Referencia D a 2560 (procesado recomendado, sin comprimir).
  ffmpeg -v error -y -i "$C/kaze-0$c.mp4" $SW -vf "select='eq(n\,$n)',$G" -frames:v 1 -pix_fmt rgb24 "$W/src/g_${c}_$n.png"
done

# variante: nombre | ancho | crf | realce | ancho de pantalla para medir
VARS=(
  "actual_1280_crf30|1280|30|none|2560"
  "d1920_crf28|1920|28|cas|2560"
  "d2560_crf32|2560|32|cas|2560"
  "d2560_crf36|2560|36|cas|2560"
  "m720_crf33_actual|720|33|none|1170"
  "m1080_crf32|1080|32|cas|1170"
  "m1080_crf36|1080|36|cas|1170"
)

for v in "${VARS[@]}"; do IFS='|' read name w crf sh disp <<< "$v"
  for s in "${FR[@]}"; do c=${s%%:*}; n=${s##*:}; src="$W/src/g_${c}_$n.png"
    f="scale=$w:-2:flags=lanczos"; [ "$sh" = cas ] && f="$f,cas=strength=0.35"
    [ -f "$W/enc/${name}_${c}_$n.avif" ] || ffmpeg -v error -y -i "$src" $SW -vf "$f" -c:v libaom-av1 -still-picture 1 -crf $crf -cpu-used 6 -pix_fmt yuv420p "$W/enc/${name}_${c}_$n.avif"
    sz=$(stat -c%s "$W/enc/${name}_${c}_$n.avif")
    # Lo que ve el usuario: decodificado y llevado a la resolución de pantalla.
    ffmpeg -v error -y -i "$W/enc/${name}_${c}_$n.avif" $SW -vf "scale=$disp:-2:flags=lanczos" -pix_fmt rgb24 "$W/dec/x.png"
    # Referencia de pantalla: el procesado D sin comprimir a esa resolución.
    ffmpeg -v error -y -i "$src" $SW -vf "scale=$disp:-2:flags=lanczos,cas=strength=0.35" -pix_fmt rgb24 "$W/dec/r.png"
    v1=$(ffmpeg -i "$W/dec/x.png" -i "$W/dec/r.png" -lavfi "[0]format=yuv420p[a];[1]format=yuv420p[b];[a][b]libvmaf" -f null - 2>&1 | grep -o "VMAF score: [0-9.]*" | grep -o "[0-9.]*$")
    s1=$(ffmpeg -i "$W/dec/x.png" -i "$W/dec/r.png" -lavfi "[0]format=yuv444p[a];[1]format=yuv444p[b];[a][b]ssim" -f null - 2>&1 | grep -o "All:[0-9.]*" | grep -o "[0-9.]*$")
    echo "RAW $name $sz $v1 $s1"
  done
done
