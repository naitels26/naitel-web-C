import {createLandingServer} from './server.mjs';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('./index.html',import.meta.url),'utf8');
const activeHTML=html.replace(/<!--[\s\S]*?-->/g,'');
for(const script of activeHTML.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g)){
  if(!script[1].includes('application/json'))new vm.Script(script[2]);
}
const paths=new Set(['/','/privacidad.html','/cookies.html']);
paths.add('/assets/logos/huawei.png');
for(const match of activeHTML.matchAll(/(?:src|href|poster)="(assets\/[^"?#]+)[^"]*"/g))paths.add('/'+match[1]);
const csv=await readFile(new URL('./assets/logos/partners.csv',import.meta.url),'utf8');
for(const row of csv.trim().split(/\r?\n/).slice(1)){
  const logo=row.match(/(?:^|,)([^,]+\.(?:svg|png|webp|jpg|jpeg|avif))(?:,|$)/i)?.[1];
  assert.ok(logo,'Logo filename present');paths.add('/assets/logos/'+logo);
}
for(const path of [...paths].filter(path=>path.startsWith('/assets/')))await access(new URL('.'+path,import.meta.url));
assert.ok(!/Versi[oó]n [AB]|\.\.\//.test(activeHTML),'No sibling dependencies');
const footer=activeHTML.match(/<footer[\s\S]*?<\/footer>/)[0];
assert.ok(!/tel:|mailto:|navigation-row|pager|slidePosition|id="(?:prev|next)"/.test(footer));
assert.ok(footer.includes('data-privacy-notice')&&footer.includes('logo-carousel'));
assert.ok(!/pagerButtons|pointerInChrome|data-go|slidePosition/.test(activeHTML));
assert.ok(activeHTML.indexOf('id="openAssistant"')>activeHTML.indexOf('</main>'));
assert.ok(!/NAITELSSS|aleon\.external@naitel\.com/.test(html));

// Verify menu targets and drag/click behavior using the actual page handlers.
const navigation=html.slice(html.indexOf('    function updateNavigation(){'),html.indexOf('    function animateTitle(){'));
for(const language of ['es','en']){
  const nodes=new Map();
  const node=()=>({dataset:{},setAttribute(){},replaceChildren(...children){this.children=children}});
  const document={querySelector:selector=>{if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector)},createElement:node};
  vm.runInNewContext(navigation+';updateNavigation();',{lang:language,current:0,contactIndex:9,document,slides:Array.from({length:10},node)});
  assert.deepEqual(nodes.get('#solutionsList').children.map(button=>button.dataset.targetSlide),[0,1,2,3,4,5,6,7,8]);
}
const dragHandlers={},windowHandlers={};
let chatOpened=0,captured=false;
const dragButton={style:{},classList:{add(){},remove(){}},addEventListener:(name,handler)=>{dragHandlers[name]=handler},
  getBoundingClientRect(){return {left:parseFloat(this.style.left??'600'),top:parseFloat(this.style.top??'400'),width:140,height:44}},
  setPointerCapture(){captured=true},hasPointerCapture:()=>captured,releasePointerCapture(){captured=false}};
const dragWindow={innerWidth:800,innerHeight:600,addEventListener:(name,handler)=>{windowHandlers[name]=handler}};
const dragging=html.slice(html.indexOf('    // Pointer capture'),html.indexOf("    document.querySelector('#mapAssistant').addEventListener"));
vm.runInNewContext(dragging,{assistantButton:dragButton,window:dragWindow,openAssistant(){chatOpened++}});
const pointer=(x,y)=>({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:y});
const click=detail=>({detail,preventDefault(){}});
dragHandlers.pointerdown(pointer(610,410));dragHandlers.pointermove(pointer(612,412));dragHandlers.pointerup(pointer(612,412));dragHandlers.click(click(1));
assert.equal(chatOpened,1,'Small movement remains a normal click');
dragHandlers.pointerdown(pointer(610,410));dragHandlers.pointermove(pointer(2000,-100));dragHandlers.pointerup(pointer(2000,-100));dragHandlers.click(click(1));
assert.equal(chatOpened,1,'Dragging must not open the assistant');
assert.equal(dragButton.style.left,'652px');assert.equal(dragButton.style.top,'8px');
dragHandlers.pointerdown(pointer(660,12));dragHandlers.pointerup(pointer(660,12));dragHandlers.click(click(1));assert.equal(chatOpened,2,'Click after dragging opens chat');
dragWindow.innerWidth=390;windowHandlers.resize();assert.equal(dragButton.style.left,'242px','Keep moved button inside resized viewport');
dragHandlers.pointerdown(pointer(250,20));dragHandlers.pointermove(pointer(100,100));dragHandlers.pointercancel(pointer(100,100));dragHandlers.click(click(0));assert.equal(chatOpened,3,'Keyboard activation remains available');
console.log('PASS: nine menu slides in both languages; assistant drag bounds, click threshold, resize and keyboard activation.');

// Exercise C's actual autoplay functions with deterministic timers, including
// reduced motion, manual navigation, assistant focus and the contact slide.
const playback=html.slice(html.indexOf('    function restartAutoplay(){'),html.indexOf('    function openContact(service){'));
const context=vm.createContext({});
vm.runInContext(`
  let current=0,slideTimer,scheduled=null;
  const slideDuration=11000,contactIndex=9,mapIndex=7;
  const reducedMotion={matches:false},assistantDialog={open:false};
  const document={hidden:false,activeElement:null,querySelector:()=>({hidden:true})};
  const partnersMap={play(){},isReady:()=>true};
  const hero={dataset:{},toggleAttribute(){}};
  const slides=Array.from({length:10},()=>({dataset:{},classList:{toggle(){}},setAttribute(){},contains:element=>element==='field'}));
  const syncVideos=()=>{},updateNavigation=()=>{},animateTitle=()=>{};
  const clearTimeout=()=>{scheduled=null},setTimeout=(fn,delay)=>{scheduled={fn,delay};return 1};
  ${playback}
  restartAutoplay();
  globalThis.state=()=>({current,scheduled:!!scheduled});
  globalThis.advance=()=>scheduled.fn();
  globalThis.manual=()=>go(current+1);
  globalThis.resume=()=>{document.hidden=false;restartAutoplay()};
  globalThis.hide=()=>{document.hidden=true;restartAutoplay()};
  globalThis.reduce=()=>{reducedMotion.matches=true;restartAutoplay()};
  globalThis.assistant=()=>{assistantDialog.open=true;restartAutoplay()};
  globalThis.focus=()=>{document.activeElement='field';restartAutoplay()};
  globalThis.contact=()=>go(9);
`,context);
assert.equal(context.state().scheduled,true);context.advance();
assert.equal(context.state().current,1);
context.manual();assert.equal(context.state().scheduled,true);
context.hide();assert.equal(context.state().scheduled,false);
context.resume();assert.equal(context.state().scheduled,true);
context.focus();assert.equal(context.state().scheduled,false);
vm.runInContext('document.activeElement=null',context);context.assistant();assert.equal(context.state().scheduled,false);
vm.runInContext('assistantDialog.open=false',context);context.resume();context.contact();assert.equal(context.state().scheduled,false);
vm.runInContext('go(0)',context);context.reduce();assert.equal(context.state().scheduled,false);

// In reduced motion, retain every original logo and avoid animated duplicates.
function element(){return {children:[],style:{},dataset:{},classList:{static:false,add(name){if(name==='is-static')this.static=true},remove(){},toggle(){}},append(child){this.children.push(child)},replaceChildren(...children){this.children=children},setAttribute(){},addEventListener(){},get scrollWidth(){return this.children.length*100}}}
const strip=element(),logoList=element(),message=element();strip.clientWidth=500;
const carouselContext=vm.createContext({document:{body:element(),addEventListener(){},querySelector:selector=>selector==='.logo-carousel'?strip:selector==='#carouselLogos'?logoList:message,createElement:element},clearTimeout,matchMedia:()=>({matches:true,addEventListener(){}}),window:{addEventListener(){}},getPartnerCatalog:async()=>['One','Two','Three'].map(name=>({name,logo:name+'.svg',height:24})),encodeURIComponent});
vm.runInContext((await readFile(new URL('./assets/logo-carousel.js',import.meta.url),'utf8'))+';globalThis.carousel=logoCarousel;',carouselContext);
await carouselContext.carousel.load();
assert.equal(logoList.children.length,3);assert.equal(logoList.classList.static,true);assert.equal(message.hidden,true);
const css=await readFile(new URL('./assets/version-c.css',import.meta.url),'utf8');
assert.match(css,/\.site-assistant-button \{ position:fixed; z-index:1000;/);
assert.match(css,/@media\(max-width:599px\)/);
assert.match(css,/\.footer-privacy \{ font-size:12px;[^}]*text-decoration:none/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*animation:none!important/);
assert.match(css,/\.typing-letter \{ opacity:1!important; visibility:visible!important/);

let sent=0;
const server=createLandingServer({apiKey:null,sendContact:async fields=>{assert.equal(fields.reason,'Desarrollo de software');sent++}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 const base=`http://127.0.0.1:${server.address().port}`;
 const request=body=>fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data={name:'Prueba',company:'Prueba local',email:'test@example.com',phone:'6561234567',extension:'',reason:'software',consent:true};
 const valid=await request(data);assert.equal(valid.status,200);assert.equal((await valid.json()).sent,true);assert.equal(sent,1);
 assert.equal((await request({...data,consent:false})).status,400);assert.equal(sent,1);
 assert.equal((await request({...data,email:'invalid'})).status,400);
 for(const path of paths){const response=await fetch(base+path,{method:'HEAD'});assert.equal(response.status,200,path)}
 for(const path of ['/server.mjs','/contact-mail.mjs','/assistant-catalog.txt','/.env','/verify-site.mjs'])assert.equal((await fetch(base+path)).status,404,path);
 const range=await fetch(base+'/assets/earth-network.webm',{headers:{Range:'bytes=0-15'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,16);
 const chat=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Hola',lang:'es'})});assert.equal(chat.status,503);assert.equal((await chat.json()).error,'gemini_not_configured');
 console.log(`PASS: JavaScript syntax; ${paths.size} public resources; video ranges; private files protected; playback/manual pause/resume/reduced motion/form/assistant; contact validation. Test sender only, no real email or AI request.`);
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}

const unavailable=createLandingServer({apiKey:null,sendContact:null});
await new Promise(resolve=>unavailable.listen(0,'127.0.0.1',resolve));
try{
 const result=await fetch(`http://127.0.0.1:${unavailable.address().port}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
 assert.equal(result.status,503);assert.equal((await result.json()).error,'contact_not_configured');
 console.log('PASS: missing SMTP returns unavailable, never a simulated success.');
}finally{unavailable.closeAllConnections();await new Promise(resolve=>unavailable.close(resolve))}
