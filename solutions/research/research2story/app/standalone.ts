import type { ResearchResult } from "./types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

export function buildStandaloneHtml(result: ResearchResult) {
  const payload = JSON.stringify(result).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const zh = result.language === "zh";
  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(result.topic)} · Research2Story</title>
  <style>
    :root{color-scheme:light;--ink:#14231d;--paper:#f4f2eb;--line:#d9d8d0;--moss:#416b57;--mint:#e4eee0;--muted:#63706a}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"PingFang SC","Microsoft YaHei",sans-serif;overflow-x:hidden}
    main{min-height:100vh;display:grid;place-items:center;padding:clamp(18px,4vw,46px)}.player{width:min(1180px,100%)}
    .meta{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:14px;color:#6a756f;font-size:12px;letter-spacing:.04em}.brand{font-weight:750;color:var(--moss)}
    .stage{min-height:min(680px,74vh);border:1px solid var(--line);border-radius:34px;background:#fff;box-shadow:0 28px 90px rgba(20,35,29,.09);padding:clamp(26px,5vw,68px);display:grid;align-items:center;position:relative;overflow:hidden}
    .stage:before{content:"";position:absolute;width:420px;height:420px;border-radius:50%;background:var(--mint);filter:blur(70px);opacity:.7;right:-190px;top:-220px}.stage:after{content:"";position:absolute;inset:auto auto -250px -190px;width:420px;height:420px;border-radius:50%;background:#f7e7d8;filter:blur(90px);opacity:.42}
    .scene{position:relative;z-index:1;display:grid;gap:clamp(26px,5vw,62px);align-items:center}.scene.with-figure{grid-template-columns:minmax(0,.88fr) minmax(420px,1.12fr)}
    .copy{max-width:720px}.eyebrow{color:var(--moss);font-size:11px;font-weight:750;letter-spacing:.15em;text-transform:uppercase}.year{font-size:clamp(48px,7vw,86px);font-weight:750;letter-spacing:-.08em;color:#dce7dd;margin:9px 0 -10px}
    h1{font-size:clamp(32px,5.2vw,64px);line-height:1.06;letter-spacing:-.055em;margin:16px 0 0;text-wrap:balance}.text{font-size:clamp(14px,1.55vw,17px);line-height:1.78;color:var(--muted);margin:20px 0 0}.items{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}.item{border-radius:999px;background:var(--mint);color:var(--moss);padding:7px 11px;font-size:12px}
    .figure{display:none;margin:0;position:relative}.figure.visible{display:block}.image-shell{height:min(510px,58vh);display:grid;place-items:stretch;gap:8px;border:1px solid #e4e3dc;border-radius:25px;background:#f8f8f4;padding:18px;overflow:hidden;box-shadow:0 16px 45px rgba(20,35,29,.06)}.image-shell.multi{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(0,1fr)}.figure img{display:block;width:100%;height:100%;min-height:0;object-fit:contain;background:#fff;border-radius:10px}.figure figcaption{margin-top:11px;color:#738078;font-size:11px;line-height:1.55}
    .narration{margin-top:24px;border-left:2px solid rgba(65,107,87,.55);padding-left:14px;font-size:13px;line-height:1.72;color:#748079}.narration:before{content:"VOICE · ";font-size:10px;font-weight:750;letter-spacing:.11em;color:var(--moss)}
    .timeline{position:relative;margin:24px 12px 0;height:24px}.rail,.fill{position:absolute;left:0;right:0;top:7px;height:3px;border-radius:999px}.rail{background:#dcdad2}.fill{right:auto;width:0;background:var(--moss);transition:width .75s cubic-bezier(.22,.8,.28,1)}.markers{position:absolute;inset:0;display:flex;justify-content:space-between}.marker{width:9px;height:9px;margin-top:4px;border:2px solid var(--paper);border-radius:50%;background:#bbbfb8;box-shadow:0 0 0 1px #c8c9c3;transition:transform .45s ease,background .45s ease}.marker.done{background:var(--moss)}.marker.active{transform:scale(1.65);background:var(--moss);box-shadow:0 0 0 4px rgba(65,107,87,.13)}
    .play-row{display:flex;justify-content:center;margin-top:12px}.play{height:44px;min-width:118px;border:0;border-radius:999px;background:var(--ink);color:#fff;padding:0 20px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 10px 28px rgba(20,35,29,.16);transition:transform .2s ease,background .2s ease}.play:hover{background:var(--moss);transform:translateY(-1px)}
    .scene.enter{animation:scene-in .7s cubic-bezier(.22,.8,.28,1) both}.figure.visible img{animation:image-in .9s cubic-bezier(.22,.8,.28,1) both}
    @keyframes scene-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes image-in{from{opacity:0;transform:scale(.975)}to{opacity:1;transform:scale(1)}}
    @media(max-width:820px){.stage{min-height:690px;border-radius:26px}.scene.with-figure{grid-template-columns:1fr}.image-shell{height:300px}.figure{order:-1}h1{font-size:36px}.year{font-size:52px}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  </style>
</head>
<body>
  <main><div class="player">
    <div class="meta"><span class="brand">Research2Story</span><span id="counter"></span></div>
    <section class="stage"><div id="scene" class="scene"><div class="copy"><div id="eyebrow" class="eyebrow"></div><div id="year" class="year"></div><h1 id="title"></h1><p id="text" class="text"></p><div id="items" class="items"></div><div id="narration" class="narration"></div></div><figure id="figure" class="figure"><div id="images" class="image-shell"></div><figcaption id="caption"></figcaption></figure></div></section>
    <div class="timeline"><div class="rail"></div><div id="fill" class="fill"></div><div id="markers" class="markers"></div></div>
    <div class="play-row"><button id="play" class="play" type="button">${zh ? "▶ 播放" : "▶ Play"}</button></div>
  </div></main>
  <script id="research-data" type="application/json">${payload}</script>
  <script>
    const data=JSON.parse(document.getElementById('research-data').textContent);let index=0;let playing=false;let fallbackTimer;
    const byId=new Map(data.papers.map(function(p){return[p.id,p]}));const markers=document.getElementById('markers');
    data.storyboard.forEach(function(_,i){const marker=document.createElement('span');marker.className='marker';marker.dataset.index=String(i);markers.appendChild(marker)});
    function render(){
      const scene=data.storyboard[index],paper=scene.paperId?byId.get(scene.paperId):null,figure=paper&&paper.representativeFigure;const stage=document.getElementById('scene');
      stage.classList.remove('enter');void stage.offsetWidth;stage.classList.add('enter');stage.classList.toggle('with-figure',Boolean(figure));
      document.getElementById('counter').textContent=(index+1)+' / '+data.storyboard.length;document.getElementById('eyebrow').textContent=scene.eyebrow||'';document.getElementById('year').textContent=scene.year||'';document.getElementById('year').style.display=scene.year?'block':'none';document.getElementById('title').textContent=scene.title;document.getElementById('text').textContent=scene.text;document.getElementById('narration').textContent=scene.narration;
      const items=document.getElementById('items');items.replaceChildren();(scene.items||[]).forEach(function(value){const span=document.createElement('span');span.className='item';span.textContent=value;items.appendChild(span)});
      const figureNode=document.getElementById('figure'),imageShell=document.getElementById('images');figureNode.classList.toggle('visible',Boolean(figure));imageShell.replaceChildren();if(figure){const figureImages=figure.dataUrls&&figure.dataUrls.length?figure.dataUrls:[figure.dataUrl];imageShell.classList.toggle('multi',figureImages.length>1);figureImages.forEach(function(dataUrl,imageIndex){const image=document.createElement('img');image.src=dataUrl;image.alt=figure.caption+(figureImages.length>1?' · '+(imageIndex+1):'');imageShell.appendChild(image)});document.getElementById('caption').textContent=figure.caption}
      document.getElementById('fill').style.width=(data.storyboard.length===1?100:index/(data.storyboard.length-1)*100)+'%';markers.querySelectorAll('.marker').forEach(function(marker,i){marker.classList.toggle('done',i<=index);marker.classList.toggle('active',i===index)});document.getElementById('play').textContent=playing?'${zh ? "Ⅱ 暂停" : "Ⅱ Pause"}':'${zh ? "▶ 播放" : "▶ Play"}';
    }
    function stopVoice(){clearTimeout(fallbackTimer);if('speechSynthesis'in window)window.speechSynthesis.cancel()}
    function advance(){if(index<data.storyboard.length-1){index++;render();if(playing)speak()}else{playing=false;stopVoice();render()}}
    function speak(){stopVoice();if(!playing)return;const scene=data.storyboard[index];if(!('speechSynthesis'in window)){fallbackTimer=setTimeout(advance,6500);return}const utterance=new SpeechSynthesisUtterance(scene.narration);utterance.lang=data.language==='zh'?'zh-CN':'en-US';utterance.rate=.94;utterance.onend=function(){if(playing)advance()};utterance.onerror=function(){if(playing){fallbackTimer=setTimeout(advance,2600)}};window.speechSynthesis.speak(utterance)}
    document.getElementById('play').onclick=function(){if(!playing&&index===data.storyboard.length-1)index=0;playing=!playing;render();if(playing)speak();else stopVoice()};render();
  </script>
</body>
</html>`;
}
