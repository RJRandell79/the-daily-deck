const E=require('../src/engine.js');const n=+process.argv[3]||400;E.CFG.boost=+process.argv[2];if(process.argv[4]==='nostake')E.CFG.boostNoStake=true;else if(process.argv[4])E.CFG.boostCap=+process.argv[4];
const L=E.runLab(n,'t');const f=x=>x.toFixed(1),pc=(a,b)=>b?(100*a/b).toFixed(0)+'%':'—';
console.log(`=== Boost +${E.CFG.boost}${E.CFG.boostCap?' capped at '+E.CFG.boostCap:''}${E.CFG.boostNoStake?' — E2: no staking on Boost rounds':''}, ${n} decks ===`);
console.log('ALL TT',f(L.tt/n),'careful',f(L.careful/n),'perfect',f(L.best/n),'careful/perfect',pc(L.careful,L.best));
console.log('rule | n | careful | perfect | ratio-of-means | mean-ratio | Boost contrib | Boost flip rate');
for(const k in L.rules){const R=L.rules[k];console.log(k,'|',R.n,'|',f(R.careful/R.n),'|',f(R.best/R.n),'|',pc(R.careful,R.best),'|',pc(R.ratioSum,R.n),'|',R.boostN?f(R.boostContrib/R.boostN):'—','|',pc(R.boostFlips,R.boostN))}
for(const k in L.abil){const A=L.abil[k];console.log(k,'avgRound',f(A.roundSum/A.used),'staked',pc(A.staked,A.used),'stakedWin',pc(A.stakedWins,A.staked),'contrib',f(A.contrib/A.dealt),k==='Boost'?`flips ${pc(A.flips,A.used)} stakeSaves ${pc(A.stakeSaves,A.used)} avgGainInRound ${f(A.gain/A.used)}`:'')}
