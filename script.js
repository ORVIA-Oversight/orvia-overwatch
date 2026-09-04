// ORVIA Overwatch — shared interactions

(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a[data-page]').forEach(a=>{
    if(a.dataset.page === path) a.classList.add('active');
  });
})();

document.addEventListener('DOMContentLoaded', ()=>{
  const f = document.getElementById('demoForm');
  if(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      const btn = f.querySelector('button[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(()=>{
        f.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
      }, 800);
    });
  }
});
