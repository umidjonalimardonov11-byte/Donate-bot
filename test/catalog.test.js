import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupGames } from '../public/catalog.js';
test('one Mobile Legends and one Free Fire card, regions inside',()=>{
 const groups=groupGames([{slug:'ml-id',name:'Mobile Legends (Indonesia)',kind:'game'},{slug:'ml-my',name:'Mobile Legends - Malaysia',kind:'game'},{slug:'ff-br',name:'Free Fire Brazil',kind:'game'},{slug:'ff-global',name:'Free Fire Global',kind:'game'}]);
 assert.equal(groups.length,2);assert.deepEqual(groups[0].variants.map(v=>v.slug),['ml-id','ml-my']);assert.deepEqual(groups[0].variants.map(v=>v.region),['Indonesia','Malaysia']);assert.equal(groups[1].variants.length,2);
});
test('Stars Premium Steam Gifts remain separate other services',()=>{
 const names=['Telegram Stars','Telegram Premium','Steam','Telegram Gifts'];
 const groups=groupGames(names.map(name=>({slug:name,name,kind:'other'})));
 assert.equal(groups.length,4);assert.deepEqual(groups.map(g=>g.name),names);assert.ok(groups.every(g=>g.kind==='other'));
});
test('Mobile Legends Adventure is not a region',()=>{
 assert.equal(groupGames([{slug:'ml',name:'Mobile Legends'},{slug:'mla',name:'Mobile Legends Adventure'}]).length,2);
});
