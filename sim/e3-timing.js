// E3 control: value of choosing WHEN to stake, under perfect information (2-stake limit).
const E=require('../src/engine.js');E.CFG.maxStakes=2;
const n=400;let free=0,early=0;const byRule={};
for(let i=0;i<n;i++){const d=E.generateDeck('t'+i);const o={allowed:E.ALL,boostAvail:d.abilities.includes('Boost'),starLimit:E.CFG.starLimit,maxStakes:2};
 const a=E.solve(d,E.START,o).pts,b=E.solve(d,E.START,{...o,stakeRounds:[0,1]}).pts;free+=a;early+=b;
 const k=d.condition.type==='double'?'Stat Surge':d.condition.name;byRule[k]=byRule[k]||[0,0,0];byRule[k][0]+=a;byRule[k][1]+=b;byRule[k][2]++;}
console.log('perfect, free timing',(free/n).toFixed(1),'| perfect, stakes forced R1-R2',(early/n).toFixed(1),'| value of timing',((free-early)/n).toFixed(1));
for(const k in byRule){const v=byRule[k];console.log(k,(v[0]/v[2]).toFixed(1),(v[1]/v[2]).toFixed(1),'diff',((v[0]-v[1])/v[2]).toFixed(1))}
