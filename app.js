let currentLang = 'ar';
let currentStyle = 'drama';

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    alertDone: 'تم توليد الفيديو بنجاح! 🎉',
    generating: 'جاري توليد الفيديو...',
    resultTitle: 'الفيديو جاهز!',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو',
    share: 'مشاركة',
    story: 'الحكاية:',
    style: 'الستايل:'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    alertDone: 'Video bylo úspěšně vygenerováno! 🎉',
    generating: 'Generuji video...',
    resultTitle: 'Video je hotové!',
    backHome: 'Zpět domů',
    download: 'Stáhnout video',
    share: 'Sdílet',
    story: 'Příběh:',
    style: 'Styl:'
  }
};

// فيديوات Template مجانية 100% من Pixabay
const videoTemplates = {
  drama: [
    'https://cdn.pixabay.com/video/2024/02/20/201368-915375272_large.mp4', // مدينة ليل
    'https://cdn.pixabay.com/video/2023/11/25/190774-888058023_large.mp4' // سماء ونجوم
  ],
  action: [
    'https://cdn.pixabay.com/video/2022/11/22/140111-774507553_large.mp4', // نار وانفجار
    'https://cdn.pixabay.com/video/2024/05/22/213027_large.mp4' // سيارات
  ],
  funny: [
    'https://cdn.pixabay.com/video/2023/10/27/186899-878641412_large.mp4', // حيوانات
    'https://cdn.pixabay.com/video/2022/07/24/125314-734046618_large.mp4' // غابة
  ],
  horror: [
    'https://cdn.pixabay.com/video/2023/08/23/177636-857251527_large.mp4', // بحر مظلم
    'https://cdn.pixabay.com/video/2020/07/30/46026-447087782_large.mp4' // غابة ضباب
  ]
};

// تبديل اللغة
document.querySelectorAll('.lang button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.lang button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    currentLang = btn.dataset.lang;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar'? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-ar]').forEach(el => {
      if(el.tagName === 'INPUT') {
        el.placeholder = el.dataset[currentLang];
      } else {
        el.textContent = el.dataset[currentLang];
      }
    });
    
    document.querySelector('#loader p').textContent = translations[currentLang].generating;
  };
});

// تبديل الستايل
document.querySelectorAll('.style-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    currentStyle = btn.dataset.style;
  };
});

// توليد الفيديو - Demo Mode بلاش 0$
document.getElementById('generateBtn').onclick = async () => {
  const story = document.getElementById('storyInput').value.trim();
  
  if(!story) {
    alert(translations[currentLang].alertEmpty);
    return;
  }
  
  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');
  btn.disabled = true;
  loader.classList.add('show');
  
  // نختار فيديو حسب الستايل
  const templates = videoTemplates[currentStyle];
  const videoUrl = templates[Math.floor(Math.random() * templates.length)];
  
  // محاكاة "توليد" - 2 ثواني
  await new Promise(r => setTimeout(r, 2000));
  
  btn.disabled = false;
  loader.classList.remove('show');
  showResult(story, currentStyle, videoUrl);
};

// عرض صفحة النتيجة مع فيديو حقيقي MP4
function showResult(story, style, videoUrl) {
  const t = translations[currentLang];
  const styleBtn = document.querySelector(`[data-style="${style}"]`);
  const styleName = styleBtn.dataset[currentLang];
  
  document.querySelector('.wrap').innerHTML = `
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:28px;margin-bottom:20px;font-weight:900">${t.resultTitle}</h2>
      
      <video controls autoplay loop style="width:100%;border-radius:18px;border:2px solid #8B5CF6;margin-bottom:20px;max-height:400px;object-fit:cover">
        <source src="${videoUrl}" type="video/mp4">
      </video>
      
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:18px;margin-bottom:16px">
        <div style="color:#888;font-size:13px;margin-bottom:6px">${t.story}</div>
        <div style="font-size:17px;font-weight:700;margin-bottom:14px;line-height:1.5">${story}</div>
        <div style="color:#888;font-size:13px;margin-bottom:6px">${t.style}</div>
        <div style="font-size:17px;font-weight:700;color:#FFC300">${styleName}</div>
      </div>

      <a href="${videoUrl}" download="matrix-ai-${Date.now()}.mp4" class="big" style="text-decoration:none;margin-top:12px">
        <i class="fas fa-download"></i> ${t.download}
      </a>
      
      <button onclick="shareVideo('${videoUrl}')" class="btn" style="width:100%;margin-top:12px;height:58px">
        <i class="fas fa-share-alt"></i> ${t.share}
      </button>
      
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:12px;height:58px;border-color:#666;color:#888">
        <i class="fas fa-home"></i> ${t.backHome}
      </button>
    </div>
  `;
}

// مشاركة الفيديو
function shareVideo(url) {
  if(navigator.share) {
    navigator.share({
      title: 'Matrix AI Video',
      text: 'شوف الفيديو اللي عملتو بـ Matrix AI 🔥',
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('تم نسخ رابط الفيديو!');
  }
}

// Nav buttons
document.querySelectorAll('nav a').forEach((btn, i) => {
  btn.onclick = (e) => {
    e.preventDefault();
    if(i === 0) location.reload();
    if(i === 1) alert(currentLang === 'ar'? 'قريباً...' : 'Brzy...');
    if(i === 2) location.reload();
    if(i === 3) showLibrary();
    if(i === 4) showProfile();
  };
});

function showLibrary() {
  document.querySelector('.wrap').innerHTML = `
    <div style="padding:40px 20px;text-align:center">
      <i class="fas fa-folder-open" style="font-size:80px;color:#8B5CF6;margin-bottom:20px"></i>
      <h2 style="font-size:28px;margin-bottom:16px" data-ar="المكتبة فارغة" data-cs="Knihovna je prázdná">${currentLang === 'ar'? 'المكتبة فارغة' : 'Knihovna je prázdná'}</h2>
      <p style="color:#888;margin-bottom:30px" data-ar="الفيديوات اللي تولدهم باش يظهرو هنا" data-cs="Videa která vytvoříš se zobrazí zde">${currentLang === 'ar'? 'الفيديوات اللي تولدهم باش يظهرو هنا' : 'Videa která vytvoříš se zobrazí zde'}</p>
      <button onclick="location.reload()" class="big"><i class="fas fa-plus"></i> ${currentLang === 'ar'? 'أنشئ فيديو جديد' : 'Vytvořit nové video'}</button>
    </div>
  `;
}

function showProfile() {
  document.querySelector('.wrap').innerHTML = `
    <div style="padding:40px 20px;text-align:center">
      <i class="fas fa-user-circle" style="font-size:100px;color:#FFC300;margin-bottom:20px"></i>
      <h2 style="font-size:28px;margin-bottom:8px">Matrix User</h2>
      <p style="color:#888;margin-bottom:30px">user@matrix.ai</p>
      <div style="background:#1A1A1A;border-radius:18px;padding:20px;text-align:right">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px">
          <span style="color:#888">${currentLang === 'ar'? 'الفيديوات' : 'Videa'}</span>
          <span style="font-weight:800;color:#FFC300">0</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888">${currentLang === 'ar'? 'الخطة' : 'Plán'}</span>
          <span style="font-weight:800;color:#8B5CF6">${currentLang === 'ar'? 'مجاني' : 'Zdarma'}</span>
        </div>
      </div>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:30px;height:58px">
        <i class="fas fa-home"></i> ${currentLang === 'ar'? 'رجوع للرئيسية' : 'Zpět domů'}
      </button>
    </div>
  `;
}
