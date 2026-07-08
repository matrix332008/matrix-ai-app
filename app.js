let currentLang = 'ar';
let currentStyle = 'drama';
let currentVoice = 'female';
const BACKEND_URL = "https://matrix-ai-backend.onrender.com";

function hashCode(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i);return Math.abs(h);}

const translations = {
  ar: {
    alertEmpty: 'اكتب الحكاية الأول يا معلم',
    alertDone: 'تم توليد فيديو MP4 بصوت تونسي! 🎉',
    generating: '🚀 نسخنو في الموتور التونسي...',
    generating2: 'قاعد نولد فيديو MP4 بصوت Reem...',
    resultTitle: 'الفيديو التونسي MP4 جاهز!',
    backHome: 'رجوع للرئيسية',
    download: 'تحميل الفيديو MP4 📥',
    share: 'مشاركة TikTok / Facebook',
    story: 'الحكاية:', style: 'الستايل:', voice: 'الصوت:', male: 'راجل (Hedi)', female: 'مرا (Reem)',
    library: 'المكتبة', libraryEmpty: 'المكتبة فارغة', libraryDesc: 'الفيديوات اللي تولدهم باش يظهرو هنا',
    createNew: 'أنشئ فيديو جديد', videos: 'الفيديوات', plan: 'الخطة', free: 'مجاني',
    delete: 'حذف', copied: 'تم النسخ!', downloading: 'جاري التحميل...', loading: 'قاعد نولد في الفيديو التونسي...', playing: 'قاعد يخدم ▶️'
  },
  cs: {
    alertEmpty: 'Nejprve napiš příběh', alertDone: 'Video hotové! 🎉',
    generating: '🚀 Startuji motor...', generating2: 'Generuji MP4 video...',
    resultTitle: 'MP4 video je hotové!',
    backHome: 'Zpět domů', download: 'Stáhnout MP4 📥', share: 'Sdílet TikTok / Facebook',
    story: 'Příběh:', style: 'Styl:', voice: 'Hlas:', male: 'Muž', female: 'Žena',
    library: 'Knihovna', libraryEmpty: 'Knihovna prázdná', libraryDesc: 'Videa zde',
    createNew: 'Vytvořit video', videos: 'Videa', plan: 'Plán', free: 'Zdarma',
    delete: 'Smazat', copied: 'Zkopírováno!', downloading: 'Stahuji...', loading: 'Generuji...', playing: 'Přehrávám ▶️'
  }
};

const trendStories = [
  "في تونس القديمة، كان هناك ساحر يحمي المدينة بقوة غامضة، حتى جاء يوم ظهر فيه تنين أسود يهدد الجميع...",
  "في سنة 3024، وقع رجل آلي في حب فتاة بشرية، قصة حب مستحيلة لكن القلب لا يعرف المستحيل...",
  "دار مهجورة في قرية بعيدة، كل من دخلها سمع أصوات أطفال يضحكون في الليل..."
];
function useTrend(i){
  document.getElementById('storyInput').value = trendStories[i];
  document.querySelectorAll('.style-btn')[i===2?3:i===1?2:0].click();
  window.scrollTo({top:0, behavior:'smooth'});
  document.getElementById('storyInput').focus();
}

let audioPlayer=null, finalVideoBlob=null;
function stopAudio(){if(audioPlayer){try{audioPlayer.pause();}catch(e){}audioPlayer=null;}try{speechSynthesis.cancel();}catch(e){}}
function getSavedVideos(){ return JSON.parse(localStorage.getItem('matrix_videos')||'[]'); }
function saveVideo(s,st,vc){ const a=getSavedVideos(); a.unshift({id:Date.now(),story:s,style:st,voice:vc,date:new Date().toLocaleDateString(currentLang==='ar'?'ar-TN':'cs-CZ')}); localStorage.setItem('matrix_videos',JSON.stringify(a)); }
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

// *** مصلح: يفيق السيرفر اوتوماتيك بدون Error ***
document.getElementById('generateBtn').onclick = async ()=>{
  const story=document.getElementById('storyInput').value.trim();
  if(!story) return alert(translations[currentLang].alertEmpty);
  const btn=document.getElementById('generateBtn'), loader=document.getElementById('loader');
  const pEl=loader.querySelector('p'); const oldText=pEl.textContent;
  btn.disabled=true; loader.classList.add('show');

  async function generateWithRetry(){
    // محاولة 1
    try{
      pEl.textContent = translations[currentLang].generating;
      await fetch(`${BACKEND_URL}/health`).catch(()=>{}); // ping خفيف
      await new Promise(r=>setTimeout(r,3000));
      pEl.textContent = translations[currentLang].generating2;
      const res = await fetch(`${BACKEND_URL}/video/generate`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt: story, language: currentLang, style: currentStyle, voice: currentVoice})
      });
      if(res.ok) return await res.blob();
      throw new Error();
    }catch(e){
      // محاولة 2 اوتوماتيك بعد 15 ثانية - بدون alert
      pEl.textContent = currentLang==='ar'? '⏳ الموتور قاعد يسخن... 15 ثانية برك' : '⏳ Warming up... 15s';
      await new Promise(r=>setTimeout(r,15000));
      const res2 = await fetch(`${BACKEND_URL}/video/generate`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt: story, language: currentLang, style: currentStyle, voice: currentVoice})
      });
      if(res2.ok) return await res2.blob();
      throw new Error();
    }
  }

  try{
    const blob = await generateWithRetry();
    finalVideoBlob = blob;
    saveVideo(story,currentStyle,currentVoice);
    showResultMP4(story,currentStyle,currentVoice,blob);
  }catch(e){
    pEl.textContent = currentLang==='ar'? '⚠️ السيرفر مزحوم، دوس مرة أخرى' : '⚠️ Busy, tap again';
    await new Promise(r=>setTimeout(r,2000));
  }finally{
    btn.disabled=false; loader.classList.remove('show'); pEl.textContent=oldText;
  }
};

function showResultMP4(story,style,voice,blob){
  const t=translations[currentLang];
  const styleName=document.querySelector(`[data-style="${style}"] span[data-ar]`)?.dataset[currentLang]||style;
  const voiceName=t[voice];
  const videoUrl = URL.createObjectURL(blob);
  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      <video src="${videoUrl}" controls autoplay playsinline style="width:100%;border-radius:18px;border:2px solid #8B5CF6;background:#000;margin-bottom:16px;aspect-ratio:16/9"></video>
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div><div style="font-size:14px;font-weight:700;line-height:1.7;margin-bottom:10px;max-height:200px;overflow:auto">${story}</div>
        <div style="color:#888;font-size:12px">${t.style}</div><div style="font-size:14px;font-weight:700;color:#FFC300;margin-bottom:8px">${styleName}</div>
        <div style="color:#888;font-size:12px">${t.voice}</div><div style="font-size:14px;font-weight:700;color:#8B5CF6">${voiceName} - تونسي حقيقي</div>
      </div>
      <button id="downloadBtn" class="big"><i class="fas fa-download"></i> ${t.download}</button>
      <button onclick="location.reload()" class="btn" style="width:100%;margin-top:10px;height:58px;border-color:#666;color:#888"><i class="fas fa-home"></i> ${t.backHome}</button>
    </div>
  `;
  document.getElementById('downloadBtn').onclick=async()=>{
    await downloadBlob(finalVideoBlob,`matrix-${hashCode(story)}.mp4`);
  };
}

function showResult(story,style,images,voice){
  const t=translations[currentLang];
  const styleName=document.querySelector(`[data-style="${style}"] span[data-ar]`)?.dataset[currentLang]||style;
  document.querySelector('.wrap').innerHTML=`
    <div style="padding:20px">
      <h2 style="text-align:center;font-size:26px;margin-bottom:16px;font-weight:900">${t.resultTitle}</h2>
      <img src="${images[0]}" style="width:100%;border-radius:18px;border:2px solid #8B5CF6;margin-bottom:16px;aspect-ratio:16/9;object-fit:cover">
      <div style="background:#1A1A1A;border:2px solid #8B5CF6;border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="color:#888;font-size:12px">${t.story}</div><div style="font-size:14px;font-weight:700;line-height:1.7;margin-bottom:10px">${story}</div>
        <div style="color:#888;font-size:12px">${t.style}</div><div style="font-size:14px;font-weight:700;color:#FFC300;margin-bottom:8px">${styleName}</div>
      </div>
      <button onclick="location.reload()" class="btn" style="width:100%;height:58px"><i class="fas fa-home"></i> ${t.backHome}</button>
    </div>
  `;
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
    row.innerHTML=`<div style="font-weight:700;margin-bottom:6px;font-size:14px">${v.story.substring(0,80)}...</div><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:#FFC300;font-size:12px">${v.date}</span><button class="delBtn" style="background:#FF3B30;border:0;color:#fff;padding:6px 12px;border-radius:8px;font-weight:700"><i class="fas fa-trash"></i> ${t.delete}</button></div>`;
    row.querySelector('.delBtn').onclick=()=>deleteVideo(v.id); list.appendChild(row);
  });
}
function showProfile(){
  const t=translations[currentLang];
  document.querySelector('.wrap').innerHTML=`<div style="padding:40px 20px;text-align:center"><i class="fas fa-user-circle" style="font-size:100px;color:#FFC300;margin-bottom:20px"></i><h2 style="font-size:28px;margin-bottom:8px">Matrix User</h2><p style="color:#888;margin-bottom:30px">user@matrix.ai</p><div style="background:#1A1A1A;border-radius:18px;padding:20px;text-align:right"><div style="display:flex;justify-content:space-between;margin-bottom:16px"><span style="color:#888">${t.videos}</span><span style="font-weight:800;color:#FFC300">${getSavedVideos().length}</span></div><div style="display:flex;justify-content:space-between"><span style="color:#888">${t.plan}</span><span style="font-weight:800;color:#8B5CF6">${t.free}</span></div></div><button onclick="location.reload()" class="btn" style="width:100%;margin-top:30px;height:58px"><i class="fas fa-home"></i> ${t.backHome}</button></div>`;
}
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()));}
