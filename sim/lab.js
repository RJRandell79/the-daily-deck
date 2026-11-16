const E=require('../src/engine.js');const t0=Date.now();
const L=E.runLab(400,'t');console.log('ms',Date.now()-t0);
const f=x=>(x).toFixed(1);
console.log('ALL tt',f(L.tt/L.n),'careful',f(L.careful/L.n),'best',f(L.best/L.n),'ttBeats',L.ttBeats);
for(const k in L.rules){const R=L.rules[k];console.log(k,R.n,f(R.tt/R.n),f(R.careful/R.n),f(R.best/R.n))}
for(const k in L.abil){const A=L.abil[k];console.log(k,'dealt',A.dealt,'used%',f(100*A.used/A.dealt),'avgRound',f(A.roundSum/A.used),'staked%',f(100*A.staked/A.used),'stakedWin%',f(100*A.stakedWins/Math.max(1,A.staked)),'contrib',f(A.contrib/A.dealt))}
const d=E.generateDeck('daily-2026-11-16');console.log(d.abilities,d.condition.name);d.pool.forEach(c=>console.log(c.id,c.stats.join(','),c.value,c.star?'★':''));
