(function(){
'use strict';
var KEY='careslot.appointments.v1';
var DOCS={'General Medicine':['Dr. Meera Shah','Dr. Arjun Patel'],'Cardiology':['Dr. Kavita Rao','Dr. Imran Qureshi'],'Pediatrics':['Dr. Sana Dave'],'Dermatology':['Dr. Rohan Mehta'],'Orthopedics':['Dr. Neel Joshi']};
var SLOTS=[];for(var h=9;h<17;h++){['00','30'].forEach(function(m){SLOTS.push((h<10?'0':'')+h+':'+m);});}
var $=function(id){return document.getElementById(id);};
var f={name:$('name'),phone:$('phone'),email:$('email'),dept:$('dept'),doctor:$('doctor'),date:$('date'),slot:$('slot'),reason:$('reason')};
var items=[];

function isoDate(d){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);}
function today(){return isoDate(new Date());}
function addDays(n){var d=new Date();d.setDate(d.getDate()+n);return isoDate(d);}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmtTime(t){var p=t.split(':'),h=+p[0];return ((h+11)%12+1)+':'+p[1]+(h<12?' AM':' PM');}
function fmtDate(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

function load(){
  try{var raw=localStorage.getItem(KEY);if(raw){var a=JSON.parse(raw);if(Array.isArray(a))return a;}}catch(e){}
  return null;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(items));}catch(e){toast('Could not save changes in this browser.','error');}}
function seed(){
  return [
    {id:uid(),name:'Ravi Kumar',phone:'9876543210',email:'',dept:'Cardiology',doctor:'Dr. Kavita Rao',date:today(),slot:'10:30',reason:'Follow-up ECG',status:'Confirmed'},
    {id:uid(),name:'Anita Desai',phone:'9825012345',email:'anita@example.com',dept:'Pediatrics',doctor:'Dr. Sana Dave',date:addDays(1),slot:'09:30',reason:'Child vaccination',status:'Pending'},
    {id:uid(),name:'Farhan Sheikh',phone:'9898123456',email:'',dept:'Orthopedics',doctor:'Dr. Neel Joshi',date:addDays(3),slot:'15:00',reason:'Knee pain',status:'Pending'}
  ];
}

function toast(msg,type){
  var t=document.createElement('div');t.className='toast '+(type||'');t.textContent=msg;$('toasts').appendChild(t);
  setTimeout(function(){t.remove();},3200);
}

function fillDepts(){
  var names=Object.keys(DOCS);
  f.dept.innerHTML='<option value="">Select department</option>'+names.map(function(n){return '<option>'+esc(n)+'</option>';}).join('');
  $('fDept').innerHTML='<option value="">All departments</option>'+names.map(function(n){return '<option>'+esc(n)+'</option>';}).join('');
}
function fillDoctors(){
  var d=f.dept.value;
  if(!d){f.doctor.innerHTML='<option value="">Choose department first</option>';f.doctor.disabled=true;}
  else{f.doctor.innerHTML='<option value="">Select doctor</option>'+DOCS[d].map(function(n){return '<option>'+esc(n)+'</option>';}).join('');f.doctor.disabled=false;}
  fillSlots();
}
function taken(doctor,date,slot){
  return items.some(function(a){return a.doctor===doctor&&a.date===date&&a.slot===slot&&a.status!=='Cancelled';});
}
function fillSlots(){
  var doc=f.doctor.value,date=f.date.value,prev=f.slot.value;
  if(!doc||!date){f.slot.innerHTML='<option value="">Pick doctor and date</option>';f.slot.disabled=true;return;}
  var now=new Date(),isToday=date===today(),nowMin=now.getHours()*60+now.getMinutes(),free=0;
  var opts=SLOTS.map(function(s){
    var p=s.split(':'),past=isToday&&(+p[0]*60+ +p[1])<=nowMin,busy=taken(doc,date,s);
    if(!busy&&!past)free++;
    return '<option value="'+s+'"'+(busy||past?' disabled':'')+'>'+fmtTime(s)+(busy?' (booked)':past?' (passed)':'')+'</option>';
  }).join('');
  f.slot.innerHTML='<option value="">'+(free?'Select time slot':'No free slots – try another date')+'</option>'+opts;
  f.slot.disabled=false;
  if(prev&&!taken(doc,date,prev))f.slot.value=prev;
}

function validate(){
  var e={},v={};
  Object.keys(f).forEach(function(k){v[k]=f[k].value.trim();});
  if(!v.name)e.name='Enter the patient’s name.';
  else if(!/^[\p{L} .'’-]{2,60}$/u.test(v.name))e.name='Use letters only, 2–60 characters.';
  var digits=v.phone.replace(/\D/g,'');
  if(!v.phone)e.phone='Enter a mobile number.';
  else if(!/^[+\d\s-]+$/.test(v.phone)||digits.length<10||digits.length>12)e.phone='Enter a valid 10-digit mobile number.';
  if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))e.email='Enter a valid email, like name@example.com.';
  if(!v.dept)e.dept='Select a department.';
  if(!v.doctor)e.doctor='Select a doctor.';
  if(!v.date)e.date='Choose a date.';
  else if(v.date<today())e.date='Date can’t be in the past.';
  if(!v.slot)e.slot='Select a time slot.';
  else if(v.doctor&&v.date&&taken(v.doctor,v.date,v.slot))e.slot='That slot was just booked. Choose another.';
  if(v.reason.length>200)e.reason='Keep it under 200 characters.';
  return {errors:e,values:v};
}
function showErrors(e){
  Object.keys(f).forEach(function(k){
    $('e-'+k).textContent=e[k]||'';
    if(e[k])f[k].setAttribute('aria-invalid','true');else f[k].removeAttribute('aria-invalid');
  });
}

function stats(){
  var t=today(),now=new Date(),nowKey=t+' '+(now.getHours()<10?'0':'')+now.getHours()+':'+(now.getMinutes()<10?'0':'')+now.getMinutes();
  $('sToday').textContent=items.filter(function(a){return a.date===t&&a.status!=='Cancelled';}).length;
  $('sPending').textContent=items.filter(function(a){return a.status==='Pending';}).length;
  $('sTotal').textContent=items.length;
  var up=items.filter(function(a){return (a.status==='Pending'||a.status==='Confirmed')&&(a.date+' '+a.slot)>=nowKey;})
    .sort(function(a,b){return (a.date+a.slot)<(b.date+b.slot)?-1:1;})[0];
  $('nextWho').textContent=up?up.name+' · '+up.doctor:'–';
  $('nextWhen').textContent=up?fmtDate(up.date)+' at '+fmtTime(up.slot)+' · '+up.dept:'Nothing scheduled yet.';
}

function render(){
  var q=$('q').value.trim().toLowerCase(),st=$('fStatus').value,dp=$('fDept').value;
  var shown=items.filter(function(a){
    return (!st||a.status===st)&&(!dp||a.dept===dp)&&(!q||(a.name+' '+a.doctor+' '+a.phone).toLowerCase().indexOf(q)>-1);
  }).sort(function(a,b){return (a.date+a.slot)<(b.date+b.slot)?-1:1;});
  $('count').textContent='Showing '+shown.length+' of '+items.length+' appointment'+(items.length===1?'':'s');
  if(!shown.length){
    $('list').innerHTML=items.length
      ?'<div class="empty"><b>No appointments match</b>Try a different search or clear the filters.</div>'
      :'<div class="empty"><b>No appointments yet</b>Use the form to book the first one.</div>';
  }else{
    $('list').innerHTML=shown.map(function(a){
      var b='';
      if(a.status==='Pending')b+='<button class="btn sm" data-act="Confirmed" data-id="'+a.id+'">Confirm</button>';
      if(a.status==='Confirmed')b+='<button class="btn sm" data-act="Completed" data-id="'+a.id+'">Mark completed</button>';
      if(a.status==='Pending'||a.status==='Confirmed')b+='<button class="btn sm ghost" data-act="Cancelled" data-id="'+a.id+'">Cancel</button>';
      b+='<button class="btn sm ghost danger" data-act="delete" data-id="'+a.id+'">Delete</button>';
      return '<article class="item"><div class="when"><b>'+esc(fmtTime(a.slot))+'</b><span>'+esc(fmtDate(a.date))+'</span></div>'+
        '<div class="info"><h3>'+esc(a.name)+' <span class="chip '+a.status+'">'+a.status+'</span></h3>'+
        '<p>'+esc(a.doctor)+' · '+esc(a.dept)+'</p><p>'+esc(a.phone)+(a.email?' · '+esc(a.email):'')+'</p>'+
        (a.reason?'<p>“'+esc(a.reason)+'”</p>':'')+'<div class="btns">'+b+'</div></div></article>';
    }).join('');
  }
  stats();
}

f.dept.addEventListener('change',fillDoctors);
f.doctor.addEventListener('change',fillSlots);
f.date.addEventListener('change',fillSlots);
Object.keys(f).forEach(function(k){f[k].addEventListener('input',function(){$('e-'+k).textContent='';f[k].removeAttribute('aria-invalid');});});
['q','fStatus','fDept'].forEach(function(id){$(id).addEventListener('input',render);});

$('form').addEventListener('submit',function(ev){
  ev.preventDefault();
  var r=validate();showErrors(r.errors);
  var keys=Object.keys(r.errors);
  if(keys.length){f[keys[0]].focus();toast('Please fix '+keys.length+' field'+(keys.length>1?'s':'')+' and try again.','error');fillSlots();return;}
  var v=r.values;
  items.push({id:uid(),name:v.name,phone:v.phone,email:v.email,dept:v.dept,doctor:v.doctor,date:v.date,slot:v.slot,reason:v.reason,status:'Pending'});
  save();
  toast('Booked '+v.name+' with '+v.doctor+' on '+fmtDate(v.date)+' at '+fmtTime(v.slot)+'.');
  $('form').reset();showErrors({});fillDoctors();render();
});
$('form').addEventListener('reset',function(){setTimeout(function(){showErrors({});fillDoctors();},0);});

$('list').addEventListener('click',function(ev){
  var btn=ev.target.closest('button[data-act]');if(!btn)return;
  var id=btn.getAttribute('data-id'),act=btn.getAttribute('data-act');
  var a=items.filter(function(x){return x.id===id;})[0];if(!a)return;
  if(act==='delete'){
    if(!btn.classList.contains('armed')){
      btn.classList.add('armed');btn.textContent='Click again to delete';
      setTimeout(function(){if(btn.isConnected){btn.classList.remove('armed');btn.textContent='Delete';}},3000);return;
    }
    items=items.filter(function(x){return x.id!==id;});save();render();fillSlots();toast('Deleted appointment for '+a.name+'.','info');return;
  }
  a.status=act;save();render();fillSlots();
  toast(act==='Confirmed'?'Confirmed '+a.name+'’s appointment.':act==='Completed'?'Marked '+a.name+'’s visit as completed.':'Cancelled '+a.name+'’s appointment.',act==='Cancelled'?'info':'');
});

fillDepts();
f.date.min=today();
items=load();
if(!items){items=seed();save();}
fillDoctors();render();
})();
