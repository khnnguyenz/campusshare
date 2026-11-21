
// ==========================================
// CAMPUSSHARE - FIREBASE AUTHENTICATION
// ==========================================

let authListenerStarted = false;
let activeAuthUid = null;

// Chuyển lỗi Firebase thành thông báo dễ hiểu
function authError(error) {
  const code = error?.code || "";

  const errors = {
    "auth/invalid-email": "Email không hợp lệ",
    "auth/user-not-found": "Tài khoản không tồn tại",
    "auth/wrong-password": "Sai mật khẩu",
    "auth/invalid-credential": "Email hoặc mật khẩu không chính xác",
    "auth/email-already-in-use": "Email đã được đăng ký",
    "auth/weak-password": "Mật khẩu quá yếu",
    "auth/too-many-requests": "Bạn thử quá nhiều lần. Hãy thử lại sau",
    "auth/network-request-failed": "Không thể kết nối mạng",
    "auth/operation-not-allowed": "Firebase chưa bật Email/Password",
    "auth/invalid-api-key": "Firebase API Key không hợp lệ"
  };

  return errors[code] || "Có lỗi xảy ra: " + code;
}

// ==========================================
// LOAD USER PROFILE FROM FIRESTORE
// ==========================================

async function login(id, welcome = true) {
  try {
    const { db, dbApi } = window.CS;

    const userRef = dbApi.doc(db, "users", id);
    const userSnap = await dbApi.getDoc(userRef);

    if (!userSnap.exists()) {
      toast("Không tìm thấy hồ sơ người dùng");
      return;
    }

    const user = {
      id,
      ...userSnap.data()
    };

    USERS[id] = user;
    cur = user;
    activeAuthUid = id;

    if (welcome) {
      toast("Xin chào, " + cur.name);
    }

    go(
      cur.role == "student"
        ? "dash"
        : cur.role == "admin"
          ? "admin"
          : "super"
    );

    beat(true);

  } catch (error) {
    console.error("Load user profile:", error);
    toast("Không thể tải hồ sơ người dùng");
  }
}

// ==========================================
// LOGOUT
// ==========================================

async function logout() {
  try {
    beat(false);

    await window.CS.authApi.signOut(window.CS.auth);

    cur = null;
    activeAuthUid = null;

    go("home");

  } catch (error) {
    console.error("Logout:", error);
    toast(authError(error));
  }
}

// ==========================================
// LOGIN
// ==========================================

async function doLogin() {
  const email = $("#l_i").value.trim().toLowerCase();
  const password = $("#l_p").value;

  keep = !!$("#l_keep")?.checked;

  if (!email || !password) {
    return toast("Nhập đầy đủ thông tin");
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return toast("Email không hợp lệ");
  }

  try {
    const { auth, authApi } = window.CS;

    const persistence = keep
      ? authApi.browserLocalPersistence
      : authApi.browserSessionPersistence;

    await authApi.setPersistence(auth, persistence);

    await authApi.signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    closeM();

  } catch (error) {
    console.error("Login:", error);
    toast(authError(error));
  }
}

// ==========================================
// REGISTER
// ==========================================

async function doReg() {
  const name = $("#r_n").value.trim();
  const email = $("#r_i").value.trim().toLowerCase();
  const password = $("#r_p").value;

  const school = $("#r_s").value.trim() || "—";
  const cls = $("#r_c").value.trim() || "—";

  if (name.length < 2) {
    return toast("Nhập họ tên");
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return toast("Email không hợp lệ");
  }

  if (password.length < 6) {
    return toast("Mật khẩu tối thiểu 6 ký tự");
  }

  try {
    const { auth, db, authApi, dbApi } = window.CS;

    // Đăng ký tài khoản Firebase
    const credential =
      await authApi.createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const uid = credential.user.uid;

    // Cập nhật tên hiển thị trong Firebase Auth
    await authApi.updateProfile(credential.user, {
      displayName: name
    });

    // Tạo hồ sơ trong Firestore
    const user = {
      name,
      email,
      role: "student",
      school,
      cls,
      pts: 0,
      createdAt: dbApi.serverTimestamp()
    };

    await dbApi.setDoc(
      dbApi.doc(db, "users", uid),
      user
    );

    USERS[uid] = {
      id: uid,
      ...user
    };

    cur = USERS[uid];

    closeM();
    toast("Đăng ký thành công!");

    await login(uid, false);

  } catch (error) {
    console.error("Register:", error);
    toast(authError(error));
  }
}

// ==========================================
// AUTH MODALS
// ==========================================

function loginModal() {
  go("login");
}

function regModal() {
  go("register");
}

// ==========================================
// LOGIN VIEW
// ==========================================

function loginV() {
  return authShell(
    `<h2 style="text-align:center;margin:12px 0 4px">Đăng nhập</h2>
    <p class="mu" style="text-align:center;margin:0 0 10px">
      Chào mừng trở lại, cùng chia sẻ tri thức.
    </p>

    <label>Email</label>
    <input id="l_i" type="email" autocomplete="username">

    <label>Mật khẩu</label>
    <input id="l_p" type="password"
      autocomplete="current-password"
      onkeydown="if(event.key=='Enter')doLogin()">

    <div class="row" style="margin-bottom:14px">
      <label style="display:flex;align-items:center;gap:8px;margin:0;font-size:14px;cursor:pointer">
        <input id="l_keep" type="checkbox" style="width:auto;margin:0">
        Giữ đăng nhập
      </label>

      <a class="al" onclick="go('forgot')">Quên mật khẩu?</a>
    </div>

    <button class="btn" onclick="doLogin()">Đăng nhập</button>

    <p class="mu" style="text-align:center;margin:16px 0 0">
      Chưa có tài khoản?
      <a class="al" onclick="go('register')">Đăng ký ngay</a>
    </p>

    <p class="mu" style="font-size:12px;text-align:center;margin:8px 0 0">
      Không nên bật “Giữ đăng nhập” trên máy dùng chung.
    </p>`
  );
}

// ==========================================
// REGISTER VIEW
// ==========================================

function registerV() {
  return authShell(
    `<h2 style="text-align:center;margin:12px 0 4px">Đăng ký học sinh</h2>

    <label>Họ và tên</label>
    <input id="r_n" autocomplete="name">

    <label>Email</label>
    <input id="r_i" type="email" autocomplete="email">

    <label>Mật khẩu (≥ 6 ký tự)</label>
    <input id="r_p" type="password" autocomplete="new-password">

    <label>Tên trường</label>
    <input id="r_s" value="THPT Lê Quý Đôn">

    <label>Lớp</label>
    <input id="r_c" placeholder="VD: 11A2">

    <button class="btn" onclick="doReg()">Tạo tài khoản</button>

    <p class="mu" style="text-align:center;margin:16px 0 0">
      Đã có tài khoản?
      <a class="al" onclick="go('login')">Đăng nhập</a>
    </p>`
  );
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

function forgotV() {
  return authShell(
    `<h2 style="text-align:center;margin:12px 0 4px">Quên mật khẩu</h2>

    <p class="mu" style="text-align:center;margin:0 0 10px">
      Nhập email đã đăng ký. Firebase sẽ gửi hướng dẫn đặt lại mật khẩu.
    </p>

    <label>Email</label>
    <input id="f_e" type="email"
      onkeydown="if(event.key=='Enter')sendReset()">

    <button class="btn" onclick="sendReset()">Gửi hướng dẫn</button>

    <p class="mu" style="text-align:center;margin:16px 0 0">
      <a class="al" onclick="go('login')">← Quay lại đăng nhập</a>
    </p>`
  );
}

async function sendReset() {
  const email = $("#f_e").value.trim().toLowerCase();

  if (!email) {
    return toast("Nhập email");
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return toast("Email không hợp lệ");
  }

  try {
    await window.CS.authApi.sendPasswordResetEmail(
      window.CS.auth,
      email
    );

    toast("Đã gửi email đặt lại mật khẩu");

  } catch (error) {
    console.error("Password reset:", error);
    toast(authError(error));
  }
}

// ==========================================
// AUTH SHELL
// ==========================================

function authShell(h) {
  return `<div class="au">
    <div class="abg" style="background-image:url('${LBG}')"></div>

    <div class="acard">
      <div class="logo" onclick="go('home')"
        style="text-align:center;font-size:24px">
        ${logo(36)}Campus<b>Share</b>
      </div>

      ${h}

      <p style="text-align:center;margin:14px 0 0">
        <a class="al" onclick="go('home')">← Về trang chủ</a>
      </p>
    </div>
  </div>`;
}

// ==========================================
// RESTORE FIREBASE SESSION
// ==========================================

function restoreSession() {
  if (authListenerStarted) return;

  authListenerStarted = true;

  const { auth, authApi } = window.CS;

  authApi.onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      cur = null;
      activeAuthUid = null;
      beat(false);
      return;
    }

    if (activeAuthUid === firebaseUser.uid && cur) {
      return;
    }

    await login(firebaseUser.uid, false);
  });
}
