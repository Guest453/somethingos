(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SONIC = [
    "../assets/sonic/run.webp",
    "../assets/sonic/run-art.webp",
    "../assets/sonic/run-alt.webp",
    "../assets/sonic/point.png",
    "../assets/sonic/poses.jpg",
    "../assets/sonic/greenhill.jpg",
  ];

  const APPS = [
    { id: "terminal", name: "Terminal", icon: "›_", w: 720, h: 460 },
    { id: "files", name: "Files", icon: "▣", w: 760, h: 480 },
    { id: "firefox", name: "Firefox", icon: "◉", w: 780, h: 520 },
    { id: "settings", name: "Settings", icon: "⚙", w: 720, h: 500 },
    { id: "vpn", name: "VPN", icon: "⬡", w: 420, h: 320 },
    { id: "game", name: "Ring Rush", icon: "◎", w: 820, h: 520 },
  ];

  let z = 20;
  let vpnOn = false;
  const openApps = new Set();

  function boot() {
    scatterSonic();
    tickClock();
    setInterval(tickClock, 1000);
    setTimeout(() => {
      $("#boot").classList.add("gone");
      openApp("terminal");
    }, 1600);
  }

  function scatterSonic() {
    const layer = $("#wallpaper");
    const n = 3 + Math.floor(Math.random() * 3);
    const used = new Set();
    for (let i = 0; i < n; i++) {
      let src;
      do src = SONIC[Math.floor(Math.random() * SONIC.length)];
      while (used.has(src) && used.size < SONIC.length);
      used.add(src);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.className = "sticker";
      const w = 90 + Math.random() * 140;
      img.style.width = w + "px";
      img.style.left = 8 + Math.random() * 78 + "%";
      img.style.top = 12 + Math.random() * 58 + "%";
      img.style.transform = `rotate(${(Math.random() - 0.5) * 24}deg)`;
      layer.appendChild(img);
    }
  }

  function tickClock() {
    const d = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n) => String(n).padStart(2, "0");
    $("#clock").textContent = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function focusWin(el) {
    $$(".window").forEach((w) => w.classList.remove("focused"));
    el.classList.add("focused");
    el.style.zIndex = ++z;
  }

  function closeApp(id) {
    const el = document.querySelector(`.window[data-app="${id}"]`);
    if (el) el.remove();
    openApps.delete(id);
    const dock = document.querySelector(`.dock-item[data-app="${id}"]`);
    if (dock) dock.classList.remove("open");
  }

  function drag(el, bar) {
    let ox = 0, oy = 0, dragging = false;
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest("b")) return;
      dragging = true;
      focusWin(el);
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      el.style.left = Math.max(0, e.clientX - ox) + "px";
      el.style.top = Math.max(32, e.clientY - oy) + "px";
    });
    bar.addEventListener("pointerup", () => { dragging = false; });
  }

  function openApp(id) {
    const meta = APPS.find((a) => a.id === id);
    if (!meta) return;
    const existing = document.querySelector(`.window[data-app="${id}"]`);
    if (existing) { focusWin(existing); return; }
    const win = document.createElement("div");
    win.className = "window";
    win.dataset.app = id;
    const left = 80 + Math.random() * 120;
    const top = 56 + Math.random() * 50;
    win.style.cssText = `left:${left}px;top:${top}px;width:${meta.w}px;height:${meta.h}px;z-index:${++z}`;
    win.innerHTML = `
      <div class="titlebar">
        <span>${meta.name}</span>
        <span class="traffic"><b class="min"></b><b class="close" title="Close"></b></span>
      </div>
      <div class="win-body">${renderApp(id)}</div>`;
    $("#desktop").appendChild(win);
    drag(win, win.querySelector(".titlebar"));
    win.addEventListener("mousedown", () => focusWin(win));
    win.querySelector(".close").addEventListener("click", () => closeApp(id));
    win.querySelector(".min").addEventListener("click", () => { win.style.display = "none"; });
    focusWin(win);
    openApps.add(id);
    const dock = document.querySelector(`.dock-item[data-app="${id}"]`);
    if (dock) dock.classList.add("open");
    if (id === "terminal") mountTerminal(win);
    if (id === "settings") mountSettings(win);
    if (id === "vpn") mountVpn(win);
    if (id === "files") mountFiles(win);
  }

  function renderApp(id) {
    if (id === "terminal") return `<div class="term"></div>`;
    if (id === "files") return `<div class="files"><aside></aside><main></main></div>`;
    if (id === "firefox") return `
      <div class="browser">
        <div class="chrome">
          <span class="dim">◀ ▶</span>
          <div class="omnibox">https://nothing.weforgot</div>
        </div>
        <div class="page">
          <div class="dim" style="letter-spacing:.2em;font-size:11px;color:#3ee0c5">TELEMETRY POLICY</div>
          <h1>We send your data to nothing.weforgot.</h1>
          <p>The hostname is pinned to <code>0.0.0.0</code> in <code>/etc/hosts</code>. Firefox’s <code>toolkit.telemetry.server</code> is locked to <code>https://nothing.weforgot/v1/sink</code>.</p>
          <p>uBlock Origin is force-installed. Pocket, studies, Normandy, crash pings, captive-portal checks — off. Popularity-contest is not on this disk.</p>
          <p class="dim">Nothing leaves. We forgot on purpose.</p>
        </div>
      </div>`;
    if (id === "settings") return `<div class="settings"><nav></nav><article></article></div>`;
    if (id === "vpn") return `<div class="vpn"></div>`;
    if (id === "game") return `<iframe class="gameframe" src="../game/index.html" title="Ring Rush"></iframe>`;
    return "";
  }

  function neofetch() {
    return `<span class="ascii">      ╭────────────╮
      │  ╱──────╮  │
      │ ╱      ╱   │
      │╱      ╱    │
      │╲     ╱     │
      │ ╲───╯───╮  │
      │         ╱  │
      │  ─────╯    │
      ╰────────────╯</span>
<span class="prompt">someone</span><span class="dim">@</span><span class="prompt">somethingos</span>
<span class="dim">────────────</span>
os · SomethingOS 1.0 Shadow x86_64
host · live session (debian 12)
kern · 6.1.0-somethingos
de · GNOME Shadow
sh · bash 5.2
term · something-terminal
theme · Adwaita-dark + cyan
vpn · ${vpnOn ? "up" : "down"}
telemetry · nothing.weforgot
ublock · force-installed
`;
  }

  function mountTerminal(win) {
    const term = win.querySelector(".term");
    const print = (html) => {
      const d = document.createElement("div");
      d.innerHTML = html;
      term.appendChild(d);
    };
    const promptLine = () => {
      const row = document.createElement("div");
      row.innerHTML = `<span class="prompt">someone</span><span class="dim">@</span><span class="prompt">somethingos</span> <span class="dim">~</span> <span class="prompt">›</span> `;
      const input = document.createElement("input");
      input.autocapitalize = "off";
      input.autocomplete = "off";
      input.spellcheck = false;
      row.appendChild(input);
      term.appendChild(row);
      input.focus();
      term.scrollTop = term.scrollHeight;
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const cmd = input.value.trim();
        input.replaceWith(document.createTextNode(cmd));
        run(cmd);
        promptLine();
      });
    };
    const run = (cmd) => {
      const [head, ...rest] = cmd.split(/\s+/);
      if (!head) return;
      if (head === "clear") { term.innerHTML = ""; return; }
      if (head === "help") {
        print(`<span class="dim">something status | harden | fetch | vpn | telemetry | sonic | game | about</span><br>neofetch · clear · uname · whoami · ls · date`);
        return;
      }
      if (head === "neofetch" || cmd === "something fetch") { print(neofetch()); return; }
      if (head === "uname") { print("Linux somethingos 6.1.0-somethingos #1 SMP Debian 12 x86_64"); return; }
      if (head === "whoami") { print("someone"); return; }
      if (head === "date") { print(new Date().toString()); return; }
      if (head === "ls") { print(`<span class="dim">Desktop  Documents  Downloads  Pictures/sonic  Ring Rush</span>`); return; }
      if (head === "something") {
        const sub = rest[0] || "status";
        if (sub === "about") {
          print("SomethingOS 1.0 Shadow · Debian 12 remix · opsec level infinite<br>We send your data to nothing.weforgot.");
          return;
        }
        if (sub === "fetch") { print(neofetch()); return; }
        if (sub === "desktop") { print("current flavour: gnome<br>rebuild with <span class='ok'>make iso DESKTOP=plasma</span> for Plasma Shadow"); return; }
        if (sub === "telemetry") { print("We send your data to <span class='ok'>nothing.weforgot</span>.<br>sinkhole 0.0.0.0 · firefox locked · ublock force-installed"); return; }
        if (sub === "vpn") { print(`tunnel: ${vpnOn ? "<span class='ok'>up</span>" : "down"} · something vpn up`); return; }
        if (sub === "sonic") {
          const pic = SONIC[Math.floor(Math.random() * SONIC.length)];
          print(`<span class="dim">${pic}</span><br><img src="${pic}" alt="sonic" style="height:120px">`);
          return;
        }
        if (sub === "game") { openApp("game"); print("opened Ring Rush"); return; }
        if (sub === "status" || !rest.length) {
          print(`<span class="ok">✓</span> kptr_restrict 2<br><span class="ok">✓</span> dmesg_restrict 1<br><span class="ok">✓</span> firewall ufw<br><span class="ok">✓</span> apparmor<br><span class="ok">✓</span> telemetry nothing.weforgot<br><span class="ok">✓</span> ublock origin<br><span class="ok">✓</span> vpn stack installed<br>overall  <span class="ok">hardened</span>`);
          return;
        }
      }
      print(`<span class="dim">command not found:</span> ${cmd}`);
    };
    print(neofetch());
    promptLine();
    term.addEventListener("click", () => {
      const i = term.querySelector("input");
      if (i) i.focus();
    });
  }

  function mountFiles(win) {
    const side = win.querySelector("aside");
    const main = win.querySelector("main");
    const places = ["Home", "Pictures/sonic", "Desktop", "Documents"];
    const paint = (place) => {
      side.innerHTML = places.map((p) => `<div class="${p === place ? "on" : ""}" data-p="${p}">${p}</div>`).join("");
      $$("div", side).forEach((el) => el.addEventListener("click", () => paint(el.dataset.p)));
      if (place.includes("sonic") || place === "Home") {
        main.innerHTML = SONIC.map((s) => `<figure><img src="${s}" alt=""><figcaption>${s.split("/").pop()}</figcaption></figure>`).join("");
      } else {
        main.innerHTML = `<figure><figcaption class="dim">empty on a live session</figcaption></figure>`;
      }
    };
    paint("Pictures/sonic");
  }

  function mountSettings(win) {
    const nav = win.querySelector("nav");
    const art = win.querySelector("article");
    const pages = {
      Appearance: `<h3>Appearance</h3>
        <div class="toggle"><div><strong>Dark style</strong><div class="dim">Adwaita-dark, always</div></div><b></b></div>
        <div class="toggle"><div><strong>Accent</strong><div class="dim">#3ee0c5</div></div><b></b></div>
        <div class="toggle"><div><strong>Desktop flavour</strong><div class="dim">GNOME Shadow · Plasma is a rebuild</div></div><b></b></div>`,
      Hardening: `<h3>Hardening</h3>
        <div class="toggle"><div><strong>Kernel pointers hidden</strong><div class="dim">kptr_restrict = 2</div></div><b></b></div>
        <div class="toggle"><div><strong>Firewall</strong><div class="dim">UFW deny inbound</div></div><b></b></div>
        <div class="toggle"><div><strong>AppArmor</strong><div class="dim">Debian profiles</div></div><b></b></div>
        <div class="toggle"><div><strong>Random Wi-Fi MAC</strong></div><b></b></div>`,
      Privacy: `<h3>Privacy</h3>
        <p>We send your data to <code style="color:#3ee0c5">nothing.weforgot</code>.</p>
        <div class="toggle"><div><strong>Telemetry</strong><div class="dim">sinkholed</div></div><b></b></div>
        <div class="toggle"><div><strong>uBlock Origin</strong><div class="dim">force-installed</div></div><b></b></div>
        <div class="toggle"><div><strong>Firefox studies / Pocket</strong><div class="dim">dead</div></div><b class="off"></b></div>`,
      About: `<h3>SomethingOS 1.0 Shadow</h3>
        <p class="dim">Debian 12 bookworm remix. GNOME Shadow. Opsec level infinite. Sonic included, unofficially.</p>`,
    };
    nav.innerHTML = Object.keys(pages).map((k, i) => `<button class="${i === 0 ? "on" : ""}">${k}</button>`).join("");
    art.innerHTML = pages.Appearance;
    $$("button", nav).forEach((b) => b.addEventListener("click", () => {
      $$("button", nav).forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      art.innerHTML = pages[b.textContent];
    }));
  }

  function mountVpn(win) {
    const box = win.querySelector(".vpn");
    const paint = () => {
      box.innerHTML = `
        <h3>Something VPN</h3>
        <p class="dim">WireGuard + OpenVPN. Your tunnel is local. Your telemetry is still nothing.weforgot.</p>
        <button class="big-toggle ${vpnOn ? "on" : ""}">${vpnOn ? "Tunnel up" : "Tunnel down — click to connect"}</button>
        <p class="dim" style="margin-top:14px">${vpnOn ? "wg0 · 10.8.0.2 · DNS via tunnel" : "drop a conf in /etc/wireguard/something.conf"}</p>`;
      box.querySelector("button").addEventListener("click", () => {
        vpnOn = !vpnOn;
        $("#vpn-dot").style.background = vpnOn ? "#3ee0c5" : "#555";
        paint();
      });
    };
    paint();
  }

  function mountDock() {
    const dock = $("#dock");
    dock.innerHTML = APPS.map((a) => `<button class="dock-item" data-app="${a.id}" title="${a.name}">${
      a.id === "game" ? `<img src="../assets/sonic/run.webp" alt="">` : a.icon
    }</button>`).join("");
    $$(".dock-item", dock).forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.app;
        const win = document.querySelector(`.window[data-app="${id}"]`);
        if (win && win.style.display === "none") {
          win.style.display = "";
          focusWin(win);
          return;
        }
        openApp(id);
      });
    });
  }

  function mountOverview() {
    const ov = $("#overview");
    ov.innerHTML = `<input placeholder="Type to search" />
      <div class="ov-apps">${APPS.map((a) => `<button data-app="${a.id}"><i>${a.icon}</i>${a.name}</button>`).join("")}</div>`;
    $$("button", ov).forEach((b) => b.addEventListener("click", () => {
      ov.classList.remove("show");
      openApp(b.dataset.app);
    }));
  }

  $("#activities").addEventListener("click", () => $("#overview").classList.toggle("show"));
  $("#overview").addEventListener("click", (e) => {
    if (e.target.id === "overview") e.currentTarget.classList.remove("show");
  });
  $("#status-btn").addEventListener("click", () => $("#quick").classList.toggle("show"));
  $("#quick").addEventListener("click", (e) => {
    if (e.target.dataset.act === "session") location.href = "../";
  });

  mountDock();
  mountOverview();
  boot();
})();
