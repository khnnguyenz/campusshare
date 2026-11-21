function openUser(id) {
  if (cur && id == cur.id) go("prof");
  else {
    viewId = id;
    go("user");
  }
}

function openChat(id) {
  chatWith = id;
  go("chat");
}

function rel(a, b) {
  return friends.find((r) => (r.a == a && r.b == b) || (r.a == b && r.b == a));
}

function addFriend(id) {
  if (!cur || cur.role != "student")
    return toast("Hãy đăng nhập tài khoản học sinh");
  if (rel(cur.id, id)) return;
  friends.push({ a: cur.id, b: id, st: "pending" });
  notify(id, `${cur.name} gửi lời mời kết bạn.`);
  saveS();
  render();
  toast("Đã gửi lời mời");
}

function acceptF(id) {
  const r = rel(cur.id, id);
  if (!r || r.b != cur.id) return;
  r.st = "accepted";
  notify(id, `${cur.name} đã chấp nhận lời mời kết bạn.`);
  saveS();
  render();
  toast("Đã trở thành bạn bè");
}

function rmF(id) {
  const r = rel(cur.id, id);
  if (r) {
    friends = friends.filter((x) => x !== r);
    saveS();
    render();
  }
}

function unF(id) {
  if (confirm("Hủy kết bạn?")) rmF(id);
}

function frs() {
  return friends
    .filter((r) => r.st == "accepted" && (r.a == cur.id || r.b == cur.id))
    .map((r) => (r.a == cur.id ? r.b : r.a));
}

function thread(id) {
  return msgs.filter(
    (m) => (m.f == cur.id && m.t == id) || (m.f == id && m.t == cur.id),
  );
}

function avgRating(uid) {
  const L = reviews.filter((v) => {
    const r = reqs.find((x) => x.id == v.r);
    return r && (v.by == r.from ? r.to : r.from) == uid;
  });
  return L.length
    ? [(L.reduce((s, v) => s + v.stars, 0) / L.length).toFixed(1), L.length]
    : null;
}

function statRow(u) {
  const n = items.filter((i) => i.owner == u.id).length,
    fr = friends.filter(
      (r) => r.st == "accepted" && (r.a == u.id || r.b == u.id),
    ).length,
    rt = avgRating(u.id);
  return `<div class="grid">${[
    ["Đồ đã đăng", n],
    ["Bạn bè", fr],
    ["Green Points", u.pts ?? 0],
    ["Đánh giá", rt ? rt[0] + "★" : "—"],
  ]
    .map(
      (x) =>
        `<div class="card"><div class="mu">${x[0]}</div><div class="stat">${x[1]}</div></div>`,
    )
    .join("")}</div>`;
}

async function setAv(files) {
  const f0 = files[0];
  if (!f0) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(f0.type))
    return toast("Chỉ nhận JPG/PNG/WebP");
  const d = await resizeN(f0, 256);
  if (!d) return toast("Không đọc được ảnh");
  cur.avatar = d;
  prof[cur.id] = { ...prof[cur.id], avatar: d };
  saveP();
  render();
  toast("Đã cập nhật ảnh đại diện");
}

function rmAv() {
  cur.avatar = "";
  prof[cur.id] = { ...prof[cur.id], avatar: "" };
  saveP();
  render();
}

function saveProf() {
  const n = $("#p_nm").value.trim();
  if (n.length < 2) return toast("Nhập họ tên");
  cur.name = n;
  cur.cls = $("#p_cl").value.trim();
  cur.bio = $("#p_bi").value.trim();
  prof[cur.id] = {
    ...prof[cur.id],
    name: cur.name,
    cls: cur.cls,
    bio: cur.bio,
  };
  saveP();
  render();
  toast("Đã lưu hồ sơ");
}

function profV() {
  const u = cur;
  return `<h2>Hồ sơ của tôi</h2><div class="card" style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;margin-bottom:16px">${av(u, 96)}<div><label class="btn o" style="display:inline-block;cursor:pointer">Đổi ảnh đại diện<input type="file" hidden accept="image/jpeg,image/png,image/webp" onchange="setAv(this.files)"></label>${u.avatar ? ` <button class="btn r" onclick="rmAv()">Xóa ảnh</button>` : ""}<p class="mu">${esc(u.school || "")} · Lớp ${esc(u.cls || "—")}</p></div></div>${statRow(u)}<div class="card" style="margin-top:16px;max-width:520px"><label>Họ và tên</label><input id="p_nm" value="${esc(u.name)}"><label>Lớp</label><input id="p_cl" value="${esc(u.cls || "")}"><label>Giới thiệu</label><textarea id="p_bi" rows="3" maxlength="200">${esc(u.bio || "")}</textarea><button class="btn" onclick="saveProf()">Lưu hồ sơ</button></div>`;
}

function fbtn(id) {
  const r = rel(cur.id, id);
  if (!r)
    return `<button class="btn" onclick="addFriend('${id}')">+ Kết bạn</button>`;
  if (r.st == "accepted")
    return `<button class="btn w" onclick="openChat('${id}')">Nhắn tin</button>`;
  if (r.a == cur.id)
    return `<button class="btn o" onclick="rmF('${id}')">Hủy lời mời</button>`;
  return `<button class="btn g" onclick="acceptF('${id}')">Chấp nhận</button> <button class="btn r" onclick="rmF('${id}')">Từ chối</button>`;
}

function userBaseView() {
  const u = USERS[viewId];
  if (!u) return '<p class="mu">Không tìm thấy người dùng.</p>';
  const L = items.filter((i) => i.owner == u.id),
    ok = cur && cur.id != u.id && u.role == "student" && cur.role == "student",
    r = ok ? rel(cur.id, u.id) : null;
  return `<button class="btn o" onclick="go(cur?'friends':'market')">← Quay lại</button><div class="card" style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;margin:16px 0">${av(u, 96)}<div style="flex:1"><h2 style="margin:0">${esc(u.name)}</h2><p class="mu">${esc(u.school || "")}${u.cls ? " · Lớp " + esc(u.cls) : ""}</p><p>${esc(u.bio || "")}</p>${ok ? fbtn(u.id) + (r && r.st == "accepted" ? ` <button class="btn r" onclick="unF('${u.id}')">Hủy kết bạn</button>` : "") : ""}${!cur ? `<button class="btn" onclick="loginModal()">Đăng nhập để kết bạn</button>` : ""}</div></div>${statRow(u)}<h3>Đồ dùng đang chia sẻ</h3><div class="grid">${L.map((i) => `<div class="card"><img class="im" alt="" src="${pic(i)}" onclick="detail('${i.id}')"><b>${esc(i.name)}</b></div>`).join("") || '<p class="mu">Chưa có đồ nào.</p>'}</div>`;
}

function userV() {
  const h = userBaseView();
  return viewId && USERS[viewId]
    ? h.replace("</h2>", "</h2>" + presTxt(viewId))
    : h;
}

function prow(id) {
  const u = USERS[id];
  return `<div class="card row" style="margin-bottom:8px"><a class="row" style="gap:10px;cursor:pointer" onclick="openUser('${id}')">${av(u, 44)}<span><b>${esc(u.name)}</b> ${presTxt(id)}<br><span class="mu">${esc(u.school || "")} · ${esc(u.cls || "—")}</span></span></a><span>${fbtn(id)}</span></div>`;
}

function plist() {
  return (
    Object.values(USERS)
      .filter(
        (u) =>
          u.role == "student" &&
          u.id != cur.id &&
          (!fsq || u.name.toLowerCase().includes(fsq.toLowerCase())),
      )
      .map((u) => prow(u.id))
      .join("") || '<p class="mu">Không tìm thấy học sinh.</p>'
  );
}

function friendsV() {
  if (!cur || cur.role != "student")
    return '<p class="mu">Hãy đăng nhập tài khoản học sinh.</p>';
  const inc = friends.filter((r) => r.st == "pending" && r.b == cur.id),
    fr = frs();
  return `<h2>Bạn bè</h2>${inc.length ? `<h3>Lời mời kết bạn (${inc.length})</h3>${inc.map((r) => prow(r.a)).join("")}` : ""}<h3>Bạn bè của tôi (${fr.length})</h3>${fr.map((id) => prow(id)).join("") || '<p class="mu">Chưa có bạn bè. Tìm học sinh bên dưới để kết bạn.</p>'}<h3>Tìm học sinh</h3><div class="se" style="margin-bottom:12px">🔍<input placeholder="Tìm theo tên…" oninput="fsq=this.value;$('#plist').innerHTML=plist()"></div><div id="plist">${plist()}</div>`;
}

function chatBaseView() {
  if (!cur || cur.role != "student")
    return '<p class="mu">Hãy đăng nhập tài khoản học sinh.</p>';
  const F = frs();
  if (!F.length)
    return `<h2>Tin nhắn</h2><p class="mu">Bạn cần kết bạn trước khi trò chuyện.</p><button class="btn" onclick="go('friends')">Tìm bạn</button>`;
  if (!F.includes(chatWith)) chatWith = F[0];
  const u = USERS[chatWith],
    T = thread(chatWith),
    tm = (x) =>
      new Date(x).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
  return `<h2>Tin nhắn</h2><div class="cs"><div class="card">${F.map((id) => {
    const w = USERS[id],
      l = thread(id).slice(-1)[0];
    return `<div class="cv ${id == chatWith ? "on" : ""}" onclick="chatWith='${id}';render()"><a onclick="event.stopPropagation();openUser('${id}')">${av(w, 40)}</a><span style="min-width:0"><b>${esc(w.name)}</b><br><span class="mu" style="font-size:13px">${l ? esc(l.x.slice(0, 28)) : "Chưa có tin nhắn"}</span></span></div>`;
  }).join(
    "",
  )}</div><div class="card"><div class="row" style="margin-bottom:8px"><a class="row" style="gap:10px;cursor:pointer" onclick="openUser('${u.id}')">${av(u, 44)}<b>${esc(u.name)}</b></a></div><div class="ms">${
    T.map((m) => {
      const me = m.f == cur.id;
      return `<div class="mr ${me ? "me" : ""}">${me ? "" : `<a style="cursor:pointer" onclick="openUser('${m.f}')">${av(u, 30)}</a>`}<div class="bb">${esc(m.x)}<div class="mu" style="font-size:11px">${tm(m.at)}</div></div></div>`;
    }).join("") || '<p class="mu">Hãy gửi lời chào đầu tiên 👋</p>'
  }</div><div class="row" style="flex-wrap:nowrap;margin-top:8px"><input id="cm" placeholder="Nhập tin nhắn…" maxlength="500" style="margin:0" onkeydown="if(event.key=='Enter')sendMsg()"><button class="btn" onclick="sendMsg()">Gửi</button></div></div></div>`;
}

function chatV() {
  let h = chatBaseView();
  if (!cur || cur.role != "student" || !chatWith || !frs().includes(chatWith))
    return h;
  const F = frs(),
    cnt = {};
  msgs.forEach((m) => {
    if (m.t == cur.id && m.r === false && m.f != chatWith)
      cnt[m.f] = (cnt[m.f] || 0) + 1;
  });
  F.forEach((id) => {
    if (cnt[id])
      h = h.replace(
        `onclick="chatWith='${id}';render()">`,
        (m) => m + `<span class="nb2">${cnt[id]}</span>`,
      );
  });
  let k = 0;
  h = h.replace(
    /<\/b><br><span class="mu" style="font-size:13px">/g,
    () =>
      "</b> " +
      presTxt(F[k++]) +
      '<br><span class="mu" style="font-size:13px">',
  );
  h = h.replace(
    '</b></a></div><div class="ms">',
    "</b></a>" + presTxt(chatWith) + '</div><div class="ms">',
  );
  let ch = false;
  msgs.forEach((m) => {
    if (m.t == cur.id && m.f == chatWith && m.r === false) {
      m.r = true;
      ch = true;
    }
  });
  if (ch) saveS();
  return h;
}

function sendMsg() {
  const x = $("#cm").value.trim();
  if (!x) return;
  if (!frs().includes(chatWith)) return toast("Chỉ nhắn tin với bạn bè");
  msgs.push({ f: cur.id, t: chatWith, x, at: Date.now(), r: false });
  saveS();
  render();
  $("#cm")?.focus();
}

function presRead() {
  try {
    return JSON.parse(localStorage.getItem("cs_pres") || "{}");
  } catch (e) {
    return {};
  }
}

function beat(on = true) {
  if (!cur) return;
  try {
    const P = presRead();
    P[cur.id] = { t: Date.now(), on };
    localStorage.setItem("cs_pres", JSON.stringify(P));
  } catch (e) {}
}

function presInner(id) {
  const p = presRead()[id];
  if (!p) return '<span class="mu" style="font-size:12px">Chưa online</span>';
  return p.on && Date.now() - p.t < 45000
    ? '<span style="font-size:12px;color:#22C55E;font-weight:700">● Đang online</span>'
    : `<span class="mu" style="font-size:12px">Online ${ago(p.t)}</span>`;
}

function presTxt(id) {
  return `<span class="pz" data-u="${id}">${presInner(id)}</span>`;
}

function refreshPz() {
  document
    .querySelectorAll(".pz")
    .forEach((e) => (e.innerHTML = presInner(e.dataset.u)));
}

function msgUnread() {
  return cur ? msgs.filter((m) => m.t == cur.id && m.r === false).length : 0;
}

function navBadge() {
  if (!cur) return;
  const n = msgUnread(),
    b = document.querySelector('#nav button[onclick*="chat"]');
  if (b && n)
    b.insertAdjacentHTML(
      "beforeend",
      `<span class="nb2">${n > 99 ? "99+" : n}</span>`,
    );
  const t = unread() + n;
  document.title = (t ? "(" + t + ") " : "") + "CampusShare";
  if (mcMap[cur.id] == null)
    mcMap[cur.id] = msgs.filter((m) => m.t == cur.id).length;
}
