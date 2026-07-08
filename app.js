let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';

function hashCode(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i);return Math.abs(h);}

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    generating: '🚀 قاعد نولد فيديو MP4...',
    generating_male: 'قاعد نولد فيديو بصوت Hedi الراجل التونسي...',
    generating_female: 'قاعد نولد فيديو بصوت Reem المرا التونسية...',
    resultTitle: 'الفيديو جاهز! 🎉',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو 📥',
    story: 'الحكاية:', style: 'الستايل:', voice: 'الصوت:'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh',
    generating: '🚀 Generuji...',
    generating_male: 'Generuji s hlasem Antonin...',
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

window.useTrend = function(i){
  document.getElementById('storyInput').value = trendStories[i];
  document.querySelectorAll('.style-btn')[i===1?1:i===2?3:0].click();
  window.scrollTo({top:0, behavior:'smooth'});
}

let finalVideoBlob = null;

function getSavedVideos(){ return JSON.parse(localStorage.getItem('matrix_videos')||'[]'); }
function saveVideo(s,st,vc){ const a=getSavedVideos(); a.unshift({id:Date.now(),story:s,style:st,voice:vc,date:new Date().toLocaleDateString()}); localStorage.setItem('matrix_videos',JSON.stringify(a.slice(0,20))); }

document.querySelectorAll('.lang button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.lang button').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); currentLang=btn.dataset.lang;
    document.documentElement.lang=currentLang; document.documentElement.dir=currentLang==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-ar]').forEach(el=>{
      const txt = el.dataset[currentLang]; if(!txt) return;
      if(el.tagName==='INPUT') el.placeholder=txt; else el.textContent=txt;
    });
  };
});

document.querySelectorAll('.style-btn').forEach(btn=>{
  btn.onclick=()=>{ document.querySelectorAll('.style-btn').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); currentStyle=btn.dataset.style; };
});

document.querySelectorAll('.voice-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.voice-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); currentVoice=btn.dataset.voice;
  };
});

document.getElementById('generateBtn').onclick = async ()=>{
  const story = document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);

  const btn = document.getElementById('generateBtn');
  const loader = document.getElementById('loader');
  const pEl = loader.querySelector('p');
  const selectedVoice = currentVoice;
  const selectedStyle = currentStyle;

  btn.disabled=true;
  loader.classList.add('show');
  pEl.textContent = selectedVoice==='male'? translations[currentLang].generating_male : translations[currentLang].generating_female;

  try{
    const canvas = document.createElement('canvas');
    canvas.width=720; canvas.height=1280;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);

    // === إصلاح لكل الأجهزة ===
    let mimeType = '';
    if(MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) mimeType='video/webm;codecs=vp9';
    else if(MediaRecorder.isTypeSupported('video/webm')) mimeType='video/webm';
    else if(MediaRecorder.isTypeSupported('video/mp4')) mimeType='video/mp4';

    let recorder;
    try{
      recorder = new MediaRecorder(stream, mimeType? {mimeType} : undefined);
    }catch(e){
      // iPhone قديم - نوري فيديو حي
      pEl.textContent='✅ يخدم!';
      showLiveCanvas(story, selectedStyle, selectedVoice, canvas);
      speakVoice(story, selectedVoice);
      btn.disabled=false; loader.classList.remove('show');
      return;
    }

    let chunks=[];
    recorder.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };
    recorder.onstop = ()=>{
      finalVideoBlob = new Blob(chunks, {type: mimeType || 'video/webm'});
      saveVideo(story, selectedStyle, selectedVoice);
      showResult(story, selectedStyle, selectedVoice, finalVideoBlob);
      speakVoice(story, selectedVoice);
    };

    function speakVoice(txt, v){
      try{
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(txt.substring(0,300));
        utter.lang = 'ar-SA';
        utter.rate = 0.95;
        utter.pitch = v==='male'? 0.7 : 1.3;
        speechSynthesis.speak(utter);
      }catch(e){}
    }

    recorder.start(100);

    let frame=0;
    const bgColors = {drama:['#1a0033','#4a0080'], action:['#330000','#cc0000'], funny:['#332200','#ffaa00'], horror:['#001100','#003300']};
    const colors = bgColors[selectedStyle] || bgColors.drama;

    const draw = setInterval(()=>{
      const grad = ctx.createLinearGradient(0,0,0,1280);
      grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[1]);
      ctx.fillStyle=grad; ctx.fillRect(0,0,720,1280);
      ctx.fillStyle='#FFC300'; ctx.font='bold 36px Cairo'; ctx.textAlign='center';
      ctx.fillText('Matrix AI', 360, 120);
      ctx.fillStyle='#fff'; ctx.font='22px Cairo';
      ctx.fillText(selectedVoice==='male'?'🎤 Hedi - راجل تونسي':'🎤 Reem - مرا تونسية', 360, 170);
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='bold 26px Cairo';
      wrapText(ctx, story, 360, 500, 600, 40);
      ctx.fillStyle=`rgba(255,195,0,${0.3+Math.sin(frame/10)*0.3})`;
      ctx.beginPath(); ctx.arc(360, 1000+Math.sin(frame/15)*20, 30, 0, Math.PI*2); ctx.fill();
      frame++;
    }, 33);

    setTimeout(()=>{ clearInterval(draw); recorder.stop(); }, 7000);

  }catch(e){
    console.error(e);
    pEl.textContent='صار خطأ، عاود جرب';
    btn.disabled=false; loader.classList.remove('show');
  }
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words=text.split(' '); let line='', lines=[];
  for(let n=0;n<words.length;n++){
    let testLine=line+words[n]+' ';
    if(ctx.measureText(testLine).width>maxWidth && n>0){ lines.push(line); line=words[n]+' '; }
    else line=testLine;
    if(lines.length>=8) break;
  }
  lines.push(line);
  lines.forEach((l,i)=> ctx.fillText(l, x, y + i*lineHeight));
}

function showResult(story, style, voice, blob){
  const t=translations[currentLang];
  const videoUrl = URL.createObjectURL(blob);
  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      <video src="${videoUrl}" controls autoplay loop playsinline style="width:100%;border-radius:18px;border:2px solid #8B5CF6;background:#000;margin-bottom:16px;aspect-ratio:9/16;object-fit:cover"></video>
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div><div style="font-size:14px;font-weight:700;line-height:1.7;margin-bottom:10px;max-height:120px;overflow:auto">${story}</div>
        <div style="color:#888;font-size:12px">${t.voice}</div><div style="font-size:14px;font-weight:700;color:#FFC300">${voice==='male'?'Hedi راجل تونسي':'Reem مرا تونسية'} • ${style}</div>
      </div>
      <button id="downloadBtn" class="big">📥 ${t.download}</button>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:10px;height:58px;border-color:#666;color:#888">🏠 ${t.backHome}</button>
    </div>
  `;
  document.getElementById('downloadBtn').onclick=()=>{
    const a=document.createElement('a'); a.href=videoUrl; a.download=`matrix-${Date.now()}.webm`; a.click();
  };
}

function showLiveCanvas(story, style, voice, canvas){
  canvas.style.width='100%'; canvas.style.borderRadius='18px'; canvas.style.border='2px solid #8B5CF6';
  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center">الفيديو يخدم! 🔊</h2>
      <div id="canvasContainer"></div>
      <p style="text-align:center;color:#FFC300;margin-top:10px">🔊 الصوت قاعد يخدم</p>
      <button onclick="location.reload()" class="big" style="margin-top:15px">حكاية جديدة</button>
    </div>
  `;
  document.getElementById('canvasContainer').appendChild(canvas);
}

document.querySelectorAll('nav a').forEach((btn,i)=>{
  btn.onclick=(e)=>{ e.preventDefault(); speechSynthesis.cancel(); if(i===0||i===2) location.reload(); };
});

if('serviceWorker' in navigator){ navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister())); }
