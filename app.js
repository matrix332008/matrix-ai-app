let currentLang = 'ar';
let currentStyle = 'drama';

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول',
    alertDone: 'تم توليد الفيديو بنجاح! 🎉',
    generating: 'جاري توليد الفيديو...',
    resultTitle: 'الفيديو جاهز!',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو',
    share: 'مشاركة'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    alertDone: 'Video bylo úspěšně vygenerováno! 🎉',
    generating: 'Generuji video...',
    resultTitle: 'Video je hotové!',
    backHome: 'Zpět domů',
    download: 'Stáhnout video',
    share: 'Sdílet'
  }
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
      el.textContent = el.dataset[currentLang];
    });
    
    const input = document.getElementById('storyInput');
    input.placeholder = input.dataset[currentLang];
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

// توليد الفيديو
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
  
  // محاكاة API - 3 ثواني
  await new Promise(r => setTimeout(r, 3000));
  
  // اخفي اللودر واظهر النتيجة
  btn.disabled = false;
  loader.classList.remove('show');
  showResult(story, currentStyle);
};

// عرض صفحة النتيجة
function showResult(story, style) {
  const t = translations[currentLang];
  const styleName = document.querySelector(`[data-style="${style}"] [data-ar]`).textContent;
  
  document.querySelector('.wrap').innerHTML = `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:60px;margin-bottom:20px">🎬</div>
      <h2 style="font-size:28px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:20px;margin:24px 0;text-align:right">
        <div style="color:#888;font-size:14px;margin-bottom:8px">الحكاية:</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:16px">${story}</div>
        <div style="color:#888;font-size:14px;margin-bottom:8px">الستايل:</div>
        <div style="font-size:18px;font-weight:700;color:#FFC300">${styleName}</div>
      </div>

      <div style="background:#000;border:2px solid #252525;border-radius:18px;padding:40px 20px;margin:24px 0">
        <i class="fas fa-play-circle" style="font-size:80px;color:#FFC300;opacity:0.5"></i>
        <p style="color:#666;margin-top:16px;font-size:14px">معاينة الفيديو</p>
      </div>

      <button onclick="downloadVideo()" class="big" style="margin-top:20px">
        <i class="fas fa-download"></i> ${t.download}
      </button>
      
      <button onclick="shareVideo()" class="btn" style="width:100%;margin-top:12px;height:58px">
        <i class="fas fa-share-alt"></i> ${t.share}
      </button>
      
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:12px;height:58px;border-color:#666;color:#888">
        <i class="fas fa-home"></i> ${t.backHome}
      </button>
    </div>
  `;
}

function downloadVideo() {
  alert(translations[currentLang].alertDone);
}

function shareVideo() {
  if(navigator.share) {
    navigator.share({
      title: 'Matrix AI',
      text: 'شوف الفيديو اللي عملتو',
      url: window.location.href
    });
  } else {
    alert('انسخ الرابط: ' + window.location.href);
  }
}
