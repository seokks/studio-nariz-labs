'use strict';
const guide=JSON.parse(document.querySelector('#guide-data').textContent);
const labels=JSON.parse(document.querySelector('#guide-labels').textContent);
const language=document.documentElement.lang;
const el=id=>document.getElementById(id);
let topic=0,step=0;
const say=text=>text[language]||text.en;
function figure(item,index){
 const [x,y,w,h]=language==='en'?(item.cropEn||item.crop):item.crop, [tx,ty,tw,th]=language==='en'?(item.targetEn||item.target):item.target;
 const file=guide.images[item.image][language];
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',say(item.title));
 const image=document.createElementNS(ns,'image');image.setAttribute('href','guide/'+file);image.setAttribute('width',item.image==='history'?1920:item.image==='image-history'?2560:item.image.startsWith('editor')?1880:1240);image.setAttribute('height',item.image==='history'?1240:item.image==='image-history'?1600:1504);svg.append(image);
 const rect=document.createElementNS(ns,'rect');Object.entries({x:tx,y:ty,width:tw,height:th,rx:8,class:'highlight'}).forEach(([k,v])=>rect.setAttribute(k,v));svg.append(rect);
 const cx=tx+Math.min(22,tw/2),cy=Math.max(y+22,ty-10);
 const circle=document.createElementNS(ns,'circle');Object.entries({cx,cy,r:22,class:'badge'}).forEach(([k,v])=>circle.setAttribute(k,v));svg.append(circle);
 const text=document.createElementNS(ns,'text');text.setAttribute('x',cx);text.setAttribute('y',cy+1);text.textContent=index+1;svg.append(text);return svg;
}
function render(focus=false){
 const current=guide.topics[topic],item=current.steps[step];
 el('topics').replaceChildren(...guide.topics.map((t,i)=>{const b=document.createElement('button');b.className='topic';b.textContent=say(t.title);b.setAttribute('aria-current',String(i===topic));const small=document.createElement('small');small.textContent=say(t.subtitle);b.append(small);b.onclick=()=>{topic=i;step=0;render(true)};return b}));
 el('topic-title').textContent=say(current.title);el('progress').textContent=`${step+1} / ${current.steps.length}`;
 el('step-dots').replaceChildren(...current.steps.map((s,i)=>{const b=document.createElement('button');b.className='step-dot';b.setAttribute('aria-label',`${i+1}. ${say(s.title)}`);if(i===step)b.setAttribute('aria-current','step');b.onclick=()=>{step=i;render(true)};return b}));
 for(const [id,key] of [['step-title','title'],['step-body','body'],['step-result','result'],['step-note','note']])el(id).textContent=say(item[key]);
 el('number').textContent=step+1;el('screen').replaceChildren(figure(item,step));
 el('previous').disabled=step===0;el('next').textContent=(step===current.steps.length-1?labels.finish:labels.next)+' →';
 if(focus){el('step-title').focus({preventScroll:true});document.querySelector('.lesson').scrollIntoView({block:'start',behavior:'instant'});}
 history.replaceState(null,'',`#${current.id}-${item.id}`);
}
function enlarge(){const item=guide.topics[topic].steps[step];el('large-screen').replaceChildren(figure(item,step));el('large-caption').textContent=`${step+1}. ${say(item.title)}`;el('lightbox').showModal()}
el('previous').onclick=()=>{if(step>0){step--;render(true)}};
el('next').onclick=()=>{step=(step+1)%guide.topics[topic].steps.length;render(true)};
el('screen').onclick=enlarge;el('enlarge').onclick=enlarge;
document.querySelector('.lesson').addEventListener('keydown',event=>{if(event.target.closest('button,summary,a'))return;if(event.key==='ArrowRight'){event.preventDefault();el('next').click()}if(event.key==='ArrowLeft'){event.preventDefault();el('previous').click()}});
const initial=location.hash.slice(1);guide.topics.forEach((t,i)=>t.steps.forEach((s,j)=>{if(initial===`${t.id}-${s.id}`){topic=i;step=j}}));render();
