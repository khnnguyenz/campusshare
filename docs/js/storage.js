// Lưu và đọc dữ liệu (localStorage)

function save(){try{localStorage.setItem('cs_items',JSON.stringify(items))}catch(e){toast('Bộ nhớ trình duyệt đầy, bài đăng có thể không được lưu')}}

function saveS(){try{if(msgs.length>500)msgs=msgs.slice(-500);localStorage.setItem('cs_social',JSON.stringify({f:friends,m:msgs}))}catch(e){toast('Bộ nhớ trình duyệt đầy')}}

function saveP(){try{localStorage.setItem('cs_prof',JSON.stringify(prof))}catch(e){toast('Không lưu được (bộ nhớ đầy)')}try{localStorage.setItem('cs_accs',JSON.stringify(reg))}catch(e){}}

function saveN(){try{localStorage.setItem('cs_notes',JSON.stringify(notes.slice(0,200)))}catch(e){}}

function saveR(){try{localStorage.setItem('cs_reqs',JSON.stringify(reqs))}catch(e){toast('Bộ nhớ trình duyệt đầy')}}

function saveV(){try{localStorage.setItem('cs_revs',JSON.stringify(reviews))}catch(e){toast('Bộ nhớ trình duyệt đầy')}}

function loadV(a){const seen={},L=[];(a||[]).forEach(v=>{const k=v.r+'|'+v.by;if(!seen[k]){seen[k]=1;L.push(v)}});reviews.length=0;reviews.push(...L)}

function syncStatus(){items.forEach(i=>{const rs=reqs.filter(r=>r.item==i.id);i.status=rs.some(r=>['Active','Return'].includes(r.st))?'Borrowed':rs.some(r=>['Pending','Approved'].includes(r.st))?'Pending':'Available'})}

function saveFav(){try{const m={};items.forEach(i=>{if(i.fav)m[i.id]=1});localStorage.setItem('cs_fav_'+(cur?cur.id:'guest'),JSON.stringify(m))}catch(e){}}

function applyFav(){try{const m=JSON.parse(localStorage.getItem('cs_fav_'+(cur?cur.id:'guest'))||'{}');items.forEach(i=>{i.fav=!!m[i.id]})}catch(e){}}

function saveNeeds(){try{localStorage.setItem('cs_needs',JSON.stringify(needs))}catch(e){}}

function saveRep(){try{localStorage.setItem('cs_reports',JSON.stringify(reports))}catch(e){}}

function loadAll(){
  try{reg=JSON.parse(localStorage.getItem('cs_accs')||'[]');reg.forEach(a=>USERS[a.id]=a.user)}catch(e){}
  try{const s=JSON.parse(localStorage.getItem('cs_items')||'null');if(s)items=s}catch(e){}
  items=items.filter(i=>!/^i\d$/.test(i.id));
  try{const s=JSON.parse(localStorage.getItem('cs_social')||'{}');friends=s.f||[];msgs=s.m||[];prof=JSON.parse(localStorage.getItem('cs_prof')||'{}');Object.keys(prof).forEach(k=>USERS[k]&&Object.assign(USERS[k],prof[k]))}catch(e){}
  friends=friends.filter(r=>USERS[r.a]&&USERS[r.b]);msgs=msgs.filter(m=>USERS[m.f]&&USERS[m.t]);
  try{soundOn=localStorage.getItem('cs_snd')!='0';notes=JSON.parse(localStorage.getItem('cs_notes')||'[]')}catch(e){notes=[]}
  try{reqs=JSON.parse(localStorage.getItem('cs_reqs')||'[]').filter(r=>USERS[r.from]&&USERS[r.to])}catch(e){reqs=[]}
  try{loadV(JSON.parse(localStorage.getItem('cs_revs')||'[]'))}catch(e){}
  try{needs.push(...JSON.parse(localStorage.getItem('cs_needs')||'[]'))}catch(e){}
  try{reports.push(...JSON.parse(localStorage.getItem('cs_reports')||'[]'))}catch(e){}
  syncStatus();save();saveS();
}
