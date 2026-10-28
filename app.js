/* =====================================================
   بازارک - برنامه آگهی با JavaScript خالص
   ذخیره‌سازی: localStorage مرورگر (بدون سرور)
   ===================================================== */

// ---------- ۱) داده‌های ثابت ----------
const CATS = {'همه':'🏷️','املاک':'🏠','وسایل نقلیه':'🚗','دیجیتال':'📱','لوازم خانگی':'🛋️','خدمات':'🛠️','استخدام':'💼','سرگرمی':'🎮'};
const CITIES = ['تهران','اصفهان','شیراز','مشهد','تبریز','کرج'];

// ---------- ۲) وضعیت برنامه ----------
const S = { ads: read('ads') || seed(), favs: read('favs') || [], cat:'همه', onlyFav:false };

// ---------- ۳) توابع کمکی ----------
const $ = id => document.getElementById(id);
function read(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } }
function save(){ localStorage.setItem('ads',JSON.stringify(S.ads)); localStorage.setItem('favs',JSON.stringify(S.favs)); }
const money = p => p ? Number(p).toLocaleString('fa-IR')+' تومان' : 'توافقی';
// جلوگیری از XSS: متن کاربر قبل از innerHTML امن می‌شود
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ago(t){
  const m = Math.floor((Date.now()-t)/60000), f = n=>n.toLocaleString('fa-IR');
  return m<1?'لحظاتی پیش': m<60?f(m)+' دقیقه پیش': m<1440?f(Math.floor(m/60))+' ساعت پیش': f(Math.floor(m/1440))+' روز پیش';
}
// پیام کوتاه پایین صفحه
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.append(t); setTimeout(()=>t.remove(),2200); }
// آگهی‌های نمونه برای اولین اجرا
function seed(){ const n=Date.now(); return [
  {id:1,title:'آپارتمان ۷۵ متری دو خوابه',category:'املاک',city:'تهران',price:4500000000,phone:'09120000000',desc:'طبقه سوم، آسانسور و پارکینگ دارد.',image:'',time:n-3600e3},
  {id:2,title:'پژو ۲۰۶ مدل ۹۸',category:'وسایل نقلیه',city:'اصفهان',price:620000000,phone:'09130000000',desc:'بدون رنگ و فنی سالم.',image:'',time:n-864e5},
  {id:3,title:'گوشی سامسونگ A54',category:'دیجیتال',city:'شیراز',price:0,phone:'09170000000',desc:'در حد نو، با گارانتی.',image:'',time:n-72e5},
  {id:4,title:'یخچال ساید بای ساید',category:'لوازم خانگی',city:'مشهد',price:35000000,phone:'09150000000',desc:'یک سال کارکرده.',image:'',time:n-2*864e5}]; }

// ---------- ۴) ساخت دسته‌ها و لیست شهرها ----------
function buildStatic(){
  $('chips').innerHTML = Object.entries(CATS).map(([c,i])=>`<button class="chip ${c===S.cat?'on':''}" data-cat="${c}">${i} ${c}</button>`).join('');
  $('city').innerHTML = '<option value="">همه شهرها</option>'+CITIES.map(c=>`<option>${c}</option>`).join('');
  $('fCity').innerHTML = CITIES.map(c=>`<option>${c}</option>`).join('');
  $('fCat').innerHTML = Object.keys(CATS).slice(1).map(c=>`<option>${c}</option>`).join('');
}

// ---------- ۵) فیلتر + مرتب‌سازی ----------
function filtered(){
  const q=$('q').value.trim(), city=$('city').value, min=+$('min').value||0, max=+$('max').value||Infinity;
  const list = S.ads.filter(a =>
    (S.cat==='همه'||a.category===S.cat) && (!city||a.city===city) &&
    (a.title.includes(q)||a.desc.includes(q)) && a.price>=min && a.price<=max &&
    (!S.onlyFav||S.favs.includes(a.id)));
  const s=$('sort').value;
  return list.sort((a,b)=> s==='cheap'?a.price-b.price : s==='exp'?b.price-a.price : b.time-a.time);
}

// ---------- ۶) نمایش لیست آگهی‌ها ----------
function render(){
  const list=filtered();
  $('count').textContent = list.length.toLocaleString('fa-IR')+' آگهی';
  $('grid').innerHTML = list.map(a=>`
    <article class="card" data-id="${a.id}">
      <button class="heart" data-fav="${a.id}" aria-label="نشان کردن">${S.favs.includes(a.id)?'♥':'♡'}</button>
      ${a.image?`<img class="thumb" src="${a.image}" alt="">`:`<div class="thumb">${CATS[a.category]}</div>`}
      <div class="info"><h3>${esc(a.title)}</h3><div class="price">${money(a.price)}</div><div class="meta">${ago(a.time)} در ${esc(a.city)}</div></div>
    </article>`).join('') || '<div class="empty">😕 آگهی‌ای پیدا نشد</div>';
}

// ---------- ۷) نشان کردن ----------
function toggleFav(id){
  S.favs = S.favs.includes(id) ? S.favs.filter(f=>f!==id) : [...S.favs,id];
  save(); render();
}

// ---------- ۸) مودال‌ها ----------
const open = id => $(id).classList.remove('hidden');
const closeAll = () => document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));

function showDetail(id){
  const a=S.ads.find(x=>x.id===id);
  $('detail').innerHTML = `
    <button class="x" data-x>×</button>
    <h2>${esc(a.title)}</h2>
    ${a.image?`<img class="dimg" src="${a.image}" alt="">`:`<div class="big">${CATS[a.category]}</div>`}
    <div class="price" style="font-size:20px">${money(a.price)}</div>
    <div class="meta">${esc(a.category)} • ${esc(a.city)} • ${ago(a.time)}</div>
    <p style="margin-top:12px">${esc(a.desc)}</p>
    <div class="acts"><a class="btn" href="tel:${esc(a.phone)}">📞 تماس: ${esc(a.phone)}</a>
    <button class="btn danger" data-del="${a.id}">حذف آگهی</button></div>`;
  open('detailModal');
}

// ---------- ۹) ثبت آگهی ----------
$('form').addEventListener('submit', e=>{
  e.preventDefault();
  const f=new FormData(e.target), file=f.get('image');
  const add = image => {
    S.ads.unshift({id:Date.now(),title:f.get('title'),category:f.get('category'),city:f.get('city'),
      price:+f.get('price')||0,phone:f.get('phone'),desc:f.get('desc'),image,time:Date.now()});
    save(); render(); closeAll(); e.target.reset(); toast('✅ آگهی شما منتشر شد');
  };
  // عکس به Data URL تبدیل می‌شود تا در localStorage جا شود (حداکثر ۵۰۰ کیلوبایت)
  if(file && file.size){
    if(file.size>500*1024) return toast('⚠️ حجم عکس باید کمتر از ۵۰۰ کیلوبایت باشد');
    const r=new FileReader(); r.onload=()=>add(r.result); r.readAsDataURL(file);
  } else add('');
});

// ---------- ۱۰) رویدادها (Event Delegation) ----------
document.addEventListener('click', e=>{
  const t=e.target, d=t.dataset;
  if(d.cat){ S.cat=d.cat; buildStatic(); render(); }
  else if(d.fav) toggleFav(+d.fav);
  else if(d.del){ if(confirm('آگهی حذف شود؟')){ S.ads=S.ads.filter(a=>a.id!==+d.del); save(); render(); closeAll(); toast('🗑️ حذف شد'); } }
  else if('x' in d || t.classList.contains('modal')) closeAll();
  else if(t.closest('.card')) showDetail(+t.closest('.card').dataset.id);
});
['q','city','min','max','sort'].forEach(id=>$(id).addEventListener('input',render));
$('postBtn').onclick = ()=>open('postModal');
$('fbtn').onclick = ()=>$('filters').classList.toggle('closed');
$('favBtn').onclick = e=>{ S.onlyFav=!S.onlyFav; e.currentTarget.classList.toggle('on',S.onlyFav); render(); };
document.addEventListener('keydown', e=>e.key==='Escape'&&closeAll());

// ---------- ۱۱) شروع ----------
buildStatic(); render();
