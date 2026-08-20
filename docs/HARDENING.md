# Hardening

SomethingOS is a desktop. It is not Tails, it is not Qubes, and it will
not claim otherwise. What it does is ship Debian with the boring switches
already flipped.

## Defaults

| Control | Value | Why |
| --- | --- | --- |
| `kernel.kptr_restrict` | 2 | hide kernel pointers |
| `kernel.dmesg_restrict` | 1 | dmesg is root-only |
| `kernel.yama.ptrace_scope` | 2 | no cross-process ptrace |
| `kernel.unprivileged_bpf_disabled` | 1 | no unpriv bpf |
| `kernel.randomize_va_space` | 2 | full ASLR |
| `fs.protected_{hardlinks,symlinks,fifos,regular}` | on | sticky-dir tricks |
| `fs.suid_dumpable` | 0 | no suid core dumps |
| IPv4/IPv6 redirects + source route | off | classic network hygiene |
| UFW | deny inbound / allow outbound | desktop firewall |
| AppArmor | enabled | Debian profiles |
| unattended-upgrades | Debian-Security only | patches without a prompt |
| MAC address | randomised on Wi-Fi | NetworkManager |
| Firefox ESR policies | no telemetry, HTTPS-only, no Pocket | browser |
| chrony + jitterentropy | on | time + entropy |
| core dumps | ulimit 0 | less leftover state |
| USBGuard | **not shipped** | see below |

See `config/includes.chroot/etc/sysctl.d/99-somethingos.conf`.

### Screen locking

The installed system idle-locks after 5 minutes
(`org.gnome.desktop.session idle-delay`, `screensaver lock-enabled`).

Live sessions do **not**. live-config assigns the `someone` account a password
that is not documented anywhere, so an idle lock in a live session is
unanswerable and costs the user their whole session.

Disabled for live only by `/usr/bin/somethingos-live-tweaks`, started from
`/etc/xdg/autostart`. It exits immediately unless `boot=live` is on the kernel
command line, so an installed system keeps the lock.

This is deliberately a session autostart and **not** a live-config component.
The first attempt was a component that called `dconf update`, which hung
`live-config.service` forever — systemd gives that unit no timeout, so the
machine never reached a desktop at all. By the time an autostart runs the
session bus exists and `gsettings` is safe.

### USBGuard

**Not installed.** `usbguard` used to be in the package list but nothing ever
configured it, and Debian ships it service-enabled with
`ImplicitPolicyTarget=block` and no `rules.conf`. That combination
deauthorized every USB device on first boot — a USB mouse or keyboard simply
did not work, which is how it was found:

    /sys/bus/usb/devices/1-4/authorized            0
    /sys/bus/usb/devices/usb1/authorized_default   0

Note that stopping the daemon does not undo this: it sets
`authorized_default=0` on the controller and `RestoreControllerDeviceState`
defaults to `false`.

Giving it a permissive baseline policy was not enough either. GNOME's
`org.gnome.desktop.privacy usb-protection` then drives usbguard over D-Bus,
and usbguard's polkit policy requires admin auth, so the live desktop came up
behind an unanswerable *"This USBGuard action needs authorization"* prompt.
`usb-protection` is therefore set to `false`.

USB device control is a real feature, but it needs a policy matched to the
hardware in front of it — not a default-deny with an empty allowlist. To opt
in on a machine you own:

```
sudo apt install usbguard
sudo usbguard generate-policy > /etc/usbguard/rules.conf
sudo chmod 0600 /etc/usbguard/rules.conf
sudo systemctl enable --now usbguard
```

Generate the policy while your keyboard and mouse are plugged in, or you will
lock yourself out of your own machine.
something status    # read the posture
sudo something harden
sudo something update
something fetch     # neofetch with the SomethingOS mark
```

`status` is safe to run as an unprivileged user. `harden` and `update`
need root.

## We send your data to nothing.weforgot

That is not a joke endpoint we own. It is a hostname pinned to
`0.0.0.0` (`/etc/hosts.d/nothing.weforgot`, merged at image build).
Firefox’s `toolkit.telemetry.server` and coverage endpoint are locked
to `https://nothing.weforgot/v1/sink`. Studies, Normandy, Pocket, crash
pings, captive-portal checks, and Firefox accounts are off.

uBlock Origin is installed two ways:

- Debian package `webext-ublock-origin-firefox`
- Firefox `ExtensionSettings` `force_installed` from AMO, locked

`popularity-contest` is purged and held.

VPN is local: WireGuard (`wg-quick`), OpenVPN, and the NetworkManager
plugins. Bring a config. We do not broker one.

```
something telemetry
something vpn status
sudo something vpn import ./me.conf
sudo something vpn up me
```

## What we do not do

- We do not force Tor.
- We do not hide the fact that this is Debian (`ID_LIKE=debian`).
- We do not ship a pentest toolkit.
- We do not disable the security features of a display server that the
  chosen desktop still needs.

If you need an amnesic lab, use Tails. If you need compartmentalisation,
use Qubes. If you need a Debian workstation that does not gossip, use
this.
