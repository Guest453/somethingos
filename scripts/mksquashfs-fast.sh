#!/usr/bin/env bash
# mksquashfs-fast: a mksquashfs wrapper that adds safe speed flags.
#
# Installed into a temp directory that we prepend to PATH before
# running `lb build`. The wrapper takes the same arguments as
# mksquashfs (source, destination, then any extra mksquashfs flags)
# and forwards them, with our extra flags inserted after the source
# and destination:
#
#   -no-xattrs       do not store POSIX ACLs (live image does not use them)
#   -no-exports      do not write the NFS export table
#   -no-recovery     do not scan for and embed recovery files
#   -no-progress     do not print the per-block progress line
#   -mem 50%         cap mksquashfs cache to half of physical memory
#                    (bookworm defaults to 75% which is too greedy)
#
# Live-build's compression algorithm and level are honoured because we
# forward `-comp` and `-Xcompression-level` from the chroot config.
#
# To opt out: SQUASHFS_FAST=0 make iso
set -eu

REAL="$(command -v mksquashfs)"
if [[ -z "${REAL}" ]]; then
  echo "mksquashfs-fast: mksquashfs not on PATH" >&2
  exit 1
fi

if [[ "${SQUASHFS_FAST:-1}" != "1" ]]; then
  exec "${REAL}" "$@"
fi

# mksquashfs syntax: mksquashfs SOURCE DEST [OPTIONS]
SRC="${1:-}"
DST="${2:-}"
[[ -n "${SRC}" && -n "${DST}" ]] || {
  echo "usage: mksquashfs SOURCE DEST [options]" >&2
  exit 2
}
shift 2

# Default safe speed flags. Users can override with SQUASHFS_FAST_FLAGS.
DEFAULT_FLAGS=(
  -no-xattrs
  -no-exports
  -no-recovery
  -no-progress
  -wildcards
)
FLAGS=( ${SQUASHFS_FAST_FLAGS:-${DEFAULT_FLAGS[*]}} )

# Try to read total memory; if we cannot, leave -mem alone.
# Cap the cap: no host under 8 GiB is realistic for a bookworm+GNOME build,
# and no host over 32 GiB gains anything from giving mksquashfs more cache.
if [[ -z "${SQUASHFS_FAST_FLAGS:-}" ]] && [[ -r /proc/meminfo ]]; then
  total_kb=$(awk '/^MemTotal:/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
  if [[ "${total_kb}" -gt 0 ]]; then
    half_mb=$(( total_kb * 100 / 2 / 1024 ))   # total_kb * 50 / 1024 → MiB
    if [[ "${half_mb}" -gt 8192 ]]; then
      half_mb=8192
    fi
    if [[ "${half_mb}" -gt 4096 ]]; then
      FLAGS+=( "-mem" "${half_mb}M" )
    fi
  fi
fi

exec "${REAL}" "${SRC}" "${DST}" "${FLAGS[@]}" "$@"
