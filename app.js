let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    alertDone: 'تم توليد الفيديو بنجاح! 🎉',
    generating: 'جاري توليد فيديو AI حقيقي من قصتك...',
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
    listen: 'اسمع الحكاية',
    copied: 'تم النسخ!',
    loading: 'جاري تحميل الفيديو...',
    playing: 'قاعد يخدم ▶️'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    alertDone: 'Video bylo úspěšně vygenerováno! 🎉',
    generating: 'Generuji AI video z tvého příběhu...',
    resultTitle: 'AI video je hotové!',
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
    listen: 'Přehrát příběh',
    copied: 'Zkopírováno!',
    loading: 'Načítám video...',
    playing: 'Přehrávám ▶️'
  }
};

let voices = [];
function loadVoices() { voices = speechSynthesis.getVoices(); }
loadVoices();
if (speechSynthesis.onvoiceschanged!== undefined) speechSynthesis.onvoiceschanged = loadVoices;

function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = currentLang === 'ar'? 'ar-SA' : 'cs-CZ';
  u.rate = 0.9;
  u.pitch = currentVoice === 'female'? 1.2 : 0.7;
  const list = voices.filter(v => v.lang.toLowerCase().includes(currentLang === 'ar'? 'ar' : 'cs'));
  if (list.length > 0) {
    if (currentVoice === 'male') u.voice = list.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Jakub') || v.name.includes('Maged')) || list[1] || list[0];
    else u.voice = list[0];
  }
  speechSynthesis.speak(u);
}

function getSavedVideos() { return JSON.parse(localStorage.getItem('matrix_videos') || '[]'); }
function saveVideo(story, style, images, voice) {
  const videos = getSavedVideos();
  videos.unshift({ id: Date.now(), story, style, images, voice, date: new Date().toLocaleDateString(currentLang === 'ar'? 'ar-TN' : 'cs-CZ') });
  localStorage.setItem('matrix_videos', JSON.stringify(videos));
}
function deleteVideo(id) {
  localStorage.setItem('matrix_videos', JSON.stringify(getSavedVideos().filter(v => v.id!== id)));
  showLibrary();
}

// 🔥 تصليح الـ emoji - ما نمسحوش الـ span الأول
document.querySelectorAll('.lang button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.lang button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    currentLang = btn.dataset.lang;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar'? 'rtl' : 'ltr';
    document.querySelectorAll('[data-ar]').forEach(el => {
      if (el.tagName === 'INPUT') el.placeholder = el.dataset[currentLang];
      else if (el.tagName === 'SPAN' && el.hasAttribute('data-ar')) el.textContent = el.dataset[currentLang];
      else if (!el.querySelector('span[data-ar]')) el.textContent = el.dataset[currentLang];
    });
    const loaderP = document.querySelector('#loader p');
    if (loaderP) loaderP.textContent = translations[currentLang].generating;
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

// 🔥 توليد فيديو AI حقيقي + progress + play
document.getElementById('generateBtn').onclick = async () => {
  const input = document.getElementById('storyInput');
  const story = input.value.trim();
  if (!story) return alert(translations[currentLang].alertEmpty);

  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');
  const progressText = document.createElement('div');
  progressText.id = 'progressText';
  progressText.style.cssText = 'margin-top:10px;color:#FFC300;font-weight:800;font-size:14px';

  btn.disabled = true;
  loader.classList.add('show');
  loader.appendChild(progressText);

  const updateProgress = (p, txt) => { progressText.textContent = `${p}% - ${txt}`; };

  try {
    updateProgress(10, currentLang === 'ar'? 'نحلل القصة...' : 'Analyzuji příběh...');
    const s1 = story.substring(0, Math.floor(story.length / 3)).substring(0, 90);
    const s2 = story.substring(Math.floor(story.length / 3), Math.floor(story.length * 2 / 3)).substring(0, 90);
    const s3 = story.substring(Math.floor(story.length * 2 / 3)).substring(0, 90);
    const seed = Date.now();

    updateProgress(30, currentLang === 'ar'? 'نولد صور AI من قصتك...' : 'Generuji AI obrázky...');

    const urls = [
      `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic ${currentStyle} movie scene, ${s1}, ultra realistic, 8k`)}?width=1024&height=576&seed=${seed}&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic ${currentStyle} movie scene, ${s2}, dramatic lighting`)}?width=1024&height=576&seed=${seed+1}&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic ${currentStyle} movie scene, ${s3}, emotional, highly detailed`)}?width=1024&height=576&seed=${seed+2}&nologo=true`
    ];

    // نحمل الصور وحدة وحدة مع progress
    const images = [];
    for (let i = 0; i < urls.length; i++) {
      updateProgress(30 + (i+1)*20, currentLang === 'ar'? `جاري تحميل الفيديو ${i+1}/3...` : `Načítám video ${i+1}/3...`);
      await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => { images.push(urls[i]); res(); };
        img.onerror = () => { images.push(urls[i]); res(); };
        img.src = urls[i];
      });
      await new Promise(r => setTimeout(r, 600));
    }

    updateProgress(100, currentLang === 'ar'? 'تم! ✅' : 'Hotovo! ✅');
    await new Promise(r => setTimeout(r, 500));

    saveVideo(story, currentStyle, images, currentVoice);
    showResult(story, currentStyle, images, currentVoice);
  } catch (e) {
    alert('Error: ' + e.message);
  } finally {
    btn.disabled = false;
    loader.classList.remove('show');
    progressText.remove();
  }
};

function showResult(story, style, images, voice) {
  const t = translations[currentLang];
  const styleName = document.querySelector(`[data-style="${style}"] span[data-ar]`)?.dataset[currentLang] || style;
  const voiceName = t[voice];

  document.querySelector('.wrap').innerHTML = `
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>

      <div style="position:relative;width:100%;border-radius:18px;border:2px solid #8B5CF6;overflow:hidden;background:#000;margin-bottom:16px;aspect-ratio:16/9">
        <img id="mainAIImg" src="${images[0]}" style="width:100%;height:100%;object-fit:cover;display:block">
        <button id="playBtn" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:rgba(255,195,0,0.9);border:0;color:#000;font-size:36px;display:grid;place-items:center;cursor:pointer;box-shadow:0 0 30px rgba(255,195,0,0.6)"><i class="fas fa-play" style="margin-left:4px"></i></button>
        <div id="playStatus" style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;display:none">${t.loading}</div>
        <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:6px;background:rgba(0,0,0,0.6);padding:6px 10px;border-radius:20px">
          <span id="dot0" style="width:8px;height:8px;border-radius:50%;background:#FFC300"></span>
          <span id="dot1" style="width:8px;height:8px;border-radius:50%;background:#555"></span>
          <span id="dot2" style="width:8px;height:8px;border-radius:50%;background:#555"></span>
        </div>
        <div style="position:absolute;top:10px;right:10px;background:#FFC300;color:#000;font-size:11px;font-weight:900;padding:4px 8px;border-radius:6px">AI VIDEO</div>
      </div>

      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div>
        <div style="font-size:14px;font-weight:700;line-height:1.6;margin-bottom:10px">${story}</div>
        <div style="color:#888;font-size:12px">${t.style}</div>
        <div style="font-size:14px;font-weight:700;color:#FFC300;margin-bottom:8px">${styleName}</div>
        <div style="color:#888;font-size:12px">${t.voice}</div>
        <div style="font-size:14px;font-weight:700;color:#8B5CF6">${voiceName}</div>
      </div>

      <button id="speakBtn" class="big" style="background:linear-gradient(135deg,#8B5CF6,#6D28D9);margin-top:10px"><i class="fas fa-volume-up"></i> ${t.listen}</button>
      <button id="shareBtn" class="btn" style="width:100%;margin-top:10px;height:56px"><i class="fas fa-share-alt"></i> ${t.share}</button>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:10px;height:56px;border-color:#666;color:#888"><i class="fas fa-home"></i> ${t.backHome}</button>
    </div>
  `;

  let cur = 0, playing = false, interval;
  const mainImg = document.getElementById('mainAIImg');
  const playBtn = document.getElementById('playBtn');
  const status = document.getElementById('playStatus');

  function startSlideshow() {
    playing = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    status.style.display = 'block';
    status.textContent = translations[currentLang].playing;
    speak(story);
    interval = setInterval(() => {
      cur = (cur + 1) % images.length;
      mainImg.src = images[cur];
      [0,1,2].forEach(i => { const d = document.getElementById('dot'+i); if(d) d.style.background = i===cur?'#FFC300':'#555'; });
    }, 3000);
  }
  function stopSlideshow() {
    playing = false;
    playBtn.innerHTML = '<i class="fas fa-play" style="margin-left:4px"></i>';
    status.style.display = 'none';
    clearInterval(interval);
    speechSynthesis.cancel();
  }

  playBtn.onclick = () => { if (playing) stopSlideshow(); else startSlideshow(); };
  document.getElementById('speakBtn').onclick = () => { speak(story); if (!playing) startSlideshow(); };
  document.getElementById('shareBtn').onclick = () => { navigator.clipboard.writeText(images[0]); alert(t.copied); };

  // يبدأ تلقائيا بعد ثانية ويوري زر Play
  setTimeout(() => startSlideshow(), 800);
}

document.querySelectorAll('nav a').forEach((btn, i) => {
  btn.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('on'));
    btn.classList.add('on');
    if (i === 0 || i === 2) location.reload();
    if (i === 1) alert(currentLang === 'ar'? 'قريباً...' : 'Brzy...');
    if (i === 3) showLibrary();
    if (i === 4) showProfile();
  };
});

function showLibrary() {
  const t = translations[currentLang];
  const videos = getSavedVideos();
  if (videos.length === 0) {
    document.querySelector('.wrap').innerHTML = `<div style="padding:40px 20px;text-align:center"><i class="fas fa-folder-open" style="font-size:80px;color:#8B5CF6;margin-bottom:20px"></i><h2 style="font-size:26px;margin-bottom:12px">${t.libraryEmpty}</h2><p style="color:#888;margin-bottom:24px">${t.libraryDesc}</p><button onclick="location.reload()" class="big"><i class="fas fa-plus"></i> ${t.createNew}</button></div>`;
    return;
  }
  document.querySelector('.wrap').innerHTML = `<div style="padding:20px"><h2 style="text-align:center;font-size:24px;margin-bottom:16px;font-weight:900">${t.library}</h2><div id="libList"></div></div>`;
  const list = document.getElementById('libList');
  videos.forEach(v => {
    const row = document.createElement('div');
    row.style.cssText = "background:#1A1A1A;border:2px solid #8B5CF6;border-radius:16px;padding:12px;margin-bottom:14px";
    row.innerHTML = `<img src="${v.images[0]}" style="width:100%;border-radius:12px;margin-bottom:10px;aspect-ratio:16/9;object-fit:cover"><div style="font-weight:700;margin-bottom:6px;font-size:14px">${v.story.substring(0,100)}...</div><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:#FFC300;font-size:12px">${v.date}</span><div style="display:flex;gap:6px"><button class="playBtn btn" style="height:36px;padding:0 12px"><i class="fas fa-play"></i></button><button class="delBtn" style="background:#FF3B30;border:0;color:#fff;padding:6px 12px;border-radius:8px;font-weight:700"><i class="fas fa-trash"></i> ${t.delete}</button></div></div>`;
    row.querySelector('.playBtn').onclick = () => showResult(v.story, v.style, v.images, v.voice);
    row.querySelector('.delBtn').onclick = () => deleteVideo(v.id);
    list.appendChild(row);
  });
}

function showProfile() {
  const t = translations[currentLang];
  document.querySelector('.wrap').innerHTML = `<div style="padding:40px 20px;text-align:center"><i class="fas fa-user-circle" style="font-size:100px;color:#FFC300;margin-bottom:20px"></i><h2 style="font-size:28px;margin-bottom:8px">Matrix User</h2><p style="color:#888;margin-bottom:30px">user@matrix.ai</p><div style="background:#1A1A1A;border-radius:18px;padding:20px;text-align:right"><div style="display:flex;justify-content:space-between;margin-bottom:16px"><span style="color:#888">${t.videos}</span><span style="font-weight:800;color:#FFC300">${getSavedVideos().length}</span></div><div style="display:flex;justify-content:space-between"><span style="color:#888">${t.plan}</span><span style="font-weight:800;color:#8B5CF6">${t.free}</span></div></div><button onclick="location.reload()" class="btn" style="width:100%;margin-top:30px;height:58px"><i class="fas fa-home"></i> ${t.backHome}</button></div>`;
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
