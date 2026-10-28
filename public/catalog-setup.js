import { groupGames as groupRawGames } from './catalog.js';
function groupGames(items) {
 const flat=items.flatMap(item=>item.variants?.length?item.variants.map(v=>({...item,...v,variants:undefined,name:v.name||(v.label&&v.label!=='Global'?`${item.name} (${v.label})`:item.name)})):[item]);
 return groupRawGames(flat).map(g=>({...g,servers_count:g.variants.length>1?g.variants.length:0,variants:g.variants.map(v=>({...v,label:v.region}))}));
}
const originalLoadGames=loadGames;
loadGames=async function(){store.games=groupGames(await originalLoadGames());return store.games;};
const originalRenderShop=renderShop;
renderShop=async function(){
 await originalRenderShop();if(tab!=='shop')return;
 const list=document.getElementById('list');if(!list||!store.games)return;
 const section=(title,items)=>items.length?`${title?`<div class="h2">${esc(title)}</div>`:''}<div class="grid">${items.map(gameCard).join('')}</div>`:'';
 const draw=()=>{const q=store.q.toLowerCase();const filtered=store.games.filter(g=>[g.name,...g.variants.map(v=>v.name)].some(name=>String(name).toLowerCase().includes(q)));
 list.innerHTML=(store.cat==='games'?'':section(store.cat==='all'?L().special:'',filtered.filter(g=>g.kind==='other')))+(store.cat==='services'?'':section(store.cat==='all'?L().games:'',filtered.filter(g=>g.kind!=='other')));
 if(!list.innerHTML)list.innerHTML=`<div class="empty">${esc(L().notfound)}</div>`;bindGames();};
 draw();document.getElementById('q')?.addEventListener('input',draw);
};
if(store.games)store.games=groupGames(store.games);
if(tab==='shop')renderShop();else if(tab==='home')renderHome();
