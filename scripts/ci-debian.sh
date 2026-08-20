#!/usr/bin/env bash
# Install live-build on Debian and produce the ISO.
# Used by GitHub Actions (debian:bookworm container) and `make iso-container`.
set -euo pipefail

export DEBIAN_FRONTEND="${DEBIAN_FRONTEND:-noninteractive}"
export DESKTOP="${DESKTOP:-gnome}"
export CI="${CI:-true}"
# Drop package indices inside CI — saves a few hundred MB on the runner.
export APT_INDICES="${APT_INDICES:-false}"

echo "==> SomethingOS CI  desktop=${DESKTOP}"
. /etc/os-release
echo "    host ${PRETTY_NAME}"

apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  live-build \
  debootstrap \
  squashfs-tools \
  xorriso \
  isolinux \
  syslinux-common \
  syslinux-utils \
  cpio \
  gzip \
  tar \
  findutils \
  wget \
  ca-certificates \
  dpkg-dev \
  fakeroot \
  git \
  make \
  rsync \
  systemd-container \
  python3

apt-get clean
rm -rf /var/lib/apt/lists/*

df -h
make iso DESKTOP="$DESKTOP"
df -h
ls -lh somethingos-*.iso* || true
