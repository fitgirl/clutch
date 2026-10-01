let language = window.__GEO_COUNTRY__ && window.__GEO_COUNTRY__ !== 'SE' ? 'en' : 'sv';
try { const saved = localStorage.getItem('peekr-language'); if (saved === 'sv' || saved === 'en') language = saved; } catch {}
let profileSection = 'overview';
let activePlayer = 'dvve';
let newsCategory = '';
const main = document.getElementById('main');
const strings = {
 sv:{home:'Start',players:'Spelare',news:'Nyheter',about:'Om Peekr',login:'Logga in',ranking:'Sverigerankningen',find:'Hitta spelare',allplayers:'Alla spelare',sourceNote:'Rankning från Peekrs databas.',footer:'Svenska Counter-Strike-spelare',original:'Originalwebbplats',overview:'Översikt',settings:'Inställningar',career:'Karriär',name:'Namn',age:'Ålder',team:'Lag',role:'Roll',years:'år',missing:'Uppgift saknas',country:'Sverige',profile:'Spelarprofil',stats:'Statistik',source:'Källa: Peekrs spelardatabas. Uppgifterna är en ögonblicksbild, inte livestatistik.',search:'Sök spelare eller lag',allteams:'Alla lag',count:'spelare',nomatch:'Inga spelare hittades.',copy:'Kopiera',copied:'Sikteskoden har kopierats.',crosshair:'Sikte',equipment:'Utrustning',careerempty:'Ingen karriärhistorik finns registrerad för den här spelaren.',settingsempty:'Inga inställningar finns registrerade.',highlight:'Highlights',videoerror:'Videon på originalwebbplatsen är för tillfället otillgänglig.',youtube:'Spelarens YouTube-kanal',statKD:'Kills per death',statADR:'Genomsnittlig skada per runda',statHS:'Andel kills med headshot',statRank:'Placering i den svenska databasen',headshot:'Headshot',sourceLink:'Läs på originalwebbplatsen',all:'Alla',newsIntro:'Nyhetsarkiv från Peekr',homeIntro:'Profiler och statistik från den svenska Counter-Strike-scenen.',latest:'Senaste nyheterna',profileFacts:'Spelarinformation'},
 en:{home:'Home',players:'Players',news:'News',about:'About Peekr',login:'Sign in',ranking:'Swedish rankings',find:'Find a player',allplayers:'All players',sourceNote:'Rankings from the Peekr database.',footer:'Swedish Counter-Strike players',original:'Original website',overview:'Overview',settings:'Settings',career:'Career',name:'Name',age:'Age',team:'Team',role:'Role',years:'years',missing:'Not available',country:'Sweden',profile:'Player profile',stats:'Statistics',source:'Source: Peekr player database. These figures are a snapshot, not live statistics.',search:'Search player or team',allteams:'All teams',count:'players',nomatch:'No players found.',copy:'Copy',copied:'Crosshair code copied.',crosshair:'Crosshair',equipment:'Equipment',careerempty:'No career history has been recorded for this player.',settingsempty:'No settings have been recorded.',highlight:'Highlights',videoerror:'The video on the original website is currently unavailable.',youtube:'Player’s YouTube channel',statKD:'Kills per death',statADR:'Average damage per round',statHS:'Share of kills by headshot',statRank:'Position in the Swedish database',headshot:'Headshot',sourceLink:'Read on the original website',all:'All',newsIntro:'News archive from Peekr',homeIntro:'Profiles and statistics from the Swedish Counter-Strike scene.',latest:'Latest news',profileFacts:'Player information'}
};
const t = key => strings[language][key] || key;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const display = value => escapeHTML(value ?? t('missing'));
const playerUrl = p => '#profile/' + encodeURIComponent(p.nick);
const photo = p => p.nick === 'dvve' ? '/images/dvve.png' : p.photo;
const translated = (obj,key) => language === 'en' ? obj[key+'_en'] || obj[key] : obj[key];
function playerImage(p,small=false){
 const initials=escapeHTML(p.nick.slice(0,2).toUpperCase());
 return photo(p) ? `<img class="${small?'small-portrait':''}" src="${escapeHTML(photo(p))}" alt="${small?'':escapeHTML(p.nick)}" ${small?'loading="lazy"':''} onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="${small?'small-initials':'initials'}" hidden>${initials}</span>` : `<span class="${small?'small-initials':'initials'}">${initials}</span>`;
}
function sectionTitle(title,meta=''){return `<div class="block-title"><h2>${escapeHTML(title)}</h2>${meta?`<small>${escapeHTML(meta)}</small>`:''}</div>`}
function renderDirectory(){
 const query=document.getElementById('quick-search').value.trim().toLowerCase();
 let list=PLAYERS.filter(p=>[p.nick,p.name,p.team].some(s=>s?.toLowerCase().includes(query)));
 if(!query){list=list.slice(0,20);const current=PLAYERS.find(p=>p.nick===activePlayer);if(current&&!list.includes(current))list=[...list.slice(0,19),current]}
 document.getElementById('directory-list').innerHTML=`<div class="directory-legend"><span>${t('players')}</span><span>K/D</span></div><div class="directory-list">${list.slice(0,35).map(p=>`<a href="${playerUrl(p)}" class="directory-row ${p.nick===activePlayer?'chosen':''}" ${p.nick===activePlayer?'aria-current="page"':''}><span class="position">${p.rank}</span><strong>${escapeHTML(p.nick)}</strong><small>${p.kd?.toFixed(2)??'—'}</small></a>`).join('')||`<p class="muted">${t('nomatch')}</p>`}</div>`;
}
function stats(p){
 const rows=[['K/D',p.kd?.toFixed(2),'statKD'],['ADR',p.adr?.toFixed(1),'statADR'],[t('headshot'),p.hs==null?null:p.hs+'%','statHS'],[t('ranking'),'#'+p.rank,'statRank']];
 return `<section class="block">${sectionTitle(t('stats'),'Counter-Strike 2')}<table class="data-table"><tbody>${rows.map(([label,value,definition])=>`<tr><td>${label}<span class="metric-description">${t(definition)}</span></td><td class="metric-value">${value??'—'}</td></tr>`).join('')}</tbody></table><p class="footnote">${t('source')}</p></section>`;
}
function setup(p,short=false){
 const values=p.setup||{};
 const labels={dpi:'DPI',sens:language==='sv'?'Muskänslighet':'Sensitivity',edpi:'eDPI',res:language==='sv'?'Upplösning':'Resolution',mouse:language==='sv'?'Mus':'Mouse',keyboard:language==='sv'?'Tangentbord':'Keyboard',headset:'Headset',monitor:language==='sv'?'Skärm':'Monitor'};
 const items=Object.entries(values).filter(([key])=>key!=='crosshair');
 return `<section class="block">${sectionTitle(t('settings'))}${!items.length&&!values.crosshair?`<p class="empty-text">${t('settingsempty')}</p>`:''}${!short&&items.length?`<table class="data-table gear-table"><tbody>${items.map(([k,v])=>`<tr><td class="muted">${labels[k]||escapeHTML(k)}</td><td>${escapeHTML(v)}</td></tr>`).join('')}</tbody></table>`:''}${values.crosshair?`<div class="settings-body"><p class="code-label">${t('crosshair')}</p><div class="code-line"><code>${escapeHTML(values.crosshair)}</code><button class="small-button" data-copy="${escapeHTML(values.crosshair)}">${t('copy')}</button></div></div>`:''}${short&&items.length?`<table class="data-table gear-table"><tbody>${items.slice(0,3).map(([k,v])=>`<tr><td class="muted">${labels[k]||escapeHTML(k)}</td><td>${escapeHTML(v)}</td></tr>`).join('')}</tbody></table>`:''}</section>`;
}
function career(p){return `<section class="block">${sectionTitle(t('career'))}${p.career?`<table class="data-table career-table"><tbody>${p.career.map(c=>`<tr><td class="career-date">${escapeHTML(translated(c,'date'))}</td><td>${escapeHTML(translated(c,'event'))}</td></tr>`).join('')}</tbody></table>`:`<p class="empty-text">${t('careerempty')}</p>`}</section>`}
function highlight(p){
 if(!p.highlight)return '';
 const videoUrl=new URL(p.highlight.video,location.origin+'/').href;
 return `<section class="block highlight">${sectionTitle(t('highlight'))}<video controls playsinline preload="metadata" src="${escapeHTML(videoUrl)}" aria-label="${escapeHTML(p.highlight.title)}" onerror="this.nextElementSibling.hidden=false"></video><div class="video-fallback" hidden><p>${t('videoerror')}</p></div><p class="video-caption">${escapeHTML(p.highlight.title)}</p></section>`;
}
function profile(p){
 activePlayer=p.nick;document.title=p.nick;
 const socials=Object.entries(p.socials||{}).map(([key,url])=>`<a href="${escapeHTML(url)}" target="_blank" rel="noopener">${({twitter:'X',youtube:'YouTube',steam:'Steam',tiktok:'TikTok',instagram:'Instagram',twitch:'Twitch'})[key]||escapeHTML(key)}</a>`).join('');
 main.innerHTML=`<div class="breadcrumb"><a href="#players">${t('players')}</a><span>/</span><span>${escapeHTML(p.nick)}</span></div><div class="page-heading"><h1>${escapeHTML(p.nick)}</h1><span>${t('profile')} · CS2</span></div><section class="identity" aria-label="${t('profileFacts')}"><div class="portrait">${playerImage(p)}</div><div class="identity-info"><div class="identity-name"><span class="flag" aria-label="${t('country')}"></span><h2>${display(p.name)}</h2></div><div class="identity-facts"><div><span>${t('team')}</span><b>${display(p.team)}</b></div><div><span>${t('age')}</span><b>${p.age?p.age+' '+t('years'):t('missing')}</b></div><div><span>${t('role')}</span><b>${display(p.role)}</b></div><div><span>${t('ranking')}</span><b>#${p.rank}</b></div></div>${socials?`<div class="social-links">${socials}</div>`:''}</div></section><div class="profile-nav" role="tablist" aria-label="${t('profile')}">${['overview','settings','career'].map(k=>`<button role="tab" data-section="${k}" aria-selected="${profileSection===k}">${t(k)}</button>`).join('')}</div><div id="profile-content" role="tabpanel">${profileSection==='overview'?`${p.bio?`<p class="bio">${escapeHTML(translated(p,'bio'))}</p>`:''}${stats(p)}${setup(p,true)}${highlight(p)}`:profileSection==='settings'?setup(p):career(p)}</div>`;
 document.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>{profileSection=button.dataset.section;profile(p)});
 document.querySelectorAll('[data-copy]').forEach(button=>button.onclick=async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);notify(t('copied'))}catch{notify(button.dataset.copy)}});
 renderDirectory();
}
function notify(message){const el=document.getElementById('notice');el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',3500)}
function playerRows(list){return list.map(p=>`<tr><td>${p.rank}</td><td><a href="${playerUrl(p)}" class="player-link">${playerImage(p,true)}${escapeHTML(p.nick)}</a></td><td>${escapeHTML(p.team||'—')}</td><td>${p.kd?.toFixed(2)??'—'}</td><td>${p.adr?.toFixed(1)??'—'}</td><td>${p.hs==null?'—':p.hs+'%'}</td></tr>`).join('')}
function tableHead(){return `<thead><tr><th>#</th><th>${t('players')}</th><th>${t('team')}</th><th>K/D</th><th>ADR</th><th>HS%</th></tr></thead>`}
function players(){
 document.title=t('players')+' · Peekr';
 main.innerHTML=`<div class="page-heading"><h1>${t('players')}</h1><span>Counter-Strike 2</span></div><div class="directory-controls"><input id="player-search" type="search" placeholder="${t('search')}" aria-label="${t('find')}"><select id="team-filter" aria-label="${t('team')}"><option value="">${t('allteams')}</option>${[...new Set(PLAYERS.map(p=>p.team).filter(Boolean))].sort().map(team=>`<option>${escapeHTML(team)}</option>`).join('')}</select></div><p id="result-count" class="result-count"></p><div class="table-scroll"><table class="data-table player-table">${tableHead()}<tbody id="player-rows"></tbody></table></div>`;
 const filter=()=>{const q=document.getElementById('player-search').value.toLowerCase().trim(),team=document.getElementById('team-filter').value;const list=PLAYERS.filter(p=>(!team||p.team===team)&&[p.nick,p.name,p.team].some(s=>s?.toLowerCase().includes(q)));document.getElementById('result-count').textContent=list.length+' '+t('count');document.getElementById('player-rows').innerHTML=playerRows(list)||`<tr><td colspan="6">${t('nomatch')}</td></tr>`};document.getElementById('player-search').oninput=filter;document.getElementById('team-filter').onchange=filter;filter();
}
function newsItem(n){return `<article class="news-item"><p class="news-meta">${escapeHTML(translated(n,'date'))} · ${escapeHTML(n.tag)}</p><h2>${escapeHTML(translated(n,'title'))}</h2><p>${escapeHTML(translated(n,'excerpt'))}</p><a href="https://www.peekr.se/nyheter" target="_blank" rel="noopener">${t('sourceLink')}</a></article>`}
function news(){document.title=t('news')+' · Peekr';main.innerHTML=`<div class="page-heading"><h1>${t('news')}</h1><span>${t('newsIntro')}</span></div><div class="news-filters">${['',...new Set(NEWS.map(n=>n.tag))].map(tag=>`<button data-category="${escapeHTML(tag)}" class="${newsCategory===tag?'selected':''}">${escapeHTML(tag||t('all'))}</button>`).join('')}</div>${NEWS.filter(n=>!newsCategory||n.tag===newsCategory).map(newsItem).join('')}`;document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{newsCategory=b.dataset.category;news()})}
function home(){document.title='Peekr · '+t('home');main.innerHTML=`<div class="page-heading"><h1>${t('ranking')}</h1><span>Counter-Strike 2</span></div><p class="welcome-line">${t('homeIntro')}</p><div class="table-scroll"><table class="data-table player-table">${tableHead()}<tbody>${playerRows(PLAYERS.slice(0,10))}</tbody></table></div><p class="footnote">${t('source')}</p><p><a href="#players" class="directory-more">${t('allplayers')} (${PLAYERS.length})</a></p><section class="home-news"><div class="page-heading"><h2>${t('latest')}</h2><a href="#news" style="font-size:12px">${t('news')}</a></div>${NEWS.slice(0,3).map(newsItem).join('')}</section>`}
function about(){document.title=t('about');main.innerHTML=`<div class="page-heading"><h1>${t('about')}</h1></div><div class="prose"><p>${language==='sv'?'Peekr är en databas över svenska Counter-Strike-spelare. Här finns profiler, statistik, laginformation och spelinställningar när uppgifterna finns tillgängliga.':'Peekr is a database of Swedish Counter-Strike players, with profiles, statistics, team information and settings where available.'}</p><h2>${language==='sv'?'Uppgifter och källor':'Data and sources'}</h2><p>${t('source')} ${language==='sv'?'Saknade uppgifter visas som ”Uppgift saknas”.':'Missing information is marked as unavailable.'}</p><p>${language==='sv'?'Den här versionen använder uppgifter från den ursprungliga Peekr-webbplatsen.':'This version uses data from the original Peekr website.'} <a href="https://www.peekr.se/dvve">${t('original')}</a>.</p><h2>${language==='sv'?'Kontakt och rättelser':'Contact and corrections'}</h2><p>${language==='sv'?'För rättelser i spelardatan, besök originalwebbplatsen.':'For corrections to the player data, visit the original website.'}</p><p>${language==='sv'?'Sajten är inte ansluten till Valve Corporation eller de omnämnda klubbarna.':'This site is not affiliated with Valve Corporation or the clubs mentioned.'}</p></div>`}
function route(){
 document.documentElement.lang=language;document.querySelectorAll('[data-label]').forEach(el=>el.textContent=t(el.dataset.label));document.getElementById('language').textContent=language==='sv'?'EN':'SV';document.getElementById('quick-search').placeholder=t('search');
 let path;try{path=decodeURIComponent(location.hash.slice(1)||routeFromPath())}catch{path='players'}
 document.querySelectorAll('.navigation a').forEach(a=>a.classList.toggle('current',a.hash==='#'+path||(path.startsWith('profile/')&&a.hash==='#players')));
 if(path==='players')players();else if(path==='home')home();else if(path==='news')news();else if(path==='about')about();else{const p=PLAYERS.find(p=>p.nick.toLowerCase()===(path.split('/')[1]||'dvve').toLowerCase());if(p)profile(p);else main.innerHTML=`<p>${t('nomatch')}</p><a href="#players">${t('allplayers')}</a>`}renderDirectory();
}
function routeFromPath(){
 const path=location.pathname.replace(/^\/+|\/+$/g,'');
 const pages={'':'home',spelare:'players',nyheter:'news',om:'about'};
 return Object.prototype.hasOwnProperty.call(pages,path)?pages[path]:'profile/'+path;
}
let signedInUser=null;
function renderAuth(){
 const el=document.getElementById('auth-area');
 if(!signedInUser){el.innerHTML=`<a href="/auth/steam">${t('login')}</a>`;return;}
 el.innerHTML=`<details class="account-menu"><summary>${escapeHTML(signedInUser.personaname||signedInUser.steamid)}</summary><div><a href="https://steamcommunity.com/profiles/${encodeURIComponent(signedInUser.steamid)}" target="_blank" rel="noopener">${language==='sv'?'Steam-profil':'Steam profile'}</a><a href="/auth/logout">${language==='sv'?'Logga ut':'Sign out'}</a></div></details>`;
}
async function loadAuth(){
 try{const response=await fetch('/api/me');if(!response.ok)throw new Error('Session unavailable');const user=await response.json();signedInUser=user.loggedIn?user:null;}catch{signedInUser=null;}
 renderAuth();
 const status=new URLSearchParams(location.search).get('steamlogin');
 if(status){notify(language==='sv'?'Steam-inloggningen slutfördes inte. Försök igen.':'Steam sign-in did not complete. Please try again.');const url=new URL(location.href);url.searchParams.delete('steamlogin');history.replaceState(null,'',url.pathname+url.search+url.hash);}
}
window.addEventListener('hashchange',()=>{profileSection='overview';route();window.scrollTo(0,0)});document.getElementById('language').onclick=()=>{language=language==='sv'?'en':'sv';try { localStorage.setItem('peekr-language',language); } catch {} route();renderAuth()};document.getElementById('quick-search').oninput=renderDirectory;route();
loadAuth();
