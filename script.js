const $ = (s, c=document)=>c.querySelector(s);
const $$ = (s, c=document)=>[...c.querySelectorAll(s)];

/* ===== Data layer (localStorage) ===== */
const DB_KEY='bin_khalifa_db_v1', PASS_KEY='bin_khalifa_pass', ROLE_KEY='bin_khalifa_role';
const WA_NUMBER='201125138138';

const DEFAULTS = {
  products:[
    {id:'p1',kind:'product',cat:'milk',name:'لبن طازج',desc:'حليب كامل الدسم مبستر على البارد من مزرعتنا.',price:15,unit:'لتر'},
    {id:'p2',kind:'product',cat:'milk',name:'لبن قليل الدسم',desc:'نفس الطعامة بخيار أخف يومي.',price:15,unit:'لتر'},
    {id:'p3',kind:'product',cat:'cheese',name:'لبنة بلدية',desc:'كثيفة ومالحة قليلاً من لبن رائب طبيعي.',price:35,unit:'علبة'},
    {id:'p4',kind:'product',cat:'cheese',name:'جبن أبيض',desc:'طري ومتجانس للساندوتش الصباحي.',price:45,unit:'كجم'},
    {id:'p5',kind:'product',cat:'cheese',name:'زبادي بلدي',desc:'مخملي بدون سكر مضاف.',price:12,unit:'كوب'},
    {id:'p6',kind:'product',cat:'fresh',name:'قشطة الخليفه',desc:'طبقة ذهبية غنية بوصفة الجدّة.',price:25,unit:'علبة'},
    {id:'p7',kind:'product',cat:'fresh',name:'عيران مثلّج',desc:'منعش ومالح، سرّ السحور.',price:10,unit:'زجاجة'},
    {id:'p8',kind:'product',cat:'fresh',name:'سمن بلدي',desc:'سمن جاموسي أصيل برائحة البيت.',price:40,unit:'علبة'},
  ],
  cafe:[
    {id:'c1',kind:'drink',name:'لاتيه بن الخليفه',desc:'إسبريسو مزدوج + حليب مبخّر',price:45},
    {id:'c2',kind:'drink',name:'قهوة تركي',desc:'تُسوى على الرمل',price:25},
    {id:'c3',kind:'drink',name:'إسبريسو مزدوج',desc:'تحميص غامق',price:30},
    {id:'c4',kind:'drink',name:'كابتشينو باللبن الجاموسي',desc:'وصفتنا المميزة',price:40},
    {id:'c5',kind:'drink',name:'شاي بالنعناع',desc:'نعناع طازج',price:15},
    {id:'c6',kind:'drink',name:'كركديه مثلّج',desc:'منعش',price:25},
    {id:'c7',kind:'drink',name:'شوكولاتة ساخنة',desc:'كاكاو داكن + حليب',price:40},
    {id:'c8',kind:'drink',name:'عصير برتقال فريش',desc:'يُعصر عند الطلب',price:35},
    {id:'f1',kind:'food',name:'فول مدمس بالزيت الحار',desc:'على الطريقة البلدية',price:30},
    {id:'f2',kind:'food',name:'طعمية بلدي',desc:'مقرمشة ساخنة',price:25},
    {id:'f3',kind:'food',name:'كبدة إسكندراني',desc:'بالفلفل الحار',price:45},
    {id:'f4',kind:'food',name:'حواوشي بلدي',desc:'لحمة مفرومة بالبهارات',price:55},
    {id:'f5',kind:'food',name:'حمص بالطحينة',desc:'زيت زيتون وليمون',price:30},
  ]
};

function loadDB(){
  try{ const raw=localStorage.getItem(DB_KEY); if(raw){ return JSON.parse(raw);} }catch(e){}
  const copy=JSON.parse(JSON.stringify(DEFAULTS));
  localStorage.setItem(DB_KEY,JSON.stringify(copy));
  return copy;
}
function saveDB(db){ localStorage.setItem(DB_KEY,JSON.stringify(db)); }
let DB = loadDB();
let ROLE = localStorage.getItem(ROLE_KEY) || null; // 'buyer' | 'admin'
let editingId = null;

const isAdmin = ()=> ROLE==='admin';

/* ===== Role gate ===== */
const gate=$('#roleGate'), passOverlay=$('#passOverlay');
function showGate(){ gate.classList.remove('hide'); }
function hideGate(){ gate.classList.add('hide'); }
function setRole(r){
  ROLE=r; localStorage.setItem(ROLE_KEY,r);
  applyRole(); hideGate();
}
function applyRole(){
  const admin=isAdmin();
  $('#adminBar').hidden=!admin;
  $('#modeBadge').textContent = admin ? '🛠️ وضع المدير — تحكم كامل' : 'طازج من المصنع كل يوم';
  $('#buyerNote').textContent = admin
    ? 'وضع المدير: تقدر تضيف / تعدّل / تحذف أي صنف — التغييرات بتتحفظ تلقائياً.'
    : 'وضع المشتري: العرض فقط — للطلب ابعتلنا على واتساب.';
  renderAll();
  if(!ROLE) showGate(); else hideGate();
}

$('#enterBuyer').addEventListener('click',()=>setRole('buyer'));
$('#enterStaff').addEventListener('click',()=>{ passOverlay.hidden=false; setTimeout(()=>$('#passInput').focus(),100); });
$('#roleSwitch').addEventListener('click',()=>{ showGate(); });
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{ $('#'+b.dataset.close).hidden=true; }));

function getPass(){ return localStorage.getItem(PASS_KEY)||'1234'; }
$('#passGo').addEventListener('click',tryLogin);
$('#passInput').addEventListener('keydown',e=>{ if(e.key==='Enter') tryLogin(); });
function tryLogin(){
  const v=$('#passInput').value.trim();
  if(v===getPass()){ passOverlay.hidden=true; $('#passInput').value=''; $('#passErr').textContent=''; setRole('admin'); }
  else $('#passErr').textContent='كلمة السر غلط — جرّب 1234';
}

$('#exitAdminBtn').addEventListener('click',()=>setRole('buyer'));
$('#changePassBtn').addEventListener('click',()=>{
  const n=prompt('اكتب كلمة السر الجديدة للموظفين:');
  if(n&&n.trim().length>=3){ localStorage.setItem(PASS_KEY,n.trim()); alert('تم تغيير كلمة السر ✅'); }
});
$('#resetBtn').addEventListener('click',()=>{
  if(confirm('ترجع المنيو للافتراضي؟')){ DB=JSON.parse(JSON.stringify(DEFAULTS)); saveDB(DB); renderAll(); }
});

/* ===== Render ===== */
function price(n){ return Number(n).toLocaleString('ar-EG'); }
let activeFilter='all';

function renderAll(){ renderProducts(); renderCafe(); renderTicker(); }

function renderProducts(){
  const wrap=$('#cards'); wrap.innerHTML='';
  const list=DB.products.filter(p=>activeFilter==='all'||p.cat===activeFilter);
  if(!list.length){ wrap.innerHTML='<p class="empty">لا توجد أصناف هنا بعد — المدير يقدر يضيف من فوق.</p>'; return; }
  list.forEach(p=>{
    const el=document.createElement('article');
    el.className='card';
    el.innerHTML=`
      <div class="card-tools" ${isAdmin()?'':'hidden'}>
        <button class="tool edit">تعديل</button>
        <button class="tool del">حذف</button>
      </div>
      <div class="card-art"><span style="font-size:3rem">${p.cat==='milk'?'🥛':p.cat==='cheese'?'🧀':'🍶'}</span></div>
      <div class="card-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.desc||'')}</p>
        <div class="card-foot">
          <span class="price">${price(p.price)} <small>/ ${escapeHtml(p.unit||'')}</small></span>
          <button class="link-btn">أضف للطلب</button>
        </div>
      </div>`;
    el.querySelector('.link-btn').addEventListener('click',()=>{
      const area=$('#orderForm textarea');
      area.value=(area.value?area.value+'\n':'')+'أرغب في: '+p.name+' ('+p.price+' ج.م)';
      $('#contact').scrollIntoView({behavior:'smooth'});
    });
    if(isAdmin()){
      el.querySelector('.edit').addEventListener('click',()=>openEditor(p));
      el.querySelector('.del').addEventListener('click',()=>{
        if(confirm('تحذف "'+p.name+'"؟')){ DB.products=DB.products.filter(x=>x.id!==p.id); saveDB(DB); renderAll(); }
      });
    }
    wrap.appendChild(el);
  });
}

function renderCafe(){
  const dWrap=$('#cafeDrinks'), fWrap=$('#cafeFoods');
  dWrap.innerHTML=''; fWrap.innerHTML='';
  const drinks=DB.cafe.filter(x=>x.kind==='drink');
  const foods=DB.cafe.filter(x=>x.kind==='food');
  $('#cafeCount').textContent=`عندنا ${drinks.length} مشروب وقهوة + ${foods.length} صنف أكل — بتتحدث لحظياً من المدير.`;
  const mk=(item)=>{
    const div=document.createElement('div');
    div.className='menu-item';
    div.innerHTML=`<div class="mi-info"><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.desc||'')}</p></div><span class="dots"></span><span class="m-price">${price(item.price)}</span>
    <span class="mi-tools" ${isAdmin()?'':'hidden'}><button class="tool edit">✏️</button><button class="tool del">🗑️</button></span>`;
    if(isAdmin()){
      div.querySelector('.edit').addEventListener('click',()=>openEditor(item));
      div.querySelector('.del').addEventListener('click',()=>{
        if(confirm('تحذف "'+item.name+'"؟')){ DB.cafe=DB.cafe.filter(x=>x.id!==item.id); saveDB(DB); renderAll(); }
      });
    }
    return div;
  };
  drinks.forEach(i=>dWrap.appendChild(mk(i)));
  foods.forEach(i=>fWrap.appendChild(mk(i)));
  if(!drinks.length) dWrap.innerHTML='<p class="empty">لا مشروبات بعد.</p>';
  if(!foods.length) fWrap.innerHTML='<p class="empty">لا أكل بعد.</p>';
}

function renderTicker(){
  const names=[...DB.products.map(p=>p.name),...DB.cafe.map(c=>c.name)].slice(0,12);
  const half=names.map(n=>`<span>${escapeHtml(n)}</span><i>•</i>`).join('');
  $('#tickerTrack').innerHTML=half+half;
}
function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* filter tabs */
$$('.tab').forEach(t=>t.addEventListener('click',()=>{
  $$('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
  activeFilter=t.dataset.filter; renderProducts();
}));

/* ===== Editor modal ===== */
const itemOverlay=$('#itemOverlay');
function openEditor(item=null){
  if(!isAdmin()){ alert('وضع المشتري للعرض فقط. ادخل كموظف للتعديل.'); return; }
  editingId=item?.id||null;
  $('#itemTitle').textContent=item?'تعديل: '+item.name:'إضافة صنف جديد';
  $('#fName').value=item?.name||'';
  $('#fPrice').value=item?.price||'';
  $('#fDesc').value=item?.desc||'';
  const kind=item?.kind||'product';
  $('#fKind').value=kind;
  $('#fCat').value=item?.cat||'milk';
  $('#fUnit').value=item?.unit||'لتر';
  itemOverlay.hidden=false;
}
$('#addProductBtn').addEventListener('click',()=>{ editingId=null; $('#fKind').value='product'; $('#itemTitle').textContent='إضافة منتج مصنع جديد'; itemOverlay.hidden=false; });
$('#addCoffeeBtn').addEventListener('click',()=>{ editingId=null; $('#fKind').value='drink'; $('#itemTitle').textContent='إضافة قهوة / مشروب جديد ☕'; itemOverlay.hidden=false; });

$('#saveItem').addEventListener('click',()=>{
  const name=$('#fName').value.trim(), pr=Number($('#fPrice').value);
  if(name.length<2){ alert('اكتب اسم الصنف'); return; }
  if(!pr||pr<=0){ alert('اكتب سعر صحيح'); return; }
  const kind=$('#fKind').value;
  const data={name,price:pr,desc:$('#fDesc').value.trim(),kind,cat:$('#fCat').value,unit:$('#fUnit').value};
  if(editingId){
    let arr = (kind==='product')?DB.products:DB.cafe;
    // لو اتنقل من منتج لكافيه أو العكس
    const inP=DB.products.find(x=>x.id===editingId), inC=DB.cafe.find(x=>x.id===editingId);
    DB.products=DB.products.filter(x=>x.id!==editingId);
    DB.cafe=DB.cafe.filter(x=>x.id!==editingId);
    const merged={id:editingId,...data};
    if(kind==='product') DB.products.push(merged); else DB.cafe.push(merged);
  }else{
    const id='x'+Date.now();
    if(kind==='product') DB.products.push({id,...data});
    else DB.cafe.push({id,cat:undefined,...data});
  }
  saveDB(DB); itemOverlay.hidden=true; renderAll();
});

/* ===== header / nav / form ===== */
const menu=$('#menu'), burger=$('#burger');
burger.addEventListener('click',()=>menu.classList.toggle('open'));
menu.addEventListener('click',e=>{ if(e.target.tagName==='A') menu.classList.remove('open'); });
const links=$$('.menu a');
const spy=()=>{
  const pos=scrollY+160; let cur='home';
  ['home','about','products','cafe','contact'].forEach(id=>{ const s=document.getElementById(id); if(s&&s.offsetTop<=pos) cur=id; });
  links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+cur));
};
addEventListener('scroll',spy,{passive:true});

const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('in'); io.unobserve(en.target);} }),{threshold:.1});
$$('[data-reveal]').forEach(el=>io.observe(el));

const form=$('#orderForm'), note=$('#formNote');
const wa=t=>'https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(t);
form.addEventListener('submit',e=>{
  e.preventDefault();
  if(form.name.value.trim().length<2||form.phone.value.trim().length<8){ note.textContent='اكتب الاسم ورقم هاتف صحيح.'; return; }
  const msg=['السلام عليكم بن الخليفه،','نوع الطلب: '+form.type.value,'الاسم: '+form.name.value.trim(),'الهاتف: '+form.phone.value.trim(),form.msg.value.trim()].filter(Boolean).join('\n');
  open(wa(msg),'_blank'); note.textContent='تم تجهيز طلبك على واتساب ✅'; form.reset();
});
$('#fab').addEventListener('click',()=>open(wa('السلام عليكم بن الخليفه، عايز أستفسر عن المنتجات.'),'_blank'));
$('#year').textContent=new Date().getFullYear();

/* init */
applyRole();
