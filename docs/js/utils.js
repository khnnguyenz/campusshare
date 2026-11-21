const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[<>&"]/g,
      (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c],
    );

function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2500);
}

function modal(h) {
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = `<div class="card">${h}</div>`;
  m.onclick = (e) => {
    if (e.target == m) m.remove();
  };
  document.body.appendChild(m);
  return m;
}

function closeM() {
  document.querySelector(".modal")?.remove();
}

async function sha(s) {
  if (!crypto.subtle) return "p:" + s;
  const b = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("cs:" + s),
  );
  return Array.from(new Uint8Array(b), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}

function tok() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function ago(t) {
  const m = Math.floor((Date.now() - t) / 60000);
  return m < 1
    ? "vừa xong"
    : m < 60
      ? m + " phút trước"
      : m < 1440
        ? Math.floor(m / 60) + " giờ trước"
        : Math.floor(m / 1440) + " ngày trước";
}

function resize(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 800 / Math.max(im.width, im.height)),
          c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.8));
      };
      im.onerror = () => res(null);
      im.src = r.result;
    };
    r.onerror = () => res(null);
    r.readAsDataURL(file);
  });
}

function resizeN(file, m) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, m / Math.max(im.width, im.height)),
          c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.85));
      };
      im.onerror = () => res(null);
      im.src = r.result;
    };
    r.onerror = () => res(null);
    r.readAsDataURL(file);
  });
}

function pic(i) {
  if (i.imgs && i.imgs[0]) return i.imgs[0];
  const k = CATS.indexOf(i.cat),
    c = [
      "#FDE68A",
      "#FED7AA",
      "#FEF3C7",
      "#FFE4C4",
      "#FCD9A8",
      "#FDE0C8",
      "#EADFCB",
    ][k < 0 ? 6 : k],
    e = i.emo || ["📘", "📚", "🧮", "✏️", "🎧", "🔬", "📦"][k < 0 ? 6 : k];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160"><rect width="300" height="160" fill="${c}"/><text x="150" y="105" font-size="76" text-anchor="middle">${e}</text></svg>`,
    )
  );
}

function logo(sz) {
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 48 48" style="flex:none"><defs><linearGradient id="lgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5A524"/><stop offset="1" stop-color="#F27A45"/></linearGradient></defs><rect width="48" height="48" rx="13" fill="url(#lgg)"/><path d="M24 11L13 19M24 11L35 19M13 19L35 19" stroke="#111" stroke-width="2" stroke-linecap="round" fill="none"/><g fill="#111"><circle cx="24" cy="10" r="3.4"/><circle cx="13" cy="19" r="3.4"/><circle cx="35" cy="19" r="3.4"/></g><path d="M8 27c6-3 12-3 16 1 4-4 10-4 16-1v12c-6-3-12-3-16 1-4-4-10-4-16-1z" fill="#111"/><path d="M24 28v12" stroke="#F5A524" stroke-width="2"/></svg>`;
}

function av(u, s = 40) {
  const c = ["#F27A45", "#F5A524", "#B45309", "#EA580C", "#D97706"][
    (u.id.charCodeAt(u.id.length - 1) || 0) % 5
  ];
  return u.avatar
    ? `<img class="avi" style="width:${s}px;height:${s}px" src="${u.avatar}" alt="">`
    : `<span class="avi" style="width:${s}px;height:${s}px;background:${c};font-size:${Math.round(s * 0.42)}px">${esc(u.name.trim().charAt(0).toUpperCase())}</span>`;
}

function toggleTheme() {
  const r = document.documentElement;
  r.dataset.theme = (r.dataset.theme || "dark") == "dark" ? "light" : "dark";
  try {
    localStorage.setItem("cs_theme", r.dataset.theme);
  } catch (e) {}
}

function initTheme() {
  try {
    document.documentElement.dataset.theme =
      localStorage.getItem("cs_theme") || "dark";
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
}

function count(el) {
  const t = +el.dataset.n;
  let s = 0;
  const st = () => {
    s += Math.max(1, Math.ceil(t / 30));
    el.textContent = Math.min(s, t);
    if (s < t) requestAnimationFrame(st);
  };
  st();
}

function obs() {
  const io = window.IntersectionObserver
    ? new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              e.target.querySelectorAll("[data-n]").forEach(count);
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.15 },
      )
    : null;
  document.querySelectorAll(".rv").forEach((el) => {
    if (io) io.observe(el);
    else {
      el.classList.add("in");
      el.querySelectorAll("[data-n]").forEach(count);
    }
  });
}
