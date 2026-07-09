let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    generating: '🚀 قاعد نولد فيديو MP4...',
    generating_male: 'قاعد نولد فيديو بصوت Hedi التونسي...',
    generating_female: 'قاعد نولد فيديو بصوت Reem التونسية...',
    resultTitle: 'الفيديو جاهز! 🎉',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو 📥',
    story: 'الحكاية:', style: 'الستايل:', voice: 'الصوت:'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    generating: '🚀 Generuji video...',
    generating_male: 'Generuji s hlasem Antonín...',
    generating_female: 'Generuji s hlasem Vlasta...',
    resultTitle: 'Video hotové! 🎉',
    backHome: 'Zpět domů',
    download: 'Stáhnout 📥',
    story: 'Příběh:', style: 'Styl:', voice: 'Hlas:'
  }
};

const trendStories = [
  "في تونس القديمة، كان هناك ساحر يحمي المدينة بقوة غامضة، حتى جاء يوم ظهر فيه تنين أسود يهدد الجميع، فخرج الساحر لمواجهته في معركة أسطورية...",
  "في سنة 3024، وقع رجل آلي في حب فتاة بشرية، قصة حب مستحيلة لكن القلب لا يعرف المستحيل، هل سينجح الحب ضد قوانين المستقبل؟",
  "دار مهجورة في قرية بعيدة، كل من دخلها سمع أصوات أطفال يضحكون في الليل، حتى جاء شاب شجاع وقرر كشف السر..."
];

// أصوات Edge TTS المجانية
const VOICES = {
  ar: { male: 'ar-TN-HediNeural', female: 'ar-TN-ReemNeural' },
  cs: { male: 'cs-CZ-AntoninNeural', female: 'cs-CZ-VlastaNeural' }
};

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

// اختيار الستايل
document.querySelectorAll('.style-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.style-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    currentStyle=btn.dataset.style;
  };
});

// اختيار الصوت
document.querySelectorAll('.voice-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.voice-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    currentVoice=btn.dataset.voice;
  };
});

// توليد الفيديو - النسخة المتصلّحة مع Edge TTS
document.getElementById('generateBtn').onclick = async ()=>{
  const story = document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);

  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');
  const pEl = loader.querySelector('p');

  btn.disabled=true;
  loader.classList.add('show');
  pEl.textContent = currentVoice==='male'? translations[currentLang].generating_male : translations[currentLang].generating_female;

  try{
    // 1. جيب الصوت من Edge TTS المجاني
    const voiceName = VOICES[currentLang][currentVoice];
    const audioBlob = await generateEdgeTTS(story, voiceName);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // 2. حضّر الكانفاس للفيديو
    const canvas = document.createElement('canvas');
    canvas.width=720; canvas.height=1280;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);

    // 3. دمج الصوت مع الفيديو
    const audioStream = audio.captureStream? audio.captureStream() : null;
    if(audioStream) {
      audioStream.getAudioTracks().forEach(track => stream.addTrack(track));
    }

    let mimeType = 'video/webm;codecs=vp9';
    if(!MediaRecorder.isTypeSupported(mimeType)) mimeType='video/webm';

    const recorder = new MediaRecorder(stream, {mimeType});
    let chunks=[];
    recorder.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };

    recorder.onstop = ()=>{
      finalVideoBlob = new Blob(chunks, {type: mimeType});
      saveVideo(story, currentStyle, currentVoice, currentLang);
      showResult(story, currentStyle, currentVoice, finalVideoBlob, currentLang);
    };

    // 4. ابدأ التسجيل + الصوت + الرسم
    recorder.start(100);
    await audio.play();

    const words = story.split(' ');
    const wordDuration = (audio.duration || 7) / words.length * 1000;
    let frame=0, wordIndex=0;

    const bgColors = {
      drama:['#1a0033','#4a0080'],
      action:['#330000','#cc0000'],
      funny:['#332200','#ffaa00'],
      horror:['#001100','#003300']
    };
    const colors = bgColors[currentStyle] || bgColors.drama;

    // صورة خلفية مجانية من pollinations
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(story.substring(0,50))}%20${currentStyle}%20cinematic%204k?width=720&height=1280&nologo=true`;

    const drawInterval = setInterval(()=>{
      // خلفية
      if(bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, 720, 1280);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0,0,720,1280);
      } else {
        const grad = ctx.createLinearGradient(0,0,0,1280);
        grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[1]);
        ctx.fillStyle=grad; ctx.fillRect(0,0,720,1280);
      }

      // لوقو
      ctx.fillStyle='#FFC300'; ctx.font='bold 42px Outfit'; ctx.textAlign='center';
      ctx.shadowColor='#FFC300'; ctx.shadowBlur=20;
      ctx.fillText('Matrix AI', 360, 100);
      ctx.shadowBlur=0;

      // الصوت
      ctx.fillStyle='#fff'; ctx.font='24px Cairo';
      const voiceLabel = currentLang==='ar'
       ? (currentVoice==='male'?'🎤 Hedi - راجل تونسي':'🎤 Reem - مرا تونسية')
        : (currentVoice==='male'?'🎤 Antonín':'🎤 Vlasta');
      ctx.fillText(voiceLabel, 360, 150);

      // التايبوغرافي المتحرك - كلمة بكلمة
      ctx.fillStyle='#fff';
      ctx.font='bold 32px Cairo';
      ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=10;

      const visibleWords = words.slice(Math.max(0, wordIndex-3), wordIndex+1);
      visibleWords.forEach((word, i)=>{
        const y = 500 + i*50;
        const alpha = i === visibleWords.length-1? 1 : 0.4;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        if(i === visibleWords.length-1) {
          ctx.fillStyle = '#FFC300';
          ctx.font = 'bold 38px Cairo';
        } else {
          ctx.font = 'bold 28px Cairo';
        }
        ctx.fillText(word, 360, y);
      });
      ctx.shadowBlur=0;

      // موجة صوت
      ctx.strokeStyle=`rgba(255,195,0,${0.5+Math.sin(frame/10)*0.5})`;
      ctx.lineWidth=3;
      ctx.beginPath();
      for(let i=0; i<720; i+=10){
        ctx.lineTo(i, 1100 + Math.sin((i+frame*5)/30)*20);
      }
      ctx.stroke();

      frame++;
      if(frame % Math.floor(wordDuration/33) === 0 && wordIndex < words.length-1) wordIndex++;
    }, 33);

    // وقف بعد ما يكمل الصوت
    audio.onended = ()=>{
      clearInterval(drawInterval);
      recorder.stop();
      audio.pause();
    };

    // احتياطي: وقف بعد 30 ثانية
    setTimeout(()=>{
      if(recorder.state === 'recording'){
        clearInterval(drawInterval);
        recorder.stop();
        audio.pause();
      }
    }, 30000);

  }catch(e){
    console.error(e);
    pEl.textContent='صار خطأ، عاود جرب. تأكد من الإنترنت';
    btn.disabled=false; loader.classList.remove('show');
  }
};

// دالة Edge TTS المجانية
async function generateEdgeTTS(text, voice){
  const response = await fetch('https://api.streamelements.com/kappa/v2/speech?voice=' + voice + '&text=' + encodeURIComponent(text));
  if(!response.ok) throw new Error('TTS failed');
  return await response.blob();
}

function showResult(story, style, voice, blob, lang){
  const t=translations[lang];
  const videoUrl = URL.createObjectURL(blob);
  const voiceLabel = lang==='ar'
   ? (voice==='male'?'Hedi راجل تونسي':'Reem مرا تونسية')
    : (voice==='male'?'Antonín':'Vlasta');

  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      <video src="${videoUrl}" controls autoplay loop playsinline style="width:100%;border-radius:18px;border:2px solid #8B5CF6;background:#000;margin-bottom:16px;aspect-ratio:9/16;object-fit:cover"></video>
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div>
        <div style="font-size:14px;font-weight:700;line-height:1.7;margin-bottom:10px;max-height:120px;overflow:auto">${story}</div>
        <div style="color:#888;font-size:12px">${t.voice}</div>
        <div style="font-size:14px;font-weight:700;color:#FFC300">${voiceLabel} • ${style}</div>
      </div>
      <button id="downloadBtn" class="big">📥 ${t.download}</button>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:10px;height:58px;border-color:#666;color:#888">🏠 ${t.backHome}</button>
    </div>
  `;
  document.getElementById('downloadBtn').onclick=()=>{
    const a=document.createElement('a');
    a.href=videoUrl;
    a.download=`matrix-${Date.now()}.webm`;
    a.click();
  };
}

// التنقل
document.querySelectorAll('nav a').forEach((btn,i)=>{
  btn.onclick=(e)=>{
    e.preventDefault();
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
          const vLabel = v.lang==='ar'
           ? (v.voice==='male'?'Hedi راجل':'Reem مرا')
            : (v.voice==='male'?'Antonín':'Vlasta');
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

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()));
}
