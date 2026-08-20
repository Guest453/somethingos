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

See `config/includes.chroot/etc/sysctl.d/99-somethingos.conf`.

## The `something` tool

```
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
