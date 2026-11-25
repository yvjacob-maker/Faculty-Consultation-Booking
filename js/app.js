(function(){
var IMG_SEAL="assets/seal.png",IMG_CCS="assets/ccs-logo.png",IMG_CCSD="assets/ccs-logo-dark.png";
var FAC=[
 {id:"f1",name:"Prof. Maria Santos",pos:"IT Instructor",subjects:["Programming 1","Object-Oriented Programming"],room:"CCS Room 204",meet:"https://meet.google.com/abc-defg-hij",days:[1,3],slots:["09:00","10:00","11:00","14:00"]},
 {id:"f2",name:"Prof. John Reyes",pos:"IT Instructor",subjects:["Web Development","Web Systems and Technologies"],room:"CCS Room 118",meet:"",days:[2,4],slots:["08:30","09:30","13:00","15:00"]},
 {id:"f3",name:"Prof. Angela Cruz",pos:"IT Instructor",subjects:["Database Management Systems","Advanced Database Systems"],room:"CCS Room 305",meet:"https://meet.google.com/xyz-uvwx-rst",days:[1,2,5],slots:["10:00","11:00","13:30","16:00"]},
 {id:"f4",name:"Prof. Mark Villanueva",pos:"IT Instructor",subjects:["Networking","Computer Networks"],room:"CCS Room 112",meet:"",days:[3,4,5],slots:["09:00","10:30","14:00","15:30"]},
 {id:"f5",name:"Prof. Christine Mendoza",pos:"IT Instructor",subjects:["Information Assurance and Security"],room:"CCS Room 209",meet:"https://meet.google.com/lmn-opqr-stu",days:[1,4],slots:["08:00","09:00","13:00","14:30"]},
 {id:"f6",name:"Prof. Daniel Garcia",pos:"IT Instructor",subjects:["Systems Analysis and Design"],room:"CCS Room 210",meet:"",days:[2,5],slots:["09:30","11:00","13:30","15:00"]},
 {id:"f7",name:"Prof. Patricia Lopez",pos:"IT Instructor",subjects:["Human-Computer Interaction","UI/UX Design"],room:"CCS Room 301",meet:"",days:[1,3,5],slots:["08:30","10:00","14:00","16:00"]},
 {id:"f8",name:"Prof. Michael Torres",pos:"IT Instructor",subjects:["Data Structures and Algorithms"],room:"CCS Room 115",meet:"https://meet.google.com/def-ghij-klm",days:[2,3],slots:["09:00","10:30","13:00","15:30"]},
 {id:"f9",name:"Prof. Andrea Flores",pos:"IT Instructor",subjects:["Research Methods","Capstone Project"],room:"CCS Room 307",meet:"",days:[3,4],slots:["10:00","11:30","14:00","16:00"]},
 {id:"f10",name:"Prof. Robert Dela Cruz",pos:"CCS Dean",subjects:["Academic Advising","Student Consultation"],room:"CCS Dean’s Office",meet:"",days:[1,2,4],slots:["08:00","09:30","13:30","15:00"]}
];
var USERS=[
 {id:"A-0001",name:"CCS Admin Office",role:"admin",unit:"College of Computer Studies",pw:"pBX?xH2#%Y%k"},
 {id:"F-1001",name:"Prof. Maria Santos",role:"faculty",fid:"f1",unit:"IT Instructor",pw:"fgxHA3*ee8uT"},
 {id:"F-1002",name:"Prof. John Reyes",role:"faculty",fid:"f2",unit:"IT Instructor",pw:"oTa9zRPn4?dM"},
 {id:"F-1003",name:"Prof. Angela Cruz",role:"faculty",fid:"f3",unit:"IT Instructor",pw:"r!ip7iTo7Gjj"},
 {id:"F-1004",name:"Prof. Mark Villanueva",role:"faculty",fid:"f4",unit:"IT Instructor",pw:"edU?ZzXX6eLa"},
 {id:"F-1005",name:"Prof. Christine Mendoza",role:"faculty",fid:"f5",unit:"IT Instructor",pw:"*YQ8K%HdE*5c"},
 {id:"F-1006",name:"Prof. Daniel Garcia",role:"faculty",fid:"f6",unit:"IT Instructor",pw:"j@W9q7dohU8F"},
 {id:"F-1007",name:"Prof. Patricia Lopez",role:"faculty",fid:"f7",unit:"IT Instructor",pw:"FYK3uw!Fn27i"},
 {id:"F-1008",name:"Prof. Michael Torres",role:"faculty",fid:"f8",unit:"IT Instructor",pw:"F@gRR9bVY@#k"},
 {id:"F-1009",name:"Prof. Andrea Flores",role:"faculty",fid:"f9",unit:"IT Instructor",pw:"Y75ME*25ks4F"},
 {id:"F-1010",name:"Prof. Robert Dela Cruz",role:"faculty",fid:"f10",unit:"CCS Dean",pw:"icr2Cfq%$s3y"},
 {id:"2024-0101",name:"Adrian Cay",role:"student",unit:"BS Computer Science",pw:"nG$Tx$5w5Yjc"},
 {id:"2024-0102",name:"Yvonne Jacob",role:"student",unit:"BS Information Technology",pw:"m#F*FNFrRM8o"},
 {id:"2024-0103",name:"Sandy Ballecer",role:"student",unit:"BS Information Technology",pw:"ca!7$7mcPMjB"},
 {id:"2024-0104",name:"Jonabel Ibo",role:"student",unit:"BS Information System",pw:"G$JxhsU2ggkS"},
 {id:"2024-0105",name:"Joena Tucio",role:"student",unit:"BS Computer Science",pw:"%nHs9kMo!y2p"}
];
var ROLE={student:"Student",faculty:"Faculty",admin:"Administrator"};
var MODES={chat:"Chat",online:"Google Meet (online)",face:"Face to face"};
var TOPICS=["Object Oriented Programming","Computer Programming","Multimedia Systems","Cybersecurity","Advanced Database System","Data Structures and Algorithms","Application Development and Emerging Technologies","Methods of Research in Computing","System Integration and Architecture","Quantitative Methods"];
var CONCERNS=["Programming or coding help","Capstone or thesis","Grade or requirement concern","Academic advising","Other"];
function concernCell(b){return '<b>'+esc(b.concern||"—")+'</b>'+(b.note?'<div class="sub">'+esc(b.note)+'</div>':"");}
var VIEWS={
 student:[["book","Book a consultation"],["mine","My bookings"],["done","Completed"],["chat","Messages"],["notif","Notifications"],["resched","Reschedule",0],["pw","Change password"]],
 faculty:[["inbox","Consultation requests"],["done","Completed"],["chat","Messages"],["notif","Notifications"],["avail","My availability"],["resched","Reschedule",0],["pw","Change password"]],
 admin:[["dash","Overview"],["all","All bookings"],["users","Accounts"],["log","Activity log"],["pw","Change password"]]
};
var KEY="sis-consult-v7",LKEY="sis-log-v7",DKEY="sis-disabled-v7",SKEY="sis-session-v7",TMPKEY="sis-temp-pw-v7",UKEY="sis-users-v7",FKEY="sis-fac-v7",CKEY="sis-chat-v7",NKEY="sis-notif-v7",RKEY="sis-read-v7";
function load(k,d){try{var r=localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p!==null&&typeof p==="object"&&(d===null||Array.isArray(p)===Array.isArray(d)))return p;}}catch(e){}return d;}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function $(i){return document.getElementById(i);}
function pad(n){return String(n).padStart(2,"0");}
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function pd(s){var q=s.split("-");return new Date(+q[0],+q[1]-1,+q[2]);}
function nice(s){return pd(s).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});}
function t12(t){var q=t.split(":"),h=+q[0];return ((h+11)%12+1)+":"+q[1]+(h<12?" AM":" PM");}
function ts(t){return new Date(t).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function active(b){return b.status==="pending"||b.status==="confirmed";}
function sorted(a){return a.slice().sort(function(x,y){return (x.date+x.time)<(y.date+y.time)?-1:1;});}
function sortedNewest(a){return a.slice().sort(function(x,y){var xc=x.created?Date.parse(x.created):0,yc=y.created?Date.parse(y.created):0;if(xc!==yc)return yc-xc;return (x.date+x.time)<(y.date+y.time)?1:-1;});}
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(function(){t.classList.remove("show");},2600);}
function copyText(tx,ok){var bad=function(){toast("Could not copy. Select the password and copy it manually.");};try{navigator.clipboard.writeText(tx).then(function(){toast(ok||"Copied to the clipboard");},bad);}catch(x){bad();}}
function expireClientSession(){
  if(!st.user)return;
  st.user=null;st.mustChange=false;st.showLogin=true;st.view="";st.mail=null;st.pwlist=null;st.pwpop=null;st.emailAcct=null;
  try{sessionStorage.removeItem(SKEY);sessionStorage.removeItem(TMPKEY);history.replaceState(null,"",location.pathname+location.search);}catch(x){}
  render();toast("Your session expired. Please log in again.");
}
async function reqJSON(url,opts){var r=await fetch(url,opts||{}),d={};try{d=await r.json();}catch(x){}if(r.status===401)expireClientSession();if(!r.ok)throw new Error((d&&d.error)||"Request failed.");return d;}
function emailOk(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v||""));}
function mkref(date){var c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",r="";for(var i=0;i<4;i++)r+=c[Math.floor(Math.random()*c.length)];return "CB-"+date.replace(/-/g,"")+"-"+r;}
function rid(p){return p+Date.now()+Math.random().toString(36).slice(2,6);}
function okMeet(u){return typeof u==="string"&&/^https:\/\/meet\.google\.com\/[A-Za-z0-9_\-\/?=&.]+$/.test(u);}
USERS=load(UKEY,USERS);FAC=load(FKEY,FAC);if(!load(UKEY,null))put(UKEY,USERS);if(!load(FKEY,null))put(FKEY,FAC);
function fById(id){return FAC.filter(function(f){return f.id===id;})[0]||{id:id,name:"Unknown faculty",pos:"",subjects:[],room:"",meet:"",days:[],slots:[]};}
function subjText(f){return (f.subjects||[]).join(", ");}
function uById(id){return USERS.filter(function(u){return u.id===id;})[0];}
function hasId(id){id=id.toLowerCase();return USERS.some(function(u){return u.id.toLowerCase()===id;});}
function facUser(fid){return USERS.filter(function(u){return u.fid===fid;})[0];}
var WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var POOL=[];for(var h0=8;h0<=16;h0++){POOL.push(pad(h0)+":00");POOL.push(pad(h0)+":30");}

function seed(){
  var out=[],lg=[],ch=[],nt=[],T=["confirmed","confirmed","pending","declined","confirmed","cancelled","pending"],M=["face","chat","online","face","online","chat"],S=USERS.filter(function(u){return u.role==="student";}),now=new Date();now.setHours(0,0,0,0);
  for(var i=0;i<20;i++){
    var f=FAC[i%FAC.length],off=i*2-12,d=new Date(now);d.setDate(now.getDate()+off);
    var s=T[i%T.length];if(off<=0&&s==="pending")s="confirmed";if(off<0&&s==="confirmed")s="completed";
    var u=S[(i*3)%S.length],cd=new Date(Math.min(d.getTime()-2*864e5,Date.now()-(30-i)*36e5)),c=cd.toISOString(),date=iso(d),fu=facUser(f.id);
    var b={id:"s"+i,ref:mkref(date),fid:f.id,date:date,time:f.slots[i%f.slots.length],sid:u.id,name:u.name,email:"",topic:f.subjects[i%f.subjects.length],concern:CONCERNS[i%CONCERNS.length],note:"",mode:M[i%6],status:s,created:c};
    if(s==="completed")b.doneAt=new Date(d.getTime()+36e6).toISOString();
    out.push(b);
    lg.push({t:c,u:u.name,ro:"student",a:"Booking requested",d:b.ref});
    if(fu&&s==="pending")nt.push({id:"sf"+i,to:fu.id,t:c,kind:"pending",text:"New consultation request from "+u.name+" on "+nice(date)+" at "+t12(b.time)+".",bid:b.id,read:false});
    if(s!=="pending"&&s!=="cancelled"){
      var dt=new Date(cd.getTime()+108e5).toISOString();
      lg.push({t:dt,u:f.name,ro:"faculty",a:s==="declined"?"Booking declined":"Booking confirmed",d:b.ref});
      nt.push({id:"sn"+i,to:u.id,t:dt,kind:s,text:"Your consultation request with "+f.name+" on "+nice(date)+" at "+t12(b.time)+" was "+(s==="declined"?"rejected":"approved")+".",bid:b.id,read:i%2===0});
    }
    if(s==="completed")lg.push({t:b.doneAt,u:f.name,ro:"faculty",a:"Booking completed",d:b.ref});
    if(s==="cancelled")lg.push({t:new Date(cd.getTime()+216e5).toISOString(),u:u.name,ro:"student",a:"Booking cancelled",d:b.ref});
    if(i%5===0&&s!=="declined"){
      ch.push({id:"sc"+i+"a",bid:b.id,uid:u.id,name:u.name,role:"student",text:"Good day! May I ask about my project before our consultation?",t:new Date(cd.getTime()+36e5).toISOString()});
      ch.push({id:"sc"+i+"b",bid:b.id,uid:fu?fu.id:"",name:f.name,role:"faculty",text:"Of course. Please send your questions here and we can go over them during our consultation.",t:new Date(cd.getTime()+72e5).toISOString()});
    }
  }
  return {b:out,l:lg,c:ch,n:nt};
}
var bookings=load(KEY,null),logs=load(LKEY,null),chat=load(CKEY,null),notifs=load(NKEY,null),disabled=load(DKEY,{}),reads=load(RKEY,{});
if(!Array.isArray(bookings)||!Array.isArray(logs)||!Array.isArray(chat)||!Array.isArray(notifs)){var sd=seed();bookings=sd.b;logs=sd.l;chat=sd.c;notifs=sd.n;put(KEY,bookings);put(LKEY,logs);put(CKEY,chat);put(NKEY,notifs);}
function saveAll(){put(KEY,bookings);put(LKEY,logs.slice(-300));}
function saveU(){put(UKEY,USERS);}function saveF(){put(FKEY,FAC);}
var LKKEY="sis-lock-v7",TKEY="sis-theme-v7",MAXTRY=5,lock=load(LKKEY,{n:0,until:0});
function lockLeft(){var n=Date.now();if(lock.until&&n<lock.until)return Math.ceil((lock.until-n)/1000);if(lock.until){lock={n:0,until:0};put(LKKEY,lock);}return 0;}
function lockMsg(l){return "Too many failed attempts. Try again in "+Math.floor(l/60)+":"+pad(l%60)+".";}
function theme(){return document.documentElement.getAttribute("data-theme")==="dark"?"dark":"light";}
(function(){var t=null;try{t=localStorage.getItem(TKEY);}catch(e){}if(t!=="dark"&&t!=="light")t=(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";document.documentElement.setAttribute("data-theme",t);})();
var ICO='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',MOON=ICO+'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',SUN=ICO+'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var EYE='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',EYEOFF='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.5 10.5 0 0 1 12 19C5.5 19 2 12 2 12a18 18 0 0 1 4.1-5.1M9.9 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.2 3.2M1 1l22 22"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function themeBtn(){var d=theme()==="dark";return '<button type="button" class="btn sm ghost tbtn" data-theme-toggle="1" aria-label="Switch to '+(d?"light":"dark")+' mode">'+(d?SUN:MOON)+'<span>'+(d?"Light mode":"Dark mode")+'</span></button>';}
function themeSwitch(){var d=theme()==="dark";return '<button type="button" class="tsw" role="switch" aria-checked="'+d+'" data-theme-toggle="1" aria-label="Dark mode">'+SUN+'<span class="trk"><span class="knob"></span></span>'+MOON+'</button>';}
function clocks(){var d=new Date(),t=d.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit",second:"2-digit"}),dt=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});document.querySelectorAll("[data-ct]").forEach(function(n){n.textContent=t;});document.querySelectorAll("[data-cd]").forEach(function(n){n.textContent=dt;});}

var st={showLogin:false,brf:"all",bpf:"all",lq:"",lrf:"all",lpf:"all",uq:"",urf:"all",upf:"all",pages:{},aform:null,pwlist:null,pwpop:null,pwfocus:false,emailAcct:null,emailFocus:false,lrole:"student",lpw:"",lid:"",lerr:"",user:null,view:"",nf:"",crashed:false,mustChange:false,fac:null,date:null,time:null,mode:"face",form:{em:"",cn:CONCERNS[0],nt:"",rs:""},err:"",notice:"",ff:"pending",as:"all",af:"all",q:"",cb:null,rb:null,rdate:null,rtime:null,imp:null,impRole:"student",impSeq:0,mail:null,mailBusy:false,aerr:"",perr:"",pok:""};
function logEv(a,d,who){who=who||st.user;logs.push({t:new Date().toISOString(),u:who?who.name:"Unknown",ro:who?who.role:"none",a:a,d:d||"",uid:(who&&who.id)?who.id:""});saveAll();}
function notify(to,text,kind,bid){if(!to)return;notifs.push({id:rid("n"),to:to,t:new Date().toISOString(),kind:kind,text:text,bid:bid||"",read:false});put(NKEY,notifs.slice(-500));}
function getB(id){return bookings.filter(function(b){return b.id===id;})[0];}
function owns(u,b){return !!b&&((u.role==="student"&&b.sid===u.id)||(u.role==="faculty"&&b.fid===u.fid));}
function taken(fid,date,time,ex){return bookings.some(function(b){return b.fid===fid&&b.id!==ex&&active(b)&&((b.date===date&&b.time===time)||(b.req&&b.req.date===date&&b.req.time===time));});}
function clash(sid,date,time,ex){return bookings.some(function(b){return b.sid===sid&&b.id!==ex&&active(b)&&((b.date===date&&b.time===time)||(b.req&&b.req.date===date&&b.req.time===time));});}
function readCnt(u,b,ms){var r=reads[u.id+"|"+b.id];if(typeof r==="number")return r;if(typeof r==="string")return ms.filter(function(m){return m.t<=r;}).length;return 0;}
function threadsFor(u){
  var l=bookings.filter(function(b){return owns(u,b);});
  return l.map(function(b){var ms=chat.filter(function(m){return m.bid===b.id;});return {b:b,ms:ms,last:ms.length?ms[ms.length-1].t:b.created,un:ms.filter(function(m,i){return m.uid!==u.id&&i>=readCnt(u,b,ms);}).length};}).sort(function(a,b){return a.last<b.last?1:-1;});
}
function unreadMsgs(u){return threadsFor(u).reduce(function(s,t){return s+t.un;},0);}
function unread(u){return notifs.filter(function(n){return n.to===u.id&&!n.read;}).length;}
function startMs(b){var q=b.date.split("-"),t=b.time.split(":");return new Date(+q[0],+q[1]-1,+q[2],+t[0],+t[1]).getTime();}
function reminders(u){var now=Date.now();return sorted(bookings.filter(function(b){var m=startMs(b);return b.status==="confirmed"&&owns(u,b)&&m+18e5>=now&&m<=now+1728e5;}));}
var RSKEY="sis-remseen-v7",remseen=load(RSKEY,{});
function rkey(u,b){return u.id+"|"+b.id+"|"+b.date+"|"+b.time;}
function unseenRem(u){return reminders(u).filter(function(b){return !remseen[rkey(u,b)];}).length;}
function markRemSeen(u){var ch=false;reminders(u).forEach(function(b){var k=rkey(u,b);if(!remseen[k]){remseen[k]=1;ch=true;}});if(ch)put(RSKEY,remseen);}
function badge(v,u){var n=0;if(v==="chat")n=unreadMsgs(u);else if(v==="notif")n=unread(u)+reminders(u).length;return n?" ("+n+")":"";}
function canView(v){return !!st.user&&VIEWS[st.user.role].some(function(x){return x[0]===v;});}
try{var sid0=sessionStorage.getItem(SKEY),su=sid0&&uById(sid0);if(su&&!disabled[su.id]){st.user=su;st.view=VIEWS[su.role][0][0];st.mustChange=sessionStorage.getItem(TMPKEY)==="1";}}catch(e){}

function tag(s){return '<span class="st s-'+s+'">'+s.charAt(0).toUpperCase()+s.slice(1)+'</span>';}
var PAGE_SIZE=20;
function pageWindow(key,total){
  var pageCount=Math.max(1,Math.ceil(total/PAGE_SIZE));
  var current=Math.min(Math.max(1,parseInt(st.pages[key],10)||1),pageCount);
  st.pages[key]=current;
  var start=(current-1)*PAGE_SIZE;
  return {start:start,end:Math.min(start+PAGE_SIZE,total),current:current,pages:pageCount,total:total};
}
function pageControls(key,total){
  if(total<=PAGE_SIZE)return "";
  var page=pageWindow(key,total);
  return '<nav class="pagination" aria-label="Pagination"><span class="sub">Showing '+(page.start+1)+'-'+page.end+' of '+total+'</span><div class="pagination-actions"><button type="button" class="btn sm ghost" data-page-key="'+key+'" data-page-set="'+(page.current-1)+'"'+(page.current===1?" disabled":"")+'>Previous</button><span class="sub">Page '+page.current+' of '+page.pages+'</span><button type="button" class="btn sm ghost" data-page-key="'+key+'" data-page-set="'+(page.current+1)+'"'+(page.current===page.pages?" disabled":"")+'>Next</button></div></nav>';
}
function pagedList(key,items){
  var page=pageWindow(key,items.length);
  return {items:items.slice(page.start,page.end),controls:pageControls(key,items.length)};
}
function tbl(h,rows,empty,ids,pageKey){
  if(!rows.length)return '<div class="tw"><p class="empty">'+empty+'</p></div>';
  var controls="";
  if(pageKey){var page=pageWindow(pageKey,rows.length);rows=rows.slice(page.start,page.end);if(ids)ids=ids.slice(page.start,page.end);controls=pageControls(pageKey,page.total);}
  return '<div class="tw"><table><thead><tr>'+h.map(function(x){return "<th>"+x+"</th>";}).join("")+'</tr></thead><tbody>'+rows.map(function(r,i){var id=ids&&ids[i];return "<tr"+(id?' class="clk" data-bid="'+esc(id)+'" tabindex="0" title="Click to see the booking details"':"")+">"+r.map(function(c){return "<td>"+c+"</td>";}).join("")+"</tr>";}).join("")+'</tbody></table></div>'+controls;
}
function bars(items){
  var m=Math.max.apply(null,items.map(function(i){return i[1];}).concat([1]));
  return items.map(function(i){return '<div class="bar"><span>'+esc(i[0])+'</span><div class="tr2"><i style="width:'+Math.round(100*i[1]/m)+'%"></i></div><b>'+i[1]+'</b></div>';}).join("");
}
function sel(key,val,opts,lab){return '<div><label for="x'+key+'">'+lab+'</label><select id="x'+key+'" data-s="'+key+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===val?" selected":"")+'>'+esc(o[1])+'</option>';}).join("")+'</select></div>';}
var STATS=[["all","All statuses"],["pending","Pending"],["confirmed","Confirmed"],["completed","Completed"],["declined","Declined"],["cancelled","Cancelled"]];
function dtCell(b){return esc(nice(b.date))+'<div class="sub">'+t12(b.time)+'</div>'+(b.req?'<div class="sub">Change requested: '+esc(nice(b.req.date))+', '+t12(b.req.time)+'</div>':"");}
function modeCell(b){
  var f=fById(b.fid),m=b.mode||"face",h='<b>'+MODES[m]+'</b>';
  if(m==="face")h+='<div class="sub">'+esc(f.room)+'</div>';
  else if(m==="chat")h+='<div class="sub">In-portal chat</div>';
  else if(b.status==="confirmed"&&okMeet(f.meet))h+='<div class="sub"><a href="'+esc(f.meet)+'" target="_blank" rel="noopener noreferrer">Join Google Meet</a></div>';
  else h+='<div class="sub">'+(okMeet(f.meet)?"Link shown once confirmed":"Link to be provided")+'</div>';
  return h;
}
function openDays(f){var d=new Date(),out=[];d.setHours(0,0,0,0);for(var i=1;i<=28&&out.length<6;i++){var x=new Date(d);x.setDate(d.getDate()+i);if(f.days.indexOf(x.getDay())>-1)out.push(x);}return out;}
function dayBtns(f,cur,attr){return '<div class="days">'+openDays(f).map(function(x){var k=iso(x);return '<button class="day" '+attr+'="'+k+'" aria-pressed="'+(k===cur)+'"><b>'+x.toLocaleDateString(undefined,{weekday:"short"})+'</b>'+x.toLocaleDateString(undefined,{month:"short",day:"numeric"})+'</button>';}).join("")+'</div>';}
function slotBtns(f,date,cur,attr,ex,sid){return '<div class="slots">'+f.slots.map(function(t){var off=taken(f.id,date,t,ex)||clash(sid,date,t,ex);return '<button class="slot" '+attr+'="'+t+'" aria-pressed="'+(cur===t)+'"'+(off?' disabled title="Not available"':'')+'>'+t12(t)+'</button>';}).join("")+'</div>';}

function landingHTML(){
  var feature=function(k,t,d,tag){return '<div class="panel land-card"><span class="land-ic">'+ic(k,22)+'</span><h3>'+t+'</h3><p>'+d+'</p>'+(tag?'<span class="land-tag">'+tag+'</span>':'')+'</div>';};
  var step=function(n,t,d){return '<div class="land-step"><b>'+n+'</b><h3>'+t+'</h3><p>'+d+'</p></div>';};
  var role=function(k,t,items){return '<div class="panel land-role"><span class="land-ic">'+ic(k,22)+'</span><h3>'+t+'</h3><ul>'+items.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';};
  var h='<header class="land-nav"><div class="land-nav-in"><button type="button" class="land-brand" data-logo="1" aria-label="Home"><img class="ccslogo lm" src="'+IMG_CCS+'" alt="College of Computer Studies"><img class="ccslogo dm" src="'+IMG_CCSD+'" alt="" aria-hidden="true"></button><nav class="land-links" aria-label="Landing page"><a href="#about">About</a><a href="#how">How it works</a><a href="#faq">FAQ</a></nav><div class="land-nav-r">'+themeSwitch()+'<button type="button" class="btn sm" data-lgo="1">Sign in</button></div></div></header><div class="land">';
  h+='<section class="land-hero" aria-labelledby="land-title"><div class="land-hero-media" aria-hidden="true"></div><div class="land-hero-body"><p class="land-eyebrow">College of Computer Studies · CSPC</p><h1 id="land-title">Consultations made simple for students and faculty.</h1><p class="land-sub">Book appointments, choose how to meet, track approvals, and keep the conversation going — all in one place.</p><div class="land-cta"><button type="button" class="btn" data-lgo="1">Sign in to get started</button><button type="button" class="btn ghost" data-lfeat="1">See what’s inside</button></div><div class="land-meta"><span><b>3</b> consultation modes</span><span><b>1</b> shared inbox</span><span><b>Photos, videos &amp; files</b> in Messages</span></div></div></section>';
  h+='<section class="land-sec" id="about"><div class="land-sec-head"><h2>About CCS Consultation</h2><p>A single place for consultation scheduling in the College of Computer Studies.</p></div><div class="panel land-about"><p>CCS Consultation is the consultation booking system of the College of Computer Studies, Camarines Sur Polytechnic Colleges. It gives students and faculty one shared space to schedule, confirm, and track consultations without long back-and-forth messages.</p><p>Students can book available slots, choose face-to-face, Google Meet, or portal messages, and follow every request from one dashboard. Faculty can manage their availability and respond to requests, while administrators oversee accounts, bookings, and activity so every consultation stays organized and recorded.</p></div></section>';
  h+='<section class="land-sec" id="feat"><div class="land-sec-head"><h2>Everything you need for a consultation</h2><p>Built around the actual CCS consultation flow.</p></div><div class="land-grid">';
  h+=feature("book","Book in a few steps","Choose a faculty member, pick an open date and time, and send your consultation request.");
  h+=feature("avail","Three consultation modes","Meet face to face, join a Google Meet link, or talk through the portal Messages page.");
  h+=feature("notif","Track every request","Follow pending, confirmed, completed, and rescheduled consultations from one dashboard.");
  h+=feature("chat","Messages with attachments","Keep the discussion going and send photos, videos, and files with your conversation.","New");
  h+=feature("all","Availability at a glance","Faculty set their consultation days, time slots, room, and online meeting link.");
  h+=feature("users","Admin oversight","Manage accounts, review all bookings, and audit activity from the administrator dashboard.");
  h+='</div></section>';
  h+='<section class="land-sec" id="how"><div class="land-sec-head"><h2>How it works</h2><p>From request to consultation in three steps.</p></div><div class="land-steps">';
  h+=step("01","Sign in","Use the student, faculty, or administrator ID issued by the CCS Admin Office.");
  h+=step("02","Book a slot","Pick a faculty member, an open schedule, and how you want to meet.");
  h+=step("03","Confirm and connect","Get updates, meet at the agreed time, and continue the discussion in Messages.");
  h+='</div></section>';
  h+='<section class="land-sec"><div class="land-sec-head"><h2>One system, three roles</h2><p>Each account type sees exactly what it needs.</p></div><div class="land-roles">';
  h+=role("book","Students",["Book and reschedule consultations","Cancel when plans change","Chat with photos, videos, and files","Get reminders and status updates"]);
  h+=role("inbox","Faculty",["Confirm or decline requests","Mark consultations as done","Set availability, room, and Meet link","Reply in Messages"]);
  h+=role("users","Administrators",["Create and manage accounts","Review all bookings","Monitor the activity log","Keep the system organized"]);
  h+='</div></section>';
  h+='<section class="land-sec" id="faq"><div class="land-sec-head"><h2>Frequently asked questions</h2><p>Quick answers about signing in and booking consultations.</p></div><div class="land-faqs">';
  h+='<details class="land-faq"><summary>Who can use CCS Consultation?</summary><p>Students, faculty, and administrators of the College of Computer Studies can sign in using the ID issued by the CCS Admin Office.</p></details>';
  h+='<details class="land-faq"><summary>How do I book a consultation?</summary><p>Sign in as a student, choose a faculty member, pick an available date and time, select how you want to meet, and submit your request. Your faculty member will confirm or decline it.</p></details>';
  h+='<details class="land-faq"><summary>What consultation modes are available?</summary><p>You can meet face to face, join a Google Meet link, or continue the discussion through the portal Messages page.</p></details>';
  h+='<details class="land-faq"><summary>Can I reschedule or cancel a booking?</summary><p>Yes. Open My bookings to request a different time or cancel a consultation. Any changes are reflected in your dashboard.</p></details>';
  h+='<details class="land-faq"><summary>What if I forgot my password or ID?</summary><p>Contact the CCS Admin Office. They can reset your account and issue a new temporary password that you must change on first sign-in.</p></details>';
  h+='</div></section>';
  h+='<section class="land-band"><div><h2>Ready when you are.</h2><p>Sign in with the ID number issued by the CCS Admin Office.</p></div><button type="button" class="btn" data-lgo="1">Sign in</button></section>';
  h+='<footer class="land-foot"><div><b>College of Computer Studies</b><br>Camarines Sur Polytechnic Colleges, Nabua, Cam. Sur</div><div class="sub">Authorized users only. Sign-in attempts are recorded.</div></footer>';
  return h+'</div>';
}
function loginHTML(){
  var R=[["student","Student"],["faculty","Faculty"],["admin","Administrator"]],ph={student:"e.g. 2024-0101",faculty:"e.g. F-1001",admin:"e.g. A-0001"}[st.lrole];
  var idx=R.map(function(r){return r[0];}).indexOf(st.lrole),lk=lockLeft(),dis=lk>0?" disabled":"";
  return '<div class="login"><div class="lcard"><section class="lpane"><div class="bgimg" aria-hidden="true"></div><div class="shade" aria-hidden="true"></div><div class="lcontent"><h1>Faculty Consultation Booking</h1><p>Book, confirm and track consultations between students and faculty.</p><p style="margin-top:12px"><b>College of Computer Studies</b><br>Camarines Sur Polytechnic Colleges, Nabua, Cam. Sur</p></div><div class="clockbox"><span class="ct" data-ct></span><span class="cd" data-cd></span></div></section><section class="rpane"><div class="rtools"><button type="button" class="land-back" data-home="1" aria-label="Back to landing page" title="Back to landing page"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/></svg><span>Home</span></button>'+themeSwitch()+'</div><img class="seal" src="'+IMG_SEAL+'" alt="Camarines Sur Polytechnic Colleges seal"><h2>Sign in</h2><p class="sub" style="margin:0">Select your account type</p><div class="roles" role="group" aria-label="Account type" style="--i:'+(st.rprev!=null?st.rprev:idx)+'" data-i="'+idx+'"><span class="rhl" aria-hidden="true"></span>'+R.map(function(r){return '<button type="button" class="rbtn" data-lr="'+r[0]+'" aria-pressed="'+(st.lrole===r[0])+'">'+r[1]+'</button>';}).join("")+'</div><form id="lf" novalidate><label for="lid">'+ROLE[st.lrole]+' ID number</label><input id="lid" autocomplete="username" placeholder="'+ph+'" value="'+esc(st.lid)+'"'+dis+'><label for="lpw">Password</label><div class="pwwrap"><input id="lpw" type="'+(st.showpw?"text":"password")+'" autocomplete="current-password" value="'+esc(st.lpw||"")+'"'+dis+'><button type="button" class="eye" data-eye="lpw" aria-label="'+(st.showpw?"Hide":"Show")+' password" aria-pressed="'+(!!st.showpw)+'"'+dis+'>'+(st.showpw?EYEOFF:EYE)+'</button></div><p class="authnote">Authorized users only. Sign-in attempts are recorded.</p><p class="err" id="lerr" role="alert">'+esc(lk>0?lockMsg(lk):st.lerr)+'</p><button id="lbtn" class="btn full" type="submit"'+dis+'>Sign in as '+ROLE[st.lrole].toLowerCase()+'</button></form><p class="help">Forgot your password or ID? Contact the CCS Admin Office.</p></section></div></div>';
}

function vBook(){
  var f=st.fac?fById(st.fac):null,F=st.form,u=st.user;
  var sj=f?(f.subjects.indexOf(F.sj)>-1?F.sj:f.subjects[0]):"";
  var h='<h1>Book a consultation</h1><p class="lead">Booking as '+esc(u.name)+' ('+esc(u.id)+'), '+esc(u.unit)+'. College of Computer Studies faculty only.</p><div class="two"><div>';
  h+='<div class="panel"><p class="step"><span>Step 1</span>Choose a faculty member</p><div class="facs">';
  FAC.forEach(function(x){h+='<button class="fac" data-f="'+x.id+'" aria-pressed="'+(x.id===st.fac)+'"><b>'+esc(x.name)+'</b><small>'+esc(x.pos)+'</small><small>'+esc(subjText(x))+'</small><small>'+esc(x.room)+', '+esc(x.days.slice().sort().map(function(d){return WD[d];}).join(", "))+'</small></button>';});
  h+='</div></div><div class="panel"><p class="step"><span>Step 2</span>Select a date and time</p>';
  if(!f)h+='<p class="sub">Choose a faculty member to see open times.</p>';
  else{
    h+=dayBtns(f,st.date,"data-d");
    h+=st.date?slotBtns(f,st.date,st.time,"data-t","",u.id)+'<p class="sub" style="margin:10px 0 0">Crossed-out times are already booked or overlap another consultation of yours.</p>':'<p class="sub">Select a date to see available times.</p>';
  }
  h+='</div><div class="panel"><p class="step"><span>Step 3</span>Consultation type and details</p><div class="modes">';
  Object.keys(MODES).forEach(function(k){h+='<button class="fac" data-m="'+k+'" aria-pressed="'+(st.mode===k)+'"><b>'+MODES[k]+'</b><small>'+({chat:"Talk through the portal Messages page",online:"Join the faculty member’s Google Meet",face:"Meet at the faculty member’s room"})[k]+'</small></button>';});
  h+='</div><label for="sj">Subject or course</label><select id="sj" data-k="sj"'+(f?"":" disabled")+'>'+(f?f.subjects.map(function(t){return "<option"+(t===sj?" selected":"")+">"+esc(t)+"</option>";}).join(""):"<option>Choose a faculty member first</option>")+'</select>';
  h+='<label for="cn">Concern or reason for consultation</label><select id="cn" data-k="cn">'+CONCERNS.map(function(t){return "<option"+(t===F.cn?" selected":"")+">"+esc(t)+"</option>";}).join("")+'</select><label for="nt">What would you like to discuss?</label><textarea id="nt" data-k="nt" rows="3">'+esc(F.nt)+'</textarea></div></div>';
  h+='<aside class="panel"><h2>Request summary</h2><dl class="sum"><dt>Faculty member</dt><dd>'+(f?esc(f.name)+'<br><span class="sub">'+esc(f.pos)+'</span>':"Not selected")+'</dd><dt>Subject or course</dt><dd>'+(f?esc(sj):"Not selected")+'</dd><dt>Date</dt><dd>'+(st.date?esc(nice(st.date)):"Not selected")+'</dd><dt>Time</dt><dd>'+(st.time?t12(st.time):"Not selected")+'</dd><dt>Type</dt><dd>'+MODES[st.mode]+'</dd><dt>Location</dt><dd>'+(st.mode==="face"?(f?esc(f.room):"—"):st.mode==="chat"?"Portal Messages":"Google Meet")+'</dd></dl><p class="err" id="err" role="alert">'+esc(st.err)+'</p><button class="btn full" id="go" style="margin-top:6px">Submit request</button></aside></div>';
  return h;
}
function vMine(){
  var u=st.user,l=sortedNewest(bookings.filter(function(b){return b.sid===u.id;}));
  var h='<h1>My bookings</h1><p class="lead">Track your consultations. You can chat, request a different time, or cancel a booking.</p>';
  if(st.notice){h+='<div class="notice" role="status">'+esc(st.notice)+'</div>';st.notice="";}
  return h+tbl(["Reference","Faculty and subject","Date and time","Type","Concern","Status","Actions"],l.map(function(b){var f=fById(b.fid);return ['<span class="mono">'+esc(b.ref)+'</span>',esc(f.name)+'<div class="sub">'+esc(b.topic)+'</div>',dtCell(b),modeCell(b),concernCell(b),tag(b.status),'<div class="acts"><button class="btn sm ghost" data-openchat="'+b.id+'">Chat</button>'+(active(b)&&!b.req?'<button class="btn sm ghost" data-rs2="'+b.id+'">Reschedule</button>':"")+(active(b)?'<button class="btn sm ghost" data-cancel="'+b.id+'">Cancel</button>':"")+'</div>'];}),"You have no bookings yet. Open “Book a consultation” to send a request.",l.map(function(b){return b.id;}),"mineBookings");
}
function vDone(){
  var u=st.user,stu=u.role==="student",l=sorted(bookings.filter(function(b){return b.status==="completed"&&owns(u,b);})).reverse();
  var h='<h1>Completed consultations</h1><p class="lead">'+(stu?"Your finished consultations.":"Consultations you have marked as done.")+' Select a row to see its details. '+l.length+' completed.</p>';
  return h+tbl(["Reference",stu?"Faculty and subject":"Student and subject","Date and time","Type","Concern","Completed on"],l.map(function(b){var f=fById(b.fid);return ['<span class="mono">'+esc(b.ref)+'</span>',stu?esc(f.name)+'<div class="sub">'+esc(b.topic)+'</div>':esc(b.name)+'<div class="sub">'+esc(b.topic)+'</div>',dtCell(b),MODES[b.mode||"face"],esc(b.concern||"—"),b.doneAt?esc(ts(b.doneAt)):"—"];}),"No completed consultations yet. When a faculty member marks a confirmed consultation as done, it appears here.",l.map(function(b){return b.id;}),"completedBookings");
}
function detailHTML(){
  var u=st.user,b=getB(st.detail);
  if(!b||!(owns(u,b)||u.role==="admin")){st.detail="";return "";}
  var f=fById(b.fid),stu=uById(b.sid),m=b.mode||"face",loc;
  if(m==="face")loc=esc(f.room);else if(m==="chat")loc="In-portal chat (Messages page)";
  else if(b.status==="confirmed"&&okMeet(f.meet))loc='<a href="'+esc(f.meet)+'" target="_blank" rel="noopener noreferrer">Join Google Meet</a>';
  else loc=okMeet(f.meet)?"Google Meet link is shown once the booking is confirmed":"Google Meet link to be provided";
  var ev=logs.filter(function(e){return e.d===b.ref;}).sort(function(x,y){return x.t<y.t?-1:1;});
  var a='';
  if(u.role==="student"&&b.sid===u.id){a+='<button class="btn sm ghost" data-openchat="'+b.id+'">Chat</button>';if(active(b)&&!b.req)a+='<button class="btn sm ghost" data-rs2="'+b.id+'">Reschedule</button>';if(active(b))a+='<button class="btn sm ghost" data-cancel="'+b.id+'">Cancel booking</button>';}
  if(u.role==="faculty"&&b.fid===u.fid){
    if(b.req)a+='<button class="btn sm ok" data-appr="'+b.id+'">Approve change</button><button class="btn sm ghost" data-keep="'+b.id+'">Keep original</button>';
    if(b.status==="pending")a+='<button class="btn sm ok" data-ok="'+b.id+'">Confirm</button><button class="btn sm ghost" data-no="'+b.id+'">Decline</button>';
    if(b.status==="confirmed")a+='<button class="btn sm ok" data-done="'+b.id+'">Mark as done</button>';
    if(active(b))a+='<button class="btn sm ghost" data-rs2="'+b.id+'">Reschedule</button>';
    a+='<button class="btn sm ghost" data-openchat="'+b.id+'">Chat</button>';
  }
  var h='<div class="ov"><div class="dlg'+(st.dnew?" pop":"")+'" role="dialog" aria-modal="true" aria-labelledby="dtt"><div class="dhd"><div><h2 id="dtt" style="margin:0">Booking details</h2><span class="mono sub">'+esc(b.ref)+'</span></div><div class="dhr">'+tag(b.status)+'<button class="x" data-closedt="1" aria-label="Close">×</button></div></div>';
  h+='<dl class="dgrid"><div><dt>Faculty member</dt><dd>'+esc(f.name)+'<div class="sub">'+esc(f.pos)+'</div></dd></div><div><dt>Student</dt><dd>'+esc(b.name)+'<div class="sub">'+esc(b.sid)+(stu?" · "+esc(stu.unit):"")+'</div></dd></div><div><dt>Subject or course</dt><dd>'+esc(b.topic)+'</dd></div><div><dt>Concern or reason</dt><dd>'+esc(b.concern||"—")+'</dd></div><div><dt>Date</dt><dd>'+esc(nice(b.date))+'</dd></div><div><dt>Time</dt><dd>'+t12(b.time)+'</dd></div><div><dt>Consultation type</dt><dd>'+MODES[m]+'</dd></div><div><dt>Location or link</dt><dd>'+loc+'</dd></div><div class="wide"><dt>Notes from the student</dt><dd>'+(b.note?esc(b.note):"—")+'</dd></div><div><dt>Requested on</dt><dd>'+esc(ts(b.created))+'</dd></div>'+(b.doneAt?'<div><dt>Completed on</dt><dd>'+esc(ts(b.doneAt))+'</dd></div>':"")+'</dl>';
  if(b.req)h+='<div class="notice">Change requested: '+esc(nice(b.req.date))+' at '+t12(b.req.time)+(b.req.reason?'. Reason: '+esc(b.req.reason):"")+'</div>';
  h+='<h3 class="dsub">Activity</h3>'+(ev.length?'<ol class="tlist">'+ev.map(function(e){return '<li><b>'+esc(e.a)+'</b><div class="sub">'+esc(e.u)+' · '+esc(ts(e.t))+'</div></li>';}).join("")+'</ol>':'<p class="sub">No activity recorded.</p>');
  if(a)h+='<div class="dact">'+a+'</div>';
  return h+'</div></div>';
}
function openDetail(id){var u=st.user,b=getB(id);if(!u||!b||!(owns(u,b)||u.role==="admin"))return;st.detail=id;st.dnew=true;st.dfocus=true;st.menu=false;render();}
function gotoBooking(bid){
  var u=st.user,b=getB(bid);
  if(!b||!(owns(u,b)||u.role==="admin")){toast("That booking is no longer available.");return;}
  var page=u.role==="admin"?"all":(b.status==="completed"?"done":(u.role==="student"?"mine":"inbox"));
  if(st.view!==page||st.nf)route(page);
  openDetail(bid);
}
function openNotif(id){
  var u=st.user,n=notifs.filter(function(x){return x.id===id&&x.to===u.id;})[0];if(!n)return;
  if(!n.read){n.read=true;put(NKEY,notifs.slice(-500));}
  if(n.bid)gotoBooking(n.bid);else route("notif");
}
function closeDetail(){st.detail="";render();}
function vInbox(){
  var fid=st.user.fid,all=bookings.filter(function(b){return b.fid===fid;}),l=sortedNewest(all.filter(function(b){return st.ff==="all"||b.status===st.ff;}));
  var h='<h1>Consultation requests</h1><p class="lead">Requests addressed to you. '+all.filter(function(b){return b.status==="pending";}).length+' awaiting your response, '+all.filter(function(b){return b.req;}).length+' reschedule request(s).</p>';
  if(st.notice){h+='<div class="notice" role="status">'+esc(st.notice)+'</div>';st.notice="";}
  h+='<div class="tb">'+sel("ff",st.ff,STATS,"Show")+'</div>';
  return h+tbl(["Reference","Student and subject","Date and time","Type","Concern","Status","Actions"],l.map(function(b){
    var a='';
    if(b.req)a+='<button class="btn sm ok" data-appr="'+b.id+'">Approve change</button><button class="btn sm ghost" data-keep="'+b.id+'">Keep original</button>';
    if(b.status==="pending")a+='<button class="btn sm ok" data-ok="'+b.id+'">Confirm</button><button class="btn sm ghost" data-no="'+b.id+'">Decline</button>';
    if(active(b))a+='<button class="btn sm ghost" data-rs2="'+b.id+'">Reschedule</button>';
    if(b.status==="confirmed")a+='<button class="btn sm ok" data-done="'+b.id+'">Mark as done</button>';
    a+='<button class="btn sm ghost" data-openchat="'+b.id+'">Chat</button>';
    return ['<span class="mono">'+esc(b.ref)+'</span>',esc(b.name)+'<div class="sub">'+esc(b.sid)+'</div><div class="sub">'+esc(b.topic)+'</div>',dtCell(b),modeCell(b),concernCell(b)+(b.req&&b.req.reason?'<div class="sub">Reason for change: '+esc(b.req.reason)+'</div>':""),tag(b.status),'<div class="acts">'+a+'</div>'];    }),"No requests match this filter.",l.map(function(b){return b.id;}),"facultyInbox");
}
function vResched(){
  var u=st.user,b=getB(st.rb);
  if(!b||!owns(u,b)||!active(b))return '<h1>Reschedule</h1><div class="panel"><h2>Nothing to reschedule</h2><p>Open a pending or confirmed booking and choose “Reschedule”.</p></div>';
  var f=fById(b.fid),stu=u.role==="student",back=stu?"mine":"inbox";
  var h='<h1>Reschedule consultation</h1><p class="lead">'+(stu?'Request a different time. '+esc(f.name)+' must approve the change, and your current schedule stays until then.':'Move this consultation to another time. The student is notified right away.')+'</p>';
  if(stu&&b.req)return h+'<div class="panel"><p>You already have a pending change request for '+esc(nice(b.req.date))+' at '+t12(b.req.time)+'.</p><button class="btn" data-v="mine">Back to my bookings</button></div>';
  h+='<div class="two"><div><div class="panel"><p class="step"><span>Current</span>'+esc(nice(b.date))+' at '+t12(b.time)+' with '+esc(stu?f.name:b.name)+'</p><p class="step"><span>New time</span>Select a date and time</p>'+dayBtns(f,st.rdate,"data-rd");
  h+=st.rdate?slotBtns(f,st.rdate,st.rtime,"data-rt",b.id,b.sid)+'<p class="sub" style="margin:10px 0 0">Crossed-out times are not available.</p>':'<p class="sub">Select a date to see times.</p>';
  h+='</div><div class="panel"><label for="rsn" style="margin-top:0">Reason (optional)</label><textarea id="rsn" data-k="rs" rows="3">'+esc(st.form.rs)+'</textarea></div></div>';
  h+='<aside class="panel"><h2>Summary</h2><dl class="sum"><dt>New date</dt><dd>'+(st.rdate?esc(nice(st.rdate)):"Not selected")+'</dd><dt>New time</dt><dd>'+(st.rtime?t12(st.rtime):"Not selected")+'</dd></dl><p class="err" id="rerr" role="alert">'+esc(st.err)+'</p><button class="btn full" id="rsub">'+(stu?"Send request":"Reschedule now")+'</button><button class="btn full ghost" data-v="'+back+'">Back</button></aside></div>';
  return h;
}
var FILEICON='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>';
var CHAT_FILE_EXT=/\.(pdf|docx?|xlsx?|pptx?|txt|csv|rtf|odt|ods|odp|md|epub|zip|rar|7z|tar|gz|json|xml|sql|py|java|c|h|cpp|cs|php|js|ts|jsx|tsx|css|tiff?)$/i;
function fileSize(n){n=+n||0;if(n>=1048576)return (n/1048576).toFixed(1).replace(/\.0$/,"")+" MB";if(n>=1024)return Math.round(n/1024)+" KB";return n+" B";}
function msgBody(m){
  var h='',md=m.media;
  if(md&&md.url){
    if(md.type==="video")h+='<video class="mvideo" src="'+esc(md.url)+'" controls preload="metadata"></video>';
    else if(md.type==="file")h+='<a class="mfile" href="'+esc(md.url)+'" download="'+esc(md.name||"file")+'" target="_blank" rel="noopener noreferrer"><span class="mf-ic">'+FILEICON+'</span><span class="mf-tx"><b>'+esc(md.name||"File")+'</b><small>'+esc(fileSize(md.size))+'</small></span></a>';
    else h+='<a class="mphoto" href="'+esc(md.url)+'" target="_blank" rel="noopener noreferrer" title="Open photo"><img src="'+esc(md.url)+'" alt="'+esc(md.name||"Photo")+'" loading="lazy"></a>';
  }
  if(m.text)h+='<span class="mtext">'+esc(m.text)+'</span>';
  return h;
}
function msgPreview(m){
  if(m.text)return m.text;
  if(m.media)return m.media.type==="video"?"🎬 Video":(m.media.type==="file"?"📎 File":"📷 Photo");
  return "";
}
var CLIP='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.4 11.6l-8.9 8.9a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>';
function vChat(){
  var u=st.user,th=threadsFor(u),cur=th.filter(function(t){return t.b.id===st.cb;})[0]||th[0];
  var h='<h1>Messages</h1><p class="lead">Talk with your '+(u.role==="student"?"faculty member":"students")+' about a consultation. Each booking has its own conversation. You can also send photos, videos, and files.</p>';
  if(!cur)return h+'<div class="panel"><p class="empty">No conversations yet. One appears for each booking.</p></div>';
  st.cb=cur.b.id;
  if(st.attachFor&&st.attachFor!==cur.b.id)clearAttach();
  reads[u.id+"|"+cur.b.id]=cur.ms.length;put(RKEY,reads);th=threadsFor(u);
  var b=cur.b,f=fById(b.fid),other=u.role==="student"?f.name:b.name,closed=!active(b),pend=(st.attachFor===b.id&&st.attach)?st.attach:[];
  var threadPage=pagedList("chatThreads",th);
  h+='<div class="chatwrap"><div class="threads panel">'+threadPage.items.map(function(t){var o=u.role==="student"?fById(t.b.fid).name:t.b.name;return '<button class="thr" data-th="'+t.b.id+'" aria-pressed="'+(t.b.id===b.id)+'"><b>'+esc(o)+(t.un?'<span class="nbadge">'+t.un+'</span>':'')+'</b><small>'+esc(nice(t.b.date))+', '+t12(t.b.time)+'</small><small>'+MODES[t.b.mode||"face"]+' · '+t.b.status+'</small></button>';}).join("")+threadPage.controls+'</div>';
  h+='<div class="panel chatpane"><div class="chead"><div><h2 style="margin:0">'+esc(other)+'</h2><p class="sub" style="margin:0">'+esc(nice(b.date))+' at '+t12(b.time)+' · '+MODES[b.mode||"face"]+'</p></div>'+tag(b.status)+'</div>';
  if(b.mode==="online"&&b.status==="confirmed"&&okMeet(f.meet))h+='<p class="sub" style="margin:0 0 8px"><a href="'+esc(f.meet)+'" target="_blank" rel="noopener noreferrer">Join Google Meet</a></p>';
  h+='<div class="msgs" id="msgs">'+(cur.ms.length?cur.ms.map(function(m){return '<div class="bub'+(m.uid===u.id?" me":"")+'"><span class="who">'+esc(m.name)+'</span>'+msgBody(m)+'<span class="when">'+ts(m.t)+'</span></div>';}).join(""):'<p class="empty">No messages yet. Say hello.</p>')+'</div>';
  if(pend.length)h+='<div class="apend" aria-label="Files ready to send">'+pend.map(function(a,i){return '<div class="apitem">'+(a.kind==="video"?'<video src="'+a.preview+'" muted></video>':(a.kind==="file"?'<span class="apfile">'+FILEICON+'</span>':'<img src="'+a.preview+'" alt="">'))+'<span class="apname" title="'+esc(a.name)+'">'+esc(a.name)+'</span><button type="button" class="apx" data-rmatt="'+i+'" aria-label="Remove '+esc(a.name)+'">×</button></div>';}).join("")+'</div>';
  h+='<form id="cf" class="cform" novalidate><label class="attbtn'+(closed?" off":"")+'" title="Attach a photo, video, or file" aria-label="Attach a photo, video, or file">'+CLIP+'<input id="cfile" type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt,.ods,.odp,.md,.epub,.zip,.rar,.7z,.tar,.gz,.json,.xml,.sql,.py,.java,.c,.h,.cpp,.cs,.php,.js,.ts,.jsx,.tsx,.css,.tif,.tiff" multiple'+(closed?" disabled":"")+'></label><input id="cm" maxlength="500" aria-label="Message" placeholder="'+(closed?"This booking is closed":(pend.length?"Add a caption (optional)":"Write a message"))+'" autocomplete="off"'+(closed?" disabled":"")+'><button class="btn" type="submit"'+(closed?" disabled":"")+'>Send</button></form></div></div>';
  reads[u.id+"|"+b.id]=cur.ms.length;put(RKEY,reads);
  return h;
}
function vNotif(){
  var u=st.user,rem=reminders(u),l=notifs.filter(function(n){return n.to===u.id;}).slice().reverse(),today=iso(new Date()),tom=iso(new Date(Date.now()+864e5));
  var h='<h1>Notifications</h1><p class="lead">Updates about approved, rejected and rescheduled consultations, plus reminders for upcoming ones. Select an item to open the related booking. Email notifications are not enabled in this version.</p>';
  var reminderPage=pagedList("reminders",rem),notificationPage=pagedList("notifications",l);
  if(rem.length)h+='<div class="panel"><h2>Upcoming reminders</h2>'+reminderPage.items.map(function(b){var w=b.date===today?"today":b.date===tom?"tomorrow":"on "+nice(b.date);return '<button type="button" class="nrow remrow" data-gobid="'+b.id+'" title="Open booking details"><span>Reminder: consultation with '+esc(u.role==="student"?fById(b.fid).name:b.name)+' '+w+' at '+t12(b.time)+' ('+MODES[b.mode||"face"]+').</span></button>';}).join("")+reminderPage.controls+'</div>';
  h+='<div class="panel"><h2>Recent updates</h2>'+(l.length?notificationPage.items.map(function(n){return '<button type="button" class="nrow'+(n.read?"":" unread")+'" data-nid="'+n.id+'" title="Open"><span>'+esc(n.text)+'</span><span class="sub">'+ts(n.t)+'</span></button>';}).join("")+notificationPage.controls:'<p class="empty">No notifications yet.</p>')+'</div>';
  var ch=false;notifs.forEach(function(n){if(n.to===u.id&&!n.read){n.read=true;ch=true;}});if(ch)put(NKEY,notifs.slice(-500));markRemSeen(u);
  return h;
}
function vAvail(){
  var f=fById(st.user.fid);
  return '<h1>My availability</h1><p class="lead">Choose the days and times students can book with you, plus your room and Google Meet link. Existing bookings are not affected.</p><div class="panel"><h2>Consultation days</h2><div class="days">'+[1,2,3,4,5].map(function(d){return '<button class="day" data-wd="'+d+'" aria-pressed="'+(f.days.indexOf(d)>-1)+'">'+WD[d]+'</button>';}).join("")+'</div><h2 style="margin-top:14px">Time slots</h2><div class="slots">'+POOL.map(function(t){return '<button class="slot" data-sl="'+t+'" aria-pressed="'+(f.slots.indexOf(t)>-1)+'">'+t12(t)+'</button>';}).join("")+'</div><div class="cols"><div><label for="rm">Consultation room</label><input id="rm" data-s2="room" value="'+esc(f.room)+'"></div><div><label for="mt">Google Meet link (online consultations)</label><input id="mt" data-s2="meet" placeholder="https://meet.google.com/abc-defg-hij" value="'+esc(f.meet||"")+'"></div></div></div>';
}
function cnt(s){return bookings.filter(function(b){return b.status===s;}).length;}
function logTbl(l,empty,pageKey){return tbl(["Time","User","Role","Action","Detail"],l.map(function(e){return [ts(e.t),esc(e.u),e.ro==="none"?"—":ROLE[e.ro],esc(e.a),'<span class="mono">'+esc(e.d)+'</span>'];}),empty||"No activity recorded.",null,pageKey);}
function vDash(){
  var tot=bookings.length,okc=cnt("confirmed")+cnt("completed"),dec=okc+cnt("declined"),rate=dec?Math.round(100*okc/dec):0;
  var ins=logs.filter(function(e){return e.a==="Signed in";}).length,fl=logs.filter(function(e){return e.a==="Failed sign-in"||e.a==="Blocked sign-in";}).length;
  var segs=[["confirmed","var(--ok)"],["completed","var(--pri)"],["pending","var(--warn)"],["declined","var(--bad)"],["cancelled","var(--gray)"]];
  var days=[1,2,3,4,5].map(function(n){return [WD[n],bookings.filter(function(b){return pd(b.date).getDay()===n;}).length];});
  var subs=[];FAC.forEach(function(f){(f.subjects||[]).forEach(function(x){if(subs.indexOf(x)<0)subs.push(x);});});
  var topics=subs.map(function(t){return [t,bookings.filter(function(b){return b.topic===t;}).length];});
  var modes=Object.keys(MODES).map(function(k){return [MODES[k],bookings.filter(function(b){return (b.mode||"face")===k;}).length];});
  var topF=FAC.map(function(f){return [f.name,bookings.filter(function(b){return b.fid===f.id;}).length];}).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  var conc=CONCERNS.map(function(c){return [c,bookings.filter(function(b){return b.concern===c;}).length];});
  var lc=function(a){return logs.filter(function(e){return e.a===a;}).length;},eng=[["Chat messages",chat.length],["Notifications sent",notifs.length],["Reschedule requests",lc("Reschedule requested")],["Reschedule approved",lc("Reschedule approved")]];
  var P=function(t,c){return '<div class="panel"><h2>'+t+'</h2>'+c+'</div>';};
  var h='<h1>Overview</h1><p class="lead">Activity across the consultation system.</p><div class="kpis"><div><b>'+tot+'</b><span>Total requests</span></div><div><b>'+cnt("pending")+'</b><span>Pending</span></div><div><b>'+cnt("confirmed")+'</b><span>Confirmed</span></div><div><b>'+cnt("completed")+'</b><span>Completed</span></div><div><b>'+rate+'%</b><span>Confirmation rate</span></div><div><b>'+bookings.filter(function(b){return b.req;}).length+'</b><span>Reschedule requests</span></div><div><b>'+chat.length+'</b><span>Chat messages</span></div><div><b>'+ins+'</b><span>Sign-ins</span></div><div><b>'+fl+'</b><span>Failed sign-ins</span></div></div>';
  var stat=P("Requests by status",'<div class="stack" role="img" aria-label="Requests by status">'+segs.map(function(g){return '<i style="width:'+(tot?100*cnt(g[0])/tot:0)+'%;background:'+g[1]+'"></i>';}).join("")+'</div><div class="leg">'+segs.map(function(g){return '<span><svg width="10" height="10" aria-hidden="true"><rect width="10" height="10" fill="'+g[1]+'"/></svg> '+g[0].charAt(0).toUpperCase()+g[0].slice(1)+' '+cnt(g[0])+'</span>';}).join("")+'</div>');
  h+='<div class="cols pack"><div class="col">'+stat+P("Requests by concern",bars(conc))+'</div><div class="col">'+P("Requests by consultation type",bars(modes))+P("Engagement",bars(eng))+'</div></div>';
  h+='<div class="cols pack">'+P("Consultations by weekday",bars(days))+P("Most requested faculty",bars(topF))+'</div>';
  h+=P("Requests by subject or course",'<div class="bars2">'+bars(topics)+'</div>')+'<h2>Recent activity</h2>';
  return h+logTbl(logs.slice().reverse().slice(0,6));
}
function mq(b){var q=(st.q||"").trim().toLowerCase();if(!q)return true;var f=fById(b.fid);return [b.ref,b.name,b.sid,f.name,b.topic,b.concern,MODES[b.mode||"face"],b.status].join(" ").toLowerCase().indexOf(q)>-1;}
var PROGRAMS=["BS Computer Science","BS Information Technology","BS Information System","Bachelor of Library and Information Science"];
var ROLEOPTS=[["all","All roles"],["student","Student"],["faculty","Faculty"],["admin","Administrator"]];
var PROGOPTS=[["all","All programs"]].concat(PROGRAMS.map(function(x){return [x,x];}));
function progOf(unit){var t=String(unit||"").toLowerCase();if(/library/.test(t))return PROGRAMS[3];if(/computer science/.test(t))return PROGRAMS[0];if(/information technology/.test(t))return PROGRAMS[1];if(/information system/.test(t))return PROGRAMS[2];return "";}
function lastActor(b){var e=logs.filter(function(x){return x.d===b.ref;}).sort(function(a,c){return a.t<c.t?1:-1;})[0];return e?e.ro:"";}
function logUser(e){return (e.uid&&uById(e.uid))||USERS.filter(function(x){return x.name===e.u;})[0];}
function fbar(qk,qid,ph,filters,clr){return '<div class="tb fbar"><div class="fsearch"><label for="'+qid+'">Search</label><input id="'+qid+'" type="search" data-q="'+qk+'" placeholder="'+ph+'" value="'+esc(st[qk]||"")+'" autocomplete="off"></div>'+filters+'<button type="button" class="btn sm ghost fclr" data-clrf="'+clr+'">Clear filters</button></div>';}
function vAll(){
  var l=sortedNewest(bookings.filter(function(b){var stu=uById(b.sid);return (st.as==="all"||b.status===st.as)&&(st.af==="all"||b.fid===st.af)&&(st.brf==="all"||lastActor(b)===st.brf)&&(st.bpf==="all"||progOf(stu&&stu.unit)===st.bpf)&&mq(b);}));
  var h='<h1>All bookings</h1><p class="lead">Read-only view of every consultation request. Select a row to see its details. '+l.length+' of '+bookings.length+' shown.</p>';
  h+=fbar("q","xq","Name, ID, reference, subject…",sel("as",st.as,STATS,"Status")+sel("af",st.af,[["all","All faculty"]].concat(FAC.map(function(f){return [f.id,f.name];})),"Faculty member")+sel("brf",st.brf,ROLEOPTS,"Last action by")+sel("bpf",st.bpf,PROGOPTS,"Student program"),"bookings");
  return h+tbl(["Reference","Student","Faculty and subject","Date and time","Type","Concern","Status"],l.map(function(b){return ['<span class="mono">'+esc(b.ref)+'</span>',esc(b.name)+'<div class="sub">'+esc(b.sid)+'</div>',esc(fById(b.fid).name)+'<div class="sub">'+esc(b.topic)+'</div>',dtCell(b),MODES[b.mode||"face"],esc(b.concern||"—"),tag(b.status)];}),"No bookings match these filters.",l.map(function(b){return b.id;}),"allBookings");
}
function vLog(){
  var q=(st.lq||"").trim().toLowerCase(),all=logs.slice().reverse();
  var l=all.filter(function(e){
    if(st.lrf!=="all"&&e.ro!==st.lrf)return false;
    if(st.lpf!=="all"){var x=logUser(e);if(!x||progOf(x.unit)!==st.lpf)return false;}
    if(q&&[e.u,e.a,e.d,e.ro==="none"?"":ROLE[e.ro]].join(" ").toLowerCase().indexOf(q)<0)return false;
    return true;
  });
  var h='<h1>Activity log</h1><p class="lead">Sign-ins, bookings and decisions, newest first. '+l.length+' of '+all.length+' entries match'+(l.length>200?" (latest 200 shown)":"")+'.</p>';
  h+=fbar("lq","xlq","User, action or detail…",sel("lrf",st.lrf,ROLEOPTS,"Role")+sel("lpf",st.lpf,PROGOPTS,"Student program"),"log");
  return h+logTbl(l.slice(0,200),"No activity matches these filters.","activityLog");
}
function pwField(id,name,label,ac){return '<label for="'+id+'">'+label+'</label><div class="pwwrap"><input id="'+id+'" name="'+name+'" type="password" autocomplete="'+ac+'"><button type="button" class="eye" data-eye="'+id+'" aria-label="Show password" aria-pressed="false">'+EYE+'</button></div>';}
function vPw(){
  var back=(st.back&&VF[st.back]&&st.back!=="pw"&&canView(st.back))?st.back:VIEWS[st.user.role][0][0];
  return '<div class="pwstage"><form id="pf" class="panel pwcard'+(st.enter?" pop":"")+(st.perr?" shake":"")+'" novalidate><div class="pwicon">'+ic("pw",30)+'</div><h2>Change password</h2><p class="sub" style="margin:0 0 6px">Use 8-72 characters with uppercase, lowercase, number, and symbol.</p>'+(st.pok?'<div class="notice" role="status">'+esc(st.pok)+'</div>':'')+pwField("pc","cur","Current password","current-password")+pwField("p1","n1","New password","new-password")+'<div id="pwcheck">'+pwReqHTML("","")+'</div>'+pwField("p2","n2","Confirm new password","new-password")+'<p class="err" role="alert">'+esc(st.perr||"")+'</p><div class="pwbtns"><button class="btn" type="submit">Update password</button><button class="btn ghost" type="button" data-v="'+back+'">Cancel</button></div></form></div>';
}
function vForcePw(){
  return '<div class="login"><form id="pf" class="panel pwcard'+(st.enter?" pop":"")+(st.perr?" shake":"")+'" novalidate><div class="pwicon">'+ic("pw",30)+'</div><h2>Set a new password</h2><p class="sub" style="margin:0 0 6px">Your account is using a temporary password. Choose a new password before continuing; do not reuse the temporary password.</p><p class="sub" style="margin:0 0 14px">Signed in as <b>'+esc(st.user.name)+'</b> ('+esc(st.user.id)+').</p>'+pwField("pc","cur","Temporary password","current-password")+pwField("p1","n1","New password","new-password")+'<div id="pwcheck">'+pwReqHTML("","")+'</div>'+pwField("p2","n2","Confirm new password","new-password")+'<p class="err" role="alert">'+esc(st.perr||"")+'</p><div class="pwbtns"><button class="btn" type="submit">Update &amp; continue</button><button class="btn ghost" type="button" data-out="1">Log out</button></div></form></div>';
}


function parseCSV(t){
  t=t.replace(/^\uFEFF/,"");
  var first=t.split(/\r?\n/)[0]||"",d=first.indexOf("\t")>-1?"\t":(first.split(";").length>first.split(",").length?";":",");
  var rows=[],row=[],cur="",q=false;
  for(var i=0;i<t.length;i++){var c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;}
    else if(c==='"')q=true;
    else if(c===d){row.push(cur);cur="";}
    else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;row.push(cur);cur="";rows.push(row);row=[];}
    else cur+=c;}
  if(cur!==""||row.length){row.push(cur);rows.push(row);}
  return rows.filter(function(r){return r.some(function(x){return String(x).trim()!=="";});});
}
function handleFile(f){
  if(!f||!st.user||st.user.role!=="admin")return;
  function fail(m){st.imp={name:f.name,err:m};render();}
  function done(tb){previewImport(f.name,tb);}
  if(f.size>2*1024*1024){fail("The file is larger than 2 MB.");return;}
  var n=f.name.toLowerCase(),rd=new FileReader();
  rd.onerror=function(){fail("The file could not be read.");};
  if(/\.xlsx?$/.test(n)){
    if(!window.XLSX){fail("Excel support did not load. Save the sheet as CSV and try again.");return;}
    rd.onload=function(){try{var wb=XLSX.read(rd.result,{type:"array"});done(parseCSV(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])));}catch(x){fail("This spreadsheet could not be read.");}};
    rd.readAsArrayBuffer(f);
  }else{
    rd.onload=function(){var t=String(rd.result);
      if(/\.json$/.test(n)){try{var a=JSON.parse(t);if(!Array.isArray(a))throw 0;var keys=[];a.forEach(function(o){Object.keys(o).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});done([keys].concat(a.map(function(o){return keys.map(function(k){return o[k];});})));}catch(x){fail("JSON must be a list of objects, for example [{\"id\":\"2024-0201\",\"name\":\"Ana Reyes\"}].");}}
      else done(parseCSV(t));};
    rd.readAsText(f);
  }
}
function previewImport(name,tb){
  var seq=++st.impSeq;
  st.imp={name:name,table:tb,loading:true,rows:[],valid:0,invalid:0,err:""};
  render();
  reqJSON("/api/admin/accounts/import/preview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role:st.impRole,table:tb})})
    .then(function(d){
      if(seq!==st.impSeq)return;
      st.imp={name:name,table:tb,loading:false,rows:d.rows||[],hasRoleColumn:d.hasRoleColumn===true,valid:d.valid||0,invalid:d.invalid||0,err:""};
      render();
    })
    .catch(function(err){
      if(seq!==st.impSeq)return;
      st.imp={name:name,table:tb,loading:false,rows:[],valid:0,invalid:0,err:err.message||"The file could not be checked."};
      render();
    });
}
function ensureFacultyProfile(u,subj){
  if(!u||u.role!=="faculty")return null;
  if(!u.fid)u.fid="f-"+String(u.id).toLowerCase().replace(/[^a-z0-9-]/g,"");
  var f=FAC.filter(function(x){return x.id===u.fid;})[0];
  var sb=String(subj||"").split(/[;|]/).map(function(x){return x.trim();}).filter(Boolean);
  if(!f){
    f={id:u.fid,name:u.name,pos:u.unit||"Faculty",subjects:sb.length?sb:[u.unit||"Consultation"],room:"CCS room to be announced",meet:"",days:[1,3],slots:["09:00","10:00"]};
    FAC.push(f);
  }else{
    f.name=u.name||f.name;
    if(u.unit)f.pos=u.unit;
    if(sb.length)f.subjects=sb;
  }
  return f;
}
function mergeServerAccount(a){
  if(!a||!a.id)return null;
  var key=String(a.id).toLowerCase(),u=USERS.filter(function(x){return String(x.id).toLowerCase()===key;})[0];
  if(!u){
    u={id:a.id,name:a.name,role:a.role,unit:a.unit,email:a.email||""};
    USERS.push(u);
  }else{
    u.name=a.name||u.name;
    u.role=a.role||u.role;
    u.unit=a.unit||u.unit;
    if(a.email)u.email=a.email;
  }
  ensureFacultyProfile(u,a.subj||"");
  return u;
}
async function startImport(){
  var s=st.imp;
  if(!s||!s.table||s.busy)return;
  s.busy=true;s.err="";render();
  try{
    var d=await reqJSON("/api/admin/accounts/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role:st.impRole,table:s.table})});
    var created=d.created||[];
    if(!created.length){
      s.busy=false;
      s.rows=d.rows||s.rows;
      s.valid=d.valid||0;
      s.invalid=d.invalid||0;
      render();
      toast("No accounts were imported. Review the preview.");
      return;
    }
    created.forEach(function(a){mergeServerAccount(a);});
    saveU();saveF();
    logEv("Accounts imported",created.length+" from "+s.name);
    st.imp=null;
    st.pwlist=created.map(function(a){return {id:a.id,name:a.name,email:a.email,pw:a.password};});
    render();
    toast(created.length+" account"+(created.length===1?"":"s")+" imported. Temporary password"+(created.length===1?" is":"s are")+" being emailed.");
    try{window.scrollTo({top:0,behavior:"smooth"});}catch(x){}
    refreshMail(true);
    setTimeout(function(){refreshMail(true);},2500);
  }catch(err){
    s.busy=false;
    s.err=err.message||"The import could not be completed.";
    render();
  }
}
function refreshMail(force){
  if(!st.user||st.user.role!=="admin"||st.mailBusy)return;
  if(!force&&st.mail&&Date.now()-st.mail.at<8000)return;
  st.mailBusy=true;
  reqJSON("/api/admin/email-deliveries")
    .then(function(d){
      var changed=false;
      (d.deliveries||[]).forEach(function(m){
        var key=String(m.username||"").toLowerCase(),u=USERS.filter(function(x){return String(x.id).toLowerCase()===key;})[0];
        if(!u&&m.username){
          u=mergeServerAccount({id:m.username,name:m.full_name,role:m.role,unit:m.program,email:m.recipient,subj:""});
          if(u)changed=true;
        }
        if(!u)return;
        if(m.password_set){if(u.setupPending){delete u.setupPending;changed=true;}}
        else if(!u.setupPending){u.setupPending=true;changed=true;}
      });
      if(changed){saveU();saveF();}
      st.mail={at:Date.now(),rows:d.deliveries||[],configured:!!d.mailConfigured,err:""};
    })
    .catch(function(err){
      st.mail={at:Date.now(),rows:(st.mail&&st.mail.rows)||[],configured:(st.mail&&st.mail.configured),err:err.message||"Could not load email delivery status."};
    })
    .then(function(){
      st.mailBusy=false;
      if(st.user&&st.user.role==="admin"&&st.view==="users"&&!st.pwpop&&!st.emailAcct)render();
    });
}
function retryMail(id){
  reqJSON("/api/admin/email-deliveries/"+encodeURIComponent(id)+"/retry",{method:"POST"})
    .then(function(d){
      if(d.password){
        var acct=uById(d.username)||{};
        st.pwlist=[{id:d.username,name:acct.name||d.username,email:d.email||"",pw:d.password}];
        render();
      }
      toast(d.message||"A new temporary password is being emailed.");
      refreshMail(true);
      setTimeout(function(){refreshMail(true);},2500);
    })
    .catch(function(err){toast(err.message||"The email could not be retried.");});
}
function mailChip(s){
  var map={sent:["confirmed","Sent"],failed:["declined","Failed"],pending:["pending","Pending"]},x=map[s]||["pending",s||"Unknown"];
  return '<span class="st s-'+x[0]+'">'+x[1]+'</span>';
}
function mailPanel(){
  var m=st.mail,h='<div class="panel"><div class="chead"><h2>Account email delivery</h2><button type="button" class="btn sm ghost" data-mailrefresh="1">Refresh</button></div>';
  if(!m)return h+'<p class="sub">Loading email status…</p></div>';
  if(m.err)h+='<p class="err" role="alert">'+esc(m.err)+'</p>';
  if(m.configured===false)h+='<p class="hint">Email is not configured yet. Add the SMTP settings to <span class="mono">.env</span>, restart the server, then retry failed deliveries.</p>';
  if(!m.rows.length){
    h+='<p class="sub">No account emails have been queued yet.</p>';
  }else{
    h+=tbl(["Account","Recipient","Status","Attempts","Last result","Action"],m.rows.map(function(d){
      var when=d.status==="sent"?(d.sent_at?ts(d.sent_at):""):(d.updated_at?ts(d.updated_at):"");
      var detail=d.status==="failed"?(d.last_error||"Delivery failed."):(d.status==="pending"?"Waiting to send.":"Delivered.");
      var canSend=!d.password_set||!!d.must_change_password;
      var action=canSend?'<button type="button" class="btn sm ghost" data-retrymail="'+esc(d.id)+'">'+(d.status==="sent"?"New password":"Retry")+'</button>':"—";
      return ['<b>'+esc(d.username)+'</b><div class="sub">'+esc(d.full_name||"")+'</div>',esc(d.recipient),mailChip(d.status)+(when?'<div class="sub">'+esc(when)+'</div>':""),String(d.attempts||0),'<span class="sub">'+esc(detail)+'</span>',action];
    }),"",null,"emailDeliveries");
  }
  h+='<p class="hint">Retrying creates a new temporary password, invalidates the previous one, and emails it again. Accounts are never duplicated. Once a person has changed their password, use <b>Reset password</b> instead.</p>';
  return h+'</div>';
}
function pwPopupHTML(){
  var r=st.pwpop;if(!r)return "";
  var contact=r.emailed
    ?'The new password is being emailed to <b>'+esc(r.email)+'</b>.'
    :(r.email?'Email on file: <b>'+esc(r.email)+'</b>. Share this password securely.':"No email address is on file; share this password securely.");
  return '<div class="ov" data-pwov="1"><div class="dlg pwdlg" role="dialog" aria-modal="true" aria-labelledby="pwtitle"><div class="dhd"><div><h2 id="pwtitle" style="margin:0">Temporary password</h2><span class="mono sub">'+esc(r.id)+'</span></div><button class="x" data-closepw="1" aria-label="Close">×</button></div><p class="sub" style="margin:14px 0 0">A new temporary password was created for <b>'+esc(r.name)+'</b>. '+contact+'</p><div class="pwshow"><span class="mono">'+esc(r.pw)+'</span><button type="button" class="btn sm ghost" data-copypwone="1">Copy</button></div><p class="hint">This password is shown only once. Share it through a secure channel; the account holder must change it on first sign-in.</p><div class="dact"><button type="button" class="btn" data-closepw="1">Done</button></div></div></div>';
}
function emailPopupHTML(){
  var a=st.emailAcct;if(!a)return "";
  var title=a.email?"Edit account email":"Add account email";
  return '<div class="ov" data-emov="1"><div class="dlg emaildlg" role="dialog" aria-modal="true" aria-labelledby="emailtitle"><div class="dhd"><div><h2 id="emailtitle" style="margin:0">'+title+'</h2><span class="mono sub">'+esc(a.id)+'</span></div><button type="button" class="x" data-closeemail="1" aria-label="Close">×</button></div><form id="ef" novalidate><label for="eemail" style="margin-top:14px">Email address</label><input id="eemail" name="email" type="email" autocomplete="email" value="'+esc(a.email)+'"'+(a.busy?" disabled":"")+'><p class="hint">Account emails and temporary passwords will be sent to this address. If the account still needs its first password change, saving will also email a new temporary password.</p><p class="err" role="alert">'+esc(a.err||"")+'</p><div class="dact"><button type="button" class="btn ghost" data-closeemail="1">Cancel</button><button type="submit" class="btn"'+(a.busy?" disabled":"")+'>'+(a.busy?"Saving…":"Save email")+'</button></div></form></div></div>';
}
function resetAcct(id){
  var tu=uById(id);
  if(!tu)return;
  reqJSON("/api/admin/accounts/"+encodeURIComponent(id)+"/reset-password",{method:"POST"})
    .then(function(d){
      if(!d.password)throw new Error("The server did not return a reset password.");
      delete tu.setupPending;
      saveU();
      logEv("Password reset",id);
      st.pwlist=null;
      st.pwpop={id:tu.id,name:tu.name,email:d.email||tu.email||"",emailed:!!d.emailQueued,pw:d.password};
      st.pwfocus=true;
      st.menu=false;
      render();toast("Temporary password created");
      refreshMail(true);
    })
    .catch(function(err){toast(err.message||"The password could not be reset.");});
}
async function saveAcctEmail(f){
  var a=st.emailAcct;
  if(!a||a.busy)return;
  var em=(f.elements.email.value||"").trim();
  a.email=em;a.err="";
  if(!emailOk(em)){a.err="Enter a valid email address.";st.emailFocus=true;render();return;}
  a.busy=true;render();
  try{
    var d=await reqJSON("/api/admin/accounts/"+encodeURIComponent(a.id)+"/email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:em})});
    var acct=d.account||{},u=uById(a.id);
    if(u){u.email=acct.email||em;saveU();}
    else if(acct.id){mergeServerAccount(acct);saveU();}
    logEv("Account email updated",a.id);
    var sendTemp=!!acct.mustChangePassword;
    st.emailAcct=null;st.emailFocus=false;render();
    if(sendTemp){toast("Email saved. Sending a new temporary password…");resetAcct(a.id);}
    else{toast("Email saved for "+a.id+".");refreshMail(true);}
  }catch(err){
    a.busy=false;a.err=err.message||"The email could not be saved.";st.emailFocus=true;render();
  }
}
function pwPanel(){
  var l=st.pwlist;if(!l||!l.length)return "";
  return '<div class="panel" id="pwlist"><div class="chead"><h2>Temporary passwords</h2><button type="button" class="btn sm ghost" data-clrpw="1">Dismiss</button></div><p class="sub" style="margin-top:0">Save or copy these now. Each password is also emailed to the address shown, is displayed only this once, and must be changed on first sign-in.</p>'+tbl(["ID number","Name","Email","Temporary password"],l.map(function(r){return ['<span class="mono">'+esc(r.id)+'</span>',esc(r.name),esc(r.email||"—"),'<span class="mono">'+esc(r.pw)+'</span>'];}),"","","temporaryPasswords")+'<div class="acts"><button class="btn sm" data-copypw="1">Copy all</button></div></div>';
}
function impPanel(){
  var s=st.imp,h='<div class="panel"><h2>Bulk import accounts</h2><p class="sub" style="margin-top:0">Add many students or faculty at once. Accepted files: CSV, TSV, TXT, JSON or Excel (.xlsx, .xls). The first row must be a header with <span class="mono">id, name, email</span> and optionally <span class="mono">role, program, subject</span>. Use the school format <span class="mono">first-two-letters-of-first-name.lastname@my.cspc.edu.ph</span>, e.g. <span class="mono">ma.santos@my.cspc.edu.ph</span>. Do not include passwords: every new account receives a temporary password by email and must change it on first sign-in.</p><div class="tb">'+sel("impRole",st.impRole,[["student","Student"],["faculty","Faculty"],["admin","Administrator"]],"")+'</div>';
  h+='<div class="drop" id="dz"><p><b>Drop a file here</b></p><p class="sub">or</p><label class="btn sm ghost" for="fi" style="margin:0;display:inline-block;cursor:pointer">Choose a file</label><input type="file" id="fi" hidden accept=".csv,.tsv,.txt,.json,.xlsx,.xls"></div>';
  h+='<details><summary>Example CSV</summary><pre class="mono">id,name,email,role,program,subject\n2024-0201,Ana Reyes,an.reyes@my.cspc.edu.ph,student,BS Information Technology,\n2024-0202,Mark Dela Cruz,ma.delacruz@my.cspc.edu.ph,student,BS Computer Science,\nF-1011,Prof. Lea Cruz,le.cruz@my.cspc.edu.ph,faculty,IT Instructor,Operating Systems; Computer Architecture</pre></details>';
  if(s){
    if(s.err)h+='<p class="err" role="alert">'+esc(s.name)+': '+esc(s.err)+'</p><div class="acts"><button class="btn ghost" id="impclr">Clear</button></div>';
    else if(s.loading)h+='<p class="sub" style="margin:12px 0 6px">Checking <b>'+esc(s.name)+'</b> against the existing accounts…</p>';
    else{
      var ok=typeof s.valid==="number"?s.valid:(s.rows||[]).filter(function(r){return r.valid;}).length;
      var bad=typeof s.invalid==="number"?s.invalid:(s.rows||[]).length-ok;
      var importHeaders=["ID number","Name","Email"];
      if(s.hasRoleColumn)importHeaders.push("Role");
      importHeaders.push("Program or position","Subject","Check");
      h+='<p style="margin:12px 0 6px"><b>'+esc(s.name)+'</b>: '+ok+' ready, '+bad+' with problems.</p>'+tbl(importHeaders,(s.rows||[]).map(function(r){var cells=['<span class="mono">'+esc(r.id)+'</span>',esc(r.name),esc(r.email)];if(s.hasRoleColumn)cells.push(ROLE[r.declaredRole||r.role]||"—");cells.push(esc(r.unit),r.subj?esc(r.subj):"—",r.valid?"Ready":'<span style="color:var(--bad)">'+esc(r.err||"Check this row.")+'</span>');return cells;}),"No data rows found.",null,"importPreview");
      h+='<div class="acts">'+(ok?'<button class="btn" id="impgo"'+(s.busy?' disabled':'')+'>'+(s.busy?"Importing…":"Import "+ok+" account"+(ok>1?"s":""))+'</button>':"")+'<button class="btn ghost" id="impclr">Clear</button></div>';
      h+='<p class="hint">The file is checked against SQLite for duplicate IDs, duplicate emails, role mismatches and invalid program values. Only valid rows are imported.</p>';
    }
  }
  return h+'</div>';
}
async function addAcct(f){
  var e=f.elements,nm=e.aname.value.trim(),ro=e.arole.value,un=e.aunit.value.trim(),sj=e.asub.value.trim(),em=e.aemail.value.trim(),m="";
  if(st.user.role!=="admin")return;
  if(ro!=="student"&&ro!=="faculty")m="Only Student or Faculty accounts can be created from this form.";
  else if(!nm||!un||!em)m="Enter the full name, program and email address.";
  else if(!emailOk(em))m="Enter a valid email address.";
  else if(ro==="faculty"&&!sj)m="Enter the subject or course this faculty member handles.";
  st.aerr=m;
  if(m){st.aform={aname:nm,arole:ro,aunit:un,asub:sj,aemail:em};render();return;}
  var btn=f.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent="Generating account…";}
  try{
    var d=await reqJSON("/api/accounts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({full_name:nm,email:em,role:ro,program:un,subject:sj})});
    mergeServerAccount(d.account);
    saveU();saveF();
    logEv("Account created",d.account.id+" ("+ROLE[ro]+") - temporary password email queued");
    st.aerr="";st.aform=null;
    st.pwlist=[{id:d.account.id,name:d.account.name,email:d.account.email,pw:d.account.password}];
    render();
    toast("Account created. User ID and temporary password emailed to "+em+".");
    try{window.scrollTo({top:0,behavior:"smooth"});}catch(x){}
    refreshMail(true);setTimeout(function(){refreshMail(true);},2500);
  }catch(err){
    st.aerr=err.message||"The account could not be created.";
    st.aform={aname:nm,arole:ro,aunit:un,asub:sj,aemail:em};
    render();
  }
}
function vUsers(){
  var A=st.aform||{aid:"",aname:"",arole:"student",aunit:"",asub:"",aemail:""},isF=A.arole==="faculty",q=(st.uq||"").trim().toLowerCase();
  var list=USERS.filter(function(u){
    if(st.urf!=="all"&&u.role!==st.urf)return false;
    if(st.upf!=="all"&&progOf(u.unit)!==st.upf)return false;
    if(q){var sub=u.fid?subjText(fById(u.fid)):"";if([u.id,u.name,u.email||"",ROLE[u.role],u.unit,sub].join(" ").toLowerCase().indexOf(q)<0)return false;}
    return true;
  });
  var h='<h1>Accounts</h1><p class="lead">Accounts are issued by the CCS Admin Office. Import many at once, or add one at a time. New accounts receive a temporary password by email and must change it on first sign-in. Disabling an account blocks sign-in.</p>'+pwPanel()+impPanel()+mailPanel();
  h+='<form id="af" class="panel" novalidate><h2>Add one account</h2><div class="fgrid"><div><label for="nn">Full name</label><input id="nn" name="aname" value="'+esc(A.aname)+'"></div><div><label for="nr">Role</label><select id="nr" name="arole">'+[["student","Student"],["faculty","Faculty"]].map(function(o){return '<option value="'+o[0]+'"'+(A.arole===o[0]?" selected":"")+'>'+o[1]+'</option>';}).join("")+'</select></div><div><label for="nu">Program</label><input id="nu" name="aunit" list="proglist" value="'+esc(A.aunit)+'"><datalist id="proglist">'+PROGRAMS.map(function(x){return '<option value="'+esc(x)+'">';}).join("")+'</datalist></div><div><label for="ne">Email address</label><input id="ne" name="aemail" type="email" autocomplete="email" value="'+esc(A.aemail)+'"><p class="hint">The system generates the User ID and a temporary password and emails them here. The user must change the password on first login.</p></div><div class="fwide" id="subwrap"'+(isF?"":" hidden")+'><label for="ns">Subjects</label><input id="ns" name="asub" placeholder="e.g. Networking; Computer Networks" value="'+esc(A.asub)+'"><p class="hint">Faculty only. Separate multiple subjects with a semicolon (;).</p></div></div><p class="err" role="alert">'+esc(st.aerr||"")+'</p><button class="btn" type="submit">Generate User ID &amp; email temporary password</button></form>';
  h+='<h2 style="margin-top:4px">All accounts</h2><p class="sub" style="margin:0 0 10px">'+list.length+' of '+USERS.length+' shown. Accounts marked “Setup pending” are older accounts that must finish an emailed setup link before they can sign in.</p>'+fbar("uq","xuq","ID, name, email, program or subject…",sel("urf",st.urf,ROLEOPTS,"Role")+sel("upf",st.upf,PROGOPTS,"Program"),"users");
  setTimeout(function(){refreshMail(false);},0);
  return h+tbl(["ID number","Name","Role","Program or position","Status","Actions"],list.map(function(u){
    var off=!!disabled[u.id],meta=[u.email||"No email on file",u.fid?subjText(fById(u.fid)):""].filter(Boolean).join(" · ");
    var status=off?'<span class="st s-declined">Disabled</span>':(u.setupPending?'<span class="st s-pending">Setup pending</span>':'<span class="st s-confirmed">Active</span>');
    return ['<span class="mono">'+esc(u.id)+'</span>',esc(u.name)+'<div class="sub">'+esc(meta)+'</div>',ROLE[u.role],esc(u.unit),status,'<div class="acts">'+(u.id===st.user.id?"":'<button class="btn sm ghost" data-tog="'+esc(u.id)+'">'+(off?"Enable":"Disable")+'</button>')+'<button class="btn sm ghost" data-semail="'+esc(u.id)+'">'+(u.email?"Edit email":"Add email")+'</button><button class="btn sm ghost" data-rsp="'+esc(u.id)+'">Reset password</button></div>'];
  }),"No accounts match these filters.",null,"accounts");
}
var VF={done:vDone,pw:vPw,avail:vAvail,book:vBook,mine:vMine,inbox:vInbox,resched:vResched,chat:vChat,notif:vNotif,dash:vDash,all:vAll,users:vUsers,log:vLog};

function nfHTML(){return '<div class="panel nf"><div class="code404">404</div><h1>Page not found</h1><p class="lead">The page “'+esc(st.nf)+'” does not exist in this system. It may have been moved, or the address may be mistyped.</p><div class="acts"><button class="btn" data-v="'+VIEWS[st.user.role][0][0]+'">Go to my dashboard</button></div></div>';}
function crash(err){
  st.crashed=true;
  $("app").innerHTML='<div class="login"><div class="panel nf"><div class="code404">Error</div><h1>Something went wrong</h1><p class="lead">The page ran into an unexpected problem. Your saved data is safe in this browser.</p><p class="sub mono">'+esc(String(err&&err.message||err||"Unknown error"))+'</p><div class="acts"><button class="btn" data-recover="1">Reload the system</button></div></div></div>';
}
var ICONS={book:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',mine:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',chat:'<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>',notif:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',avail:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',dash:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',all:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 5a3.5 3.5 0 0 1 0 7M22 21c0-3-1.5-4.8-4-5.6"/>',log:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',pw:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',resched:'<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/>'};
function ic(k,sz){sz=sz||22;return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[k]||"")+'</svg>';}
function initials(n){return n.split(/\s+/).filter(function(w){return /^[A-Za-z]/.test(w)&&!/^(Dr|Prof|Engr)\.$/.test(w);}).slice(0,2).map(function(w){return w[0].toUpperCase();}).join("")||"U";}
function ibtn(key,label,n){return '<button class="ibtn" data-menu="'+key+'" aria-haspopup="true" aria-expanded="'+(st.menu===key)+'" aria-label="'+label+(n?" ("+n+" new)":"")+'" title="'+label+'">'+ic(key,20)+(n?'<span class="ib">'+n+'</span>':"")+'</button>';}
function ddNotif(u){
  var rem=reminders(u).slice(0,3),l=notifs.filter(function(n){return n.to===u.id;}).slice().reverse().slice(0,5),nu=unread(u),today=iso(new Date()),tom=iso(new Date(Date.now()+864e5));
  var h='<div class="umenu dd" role="menu"><div class="dhead"><b>Notifications</b><span>'+(nu?nu+" new":"All read")+'</span></div>';
  rem.forEach(function(b){var w=b.date===today?"today":b.date===tom?"tomorrow":"on "+nice(b.date);h+='<button type="button" class="drow rem" role="menuitem" data-gobid="'+b.id+'" title="Open booking details"><span>Reminder: consultation with '+esc(u.role==="student"?fById(b.fid).name:b.name)+' '+w+' at '+t12(b.time)+'.</span></button>';});
  l.forEach(function(n){h+='<button type="button" class="drow'+(n.read?"":" unread")+'" role="menuitem" data-nid="'+n.id+'" title="Open"><span>'+esc(n.text)+'</span><small>'+ts(n.t)+'</small></button>';});
  if(!rem.length&&!l.length)h+='<p class="dempty">You’re all caught up.</p>';
  h+='<button class="dfoot" data-v="notif">View all notifications</button></div>';
  var ch=false;notifs.forEach(function(n){if(n.to===u.id&&!n.read){n.read=true;ch=true;}});if(ch)put(NKEY,notifs.slice(-500));markRemSeen(u);
  return h;
}
function ddChat(u){
  var th=threadsFor(u).slice(0,5),un=unreadMsgs(u),h='<div class="umenu dd" role="menu"><div class="dhead"><b>Messages</b><span>'+(un?un+" unread":"No unread")+'</span></div>';
  th.forEach(function(t){var o=u.role==="student"?fById(t.b.fid).name:t.b.name,last=t.ms.length?t.ms[t.ms.length-1]:null;h+='<button class="drow" role="menuitem" data-openchat="'+t.b.id+'"><span><b>'+esc(o)+'</b>'+(t.un?'<span class="nbadge">'+t.un+'</span>':"")+'<br><span class="sub">'+(last?esc((last.uid===u.id?"You: ":"")+msgPreview(last).slice(0,60)):"No messages yet · "+esc(nice(t.b.date)))+'</span></span><small>'+ts(t.last)+'</small></button>';});
  if(!th.length)h+='<p class="dempty">No conversations yet.</p>';
  return h+'<button class="dfoot" data-v="chat">Open Messages</button></div>';
}
function render(){
  var a=$("app");
  try{
    if(!st.user){st.pwpop=null;st.pwlist=null;st.pwfocus=false;st.emailAcct=null;st.emailFocus=false;a.innerHTML=st.showLogin?loginHTML():landingHTML();var rs=document.querySelector(".roles");if(rs){var ni=rs.getAttribute("data-i");if(rs.style.getPropertyValue("--i")!==ni){void rs.offsetWidth;rs.style.setProperty("--i",ni);}}st.rprev=null;st.inkPrev=null;document.body.style.overflow="";document.body.classList.remove("nav-hidden");clocks();return;}
    if(st.mustChange){st.pwpop=null;st.pwlist=null;st.pwfocus=false;st.emailAcct=null;st.emailFocus=false;a.innerHTML=vForcePw();st.rprev=null;st.inkPrev=null;document.body.style.overflow="";document.body.classList.remove("nav-hidden");clocks();return;}
    var u=st.user,body,pw=(st.view==="pw"&&!st.nf);
    if(st.nf)body=nfHTML();
    else if(!canView(st.view))body='<div class="panel nf"><div class="code404">403</div><h1>Access denied</h1><p class="lead">Your account type does not have permission to open this page.</p><div class="acts"><button class="btn" data-v="'+VIEWS[u.role][0][0]+'">Go to my dashboard</button></div></div>';
    else body=VF[st.view]();
    var ddn=(u.role!=="admin"&&st.menu==="notif")?ddNotif(u):"",ddc=(u.role!=="admin"&&st.menu==="chat")?ddChat(u):"";
    var links=VIEWS[u.role].filter(function(v){return v[2]!==0&&v[0]!=="pw"&&v[0]!=="chat"&&v[0]!=="notif";}).map(function(v){return '<button data-v="'+v[0]+'"'+(v[0]===st.view&&!st.nf?' aria-current="page"':"")+'>'+v[1]+'</button>';}).join("");
    var icons=u.role==="admin"?"":'<div class="usermenu">'+ibtn("notif","Notifications",unread(u)+unseenRem(u))+ddn+'</div><div class="usermenu">'+ibtn("chat","Messages",unreadMsgs(u))+ddc+'</div>';
    var menu=st.menu==="user"?'<div class="umenu" role="menu"><div class="uhead"><b>'+esc(u.name)+'</b><span>'+ROLE[u.role]+' · '+esc(u.id)+'</span></div>'+(u.role==="admin"?"":'<button role="menuitem" data-v="notif">Notifications</button><button role="menuitem" data-v="chat">Messages</button>')+'<button role="menuitem" data-v="pw">Change password</button><hr><button role="menuitem" data-out="1">Log out</button></div>':"";
    var modal=st.detail?detailHTML():"";
    var pwmodal=st.pwpop?pwPopupHTML():"";
    var emailmodal=st.emailAcct?emailPopupHTML():"";
    a.innerHTML='<header class="nb'+(st.navIn?" slide":"")+'"><div class="nbin"><img class="ccslogo lm" src="'+IMG_CCS+'" alt="College of Computer Studies, Camarines Sur Polytechnic Colleges"><img class="ccslogo dm" src="'+IMG_CCSD+'" alt="" aria-hidden="true"><nav class="mainnav" aria-label="Main"><span class="navhl" aria-hidden="true"></span><span class="navink" aria-hidden="true"></span>'+links+'</nav><div class="nbr"><div class="clockbox"><span class="ct" data-ct></span><span class="cd" data-cd></span></div>'+themeSwitch()+icons+'<div class="usermenu"><button class="avatar" data-menu="user" aria-haspopup="true" aria-expanded="'+(st.menu==="user")+'" aria-label="Account menu"><span class="av">'+esc(initials(u.name))+'</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>'+menu+'</div></div></div></header><div class="wrap2"><main class="page'+(st.enter&&!pw?" enter":"")+'">'+body+'</main></div>'+modal+pwmodal+emailmodal;
    st.enter=false;st.navIn=false;document.body.style.overflow=(st.detail||st.pwpop||st.emailAcct)?"hidden":"";if(st.dfocus){var cb=document.querySelector("[data-closedt]");if(cb)cb.focus();st.dfocus=false;}if(st.pwfocus){var pb=document.querySelector("[data-closepw]");if(pb)pb.focus();st.pwfocus=false;}if(st.emailFocus){var eb=$("eemail");if(eb){eb.focus();try{eb.setSelectionRange(eb.value.length,eb.value.length);}catch(x){}}st.emailFocus=false;}st.dnew=false;
    var ink=document.querySelector(".navink"),act=document.querySelector(".mainnav [aria-current=page]");
    if(ink&&act){var L=act.offsetLeft,W=act.offsetWidth;ink.style.left=L+"px";ink.style.width=W+"px";if(st.inkPrev&&(st.inkPrev.l!==L||st.inkPrev.w!==W)&&ink.animate)ink.animate([{left:st.inkPrev.l+"px",width:st.inkPrev.w+"px"},{left:L+"px",width:W+"px"}],{duration:380,easing:"cubic-bezier(.4,0,.2,1)"});st.inkPrev={l:L,w:W};}else{if(ink)ink.style.display="none";st.inkPrev=null;}
    if(st.view==="chat"&&!st.nf){var m=$("msgs");if(m)m.scrollTop=m.scrollHeight;}
    clocks();
  }catch(err){crash(err);}
}
function route(v){
  st.enter=true;st.menu=false;st.detail="";st.pwlist=null;st.pwpop=null;st.pwfocus=false;st.emailAcct=null;st.emailFocus=false;if(v==="pw"&&st.view!=="pw")st.back=st.view;st.err="";st.perr="";st.pok="";st.aerr="";st.aform=null;
  clearAttach();
  if(VF[v]){st.nf="";st.view=v;}else st.nf=v;
  try{history.replaceState(null,"","#/"+v);}catch(x){}
  render();
}
function hashRoute(){var m=/^#\/?([\w-]*)/.exec(location.hash||"");return m?m[1]:"";}
function resetForm(){st.fac=null;st.date=null;st.time=null;st.mode="face";st.err="";st.form={em:"",cn:CONCERNS[0],nt:"",rs:""};st.ff="pending";st.as="all";st.af="all";st.q="";st.brf="all";st.bpf="all";st.lq="";st.lrf="all";st.lpf="all";st.uq="";st.urf="all";st.upf="all";st.pages={};st.aform=null;st.notice="";st.cb=null;st.rb=null;st.rdate=null;st.rtime=null;st.imp=null;st.impSeq=(st.impSeq||0)+1;}

function decide(id,s){
  var b=getB(id);if(!b)return;b.status=s;
  logEv(s==="confirmed"?"Booking confirmed":"Booking declined",b.ref);
  notify(b.sid,"Your consultation request with "+fById(b.fid).name+" on "+nice(b.date)+" at "+t12(b.time)+" was "+(s==="declined"?"rejected":"approved")+".",s,b.id);
  saveAll();render();
}
function cancelB(id){
  var b=getB(id);if(!b)return;b.status="cancelled";delete b.req;logEv("Booking cancelled",b.ref);
  var fu=facUser(b.fid);if(fu)notify(fu.id,b.name+" cancelled the consultation on "+nice(b.date)+" at "+t12(b.time)+".","cancelled",b.id);
  saveAll();render();
}
function completeB(id){
  var b=getB(id);if(!b||b.status!=="confirmed")return;b.status="completed";b.doneAt=new Date().toISOString();delete b.req;logEv("Booking completed",b.ref);
  notify(b.sid,"Your consultation with "+fById(b.fid).name+" on "+nice(b.date)+" at "+t12(b.time)+" was marked as completed.","completed",b.id);
  saveAll();render();
}
function resolveReq(id,yes){
  var b=getB(id);if(!b||!b.req)return;var r=b.req;
  if(yes){if(taken(b.fid,r.date,r.time,b.id)){toast("That time is no longer available.");return;}b.date=r.date;b.time=r.time;}
  delete b.req;
  logEv(yes?"Reschedule approved":"Reschedule declined",b.ref);
  notify(b.sid,yes?"Your reschedule request was approved. New schedule: "+nice(b.date)+" at "+t12(b.time)+".":"Your reschedule request was declined. Your consultation stays on "+nice(b.date)+" at "+t12(b.time)+".",yes?"rescheduled":"declined",b.id);
  saveAll();render();
}
function clearAttach(){
  if(st.attach&&st.attach.length)st.attach.forEach(function(a){try{if(a.preview)URL.revokeObjectURL(a.preview);}catch(x){}});
  st.attach=[];st.attachFor="";
}
function addChatFiles(files){
  var b=getB(st.cb);
  if(!b||!active(b))return;
  if(!st.attach||st.attachFor!==b.id){clearAttach();st.attachFor=b.id;}
  var list=Array.prototype.slice.call(files||[]),added=false;
  for(var i=0;i<list.length;i++){
    var f=list[i],kind=/^image\//i.test(f.type)?"image":(/^video\//i.test(f.type)?"video":"file");
    if(kind==="file"&&!CHAT_FILE_EXT.test(f.name||"")){toast((f.name||"That file")+" is not a supported file type.");continue;}
    if(st.attach.length>=4){toast("You can attach up to 4 files at a time.");break;}
    var max=kind==="video"?25*1024*1024:(kind==="file"?20*1024*1024:8*1024*1024);
    if(f.size>max){toast(f.name+" is too large. "+(kind==="video"?"Videos":kind==="file"?"Files":"Photos")+" must be under "+(kind==="video"?"25":kind==="file"?"20":"8")+" MB.");continue;}
    st.attach.push({file:f,kind:kind,name:f.name||("attachment."+kind),preview:kind==="file"?"":URL.createObjectURL(f)});added=true;
  }
  if(added)render();
}
async function sendMsg(){
  var u=st.user,b=getB(st.cb),i=$("cm"),t=i?i.value.trim():"",files=(st.attachFor===st.cb&&st.attach)?st.attach.slice():[];
  if(!b||!owns(u,b)||!active(b)||(!t&&!files.length))return;
  var btn=document.querySelector("#cf button[type=submit]");
  if(files.length&&btn){btn.disabled=true;btn.textContent="Sending…";}
  var made=[];
  for(var k=0;k<files.length;k++){
    var a=files[k],fd;
    try{
      var r=await fetch("/api/chat-upload",{method:"POST",headers:{"Content-Type":a.file.type||"application/octet-stream","X-File-Name":encodeURIComponent(a.name)},body:a.file});
      if(!r.ok){var e=null;try{e=await r.json();}catch(x){}throw new Error((e&&e.error)||"Upload failed.");}
      fd=await r.json();
    }catch(err){
      toast("Could not send "+a.name+". "+String(err&&err.message||err));
      render();var nb=$("cm");if(nb)nb.focus();
      return;
    }
    made.push({id:rid("m"),bid:b.id,uid:u.id,name:u.name,role:u.role,text:"",t:new Date().toISOString(),media:{url:fd.url,type:fd.type||a.kind,mime:fd.mime||a.file.type,name:fd.name||a.name,size:fd.size||a.file.size}});
  }
  made.forEach(function(m){chat.push(m);});
  if(t)chat.push({id:rid("m"),bid:b.id,uid:u.id,name:u.name,role:u.role,text:t.slice(0,500),t:new Date().toISOString()});
  put(CKEY,chat.slice(-1000));
  clearAttach();
  render();var n=$("cm");if(n)n.focus();
}
async function chPw(f){
  var e=f.elements,cur=e.cur.value,n1=e.n1.value,n2=e.n2.value,m="",forced=!!st.mustChange,pe=pwError(n1);
  if(!cur)m="Enter your current password.";
  else if(pe)m=pe;
  else if(n1!==n2)m="New passwords do not match.";
  else if(n1===cur)m="New password must be different from the current one.";
  st.perr=m;st.pok="";
  if(m){render();return;}
  var btn=f.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent="Updating…";}
  try{
    await reqJSON("/api/account/password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:cur,newPassword:n1})});
    logEv(forced?"Temporary password changed":"Password changed","");
    st.mustChange=false;
    try{sessionStorage.removeItem(TMPKEY);}catch(x){}
    st.perr="";
    if(forced){
      st.pok="";st.view=VIEWS[st.user.role][0][0];st.nf="";st.menu=false;st.detail="";st.enter=true;st.navIn=true;
      try{history.replaceState(null,"","#/"+st.view);}catch(x){}
      toast("Password updated. You can now use the system.");
    }else{
      st.pok="Password updated.";
    }
  }catch(err){st.perr=err.message||"Your password could not be updated.";}
  render();
}
async function doLogin(){
  if(lockLeft()>0){render();return;}
  var id=$("lid").value.trim(),pw=$("lpw").value,u=USERS.filter(function(x){return String(x.id).toLowerCase()===id.toLowerCase();})[0];
  st.lid=id;
  function fail(){
    logEv("Failed sign-in","ID entered: "+(id||"(blank)"),{name:id||"Unknown",role:"none"});
    lock.n=(lock.n||0)+1;
    if(lock.n>=MAXTRY){lock.until=Date.now()+60000;logEv("Sign-in locked","Too many failed attempts",{name:id||"Unknown",role:"none"});st.lerr="";}
    else st.lerr="ID number, password or account type is incorrect. Attempts remaining: "+(MAXTRY-lock.n)+".";
    put(LKKEY,lock);st.lpw="";render();var p=$("lpw");if(p&&!p.disabled)p.focus();
  }
  var authResponse=null,authData={},serverUser=null;
  try {
    authResponse=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:id,password:pw})});
    authData=await authResponse.json().catch(function(){return {};});
    serverUser=authData.user||null;
  } catch(authError) { authResponse=null; }
  if(!authResponse||!authResponse.ok||!serverUser||serverUser.role!==st.lrole){fail();return;}
  if(!u){
    u={id:serverUser.username,name:serverUser.full_name,role:serverUser.role,unit:serverUser.program||""};
    USERS.push(u);
  }else{
    u.name=serverUser.full_name||u.name;
    u.role=serverUser.role||u.role;
    u.unit=serverUser.program||u.unit;
    if(serverUser.email)u.email=serverUser.email;
  }
  ensureFacultyProfile(u,"");
  saveU();if(u.role==="faculty")saveF();
  if(disabled[u.id]){logEv("Blocked sign-in","Account disabled",u);st.lerr="This account is disabled. Contact the CCS Admin Office.";render();return;}
  lock={n:0,until:0};put(LKKEY,lock);
  delete u.setupPending;
  st.user=u;st.mustChange=!!serverUser.mustChangePassword;st.showpw=false;st.menu=false;st.lerr="";st.lid="";st.lpw="";st.mail=null;st.perr="";st.pok="";resetForm();st.nf="";st.crashed=false;st.enter=true;st.navIn=true;
  var hv=hashRoute();st.view=VIEWS[u.role][0][0];if(hv&&VF[hv]&&canView(hv))st.view=hv;
  try{sessionStorage.setItem(SKEY,u.id);if(st.mustChange)sessionStorage.setItem(TMPKEY,"1");else sessionStorage.removeItem(TMPKEY);history.replaceState(null,"","#/"+st.view);}catch(x){}
  logEv("Signed in","",u);window.scrollTo(0,0);render();
}

document.addEventListener("submit",function(e){
  var fid=e.target.getAttribute("id");
  if(fid==="lf"){e.preventDefault();doLogin();return;}
  if(!st.user)return;
  if(fid==="af"){e.preventDefault();addAcct(e.target);}
  else if(fid==="ef"){e.preventDefault();saveAcctEmail(e.target);}
  else if(fid==="pf"){e.preventDefault();chPw(e.target);}
  else if(fid==="cf"){e.preventDefault();sendMsg();}
});
document.addEventListener("input",function(e){
  var t=e.target,k=t.dataset&&t.dataset.k;if(k){st.form[k]=t.value;if(k==="sj")render();}
  if(t.id==="p1"||t.id==="p2"){var pc=$("pwcheck");if(pc){var q1=$("p1"),q2=$("p2");pc.innerHTML=pwReqHTML(q1?q1.value:"",q2?q2.value:"");}}
  if(t.dataset&&t.dataset.q){st[t.dataset.q]=t.value;var pageKey={q:"allBookings",lq:"activityLog",uq:"accounts"}[t.dataset.q];if(pageKey)st.pages[pageKey]=1;render();var qi=$(t.id);if(qi){qi.focus();try{qi.setSelectionRange(qi.value.length,qi.value.length);}catch(x){}}}
});
document.addEventListener("change",function(e){
  var t=e.target,d=t.dataset||{};
  if(t.id==="cfile"){addChatFiles(t.files);t.value="";return;}
  if(t.id==="fi"){handleFile(t.files[0]);t.value="";return;}
  if(t.id==="nr"){var sw=$("subwrap");if(sw)sw.hidden=(t.value!=="faculty");return;}
  if(d.s){
    st[d.s]=t.value;
    var pageKey={ff:"facultyInbox",as:"allBookings",af:"allBookings",brf:"allBookings",bpf:"allBookings",lrf:"activityLog",lpf:"activityLog",urf:"accounts",upf:"accounts"}[d.s];
    if(pageKey)st.pages[pageKey]=1;
    if(d.s==="impRole")st.pages.importPreview=1;
    if(d.s==="impRole"&&st.imp&&st.imp.table)previewImport(st.imp.name,st.imp.table);
    else render();
    return;
  }
  if(d.s2&&st.user&&st.user.role==="faculty"){
    var fr=fById(st.user.fid),v=t.value.trim();
    if(d.s2==="room"){if(v){fr.room=v;saveF();toast("Room saved");}else t.value=fr.room;}
    else if(d.s2==="meet"){if(!v){fr.meet="";saveF();toast("Meeting link removed");}else if(okMeet(v)){fr.meet=v;saveF();toast("Meeting link saved");}else{toast("Enter a valid Google Meet link, like https://meet.google.com/abc-defg-hij");t.value=fr.meet||"";}}
  }
});
document.addEventListener("dragover",function(e){e.preventDefault();var z=e.target.closest&&e.target.closest("#dz");if(z)z.classList.add("over");});
document.addEventListener("dragleave",function(e){var z=e.target.closest&&e.target.closest("#dz");if(z)z.classList.remove("over");});
document.addEventListener("drop",function(e){
  e.preventDefault();var z=e.target.closest&&e.target.closest("#dz");
  if(z){z.classList.remove("over");if(e.dataTransfer&&e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0]);}
});
document.addEventListener("click",function(e){
  if(st.user)return;
  var r=e.target.closest("[data-lr]");
  if(!r)return;
  var li=$("lid");if(li)st.lid=li.value;
  if(r){st.rprev=["student","faculty","admin"].indexOf(st.lrole);st.lrole=r.dataset.lr;st.lid="";st.lpw="";st.lerr="";}
  render();
});
document.addEventListener("click",function(e){
  if(st.user)return;
  var t=e.target,go=t.closest&&t.closest("[data-lgo]");
  var home=t.closest&&(t.closest("[data-home]")||t.closest("[data-logo]"));
  var feat=t.closest&&t.closest("[data-lfeat]");
  if(go){st.showLogin=true;st.lerr="";render();window.scrollTo(0,0);var fi=$("lid");if(fi&&!fi.disabled)setTimeout(function(){fi.focus();},80);return;}
  if(home){st.showLogin=false;st.lerr="";st.lid="";st.lpw="";render();window.scrollTo(0,0);return;}
  if(feat){var fs=$("feat");if(fs)fs.scrollIntoView({behavior:"smooth",block:"start"});return;}
});
document.addEventListener("click",function(e){
  var el=e.target.closest("button");if(!el)return;
  var d=el.dataset;
  if(d.recover){st.crashed=false;st.nf="";if(st.user)st.view=VIEWS[st.user.role][0][0];render();return;}
  if(!st.user)return;
  var u=st.user,id,b;
  if(d.pageSet&&d.pageKey){var page=Number(d.pageSet);if(Number.isInteger(page)&&page>0){st.pages[d.pageKey]=page;render();}return;}
  if(d.out){fetch("/api/logout",{method:"POST"}).catch(function(){});logEv("Signed out","");st.menu=false;st.detail="";st.pwpop=null;st.pwlist=null;st.emailAcct=null;st.emailFocus=false;st.user=null;st.mustChange=false;st.mail=null;clearAttach();resetForm();try{sessionStorage.removeItem(SKEY);sessionStorage.removeItem(TMPKEY);history.replaceState(null,"",location.pathname+location.search);}catch(x){}render();return;}
  if(d.menu){st.menu=(st.menu===d.menu)?"":d.menu;render();return;}
  if(d.nid){openNotif(d.nid);return;}
  if(d.gobid){gotoBooking(d.gobid);return;}
  if(d.mailrefresh&&u.role==="admin"){refreshMail(true);return;}
  if(d.retrymail&&u.role==="admin"){retryMail(d.retrymail);return;}
  if(d.v){route(d.v);return;}
  if(d.f&&canView("book")){st.fac=d.f;st.form.sj="";st.date=null;st.time=null;st.err="";render();}
  else if(d.d&&canView("book")){st.date=d.d;st.time=null;st.err="";render();}
  else if(d.t&&canView("book")){st.time=d.t;st.err="";render();}
  else if(d.m&&canView("book")&&MODES[d.m]){st.mode=d.m;render();}
  else if(d.rd&&canView("resched")){st.rdate=d.rd;st.rtime=null;st.err="";render();}
  else if(d.rt&&canView("resched")){st.rtime=d.rt;st.err="";render();}
  else if(d.rs2&&canView("resched")){b=getB(d.rs2);if(owns(u,b)&&active(b)){st.rb=b.id;st.rdate=null;st.rtime=null;st.form.rs="";route("resched");}}
  else if(d.openchat&&canView("chat")){b=getB(d.openchat);if(owns(u,b)){st.cb=b.id;route("chat");}}
  else if(d.th&&canView("chat")){b=getB(d.th);if(owns(u,b)){st.cb=b.id;clearAttach();render();}}
  else if(d.rmatt!==undefined){var ai=+d.rmatt,arr=st.attach||[];if(arr[ai]){try{if(arr[ai].preview)URL.revokeObjectURL(arr[ai].preview);}catch(x){}arr.splice(ai,1);}if(!arr.length)st.attachFor="";render();}
  else if(d.wd||d.sl){if(u.role==="faculty"){var fa=fById(u.fid),arr=d.wd?fa.days:fa.slots,val=d.wd?+d.wd:d.sl,ix=arr.indexOf(val);if(ix>-1&&arr.length>1)arr.splice(ix,1);else if(ix<0)arr.push(val);else toast("Keep at least one day and one time.");arr.sort(function(a,b){return a<b?-1:a>b?1:0;});saveF();logEv("Availability updated","");render();}}
  else if(d.semail){id=d.semail;if(u.role==="admin"){var eu=uById(id);if(eu){st.emailAcct={id:eu.id,name:eu.name,email:eu.email||"",err:"",busy:false};st.emailFocus=true;st.menu=false;render();}}}
  else if(d.closeemail){st.emailAcct=null;st.emailFocus=false;render();}
  else if(d.rsp){id=d.rsp;if(u.role==="admin"&&uById(id))resetAcct(id);}
  else if(d.copypw){var tx=(st.pwlist||[]).map(function(r){return r.id+"\t"+r.name+"\t"+(r.email||"")+"\t"+r.pw;}).join("\n");copyText(tx);}
  else if(d.copypwone){if(st.pwpop)copyText(st.pwpop.pw,"Password copied");}
  else if(d.closepw){st.pwpop=null;st.pwfocus=false;render();}
  else if(d.clrpw){st.pwlist=null;render();}
  else if(d.done){b=getB(d.done);if(u.role==="faculty"&&b&&b.fid===u.fid&&b.status==="confirmed"){completeB(b.id);toast("Consultation marked as done");}}
  else if(d.cancel){b=getB(d.cancel);if(u.role==="student"&&b&&b.sid===u.id&&active(b)){cancelB(b.id);toast("Booking cancelled");}}
  else if(d.ok||d.no){b=getB(d.ok||d.no);if(u.role==="faculty"&&b&&b.fid===u.fid&&b.status==="pending"){var yes=!!d.ok;decide(b.id,yes?"confirmed":"declined");toast(yes?"Consultation confirmed":"Request declined");}}
  else if(d.appr||d.keep){b=getB(d.appr||d.keep);if(u.role==="faculty"&&b&&b.fid===u.fid&&b.req){resolveReq(b.id,!!d.appr);}}
  else if(d.clrf&&u.role==="admin"){var K={bookings:{as:"all",af:"all",brf:"all",bpf:"all",q:""},log:{lq:"",lrf:"all",lpf:"all"},users:{uq:"",urf:"all",upf:"all"}}[d.clrf];if(K){Object.keys(K).forEach(function(k){st[k]=K[k];});var pageKey={bookings:"allBookings",log:"activityLog",users:"accounts"}[d.clrf];if(pageKey)st.pages[pageKey]=1;render();}}
  else if(d.tog){id=d.tog;if(u.role==="admin"&&id!==u.id&&uById(id)){disabled[id]=!disabled[id];if(!disabled[id])delete disabled[id];put(DKEY,disabled);logEv(disabled[id]?"Account disabled":"Account enabled",id);render();toast("Account updated");}}
  else if(el.id==="impclr"&&u.role==="admin"){st.imp=null;st.impSeq=(st.impSeq||0)+1;render();}
  else if(el.id==="impgo"&&u.role==="admin"){startImport();}
  else if(el.id==="go"&&u.role==="student"){
    var F=st.form,em="",msg="";
    if(!st.fac)msg="Choose a faculty member.";
    else if(!st.date||!st.time)msg="Select a date and an open time.";
    else if(taken(st.fac,st.date,st.time))msg="That time was just booked by someone else. Select another time.";
    else if(clash(u.id,st.date,st.time))msg="You already have a consultation at that date and time.";
    if(msg){st.err=msg;var er=$("err");if(er)er.textContent=msg;return;}
    var nb={id:rid("b"),ref:mkref(st.date),fid:st.fac,date:st.date,time:st.time,sid:u.id,name:u.name,email:em,topic:(fById(st.fac).subjects.indexOf(F.sj)>-1?F.sj:fById(st.fac).subjects[0]),concern:F.cn,note:F.nt.trim(),mode:st.mode,status:"pending",created:new Date().toISOString()};
    bookings.push(nb);logEv("Booking requested",nb.ref);
    notify((facUser(nb.fid)||{}).id,"New consultation request from "+u.name+" on "+nice(nb.date)+" at "+t12(nb.time)+" ("+MODES[nb.mode]+").","pending",nb.id);
    saveAll();var fn=fById(nb.fid).name;resetForm();st.notice="Request sent to "+fn+". Your reference number is "+nb.ref+".";route("mine");
  }
  else if(el.id==="rsub"&&canView("resched")){
    b=getB(st.rb);var msg2="",stu=u.role==="student";
    if(!b||!owns(u,b)||!active(b))msg2="This booking can no longer be rescheduled.";
    else if(stu&&b.req)msg2="You already have a pending change request.";
    else if(!st.rdate||!st.rtime)msg2="Select a new date and time.";
    else if(st.rdate===b.date&&st.rtime===b.time)msg2="Choose a time different from the current one.";
    else if(taken(b.fid,st.rdate,st.rtime,b.id))msg2="That time is no longer available.";
    else if(clash(b.sid,st.rdate,st.rtime,b.id))msg2="The student already has a consultation at that time.";
    if(msg2){st.err=msg2;var er2=$("rerr");if(er2)er2.textContent=msg2;return;}
    var rs=st.form.rs.trim(),f2=fById(b.fid);
    if(stu){
      b.req={date:st.rdate,time:st.rtime,reason:rs,at:new Date().toISOString()};logEv("Reschedule requested",b.ref);
      notify((facUser(b.fid)||{}).id,u.name+" asked to move the consultation from "+nice(b.date)+" "+t12(b.time)+" to "+nice(st.rdate)+" "+t12(st.rtime)+".","reschedule",b.id);
      saveAll();resetForm();st.notice="Reschedule request sent to "+f2.name+". Your current schedule stays until it is approved.";route("mine");
    }else{
      b.date=st.rdate;b.time=st.rtime;delete b.req;logEv("Rescheduled by faculty",b.ref);
      notify(b.sid,f2.name+" rescheduled your consultation to "+nice(b.date)+" at "+t12(b.time)+"."+(rs?" Reason: "+rs:""),"rescheduled",b.id);
      saveAll();resetForm();st.notice="Consultation moved. "+b.name+" has been notified.";route("inbox");
    }
  }
});
window.addEventListener("hashchange",function(){
  if(!st.user)return;var v=hashRoute();
  if(!v){st.nf="";st.view=VIEWS[st.user.role][0][0];}else if(VF[v]){st.nf="";st.view=v;}else st.nf=v;
  render();
});
window.addEventListener("storage",function(e){
  if(!e.key||e.key.indexOf("sis-")!==0||e.key===SKEY)return;
  bookings=load(KEY,bookings);logs=load(LKEY,logs);chat=load(CKEY,chat);notifs=load(NKEY,notifs);reads=load(RKEY,reads);disabled=load(DKEY,disabled);USERS=load(UKEY,USERS);FAC=load(FKEY,FAC);if(!load(UKEY,null))put(UKEY,USERS);if(!load(FKEY,null))put(FKEY,FAC);
  if(st.user){var nu=uById(st.user.id);if(nu)st.user=nu;}
  var a=document.activeElement;if(st.user){if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))refreshBadges();else render();}
});
window.addEventListener("error",function(e){if(e.error&&!st.crashed)crash(e.error);});
window.addEventListener("unhandledrejection",function(e){if(!st.crashed)crash(e.reason);});


document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-theme-toggle]");if(!b)return;
  var n=theme()==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",n);try{localStorage.setItem(TKEY,n);}catch(x){}
  if(!st.user){var li=$("lid"),lp=$("lpw");if(li)st.lid=li.value;if(lp)st.lpw=lp.value;}
  var root=document.documentElement;root.classList.add("theme-anim");b.setAttribute("aria-checked",String(n==="dark"));
  setTimeout(function(){render();setTimeout(function(){root.classList.remove("theme-anim");},60);},380);
});
function moveHl(btn){var hl=btn.parentNode.querySelector(".navhl");if(!hl)return;
  function ap(){hl.style.width=btn.offsetWidth+"px";hl.style.height=btn.offsetHeight+"px";hl.style.transform="translate("+btn.offsetLeft+"px,"+btn.offsetTop+"px)";}
  if(hl.style.opacity!=="1"){hl.style.transition="none";ap();void hl.offsetWidth;hl.style.transition="";hl.style.opacity="1";}else ap();}
function roleOver(r){var c=r.parentNode,bs=[].slice.call(c.querySelectorAll(".rbtn"));c.style.setProperty("--h",bs.indexOf(r));c.setAttribute("data-hov","1");bs.forEach(function(x){x.classList.toggle("hov",x===r);});}
function roleOut(c){c.style.removeProperty("--h");c.removeAttribute("data-hov");c.querySelectorAll(".rbtn").forEach(function(x){x.classList.remove("hov");});}
function hoverIn(e){var t=e.target;if(!t.closest)return;var b=t.closest(".mainnav button");if(b)moveHl(b);var r=t.closest(".rbtn");if(r)roleOver(r);}
function hoverOut(e){var t=e.target;if(!t.closest)return;var sd=t.closest(".mainnav");if(sd&&!(e.relatedTarget&&sd.contains(e.relatedTarget))){var h=sd.querySelector(".navhl");if(h)h.style.opacity="0";}var c=t.closest(".roles");if(c&&!(e.relatedTarget&&c.contains(e.relatedTarget)))roleOut(c);}
document.addEventListener("mouseover",hoverIn);document.addEventListener("focusin",hoverIn);
document.addEventListener("mouseout",hoverOut);document.addEventListener("focusout",hoverOut);
function tick(){
  clocks();
  if(!st.user){var l=lockLeft(),er=$("lerr"),bt=$("lbtn");
    if(l>0){if(er)er.textContent=lockMsg(l);}
    else if(bt&&bt.disabled){st.lerr="";render();}}
}
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-eye]");
  if(b){var i=$(b.dataset.eye);if(i){var show=i.type==="password";i.type=show?"text":"password";b.setAttribute("aria-pressed",String(show));b.setAttribute("aria-label",(show?"Hide":"Show")+" password");b.innerHTML=show?EYEOFF:EYE;if(b.dataset.eye==="lpw")st.showpw=show;}return;}
  if(st.menu&&!(e.target.closest&&e.target.closest(".usermenu"))){st.menu=false;render();}
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){if(st.emailAcct){st.emailAcct=null;st.emailFocus=false;render();}else if(st.pwpop){st.pwpop=null;st.pwfocus=false;render();}else if(st.detail){closeDetail();}else if(st.menu){st.menu=false;render();}return;}
  if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("tr[data-bid]")){e.preventDefault();openDetail(e.target.dataset.bid);}
});
document.addEventListener("click",function(e){
  if(!st.user)return;var t=e.target;if(!t.closest)return;
  if(t.classList.contains("ov")){if(st.emailAcct){st.emailAcct=null;st.emailFocus=false;render();return;}if(st.pwpop){st.pwpop=null;st.pwfocus=false;render();return;}if(st.detail){closeDetail();return;}}
  if(t.closest("[data-closedt]")){closeDetail();return;}
  var tr=t.closest("tr[data-bid]");
  if(tr&&!t.closest("button,a,input,select,textarea,label"))openDetail(tr.dataset.bid);
});
var lastY=window.pageYOffset||0,tickingS=false;
function onScroll(){
  if(tickingS)return;tickingS=true;
  requestAnimationFrame(function(){
    tickingS=false;
    var y=Math.max(0,window.pageYOffset||document.documentElement.scrollTop||0),tt=$("totop");
    if(tt)tt.classList.toggle("show",y>320);
    var nb=document.querySelector(".nb"),h=nb?nb.offsetHeight:0,d=y-lastY;
    if(!st.user||!nb||st.menu||y<=h){document.body.classList.remove("nav-hidden");lastY=y;return;}
    if(d>8){document.body.classList.add("nav-hidden");lastY=y;}
    else if(d<-8){document.body.classList.remove("nav-hidden");lastY=y;}
  });
}
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll);
document.addEventListener("focusin",function(e){if(e.target.closest&&e.target.closest(".nb"))document.body.classList.remove("nav-hidden");});
$("totop").addEventListener("click",function(){var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;window.scrollTo({top:0,behavior:rm?"auto":"smooth"});});
function setBadge(q,n){var b=document.querySelector(q);if(!b)return;var ib=b.querySelector(".ib");if(n>0){if(!ib){ib=document.createElement("span");ib.className="ib";b.appendChild(ib);}ib.textContent=n;}else if(ib)ib.remove();}
function refreshBadges(){var u=st.user;if(!u||u.role==="admin")return;setBadge('.ibtn[data-menu="notif"]',unread(u)+unseenRem(u));setBadge('.ibtn[data-menu="chat"]',unreadMsgs(u));}
setInterval(tick,1000);
if(st.user){var hv0=hashRoute();if(hv0){if(VF[hv0])st.view=hv0;else st.nf=hv0;}}
render();
if(st.user){
  fetch("/api/session",{credentials:"same-origin"}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!st.user||!d)return;
    if(!d.user||d.user.username!==st.user.id||d.user.role!==st.user.role){expireClientSession();return;}
    var forced=!!d.user.mustChangePassword;
    if(st.mustChange===forced)return;
    st.mustChange=forced;
    try{if(forced)sessionStorage.setItem(TMPKEY,"1");else sessionStorage.removeItem(TMPKEY);}catch(x){}
    render();
  }).catch(function(){});
}
})();
