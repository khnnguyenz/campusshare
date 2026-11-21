
let campusShareStarted = false;

function startCampusShare() {
  if (campusShareStarted) return;

  campusShareStarted = true;

  loadAll();
  initTheme();
  bindEvents();
  restoreSession();

  $("#lg").innerHTML =
    logo(32) + "<span>Campus<b>Share</b></span>";

  render();
  obs();

  console.log("CampusShare đã khởi động!");
}

if (window.CS) {
  startCampusShare();
} else {
  window.addEventListener(
    "cs-firebase-ready",
    startCampusShare,
    { once: true }
  );

  window.addEventListener(
    "cs-firebase-error",
    function (event) {
      console.error("Không thể khởi tạo Firebase:", event.detail);
      alert("Không thể kết nối Firebase. Hãy kiểm tra Console!");
    },
    { once: true }
  );
}
