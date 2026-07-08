let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    generating: 'جاري توليد الفيديو...',
    resultTitle: 'الفيديو جاهز!',
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
    generating: 'Generuji video...',
    resultTitle: 'Video je hotové!',
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

const videoTemplates = {
  drama: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'],
  action: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'],
  funny: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'],
  horror: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4']
};

let voices = [];
function loadVoices() {
  voices = speechSynthesis.getVoices();
}
loadVoices();
if (speechSynthesis.onvoiceschanged!== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langCode = currentLang === 'ar'? 'ar' : 'cs';
  const voiceList = voices.filter(v => v.lang.startsWith(langCode));

  if (currentVoice === 'female') {
    utterance.voice = voiceList.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Zuzana') || v.name.includes('Maged')) || voiceList[0];
    utterance.pitch = 1.2;
  } else {
    utterance.voice = voiceList.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Jakub')) || voiceList[1] || voiceList[0];
    utterance.pitch = 0.9;
  }

  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function getSavedVideos() {
  return JSON.parse(localStorage.getItem('matrix_videos') || '[]');
}

function saveVideo(story, style, videoUrl, voice) {
  const videos = getSavedVideos();
  videos.unshift({
    id: Date.now(),
    story, style, videoUrl, voice,
    date: new Date().toLocaleDateString(currentLang === 'ar'? 'ar-TN' : 'cs-CZ')
  });
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

document.getElementById('generateBtn').onclick = async () => {
  const story = document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);

  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');
  btn.disabled = true;
  loader.classList.add('show');

  const templates = videoTemplates[currentStyle];
  const videoUrl = templates[Math.floor(Math.random() * templates.length)];

  await new Promise(r => setTimeout(r, 2000));

  saveVideo(story, currentStyle, videoUrl, currentVoice);

  btn.disabled = false;
  loader.classList.remove('show');
  showResult(story, currentStyle, videoUrl, currentVoice);
};

function showResult(story, style, videoUrl, voice) {
  const t = translations[currentLang];
  const styleName = document.querySelector(`[data-style="${style}"]`).dataset[currentLang];
  const voiceName = t[voice];

  document.querySelector('.wrap').innerHTML = `
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:28px;margin-bottom:20px;font-weight:900">${t.resultTitle}</h2>
      <video controls autoplay loop playsinline style="width:100%;border-radius:18px;border:2px solid #8B5CF6;margin-bottom:20px;max-height:400px;object-fit:cover;background:#000">
        <source src="${videoUrl}" type="video/mp4">
      </video>
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:18px;margin-bottom:16px">
        <div style="color:#888;font-size:13px;margin-bottom:6px">${t.story}</div>
        <div style="font-size:17px;font-weight:700;margin-bottom:14px;line-height:1.5">${story}</div>
        <div style="color:#888;font-size:13px;margin-bottom:6px">${t.style}</div>
        <div style="font-size:17px;font-weight:700;color:#FFC300;margin-bottom:14px">${styleName}</div>
        <div style="color:#888;font-size:13px;margin-bottom:6px">${t.voice}</div>
        <div style="font-size:17px;font-weight:700;color:#8B5CF6">${voiceName}</div>
      </div>
      <button onclick="speak('${story.replace(/'/g, "\\'")}')" class="big" style="background:linear-gradient(135deg,#8B5CF6,#6D28D9);margin-top:12px">
        <i class="fas fa-volume-up"></i> ${t.listen}
      </button>
      <a href="${videoUrl}" download="matrix-ai-${Date.now()}.mp4" class="big" style="text-decoration:none;margin-top:12px">
        <i class="fas fa-download"></i> ${t.download}
      </a>
      <button onclick="shareVideo('${videoUrl}')" class="btn" style="width:100%;margin-top:12px;height:58px">
        <i class="fas fa-share-alt"></i> ${t.share}
      </button>
      <button onclick="goHome()" class="btn" style="width:100%;margin-top:12px;height:58px;border-color:#666;color:#888">
        <i class="fas fa-home"></i> ${t.backHome}
      </button>
    </div>
  `;

  setTimeout(() => speak(story), 500);
}

function shareVideo(url) {
  if(navigator.share) {
    navigator.share({title: 'Matrix AI Video', text: 'شوف الفيديو اللي عملتو بـ Matrix AI 🔥', url: url});
  } else {
    navigator.clipboard.writeText(url);
    alert(translations[currentLang].copied);
  }
}

function goHome() { location.reload(); }

document.querySelectorAll('nav a').forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('on'));
    btn.classList.add('on');
    const page = btn.dataset.page;
    if(page === 'home' || page === 'create') goHome();
    if(page === 'discover') alert(translations[currentLang].soon);
    if(page === 'library') showLibrary();
    if(page === 'profile') showProfile();
  };
});

function showLibrary() {
  const t = translations[currentLang];
  const videos = getSavedVideos();

  if(videos.length === 0) {
    document.querySelector('.wrap').innerHTML = `
      <div style="padding:40px 20px;text-align:center">
        <i class="fas fa-folder-open" style="font-size:80px;color:#8B5CF6;margin-bottom:20px"></i>
        <h2 style="font-size:28px;margin-bottom:16px">${t.libraryEmpty}</h2>
        <p style="color:#888;margin-bottom:30px">${t.libraryDesc}</p>
        <button onclick="goHome()" class="big"><i class="fas fa-plus"></i> ${t.createNew}</button>
      </div>`;
    return;
  }

  document.querySelector('.wrap').innerHTML = `
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:28px;margin-bottom:20px;font-weight:900">${t.library}</h2>
      ${videos.map(v => {
        const styleName = document.querySelector(`[data-style="${v.style}"]`)? document.querySelector(`[data-style="${v.style}"]`).dataset[currentLang] : v.style;
        const voiceName = t[v.voice || 'female'];
        return `
        <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:16px;padding:12px;margin-bottom:14px">
          <video style="width:100%;border-radius:12px;margin-bottom:12px;background:#000" controls playsinline>
            <source src="${v.videoUrl}" type="video/mp4">
          </video>
          <div style="font-weight:700;margin-bottom:6px;font-size:15px">${v.story}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div>
              <span style="color:#FFC300;font-size:13px;font-weight:700">${styleName}</span>
              <span style="color:#666;font-size:12px;margin:0 8px">•</span>
              <span style="color:#8B5CF6;font-size:13px;font-weight:700">${voiceName}</span>
              <span style="color:#666;font-size:12px;margin:0 8px">•</span>
              <span style="color:#888;font-size:12px">${v.date}</span>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="speak('${v.story.replace(/'/g, "\\'")}'); currentVoice='${v.voice || 'female'}'" class="btn" style="flex:1;height:44px;font-size:14px">
              <i class="fas fa-volume-up"></i>
            </button>
            <button onclick="deleteVideo(${v.id})" style="background:#FF3B30;border:0;color:#fff;padding:6px 16px;border-radius:8px;font-size:14px;font-weight:700">
              <i class="fas fa-trash"></i> ${t.delete}
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function showProfile() {
  const t = translations[currentLang];
  const videoCount = getSavedVideos().length;
  document.querySelector('.wrap').innerHTML = `
    <div style="padding:40px 20px;text-align:center">
      <i class="fas fa-user-circle" style="font-size:100px;color:#FFC300;margin-bottom:20px"></i>
      <h2 style="font-size:28px;margin-bottom:8px">Matrix User</h2>
      <p style="color:#888;margin-bottom:30px">user@matrix.ai</p>
      <div style="background:#1A1A1A;border-radius:18px;padding:20px;text-align:right">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px">
          <span style="color:#888">${t.videos}</span>
          <span style="font-weight:800;color:#FFC300">${videoCount}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888">${t.plan}</span>
          <span style="font-weight:800;color:#8B5CF6">${t.free}</span>
        </div>
      <button onclick="goHome()" class="btn" style="width:100%;margin-top:30px;height:58px">
        <i class="fas fa-home"></i> ${t.backHome}
      </button>
    </div>`;
}

if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
