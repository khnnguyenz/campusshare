function notify(to, txt) {
  notes.unshift({
    id: Date.now() + Math.random(),
    to,
    txt,
    read: false,
    t: Date.now(),
  });
  saveN();
  if (cur && to == cur.id) ding();
}

function unread() {
  return cur ? notes.filter((n) => n.to == cur.id && !n.read).length : 0;
}

function nTarget(t) {
  return /kết bạn/.test(t)
    ? "friends"
    : /phù hợp/.test(t)
      ? "needs"
      : /mượn|bàn giao|trả|Giao dịch/.test(t)
        ? "mine"
        : "notes";
}

function nOpen(id) {
  const n = notes.find((x) => x.id == id);
  if (n) {
    n.read = true;
    saveN();
    npOpen = false;
    go(nTarget(n.txt));
  }
}

function nAll() {
  notes.forEach((n) => n.to == cur.id && (n.read = true));
  saveN();
  drawAuth();
  if (page == "notes") render();
}

function nBell(e) {
  e.stopPropagation();
  npOpen = !npOpen;
  drawAuth();
}

function nSnd(e) {
  e.stopPropagation();
  soundOn = !soundOn;
  try {
    localStorage.setItem("cs_snd", soundOn ? "1" : "0");
  } catch (x) {}
  drawAuth();
  ding();
}

function ding() {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state == "suspended") ac.resume();
    const t = ac.currentTime;
    [
      [880, 0],
      [1318, 0.13],
    ].forEach(([f0, d]) => {
      const o = ac.createOscillator(),
        g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f0;
      g.gain.setValueAtTime(0, t + d);
      g.gain.linearRampToValueAtTime(0.25, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.5);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t + d);
      o.stop(t + d + 0.55);
    });
  } catch (e) {}
}

function drawAuth() {
  const a = $("#auth");
  if (!cur) {
    a.innerHTML = `<button class="btn" onclick="loginModal()">Đăng nhập</button>`;
    return;
  }
  const n = unread(),
    L = notes.filter((x) => x.to == cur.id).slice(0, 8);
  a.innerHTML = `<button class="bell" title="Thông báo" onclick="nBell(event)">🔔${n ? `<span class="nb ${n > lastN ? "bump" : ""}">${n > 99 ? "99+" : n}</span>` : ""}</button><a class="av" title="Hồ sơ của tôi" onclick="go('prof')">${av(cur, 36)}</a><button class="btn o" onclick="logout()">Đăng xuất</button>${npOpen ? `<div class="np" onclick="event.stopPropagation()"><div class="h"><b>Thông báo</b><span><a onclick="nSnd(event)">${soundOn ? "🔊 Bật" : "🔇 Tắt"}</a> · <a onclick="nAll()">Đọc tất cả</a></span></div><div class="l">${L.map((x) => `<div class="ni ${x.read ? "" : "un"}" onclick="nOpen(${x.id})"><span>${esc(x.txt)}</span></div>`).join("") || '<p class="mu" style="padding:14px;margin:0">Chưa có thông báo.</p>'}</div><div style="padding:10px 14px;text-align:center"><a onclick="npOpen=false;go('notes')">Xem tất cả</a></div></div>` : ""}`;
  lastN = n;
}

function notesV() {
  const L = notes.filter((n) => n.to == cur.id);
  return `<div class="row"><h2>Thông báo</h2><button class="btn o" onclick="L_all()">Đánh dấu tất cả đã đọc</button></div>${L.map((n) => `<div class="card row" style="margin-bottom:8px;${n.read ? "opacity:.6" : ""}"><span>${esc(n.txt)}</span><span><button class="btn o" onclick="nr(${n.id})">Đã đọc</button> <button class="btn r" onclick="nd(${n.id})">Xóa</button></span></div>`).join("") || '<p class="mu">Không có thông báo.</p>'}`;
}

function L_all() {
  notes.forEach((n) => n.to == cur.id && (n.read = true));
  saveN();
  render();
}

function nr(id) {
  notes.find((n) => n.id == id).read = true;
  saveN();
  render();
}

function nd(id) {
  notes = notes.filter((n) => n.id != id);
  saveN();
  render();
}
