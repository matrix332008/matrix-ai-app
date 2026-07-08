let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';

// زيد هذا السطر برك
const BACKEND_URL = "https://matrix-ai-app.onrender.com";

function hashCode(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i);return Math.abs(h);}

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    alertDone: 'تم توليد الفيديو بنجاح! 🎉',
    generating: 'جاري توليد فيديو AI حقيقي من قصتك...',
    resultTitle: 'الفيديو الحقيقي جاهز!',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو MP4 📥',
    share: 'مشاركة TikTok / Facebook',
    story: 'الحكاية:', style: 'الستايل:', voice: 'الصوت:', male: 'راجل (Hedi التونسي)', female: 'مرا (Reem التونسية)',
    library: 'المكتبة', libraryEmpty: 'المكتبة فارغة', libraryDesc: 'الفيديوات اللي تولدهم باش يظهرو هنا',
    createNew: 'أنشئ فيديو جديد', videos: 'الفيديوات', plan: 'الخطة', free: 'مجاني',
    delete: 'حذف', copied: 'تم النسخ!', downloading: 'جاري توليد MP4...', loading: 'جاري تحميل الفيديو...', playing: 'قاعد يخدم ▶️'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh', alertDone: 'Video hotové! 🎉',
    generating: 'Generuji AI video...', resultTitle: 'AI video je hotové!',
    backHome: 'Zpět domů', download: 'Stáhnout video MP4 📥', share: 'Sdílet TikTok / Facebook',
    story: 'Příběh:', style: 'Styl:', voice: 'Hlas:', male: 'Muž', female: 'Žena',
    library: 'Knihovna', libraryEmpty: 'Knihovna prázdná', libraryDesc: 'Videa zde',
    createNew: 'Vytvořit video', videos: 'Videa', plan: 'Plán', free: 'Zdarma',
    delete: 'Smazat', copied: 'Zkopírováno!', downloading: 'Generuji MP4...', loading: 'Načítám video...', playing: 'Přehrávám ▶️'
  }
};

const trendStories = [
  "في تونس القديمة، كان هناك ساحر يحمي المدينة بقوة غامضة، حتى جاء يوم ظهر فيه تنين أسود يهدد الجميع...",
  "في سنة 3024، وقع رجل آلي في حب فتاة بشرية، قصة حب مستحيلة لكن القلب لا يعرف المستحيل، حاربا العالم لأجل حبهما...",
  "دار مهجورة في قرية بعيدة، كل من دخلها سمع أصوات أطفال يضحكون في الليل، حتى جاء شاب قرر كشف السر..."
];
function useTrend(i){
  document.getElementById('storyInput').value = trendStories[i];
  document.querySelectorAll('.style-btn')[i===2?3:i===1?2:0].click();
  window.scrollTo({top:0, behavior:'smooth'});
  document.getElementById('storyInput').focus();
}

let audioPlayer=null, finalVideoBlob=null;
function stopAudio(){if(audioPlayer){try{audioPlayer.pause();}catch(e){}audioPlayer=null;}try{speechSynthesis.cancel();}catch(e){}}

// *** هذا اللي تصلح - توا صوت تونسي حقيقي ***
async function speakNatural(text){
  stopAudio();
  const clean=text.replace(/[\u064B-\u065F\u0670ـ]/g,'').replace(/\s+/g,' ').trim().substring(0,800);
  if(!clean) return;
  try{
    // نحاولو نجيبو صوت تونسي من الـ Backend الجديد
    const res = await fetch(`${BACKEND_URL}/tts`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text: clean, voice: currentVoice, lang: currentLang })
    });
    if(res.ok){
      const blob = await res.blob();
      const audio=new Audio(URL.createObjectURL(blob));
      audioPlayer=audio;
      await audio.play();
      return;
    }
    throw new Error('backend fail');
  }catch(e){
    // كان الـ Backend طايح، نستعملو المؤقت السعودي
    try{
      const voiceName=currentLang==='ar'?(currentVoice==='female'?'Zeina':'Tarik'):(currentVoice==='female'?'Vlasta':'Jan');
      const url=`https://api.streamelements.com/kappa/v2/speech?voice=${voiceName}&text=${encodeURIComponent(clean)}`;
      const res2=await fetch(url);
      if(!res2.ok) throw Error();
      const blob=await res2.blob();
      const audio=new Audio(URL.createObjectURL(blob));
      audioPlayer=audio;
      await audio.play();
    }catch(e2){
      const u=new SpeechSynthesisUtterance(clean);
      u.lang=currentLang==='ar'?'ar-SA':'cs-CZ';u.rate=0.85;u.pitch=currentVoice==='female'?1.05:0.65;
      const vs=speechSynthesis.getVoices();const ls=vs.filter(v=>v.lang.toLowerCase().startsWith(currentLang==='ar'?'ar':'cs'));
      if(ls.length>0) u.voice=ls.find(v=>v.name.toLowerCase().includes('google'))||ls[0];
      speechSynthesis.speak(u);
    }
  }
}

function getSavedVideos(){ return JSON.parse(localStorage.getItem('matrix_videos')||'[]'); }
function saveVideo(s,st,im,vc){ const a=getSavedVideos(); a.unshift({id:Date.now(),story:s,style:st,images:im,voice:vc,date:new Date().toLocaleDateString(currentLang==='ar'?'ar-TN':'cs-CZ')}); localStorage.setItem('matrix_videos',JSON.stringify(a)); }
function deleteVideo(id){ localStorage.setItem('matrix_videos', JSON.stringify(getSavedVideos().filter(x=>x.id!==id))); showLibrary(); }
async function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);}

document.querySelectorAll('.lang button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.lang button').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); currentLang=btn.dataset.lang;
    document.documentElement.lang=currentLang; document.documentElement.dir=currentLang==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-ar]').forEach(el=>{
      if(el.tagName==='INPUT') el.placeholder=el.dataset[currentLang];
      else if(el.tagName==='SPAN' && el.hasAttribute('data-ar')) el.textContent=el.dataset[currentLang];
      else if(!el.querySelector('span[data-ar]')) el.textContent=el.dataset[currentLang];
    });
  };
});
document.querySelectorAll('.style-btn').forEach(btn=>{ btn.onclick=()=>{ document.querySelectorAll('.style-btn').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); currentStyle=btn.dataset.style; }; });
document.querySelectorAll('.voice-btn').forEach(btn=>{ btn.onclick=()=>{ document.querySelectorAll('.voice-btn').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); currentVoice=btn.dataset.voice; }; });

document.getElementById('generateBtn').onclick = async ()=>{
  const story=document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);
  const btn=document.getElementById('generateBtn'), loader=document.getElementById('loader');
  const pEl=loader.querySelector('p'); const oldText=pEl.textContent;
  btn.disabled=true; loader.classList.add('show');
  try{
    pEl.textContent=`10% - ${currentLang==='ar'?'نحلل القصة...':'Analyzuji...'}`;
    const s1=story.substring(0,Math.floor(story.length/3)).substring(0,70);
    const s2=story.substring(Math.floor(story.length/3),Math.floor(story.length*2/3)).substring(0,70);
    const s3=story.substring(Math.floor(story.length*2/3)).substring(0,70);
    const seed=hashCode(story+currentStyle);
    const urls=[
      `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic ${currentStyle} movie, ${s1}, ultra realistic`)}?width=1024&height=576&seed=${seed}&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic ${currentStyle} movie, ${s2}, dramatic`)}?width=1024&height=576&seed=${seed+1}&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic ${currentStyle} movie, ${s3}, emotional`)}?width=1024&height=576&seed=${seed+2}&nologo=true`
    ];
    const images=[];
    for(let i=0;i<urls.length;i++){
      pEl.textContent=`${30+i*25}% - ${currentLang==='ar'?`جاري تحميل الفيديو ${i+1}/3...`:`Načítám ${i+1}/3...`}`;
      await new Promise(res=>{ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>{images.push(urls[i]);res();}; im.onerror=()=>{images.push(urls[i]);res();}; im.src=urls[i]; });
    }
    pEl.textContent=`100% - ${currentLang==='ar'?'تم! ✅':'Hotovo! ✅'}`;
    await new Promise(r=>setTimeout(r,400));
    saveVideo(story,currentStyle,images,currentVoice);
    showResult(story,currentStyle,images,currentVoice);
  }finally{ btn.disabled=false; loader.classList.remove('show'); pEl.textContent=oldText; }
};

function showResult(story,style,images,voice){
  const t=translations[currentLang];
  const styleName=document.querySelector(`[data-style="${style}"] span[data-ar]`)?.dataset[currentLang]||style;
  const voiceName=t[voice];
  finalVideoBlob=null;
  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      <div style="position:relative;width:100%;border-radius:18px;border:2px solid #8B5CF6;overflow:hidden;background:#000;margin-bottom:16px;aspect-ratio:16/9">
        <canvas id="videoCanvas" width="1024" height="576" style="width:100%;height:100%;display:block"></canvas>
        <button id="playBtn" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:rgba(255,195,0,0.95);border:0;color:#000;font-size:32px;display:grid;place-items:center;cursor:pointer"><i class="fas fa-play"></i></button>
        <div id="recBadge" style="display:none;position:absolute;top:10px;left:10px;background:#FF3B30;color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800">● REC MP4</div>
        <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:6px;background:rgba(0,0,0,0.6);padding:6px 10px;border-radius:20px">
          <span id="dot0" style="width:8px;height:8px;border-radius:50%;background:#FFC300"></span><span id="dot1" style="width:8px;height:8px;border-radius:50%;background:#555"></span><span id="dot2" style="width:8px;height:8px;border-radius:50%;background:#555"></span>
        </div>
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div><div style="font-size:14px;font-weight:700;line-height:1.7;margin-bottom:10px;max-height:250px;overflow:auto">${story}</div>
        <div style="color:#888;font-size:12px">${t.style}</div><div style="font-size:14px;font-weight:700;color:#FFC300;margin-bottom:8px">${styleName}</div>
        <div style="color:#888;font-size:12px">${t.voice}</div><div style="font-size:14px;font-weight:700;color:#8B5CF6">${voiceName}</div>
      </div>
      <button id="downloadBtn" class="big"><i class="fas fa-download"></i> ${t.download}</button>
      <button id="shareBtn" class="btn" style="width:100%;margin-top:10px;height:58px"><i class="fas fa-share-alt"></i> ${t.share}</button>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:10px;height:58px;border-color:#666;color:#888"><i class="fas fa-home"></i> ${t.backHome}</button>
      <video id="finalVideo" controls playsinline style="display:none;width:100%;margin-top:14px;border-radius:16px;border:2px solid #FFC300"></video>
    </div>
  `;

  const canvas=document.getElementById('videoCanvas'),ctx=canvas.getContext('2d');
  const playBtn=document.getElementById('playBtn'),recBadge=document.getElementById('recBadge'),finalVideo=document.getElementById('finalVideo');
  let cur=0,playing=false,interval,mediaRecorder,recordedChunks=[];
  const loadedImgs=[];
  (async()=>{for(let u of images){const im=new Image();im.crossOrigin='anonymous';im.src=u;await new Promise(r=>{im.onload=r;im.onerror=r;});loadedImgs.push(im);}if(loadedImgs[0])ctx.drawImage(loadedImgs[0],0,0,1024,576);})();

  function startRec(){
    const stream=canvas.captureStream(30);
    recordedChunks=[];finalVideoBlob=null;
    mediaRecorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'});
    mediaRecorder.ondataavailable=e=>{if(e.data.size>0) recordedChunks.push(e.data);};
    mediaRecorder.onstop=()=>{
      const blob=new Blob(recordedChunks,{type:'video/webm'});
      finalVideoBlob=blob;
      finalVideo.src=URL.createObjectURL(blob);
      finalVideo.style.display='block';
      recBadge.style.display='none';
    };
    mediaRecorder.start();recBadge.style.display='block';
  }

  async function start(){if(playing) return;playing=true;playBtn.innerHTML='<i class="fas fa-pause"></i>';startRec();speakNatural(story);interval=setInterval(()=>{cur=(cur+1)%loadedImgs.length;if(loadedImgs[cur])ctx.drawImage(loadedImgs[cur],0,0,1024,576);[0,1,2].forEach(i=>{const d=document.getElementById('dot'+i);if(d) d.style.background=i===cur?'#FFC300':'#555';});},3000);}
  function stop(){playing=false;playBtn.innerHTML='<i class="fas fa-play"></i>';clearInterval(interval);stopAudio();if(mediaRecorder&&mediaRecorder.state!=='inactive')mediaRecorder.stop();}
  playBtn.onclick=()=>playing?stop():start();

  document.getElementById('downloadBtn').onclick=async()=>{
    const b=document.getElementById('downloadBtn');
    if(finalVideoBlob){
      b.innerHTML=`<i class="fas fa-check"></i> ${currentLang==='ar'?'تم التحميل MP4!':'Staženo MP4!'}`;
      await downloadBlob(finalVideoBlob,`matrix-${hashCode(story)}.webm`);
      setTimeout(()=>b.innerHTML=`<i class="fas fa-download"></i> ${t.download}`,2000);
    }else{
      b.innerHTML=`<i class="fas fa-spinner fa-spin"></i> ${t.downloading}`;
      await start();
      setTimeout(async()=>{stop();if(finalVideoBlob) await downloadBlob(finalVideoBlob,`matrix-${hashCode(story)}.webm`);b.innerHTML=`<i class="fas fa-download"></i> ${t.download}`;},6000);
    }
  };

  document.getElementById('shareBtn').onclick=()=>{
    const url=images[0]; const text=`شوف الفيديو اللي عملتو بـ Matrix AI 🔥`;
    if(navigator.share && navigator.canShare({title:'Matrix AI', text:text, url:url})){ navigator.share({title:'Matrix AI Video', text:text, url:url}); }
    else{
      const choice=prompt(currentLang==='ar'?'اختار: 1=Facebook, 2=TikTok, 3=نسخ الرابط':'Vyber: 1=Facebook, 2=TikTok, 3=Kopírovat');
      if(choice==='1') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank');
      else if(choice==='2'){ navigator.clipboard.writeText(url); alert(currentLang==='ar'?'تم نسخ الرابط! افتح TikTok والصق':'Odkaz zkopírován!'); window.open('https://www.tiktok.com/upload','_blank'); }
      else{ navigator.clipboard.writeText(url); alert(t.copied); }
    }
  };
  setTimeout(()=>start(),700);
}

document.querySelectorAll('nav a').forEach((btn,i)=>{
  btn.onclick=(e)=>{ e.preventDefault(); document.querySelectorAll('nav a').forEach(a=>a.classList.remove('on')); btn.classList.add('on'); if(i===0||i===2) location.reload(); if(i===1) alert('قريباً...'); if(i===3) showLibrary(); if(i===4) showProfile(); };
});
function showLibrary(){
  const t=translations[currentLang], vids=getSavedVideos();
  if(vids.length===0){ document.querySelector('.wrap').innerHTML=`<div style="padding:40px 20px;text-align:center"><i class="fas fa-folder-open" style="font-size:80px;color:#8B5CF6;margin-bottom:20px"></i><h2 style="font-size:26px;margin-bottom:12px">${t.libraryEmpty}</h2><button onclick="location.reload()" class="big"><i class="fas fa-plus"></i> ${t.createNew}</button></div>`; return; }
  document.querySelector('.wrap').innerHTML=`<div style="padding:20px"><h2 style="text-align:center;font-size:24px;margin-bottom:16px;font-weight:900">${t.library}</h2><div id="libList"></div></div>`;
  const list=document.getElementById('libList');
  vids.forEach(v=>{
    const row=document.createElement('div'); row.style.cssText="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:16px;padding:12px;margin-bottom:14px";
    row.innerHTML=`<img src="${v.images[0]}" style="width:100%;border-radius:12px;margin-bottom:10px;aspect-ratio:16/9;object-fit:cover"><div style="font-weight:700;margin-bottom:6px;font-size:14px">${v.story.substring(0,80)}...</div><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:#FFC300;font-size:12px">${v.date}</span><div style="display:flex;gap:6px"><button class="playBtn btn" style="height:36px;padding:0 12px"><i class="fas fa-play"></i></button><button class="delBtn" style="background:#FF3B30;border:0;color:#fff;padding:6px 12px;border-radius:8px;font-weight:700"><i class="fas fa-trash"></i> ${t.delete}</button></div></div>`;
    row.querySelector('.playBtn').onclick=()=>showResult(v.story,v.style,v.images,v.voice);
    row.querySelector('.delBtn').onclick=()=>deleteVideo(v.id); list.appendChild(row);
  });
}
function showProfile(){
  const t=translations[currentLang];
  document.querySelector('.wrap').innerHTML=`<div style="padding:40px 20px;text-align:center"><i class="fas fa-user-circle" style="font-size:100px;color:#FFC300;margin-bottom:20px"></i><h2 style="font-size:28px;margin-bottom:8px">Matrix User</h2><p style="color:#888;margin-bottom:30px">user@matrix.ai</p><div style="background:#1A1A1A;border-radius:18px;padding:20px;text-align:right"><div style="display:flex;justify-content:space-between;margin-bottom:16px"><span style="color:#888">${t.videos}</span><span style="font-weight:800;color:#FFC300">${getSavedVideos().length}</span></div><div style="display:flex;justify-content:space-between"><span style="color:#888">${t.plan}</span><span style="font-weight:800;color:#8B5CF6">${t.free}</span></div></div><button onclick="location.reload()" class="btn" style="width:100%;margin-top:30px;height:58px"><i class="fas fa-home"></i> ${t.backHome}</button></div>`;
}
if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
