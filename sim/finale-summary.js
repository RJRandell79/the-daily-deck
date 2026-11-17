// Usage: node sim/finale-summary.js playtests/*.csv — Grand Finale games grouped by stake limit and multiplier.
const fs=require('fs');const files=process.argv.slice(2);
const parse=l=>l.match(/"([^"]*)"/g).map(x=>x.slice(1,-1));
const groups={};
for(const f of files){const L=fs.readFileSync(f,'utf8').trim().split('\n');const head=L[0].split(',');
 for(const l of L.slice(1)){const v=parse(l);const g=Object.fromEntries(head.map((h,i)=>[h,v[i]]));if(g.rule!=='Grand Finale')continue;
  const fm=g.finaleMult||'3';const key=`${g.stakeLimit==='2'?'2 stakes':'unlimited'} · ×${fm}`;
  const G=groups[key]=groups[key]||{n:0,tot:0,perf:0,care:0,beat:0,heldR5:0,r5staked:0,r5won:0,r5pts:[],share:[],pcts:[]};
  const r5=g.R5;const st=r5.includes('●');const won=r5.includes('✓');const pts=+r5.match(/([+-]?\d+)$/)[1];
  G.n++;G.tot+=+g.total;G.perf+=+g.perfect;G.care+=+g.careful;if(+g.total>+g.careful)G.beat++;G.pcts.push(+g.pctPerfect);
  if(g.stakesLeftAtR5==='1')G.heldR5++; if(st){G.r5staked++;if(won)G.r5won++;G.r5pts.push(pts);} if(st&&won&&+g.total>0)G.share.push(Math.round(100*pts/+g.total));
 }}
for(const[k,G]of Object.entries(groups)){const s=a=>a.slice().sort((x,y)=>x-y);
 console.log(`${k}: n=${G.n} you/perfect=${Math.round(100*G.tot/G.perf)}% careful/perfect=${Math.round(100*G.care/G.perf)}% beat careful ${G.beat}/${G.n} | held stake into R5 ${G.heldR5} | R5 staked ${G.r5staked}, won ${G.r5won} | R5 staked pts ${G.r5pts.join(' ')} | won-R5 share of score ${G.share.join('% ')}% | pct range ${s(G.pcts)[0]}–${s(G.pcts).pop()}`);}
