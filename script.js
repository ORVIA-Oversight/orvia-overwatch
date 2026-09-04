// ORVIA Overwatch — shared interactions

(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a[data-page]').forEach(a=>{
    if(a.dataset.page === path) a.classList.add('active');
  });
})();

document.addEventListener('DOMContentLoaded', ()=>{
  const f = document.getElementById('demoForm');
  if(!f) return;

  const btn = f.querySelector('button[type="submit"]');
  const originalLabel = btn ? btn.textContent : 'Request a demo';

  f.addEventListener('submit', async function(e){
    e.preventDefault();

    if(btn){
      btn.textContent = 'Sending…';
      btn.disabled = true;
    }

    const payload = Object.fromEntries(new FormData(f).entries());

    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let result = {};
      try { result = await response.json(); } catch (_) {}

      if(response.ok && result.ok){
        f.style.display = 'none';
        const success = document.getElementById('formSuccess');
        if(success) success.style.display = 'block';
        return;
      }

      if(result.fallback){
        window.location.href = result.fallback;
        throw new Error(result.error || 'Please send the prepared enquiry from your email application.');
      }

      throw new Error(result.error || 'We could not send your request. Please email hello@orvia.org.uk or call 0114 399 8231.');
    } catch (error) {
      if(!String(error.message || '').includes('prepared enquiry')) {
        alert(error.message || 'We could not send your request. Please email hello@orvia.org.uk or call 0114 399 8231.');
      }
      if(btn){
        btn.textContent = originalLabel;
        btn.disabled = false;
      }
    }
  });
});
