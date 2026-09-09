(function(){
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if(menu && nav){
    menu.addEventListener('click',()=>nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  }

  const form = document.getElementById('demoForm');
  if(!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('formStatus');
  const original = button ? button.textContent : 'Request tailored demo';

  function show(message,isError){
    if(!status) return;
    status.textContent = message;
    status.classList.add('show');
    status.classList.toggle('error',!!isError);
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(button){button.disabled=true;button.textContent='Sending…';}
    if(status){status.classList.remove('show','error');}
    const payload = Object.fromEntries(new FormData(form).entries());
    try{
      const response = await fetch('/api/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const result = await response.json().catch(()=>({}));
      if(response.ok && result.ok){
        form.reset();
        show('Thank you. Your demo request has been captured for ORVIA sales follow-up.',false);
      }else if(result.fallback){
        show('Online capture is temporarily unavailable. Opening a prepared email instead.',true);
        window.location.href=result.fallback;
      }else{
        throw new Error(result.error || 'We could not submit the request.');
      }
    }catch(error){
      show((error && error.message) || 'We could not submit the request. Please email hello@orvia.org.uk.',true);
    }finally{
      if(button){button.disabled=false;button.textContent=original;}
    }
  });
})();
