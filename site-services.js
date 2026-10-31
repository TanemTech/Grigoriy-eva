(function(global){
  'use strict';
  const data=global.TANEM_SITE_DATA;
  const localize=(value,lang)=>typeof value==='string'?value:(value?.[lang]??value?.ru??value?.en??'');
  const language=()=>global.TANEM_REGION?.resolve(document.body?.dataset.brLang||document.documentElement.lang||data.defaultLocale)||'ru';
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizePrice=value=>String(value||'').trim().replace(/[\u00a0\u202f]/g,' ')
    .replace(/^(?:от|from)\s+([\d ]+)\s+(?:до|to)\s+([\d ]+)\s*([₽֏€$£])$/iu,'$1–$2 $3')
    .replace(/([\d ])\s*[–—-]\s*(?=\d)/u,'$1–').replace(/ +/g,' ');
  const same=value=>String(value||'').toLowerCase().replace(/\s+/gu,'').replace(/ё/g,'е');
  function description(service,lang){
    const variants=service.variants||[];
    const duplicate=new Set(variants.map(v=>same(localize(v.label,lang)+':'+localize(v.price,lang))));
    return localize(service.description,lang).split(/;|\n/u)
      .filter(part=>!duplicate.has(same(part))).join('; ').trim();
  }
  function duration(value,lang){
    const raw=localize(value,lang),m=raw.match(/^(\d+(?:[.,]\d+)?)\s*(мин(?:ут(?:а|ы)?)?|min(?:utes?)?|ч(?:ас(?:а|ов)?)?|h(?:ours?)?)\.?$/iu);
    if(!m)return raw;
    const n=Number(m[1].replace(',','.')),minutes=/^(мин|min)/iu.test(m[2])?n:n*60;
    if(minutes<60)return minutes+(lang==='en'?' min':' мин');
    const hours=minutes/60;
    if(Number.isInteger(hours*2))return String(hours).replace('.',lang==='en'?'.':',')+(lang==='en'?' h':' ч');
    return Math.floor(hours)+(lang==='en'?' h ':' ч ')+Math.round(minutes%60)+(lang==='en'?' min':' мин');
  }
  function priceMarkup(value,device){
    const price=normalizePrice(value),range=price.match(/^([\d ]+)[–-]([\d ]+)\s*([₽֏€$£])$/u);
    if(range&&device==='mobile')return '<span class="tanem-service-price is-range" aria-label="'+escape(price)+'"><span class="tanem-price-low">'+escape(range[1].trim())+'</span><span class="tanem-price-dash" aria-hidden="true">—</span><span class="tanem-price-high">'+escape(range[2].trim())+'</span><span class="tanem-price-currency">'+range[3]+'</span></span>';
    const single=price.match(/^(?:(от|from)\s+)?([\d ]+)\s*([₽֏€$£])$/u);
    if(single&&device==='mobile')return '<span class="tanem-service-price"><span class="tanem-price-amount">'+(single[1]?'<small>'+escape(single[1])+' </small>':'')+escape(single[2].trim())+'</span><span class="tanem-price-currency">'+single[3]+'</span></span>';
    return '<span class="tanem-service-price">'+escape(price)+'</span>';
  }
  function render(service,device,lang=language()){
    const title=localize(service.title,lang).replace(/\u00ad/g,''),variants=service.variants||[];
    const copy=description(service,lang),price=localize(service.price,lang),time=duration(service.duration,lang);
    const id='service-description-'+device+'-'+service.id;
    const book=lang==='en'?'Book':'Записаться';
    return '<article class="'+(device==='desktop'?'dct-service-card':'tn31-service-row')+' tanem-service-card" data-eva-service-id="'+escape(service.id)+'" data-eva-layout="'+device+'" data-eva-lang="'+lang+'">'+
      '<div class="tanem-service-copy"><strong class="tanem-service-title '+(device==='desktop'?'dct-service-card-title':'tn31-service-name')+'">'+escape(title).replace(/([+/])/g,'$1<wbr>')+'</strong>'+
      (variants.length?'<dl class="tanem-service-tariffs">'+variants.map(v=>'<div><dt>'+escape(localize(v.label,lang))+(localize(v.label,lang)?':':'')+'</dt><dd>'+escape(normalizePrice(localize(v.price,lang)))+'</dd></div>').join('')+'</dl>':'')+'</div>'+
      '<div class="tanem-service-side">'+(time?'<small class="tanem-service-duration">'+escape(time)+'</small>':'')+(price?priceMarkup(price,device):'<span class="tanem-service-price">'+book+'</span>')+'</div>'+
      (copy?'<div class="tanem-service-description'+(variants.length?' is-tariff-description':'')+'"><p id="'+escape(id)+'"'+(variants.length?' hidden':'')+'>'+escape(copy)+'</p><button class="tanem-service-more" type="button" aria-expanded="false" aria-controls="'+escape(id)+'">'+(lang==='en'?'Read more':'Подробнее')+'</button></div>':'')+
      '<button class="tanem-service-book" type="button" '+(device==='desktop'?'data-service-book':'data-book-service')+' aria-label="'+book+': '+escape(title)+'"></button></article>';
  }
  function measure(card){
    const box=card.querySelector('.tanem-service-description');if(!box)return;
    const paragraph=box.querySelector('p'),button=box.querySelector('button');
    const expanded=button.getAttribute('aria-expanded')==='true',forced=box.classList.contains('is-tariff-description');
    if(forced){paragraph.hidden=!expanded;button.hidden=false;return}
    box.classList.add('is-measuring');
    const needsMore=paragraph.getBoundingClientRect().height>(parseFloat(getComputedStyle(paragraph).lineHeight)||18)*2+1.5;
    box.classList.remove('is-measuring');
    button.hidden=!needsMore;
    if(!needsMore){box.classList.remove('is-expanded');button.setAttribute('aria-expanded','false')}
  }
  function enhance(scope){
    scope.querySelectorAll('.tanem-service-card').forEach(card=>{
      const button=card.querySelector('.tanem-service-more');
      if(button&&!button.dataset.bound){
        button.dataset.bound='true';
        button.onclick=event=>{
          event.preventDefault();event.stopPropagation();
          const expanded=button.getAttribute('aria-expanded')!=='true';
          button.setAttribute('aria-expanded',String(expanded));
          button.closest('.tanem-service-description').classList.toggle('is-expanded',expanded);
          button.textContent=language()==='en'?(expanded?'Collapse':'Read more'):(expanded?'Свернуть':'Подробнее');
          measure(card);
        };
      }
      measure(card);
    });
  }
  function refresh(){
    const lang=language();
    document.querySelectorAll('.tanem-service-card').forEach(card=>{
      if(card.dataset.evaLang===lang)return;
      const service=data.services.find(s=>s.id===card.dataset.evaServiceId);if(!service)return;
      const expanded=card.querySelector('.tanem-service-more')?.getAttribute('aria-expanded')==='true';
      const holder=document.createElement('div');holder.innerHTML=render(service,card.dataset.evaLayout,lang);
      const next=holder.firstElementChild;
      // Keep booking listeners on the existing button when changing the language.
      const oldBook=card.querySelector('.tanem-service-book'),newBook=next.querySelector('.tanem-service-book');
      oldBook.setAttribute('aria-label',newBook.getAttribute('aria-label'));newBook.replaceWith(oldBook);
      card.replaceChildren(...next.childNodes);card.dataset.evaLang=lang;
      if(expanded){const button=card.querySelector('.tanem-service-more');if(button){button.setAttribute('aria-expanded','true');button.textContent=lang==='en'?'Collapse':'Свернуть';button.parentElement.classList.add('is-expanded')}}
    });
    enhance(document);
  }
  global.TANEM_SERVICES={render,enhance,normalizePrice,description,duration};
  if(typeof document!=='undefined'){
    let frame=0;
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;refresh()})};
    global.addEventListener('salon-template:languagechange',schedule);
    global.addEventListener('resize',schedule,{passive:true});
    document.fonts?.ready.then(schedule).catch(()=>{});
  }
})(window);
