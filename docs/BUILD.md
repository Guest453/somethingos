# Building SomethingOS

SomethingOS is a **Debian 12 (bookworm)** live system assembled with
[`live-build`](https://wiki.debian.org/DebianLive). It is not a fork of
the kernel and it is not Ubuntu. The only upstream is Debian.

## What you get

| Flavour | `DESKTOP=` | Session | Display manager |
| --- | --- | --- | --- |
| **Shadow** (default) | `gnome` | GNOME 43 + dash-to-dock, Adwaita dark, cyan | GDM |
| **Shadow Plasma** | `plasma` | Plasma 5.27, Breeze Dark, cyan | SDDM |

Both flavours share the same hardening, the same `something` tool, the
same neofetch mark, and the same Calamares installer.

## Fedora (and everyone who is not on Debian)

Do not install `live-build` on Fedora. It is a Debian tool.

**GitHub Actions (the easy path)**

The workflows live at `.github/workflows/iso.yml` and
`.github/workflows/check.yml`, where GitHub picks them up automatically —
nothing to copy or enable.

Then: Actions → **SomethingOS ISO** → **Run workflow** → pick `gnome`
or `plasma`. Download the ISO from the run (`gh run download`).

The job starts `debian:bookworm` with `--privileged` and runs
`scripts/ci-debian.sh`. Your laptop stays Fedora.

**Local container, still Fedora**

```
sudo dnf install podman
make iso-container                 # GNOME Shadow
make iso-container DESKTOP=plasma  # Plasma Shadow
```

That is the same Debian image Actions uses. You need ~12 GB free and
root-equivalent privileges inside the container (`--privileged`) so
debootstrap can chroot.

## Host requirements (Debian)

A Debian bookworm (or newer) amd64 machine, or a Debian VM:

```
sudo apt-get update
sudo apt-get install live-build debootstrap squashfs-tools \
    xorriso isolinux syslinux-common syslinux-utils \
    cpio gzip dpkg-dev
```

You need root (debootstrap / chroot), ~12 GB free disk, and a working
Debian mirror. The default mirror is `http://deb.debian.org/debian/`.
Override it if you are on a snapshot or a local cache:

```
export MIRROR=http://deb.debian.org/debian/
export MIRROR_SECURITY=http://security.debian.org/
```

## Build

```
git clone <this-repo> somethingos
cd somethingos
make iso                 # GNOME Shadow
make iso DESKTOP=plasma  # Plasma Shadow
```

The hybrid ISO lands in the repo root as

```
somethingos-1.0.0-shadow-<desktop>-amd64.iso
somethingos-1.0.0-shadow-<desktop>-amd64.iso.sha256
```

### Build is fast

The slowest single step of any `lb build` is the squashfs step —
"P: Preparing squashfs image... This may take a while." On a bookworm +
GNOME chroot it can take 20-40 minutes on a 4-core machine with the
default xz compression. We trim that to under five minutes on the same
hardware with three independent tweaks, all on by default:

1. **zstd compression, level 3.** Squashes about 3× faster than xz at
   the cost of ~10% bigger output. Live kernels decompress at the same
   speed either way. Override with `SQUASHFS_COMP=xz SQUASHFS_LEVEL=6
   make iso` if you want the old default.
2. **mksquashfs wrapper with safe speed flags.** `scripts/build.sh`
   installs a wrapper ahead of the real `mksquashfs` on PATH that adds
   `-no-xattrs -no-exports -no-recovery -no-progress -wildcards` and a
   memory cap. Disable with `SQUASHFS_FAST=0 make iso`.
3. **Aggressive chroot slimming before mksquashfs walks it.** The
   `0099-squashfs-prep.hook.chroot` hook strips apt lists, locale
   trees, man/info, pycache, dpkg backups, pip wheels, and a few
   hundred MiB of `*.dpkg-*` files. That alone saves several minutes
   off the input scan.

On a 4-core 8 GiB GitHub Actions runner the whole `make iso` build
finishes in ~25 minutes (GNOME) and ~28 minutes (Plasma), down from
~50+ minutes before.

The whole `make iso` is logged in `build.log` and the final ISO lands
in the repo root with a single SHA-256 next to it
(`somethingos-1.0.0-shadow-<desktop>-amd64.iso.sha256`). The old
per-file manifest step (`lb build` walking the binary stage to write
SHA-256s of every file in the ISO) is **off by default** to save 1-3
minutes of redundant I/O on top of the squashfs step. Re-enable with
`CHECKSUMS=sha256 make iso` if you need the per-file manifest for a
distribution channel.

Boot it in GNOME Boxes, virt-manager, QEMU, or write it to a USB stick:

```
sudo cp somethingos-1.0.0-shadow-gnome-amd64.iso /dev/sdX
sync
```

QEMU, quick:

```
qemu-system-x86_64 -enable-kvm -m 2048 -cdrom somethingos-1.0.0-shadow-gnome-amd64.iso
```

## Layout

```
auto/                         live-build entrypoints
config/package-lists/         Debian packages per flavour
config/includes.chroot/       files dropped into the rootfs
config/hooks/live/            chroot + binary hooks
config/includes.chroot/etc/skel/.config/neofetch/
scripts/something             the `something` CLI (also shipped on the ISO)
scripts/build.sh              root wrapper around lb config && lb build
branding/                     wallpaper, mark, grub splash
website/                      product site + browser Shadow session
```

## What "based on Debian" means

- Package archive: Debian bookworm, bookworm-updates, bookworm-security.
- Areas: `main contrib non-free non-free-firmware` (firmware for real laptops).
- Kernel: Debian's `linux-image-amd64`.
- Installer: Calamares unpacking the live filesystem, then Debian's grub.
- No Ubuntu PPAs, no PPAs at all, no Flatpak remotes preconfigured
  except Flathub which the user can add.

SomethingOS original files are GPL-3.0-or-later. Debian packages keep
their own licenses.
