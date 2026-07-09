let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';
let meSpeakReady = false;

// نحمل meSpeak.js - يشتغل offline على iPhone
const meSpeakScript = document.createElement('script');
meSpeakScript.src = 'https://cdn.jsdelivr.net/npm/mespeak@2.0.2/mespeak.min.js';
document.head.appendChild(meSpeakScript);

meSpeakScript.onload = ()=>{
  meSpeak.loadConfig('https://cdn.jsdelivr.net/npm/mespeak@2.0.2/mespeak_config.json');
  meSpeak.loadVoice('https://cdn.jsdelivr.net/npm/mespeak@2.0.2/voices/ar.json');
  meSpeak.loadVoice('https://cdn.jsdelivr.net/npm/mespeak@2.0.2/voices/cs.json');
  meSpeakReady = true;
};

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    generating: '🚀 نولدو في الفيديو...',
    resultTitle: 'الفيديو جاهز! 🎉',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو 📥',
    story: 'الحكاية:', style: 'الستايل:', voice: 'الصوت:',
    error: 'صار خطأ، عاود جرب',
    tapToPlay: 'اضغط باش نسمعوك 🔊'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    generating: '🚀 Generuji video...',
    resultTitle: 'Video hotové! 🎉',
    backHome: 'Zpět domů',
    download: 'Stáhnout 📥',
    story: 'Příběh:', style: 'Styl:', voice: 'Hlas:',
    error: 'Nastala chyba, zkuste znovu',
    tapToPlay: 'Klepněte pro spuštění 🔊'
  }
};

const trendStories = [
  "في تونس القديمة، كان هناك ساحر يحمي المدينة بقوة غامضة، حتى جاء يوم ظهر فيه تنين أسود يهدد الجميع...",
  "في سنة 3024، وقع رجل آلي في حب فتاة بشرية، قصة حب مستحيلة لكن القلب لا يعرف المستحيل...",
  "دار مهجورة في قرية بعيدة، كل من دخلها سمع أصوات أطفال يضحكون في الليل..."
];

window.useTrend = function(i){
  document.getElementById('storyInput').value = trendStories[i];
  document.querySelectorAll('.style-btn')[i===1?1:i===2?3:0].click();
  window.scrollTo({top:0, behavior:'smooth'});
}

let finalVideoBlob = null;

function getSavedVideos(){ return JSON.parse(localStorage.getItem('matrix_videos')||'[]'); }
function saveVideo(s,st,vc,lang){
  const a=getSavedVideos();
  a.unshift({id:Date.now(),story:s,style:st,voice:vc,lang:lang,date:new Date().toLocaleDateString()});
  localStorage.setItem('matrix_videos',JSON.stringify(a.slice(0,20)));
}

// تغيير اللغة
document.querySelectorAll('.lang button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.lang button').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    currentLang=btn.dataset.lang;
    document.documentElement.lang=currentLang;
    document.documentElement.dir=currentLang==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-ar]').forEach(el=>{
      const txt = el.dataset[currentLang];
      if(!txt) return;
      if(el.tagName==='INPUT') el.placeholder=txt;
      else el.textContent=txt;
    });
  };
});

document.querySelectorAll('.style-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.style-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    currentStyle=btn.dataset.style;
  };
});

document.querySelectorAll('.voice-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.voice-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    currentVoice=btn.dataset.voice;
  };
});

// توليد الفيديو - نسخة تخدم
document.getElementById('generateBtn').onclick = async ()=>{
  const story = document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);
  if(!meSpeakReady) return alert('استنى ثانيتين، قاعد نحمل الصوت...');

  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');

  btn.disabled=true;
  loader.classList.add('show');
  loader.innerHTML = `
    <div style="text-align:center">
      <p style="color:#FFC300;font-size:18px;margin-bottom:20px">${translations[currentLang].tapToPlay}</p>
      <button id="startBtn" class="big" style="width:220px;margin:0 auto">▶️ Start</button>
    </div>
  `;

  document.getElementById('startBtn').onclick = async ()=>{
    loader.innerHTML = `<div class="spinner"></div><p>${translations[currentLang].generating}</p>`;

    try{
      await generateVideoLocal(story, currentStyle, currentVoice, currentLang);
    }catch(e){
      console.error(e);
      loader.innerHTML = `<p style="color:#FF3B30">${translations[currentLang].error}</p>`;
      setTimeout(()=>{
        btn.disabled=false;
        loader.classList.remove('show');
      }, 2000);
    }
  };
};

async function generateVideoLocal(text, style, voice, lang){
  const canvas = document.createElement('canvas');
  canvas.width=720; canvas.height=1280;
  const ctx = canvas.getContext('2d');

  // نسجلو الفيديو - بدون صوت الأول
  const stream = canvas.captureStream(30);
  const mimeType = MediaRecorder.isTypeSupported('video/mp4')? 'video/mp4' : 'video/webm';
  const recorder = new MediaRecorder(stream, {mimeType});
  let chunks=[];
  recorder.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };

  const videoPromise = new Promise(resolve=>{
    recorder.onstop = ()=>{
      finalVideoBlob = new Blob(chunks, {type: mimeType});
      resolve();
    };
  });

  // نحضرو الخلفية
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  const prompt = encodeURIComponent(text.substring(0,40) + ' ' + style + ' cinematic dark');
  bgImg.src = `https://image.pollinations.ai/prompt/${prompt}?width=720&height=1280&nologo=true&seed=${Date.now()}`;

  let frame=0, wordIndex=0;
  const words = text.split(' ');
  const totalDuration = Math.max(8000, words.length * 450);
  const wordDuration = totalDuration / words.length;

  const bgColors = {
    drama:['#1a0033','#4a0080'],
    action:['#330000','#cc0000'],
    funny:['#332200','#ffaa00'],
    horror:['#001100','#003300']
  };
  const colors = bgColors[style] || bgColors.drama;

  recorder.start(100);

  // نشغلو الصوت meSpeak
  const voiceOpts = {
    amplitude: 100,
    pitch: voice==='male'? 30 : 60,
    speed: 160,
    wordgap: 5,
    variant: lang==='ar'?'f5':'m1'
  };

  meSpeak.speak(text, voiceOpts);

  const drawInterval = setInterval(()=>{
    // خلفية
    if(bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, 720, 1280);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0,0,720,1280);
    } else {
      const grad = ctx.createLinearGradient(0,0,0,1280);
      grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[1]);
      ctx.fillStyle=grad; ctx.fillRect(0,0,720,1280);
    }

    // لوقو
    ctx.fillStyle='#FFC300'; ctx.font='bold 50px Outfit'; ctx.textAlign='center';
    ctx.shadowColor='#FFC300'; ctx.shadowBlur=30;
    ctx.fillText('Matrix AI', 360, 130);
    ctx.shadowBlur=0;

    // التايبوغرافي
    ctx.shadowColor='rgba(0,0,0,1)'; ctx.shadowBlur=25;
    const visibleWords = words.slice(Math.max(0, wordIndex-1), wordIndex+3);

    visibleWords.forEach((word, i)=>{
      const y = 500 + i*80;
      const isCurrent = i === Math.min(1, wordIndex);
      ctx.font = isCurrent? 'bold 48px Cairo' : 'bold 36px Cairo';
      ctx.fillStyle = isCurrent? '#FFC300' : 'rgba(255,255,255,0.4)';
      ctx.fillText(word, 360, y);
    });
    ctx.shadowBlur=0;

    // موجة
    ctx.strokeStyle=`rgba(255,195,0,${0.7+Math.sin(frame/4)*0.3})`;
    ctx.lineWidth=8;
    ctx.beginPath();
    for(let i=0; i<720; i+=4){
      ctx.lineTo(i, 1200 + Math.sin((i+frame*12)/18)*40);
    }
    ctx.stroke();

    frame++;
    if(frame % Math.floor(wordDuration/33) === 0 && wordIndex < words.length-1) wordIndex++;
  }, 33);

  // نوقفو بعد المدة
  setTimeout(()=>{
    clearInterval(drawInterval);
    if(recorder.state === 'recording') recorder.stop();
  }, totalDuration + 1000);

  await videoPromise;

  saveVideo(text, style, voice, lang);
  showResult(text, style, voice, finalVideoBlob, lang);
}

function showResult(story, style, voice, blob, lang){
  const t=translations[currentLang];
  const videoUrl = URL.createObjectURL(blob);
  const voiceLabel = lang==='ar'? (voice==='male'?'صوت راجل':'صوت مرا') : (voice==='male'?'Mužský hlas':'Ženský hlas');

  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      <video src="${videoUrl}" controls playsinline style="width:100%;border-radius:18px;border:2px solid #8B5CF6;background:#000;margin-bottom:16px;aspect-ratio:9/16;object-fit:cover"></video>
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div>
        <div style="font-size:14px;font-weight:700;line-height:1.7;margin-bottom:10px;max-height:120px;overflow:auto">${story}</div>
        <div style="color:#888;font-size:12px">${t.voice}</div>
        <div style="font-size:14px;font-weight:700;color:#FFC300">${voiceLabel} • ${style}</div>
      </div>
      <p style="text-align:center;color:#888;font-size:12px;margin-bottom:14px">⚠️ الفيديو بدون صوت - شغل الصوت من الزر ▶️ في الفيديو</p>
      <button id="downloadBtn" class="big">📥 ${t.download}</button>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:10px;height:58px;border-color:#666;color:#888">🏠 ${t.backHome}</button>
    </div>
  `;
  document.getElementById('downloadBtn').onclick=()=>{
    const a=document.createElement('a');
    a.href=videoUrl;
    a.download=`matrix-${Date.now()}.mp4`;
    a.click();
  };

  document.getElementById('loader').classList.remove('show');
  document.getElementById('generateBtn').disabled=false;
}

// التنقل
document.querySelectorAll('nav a').forEach((btn,i)=>{
  btn.onclick=(e)=>{
    e.preventDefault();
    meSpeak.stop();
    document.querySelectorAll('nav a').forEach(a=>a.classList.remove('on'));
    btn.classList.add('on');
    if(i===0||i===2){
      location.reload();
    }else if(i===1){
      alert(currentLang==='ar'? 'اكتشاف - قريباً...' : 'Objevit - Brzy...');
    }else if(i===3){
      const vids=getSavedVideos();
      if(vids.length===0){
        document.querySelector('.wrap').innerHTML=`<div style="padding:40px;text-align:center"><div style="font-size:60px">📁</div><h2>${currentLang==='ar'?'المكتبة فارغة':'Knihovna je prázdná'}</h2><p style="color:#888">${currentLang==='ar'?'الفيديوات اللي تولدهم باش يظهرو هنا':'Vaše videa se zde zobrazí'}</p><button onclick="location.reload()" class="big" style="margin-top:20px">+ ${currentLang==='ar'?'أنشئ فيديو جديد':'Vytvořit nové video'}</button></div>`;
      }else{
        let h=`<div style="padding:20px"><h2 style="text-align:center">📚 ${currentLang==='ar'?'المكتبة':'Knihovna'} - ${vids.length}</h2>`;
        vids.forEach(v=>{
          const vLabel = v.lang==='ar'? (v.voice==='male'?'راجل':'مرا') : (v.voice==='male'?'Muž':'Žena');
          h+=`<div style="background:#1A1A1A;border:1px solid #8B5CF6;border-radius:12px;padding:12px;margin:10px 0"><div style="font-weight:700">${v.story.substring(0,70)}...</div><div style="color:#FFC300;font-size:12px;margin-top:4px">${v.date} - ${vLabel} - ${v.style}</div></div>`;
        });
        h+=`<button onclick="location.reload()" class="big">🏠 ${currentLang==='ar'?'رجوع للرئيسية':'Zpět domů'}</button></div>`;
        document.querySelector('.wrap').innerHTML=h;
      }
    }else if(i===4){
      document.querySelector('.wrap').innerHTML=`<div style="padding:40px;text-align:center"><div style="font-size:80px">👤</div><h2>Matrix User</h2><p style="color:#888">${getSavedVideos().length} ${currentLang==='ar'?'فيديو':'videa'}</p><button onclick="location.reload()" class="big" style="margin-top:20px">🏠 ${currentLang==='ar'?'رجوع':'Zpět'}</button></div>`;
    }
  };
});
