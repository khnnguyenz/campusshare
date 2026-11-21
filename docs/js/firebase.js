// Kết nối Firebase: đăng nhập, lưu dữ liệu, cập nhật trực tiếp
// Kết nối Firebase. Chỉ chạy khi bạn đã điền firebase-config.js; nếu chưa → app lưu trên trình duyệt (chế độ cũ).
(async function () {
  const cfg = typeof FIREBASE_CONFIG !== "undefined" ? FIREBASE_CONFIG : {};
  if (!cfg.apiKey || !cfg.projectId) {
    startApp();
    return;
  }
  let M;
  try {
    const B = "https://www.gstatic.com/firebasejs/10.12.2/";
    M = await Promise.all([
      import(B + "firebase-app.js"),
      import(B + "firebase-auth.js"),
      import(B + "firebase-firestore.js"),
    ]);
  } catch (e) {
    console.error(e);
    startApp();
    setTimeout(
      () => toast("Không tải được Firebase, đang dùng chế độ lưu trên máy này"),
      600,
    );
    return;
  }
  const { initializeApp } = M[0],
    {
      getAuth,
      onAuthStateChanged,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      sendPasswordResetEmail,
      setPersistence,
      browserLocalPersistence,
      browserSessionPersistence,
    } = M[1],
    {
      getFirestore,
      doc,
      setDoc,
      getDoc,
      deleteDoc,
      collection,
      query,
      where,
      onSnapshot,
    } = M[2];
  const auth = getAuth(initializeApp(cfg)),
    db = getFirestore(auth.app);
  window.FB_ON = true;
  delete USERS.admin;
  PRES_MS = 150000;
  BEAT_MS = 60000;

  /* ---------- tiện ích ---------- */
  const ss = (o) =>
    JSON.stringify(o, (k, v) =>
      v && typeof v === "object" && !Array.isArray(v)
        ? Object.keys(v)
            .sort()
            .reduce((a, x) => ((a[x] = v[x]), a), {})
        : v,
    );
  const clean = (o) => JSON.parse(JSON.stringify(o));
  const strip = (c, o) => {
    if (c != "items") return o;
    const { status, fav, ...r } = o;
    return r;
  };
  const fail = (e) => {
    console.error(e);
    toast(
      e.code == "permission-denied"
        ? "Không có quyền thực hiện thao tác này"
        : "Lỗi lưu dữ liệu: " + (e.code || e.message),
    );
  };
  const authMsg = (e) =>
    ({
      "auth/invalid-credential": "Sai tài khoản hoặc mật khẩu",
      "auth/wrong-password": "Sai tài khoản hoặc mật khẩu",
      "auth/user-not-found": "Sai tài khoản hoặc mật khẩu",
      "auth/email-already-in-use": "Tài khoản đã tồn tại",
      "auth/weak-password": "Mật khẩu tối thiểu 6 ký tự",
      "auth/network-request-failed": "Lỗi mạng, hãy thử lại",
      "auth/too-many-requests":
        "Thử quá nhiều lần, hãy chờ một lúc rồi thử lại",
      "auth/operation-not-allowed":
        "Chưa bật đăng nhập Email/Password trong Firebase",
    })[e.code] || "Lỗi: " + (e.code || e.message);
  const toEmail = (i) => {
    i = String(i).trim().toLowerCase().split(" ").join("");
    return i.includes("@")
      ? i
      : /^\d{8,}$/.test(i)
        ? i + "@sdt.campusshare.app"
        : i + "@campusshare.app";
  };

  /* ---------- các bộ sưu tập dữ liệu (collection) ----------
     sc: pub = ai cũng đọc; auth = người đã đăng nhập; own = chỉ dữ liệu của mình; adm = chỉ admin */
  const D = [
    {
      c: "items",
      sc: "pub",
      get: () => items,
      set: (v) => {
        items = v;
        syncStatus();
        applyFav();
      },
      key: (o) => o.id,
    },
    {
      c: "reviews",
      sc: "pub",
      get: () => reviews,
      set: (v) => {
        reviews.length = 0;
        reviews.push(...v);
      },
      key: (o) => o.r + "_" + o.by,
    },
    {
      c: "borrowRequests",
      sc: "auth",
      get: () => reqs,
      set: (v) => {
        reqs = v;
        syncStatus();
        recalcPts();
      },
      key: (o) => o.id,
    },
    {
      c: "friendships",
      sc: "auth",
      get: () => friends,
      set: (v) => {
        friends = v;
      },
      key: (o) => [o.a, o.b].sort().join("_"),
    },
    {
      c: "needs",
      sc: "auth",
      get: () => needs,
      set: (v) => {
        needs.length = 0;
        needs.push(...v);
      },
      key: (o) => o.id,
    },
    {
      c: "notifications",
      sc: "own",
      get: () => notes,
      set: (v) => {
        notes = v;
      },
      key: (o) => String(o.id),
      q: (u) => [["to", "==", u]],
    },
    {
      c: "messages",
      sc: "own",
      get: () => msgs,
      set: (v) => {
        msgs = v;
      },
      key: (o) => o.id,
      q: (u) => [
        ["f", "==", u],
        ["t", "==", u],
      ],
    },
    {
      c: "reports",
      sc: "adm",
      get: () => reports,
      set: (v) => {
        reports.length = 0;
        reports.push(...v);
      },
      key: (o) => o.id,
    },
  ];
  D.forEach((d) => {
    d.last = {};
    d.un = [];
    d.parts = [];
    d.init = false;
  });
  const byC = (c) => D.find((d) => d.c == c);

  /* ---------- ghi dữ liệu: chỉ ghi phần thay đổi ---------- */
  function push(d) {
    const seen = {};
    for (const o of d.get()) {
      if (!o.id && (d.c == "messages" || d.c == "reports"))
        o.id =
          (d.c == "messages" ? "m" : "rp") +
          Date.now() +
          Math.random().toString(36).slice(2, 6);
      const k = d.key(o);
      seen[k] = 1;
      const data = clean(strip(d.c, o)),
        j = ss(data);
      if (d.last[k] !== j) {
        d.last[k] = j;
        setDoc(doc(db, d.c, k), data).catch(fail);
      }
    }
    for (const k of Object.keys(d.last))
      if (!seen[k]) {
        delete d.last[k];
        deleteDoc(doc(db, d.c, k)).catch(fail);
      }
  }
  window.save = () => push(byC("items"));
  window.saveV = () => push(byC("reviews"));
  window.saveR = () => push(byC("borrowRequests"));
  window.saveN = () => push(byC("notifications"));
  window.saveS = () => {
    push(byC("friendships"));
    push(byC("messages"));
  };
  window.saveNeeds = () => push(byC("needs"));
  window.saveRep = () => push(byC("reports"));
  window.saveP = () => {
    if (cur && auth.currentUser)
      setDoc(doc(db, "users", cur.id), clean(cur)).catch(fail);
  };
  window.recalcPts = () => {
    if (!cur || cur.role != "student") return;
    const p =
      reqs.filter((r) => r.st == "Completed" && r.to == cur.id).length * 20 +
      reqs.filter((r) => r.st == "Completed" && r.from == cur.id).length * 10;
    if (cur.pts !== p) {
      cur.pts = p;
      saveP();
    }
  };
  window.loadAll = () => {
    try {
      soundOn = localStorage.getItem("cs_snd") != "0";
    } catch (e) {}
  };
  window.restoreSession = () => {};
  window.saveSess = () => {};
  window.loadSess = () => null;

  /* ---------- đọc dữ liệu: tự cập nhật khi có thay đổi ---------- */
  const PG = {
    items: ["market", "home", "my", "dash", "needs", "user", "rank"],
    borrowRequests: ["mine", "market", "home", "dash", "my", "user", "rank"],
    reviews: ["mine", "user", "rank"],
    notifications: ["notes"],
    friendships: ["friends", "user", "chat"],
    messages: ["chat"],
    needs: ["needs"],
    reports: ["admin", "super"],
    users: ["market", "home", "friends", "user", "rank", "chat", "dash"],
  };
  const busy = () => {
    const a = document.activeElement;
    return !!(
      a &&
      a.closest &&
      a.closest("#app") &&
      /INPUT|TEXTAREA|SELECT/.test(a.tagName) &&
      page != "chat"
    );
  };
  const keepRender = () => {
    const c = $("#cm"),
      v = c ? c.value : "";
    render();
    if (v) {
      const e = $("#cm");
      if (e) {
        e.value = v;
        e.focus();
      }
    }
  };
  let tm = null,
    dirty = {};
  function soft(c) {
    dirty[c] = 1;
    clearTimeout(tm);
    tm = setTimeout(() => {
      const cs = Object.keys(dirty);
      dirty = {};
      const hit =
        cs.some((x) => (PG[x] || []).includes(page)) ||
        (cur && cs.some((x) => x == "notifications" || x == "messages"));
      if (hit && !busy()) keepRender();
      else if (cur) drawAuth();
    }, 150);
  }
  function merge(d) {
    const m = {};
    d.parts.forEach((p) => (p || []).forEach((o) => (m[d.key(o)] = o)));
    const arr = Object.values(m),
      bn = cur ? unread() : 0,
      bm = cur ? msgUnread() : 0;
    d.last = {};
    arr.forEach((o) => (d.last[d.key(o)] = ss(clean(strip(d.c, o)))));
    d.set(arr);
    if (
      d.init &&
      cur &&
      ((d.c == "notifications" && unread() > bn) ||
        (d.c == "messages" && msgUnread() > bm))
    )
      ding();
    d.init = d.parts.every((p) => p);
    soft(d.c);
  }
  function listen(d, uid) {
    const qs = d.q ? d.q(uid) : [null];
    d.parts = qs.map(() => null);
    d.init = false;
    qs.forEach((w, i) =>
      d.un.push(
        onSnapshot(
          w
            ? query(collection(db, d.c), where(w[0], w[1], w[2]))
            : collection(db, d.c),
          (s) => {
            d.parts[i] = s.docs.map((x) => x.data());
            merge(d);
          },
          (e) => console.error(d.c, e.code),
        ),
      ),
    );
  }
  let presMap = {},
    unPres = null;
  window.presRead = () => presMap;
  window.beat = (on = true) => {
    if (cur && auth.currentUser)
      setDoc(doc(db, "presence", cur.id), { t: Date.now(), on }).catch(
        () => {},
      );
  };
  function startAuthData(uid, adm) {
    stopAuthData();
    D.forEach((d) => {
      if (d.sc == "auth" || d.sc == "own" || (d.sc == "adm" && adm))
        listen(d, uid);
    });
    unPres = onSnapshot(
      collection(db, "presence"),
      (s) => {
        presMap = {};
        s.docs.forEach((x) => (presMap[x.id] = x.data()));
        refreshPz();
      },
      (e) => console.error("presence", e.code),
    );
  }
  function stopAuthData() {
    D.forEach((d) => {
      if (d.sc != "pub") {
        d.un.forEach((f) => f());
        d.un = [];
        d.init = false;
      }
    });
    if (unPres) {
      unPres();
      unPres = null;
    }
  }
  D.forEach((d) => {
    if (d.sc == "pub") listen(d);
  });
  onSnapshot(
    collection(db, "users"),
    (s) => {
      s.docs.forEach((x) => {
        USERS[x.id] = Object.assign(USERS[x.id] || {}, x.data(), { id: x.id });
      });
      soft("users");
    },
    (e) => console.error("users", e.code),
  );

  /* ---------- đăng nhập / đăng ký ---------- */
  let pending = null;
  window.doLogin = async function () {
    const i = $("#l_i").value,
      p = $("#l_p").value;
    if (!i.trim() || !p) return toast("Nhập đầy đủ thông tin");
    const keepMe = !!$("#l_keep")?.checked;
    try {
      await setPersistence(
        auth,
        keepMe ? browserLocalPersistence : browserSessionPersistence,
      );
      await signInWithEmailAndPassword(auth, toEmail(i), p);
    } catch (e) {
      toast(authMsg(e));
    }
  };
  window.doReg = async function () {
    const n = $("#r_n").value.trim(),
      i = $("#r_i").value.trim().toLowerCase().split(" ").join(""),
      p = $("#r_p").value;
    if (n.length < 2) return toast("Nhập họ tên");
    if (!(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i) || /^0\d{9}$/.test(i)))
      return toast("Email hoặc SĐT (10 số) không hợp lệ");
    if (p.length < 6) return toast("Mật khẩu tối thiểu 6 ký tự");
    pending = {
      name: n,
      school: $("#r_s").value.trim() || "—",
      cls: $("#r_c").value.trim() || "—",
    };
    try {
      await setPersistence(auth, browserLocalPersistence);
      await createUserWithEmailAndPassword(auth, toEmail(i), p);
    } catch (e) {
      pending = null;
      toast(authMsg(e));
    }
  };
  window.logout = async function () {
    beat(false);
    try {
      await signOut(auth);
    } catch (e) {}
    go("home");
  };
  window.sendReset = async function () {
    const v = $("#f_e").value.trim().toLowerCase();
    if (!v) return toast("Nhập email hoặc số điện thoại");
    const ok = $("#f_ok");
    ok.style.display = "block";
    if (!v.includes("@")) {
      ok.textContent =
        "Tài khoản đăng ký bằng số điện thoại không đặt lại được bằng email. Vui lòng liên hệ quản trị viên.";
      return;
    }
    try {
      await sendPasswordResetEmail(auth, v);
    } catch (e) {}
    ok.textContent =
      "Nếu email này đã đăng ký, bạn sẽ nhận được thư hướng dẫn đặt lại mật khẩu. Hãy kiểm tra cả mục Spam.";
  };
  onAuthStateChanged(auth, async (u) => {
    if (!u) {
      cur = null;
      if (
        ![
          "home",
          "market",
          "about",
          "contact",
          "login",
          "register",
          "forgot",
          "terms",
          "privacy",
        ].includes(page)
      )
        page = "home";
      document.body.classList.toggle(
        "auth",
        ["login", "register", "forgot"].includes(page),
      );
      stopAuthData();
      reqs = [];
      notes = [];
      friends = [];
      msgs = [];
      needs.length = 0;
      reports.length = 0;
      syncStatus();
      applyFav();
      render();
      return;
    }
    try {
      const ref = doc(db, "users", u.uid),
        snap = await getDoc(ref);
      let data;
      if (snap.exists()) data = snap.data();
      else {
        const p = pending || {};
        data = {
          id: u.uid,
          name: p.name || u.email.split("@")[0],
          role: "student",
          school: p.school || "—",
          cls: p.cls || "—",
          pts: 0,
          bio: "",
        };
        await setDoc(ref, data);
      }
      pending = null;
      USERS[u.uid] = Object.assign(USERS[u.uid] || {}, data, { id: u.uid });
      startAuthData(u.uid, data.role == "super");
      login(u.uid);
      applyFav();
    } catch (e) {
      fail(e);
    }
  });
  startApp();
})();
