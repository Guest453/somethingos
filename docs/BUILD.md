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

## Host requirements

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
