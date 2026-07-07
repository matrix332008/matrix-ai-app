document.querySelectorAll('.btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
  };
});

document.querySelectorAll('.lang button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.lang button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
  };
});

document.querySelector('.big').onclick = () => {
  const story = document.querySelector('.input input').value;
  const style = document.querySelector('.btn.on').textContent.trim();
  if(!story) {
    alert('اكتب الحكاية الأول');
    return;
  }
  alert(`جاري توليد فيديو ${style}:\n${story}`);
};
