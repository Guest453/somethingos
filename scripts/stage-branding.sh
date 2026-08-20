#!/usr/bin/env bash
# Copy generated brand assets into the live-build include trees.
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

need() {
  if [[ ! -f "$1" ]]; then
    echo "stage-branding: missing $1" >&2
    exit 1
  fi
}

need branding/wallpaper.png
need branding/logo.png
need branding/grub.png

install -d \
  config/includes.chroot/usr/share/backgrounds/somethingos \
  config/includes.chroot/usr/share/pixmaps \
  config/includes.chroot/usr/share/icons/hicolor/512x512/apps \
  config/includes.chroot/usr/share/plymouth/themes/somethingos \
  config/includes.chroot/usr/share/somethingos \
  config/includes.binary/isolinux \
  config/bootloaders/grub-pc \
  website/assets

install -m 0644 branding/wallpaper.png \
  config/includes.chroot/usr/share/backgrounds/somethingos/shadow.png
install -m 0644 branding/wallpaper.png \
  config/includes.chroot/usr/share/plymouth/themes/somethingos/background.png
install -m 0644 branding/logo.png \
  config/includes.chroot/usr/share/pixmaps/somethingos.png
install -m 0644 branding/logo.png \
  config/includes.chroot/usr/share/icons/hicolor/512x512/apps/somethingos.png
install -m 0644 branding/logo.png \
  config/includes.chroot/usr/share/somethingos/logo.png
install -m 0644 branding/wordmark.png \
  config/includes.chroot/usr/share/somethingos/wordmark.png
install -m 0644 branding/grub.png \
  config/includes.binary/isolinux/splash.png
install -m 0644 branding/grub.png \
  config/bootloaders/grub-pc/splash.png
install -m 0644 branding/logo.png \
  config/includes.chroot/usr/share/plymouth/themes/somethingos/logo.png
install -d config/includes.chroot/etc/calamares/branding/somethingos
install -m 0644 branding/logo.png \
  config/includes.chroot/etc/calamares/branding/somethingos/logo.png
install -m 0644 branding/wallpaper.png \
  config/includes.chroot/etc/calamares/branding/somethingos/welcome.png
install -m 0755 scripts/something \
  config/includes.chroot/usr/share/somethingos/something
install -m 0755 scripts/something \
  config/includes.chroot/usr/bin/something
install -m 0755 config/includes.chroot/usr/share/somethingos/something-welcome \
  config/includes.chroot/usr/bin/something-welcome

# Random hedgehog archive + Ring Rush (the game lives in website/ and is copied into the ISO)
install -d \
  config/includes.chroot/usr/share/backgrounds/somethingos/sonic \
  config/includes.chroot/etc/skel/Pictures/sonic \
  config/includes.chroot/usr/share/somethingos/ring-rush \
  config/includes.chroot/usr/bin
if compgen -G 'branding/sonic/*' >/dev/null; then
  install -m 0644 branding/sonic/* config/includes.chroot/usr/share/backgrounds/somethingos/sonic/
  install -m 0644 branding/sonic/* config/includes.chroot/etc/skel/Pictures/sonic/
fi
install -m 0644 website/game/index.html website/game/game.css website/game/game.js \
  config/includes.chroot/usr/share/somethingos/ring-rush/
# Game on the ISO loads sprites from a relative path that also exists next to it
install -d config/includes.chroot/usr/share/somethingos/ring-rush/../assets/sonic
install -d config/includes.chroot/usr/share/somethingos/assets/sonic
install -m 0644 branding/sonic/* config/includes.chroot/usr/share/somethingos/assets/sonic/ 2>/dev/null || true
chmod 0755 config/includes.chroot/usr/bin/something-vpn

# Site can reuse the same mark without another copy step during preview.
if [[ ! -e website/assets/logo.png ]]; then
  ln -s ../../branding/logo.png website/assets/logo.png
fi
if [[ ! -e website/assets/wordmark.png ]]; then
  ln -s ../../branding/wordmark.png website/assets/wordmark.png
fi
if [[ ! -e website/assets/wallpaper.png ]]; then
  ln -s ../../branding/wallpaper.png website/assets/wallpaper.png
fi

echo "staged branding into live-build includes"
