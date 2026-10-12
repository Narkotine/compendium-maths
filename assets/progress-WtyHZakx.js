import{D as e,E as t,d as n,f as r,p as i,r as a,u as o}from"./index-CG2O6La6.js";import{n as s,t as c}from"./registry-Df1eHzn1.js";var l=(e,t)=>t?Math.round(100*e/t):0,u=e=>new Intl.DateTimeFormat(`fr-FR`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e));async function d(d){let f=e(),p=i(),{types:m,series:h}=a();document.title=`Mes progrès — Maths Collège`;let g={};for(let[e,t]of Object.entries(m)){let[n,r]=e.split(`/`),i=g[n]??(g[n]={n:0,ok:0,hint:0,fail:0,ids:[]});i.n+=t.n,i.ok+=t.ok,i.hint+=t.hint,i.fail+=t.fail,i.ids.push(r)}let _={};await Promise.all(Object.keys(g).filter(c).map(async e=>{try{let t=await s(e);_[e]=Object.fromEntries((t?.generators??[]).map(e=>[e.id,e.title]))}catch{}}));let v=f.groups.flatMap(e=>e.chapters),y=v.filter(e=>(p[e]??0)>=.97).length,b=Object.values(g).reduce((e,t)=>({n:e.n+t.n,ok:e.ok+t.ok}),{n:0,ok:0}),x=`<section class="pg-sum" aria-label="En bref">
      <div class="pg-kpi"><span class="pg-k">${y}<small>/${v.length}</small></span><span class="pg-l">chapitres lus</span></div>
      <div class="pg-kpi"><span class="pg-k">${b.n}</span><span class="pg-l">exercices faits</span></div>
      <div class="pg-kpi"><span class="pg-k">${b.n?`${l(b.ok,b.n)}<small> %</small>`:`–`}</span><span class="pg-l">réussis du premier coup</span></div>
    </section>`,S=f.groups.map(e=>{let i=e.chapters.map(e=>{let i=t(e);if(!i)return``;let a=p[e]??0,s=g[e],u=c(e),d=``;if(s){let t=o(e,s.ids),r=_[e]??{};d=`<p class="pg-line">${s.n} exercice${s.n>1?`s`:``} · <strong>${l(s.ok,s.n)} %</strong> du premier coup · ${l(s.hint,s.n)} % avec indice · ${l(s.fail,s.n)} % non réussis</p>
          <span class="pg-stack" aria-hidden="true"><span class="ok" style="width:${l(s.ok,s.n)}%"></span><span class="hint" style="width:${l(s.hint,s.n)}%"></span><span class="fail" style="width:${l(s.fail,s.n)}%"></span></span>
          ${t.length?`<p class="pg-weak">À retravailler : ${t.map(e=>n(r[e]??e)).join(` · `)}</p>`:``}`}else u&&(d=`<p class="pg-line pg-muted">Pas encore d’exercice fait.</p>`);let f=a>=.97?`Lu`:a>.02?`Lu à ${Math.round(a*100)} %`:`Pas commencé`;return`<li class="pg-ch" data-slug="${e}">
          <div class="pg-head"><span class="num-badge" aria-hidden="true">${i.num}</span>
            <a class="pg-title" href="#/ch/${e}"><span class="sr-only">Chapitre ${i.num} : </span>${n(i.title)}</a></div>
          <p class="pg-line">Cours : ${f}</p>
          <span class="bar" aria-hidden="true"><span style="width:${Math.round(a*100)}%"></span></span>
          ${d}
          ${u?`<a class="btn pg-go" href="#/entrainement/${e}">${r(`practice`)}<span>S’entraîner</span></a>`:``}
        </li>`}).join(``);return`<section class="group" style="--hue:${e.hue}" aria-labelledby="pg-${e.id}"><h2 class="group-title" id="pg-${e.id}">${n(e.title)}</h2><ul class="pg-list">${i}</ul></section>`}).join(``),C=h.slice(-8).reverse(),w=C.length?`<section class="group" aria-labelledby="pg-rec"><h2 class="group-title" id="pg-rec">Dernières séries</h2><ul class="pg-series">${C.map(e=>{let r=t(e.slug);return`<li><span>${n(r?`${r.num}. ${r.short}`:e.slug)} · ${`★`.repeat(e.level)}</span><span>${e.ok}/${e.n} du premier coup</span><time>${u(e.at)}</time></li>`}).join(``)}</ul></section>`:``;d.innerHTML=`
    <div class="page page--progress">
      <header class="appbar">
        <a class="icon-btn" href="#/" aria-label="Retour au sommaire">${r(`back`)}</a>
        <span class="appbar-title"><span class="t1">Mes progrès</span><span class="t2">Lecture et entraînement</span></span>
      </header>
      <main id="main" tabindex="-1" class="narrow">
        <h1 class="sr-only">Mes progrès</h1>
        ${x}
        ${b.n===0&&y===0?`<p class="pg-muted">Rien encore ici : lis un chapitre ou fais une série d’exercices, ta progression s’affichera sur cette page.</p>`:``}
        ${w}
        ${S}
        <p class="pg-muted pg-foot">Ces données restent sur cet appareil. Pour les effacer : Réglages.</p>
      </main>
    </div>`}export{d as renderProgress};