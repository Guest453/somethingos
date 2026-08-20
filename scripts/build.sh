#!/usr/bin/env bash
# Build a SomethingOS live ISO with Debian live-build.
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DESKTOP="${DESKTOP:-gnome}"
ARCH="${ARCH:-amd64}"
VERSION="${VERSION:-$(cat VERSION)}"
CODENAME="${CODENAME:-shadow}"
ISO_NAME="${ISO_NAME:-somethingos-${VERSION}-${CODENAME}-${DESKTOP}-${ARCH}.iso}"

if [[ "${EUID}" -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    exec sudo --preserve-env=DESKTOP,ARCH,VERSION,CODENAME,ISO_NAME,MIRROR,MIRROR_SECURITY \
      bash "$0" "$@"
  fi
  echo "build.sh: need root (live-build uses debootstrap/chroot)" >&2
  exit 1
fi

need_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "build.sh: missing '$1'. On Debian: apt install live-build debootstrap squashfs-tools xorriso isolinux syslinux-common" >&2
    exit 1
  fi
}

need_bin lb
need_bin debootstrap
need_bin mksquashfs
need_bin xorriso

export DESKTOP ARCH VERSION CODENAME
bash "$ROOT/scripts/stage-branding.sh"
lb clean --all || true
bash "$ROOT/auto/config"

echo "==> lb build  (SomethingOS ${VERSION} ${CODENAME} / ${DESKTOP})"
lb build 2>&1 | tee build.log

# live-build names the hybrid ISO from --image-name
produced="$(ls -1 somethingos-${VERSION}-${CODENAME}-${DESKTOP}*.hybrid.iso \
               somethingos-${VERSION}-${CODENAME}-${DESKTOP}*.iso \
               live-image-${ARCH}.hybrid.iso \
               live-image-${ARCH}.iso 2>/dev/null | head -n1 || true)"

if [[ -z "${produced}" || ! -f "${produced}" ]]; then
  echo "build.sh: live-build finished but no ISO was found" >&2
  exit 1
fi

if [[ "${produced}" != "${ISO_NAME}" ]]; then
  cp -f "${produced}" "${ISO_NAME}"
fi

sha256sum "${ISO_NAME}" | tee "${ISO_NAME}.sha256"
ls -lh "${ISO_NAME}"
echo "==> done  ${ISO_NAME}"
