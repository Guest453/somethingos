# Desktop flavours

SomethingOS is not an XFCE remix. The default session is **GNOME Shadow**.
**Plasma Shadow** is a first-class rebuild, not a community afterthought.

## GNOME Shadow — default

```
make iso DESKTOP=gnome
```

- GNOME 43 (Debian bookworm) + GDM
- Adwaita dark, Inter, JetBrains Mono, Papirus Dark
- `dash-to-dock` floating at the bottom, cyan selection
- GNOME Terminal profile "Something" (dark field, cyan cursor)
- Extensions enabled by dconf: dash-to-dock, appindicators
- Favourites: Files, Terminal, Firefox ESR, Settings, Software, Welcome

This is the session the product shots and the browser preview show.

## Plasma Shadow — option

```
make iso DESKTOP=plasma
```

- Plasma 5.27 + SDDM + Breeze Dark
- Same wallpaper, same fonts, same cyan palette
- Konsole profile "Something"
- Panel launchers: Dolphin, Konsole, Firefox ESR, System Settings, Welcome

Pick it at build time. A single disk install is one flavour — SomethingOS
does not ship both stacks on one ISO (that would be two desktops of
packages and a worse default).

## Switching later

On an installed system you can `apt install` the other stack, but the
supported path is to rebuild:

```
something desktop          # shows the flavour baked into this image
make iso DESKTOP=plasma    # produce the other ISO
```

## Why not XFCE

XFCE is fine infrastructure. It is not the look of this OS. Shadow is
a dark GNOME (or Plasma) workstation with a short dock, a custom
neofetch, and nothing else shouting at you.
