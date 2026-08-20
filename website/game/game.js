(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const hud = document.getElementById("hud");
  const W = canvas.width;
  const H = canvas.height;
  const GROUND = H - 72;

  const sprite = new Image();
  sprite.src = "../assets/sonic/run.webp";

  let best = Number(localStorage.getItem("ringrush.best") || 0);
  let state = "ready";
  let t = 0;
  let speed = 6;
  let rings = 0;
  let vy = 0;
  let y = GROUND;
  const player = { x: 110, r: 28 };
  let obstacles = [];
  let coins = [];
  let clouds = [];

  function reset() {
    state = "run";
    t = 0;
    speed = 6;
    rings = 0;
    vy = 0;
    y = GROUND;
    obstacles = [];
    coins = [];
    clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * W,
      y: 40 + Math.random() * 120,
      s: 0.4 + Math.random() * 0.6,
      w: 50 + Math.random() * 80,
    }));
    spawnWave();
  }

  function spawnWave() {
    const base = W + 40;
    obstacles.push({ x: base, w: 28, h: 34 + Math.random() * 24 });
    if (Math.random() > 0.4) {
      coins.push({ x: base + 90, y: GROUND - 90 - Math.random() * 70, got: false });
    }
    if (Math.random() > 0.55) {
      coins.push({ x: base + 140, y: GROUND - 50, got: false });
    }
  }

  function jump() {
    if (state === "ready" || state === "dead") {
      reset();
      return;
    }
    if (y >= GROUND - 1) vy = -13.2;
  }

  canvas.addEventListener("pointerdown", jump);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      jump();
    }
  });

  function tick() {
    t += 1;
    if (state === "run") {
      speed = 6 + Math.min(8, t / 400);
      if (t % Math.max(70, 140 - t / 20) < 1) spawnWave();

      vy += 0.55;
      y += vy;
      if (y > GROUND) {
        y = GROUND;
        vy = 0;
      }

      for (const o of obstacles) o.x -= speed;
      for (const c of coins) c.x -= speed;
      for (const cl of clouds) {
        cl.x -= cl.s;
        if (cl.x < -cl.w) cl.x = W + cl.w;
      }
      obstacles = obstacles.filter((o) => o.x > -80);
      coins = coins.filter((c) => c.x > -40);

      const px = player.x;
      const py = y - player.r;
      for (const o of obstacles) {
        if (px + 18 > o.x && px - 18 < o.x + o.w && py + player.r * 2 > GROUND - o.h) {
          state = "dead";
          best = Math.max(best, rings);
          localStorage.setItem("ringrush.best", String(best));
        }
      }
      for (const c of coins) {
        if (!c.got && Math.hypot(px - c.x, y - 20 - c.y) < 36) {
          c.got = true;
          rings += 1;
        }
      }
    }
    draw();
    requestAnimationFrame(tick);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a1620");
    g.addColorStop(0.55, "#10261c");
    g.addColorStop(1, "#1a3a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(62,224,197,0.08)";
    for (const cl of clouds.length ? clouds : [{ x: 80, y: 60, w: 70 }]) {
      ctx.beginPath();
      ctx.ellipse(cl.x, cl.y, cl.w || 70, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#2e8b3a";
    ctx.fillRect(0, GROUND + 8, W, H);
    ctx.fillStyle = "#3ee0c5";
    const stripe = ((t * speed) | 0) % 40;
    for (let x = -stripe; x < W; x += 40) ctx.fillRect(x, GROUND + 8, 18, 3);

    for (const c of coins) {
      if (c.got) continue;
      ctx.beginPath();
      ctx.fillStyle = "#f0b429";
      ctx.ellipse(c.x, c.y, 9, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe9a0";
      ctx.fillRect(c.x - 2, c.y - 8, 4, 16);
    }

    for (const o of obstacles) {
      ctx.fillStyle = "#5a3a28";
      ctx.fillRect(o.x, GROUND - o.h + 8, o.w, o.h);
      ctx.fillStyle = "#2a1810";
      ctx.fillRect(o.x + 4, GROUND - o.h + 14, 6, o.h - 10);
    }

    const bob = state === "run" && y >= GROUND - 1 ? Math.sin(t / 4) * 2 : 0;
    if (sprite.complete && sprite.naturalWidth) {
      ctx.save();
      ctx.translate(player.x, y - 46 + bob);
      if (state === "run") ctx.rotate(Math.sin(t / 5) * 0.08);
      ctx.drawImage(sprite, -36, -36, 72, 72);
      ctx.restore();
    } else {
      ctx.fillStyle = "#1d6bff";
      ctx.beginPath();
      ctx.arc(player.x, y - 28 + bob, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#e8eaed";
    ctx.font = "600 18px IBM Plex Sans, sans-serif";
    if (state === "ready") {
      ctx.fillText("RING RUSH", 36, 48);
      ctx.fillStyle = "#3ee0c5";
      ctx.font = "14px IBM Plex Mono, monospace";
      ctx.fillText("press space · we send your high score to nothing.weforgot", 36, 72);
    } else if (state === "dead") {
      ctx.fillText("whoops", 36, 48);
      ctx.fillStyle = "#3ee0c5";
      ctx.font = "14px IBM Plex Mono, monospace";
      ctx.fillText("space to run it back", 36, 72);
    }

    hud.textContent = `rings ${rings} · best ${Math.max(best, rings)}`;
  }

  draw();
  requestAnimationFrame(tick);
})();
