function renderPage() {
  const N = cur ? notes.filter((n) => n.to == cur.id && !n.read).length : 0;
  const tabs = !cur
    ? [
        ["home", "Trang chủ"],
        ["market", "Kho đồ dùng"],
        ["about", "Giới thiệu"],
        ["contact", "Liên hệ"],
      ]
    : cur.role == "student"
      ? [
          ["dash", "Dashboard"],
          ["market", "Kho đồ dùng"],
          ["post", "Đăng đồ"],
          ["my", "Đồ của tôi"],
          ["friends", "Bạn bè"],
          ["chat", "Tin nhắn"],
          ["needs", "Nhu cầu của tôi"],
          ["mine", "Giao dịch"],
          ["notes", "Thông báo" + (N ? " (" + N + ")" : "")],
          ["rank", "Green Impact"],
        ]
      : [
          [cur.role, "Thống kê"],
          ["market", "Bài đăng"],
        ];
  $("#nav").innerHTML =
    tabs
      .map(
        (t) =>
          `<button class="${page == t[0] ? "on" : ""}" onclick="go('${t[0]}')">${t[1]}</button>`,
      )
      .join("") +
    (cur
      ? `<span class="mu" style="padding:8px">👤 ${esc(cur.name.split(" ")[0])}</span>`
      : "");
  $("#auth").innerHTML = cur
    ? `<button class="btn o" onclick="logout()">Đăng xuất</button>`
    : `<button class="btn" onclick="loginModal()">Đăng nhập</button>`;
  const v = {
    home,
    market,
    dash,
    post,
    mine,
    notes: notesV,
    needs: needsV,
    login: loginV,
    prof: profV,
    user: userV,
    friends: friendsV,
    chat: chatV,
    register: registerV,
    forgot: forgotV,
    about: aboutV,
    terms: termsV,
    privacy: privacyV,
    contact: contactV,
    my: myV,
    rank,
    admin,
    super: admin,
  }[page];
  $("#app").innerHTML = v();
  if (page == "market")
    ["q", "cat", "st", "sort"].forEach((k) => {
      const e = $("#f_" + k);
      if (e) e.value = f[k];
    });
}

function render() {
  renderPage();
  const m = document.querySelector(".ms");
  if (m) m.scrollTop = m.scrollHeight;
  drawAuth();
  navBadge();
}

function go(p) {
  document.body.classList.toggle(
    "auth",
    ["login", "register", "forgot"].includes(p),
  );
  page = p;
  render();
  const a = $("#app");
  a.classList.remove("pg");
  void a.offsetWidth;
  a.classList.add("pg");
  window.scrollTo(0, 0);
  obs();
}
