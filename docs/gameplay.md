# The Daily Deck — Gameplay Design Document

> **Status:** Living document · **Current version:** v0.2.4 (placeholder-numbers prototype)
> **Last updated:** 16 Nov 2026
> **Prototype:** https://claude.ai/artifact/9dszi39qzrajPPTgUntgRo

This document describes how the game currently plays, and logs every change, decision and playtest finding. When the rules change, update the relevant section **and** add an entry to the [Change log](#16-change-log) and, if relevant, the [Decision log](#15-decision-log).

---

## Contents

1. [Premise](#1-premise)
2. [Design principles](#2-design-principles)
3. [The daily loop](#3-the-daily-loop)
4. [Components](#4-components)
5. [The draft](#5-the-draft)
6. [How a round plays](#6-how-a-round-plays)
7. [Scoring](#7-scoring)
8. [Abilities](#8-abilities)
9. [House clues](#9-house-clues)
10. [Daily rules](#10-daily-rules)
11. [Deck generation, card pricing and fairness](#11-deck-generation-card-pricing-and-fairness)
12. [Benchmarks and balance](#12-benchmarks-and-balance)
13. [Modes, collection and progression](#13-modes-collection-and-progression)
14. [Competition and social design](#14-competition-and-social-design)
15. [Decision log](#15-decision-log)
16. [Change log](#16-change-log)
17. [Tunable parameters](#17-tunable-parameters)
18. [Open questions](#18-open-questions)
19. [Playtest log](#19-playtest-log)

---

## 1. Premise

A quick daily tactical card game. Everyone receives the same cards and faces the same opponent, and tries to get the highest score.

It takes the accessibility of Top Trumps, but picking the biggest number is a losing strategy. The skill is in reading the opponent, building the right hand, timing abilities, and knowing when to take a risk.

**Easy to learn. Difficult to master. Different decisions every day.**

> **Your skill wins the game. Your collection changes how you play it.**

---

## 2. Design principles

### 2.1 Pillars

| Pillar | What it means in practice |
|---|---|
| **Tactical** | You draft a hand, then each round choose a card, a stat, whether to use an ability and whether to stake. |
| **Uncertain** | House cards are hidden behind clues, so outcomes aren't obvious in advance. |
| **Risk and reward** | Safe play is viable. Staking pays double but punishes misjudgement. |
| **Varied** | A new pool, new house cards, new clues, a new ability set and a new rule every day. |
| **Fair** | Everyone gets the same deck and the same "luck". No specialist knowledge is needed. |
| **Short** | A quick draft and 5 rounds: 2–5 minutes. |

### 2.2 Competitive fairness (firm rules)

1. **No competitive advantage can be bought, ground out, or held only by long-standing players.**
2. **No vertical progression.** Newly acquired cards are never objectively stronger than starting cards. No power-based rarities, stat upgrades or paid boosts.
3. **Collection expands tactical choice, not power.** New cards offer different approaches, not more strength.
4. **The daily competition stays fair.** Everyone competes under the same rules, with the same available cards. Owning more cards, playing for longer or spending money must never improve someone's daily odds.
5. **Commitment can be rewarded, but not with daily advantage.** Suitable rewards: new card designs, visual treatments, achievements, statistics and alternative challenges.
6. **No obligation loops.** Rewards must not make people feel they have to play every day just to keep up.

**Feature test:** *Does it create an interesting decision, or does it simply give someone an advantage?* If it's the latter, it doesn't belong in the competitive game.

### 2.3 Interesting choices, not identical numbers

We're trying to create interesting choices, not perfectly balanced numbers.

- Abilities (and later, cards) should have **different strengths and different situations where they shine**. They should not be mathematically interchangeable.
- Balance work aims to make each option **an interesting decision**: one that's sometimes right and sometimes wrong. It does not aim for equal average contribution.
- An option is a problem when it's the right choice almost regardless of circumstances (it dominates), or almost never worth taking (it's pointless). Being stronger on average than the others isn't, on its own, a problem.
- Balance data is therefore read alongside behaviour: when and why an option gets used, by rule and by situation, and how it feels in human play.

---

## 3. The daily loop

1. **Receive the daily deck.** It is identical for everyone that day.
2. **Read today's rule and the house clues.**
3. **Draft 8 of 12 cards** (see §5).
4. **Play 5 rounds** against the house.
5. **Get a score and a breakdown**, compared with three benchmark bots.
6. **Share a spoiler-free result** (an emoji grid).
7. **Come back tomorrow.**

In the real game you get one attempt per day at the daily deck. The prototype records your first attempt and labels later plays as replays. Practice decks are unlimited.

---

## 4. Components

### 4.1 The daily pool — 12 stat cards

- Labelled **A–L**.
- Each has four stats: **Power, Speed, Range, Grit**. These are placeholder names. Each stat runs from 1 to 8, and stats total 18–22 per card.
- Stat cards carry **no abilities**. Abilities are separate (see §4.3).
- The 5 highest-valued cards in the pool are marked **★** (see §11.2).

### 4.2 The house — 5 cards

- One house card per round, played in a fixed, visible order (R1–R5).
- Stats run from 4 to 10, with totals of 28–34. **House cards can reach 10, but yours top out at 8.** This keeps the house dangerous even though you choose which stat to compare.
- Stats are **hidden** until the card is revealed. Each card shows **one clue** (see §9).

### 4.3 Abilities — 3 per day

- There is a pool of 4 abilities: Scout, Switch, Boost and Shield.
- Each day, **3 are dealt**. Everyone gets the same 3.
- Each ability can be used once.

### 4.4 Today's rule

One condition per day that changes the scoring or the constraints (see §10).

---

## 5. The draft

- Before round 1, choose **8 of the 12** pool cards.
- **You can take at most 3 ★ cards.**
- The house clues, today's rule and today's abilities are all visible while you draft, so the draft is an informed decision.
- Only 5 of your 8 cards will be played, which gives you a safety margin and flexibility for later rounds.
- **Target:** the draft should add no more than about a minute to a game.

---

## 6. How a round plays

1. **Study the house card.** Its clue shows what you know.
2. **Optionally play one ability.** **Scout** is resolved straight away, revealing two more stats, before you choose anything else.
3. **Choose a card and a stat.** In the prototype you tap one stat on one of your unused cards.
4. **Decide whether to stake**, before the reveal.
5. **Play.** The house card is revealed and the chosen stat compared.
   - If you're using **Switch**, you see the whole house card first and then pick which stat to compare.
6. **Score the round** (see §7).

### Ability limits

| Rule | Setting |
|---|---|
| Stat cards | 8 in hand, each usable once (5 are played) |
| Ability cards | 3 dealt, each usable once |
| Abilities per round | Maximum one |
| Cards played per round | Maximum two (one stat card plus one ability) |
| Ability-only round | Not permitted |
| Unused abilities | No bonus points |

**Higher number wins**, unless today's rule says otherwise (Low Ball).

---

## 7. Scoring

| Outcome | Not staked | Staked |
|---|---|---|
| **Win** | 10 + margin | (10 + margin) × 2 |
| **Tie** | 5 | −10 (0 with Shield) |
| **Loss** | 0 | −10 (0 with Shield) |

- **Margin** is the difference between the two numbers. For example, Speed 8 v 5 is a margin of 3, which scores 13.
- A win is worth much more than a big margin, so scraping a narrow win is often better than gambling on a large one.
- Modifiers from today's rule are applied after staking (see §10).

**Example:** you play G · Range 7 with Boost (making it 10) against a house Range of 6, staked. That's (10 + 4) × 2 = **28**.

---

## 8. Abilities

Every ability affects **the round it's played in**.

| Ability | Effect | Design intent |
|---|---|---|
| **Scout** | Played first: reveals **two more stats** of this round's house card before you choose. | Turns a vague clue into a confident play, and often a confident stake. |
| **Switch** | After the reveal, you choose which stat to compare. | Converts uncertainty into information. Strong, but not guaranteed: if all four house stats beat yours, you still lose. |
| **Boost** | +3 to every stat of the card you play this round. | Lifts a card above the player cap of 8, the only way to beat a house 9 or 10. |
| **Shield** | If you lose or tie this round while staked, you lose nothing. | A risk-free stake. Directly tied to the staking mechanic. |

**Switch and staking** are being watched closely but deliberately not nerfed in advance (D10). One ability feeling especially powerful can be exciting, provided using it has a real opportunity cost. If an ability dominates, adjust that ability rather than weakening all of them.

**Measurements in the Balance lab, per ability:**
- how often it's used when dealt
- the average round it's used in (saved, or spent early?)
- staked wins when used
- contribution: the careful bot's score with the ability minus its score without it

The lab also shows **your own** ability use across games in that browser.

**v0.2 findings:** see §12.2. Boost is currently the strongest ability, not Switch.

---

## 9. House clues

Each house card shows exactly one clue.

| Clue type | Example | What it tells you |
|---|---|---|
| **Strongest** | "Strongest stat is Speed" (▲ SPD) | Avoid challenging that stat. |
| **Weakest** | "Weakest stat is Range" (▼ RNG) | A likely win, possibly a stake. |
| **Range** | "Power is between 5 and 7" | Gives a precise risk calculation on one stat. |
| **Total** | "Stats add up to 30" | Tells you whether this is a strong or weak card overall. |
| **Exact** | "Grit is exactly 8" | Certainty on one stat only. |

- Strongest and Weakest clues are used only when that stat is unique, so they're never ambiguous.
- Scout reveals two further stats, chosen from those the clue doesn't cover.

---

## 10. Daily rules

One rule is picked per day.

| Rule | Effect | Tactical consequence |
|---|---|---|
| **Stat Surge** (e.g. Speed Surge) | Rounds won on that stat score ×2. | Pulls the draft and play towards one stat. |
| **Rotation** | You can't compare the same stat in two consecutive rounds. | Forces a balanced draft and planning ahead. |
| **Grand Finale** | Round 5 scores ×3, including negative scores. | Save a strong card, and perhaps an ability, for the end. |
| **Low Ball** | In one named round (2–4), the **lower** number wins. | Draft at least one card with a very low stat. |
| **Underdog** | Ties count as wins (with a margin of 0). | Makes exact-value clues more valuable. |

---

## 11. Deck generation, card pricing and fairness

### 11.1 Generation

- **Daily deck:** generated from a seed of the version and date (e.g. `v02-daily-2026-11-16`). Everyone gets the same pool, house cards, clues, abilities and rule.
- **Practice decks:** seeded from a 6-character code (e.g. `#deck-ab3k9x`). Sharing the link gives someone the identical deck.
- **No in-game randomness.** Once the deck is generated, outcomes depend only on your decisions.
- **Known limitation:** the daily seed uses the device's local date. A live version needs a server-defined "game day".

### 11.2 Card pricing

Stat totals are a poor measure of a card's value. You choose which stat to compare, so a card's **best** stat matters far more than its total: a card with 8, 1, 1, 8 often beats one with 5, 5, 4, 4.

| Measure | Definition | Status |
|---|---|---|
| **Standalone value** | The card's average best-stat result against a fixed sample of 400 house cards. | ✅ Implemented. Used to mark the top 5 as ★. |
| **Contextual value** | How much the card improves a complete hand, given the other cards and the daily rules. Measured as bot score with the card minus without it. | ⏳ Planned. Needed before any collection is balanced. |

Contextual value is the more important of the two for balancing a collection. A card that looks ordinary on average may be exceptional under Stat Surge, Rotation or Low Ball, or alongside particular cards.

---

## 12. Benchmarks and balance

| Bot | Behaviour |
|---|---|
| **Top Trumps player** | Drafts the biggest numbers, plays its single highest number, uses abilities straight away, never stakes. |
| **Careful bot** | Drafts by planning against the clues. Re-plans every round. Uses abilities with simple judgement and stakes when its estimated margin is 2 or more. Never leaves an ability unused. |
| **Perfect hindsight** | Exhaustive search with full knowledge of every house card. With full knowledge only Boost changes the result (Scout and Switch add information it already has), so this is the theoretical maximum. |

### 12.1 Scores — v0.2, 400 random decks

| Rule | Top Trumps | Careful bot | Perfect |
|---|---|---|---|
| Rotation | 37 | 80 | 125 |
| Underdog | 42 | 96 | 129 |
| Low Ball | 35 | 110 | 140 |
| Stat Surge | 45 | 119 | 184 |
| Grand Finale | 49 | 111 | 186 |
| **All decks** | **42** | **103** | **153** |

- Top Trumps play reaches **27%** of perfect. The careful bot reaches **67%**.
- Top Trumps matched or beat the careful bot on 3% of decks.
- **Careful bot behaviour** (120-deck sample): wins 79% of rounds, stakes 76% of them, and about 14% of its stakes fail.

### 12.2 Abilities — v0.2, 400 decks (careful bot)

| Ability | Used when dealt | Avg round used | Staked wins | Contribution |
|---|---|---|---|---|
| Scout | 100% | 1.3 | 100% | +11.1 |
| Switch | 100% | 2.3 | 74% | +6.2 |
| Boost | 100% | 2.9 | 100% | **+21.2** |
| Shield | 100% | 3.9 | 63% | +5.3 |

- "Used when dealt" is always 100% because unused abilities score nothing and the bot always spends them. Human data is more telling here.
- **Boost is the dominant ability.** With the player cap of 8, +3 is the only way to beat a house 9 or 10. Watch it in playtests. If it stays dominant, try +2.
- **Switch is strong but not automatic.** About a quarter of staked Switch rounds still lose.
- **Shield** is used late and mostly as a forced spend. Is it interesting enough to keep in the pool?

### 12.3 Why v0.2 changed the card strengths

With the v0.1 strengths applied to the v0.2 draft and ability rules, the careful bot won **94%** of rounds and staked **96%** of them, so staking stopped being a decision. Making the house stronger alone didn't fix it, because choosing the stat is too big an advantage. **Capping player stats at 8 against a house maximum of 10** did fix it.

### 12.4 Balance targets (provisional)

| Target | v0.2 |
|---|---|
| Top Trumps play under 40% of perfect | ✅ 27% |
| Careful bot at 60–80% of perfect | ✅ 67% |
| Careful bot's staked-round loss rate of 10–25% | ✅ about 14% |
| No ability dominates: each is sometimes the wrong choice, and each changes the outcome in a meaningful share of the rounds it's used (§2.3). Equal contribution is **not** a target. | 🔄 Boost under review (E1, E2). Human data needed. |
| No rule changes the average perfect score by more than ±20% | ❌ 125–186 |

### 12.5 Experiment E1 — Boost size (16 Nov 2026)

**Hypothesis:** Boost is an outlier because +3 crosses the player's stat ceiling of 8. That makes it a temporary exception to the game's central constraint.

**Method:** the same 400 decks, with only the Boost amount changed. Everything else, including the 8-point cap, is held constant (D14). The +2 run is the experiment. +1 and "+3 capped at 8" were run only as reference points.

| Measure | +3 (baseline) | **+2 (test)** | +1 (ref) | +3 capped at 8 (ref) |
|---|---|---|---|---|
| Boost contribution | +21.2 | **+17.8** | +6.5 | +3.8 |
| Turns a loss or tie into a win | 38% of uses | **35%** | 22% | 3% |
| Rescues a stake that would have failed | 38% | **34%** | 5% | 2% |
| Staked win rate when used | 100% | **96%** | 98% | 63% |
| Points gained in the round it's used | +18.4 | **+15.1** | +4.5 | +1.0 |
| Careful ÷ perfect (all decks) | 67% | **67%** | 62% | 62% |
| Perfect average | 153 | **151** | 148 | 146 |

**By daily rule (+3 → +2):**

| Rule | Careful ÷ perfect | Boost contribution | Boost flip rate |
|---|---|---|---|
| Rotation | 64% → 62% | +20.9 → +16.2 | 51% → 43% |
| Underdog | 74% → 74% | +17.4 → +15.4 | 23% → 23% |
| Low Ball | 78% → 78% | +17.4 → +14.9 | 32% → 30% |
| Stat Surge | 65% → 64% | +28.6 → +23.2 | 41% → 34% |
| Grand Finale | 60% → 60% | +22.2 → +19.5 | 45% → 44% |

**Findings:**

1. **The hypothesis is supported.** Capping Boost at 8 removes almost all of its value (3% flip rate). The cap-crossing is what makes Boost strong.
2. **+2 helps, but less than expected.** Contribution falls by only 16%, because 8 + 2 = 10 still matches the house maximum and beats a 9. Boost remains the outlier (the others are around +6 to +12).
3. **+2 doesn't feel pointless on these measures.** It still decides about a third of the rounds it's used in.
4. **+1 is in line with the other abilities**, but it rescues only 5% of stakes. That's the risk of an ability that feels pointless.
5. **The value of a Boost round comes almost entirely from staking.** At +3, nearly every flip is also a rescued stake, so the doubling does most of the work. A candidate for a later, separate experiment: **E2, Boost rounds can't be staked.**
6. **Boost is most valuable under Stat Surge and least under Underdog.**
7. **Careful ÷ perfect by rule ranges from 60% (Grand Finale) to 78% (Low Ball).** The overall average doesn't hide extreme splits. But the multiplier rules (Finale, Surge) and Rotation are where careful play falls furthest behind hindsight. Those days test sequencing decisions most heavily.

**Caveats:**
- The careful bot's rules for using abilities are fixed regardless of the Boost amount, so contribution partly reflects the bot's policy.
- How exciting Boost feels can only come from human playtests. The prototype's Balance lab has a **Boost +3 / +2 toggle** for this.

**Status:** 🔄 +3 stays as the reference. **+2 is the leading candidate**, with normal staking, pending human playtests (D16). The other abilities are unchanged.

### 12.6 Experiment E2 — No staking on Boost rounds (16 Nov 2026)

**Hypothesis:** Boost's value comes mostly from doubling staked wins, not from the boost itself (E1 finding 5).

**Method:** the same 400 decks. Boost kept at **+3** (the reference), and Boost rounds can't be staked. Nothing else changed. This is deliberately not combined with +2.

| Measure | +3 reference | **E2: +3, no stake** | E1: +2, normal staking |
|---|---|---|---|
| Boost contribution | +21.2 | **+6.0** | +17.8 |
| Turns a loss or tie into a win | 38% of uses | **38%** | 35% |
| Points gained in the round it's used | +18.4 | **+6.1** | +15.1 |
| Careful ÷ perfect (all decks) | 67% | **64%** | 67% |
| Perfect average | 153 | **144** | 151 |

**By daily rule (E2):**

| Rule | Careful ÷ perfect | Boost contribution |
|---|---|---|
| Rotation | 59% | +8.0 |
| Underdog | 69% | +3.5 |
| Low Ball | 73% | +3.2 |
| Stat Surge | 62% | +8.9 |
| Grand Finale | 58% | +6.8 |

**Findings:**

1. **The hypothesis is confirmed.** Removing the stake removes most of Boost's points. It still decides the same share of rounds (38%), but those wins are no longer doubled.
2. **E2 removes a decision.** Under E2 the "stake or not" choice disappears on Boost rounds. That runs against §2.3, so E2 is a diagnostic result rather than a preferred rule.
3. **Careful play falls further behind perfect under E2** (64%, against 67%), and Underdog and Low Ball Boost rounds become nearly worthless (+3 to +4).

**Status:** 🔄 Diagnostic. Not adopted. Keep normal staking with +2 as the leading candidate (D16).

### 12.7 Experiment E3 — Two stakes per game (16 Nov 2026)

**Why:** in Rob's first 8 playtest games, he staked 39 of 40 rounds (§19.2). The maths agrees with him. A staked win pays double and a staked loss costs only 10, so staking pays whenever the chance of winning is above about 45%. A careful bot that stakes every round beats the selective one (107 against 103 on average, and at least as well on 73% of decks). **Staking has stopped being a decision.**

**Hypothesis:** limiting stakes to two per game turns staking into an opportunity-cost decision: *is this round worth one of my two chances, or will I need it later?*

**Method:** the same 400 decks. Only the stake rule changes; Boost stays at +3 and everything else is held constant.
- **Baseline:** unlimited stakes (current rules).
- **E3a:** at most 2 stakes. The careful bot plans its whole game on its estimates, including where to stake. It stakes when the plan says so and it's confident, or when it would otherwise waste a stake.
- **E3b (control):** at most 2 stakes, which the bot must spend in rounds 1 and 2.
- **The perfect bot** knows the 2-stake limit in both versions and chooses the best rounds for its stakes.

| Measure | Baseline (unlimited) | **E3a (2, chosen)** | E3b (2, forced R1–R2) |
|---|---|---|---|
| Careful bot average | 103 | **82** | 81 |
| Perfect average | 153 | **116** | 116 |
| Top Trumps average (never stakes) | 42 | 42 | 42 |
| Careful ÷ perfect | 67% | **70%** | 70% |
| Top Trumps ÷ perfect | 27% | **36%** | 36% |
| Stakes used per game (careful) | 3.7 | 2.0 | 2.0 |
| Games using both stakes | — | 95% | 100% |
| Stake success rate (careful) | 87% | **84%** | 87% |

**Which rounds get the stakes:**

| Round | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| Careful bot, E3a | 28% | 30% | 26% | 12% | **4%** |
| Perfect bot, 2 stakes | 11% | 17% | 20% | 22% | **30%** |

**Careful ÷ perfect by rule (Top Trumps ÷ perfect in brackets):**

| Rule | Baseline | E3a | E3b |
|---|---|---|---|
| Rotation | 64% (30%) | 72% (41%) | 72% (41%) |
| Underdog | 74% (32%) | 79% (44%) | 79% (44%) |
| Low Ball | 78% (25%) | 80% (34%) | 79% (34%) |
| Stat Surge | 65% (24%) | 70% (32%) | 70% (32%) |
| Grand Finale | 60% (26%) | **58% (32%)** | 58% (32%) |

**Abilities alongside stakes (careful bot):**

| Ability | Contribution: baseline → E3a | Staked when used: baseline → E3a |
|---|---|---|
| Scout | +11.1 → +8.7 | 49% → 33% |
| Switch | +6.2 → **+0.1** | 100% → 86% |
| Boost | +21.2 → **+10.0** | 97% → 16% |
| Shield | +5.3 → **0.0** | 100% → 54% |

**Value of timing under perfect play.** This is the perfect bot choosing its stake rounds freely, against having them forced into R1–R2 (`sim/e3-timing.js`):

| Rule | Free timing | Forced R1–R2 | Value of timing |
|---|---|---|---|
| Rotation | 91 | 89 | +2 |
| Underdog | 94 | 92 | +2 |
| Low Ball | 104 | 100 | +5 |
| Stat Surge | 140 | 132 | +8 |
| **Grand Finale** | 152 | 118 | **+34** |
| **All decks** | 116 | 106 | **+10** |

**Findings:**

1. **The bot couldn't make use of timing.** E3a and E3b produce almost identical careful scores (82 against 81). The bot spends 84% of its stakes in rounds 1–3 because it sees an acceptable margin early. That's exactly the risk Rob identified.
2. **But timing is genuinely valuable.** With perfect knowledge, choosing when to stake is worth about +10 points per game, and far more on multiplier days: **+34 on Grand Finale**, +8 on Stat Surge. Perfect play saves stakes for later (52% in R4–R5). So the opportunity-cost decision E3 aims for does exist. Our bot just can't see it, and humans are needed to test it. *Playtest evidence:* in game 6 (Grand Finale), Rob saved a Shield-backed stake for round 5 and scored +66.
3. **Skill still matters, but the spread narrows.** Careful play scores about twice Top Trumps (82 against 42), down from about 2.5×. Top Trumps ÷ perfect rises to 36%, partly because perfect scores fall when stakes are limited.
4. **Stakes stay safe rather than risky.** The success rate barely moves (87% → 84%). Two stakes make staking *scarce*, not *uncertain*. Whether scarcity alone creates enough tension is a question for playtesting.
5. **E3 hollows out Switch and Shield.** Their value was bound up with staking, and with only two stakes they contribute about nothing. **This conflicts with §2.3:** an ability that's never worth taking is pointless. Boost falls to +10, no longer an outlier. If E3 is adopted, Switch and Shield will need redesigning, as separate follow-up experiments.
6. **Grand Finale is now the hardest day for careful play (58% of perfect)**, because it rewards holding a stake for round 5.

**Caveats:**
- The careful bot's stake allocation is simplistic: it treats its estimates as certain and spends stakes early. A smarter allocation bot, or human data, is needed before judging E3a properly.
- Ability contributions under E3 depend partly on the bot's fixed ability rules.

**Status:** 🔄 Promising but not decided. Now playable in the prototype (v0.2.4, Balance lab → Experiment E3). Next: human playtests, and consider a smarter bot that values saving stakes.

### 12.8 Human signal: declining to stake

The bot's rules are fixed, so it can't show whether people *perceive* the same risk. From v0.2.2 the prototype records, per ability, how often **players use the ability but choose not to stake**. It's shown under "Your games in this browser" in the Balance lab, with Boost split into +3 and +2.

- A high decline rate with Boost would suggest players see Boost as a safety tool rather than a stake multiplier. If so, E1's and E2's bot-based numbers overstate its real-world value.
- From v0.2.3, every game is also saved in full to the shared test log (§19.1), so this can be measured across all testers.

### 12.9 Historical — v0.1 (400 decks, 8 fixed cards, abilities built into cards)

| | Top Trumps | Careful bot | Perfect |
|---|---|---|---|
| All decks | 64 | 156 | 187 |

---

## 13. Modes, collection and progression

*This is the direction of travel. Only the daily challenge and practice exist in the prototype.*

### 13.1 Three modes

| Mode | Cards available | Purpose | Counts towards global daily score? |
|---|---|---|---|
| **Daily challenge** | Common pool of 12, draft 8, plus the 3 dealt abilities | Fair global competition | ✅ Yes |
| **Practice** | Generated decks (shareable by code) | Experimentation and learning | ❌ No |
| **Collection challenges** and **friend duels** | Earned and unlocked cards | Longer-term progression | ❌ No (kept separate) |

### 13.2 Collection

- A permanent collection of 30, 50 and eventually hundreds of stat cards, earned through play, achievements and special challenges. **Not** through daily logins or streaks.
- **Horizontal progression only.** A new card might be brilliant at Speed and poor elsewhere, balanced, or an unusual combination. Different, never stronger.
- Collections can develop individual character, for example when players unlock different cards from the same reward pool.
- **The daily draft always uses a common pool everyone can access.** Owning more cards doesn't change your daily options. Having more cards to pick from is itself an advantage, so it's kept out of the competitive game.

### 13.3 Balancing options considered for collection decks

| Approach | How it works | Assessment |
|---|---|---|
| Strength budget | Every deck has the same total value | Simple, but stat totals can be gamed (see §11.2). Needs simulation-based pricing. |
| Card tiers | Limits on how many high-tier cards a deck can hold | Easy to understand, but potentially restrictive. **In use for the daily draft (★ limit).** |
| Daily drafting | Everyone selects from the same larger pool | Very fair, with meaningful choices. **Adopted for the daily challenge.** |
| Rotating deck | Game auto-selects 8 from your collection by seed | Simpler, but removes player agency. Not preferred. |

---

## 14. Competition and social design

*This is the current direction. Nothing here is built yet.*

- **Foundation:** the daily global challenge, with a common deck and a common score.
- **Hook under consideration:** personal rivalries.
  - **Ghost duels:** play the same deck against a friend's recorded choices, round by round.
  - **Head-to-head records:** e.g. "You lead Dave 14–9 this month."
  - **Global performance shown as a percentile** rather than a raw rank.
- **Sharing:** a spoiler-free emoji grid. 🟩🟨🟥 are unstaked win, tie and loss; 🟢🟡🔴 are the same results when staked.
- **Asynchronous only.** No real-time multiplayer.
- **Streaks:** if added, they should be forgiving.

### 14.1 Monetisation (from the concept brief)

| Feature | Potential model |
|---|---|
| Daily challenge | Free |
| Historical challenge archive | One-off purchase |
| Special themed decks | Paid expansions (cosmetic and alternative modes; never daily advantage) |
| Additional game modes | Paid |
| Private leagues and advanced statistics | *To be decided.* Suggestion: keep leagues free and charge for advanced statistics. |

No subscription in the initial product. Nothing purchasable may affect the daily competition (see §2.2).

---

## 15. Decision log

| # | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D1 | 16 Nov 2026 | Prove the gameplay with placeholder numbers before any artwork, theme or branding. | Avoid investing in content before we know the game is fun. | ✅ Decided |
| D2 | 16 Nov 2026 | The opponent is a scripted "house", with scope for PvP later. | Fair, cheap to run, no AI service needed. | ✅ Decided |
| D3 | 16 Nov 2026 | Asynchronous competition only for the first version. | Simpler to build, operate and maintain. | ✅ Decided |
| D4 | 16 Nov 2026 | The daily game stays free with social features intact. No subscription at launch. | First prove that people return and invite others. | ✅ Decided |
| D5 | 16 Nov 2026 | Uncertainty comes from hidden information, not in-game randomness. | Keeps scores comparable and the game fair. | ✅ Decided |
| D6 | 16 Nov 2026 | Daily global challenge as the foundation. Personal rivalries being explored as the possible core hook. | Global gives a common currency and solves cold start. Rivalries may drive retention. | 🔄 Open |
| D7 | 16 Nov 2026 | The theme is independent of the engine. | Subject supports the game rather than dictating mechanics. | ✅ Decided |
| D8 | 16 Nov 2026 | Abilities are separate cards, not built into stat cards. 3 of 4 are dealt daily, one per round at most, and each affects the round it's played in. | Removes the "strong card or clever card" compromise, adds a second inventory to manage, and keeps Shield in testing. | ✅ Decided (v0.2) |
| D9 | 16 Nov 2026 | The daily challenge uses a common pool: draft 8 of 12, with at most 3 ★. | A meaningful preparation decision that stays fair for everyone. | ✅ Decided (v0.2), to be playtested |
| D10 | 16 Nov 2026 | Don't nerf Switch (or any ability) pre-emptively. Measure first, and adjust only the ability that dominates. | One powerful-feeling ability can be exciting if its opportunity cost is real. | ✅ Decided |
| D11 | 16 Nov 2026 | Competitive fairness principles (§2.2): no purchasable, grindable or seniority-based advantage. Horizontal progression only. | Newcomers must never feel permanently behind. The leaderboard is a contest of decisions, not accumulated assets. | ✅ Decided |
| D12 | 16 Nov 2026 | Collection cards are used in collection challenges, practice and friend duels, kept separate from the global daily score. | Gives collected cards a purpose without compromising the central competition. | ✅ Decided |
| D13 | 16 Nov 2026 | Player stats capped at 8 (house up to 10). Player totals 18–22, house 28–34. | Without it, careful play won 94% of rounds and staking stopped being a decision (§12.3). | ✅ Decided (v0.2), to be reviewed after playtests |
| D14 | 16 Nov 2026 | Change one balance variable at a time. Hold the 8-point cap and run Boost +2 as a controlled experiment (E1). Judge it on flip rate, stake rescues, behaviour by rule and feel, not only average contribution. | Changing several things at once makes it impossible to tell what improved the game. | ✅ Decided. E1 results in §12.5 |
| D15 | 16 Nov 2026 | Track careful ÷ perfect for each daily rule, not only overall. | An overall average can hide very different experiences on different days. | ✅ Decided (in Balance lab) |
| D16 | 16 Nov 2026 | Boost: +3 remains the reference, **+2 with normal staking is the leading candidate** pending human playtests. Other abilities unchanged. E2 (no staking) run separately, as a diagnostic only. | E1 shows +2 keeps Boost decisive. E2 confirms the stake drives its value, but removes a decision. | 🔄 Leaning +2, awaiting playtests |
| D17 | 16 Nov 2026 | Design for interesting choices, not identical numbers (§2.3). Abilities should differ in strength and situation. Equal contribution is not a balance target. | Mathematically interchangeable options make for dull decisions. | ✅ Decided |
| D18 | 16 Nov 2026 | Measure how often humans decline to stake when using each ability, especially Boost. | The bot can't show perceived risk. Human behaviour decides whether Boost is really dominant. | ✅ Decided (in prototype v0.2.2) |
| D21 | 16 Nov 2026 | Playtest E3 (2 stakes) in the prototype, recording which rounds each player stakes alongside the careful and perfect choices for the same deck. | The bot can't exploit stake timing (§12.7), so human allocation is the real test of E3. | 🔄 First session done (§19.3). Needs fresh testers. |
| D20 | 16 Nov 2026 | Test a stake limit as E3, with a control: E3a (2 stakes, bot chooses when) against E3b (2 stakes, forced into R1–R2). The perfect bot optimises its allocation under the limit. Record which rounds get staked. | Separates the effect of *limiting* stakes from the effect of *choosing when* to use them. | ✅ Run. Results in §12.7 |
| D19 | 16 Nov 2026 | Log every test game in full to a shared database (with a copy on the device), so results survive across devices and can be analysed together. | Playtest evidence is what settles open questions such as D16. Browser-only data was being lost. | ✅ Decided (in prototype v0.2.3) |

*Add new decisions with the next number. If a decision is reversed, mark it ❌ Superseded and reference the new entry rather than deleting it.*

---

## 16. Change log

### v0.2.4 — 16 Nov 2026
- **Experiment E3 toggle:** the Balance lab can set **Stakes: Unlimited / 2 per game**. The setting applies to new games and lab runs, and a "2 stakes" tag shows under the title while it's active. Default rules unchanged (unlimited).
- **Stake button** shows how many stakes are left ("2 left", "1 left") and is disabled once they're used.
- **End screen:** compares the rounds you staked with the rounds the careful bot and perfect play chose for the same deck.
- **Test log:**
  - each game records its stake limit, **the rounds you staked**, and the careful and perfect stake rounds
  - the CSV gains columns `stakeLimit`, `stakedRounds`, `carefulStakedRounds` and `perfectStakedRounds`
  - "My games" shows your staked rounds
  - the all-testers summary groups by Boost and stake setting
- **Balance lab:** shows how stakes are spread across R1–R5 for the careful and perfect bots.
- The experiment tags moved under the title so the header doesn't wrap on phones.

### Simulation tools — 16 Nov 2026 (no change to the playable prototype)
- The engine supports an optional stake limit (`maxStakes`) and a stake policy for the careful bot (`careful` or `first`).
- The perfect solver optimises stake allocation under a limit, and can restrict stakes to given rounds.
- The careful bot records every round (staked, outcome, ability) for analysis.
- New scripts: `sim/e3.js` (baseline, E3a, E3b) and `sim/e3-timing.js` (the value of stake timing).
- Baseline results reproduce exactly (careful 103.0, perfect 153.2).

### v0.2.3 — 16 Nov 2026
- **Shared test log (D19):** every finished game is saved in full (§19.1): on the device, and to the prototype's shared database when the player can write to it. Games saved while offline upload later.
- **New "Test log" panel:**
  - shows whether games are reaching the shared log
  - your recent games
  - "Copy my games (CSV)"
  - for the owner, "Load all testers", with a summary per tester and per Boost setting, and a CSV of every game
- Records draft time and total game time.
- Version label is now v0.2.3. Rules unchanged.
- **Fix:** pop-up messages no longer cover the cards or the results. Scout and ability pop-ups are removed (the bottom bar already says the same thing). The remaining pop-ups appear at the top and close on the next tap or screen change.

### v0.2.2 — 16 Nov 2026
- **Human stake tracking:** the "Your games" table in the Balance lab now shows, per ability, how often you used it but **declined to stake** (D18). Boost is split by +3 and +2.
- **Experiment E2 run** (simulation only, not in the playable prototype). See §12.6.
- **New design principle:** interesting choices over identical numbers (§2.3, D17). The ability balance target is rewritten to match.
- Default rules unchanged (Boost +3 reference; +2 available via the lab toggle).

### v0.2.1 — 16 Nov 2026
- **Experiment E1 toggle:** the Balance lab can switch Boost between +3 and +2. The setting applies to new games and lab runs, and the header shows a "Boost +2" tag while it's active.
- **Balance lab additions:**
  - careful ÷ perfect for each daily rule
  - Boost detail: flip rate, stake rescues, points gained in round
  - Boost contribution and flip rate by rule
- Daily scores and ability history are recorded separately for each Boost setting.
- Default rules unchanged (Boost +3).

### v0.2 — 16 Nov 2026
- **Draft:** pick 8 of a common pool of 12, at most 3 ★ (D9).
- **Abilities separated from stat cards:** 3 of 4 dealt daily, one per round, each affecting the current round (D8).
  - Scout now reveals the *current* house card.
  - Boost applies to the current card.
  - Shield's description now says it covers staked ties as well as losses. Its behaviour is unchanged.
- **Rebalance:** player stats 1–8 (total 18–22); house stats 4–10 (total 28–34) (D13).
- **Card pricing:** standalone value by simulation determines the ★ tier.
- **Bots updated** to draft and to use abilities.
- **Balance lab:**
  - per-ability metrics (use rate, average round, staked wins, contribution)
  - your own ability history
  - runs 100 decks in the browser
- **Daily seed** now includes the version, so v0.1 and v0.2 decks differ.
- **Balance impact:** see §12. Careful bot at 67% of perfect (was 83%); Top Trumps at 27% (was 34%).

### v0.1 — 16 Nov 2026
- First playable browser prototype with placeholder stats.
- 8 fixed cards against 5 hidden house cards, each with one clue.
- Stake mechanic.
- Abilities built into 4 of the 8 cards, which had lower stats.
- Five daily rules.
- Daily deck seeded by date. Practice decks shareable by code.
- Benchmark bots, perfect line, emoji share and Balance lab.

*Template for future entries:*

```
### vX.Y — DD Mon YYYY
- What changed
- Why (link to decision or playtest finding)
- Balance impact (re-run Balance lab and note averages)
```

---

## 17. Tunable parameters

These are the current values in the v0.2 prototype (`CFG` in the engine).

| Parameter | Value | Notes |
|---|---|---|
| Rounds | 5 | |
| Pool size | 12 | Common to all players |
| Hand size | 8 | 5 played, 3 sit out |
| ★ cards in pool | 5 | Top 5 by standalone value |
| ★ limit in hand | 3 | |
| Abilities dealt | 3 of 4 | One per round, each once |
| Win base | 10 | Plus the margin |
| Tie score | 5 | |
| Staked loss or tie | −10 | 0 with Shield |
| Stake multiplier (win) | ×2 | |
| Boost amount | +3 | Current card, all stats. E1 testing +2 (lab toggle). |
| Player card stats | 1–8, total 18–22 | |
| House card stats | 4–10, total 28–34 | |
| Careful bot stake threshold | Estimated margin ≥ 2 | Benchmark only |

---

## 18. Open questions

1. **Grand Finale with stakes:** a staked ×3 round 5 swings about ±60 points and decided Rob's three worst E3 games (§19.3). Good drama or too much of a lottery? Candidates: Finale ×2, or the multiplier not stacking with stakes.
2. **Staking (E3):** two stakes per game creates a real timing decision in principle (worth +10, or +34 on Grand Finale, under perfect play), but our bot can't exploit it. Do humans save stakes for the right rounds? And what should happen to Switch and Shield, which lose almost all their value under E3?
3. **Ability usage by humans:** Switch and Shield were left unused in most early games (§19.2). Saved deliberately, forgotten, or not valued?
4. **Boost (E1, E2):** +2 is the leading candidate. Does it feel right in play? How often do people decline to stake with it (§12.8)? E2 showed the stake drives Boost's value, but removing it also removes a decision.
5. **Is Shield interesting**, or just a free stake that gets spent late?
6. **Does the draft feel like a decision or a chore?** Does it stay within about a minute?
7. **Is staking exciting or punishing?** Staked ties cost 10 unless shielded.
8. **Should daily rules be normalised** so scores are comparable across days? Perfect currently ranges from 125 (Rotation) to 186 (Grand Finale).
9. **Do humans use abilities differently from the bot?** Do they save them, or leave them unused?
10. **Are clues readable at a glance?**
11. **Rivalries or global leaderboard:** which drives day-3 return?
12. **Contextual value measurement:** needed before designing the collection.
13. **What gives the game its identity** beyond the mechanics: name, tone, card presentation?
14. **Theme for the first real deck** once the mechanics are settled.

### 18.1 Suggestions to consider

Ideas that have been raised but not yet decided or tested. When one is taken forward, move it to the decision log and/or an experiment.

| # | Date | Suggestion | Notes | Status |
|---|---|---|---|---|
| S1 | 16 Nov 2026 | **Players choose their abilities in the draft**, alongside the stat cards, rather than having 3 dealt. | **Possible forms:** pick 3 from all 4 abilities; or pick 3 from a daily offer of 4–5 that includes variants. **For:** more agency and another real draft decision; abilities shape your plan from the start; pick rates would become a strong human balance signal (an ability almost everyone takes is dominating). **Against:** fewer daily surprises, since the dealt ability mix is currently part of the daily variation; Boost (or another favourite) may be picked every day, so different days feel the same; a slightly longer draft. **Would need:** a test comparing pick rates and draft time against dealt abilities. Best run after the Boost size question (D16) is settled, so the two changes don't overlap. | 💡 To consider |
| S2 | 16 Nov 2026 | **A way to acquire cards by exchange:** either spend game points on cards, or earn a separate currency alongside points to exchange for cards. | **For:** players can aim for specific cards instead of relying on random unlocks; gives collections individual character; a reason to engage with collection challenges. **Key tension:** daily points double as your leaderboard score, so spending them would mix competition with progression. A **separate currency** is probably cleaner, with leaderboard points left untouched. **Guardrails from §2.2 (D11):** affects collection modes only, never the daily draft; must never be purchasable with real money (otherwise it becomes a paid route to cards); earn it through play and achievements rather than daily logins; cap or smooth earnings so missing days doesn't leave players behind; cards stay horizontal, so exchange buys options, not power. **Open:** what earns currency (score, achievements, challenges)? Fixed prices, or a rotating shop? Can duplicates be traded back? | 💡 To consider |
| S3 | 16 Nov 2026 | **Leagues and tiers.** Private leagues for friend groups, plus ranked tiers (e.g. Bronze → Silver → Gold) that group players of similar skill, with weekly promotion and relegation. | **For:** tiers give everyone a meaningful race, not just the top of a global board; leagues fit the rivalries direction (§14, D6). **Watch:** relegation can create an obligation loop, so base weekly standing on, say, your **best 4 of 7 days**, so a missed day doesn't cost you. Daily rules vary in score range (§12.1), so rank on percentile or score relative to perfect, not raw points. Leagues were listed as a possible paid feature in §14.1. Keeping them free is suggested, since they drive growth. | 💡 To consider |
| S4 | 16 Nov 2026 | **Badges and avatars.** Badges as achievements; avatars as player identity. | **For:** they reward commitment without any competitive advantage, so they fit §2.2. They can also back the identity of celebrating clever play. **Badge ideas:** found the perfect line; won without a ★ card; won a Low Ball round with a 1; staked every round and won. **Avatars:** purely cosmetic, so earning them or buying them is acceptable (§2.2 rule 5). **Watch:** avoid streak badges that pressure daily play, or make them forgiving. | 💡 To consider |

---

## 19. Playtest log

Record each session here. Ask testers the questions on the prototype's end screen:

1. Did you understand what to do by the end of round 1?
2. Did the draft feel like a real decision, or a chore?
3. When did you use each ability, and why then?
4. Did staking feel exciting, or just risky?
5. Would you play tomorrow's deck? Would you send your result to someone?

| Date | Version | Boost | Tester | Deck (daily / code) | Score | Perfect | Understood by R1? | Draft time | Abilities used (round) | Staked with Boost? | Notable moments | Would return? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 16 Nov 2026 | v0.2.3 | +3 | Rob | Daily (Underdog) | 110 | 118 | — | 34s | Scout (R2) | — | Beat the careful bot (44). Staked all 5. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | afv2qs (Low Ball) | 88 | 142 | — | 42s | Scout (R1) | Boost unused | Staked all 5; lost the R5 stake. Boost and Shield unused. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | bqcdfg (Range Surge) | −18 | 198 | — | 49s | None | — | Staked all 5, lost 4. Switch and Shield unused; either would have saved at least 10. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | 9y38qy (Low Ball) | 118 | 134 | — | 122s* | Scout (R2) | — | *Game left open for about 49 minutes. Staked all 5. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | fbnppd (Rotation) | 62 | 134 | — | 60s | Boost (R3), Scout (R5) | Yes | Scout in R5 revealed bad news, so he declined to stake: the only unstaked round. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | g8zmf7 (Grand Finale) | 158 | 164 | — | 35s | Scout (R3), Switch (R4), Shield (R5) | — | 96% of perfect. Shield-backed stake on the ×3 finale: +66. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | mf6yg6 (Low Ball) | 50 | 136 | — | 21s | Scout (R1), Switch (R4), Boost (R5) | Yes | Two failed stakes (R3, R4). | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | u22vx2 (Underdog) | 124 | 126 | — | 34s | Scout (R2), Boost (R5) | Yes | 98% of perfect. Shield unused. | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | Daily (Underdog) — unlimited stakes | 46 | 118 | — | 35s | Scout (R1), Switch (R2), Shield (R5) | — | Staked only R1 and R5 (after seeing the E3 analysis). | — |
| 16 Nov 2026 | v0.2.3 | +3 | Rob | wy9tr4 (Power Surge) — unlimited | 103 | 162 | — | 34s | Scout (R2), Boost (R3), Switch (R4) | Yes | Staked R1–R3. Same deck replayed with 2 stakes next. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | wy9tr4 (Power Surge) | 81 | 127 | — | 44s | Scout (R2), Switch (R3), Boost (R4) | No | Staked R1, R2. Careful bot R1, R3; perfect R2, R4. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | fmzw3n (Grand Finale) | 54 | 164 | — | 40s | Boost (R1), Switch (R4), Shield (R5) | Yes | Saved a Shield-backed stake for the ×3 R5, which lost (Shield → 0). Timing cost 16. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | wxenqy (Underdog) | 71 | 88 | — | 40s | Boost (R1), Scout (R2), Shield (R3) | Yes | Same stake rounds as the careful bot. Timing cost 0. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | kq5bw8 (Underdog) | 83 | 91 | — | 31s | Scout (R2), Switch (R5) | — | 91% of perfect. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | w4kp6j (Grand Finale) | 95 | 135 | — | 26s | Scout (R1), Switch (R5) | — | No stake left for the ×3 R5 (won +33 unstaked). Timing cost 22. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | 6reh6s (Grand Finale) | 18 | 156 | — | 23s | Boost (R1), Scout (R2), Switch (R5) | Yes | Staked R5 with Switch; tie under Grand Finale = −30. Timing cost 58. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | qrhgc9 (Range Surge) | 101 | 111 | — | 30s | Scout (R3), Switch (R4), Shield (R5) | — | Stake rounds exactly matched perfect (R2, R5). Range Surge stake +48. | — |
| 16 Nov 2026 | v0.2.4 | +3 · **2 stakes** | Rob | 9kzeq7 (Underdog) | 77 | 96 | — | 30s | Boost (R2), Scout (R3) | Yes | Staked R1, R2; perfect R4, R5. Timing cost 3. | — |

### 19.1 The shared test log

From v0.2.3, every finished game is recorded automatically.

**What's recorded:**
- date and time; version; Boost setting
- daily or practice deck, its code, and whether it was a replay
- today's rule and the abilities dealt
- the drafted hand and the number of ★ cards in it
- each round: card, stat, ability, staked or not, both numbers, the result and the points
- the total, and the Top Trumps, careful and perfect benchmark scores
- % of perfect, draft time and total game time

**Where it goes:**
- Always to the device, as a backup.
- Also to the prototype's shared database, at `players/<player id>/games/<game id>`. Each player writes only their own games, and only the owner can change anyone else's.

**Who can write to the shared log:**
- On an individual Claude plan, only the owner, plus people invited **by email as an Editor**, and only while the prototype isn't also shared by a public link.
- People who open a public link can play, but their games stay on their device. They can use **Copy my games (CSV)** and send the result.
- Players must be signed in to Claude.

**Analysis:** the owner can view and copy every tester's games from the Test log panel, or ask Claude to read the shared log directly.

### 19.2 Findings — Rob, 8 games, 16 Nov 2026 (v0.2.3, Boost +3)

| Measure | Result |
|---|---|
| Average % of perfect | 64% (range −9% to 98%) |
| Against careful bot | Beat it 2×, within 3 points 2×, behind 4× |
| Against Top Trumps bot | Beat it in 7 of 8 |
| Rounds staked | **39 of 40** |
| Round win rate | 78% (31 of 40) |
| Staked rounds that failed | 8 of 39 (21%) |
| Draft time | Median about 38s (one outlier) ✅ within the 1-minute target |
| Game time | About 2 minutes ✅ |
| Abilities used when dealt | Scout 7/8 · Boost 3/4 · Switch 2/6 · Shield 1/6 |
| Declined to stake with Boost | 0 of 3 |

**Takeaways:**
- **Staking isn't a decision at present.** Staking nearly every round is the correct play under current scoring. That led to E3 (§12.7).
- **Humans leave abilities unused**, unlike the bot, which always spends them. Switch and Shield were mostly unused. Bot ability figures overstate real-world value.
- **Scout worked as designed:** the one declined stake came straight after Scout revealed bad news.
- **Timing was used well once:** on the Grand Finale deck, a Shield-backed stake was saved for the ×3 round.

### 19.3 Findings — Rob, E3 session, 16 Nov 2026 (v0.2.4, Boost +3, 2 stakes)

Raw data: `playtests/2026-11-16-rob-session2.csv`. Timing analysis: `node sim/stake-regret.js playtests/2026-11-16-rob-session2.csv`, which re-scores each game using the player's own plays and tries all 10 possible placements of the 2 stakes. All 8 games re-score exactly to their logged totals.

**8 games with 2 stakes:**

| Measure | Rob | Careful bot | Perfect |
|---|---|---|---|
| Average score | 72.5 | 76.9 | 121 |
| % of perfect (total) | 60% | 64% | — |
| Non-Finale days (5 games) | **81%** | 60% | — |
| Grand Finale days (3 games) | **37%** | 67% | — |
| Beat the careful bot | 6 of 8 | — | — |

**Where the stakes went (16 stakes per player):**

| Round | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| Rob | 6 | 4 | 1 | 2 | 3 |
| Careful bot | 4 | 4 | 6 | 1 | 1 |
| Perfect | 0 | 3 | 1 | 7 | 5 |

- **Stake success:** 14 of 16 (88%). Both failures were round-5 stakes on Grand Finale days (one shielded to 0, one tie for −30).
- **Timing cost** (your score with the best stake placement for your own plays, minus your actual score): **107 points over 8 games**.
  - **96 of that came on the three Grand Finale days** (16, 22, 58).
  - On the other five days it was 0–5 per game (2.2 on average).
- **Ability use when dealt:** Scout 7/7, Switch 6/6, Boost 5/5, Shield 3/6. That's far higher than session 1.
- **Abilities paired with a stake:** Boost 4 of 5, Shield 3 of 3, Scout 3 of 7, Switch 1 of 6. Boost and Shield are being used as stake partners. Switch is mostly played late and unstaked, once the stakes are gone.
- **Draft time:** median about 30s (down from about 38s).
- **Same deck, both rules (wy9tr4):** unlimited 103 of 162 against 2 stakes 81 of 127. Both are 64% of perfect.

**Takeaways:**
1. **Staking became a decision.** With 2 stakes, choices varied game to game and matched the bot or perfect play only some of the time. That's the opportunity-cost tension D20 was after.
2. **On ordinary days, timing barely matters.** Placing stakes early cost only about 2 points per game. The real decision there is *which* wins to back, not *when*.
3. **Grand Finale dominates.** A staked round 5 under ×3 swings about ±60 points, which outweighs everything else in the game. All three Finale games were Rob's worst (12–70% of perfect), and the careful bot outscored him on two of them. **Open question:** is a ×3 staked finale good drama or too much of a lottery? Options to test later (one at a time): Finale ×2, or the Finale multiplier not stacking with stakes.
4. **Rob stakes early, like the bot.** 63% of his stakes went in R1–R2, against 19% for perfect play. The best placement for his own plays varied widely, though, so "late is better" isn't a rule. Perfect play stakes late partly because it plays differently.
5. **Caveat:** Rob designed the game and had seen the E3 analysis. His behaviour changed noticeably between sessions: in two unlimited games he staked only 2 and 3 rounds (against 39 of 40 in session 1), and he used far more abilities. Fresh testers are needed before drawing firm conclusions.
