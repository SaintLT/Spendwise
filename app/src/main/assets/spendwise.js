const $=s=>document.querySelector(s),K='spendwise-v1',PAL=['#2f6bff','#ff5c9a','#7c5cff','#ff9f2e','#19c3b1','#22c55e','#ef4444','#64748b','#0ea5e9'],PM=['Cash','Mobile money','Card','Bank transfer'],CUR=['$','€','£','KSh','USh','TSh','₦','R','₹'];
// ===== Storage and defaults =====
const DEF=['Food & groceries','Transport','Bills & utilities','Airtime & data','Rent','Shopping','Health','Entertainment','Other'];
let S=null;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!S||!S.tx)S={tx:[],cur:'KSh',cats:DEF.map((n,i)=>({name:n,color:PAL[i%PAL.length],budget:0}))};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const pad=n=>String(n).padStart(2,'0'),today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
// ===== Dates and app state =====
const dstr=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),pd=s=>new Date(s+'T00:00'),addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return dstr(d)},wkStart=s=>addD(s,-((pd(s).getDay()+6)%7)),DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const V={tab:'ov',st:[],r:'w',sel:today(),q:'',f:'',get ym(){return this.sel.slice(0,7)},set ym(v){if(v!==this.ym){const[y,m]=v.split('-').map(Number);this.sel=v+'-'+pad(Math.min(+this.sel.slice(8),new Date(y,m,0).getDate()))}}};let M={};
// ===== Themes: colour themes and light / dark / pure black =====
const TH={ocean:{n:'Ocean',a:['#2563eb','#e8efff','#f4f7fe','#eaeff8'],da:['#42a5f5','#14222d'],g:['#1e3a8a','#2563eb','#0ea5e9']},
emerald:{n:'Emerald',a:['#00875a','#e6f3ee','#f2f8f5','#e0eee8'],da:['#00c853','#0b2717'],g:['#064e3b','#047857','#10b981']},
royal:{n:'Royal',a:['#6a4bc4','#f0edf9','#f6f4fd','#e9e5f5'],da:['#b39ddb','#24212a'],g:['#4c1d95','#6d28d9','#8b5cf6']},
sunset:{n:'Sunset',a:['#c2410c','#f9ece7','#fcf6f2','#f3e8e1'],da:['#ffa726','#2f2210'],g:['#9a3412','#c2410c','#ea580c']},
rose:{n:'Rose',a:['#c2185b','#f9e8ef','#fdf4f7','#f6e6ec'],da:['#f48fb1','#2d1f24'],g:['#9d174d','#db2777','#f472b6']}};
const rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
const mq=matchMedia('(prefers-color-scheme: dark)'),modeOf=()=>S.mode||(S.theme==='light'||S.theme==='dark'?S.theme:'system');
function applyTheme(){const md=modeOf(),dk=md==='dark'||(md==='system'&&mq.matches),t=TH[S.col]||TH.ocean,r=document.documentElement,sp=(k,v)=>r.style.setProperty(k,v);
  r.dataset.theme=dk?'dark':'light';
  sp('--acc',dk?t.da[0]:t.a[0]);sp('--soft',dk?t.da[1]:t.a[1]);sp('--on',dk?'#000':'#fff');sp('--bg',dk?'#000':t.a[2]);sp('--line',dk?'#232323':t.a[3]);
  sp('--g1',t.g[0]);sp('--g2',t.g[1]);sp('--g3',t.g[2]);sp('--hs',rgba(t.g[1],.35));
  let m=document.querySelector('meta[name=theme-color]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}m.content=dk?'#000000':t.a[2]}
const onMq=()=>{if(modeOf()==='system'){applyTheme();render()}};try{mq.addEventListener('change',onMq)}catch(e){try{mq.addListener(onMq)}catch(e2){}}
function setMode(k){S.mode=k;delete S.theme;save();applyTheme();render()}
function setCol(k){S.col=k;save();applyTheme();render()}
function pickDay(d){V.sel=d;V.r='d';render()}
function goToday(){V.sel=today();render()}
function stepP(n){if(V.r==='m'){shift(n);return}V.sel=addD(V.sel,V.r==='w'?7*n:n);render()}
function openScr(t){if(V.tab===t)return;V.st.push(V.tab);setTab(t)}
function goBack(){setTab(V.st.pop()||'ov')}
function goTab(t){V.st=[];setTab(t)}
function openSt(){openScr('st')}
// ===== Fingerprint unlock (talks to MainActivity.kt) =====
let BIO={k:'',busy:false},UL=0;
const bioOk=()=>!!(window.Android&&Android.canBiometric&&Android.canBiometric()),bioOn=()=>!!(S.pin&&S.bio&&bioOk());
function bioAsk(k){if(BIO.busy||!bioOk())return;BIO={k,busy:true};Android.authenticate()}
window.onBioResult=ok=>{const k=BIO.k;BIO={k:'',busy:false};
  if(k==='enable'){if(ok){S.bio=1;save();toast('Fingerprint unlock is on')}else toast('Fingerprint was not turned on');render();return}
  if(ok&&!$('#lock').hidden&&PN.mode==='unlock'){UL=Date.now();$('#lock').hidden=true;render()}};
function toggleBio(){if(S.bio){S.bio=0;save();render();return}if(!S.pin){toast('Set a PIN first');return}bioAsk('enable')}
// ===== Small helpers =====
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>S.cur+Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const cat=n=>S.cats.find(c=>c.name===n)||{name:n,color:'#8a8f98',budget:0};
const sum=a=>a.reduce((s,t)=>s+t.amt,0);
const inM=ym=>S.tx.filter(t=>t.date.startsWith(ym));
function shift(n){let[y,m]=V.ym.split('-').map(Number);m+=n;if(m<1){m=12;y--}if(m>12){m=1;y++}V.ym=y+'-'+pad(m);render()}
function setTab(t){V.tab=t;render();scrollTo(0,0)}
function byCat(list){const m={};list.forEach(t=>m[t.cat]=(m[t.cat]||0)+t.amt);return Object.entries(m).sort((a,b)=>b[1]-a[1])}
function fmtDay(d){return new Date(d+'T00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}
const ICN={'Food & groceries':'<path d="M6 6h15l-2 9H8zM6 6L5 3H2"/><circle cx="9" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/>','Transport':'<rect x="4" y="4" width="16" height="12" rx="3"/><path d="M4 11h16M7 20v-4M17 20v-4"/>','Bills & utilities':'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>','Airtime & data':'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>','Rent':'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>','Shopping':'<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>','Health':'<path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>','Entertainment':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>','Other':'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'},ico=n=>SV(ICN[n]||'<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>');
function txRow(t){const c=cat(t.cat);return `<button class="tx" onclick="openM('${t.id}')"><span class="dot" style="background:${c.color}24;color:${c.color}">${ico(t.cat)}</span><span class="n"><b>${esc(t.note||t.cat)}</b><span class="mut sm">${esc(t.cat)}${t.fee?' · incl. '+fmt(t.fee)+' fee':''}</span></span><b>${fmt(t.amt)}</b></button>`}
// ===== Profile, greeting and first-run welcome =====
const SV=(p,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC2={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',sync:'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',star:'<path d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z"/>',cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',cloud:'<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.5 12 3.5 3.5 0 0 0 6 19z"/>',pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',pie:'<path d="M21 12A9 9 0 1 1 12 3v9z"/>',half:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>',down:'<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',wallet:'<path d="M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l12-3v3"/><circle cx="16.5" cy="14" r="1"/>'};
const hr=()=>new Date().getHours(),greet=()=>{const h=hr();return h>=5&&h<12?'Good morning':h>=12&&h<17?'Good afternoon':h>=17&&h<22?'Good evening':'Good night'};
const nm=()=>(S.name||'').trim(),init=()=>(nm()[0]||'S').toUpperCase(),okEmail=e=>!e||/^\S+@\S+\.\S+$/.test(e);
function openPf(){PE=false;openScr('pf')}
function goSt(id){openScr('st');setTimeout(()=>{const e=document.getElementById(id);if(e)e.scrollIntoView({block:'start'})},30)}
let W={name:'',email:'',col:'ocean'},PE=false;
function welcome(){
  return `<div class="wl"><div class="lg"><span class="lgm">${SV(IC2.wallet,22)}</span><b>Spendwise</b></div>
  <h1>Let's get to know you</h1><p class="mut">Your name appears in your daily greeting. Everything stays on this phone.</p>
  <div class="bigav" id="wav" aria-hidden="true">${(W.name.trim()[0]||'A').toUpperCase()}</div>
  <label class="f" for="wn">Your name</label><input id="wn" class="i" autocomplete="given-name" placeholder="e.g. Amani" value="${esc(W.name)}" oninput="W.name=this.value;$('#wav').textContent=(this.value.trim()[0]||'A').toUpperCase()">
  <label class="f" for="we" style="margin-top:16px">Email <span class="mut" style="font-weight:400">(optional)</span></label><input id="we" class="i" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" value="${esc(W.email)}" oninput="W.email=this.value">
  <p class="sm mut" id="wer" style="margin:8px 0 0">Add it now or later to back up and sync online when that arrives.</p>
  <div class="f" style="margin-top:18px">Colour theme</div><div class="cols">${Object.keys(TH).map(k=>`<button class="${W.col===k?'on':''}" style="background:${TH[k].a[0]}" onclick="W.col='${k}';S.col='${k}';applyTheme();render()" aria-label="${TH[k].n}${W.col===k?', selected':''}"></button>`).join('')}</div>
  <div class="wf"><button class="btn" onclick="wlDone(0)">Continue</button><button class="lnk" onclick="wlDone(1)">Skip for now</button></div></div>`}
function wlDone(skip){
  if(!skip){const e=W.email.trim();if(!okEmail(e)){const p=$('#wer');p.textContent='That email does not look right. Fix it or leave it empty.';p.classList.add('bad');$('#we').focus();return}S.name=W.name.trim();S.email=e}
  S.col=W.col;S.onb=1;save();V.tab='ov';render();scrollTo(0,0)}
function savePf(){const e=$('#pe').value.trim();if(!okEmail(e)){$('#per').textContent='That email does not look right.';return}S.name=$('#pn').value.trim();S.email=e;PE=false;save();render();toast('Profile saved')}
function profile(){
  const days=new Set(S.tx.map(t=>t.date)).size;let wot='–';
  if(S.lim.w>0){const w={};S.tx.forEach(t=>{const k=wkStart(t.date);w[k]=(w[k]||0)+t.amt});wot=Object.values(w).filter(v=>v<=S.lim.w).length}
  const mo={system:'System',light:'Light',dark:'Dark'}[modeOf()],th=(TH[S.col]||TH.ocean).n,ls=(n=>n?n+' of 3 on':'Off')(['d','w','m'].filter(k=>S.lim[k]>0).length);
  const row=(ic,l,v,fn)=>`<button class="pr" onclick="${fn}"><u>${SV(IC2[ic],18)}</u><b>${l}</b><span>${v}</span><span aria-hidden="true">›</span></button>`;
  return `<div class="card pc"><div class="avw"><div class="bigav" aria-hidden="true">${init()}</div><button class="eb" onclick="PE=!PE;render()" aria-label="Edit profile">${SV(IC2.pen,14)}</button></div>
  ${PE?`<div style="text-align:left;margin-top:14px"><label class="f" for="pn">Your name</label><input id="pn" class="i" value="${esc(S.name||'')}" placeholder="Your name"><label class="f" for="pe" style="margin-top:12px">Email (optional)</label><input id="pe" class="i" type="email" value="${esc(S.email||'')}" placeholder="you@email.com"><p class="sm bad" id="per" style="min-height:18px;margin:6px 0 0"></p><div style="display:flex;gap:8px"><button class="btn" style="flex:1" onclick="savePf()">Save</button><button class="btn ghost" style="flex:1" onclick="PE=false;render()">Cancel</button></div></div>`:`<div class="pn">${nm()?esc(nm()):'Add your name'}</div><div class="mut sm">${S.email?esc(S.email):'No email added yet'}</div>`}
  <div class="stt"><div><b>${days}</b><span>Days tracked</span></div><div><b>${S.tx.length}</b><span>Expenses</span></div><div><b>${wot}</b><span>Weeks on track</span></div></div></div>
  <div class="syc"><span class="sc">${SV(IC2.cloud,22)}</span><div><b>Saved on this phone</b><span class="sm">Add an email to back up and sync online.</span></div><em>Soon</em></div>
  <div class="card" style="padding:4px 16px">${row('half','Appearance',th+' · '+mo,"goSt('s-app')")}${row('lock','Security',S.pin?(S.bio?'PIN and fingerprint':'PIN on'):'Off',"goSt('s-sec')")}${row('pie','Spending limits',ls,'openLm()')}${row('down','Data and backup','Export, restore',"goSt('s-data')")}</div>
  <p class="sm mut" style="text-align:center;margin:18px 0 0">Spendwise · Your data stays on this phone</p>`}
// ===== Home screen: week strip, limit card, charts =====
const kf=v=>v>=1e4?Math.round(v/1e3)+'k':v>=1e3?(v/1e3).toFixed(1).replace('.0','')+'k':String(Math.round(v));
const inR=(a,b)=>S.tx.filter(t=>t.date>=a&&t.date<=b);
function span(){const s=V.sel;
  if(V.r==='d')return[s,s,addD(s,-1),addD(s,-1)];
  if(V.r==='w'){const a=wkStart(s);return[a,addD(a,6),addD(a,-7),addD(a,-1)]}
  const[y,m]=V.ym.split('-').map(Number),dim=new Date(y,m,0).getDate(),py=m===1?y-1:y,pm=m===1?12:m-1;
  return[V.ym+'-01',V.ym+'-'+pad(dim),py+'-'+pad(pm)+'-01',py+'-'+pad(pm)+'-'+pad(new Date(py,pm,0).getDate())]}
function strip(){const ws=wkStart(V.sel),t0=today(),has=new Set(S.tx.map(t=>t.date));
  return `<div class="wk"><button class="wa" onclick="stepP(-1)" aria-label="Previous">‹</button>${DN.map((n,i)=>{const d=addD(ws,i),sel=V.r==='d'&&d===V.sel;return `<button class="dy${d===t0?' td':''}${sel?' sel':''}${V.r==='w'?' inw':''}${has.has(d)?' has':''}" onclick="pickDay('${d}')" aria-label="${fmtDay(d)}"${sel?' aria-current="date"':''}><small>${n}</small><b>${+d.slice(8)}</b><i></i></button>`}).join('')}<button class="wa" onclick="stepP(1)" aria-label="Next">›</button></div>`}
function heroHTML(r,tot,a,b){
  const L=S.lim[r]||0,t0=today(),inNow=t0>=a&&t0<=b,pct=L?tot/L*100:0,ovr=L>0&&tot>L,wrn=L>0&&!ovr&&pct>=80,dn={d:'daily',w:'weekly',m:'monthly'}[r];
  const fs=x=>pd(x).toLocaleDateString(undefined,{day:'numeric',month:'short'});
  const lab=r==='d'?(inNow?'today':'on '+fmtDay(a)):r==='w'?(inNow?'this week':'in the week of '+fs(a)):(inNow?'this month':'in '+pd(a).toLocaleDateString(undefined,{month:'long',year:'numeric'}));
  const days=inNow?Math.round((pd(b)-pd(t0))/864e5)+1:0;let foot;
  if(!L)foot='Set a '+dn+' limit to get warnings';
  else if(r==='d')foot='Daily limit '+fmt(L)+' · resets at midnight';
  else if(ovr||wrn||days<1)foot=(r==='w'?'Weekly':'Monthly')+' limit '+fmt(L)+' · resets '+(r==='w'?'on Monday':'on the 1st');
  else foot='About '+fmt((L-tot)/days)+' a day to stay on track';
  return `<div class="hero${ovr?' over':wrn?' warn':''}"><div class="hl">Spent ${lab}${L?`<span class="chip2">${ovr?'Over limit':wrn?'Slow down':'On track'} · ${Math.round(pct)}%</span>`:''}</div><div class="hb">${fmt(tot)}</div>
  <div class="hs">${L?(ovr?fmt(tot-L)+' over your '+dn+' limit of '+fmt(L):fmt(L-tot)+' left of '+fmt(L)):'No '+dn+' limit set'}</div>
  ${L?`<div class="hp"><div style="width:${Math.min(100,pct)}%;background:${ovr?'#fecdd3':wrn?'#fde68a':'#4ade80'}"></div></div>`:'<div style="height:16px"></div>'}
  <div class="hf"><span>${foot}</span>${L?'':`<button class="hlk" onclick="openLm()">Set limit →</button>`}</div></div>`}
function goNow(r){V.sel=today();V.r=r;render()}
const tv=v=>{const s=fmt(v);return s.length>10?S.cur+Number(v).toLocaleString(undefined,{notation:'compact',maximumFractionDigits:1}):s};
function nowTiles(){const t0=today(),ws=wkStart(t0),mo=t0.slice(0,7);
  return `<div class="nt" role="group" aria-label="Choose a view">${[['d','Today',sum(inR(t0,t0))],['w','This week',sum(inR(ws,addD(ws,6)))],['m','This month',sum(inM(mo))]].map(([r,l,v])=>`<button class="${V.r===r?'on':''}" onclick="goNow('${r}')" aria-pressed="${V.r===r}"><span class="mut sm">${l}</span><b>${tv(v)}</b></button>`).join('')}</div>`}
function gline(){const r=V.r,L=S.lim[r],dn={d:'daily',w:'weekly',m:'monthly'}[r],[a,b]=span(),tot=sum(inR(a,b));
  if(!(L>0))return 'Set a '+dn+' limit to get warnings.';
  return tot>L?`You are <b class="bad">${fmt(tot-L)}</b> over your ${dn} limit.`:`You are <b>${fmt(L-tot)}</b> under your ${dn} limit.${tot/L>=.8?' Almost at your limit.':' Nice pace.'}`}
function overview(){
  const[a,b,pa,pb]=span(),L=inR(a,b),tot=sum(L),ptot=sum(inR(pa,pb)),t0=today(),r=V.r;
  const n=Math.round((pd(b)-pd(a))/864e5)+1,inNow=t0>=a&&t0<=b,el=inNow?Math.round((pd(t0)-pd(a))/864e5)+1:n;
  const fs=x=>pd(x).toLocaleDateString(undefined,{day:'numeric',month:'short'}),mon=pd(V.sel).toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const when=r==='d'?fmtDay(a):r==='w'?fs(a)+' to '+fs(b):pd(a).toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const pl=r==='d'?(a===t0?'yesterday':'the day before'):r==='w'?(inNow?'last week':'the week before'):(inNow?'last month':'the month before'),per=r==='d'?'on this day':r==='w'?'this week':'this month';
  const top=`<div class="gl">${gline()}</div>${V.sel!==t0?`<div class="ml"><b>${mon}</b><button class="pill" onclick="goToday()">Today</button></div>`:''}${strip()}${nowTiles()}`;
  const qa=`<div class="qa"><button class="btn" onclick="openM()">+ Add expense</button><button class="btn ghost2" onclick="openImport()">Import SMS</button></div>`;
  if(!S.tx.length)return top+`<div class="card empty"><h2>No expenses yet</h2><p class="mut">Spendwise reads your payment messages and sorts them for you.</p><button class="btn" onclick="openM()">Add your first expense</button> <button class="btn ghost" onclick="sample()">Load sample data</button></div>`;
  if(!L.length)return top+heroHTML(r,0,a,b)+qa+`<div class="card empty"><h2>No expenses recorded</h2><p class="mut">${esc(when)}</p></div>`;
  const p=ptot>0?Math.round((tot-ptot)/ptot*100):null;
  const cmp=p===null?`No spending recorded ${pl}`:p>0?`You spent <b class="bad">${p}% more</b> than ${pl}`:p<0?`You spent <b class="ok">${-p}% less</b> than ${pl}`:`You spent the same as ${pl}`;
  const bc=byCat(L),big=[...L].sort((x,y)=>y.amt-x.amt)[0],topc=esc(bc[0][0].split(' ')[0]);
  const cells=r==='d'?[['Transactions',L.length],['Biggest',fmt(big.amt)],['Top category',topc]]:[['Daily average',fmt(tot/el)],['Transactions',L.length],['Top category',topc]];
  let chart;
  if(r==='m'){
    const days=Array(n).fill(0);L.forEach(t=>days[+t.date.slice(8)-1]+=t.amt);const mx=Math.max(...days)||1;
    const bars=days.map((v,i)=>{const h=Math.max(v?3:1,v/mx*72);return `<rect x="${i*10+1}" y="${78-h}" width="7" height="${h}" rx="2" fill="${v?'var(--acc)':'var(--line)'}" opacity="${i+1>el&&inNow?.35:1}"><title>${i+1}: ${fmt(v)}</title></rect>`}).join('');
    chart=`<svg class="bars" viewBox="0 0 ${n*10} 80" preserveAspectRatio="none" role="img" aria-label="Daily spending bars">${bars}</svg>`}
  else{
    const ws=wkStart(V.sel),wd=DN.map((_,i)=>{const d=addD(ws,i);return[d,sum(S.tx.filter(t=>t.date===d))]}),wm=Math.max(...wd.map(x=>x[1]))||1;
    const wb=wd.map(([d,v],i)=>{const h=v?Math.max(4,v/wm*66):2,on=d===V.sel&&r==='d',lit=r==='w'||on;
      return `<g><rect x="${i*40+8}" y="${94-h}" width="24" height="${h}" rx="6" fill="${v?'var(--acc)':'var(--line)'}" opacity="${v&&!lit?.5:1}"><title>${fmtDay(d)}: ${fmt(v)}</title></rect>${v?`<text x="${i*40+20}" y="${90-h}" text-anchor="middle" font-size="10" style="fill:var(--mut)">${kf(v)}</text>`:''}<text x="${i*40+20}" y="110" text-anchor="middle" font-size="11" font-weight="${on?700:500}" style="fill:${on?'var(--ink)':'var(--mut)'}">${DN[i]}</text></g>`}).join('');
    chart=`<svg viewBox="0 0 280 118" style="width:100%;height:auto;display:block;margin-top:12px" role="img" aria-label="Spending for each day of the week">${wb}</svg>`}
  let off=0;const segs=bc.map(([nm2,v])=>{const q=v/tot*100,sg=`<circle cx="21" cy="21" r="15.9155" fill="none" stroke="${cat(nm2).color}" stroke-width="7" stroke-dasharray="${q} ${100-q}" stroke-dashoffset="${25-off}"/>`;off+=q;return sg}).join('');
  const leg=bc.map(([nm2,v])=>`<div class="lr"><i style="background:${cat(nm2).color}"></i><span class="n">${esc(nm2)}</span><span class="a">${fmt(v)}</span></div>`).join('');
  const sorted=[...L].sort((x,y)=>y.date.localeCompare(x.date)||y.id.localeCompare(x.id));
  return top+heroHTML(r,tot,a,b)+qa+`<div class="rh"><b>Recent</b><button class="lnk" onclick="goTab('tx')">See all</button></div><div class="card" style="padding:4px 16px">${sorted.slice(0,3).map(txRow).join('')}</div>
  <div class="card"><h2>${esc(when)}</h2><div class="cmp">${cmp}</div><div class="stats">${cells.map(([l,v])=>`<div><span class="mut sm">${l}</span><b>${v}</b></div>`).join('')}</div></div>
  <div class="card"><h2>Spending by Day</h2>${chart}</div>
  <div class="card"><h2>Spending by Category</h2><div class="donut"><svg viewBox="0 0 42 42" role="img" aria-label="Spending by category"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--soft)" stroke-width="7"/>${segs}<text x="21" y="20.4" text-anchor="middle" font-size="3" style="fill:var(--mut)">Total</text><text x="21" y="25" text-anchor="middle" font-size="4.2" font-weight="700" style="fill:var(--ink)">${S.cur}${tot.toLocaleString(undefined,{notation:'compact',maximumFractionDigits:1})}</text></svg><div class="leg">${leg}</div></div></div>
  ${insights(L,bc,tot,r)}${who(L,per)}`}
// ===== Spending limits (daily, weekly, monthly) =====
const LN={d:'Daily',w:'Weekly',m:'Monthly'};let LD=null;
function migrate(){if(!S.lim){S.lim={d:0,w:0,m:0};const o=+S.limit||0;if(o)S.lim[S.period==='week'?'w':'m']=o}['d','w','m'].forEach(k=>S.lim[k]=+S.lim[k]||0);S.limMem=S.limMem||{}}
function warnTxt(){const t0=today(),ws=wkStart(t0);let best=null;
  [['d','daily',sum(inR(t0,t0))],['w','weekly',sum(inR(ws,addD(ws,6)))],['m','monthly',sum(inM(t0.slice(0,7)))]].forEach(([k,n,v])=>{const L=S.lim[k];if(!(L>0))return;const p=v/L*100;if(p>=80&&(!best||p>best.p))best={p,n,over:v>L}});
  return best?(best.over?' · Over your '+best.n+' limit':' · '+Math.round(best.p)+'% of your '+best.n+' limit used'):''}
function ldInit(){LD={};['d','w','m'].forEach(k=>{LD[k]={on:S.lim[k]>0,v:S.lim[k]||S.limMem[k]||''}})}
function openLm(){ldInit();openScr('lm')}
const lhint=(k,v)=>!(v>0)?'':k==='d'?fmt(v*7)+' a week if you use it every day':k==='w'?'About '+fmt(v/7)+' a day':'About '+fmt(v/30)+' a day';
function limits(){if(!LD)ldInit();
  return `<p class="mut" style="margin:2px 2px 0">Each view has its own limit. Switch any of them off if you don't need it.</p>${['d','w','m'].map(k=>`<div class="k"><div class="kr"><b>${LN[k]} limit</b><button class="tg${LD[k].on?' on':''}" role="switch" aria-checked="${LD[k].on?'true':'false'}" aria-label="${LN[k]} limit" onclick="ldTog('${k}')"></button></div>${LD[k].on?`<div class="amt"><span>${esc(S.cur)}</span><input id="ld-${k}" type="number" min="0" inputmode="decimal" placeholder="0" value="${LD[k].v||''}" aria-label="${LN[k]} limit amount" oninput="ldIn('${k}',this.value)"></div><p class="sm mut" id="lh-${k}" style="margin:6px 0 0">${lhint(k,+LD[k].v)}</p>`:'<p class="sm mut" style="margin:6px 0 0">Off</p>'}</div>`).join('')}
  <div class="tip">You get a warning at 80% of a limit and again when you go over it.</div><button class="btn lgb" onclick="saveLim()">Save limits</button>`}
function ldTog(k){LD[k].on=!LD[k].on;if(LD[k].on&&!(+LD[k].v>0))LD[k].v=S.limMem[k]||{d:1000,w:7000,m:30000}[k];render();if(LD[k].on)setTimeout(()=>{const e=$('#ld-'+k);if(e)e.focus()},30)}
function ldIn(k,v){LD[k].v=v;const h=$('#lh-'+k);if(h)h.textContent=lhint(k,+v)}
function saveLim(){
  for(const k of ['d','w','m'])if(LD[k].on&&!(+LD[k].v>0)){toast('Enter an amount for the '+LN[k].toLowerCase()+' limit, or switch it off');const e=$('#ld-'+k);if(e)e.focus();return}
  ['d','w','m'].forEach(k=>{const v=+LD[k].v||0;S.lim[k]=LD[k].on?v:0;if(v>0)S.limMem[k]=v});save();LD=null;toast('Limits saved');goBack()}
// ===== PIN lock =====
let LB=Date.now(),PN={mode:'',v:'',first:''};
function lockUI(mode){PN={mode,v:'',first:''};$('#lock').hidden=false;pinDraw();if(mode==='unlock'&&bioOn())setTimeout(()=>bioAsk('unlock'),250)}
function lockNow(){if(S.pin&&($('#lock').hidden||PN.mode!=='unlock'))lockUI('unlock')}
function pinDraw(){const m=PN.mode,T={unlock:'Enter your PIN',set1:'Choose a 4-digit PIN',set2:'Confirm your PIN',off:'Enter your PIN to turn off the lock',chg:'Enter your current PIN'}[m];
  $('#lock').innerHTML=`<div style="font-size:44px">🔒</div><h2 style="margin:0">${T}</h2><div class="dots">${[0,1,2,3].map(i=>`<i class="${i<PN.v.length?'f':''}"></i>`).join('')}</div><p class="sm bad" id="pe" style="min-height:18px;margin:0"></p><div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="pinKey('${n}')">${n}</button>`).join('')}<button style="font-size:14px;box-shadow:none;background:none" onclick="${m==='unlock'?'':'pinCancel()'}">${m==='unlock'?'':'Cancel'}</button><button onclick="pinKey('0')">0</button><button onclick="pinKey('<')">⌫</button></div>${m==='unlock'&&bioOn()?'<button class="lnk" onclick="bioAsk(\'unlock\')">Use fingerprint</button>':''}${m==='unlock'?'<button class="lnk" onclick="pinForgot()">Forgot PIN?</button>':''}`}
function pinCancel(){$('#lock').hidden=true}
function pinForgot(){if(confirm('The only way in is to erase the data stored in Spendwise on this phone. Your M-Pesa messages will be imported again on the next sync. Continue?')){S.tx=[];S.pin='';S.bio=0;S.last=0;S.map={};save();$('#lock').hidden=true;render();syncSms(false)}}
function pinKey(k){if(k==='<')PN.v=PN.v.slice(0,-1);else if(PN.v.length<4)PN.v+=k;pinDraw();if(PN.v.length<4)return;
  const h=hs('sw'+PN.v),m=PN.mode;
  setTimeout(()=>{
    if(m==='unlock'||m==='off'||m==='chg'){if(h===S.pin){if(m==='chg'){PN.mode='set1';PN.v='';pinDraw();return}if(m==='off'){S.pin='';S.bio=0;save()}UL=Date.now();$('#lock').hidden=true;render()}else{PN.v='';pinDraw();$('#pe').textContent='Wrong PIN, try again'}}
    else if(m==='set1'){PN.first=h;PN.mode='set2';PN.v='';pinDraw()}
    else if(h===PN.first){S.pin=h;save();$('#lock').hidden=true;render();toast('PIN lock is on')}
    else{PN.mode='set1';PN.v='';pinDraw();$('#pe').textContent='PINs did not match, start again'}},120)}
// ===== Backup, restore and updates =====
function backup(){$('#out').innerHTML='<textarea id="ta" readonly></textarea><p class="sm mut">Backup copied. Paste it somewhere safe, like a note to yourself.</p>';const ta=$('#ta');ta.value=JSON.stringify(S);ta.select();try{document.execCommand('copy')}catch(e){}}
function restore(){$('#out').innerHTML='<textarea id="ta" placeholder="Paste your backup here"></textarea><button class="btn" style="margin-top:8px" onclick="doRestore()">Restore</button>'}
function doRestore(){try{const o=JSON.parse($('#ta').value);if(!o.tx||!o.cats)throw 0;if(!confirm('Replace everything in Spendwise with this backup?'))return;S=o;S.map=S.map||{};migrate();S.onb=1;save();applyTheme();render();toast('Backup restored')}catch(e){toast('That does not look like a Spendwise backup')}}
function upd(){if(window.Android)Android.openUrl('https://github.com/SaintLT/Spendwise/releases/latest')}
// ===== Insights and top recipients =====
function who(L,per){const m={};L.forEach(t=>{const k=t.note||t.cat,o=m[k]=m[k]||{v:0,n:0,c:t.cat};o.v+=t.amt;o.n++});
  const a=Object.entries(m).sort((x,y)=>y[1].v-x[1].v).slice(0,5);if(!a.length)return'';
  return `<div class="card"><h2>Top recipients</h2><p class="mut sm" style="margin:0 0 6px">Who you paid ${per}</p>${a.map(([k,o])=>`<div class="ins"><span class="dot">${ico(o.c)}</span><span class="n"><b>${esc(k)}</b><span class="mut sm">${o.n} payment${o.n>1?'s':''}</span></span><b>${fmt(o.v)}</b></div>`).join('')}</div>`}
function insights(L,bc,tot,r){
  const big=[...L].sort((a,b)=>b.amt-a.amt)[0],of=r==='d'?'the day':r==='w'?'the week':'the month',m={};
  L.forEach(t=>{const k=t.note||t.cat;m[k]=m[k]||{v:0,n:0};m[k].v+=t.amt;m[k].n++});const tp=Object.entries(m).sort((x,y)=>y[1].v-x[1].v)[0];
  const it=[[SV(IC2.user),'Most money went to '+esc(tp[0]),fmt(tp[1].v)+' · '+tp[1].n+' payment'+(tp[1].n>1?'s':'')],[ico(bc[0][0]),esc(bc[0][0])+' leads your spending',Math.round(bc[0][1]/tot*100)+'% of '+of],[SV(IC2.star),'Biggest expense',esc(big.note||big.cat)+' · '+fmt(big.amt)]];
  if(r!=='d'){const wd=[0,0,0,0,0,0,0];L.forEach(t=>wd[new Date(t.date+'T00:00').getDay()]+=t.amt);
    const d=wd.indexOf(Math.max(...wd)),DP=['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'];it.push([SV(IC2.cal),'You spend most on '+DP[d],fmt(wd[d])+(r==='m'?' so far':' this week')])}
  return `<div class="card"><h2>Insights</h2>${it.map(([i,a,b])=>`<div class="ins"><span class="dot">${i}</span><span class="n"><b>${a}</b><span class="mut sm">${b}</span></span></div>`).join('')}</div>`}
// ===== Transactions, budgets, settings and screen rendering =====
function list(){
  let L=V.q?[...S.tx]:inM(V.ym);if(V.f)L=L.filter(t=>t.cat===V.f);if(V.q){const q=V.q.toLowerCase();L=L.filter(t=>(t.note+' '+t.cat+' '+(t.method||'')+' '+t.amt+' '+t.date).toLowerCase().includes(q))}
  L.sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  const g={};L.forEach(t=>(g[t.date]=g[t.date]||[]).push(t));
  const body=Object.keys(g).map(d=>`<div class="dh"><span>${fmtDay(d)}</span><span>${fmt(sum(g[d]))}</span></div><div class="card" style="padding:4px 16px;margin:0">${g[d].map(txRow).join('')}</div>`).join('');
  return `<div class="tools"><input id="q" type="search" placeholder="Search note, category, amount or date" value="${esc(V.q)}" oninput="V.q=this.value;fl()"><select onchange="V.f=this.value;fl()" aria-label="Filter by category"><option value="">All</option>${S.cats.map(c=>`<option${V.f===c.name?' selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="sm mut" id="cnt">${V.q?L.length+' result'+(L.length===1?'':'s')+' across all months':''}</div><div id="tl">${body||`<div class="card empty mut">${V.q||V.f?'Nothing matches.':'No transactions this month.'}</div>`}</div>`}
function fl(){const q=V.q;render();const e=$('#q');if(e){e.focus();e.setSelectionRange(q.length,q.length)}}
function manage(){
  const sp=Object.fromEntries(byCat(inM(V.ym)));
  const rows=S.cats.map((c,i)=>{const v=sp[c.name]||0,b=+c.budget,p=b?Math.min(100,v/b*100):0;return `<div class="br"><div class="top"><i class="dot" style="background:${c.color};width:12px;height:12px;border-radius:4px"></i><b>${esc(c.name)}</b><input type="number" min="0" inputmode="decimal" placeholder="No limit" value="${b||''}" onchange="setB(${i},this.value)" aria-label="Monthly budget for ${esc(c.name)}"><button class="x" onclick="delCat(${i})" aria-label="Remove ${esc(c.name)}">×</button></div>${b?`<div class="prog"><div style="width:${p}%;background:${v>b?'var(--bad)':c.color}"></div></div><div class="sm ${v>b?'bad':'mut'}" style="margin-top:4px">${fmt(v)} of ${fmt(b)} this month</div>`:''}</div>`}).join('');
  return `<div class="card"><h2>Spending limits</h2><p class="mut sm" style="margin:0 0 6px">One limit for each view on Home.</p>${['d','w','m'].map(k=>`<div class="sr"><span><b>${LN[k]}</b></span><b>${S.lim[k]>0?fmt(S.lim[k]):'Off'}</b></div>`).join('')}<button class="btn" style="width:100%;margin-top:10px" onclick="openLm()">Edit limits</button></div>
  <div class="card"><h2>Category budgets (optional)</h2><p class="mut sm" style="margin-top:-6px">Set a limit per category. Leave empty for no limit.</p>${rows}<div class="tools" style="margin:12px 0 0"><input id="nc" placeholder="New category name"><button class="btn" onclick="addCat()">Add</button></div></div>`}
function settings(){
  const dk=document.documentElement.dataset.theme==='dark',A=window.Android,bio=bioOk(),md=modeOf(),la=S.lockAfter==null?30:S.lockAfter;
  return `<div class="card" style="padding:4px 16px"><button class="pr" onclick="openPf()"><u>${SV(IC2.user,18)}</u><b>Profile</b><span>${nm()?esc(nm()):'Add your name'}</span><span aria-hidden="true">›</span></button><button class="pr" onclick="openLm()"><u>${SV(IC2.pie,18)}</u><b>Spending limits</b><span>${(n=>n?n+' of 3 on':'Off')(['d','w','m'].filter(k=>S.lim[k]>0).length)}</span><span aria-hidden="true">›</span></button></div>
  <div class="card" id="s-app"><h2>Appearance</h2><div class="seg" role="group" aria-label="Mode" style="margin-top:10px">${[['system','System'],['light','Light'],['dark','Dark']].map(([k,l])=>`<button class="${md===k?'on':''}" onclick="setMode('${k}')">${l}</button>`).join('')}</div>
  <p class="mut sm" style="margin:8px 0 0">Dark mode is pure black. System follows your phone.</p>
  <div class="mut sm" style="margin-top:14px">Colour theme</div><div class="sw">${Object.entries(TH).map(([k,t])=>`<button class="${(TH[S.col]?S.col:'ocean')===k?'on':''}" onclick="setCol('${k}')" aria-label="${t.n} theme"><i style="background:${dk?t.da[0]:t.a[0]}"></i>${t.n}</button>`).join('')}</div></div>
  <div class="card" id="s-sec"><h2>Security</h2>
  <div class="sr"><span><b>PIN lock</b><span class="mut sm">${S.pin?'On. Asked when you open the app':'Off'}</span></span><button class="btn ghost" onclick="lockUI('${S.pin?'off':'set1'}')">${S.pin?'Turn off':'Set PIN'}</button></div>
  ${S.pin?`<div class="sr"><span><b>Change PIN</b></span><button class="btn ghost" onclick="lockUI('chg')">Change</button></div>`:''}
  ${A?`<div class="sr"><span><b>Unlock with fingerprint</b><span class="mut sm">${bio?(S.pin?'Your PIN stays as a backup':'Set a PIN first'):'Not available on this phone'}</span></span>${bio&&S.pin?`<button class="tg${S.bio?' on':''}" role="switch" aria-checked="${S.bio?'true':'false'}" onclick="toggleBio()" aria-label="Unlock with fingerprint"></button>`:''}</div>`:''}
  ${A&&S.pin?`<div class="sr"><span><b>Lock after</b><span class="mut sm">Time away before the lock returns</span></span><select style="width:132px" aria-label="Lock after" onchange="S.lockAfter=+this.value;save()">${[[0,'Straight away'],[30,'30 seconds'],[60,'1 minute'],[300,'5 minutes']].map(([v,l])=>`<option value="${v}"${la===v?' selected':''}>${l}</option>`).join('')}</select></div>`:''}</div>
  <div class="card"><h2>Messages and currency</h2><label class="fld">Read messages from (sender names, comma separated)<input value="${esc(S.senders||'MPESA')}" onchange="S.senders=this.value.trim()||'MPESA';S.last=0;save()"></label>
  <label class="fld">Currency symbol<select onchange="S.cur=this.value;S.curSet=1;save();render()">${CUR.map(c=>`<option${S.cur===c?' selected':''}>${c}</option>`).join('')}</select></label></div>
  <div class="card" id="s-data"><h2>Your data</h2><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn ghost" onclick="csv()">Export as CSV</button><button class="btn ghost" onclick="backup()">Copy backup</button><button class="btn ghost" onclick="restore()">Restore backup</button>${A?'<button class="btn ghost" onclick="upd()">Check for updates</button>':''}<button class="btn ghost bad" onclick="wipe()">Erase all data</button></div><div id="out"></div>
  <p class="mut sm">Your data stays in this browser on this device. Export a CSV to keep a backup.</p></div>`}
function render(){
  const [y,m]=V.ym.split('-'),t=V.tab,sub=t==='st'||t==='lm'||t==='pf',home=t==='ov',g=hr();
  $('#mt').textContent=new Date(y,m-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});
  document.body.dataset.scr=t;
  $('#mnav').style.display=t==='tx'?'flex':'none';
  $('#bk').style.display=sub?'grid':'none';
  $('#av').style.display=home?'grid':'none';$('#gr').style.display=home?'block':'none';
  $('#ttl').style.display=home?'none':'block';$('#ttl').textContent={tx:'Transactions',mg:'Budgets',st:'Settings',lm:'Spending limits',pf:'Profile'}[t]||'';
  $('#acts').style.display=sub?'none':'flex';$('#plus').style.display=home?'none':'';
  $('#av').textContent=init();$('#g1').innerHTML=SV(g>=5&&g<18?IC2.sun:IC2.moon,15)+greet();$('#g2').textContent=nm()||'Welcome';
  const IC={ov:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',tx:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',mg:'<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>'};
  $('#tabs').innerHTML=[['ov','Home'],['tx','Transactions'],['mg','Budgets']].map(([k,l])=>`<button class="${t===k?'on':''}" onclick="goTab('${k}')"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>${l}</button>`).join('');
  const scr={ov:overview,tx:list,mg:manage,st:settings,lm:limits,pf:profile,wl:welcome}[t]||overview;
  $('#main').innerHTML=(window.Android&&t!=='wl'&&!Android.hasPermission()?'<button class="card" style="width:100%;text-align:left;border:0;color:var(--bad);font-weight:600" onclick="permHelp()">⚠ Not reading your M-Pesa messages yet. Tap to fix</button>':'')+scr();
}
// ===== Add / edit expense sheet and data actions =====
function openM(id){
  const t=id?S.tx.find(x=>x.id===id):null;M={id:id||null,cat:t?t.cat:S.cats[0].name};
  $('#sheet').innerHTML=`<div class="box" role="dialog" aria-modal="true"><div class="row"><h2 style="margin:0">${t?'Edit expense':'Add expense'}</h2><button class="x" onclick="closeM()" aria-label="Close">×</button></div>
  <label>Amount<input id="fa" inputmode="decimal" placeholder="0" value="${t?t.amt:''}"></label><div class="chips" id="chips"></div>
  <label>Note<input id="fn" placeholder="What was it for?" value="${t?esc(t.note):''}"></label>
  <div class="two"><label>Date<input id="fd" type="date" value="${t?t.date:today()}"></label><label>Paid with<select id="fm">${PM.map(p=>`<option${t&&t.method===p?' selected':''}>${p}</option>`).join('')}</select></label></div>
  <div class="row"><button class="btn" onclick="saveTx()">Save expense</button>${t?'<button class="btn ghost bad" onclick="delTx()">Delete</button>':''}</div></div>`;
  chips();$('#sheet').hidden=false;setTimeout(()=>$('#fa').focus(),40)}
function chips(){$('#chips').innerHTML=S.cats.map((c,i)=>`<button class="chip${c.name===M.cat?' on':''}" onclick="M.cat=S.cats[${i}].name;chips()"><i style="background:${c.color}"></i>${esc(c.name)}</button>`).join('')}
function closeM(){$('#sheet').hidden=true}
function saveTx(){
  const a=parseFloat($('#fa').value.replace(/,/g,''));if(!(a>0)){$('#fa').classList.add('err');$('#fa').focus();return}
  const d=$('#fd').value||today(),r={amt:a,cat:M.cat,note:$('#fn').value.trim(),date:d,method:$('#fm').value};
  if(M.id){const o=S.tx.find(x=>x.id===M.id);Object.assign(o,r);if(o.key)S.map[o.key]=r.cat}else S.tx.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),...r});
  V.sel=d;save();closeM();render()}
function delTx(){if(confirm('Delete this expense?')){S.tx=S.tx.filter(x=>x.id!==M.id);save();closeM();render()}}
function setB(i,v){S.cats[i].budget=Math.max(0,parseFloat(v)||0);save();render()}
function addCat(){const n=$('#nc').value.trim();if(!n||S.cats.some(c=>c.name.toLowerCase()===n.toLowerCase()))return;S.cats.push({name:n,color:PAL[S.cats.length%PAL.length],budget:0});save();render()}
function delCat(i){if(S.cats.length<2)return;if(confirm('Remove this category? Existing expenses keep their label.')){S.cats.splice(i,1);save();render()}}
function csv(){const q=v=>'"'+String(v).replace(/"/g,'""')+'"',t=['Date,Category,Amount,Paid with,Note',...[...S.tx].sort((a,b)=>a.date.localeCompare(b.date)).map(x=>[x.date,q(x.cat),x.amt,q(x.method||''),q(x.note)].join(','))].join('\n');
  $('#out').innerHTML='<textarea id="ta" readonly></textarea><p class="sm mut">Copy this into a spreadsheet or a text file.</p>';const ta=$('#ta');ta.value=t;ta.select();try{document.execCommand('copy')}catch(e){}}
function wipe(){if(confirm('Erase all expenses and settings? This cannot be undone.')){S.tx=[];S.cats=DEF.map((n,i)=>({name:n,color:PAL[i%PAL.length],budget:0}));save();render()}}
function sample(){
  const R={'Food & groceries':[['Groceries',900,3200],['Lunch',250,600],['Coffee',120,300]],'Transport':[['Fuel',1500,3000],['Ride home',200,700]],'Bills & utilities':[['Electricity',1200,2500]],'Airtime & data':[['Data bundle',250,1000]],'Shopping':[['Clothes',1200,4000]],'Health':[['Pharmacy',300,1500]],'Entertainment':[['Movie night',500,1200]],'Rent':[['Rent',18000,18000]],'Other':[['Gift',500,2000]]};
  const names=Object.keys(R),maxD=+today().slice(8),ym=today().slice(0,7);
  for(let i=0;i<34;i++){const c=names[Math.floor(Math.random()*names.length)],r=R[c][Math.floor(Math.random()*R[c].length)];
    S.tx.push({id:'s'+i+Math.random().toString(36).slice(2,5),amt:Math.round((r[1]+Math.random()*(r[2]-r[1]))/10)*10,cat:c,note:r[0],date:ym+'-'+pad(1+Math.floor(Math.random()*maxD)),method:PM[Math.floor(Math.random()*3)]})}
  [['Food & groceries',15000],['Transport',8000],['Entertainment',3000]].forEach(([n,b])=>{const c=S.cats.find(x=>x.name===n);if(c)c.budget=b});
  save();V.sel=today();render()}
S.map=S.map||{};if(!S.curSet&&S.cur==='$')S.cur='KSh';if(!S.v2){S.cats.forEach((c,i)=>c.color=PAL[i%PAL.length]);S.v2=1}
migrate();
// ===== Reading and importing M-Pesa messages =====
let I={rows:[],skip:0};
const RULES=[['Airtime & data',/airtime|data bundle|bundle|top.?up|bingwa/i],['Transport',/uber|bolt|little ?cab|taxi|fuel|petrol|shell|rubis|total ?energies|matatu|fare|parking|sgr|\bbus\b/i],['Bills & utilities',/kplc|kenya power|electric|power|water|wifi|internet|zuku|dstv|gotv|startimes|insurance|subscription|\bbills?\b|nhif|\bsha\b|\bkra\b/i],['Rent',/\brent\b|landlord/i],['Health',/pharmacy|chemist|hospital|clinic|medic|dental|\blab\b/i],['Entertainment',/cinema|movie|netflix|showmax|spotify|\bbet\b|sportpesa|\bclub\b|ticket|game/i],['Food & groceries',/naivas|carrefour|quickmart|tuskys|chandarana|cleanshelf|artcaffe|supermarket|grocer|market|restaurant|cafe|kfc|java|pizza|food|eatery|butchery|bakery|glovo|chicken|hotel|mama/i],['Shopping',/jumia|kilimall|\bshop|store|mall|cloth|fashion|boutique|amazon|electronics|hardware/i]];
const hs=s=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))|0,7).toString(36);
function guess(m,key){
  if(key&&S.map[key]&&S.cats.some(c=>c.name===S.map[key]))return S.map[key];
  for(const[n,r]of RULES)if(r.test(m)&&S.cats.some(c=>c.name===n))return n;
  return S.cats.some(c=>c.name==='Other')?'Other':S.cats[0].name}
function parseSms(raw,ts){
  const m=raw.replace(/\s+/g,' ').trim();if(m.length<12)return null;
  if(/\b(otp|verification code|one.time)\b/i.test(m))return null;
  if(/\b(received|credited|deposited|salary)\b/i.test(m)&&!/\b(paid|sent|bought|purchase|withdraw)/i.test(m))return{skip:1};
  if(!/\b(paid|sent|bought|purchase\w*|payment|withdraw\w*|spent|debited|transferred|airtime)\b/i.test(m))return null;
  const re=/(?:KES|KSHS?|UGX|TZS|NGN|USD|[$€£₦])\s?([\d,]+(?:\.\d{1,2})?)/gi;let a=0,x;
  while((x=re.exec(m))){if(!/(bal|fee|charge|cost)[^.]{0,20}$/i.test(m.slice(Math.max(0,x.index-28),x.index))){a=parseFloat(x[1].replace(/,/g,''));break}}
  if(!(a>0))return null;
  const dm=m.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);let date=ts?(d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()))(new Date(ts)):today();
  if(dm&&+dm[2]<=12&&+dm[1]<=31){let y=+dm[3];if(y<100)y+=2000;date=y+'-'+pad(+dm[2])+'-'+pad(+dm[1])}
  const cm=m.match(/^([A-Z0-9]{8,12})\s+confirmed/i),id=cm?cm[1].toUpperCase():'h'+hs(m);
  const mm=m.match(/\b(?:paid to|sent to|payment to|purchase at|bought at|spent at|at|to)\s+([A-Za-z0-9][A-Za-z0-9 .&'*-]{1,34}?)(?=\s+(?:on|for|acc|a\/c|ref|using|via|from)\b|\s+\d{9,}|[.,]|$)/i);
  const who=(mm?mm[1]:'').replace(/\s*\d[\d\s]*$/,'').trim(),key=who.toLowerCase().slice(0,24);
  const note=who?who.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()):/airtime/i.test(m)?'Airtime':/withdraw/i.test(m)?'Cash withdrawal':'Expense';
  const fm=m.match(/transaction cost,?\s*(?:KES|KSHS?)?\s?([\d,]+(?:\.\d{1,2})?)/i),fee=fm?parseFloat(fm[1].replace(/,/g,'')):0;return{id,amt:a+fee,fee,date,note,key,cat:guess(who+' '+m,key),method:/card|visa|mastercard/i.test(m)?'Card':/bank|a\/c|account/i.test(m)?'Bank transfer':'Mobile money'}}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),3200)}
function syncSms(auto){
  if(!window.Android)return;
  if(!Android.hasPermission()){if(!auto||!S.asked){S.asked=1;save();Android.requestPermission()}return}
  let g=[];try{g=JSON.parse(Android.readSms(S.last?Math.ceil((Date.now()-S.last)/864e5)+2:60,S.senders||'MPESA'))}catch(e){}
  const seen=new Set(S.tx.map(x=>x.sms).filter(Boolean));let n=0;
  g.reverse().forEach(x=>{const p=parseSms(x.body,x.ts);if(!p||p.skip||seen.has(p.id))return;seen.add(p.id);
    S.tx.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),amt:p.amt,cat:p.cat,note:p.note,date:p.date,method:p.method,sms:p.id,key:p.key,fee:p.fee});n++});
  S.last=Date.now();save();
  if(n){V.sel=today();render();toast('Added '+n+' expense'+(n>1?'s':'')+' from SMS'+warnTxt())}else if(!auto)toast('No new expenses found')}
function openImport(){if(window.Android){if(Android.hasPermission())syncSms(false);else permHelp();return}openPaste()}
function permHelp(){$('#sheet').innerHTML=`<div class="box" data-k="imp"><div class="row"><h2 style="margin:0">Allow SMS access</h2><button class="x" onclick="closeM()" aria-label="Close">×</button></div><p class="mut sm">Spendwise needs permission to read your M-Pesa messages. If Android blocks it, open app settings, tap the ⋮ menu and choose Allow restricted settings, then allow SMS. Or paste your messages instead.</p><button class="btn" style="width:100%" onclick="closeM();Android.requestPermission()">Try again</button><button class="btn ghost" style="width:100%" onclick="Android.openSettings();closeM()">Open app settings</button><button class="btn ghost" style="width:100%" onclick="openPaste()">Paste messages instead</button></div>`;$('#sheet').hidden=false}
function openPaste(){
  $('#sheet').innerHTML=`<div class="box" data-k="imp"><div class="row"><h2 style="margin:0">Import from SMS</h2><button class="x" onclick="closeM()" aria-label="Close">×</button></div><p class="mut sm">Copy your payment messages (mobile money or bank) and paste them below. Spendwise finds the amount, date and merchant, then sorts each one into a category. Nothing leaves this device.</p><textarea id="ib" style="height:140px;font:14px system-ui" placeholder="Paste messages here, one after another"></textarea><div id="ip"></div><button class="btn" id="ib2" onclick="findSms()">Find expenses</button></div>`;$('#sheet').hidden=false}
function findSms(){
  const t=$('#ib').value.trim();if(!t)return;
  let ch=t.split(/\n\s*\n/);
  if(ch.length===1){const ls=t.split(/\n/);if(ls.filter(l=>/(KES|KSH|UGX|TZS|NGN|USD|[$€£₦])\s?\d/i.test(l)).length>1)ch=ls}
  const seen=new Set(S.tx.map(x=>x.sms).filter(Boolean));I={rows:[],skip:0};
  ch.forEach(c=>{const p=parseSms(c);if(!p)return;if(p.skip){I.skip++;return}p.dup=seen.has(p.id);p.on=!p.dup;seen.add(p.id);I.rows.push(p)});
  $('#ip').innerHTML=(I.rows.length?`<div style="margin-top:10px">${I.rows.map((r,i)=>`<div class="ir${r.dup?' dim':''}"><input type="checkbox"${r.on?' checked':''}${r.dup?' disabled':''} onchange="I.rows[${i}].on=this.checked;cnt()" aria-label="Include ${esc(r.note)}"><span class="n"><b>${esc(r.note)}</b><span class="mut sm">${fmtDay(r.date)}${r.dup?' · Already imported':''}</span></span><span class="am">${fmt(r.amt)}</span><select onchange="I.rows[${i}].cat=this.value" aria-label="Category">${S.cats.map(c=>`<option${c.name===r.cat?' selected':''}>${esc(c.name)}</option>`).join('')}</select></div>`).join('')}</div>`:'<p class="mut sm" style="margin-top:10px">No expenses found. Paste full messages that include the amount.</p>')+(I.skip?`<p class="mut sm">${I.skip} money-received message${I.skip>1?'s':''} skipped.</p>`:'');
  cnt()}
function cnt(){const n=I.rows.filter(r=>r.on).length,b=$('#ib2');b.textContent=n?`Import ${n} expense${n>1?'s':''}`:'Find expenses';b.onclick=n?addSms:findSms}
function addSms(){
  const L=I.rows.filter(r=>r.on);
  L.forEach(r=>{S.tx.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),amt:r.amt,cat:r.cat,note:r.note,date:r.date,method:r.method,sms:r.id,fee:r.fee});if(r.key)S.map[r.key]=r.cat});
  if(L.length)V.sel=L.map(r=>r.date).sort().pop();save();closeM();render()}
document.addEventListener('keydown',e=>{if($('#sheet').hidden)return;if(e.key==='Escape')closeM();if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.id!=='x'&&!e.target.closest('[data-k=imp]'))saveTx()});
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeM()});
// ===== Start =====
if(!S.onb)V.tab='wl';W.col=S.col||'ocean';
applyTheme();render();lockNow();
if(window.Android){$('#syn').innerHTML=SV(IC2.sync);$('#syn').setAttribute('aria-label','Sync SMS now');window.onAppResume=()=>{if(S.pin&&Date.now()-LB>(S.lockAfter==null?30:S.lockAfter)*1000&&Date.now()-UL>1500)lockNow();render();syncSms(true)};window.onAppPause=()=>{LB=Date.now()};window.onSmsPermission=()=>{render();if(Android.hasPermission())syncSms(false);else permHelp()};setTimeout(()=>syncSms(true),500)}
