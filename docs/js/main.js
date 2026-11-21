// Điểm khởi động ứng dụng

function startApp() {
  loadAll();
  initTheme();
  bindEvents();
  restoreSession();
  $("#lg").innerHTML = logo(32) + "<span>Campus<b>Share</b></span>";
  render();
  obs();
}
