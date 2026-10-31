/* PauzeX Verify. Client-side friction only; not a replacement for server-side access control. */
(() => {
  "use strict";
  const KEY_COUNT="pzx_verify_visit_count_v1";
  const KEY_SESSION="pzx_verify_session_v1";
  const SESSION_MS=12*60*60*1000;
  const countVisit=()=>{
    if(sessionStorage.getItem("pzx_verify_counted_session")==="1") return Number(localStorage.getItem(KEY_COUNT)||"0");
    sessionStorage.setItem("pzx_verify_counted_session","1");
    const next=(Number(localStorage.getItem(KEY_COUNT)||"0")||0)+1;
    localStorage.setItem(KEY_COUNT,String(next));
    return next;
  };
  const validSession=()=>{
    try{const saved=JSON.parse(sessionStorage.getItem(KEY_SESSION)||"null");return !!saved&&Date.now()-saved.at<SESSION_MS;}catch{return false;}
  };
  const gate=document.getElementById("px-verify-gate");
  if(!gate) return;
  const visit=countVisit();
  const due=visit===1||visit%10===0;
  if(!due||validSession()){gate.hidden=true;document.body.classList.remove("px-verify-locked");return;}
  document.body.classList.add("px-verify-locked");
  const primary=document.getElementById("px-verify-primary");
  const checkbox=document.getElementById("px-verify-human");
  const extra=document.getElementById("px-verify-extra");
  const status=document.getElementById("px-verify-status");
  const continueButton=document.getElementById("px-verify-continue");
  let openedAt=Date.now(),pointerMoves=0,clickedAt=0,challengeAnswer="";
  const symbols=["◆","●","▲","✦","⬟","✚","☾","✧"];
  const random=(max)=>Math.floor(Math.random()*max);
  const issueExtra=()=>{
    const target=symbols[random(symbols.length)];
    const choices=[target,symbols[random(symbols.length)],symbols[random(symbols.length)],symbols[random(symbols.length)]];
    const correctIndex=random(4);choices[correctIndex]=target;
    for(let i=0;i<choices.length;i++){if(i!==correctIndex&&choices[i]===target)choices[i]=symbols[(symbols.indexOf(target)+1+random(symbols.length-1))%symbols.length];}
    challengeAnswer=String(correctIndex);
    document.getElementById("px-verify-prompt").textContent="Select the tile matching this symbol: "+target;
    const options=document.getElementById("px-verify-options");options.replaceChildren();
    choices.forEach((symbol,index)=>{const button=document.createElement("button");button.type="button";button.className="px-verify-option";button.textContent=symbol;button.setAttribute("aria-label","Option "+(index+1));button.addEventListener("click",()=>{if(String(index)!==challengeAnswer){status.textContent="That wasn't correct. Try the challenge again.";issueExtra();return;}complete();});options.append(button);});
    extra.hidden=false;status.textContent="One more quick check is needed.";
  };
  const complete=()=>{sessionStorage.setItem(KEY_SESSION,JSON.stringify({at:Date.now(),visit}));status.textContent="Verified. Opening PauzeX…";gate.classList.add("is-verified");setTimeout(()=>{gate.hidden=true;document.body.classList.remove("px-verify-locked");},350);};
  document.addEventListener("pointermove",()=>{pointerMoves=Math.min(pointerMoves+1,30);},{passive:true});
  checkbox?.addEventListener("change",()=>{clickedAt=Date.now();});
  primary?.addEventListener("click",()=>{
    if(!checkbox.checked){status.textContent="Please confirm the checkbox first.";return;}
    const elapsed=Date.now()-openedAt;
    const suspicious=elapsed<900||(pointerMoves===0&&matchMedia("(pointer:fine)").matches);
    if(suspicious){issueExtra();return;}
    complete();
  });
  continueButton?.addEventListener("click",()=>{if(!checkbox.checked){status.textContent="Please confirm the checkbox first.";return;}issueExtra();});
  window.addEventListener("pageshow",()=>{if(validSession()){gate.hidden=true;document.body.classList.remove("px-verify-locked");}});
})();
