// Lắng nghe sự kiện: đồng bộ giữa các tab, âm thanh, online

function bindEvents() {
  addEventListener("storage", (e) => {
    if (e.key == "cs_social") {
      try {
        const s = JSON.parse(e.newValue || "{}");
        friends = s.f || [];
        msgs = s.m || [];
        if (cur && ["chat", "friends", "user"].includes(page)) render();
      } catch (x) {}
    }
  });
  addEventListener(
    "pointerdown",
    () => {
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        ac.resume();
      } catch (e) {}
    },
    { once: true },
  );
  addEventListener("storage", (e) => {
    if (e.key == "cs_notes") {
      try {
        const b = unread();
        notes = JSON.parse(e.newValue || "[]");
        if (cur && unread() > b) ding();
        drawAuth();
        if (page == "notes") render();
      } catch (x) {}
    }
  });
  document.addEventListener("click", () => {
    if (npOpen) {
      npOpen = false;
      drawAuth();
    }
  });
  addEventListener("storage", (e) => {
    if (e.key == "cs_pres") refreshPz();
    if (e.key == "cs_social" && cur) {
      const c = msgs.filter((m) => m.t == cur.id).length;
      if (mcMap[cur.id] != null && c > mcMap[cur.id]) ding();
      mcMap[cur.id] = c;
    }
  });
  addEventListener("beforeunload", () => beat(false));
  setInterval(() => {
    beat(true);
    refreshPz();
  }, BEAT_MS);
  addEventListener("storage", (e) => {
    try {
      if (e.key == "cs_reqs") {
        reqs = JSON.parse(e.newValue || "[]");
        syncStatus();
        if (
          cur &&
          ["mine", "market", "dash", "home", "my", "needs"].includes(page)
        )
          render();
      }
      if (e.key == "cs_items") {
        items = JSON.parse(e.newValue || "[]");
        syncStatus();
        if (cur && ["market", "home", "my", "dash"].includes(page)) render();
      }
    } catch (x) {}
  });
  addEventListener("storage", (e) => {
    if (e.key == "cs_revs") {
      try {
        loadV(JSON.parse(e.newValue || "[]"));
        if (cur && ["mine", "user", "prof"].includes(page)) render();
      } catch (x) {}
    }
  });
}
