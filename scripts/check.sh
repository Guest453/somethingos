#!/usr/bin/env bash
# Fast sanity check for the SomethingOS tree. Does not need live-build.
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fail=0

say() { printf '  %s %s\n' "$1" "$2"; }
ok()  { say 'ok' "$1"; }
bad() { say '!!' "$1"; fail=1; }

echo "SomethingOS tree check"

for f in \
  VERSION Makefile LICENSE README.md \
  auto/config auto/build auto/clean \
  scripts/build.sh scripts/stage-branding.sh scripts/something \
  config/package-lists/somethingos.list.chroot \
  config/package-lists/desktop-gnome.list \
  config/package-lists/desktop-plasma.list \
  config/hooks/live/0001-somethingos.hook.chroot \
  scripts/ci-debian.sh \
  .github/workflows/iso.yml \
  .github/workflows/check.yml \
  config/includes.chroot/etc/os-release \
  config/includes.chroot/etc/skel/.config/neofetch/config.conf \
  branding/logo.png branding/wallpaper.png branding/grub.png \
  website/index.html website/session/index.html
do
  if [[ -e "$f" ]]; then ok "$f"; else bad "missing $f"; fi
done

for s in auto/config auto/build auto/clean scripts/*.sh scripts/something \
         config/hooks/live/*.hook.chroot config/hooks/live/*.hook.binary
do
  [[ -e "$s" ]] || continue
  if [[ -x "$s" ]]; then ok "exec $s"; else bad "not executable $s"; fi
done

if grep -R --line-number -E 'xfce|XFCE|xubuntu' \
     --exclude-dir=.git --exclude-dir=website --exclude='*.png' . >/dev/null 2>&1; then
  # website assets may mention history; the OS tree must not ship XFCE
  if grep -R --line-number -E 'xfce|XFCE' \
       config packages scripts auto >/dev/null 2>&1; then
    bad "XFCE references remain in the OS tree"
  else
    ok "no XFCE in OS tree"
  fi
else
  ok "no XFCE in OS tree"
fi

if [[ ! -s branding/wallpaper.png ]]; then bad "empty wallpaper"; else ok "wallpaper present"; fi

echo
if [[ "$fail" -ne 0 ]]; then
  echo "check failed"
  exit 1
fi
echo "check passed"
