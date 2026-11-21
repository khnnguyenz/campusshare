// Đăng nhập, đăng ký, quên mật khẩu, giữ đăng nhập

function login(id){cur=USERS[id];toast('Xin chào, '+cur.name);go(cur.role=='student'?'dash':cur.role=='admin'?'admin':'super');beat(true);saveSess(id)}

function logout(){beat(false);try{localStorage.removeItem('cs_sess');sessionStorage.removeItem('cs_sess')}catch(e){}cur=null;go('home')}

async function doLogin(){const i=$('#l_i').value.trim().toLowerCase().split(' ').join(''),p=$('#l_p').value;keep=!!$('#l_keep')?.checked;if(!i||!p)return toast('Nhập đầy đủ thông tin');const h=await sha(p);let uid=null;for(const a of ACC)if(a.ids.includes(i)&&(await sha(a.pw))==h)uid=a.id;for(const a of reg)if(a.ids.includes(i)&&a.h==h)uid=a.id;if(!uid)return toast('Sai tài khoản hoặc mật khẩu');closeM();login(uid)}

async function doReg(){const n=$('#r_n').value.trim(),i=$('#r_i').value.trim().toLowerCase().split(' ').join(''),p=$('#r_p').value;if(n.length<2)return toast('Nhập họ tên');if(!(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i)||/^0\d{9}$/.test(i)))return toast('Email hoặc SĐT (10 số) không hợp lệ');if(p.length<6)return toast('Mật khẩu tối thiểu 6 ký tự');if(ACC.concat(reg).some(a=>a.ids.includes(i)))return toast('Tài khoản đã tồn tại');const id='u'+Date.now(),user={id,name:n,role:'student',school:$('#r_s').value.trim()||'—',cls:$('#r_c').value.trim()||'—',pts:0};reg.push({id,ids:[i],h:await sha(p),user});USERS[id]=user;try{localStorage.setItem('cs_accs',JSON.stringify(reg))}catch(e){}closeM();toast('Đăng ký thành công');login(id)}

function loginModal(){go('login')}

function regModal(){go('register')}

function loginV(){return authShell(`<h2 style="text-align:center;margin:12px 0 4px">Đăng nhập</h2><p class="mu" style="text-align:center;margin:0 0 10px">Chào mừng trở lại, cùng chia sẻ tri thức.</p><label>Email / SĐT / Tên đăng nhập</label><input id="l_i" autocomplete="username"><label>Mật khẩu</label><input id="l_p" type="password" autocomplete="current-password" onkeydown="if(event.key=='Enter')doLogin()"><div class="row" style="margin-bottom:14px"><label style="display:flex;align-items:center;gap:8px;margin:0;font-size:14px;cursor:pointer"><input id="l_keep" type="checkbox" style="width:auto;margin:0"> Giữ đăng nhập</label><a class="al" onclick="go('forgot')">Quên mật khẩu?</a></div><button class="btn" onclick="doLogin()">Đăng nhập</button><p class="mu" style="text-align:center;margin:16px 0 0">Chưa có tài khoản? <a class="al" onclick="go('register')">Đăng ký ngay</a></p><p class="mu" style="font-size:12px;text-align:center;margin:8px 0 0">Không nên bật “Giữ đăng nhập” trên máy dùng chung.</p>`)}

function registerV(){return authShell(`<h2 style="text-align:center;margin:12px 0 4px">Đăng ký học sinh</h2><label>Họ và tên</label><input id="r_n"><label>Email hoặc số điện thoại</label><input id="r_i"><label>Mật khẩu (≥ 6 ký tự)</label><input id="r_p" type="password"><label>Tên trường</label><input id="r_s" value="THPT Lê Quý Đôn"><label>Lớp</label><input id="r_c" placeholder="VD: 11A2"><button class="btn" onclick="doReg()">Tạo tài khoản</button><p class="mu" style="text-align:center;margin:16px 0 0">Đã có tài khoản? <a class="al" onclick="go('login')">Đăng nhập</a></p>`)}

function forgotV(){return authShell(`<h2 style="text-align:center;margin:12px 0 4px">Quên mật khẩu</h2><p class="mu" style="text-align:center;margin:0 0 10px">Nhập email hoặc số điện thoại đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p><label>Email / SĐT</label><input id="f_e" onkeydown="if(event.key=='Enter')sendReset()"><button class="btn" onclick="sendReset()">Gửi hướng dẫn</button><div class="ok" id="f_ok">Đã ghi nhận yêu cầu. <span class="mu">Tính năng gửi email đặt lại mật khẩu chưa được kích hoạt, vui lòng liên hệ quản trị viên.</span></div><p class="mu" style="text-align:center;margin:16px 0 0"><a class="al" onclick="go('login')">← Quay lại đăng nhập</a></p>`)}

function sendReset(){if(!$('#f_e').value.trim())return toast('Nhập email hoặc số điện thoại');$('#f_ok').style.display='block'}

function authShell(h){return `<div class="au"><div class="abg" style="background-image:url('${LBG}')"></div><div class="acard"><div class="logo" onclick="go('home')" style="text-align:center;font-size:24px">${logo(36)}Campus<b>Share</b></div>${h}<p style="text-align:center;margin:14px 0 0"><a class="al" onclick="go('home')">← Về trang chủ</a></p></div></div>`}

function saveSess(id){try{sessionStorage.removeItem('cs_sess');localStorage.removeItem('cs_sess');(keep?localStorage:sessionStorage).setItem('cs_sess',JSON.stringify({id,exp:Date.now()+30*864e5}))}catch(e){}}

function loadSess(){try{for(const st of [localStorage,sessionStorage]){const v=JSON.parse(st.getItem('cs_sess')||'null');if(v){if(v.exp>Date.now()&&USERS[v.id])return v.id;st.removeItem('cs_sess')}}}catch(e){}return null}

function restoreSession(){const sid=loadSess();if(sid){cur=USERS[sid];beat(true);page=cur.role=='student'?'dash':'super'}}
