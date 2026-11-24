// Run with: node --test prototype/maps-live/autocomplete.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor() { this.children=[]; this.attrs={}; this.listeners={}; this.style={}; this.value=''; this.hidden=false; }
  setAttribute(k,v) { this.attrs[k]=v; }
  removeAttribute(k) { delete this.attrs[k]; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); }
  replaceChildren(...children) { this.children=children; }
  addEventListener(type,fn) { (this.listeners[type] ||= []).push(fn); }
  dispatchEvent(event) { (this.listeners[event.type] || []).forEach(fn=>fn(event)); }
  getBoundingClientRect() { return {left:12,top:100,bottom:140,width:210}; }
  scrollIntoView() {}
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(importFails=false) {
  const fields=Object.fromEntries(['from','to','hereInput','addressStatus'].map(id=>[id,Object.assign(new Element(),{id})]));
  const document={body:new Element(),activeElement:null,getElementById:id=>fields[id],createElement:()=>new Element(),addEventListener:()=>{}};
  const requests=[],details=[],timers=new Map();let timerId=0;
  const places={AutocompleteSessionToken:class {},AutocompleteSuggestion:{fetchAutocompleteSuggestions:request=>{
    const result=deferred();requests.push({request,...result});return result.promise;
  }}};
  const window={innerWidth:390,innerHeight:800,addEventListener:()=>{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'autocomplete.js'),'utf8'),{
    window,document,google:{maps:{importLibrary:async()=>{if(importFails)throw Error('disabled');return places;}}},
    Event:class{constructor(type){this.type=type;}},
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)
  });
  await window.initAddressAutocomplete();
  function type(id,value){document.activeElement=fields[id];fields[id].value=value;fields[id].dispatchEvent({type:'input'});}
  function flush(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}
  function prediction(text,pending){return {text:{toString:()=>text},toPlace:()=>({formattedAddress:text,fetchFields:async args=>{details.push(args);if(pending)await pending.promise;}})};}
  function key(id,key){const event={type:'keydown',key,preventDefault(){this.prevented=true;}};fields[id].dispatchEvent(event);return event;}
  return {fields,document,requests,details,type,flush,prediction,key};
}

test('all address fields request NYC-biased suggestions without device location',async()=>{
  const h=await setup();
  for(const id of ['from','to','hereInput']){
    h.type(id,'Penn');h.flush();
    const r=h.requests.at(-1);assert.equal(r.request.input,'Penn');assert.ok(r.request.locationBias);assert.ok(r.request.sessionToken);
    r.resolve({suggestions:[{placePrediction:h.prediction('Penn Station, New York, NY')}]});await tick();
    assert.equal(h.fields[id].attrs['aria-expanded'],'true');
    h.fields[id].dispatchEvent({type:'blur'});
  }
  assert.notEqual(h.requests[0].request.sessionToken,h.requests[1].request.sessionToken);
});

test('late response cannot overwrite newer results or reopen a blurred input',async()=>{
  const h=await setup();h.type('from','Pen');h.flush();h.type('from','Times');h.flush();
  h.requests[1].resolve({suggestions:[{placePrediction:h.prediction('Times Square')}]});await tick();
  h.requests[0].resolve({suggestions:[{placePrediction:h.prediction('Penn Station')}]});await tick();
  assert.equal(h.document.body.children[0].children[0].children[0].textContent,'Times Square');
  h.type('from','Brooklyn');h.flush();h.fields.from.dispatchEvent({type:'blur'});h.document.activeElement=null;
  h.requests[2].resolve({suggestions:[{placePrediction:h.prediction('Brooklyn')}]});await tick();
  assert.equal(h.fields.from.attrs['aria-expanded'],'false');
});

test('keyboard selection fills the address, ends session, and does not submit or reopen',async()=>{
  const h=await setup();h.type('to','Penn');h.flush();
  h.requests[0].resolve({suggestions:[{placePrediction:h.prediction('Penn Station, New York, NY')}]});await tick();
  assert.ok(h.key('to','ArrowDown').prevented);assert.ok(h.key('to','Enter').prevented);await tick();h.flush();
  assert.equal(h.fields.to.value,'Penn Station, New York, NY');assert.equal(h.fields.to.attrs['aria-expanded'],'false');assert.equal(h.requests.length,1);
  assert.deepEqual(Array.from(h.details[0].fields),['formattedAddress']);
  h.type('to','Moynihan');h.flush();assert.notEqual(h.requests[0].request.sessionToken,h.requests[1].request.sessionToken);
});

test('pointer selection preserves focus and populates the manual-location input',async()=>{
  const h=await setup();h.type('hereInput','Times');h.flush();
  h.requests[0].resolve({suggestions:[{placePrediction:h.prediction('Times Square, NY')}]});await tick();
  const option=h.document.body.children[2].children[0].children[0];
  let prevented=false;option.dispatchEvent({type:'pointerdown',preventDefault:()=>{prevented=true;}});
  option.dispatchEvent({type:'click'});await tick();
  assert.ok(prevented);assert.equal(h.fields.hereInput.value,'Times Square, NY');
});

test('details arriving after the traveler edits cannot replace the new text',async()=>{
  const h=await setup(),pending=deferred();h.type('to','Penn');h.flush();
  h.requests[0].resolve({suggestions:[{placePrediction:h.prediction('Penn Station',pending)}]});await tick();
  h.key('to','ArrowDown');h.key('to','Enter');h.type('to','Brooklyn');pending.resolve();await tick();
  assert.equal(h.fields.to.value,'Brooklyn');
});

test('API failures and empty responses keep manual input usable with feedback',async()=>{
  const h=await setup();h.type('from','Full street address');h.flush();h.requests[0].reject(Error('denied'));await tick();
  assert.match(h.fields.addressStatus.textContent,/Places API \(New\)/);assert.equal(h.fields.from.value,'Full street address');
  h.type('from','Unknown');h.flush();h.requests[1].resolve({suggestions:[]});await tick();
  assert.match(h.fields.addressStatus.textContent,/No suggestions/);assert.equal(h.fields.from.attrs['aria-expanded'],'false');
  const failed=await setup(true);assert.match(failed.fields.addressStatus.textContent,/suggestions unavailable/);
});
