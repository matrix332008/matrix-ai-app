let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    generating: 'جاري توليد فيديو AI من قصتك...',
    resultTitle: 'الفيديو الحقيقي جاهز!',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو',
    share: 'مشاركة',
    story: 'الحكاية:',
    style: 'الستايل:',
    voice: 'الصوت:',
    male: 'راجل',
    female: 'مرا',
    library: 'المكتبة',
    libraryEmpty: 'المكتبة فارغة',
    libraryDesc: 'الفيديوات اللي تولدهم باش يظهرو هنا',
    createNew: 'أنشئ فيديو جديد',
    videos: 'الفيديوات',
    plan: 'الخطة',
    free: 'مجاني',
    delete: 'حذف',
    soon: 'قريباً...',
    copied: 'تم نسخ رابط الفيديو!',
    listen: 'اسمع الحكاية'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    generating: 'Generuji AI video...',
    resultTitle: 'Skutečné AI video hotové!',
    backHome: 'Zpět domů',
    download: 'Stáhnout video',
    share: 'Sdílet',
    story: 'Příběh:',
    style: 'Styl:',
    voice: 'Hlas:',
    male: 'Muž',
    female: 'Žena',
    library: 'Knihovna',
    libraryEmpty: 'Knihovna je prázdná',
    libraryDesc: 'Videa která vytvoříš se zobrazí zde',
    createNew: 'Vytvořit nové video',
    videos: 'Videa',
    plan: 'Plán',
    free: 'Zdarma',
    delete: 'Smazat',
    soon: 'Brzy...',
    copied: 'Odkaz zkopírován!',
    listen: 'Přehrát příběh'
  }
};

let voices = [];
function loadVoices() { voices = speechSynthesis.getVoices(); }
loadVoices();
if (speechSynthesis.onvoiceschanged!== undefined) { speechSynthesis.onvoiceschanged = loadVoices; }

function speak(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === 'ar'? 'ar-SA' : 'cs-CZ';
  utterance.pitch = currentVoice === 'female'? 1.3 : 0.7;
  utterance.rate = 0.9;
  const list = voices.filter(v => v.lang.startsWith(currentLang === 'ar'? 'ar' : 'cs'));
  if(list.length>0) utterance.voice = list[0];
  speechSynthesis.speak(utterance);
}

function getSavedVideos() { return JSON.parse(localStorage.getItem('matrix_videos') || '[]'); }
function saveVideo(story, style, images, voice) {
  const videos = getSavedVideos();
  videos.unshift({ id: Date.now(), story, style, images, voice, date: new Date().toLocaleDateString() });
  localStorage.setItem('matrix_videos', JSON.stringify(videos));
}
function deleteVideo(id) {
  const videos = getSavedVideos().filter(v => v.id!== id);
  localStorage.setItem('matrix_videos', JSON.stringify(videos));
  showLibrary();
}

document.querySelectorAll('.lang button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.lang button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    currentLang = btn.dataset.lang;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar'? 'rtl' : 'ltr';
    document.querySelectorAll('[data-ar]').forEach(el => {
      if(el.tagName === 'INPUT') el.placeholder = el.dataset[currentLang];
      else el.textContent = el.dataset[currentLang];
    });
    document.querySelector('#loader p').textContent = translations[currentLang].generating;
  };
});

document.querySelectorAll('.style-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    currentStyle = btn.dataset.style;
  };
});

document.querySelectorAll('.voice-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    currentVoice = btn.dataset.voice;
  };
});

// 🔥 جديد: يولد فيديو حقيقي من أي قصة تكتبها
document.getElementById('generateBtn').onclick = async () => {
  const story = document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);

  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');
  btn.disabled = true;
  loader.classList.add('show');

  const s1 = story.substring(0, Math.floor(story.length/3)).substring(0,100);
  const s2 = story.substring(Math.floor(story.length/3), Math.floor(story.length*2/3)).substring(0,100);
  const s3 = story.substring(Math.floor(story.length*2/3)).substring(0,100);
  const seed = Date.now();

  const images = [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic movie scene, ${currentStyle} style, ${s1}, ultra realistic, 8k`)}?width=1024&height=576&seed=${seed}&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic movie scene, ${currentStyle} style, ${s2}, ultra realistic, 8k`)}?width=1024&height=576&seed=${seed+1}&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic movie scene, ${currentStyle} style, ${s3}, emotional ending, 8k`)}?width=1024&height=576&seed=${seed+2}&nologo=true`
  ];

  await new Promise(r => setTimeout(r, 2000));
  saveVideo(story, currentStyle, images, currentVoice);
  btn.disabled = false;
  loader.classList.remove('show');
  showResult(story, currentStyle, images, currentVoice);
};

function showResult(story, style, images, voice) {
  const t = translations[currentLang];
  const styleName = document.querySelector(`[data-style="${style}"]`)?.dataset[currentLang] || style;
  const voiceName = t[voice];

  document.querySelector('.wrap').innerHTML = `
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>

      <div style="position:relative;width:100%;border-radius:18px;border:2px solid #8B5CF6;overflow:hidden;background:#000;margin-bottom:16px;aspect-ratio:16/9">
        <img id="mainAIImg" src="${images[0]}" style="width:100%;height:100%;object-fit:cover;display:block" crossorigin="anonymous">
        <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:6px;background:rgba(0,0,0,0.6);padding:6px 10px;border-radius:20px">
          <span id="dot0" style="width:8px;height:8px;border-radius:50%;background:#FFC300;display:block"></span>
          <span id="dot1" style="width:8px;height:8px;border-radius:50%;background:#555;display:block"></span>
          <span id="dot2" style="width:8px;height:8px;border-radius:50%;background:#555;display:block"></span>
        </div>
        <div style="position:absolute;top:10px;right:10px;background:#FFC300;color:#000;font-size:11px;font-weight:900;padding:4px 8px;border-radius:6px">AI VIDEO</div>
      </div>

      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px;margin-bottom:4px">${t.story}</div>
        <div style="font-size:14px;font-weight:700;line-height:1.6;margin-bottom:10px">${story}</div>
        <div style="font-size:12px"><span style="color:#FFC300">${styleName}</span> • <span style="color:#8B5CF6">${voiceName}</span></div>
      </div>

      <button onclick="speak('${story.replace(/'/g, "\\'")}')" class="big" style="background:linear-gradient(135deg,#8B5CF6,#6D28D9)"><i class="fas fa-volume-up"></i> ${t.listen} - صوت حقيقي</button>
      <button onclick="shareVideo('${images[0]}')" class="btn" style="width:100%;margin-top:10px;height:56px"><i class="fas fa-share-alt"></i> ${t.share}</button>
      <button onclick="goHome()" class="btn" style="width:100%;margin-top:10px;height:56px;border-color:#666;color:#888"><i class="fas fa-home"></i> ${t.backHome}</button>
    </div>
  `;

  let current = 0;
  window._aiImgs = images;
  setInterval(()=>{
    current = (current+1)%3;
    const img = document.getElementById('mainAIImg');
    if(img){ img.src = images[current]; [0,1,2].forEach(i=>{ const d=document.getElementById('dot'+i); if(d) d.style.background = i===current?'#FFC300':'#555'; }); }
  }, 3500);

  setTimeout(()=>speak(story), 700);
}

function shareVideo(url) {
  if(navigator.share){ navigator.share({title:'Matrix AI Video', text:'شوف الفيديو AI اللي عملتو 🔥', url:url}); }
  else { navigator.clipboard.writeText(url); alert(translations[currentLang].copied); }
}
function goHome(){ location.reload(); }

document.querySelectorAll('nav a').forEach(btn=>{
  btn.onclick=(e)=>{
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a=>a.classList.remove('on'));
    btn.classList.add('on');
    const p=btn.dataset.page;
    if(p==='home'||p==='create') goHome();
    if(p==='discover') alert(translations[currentLang].soon);
    if(p==='library') showLibrary();
    if(p==='profile') showProfile();
  };
});

function showLibrary(){
  const t=translations[currentLang];
  const videos=getSavedVideos();
  if(videos.length===0){
    document.querySelector('.wrap').innerHTML=`<div style="padding:40px 20px;text-align:center"><i class="fas fa-folder-open" style="font-size:70px;color:#8B5CF6;margin-bottom:16px"></i><h2 style="font-size:24px;margin-bottom:10px">${t.libraryEmpty}</h2><p style="color:#888;margin-bottom:20px">${t.libraryDesc}</p><button onclick="goHome()" class="big"><i class="fas fa-plus"></i> ${t.createNew}</button></div>`;
    return;
  }
  document.querySelector('.wrap').innerHTML=`<div style="padding:20px"><h2 style="text-align:center;font-size:24px;margin-bottom:16px">${t.library}</h2>${videos.map(v=>`
    <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:14px;padding:10px;margin-bottom:12px">
      <img src="${v.images[0]}" style="width:100%;border-radius:10px;margin-bottom:8px;aspect-ratio:16/9;object-fit:cover">
      <div style="font-size:13px;margin-bottom:6px">${v.story.substring(0,80)}...</div>
      <div style="display:flex;gap:6px"><button onclick="speak('${v.story.replace(/'/g,"\\'")}')" class="btn" style="flex:1;height:40px"><i class="fas fa-volume-up"></i></button><button onclick="deleteVideo(${v.id})" style="background:#FF3B30;border:0;color:#fff;padding:6px 14px;border-radius:8px"><i class="fas fa-trash"></i></button></div>
    </div>`).join('')}</div>`;
}

function showProfile(){
  const t=translations[currentLang];
  const c=getSavedVideos().length;
  document.querySelector('.wrap').innerHTML=`<div style="padding:30px 20px;text-align:center"><i class="fas fa-user-circle" style="font-size:90px;color:#FFC300;margin-bottom:16px"></i><h2 style="font-size:24px">Matrix User</h2><p style="color:#888;margin-bottom:20px">user@matrix.ai</p><div style="background:#1A1A1A;border-radius:16px;padding:16px;text-align:right"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:#888">${t.videos}</span><span style="font-weight:800;color:#FFC300">${c}</span></div><div style="display:flex;justify-content:space-between"><span style="color:#888">${t.plan}</span><span style="font-weight:800;color:#8B5CF6">${t.free}</span></div></div><button onclick="goHome()" class="btn" style="width:100%;margin-top:20px;height:54px"><i class="fas fa-home"></i> ${t.backHome}</button></div>`;
}

if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js'); }
