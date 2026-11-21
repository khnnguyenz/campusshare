// Mượn trả, giao dịch, mã QR, đánh giá

function createRequest(id){const d1=$('#d1').value,d2=$('#d2').value;if(!d1||!d2||d2<d1)return toast('Ngày trả phải sau ngày nhận');
 const i=items.find(x=>x.id==id);reqs.push({id:'r'+Date.now()+Math.random().toString(36).slice(2,6),item:id,from:cur.id,to:i.owner,d1,d2,msg:$('#msg').value,st:'Pending',token:null,gave:false,got:false,ret:false,retOk:false});
 i.status='Pending';notify(i.owner,`${cur.name} muốn mượn "${i.name}".`);document.querySelector('.modal').remove();toast('Đã gửi yêu cầu');render()}

function sendReq(id){const n=reqs.length;createRequest(id);if(reqs.length>n){saveR();save();go('mine')}}

function applyAction(rid,a){const r=reqs.find(x=>x.id==rid),i=items.find(x=>x.id==r.item);
 if(a=='ok'&&cur.id==r.to){r.st='Approved';r.token=tok();notify(r.from,`Yêu cầu mượn "${i.name}" được chấp nhận.`)}
 else if(a=='no'&&cur.id==r.to){r.st='Rejected';i.status='Available';notify(r.from,`Yêu cầu mượn "${i.name}" bị từ chối.`)}
 else if(a=='cancel'&&cur.id==r.from&&r.st=='Pending'){r.st='Cancelled';i.status='Available'}
 else if(a=='scan'&&cur.id==r.from&&r.st=='Approved'){const t=prompt('Nhập/dán mã QR của giao dịch (hoặc quét bằng camera rồi dán mã):');
  if(t!==r.token)return toast('Mã QR không hợp lệ');r.got=true;toast('Bạn đã xác nhận nhận đồ. Chờ chủ đồ xác nhận đã giao.')}
 else if(a=='give'&&cur.id==r.to&&r.st=='Approved'){r.gave=true}
 else if(a=='retreq'&&cur.id==r.from&&r.st=='Active'){r.st='Return';notify(r.to,`${cur.name} đã trả "${i.name}", vui lòng xác nhận.`)}
 else if(a=='done'&&cur.id==r.to&&r.st=='Return'){r.st='Completed';r.token=null;i.status='Available';USERS[r.to].pts+=20;USERS[r.from].pts+=10;notify(r.from,'Giao dịch hoàn tất! +10 Green Points.')}
 if(r.st=='Approved'&&r.gave&&r.got){r.st='Active';i.status='Borrowed';r.token=null;notify(r.from,`Cả hai bên đã xác nhận bàn giao "${i.name}".`)}
 else if(r.st=='Approved')i.status='Pending';
 render()}

function act(r,a){applyAction(r,a);saveR();save();if(a=='done'){const q=reqs.find(x=>x.id==r);if(q&&q.st=='Completed'){[q.to,q.from].forEach(u=>{if(USERS[u])prof[u]={...prof[u],pts:USERS[u].pts}});saveP()}}}

function showQR(rid){const r=reqs.find(x=>x.id==rid);modal(`<h3>Mã QR giao dịch</h3><div id="qr" style="display:flex;justify-content:center;padding:10px"></div><p class="mu">Chỉ chứa token ngẫu nhiên, không có thông tin cá nhân. Mã hết hiệu lực khi bàn giao xong. QR chỉ xác thực trong hệ thống; cần xác nhận của cả hai bên.</p><code style="word-break:break-all">${r.token}</code>`);new QRCode($('#qr'),{text:r.token,width:180,height:180})}

function mine(){const L=reqs.filter(r=>r.from==cur.id||r.to==cur.id);
 return `<h2>Quản lý giao dịch</h2>${L.map(r=>{const i=items.find(x=>x.id==r.item)||{name:'(đã xóa)'},own=r.to==cur.id;
 return `<div class="card" style="margin-bottom:12px"><div class="row"><b>${esc(i.name)}</b><span class="tag ${r.st}">${r.st}</span></div><p class="mu">${own?'Người mượn: '+USERS[r.from].name:'Chủ đồ: '+USERS[r.to].name} · ${r.d1} → ${r.d2}<br>${esc(r.msg||'')}</p><div class="bar">
 ${own&&r.st=='Pending'?`<button class="btn g" onclick="act('${r.id}','ok')">Chấp nhận</button><button class="btn r" onclick="act('${r.id}','no')">Từ chối</button>`:''}
 ${!own&&r.st=='Pending'?`<button class="btn r" onclick="act('${r.id}','cancel')">Hủy yêu cầu</button>`:''}
 ${r.st=='Approved'?`<button class="btn o" onclick="showQR('${r.id}')">Xem QR</button>`+(own?`<button class="btn" ${r.gave?'disabled':''} onclick="act('${r.id}','give')">${r.gave?'Đã xác nhận giao':'Xác nhận đã giao'}</button>`:`<button class="btn" ${r.got?'disabled':''} onclick="act('${r.id}','scan')">${r.got?'Đã xác nhận nhận':'Nhập mã QR nhận đồ'}</button>`):''}
 ${!own&&r.st=='Active'?`<button class="btn" onclick="act('${r.id}','retreq')">Báo đã trả</button>`:''}
 ${own&&r.st=='Return'?`<button class="btn g" onclick="act('${r.id}','done')">Xác nhận hoàn tất</button>`:''}${r.st=='Completed'&&!reviews.some(v=>v.r==r.id&&v.by==cur.id)?`<button class="btn o" onclick="rev('${r.id}')">⭐ Đánh giá</button>`:''}</div></div>`}).join('')||'<p class="mu">Chưa có giao dịch.</p>'}`}

function rev(rid){const r=reqs.find(x=>x.id==rid);if(!cur||!r||r.st!='Completed'||![r.from,r.to].includes(cur.id))return toast('Không thể đánh giá giao dịch này');if(reviews.some(v=>v.r==rid&&v.by==cur.id))return toast('Bạn đã đánh giá giao dịch này rồi');const sv=prompt('Số sao (1–5):','5');if(sv===null)return;const s=Number(sv);if(!Number.isInteger(s)||s<1||s>5)return toast('Số sao không hợp lệ');const txt=prompt('Nhận xét (thái độ, đúng hẹn):');if(txt===null)return;if(reviews.some(v=>v.r==rid&&v.by==cur.id))return;reviews.push({r:rid,by:cur.id,stars:s,txt:txt.trim(),t:Date.now()});saveV();notify(cur.id==r.to?r.from:r.to,`${cur.name} đã đánh giá bạn ${s}★.`);toast('Cảm ơn bạn đã đánh giá');render()}
