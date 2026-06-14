---
id: itc-mcts
cluster: itc
concept: Monte Carlo Tree Search for LLMs
status: done
sources:
  - https://arxiv.org/abs/2408.06195
  - https://arxiv.org/abs/2501.04519
  - https://datasciocean.com/en/paper-intro/rstar/
  - https://kargarisaac.medium.com/deep-dive-into-rstar-math-and-monte-carlo-tree-search-cd08947ee51e
  - https://lemmata.substack.com/p/alphaproof-and-the-imo
  - https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/
generated_at: 2026-04-25
---

阿宁是新晋的密室设计师,刚被聘到城南那座据说"永远走不通"的镜宫。前任设计师留下一句话:别一个人闷头画图,叫上你师弟。

镜宫的每一间屋子都通向五扇门。第一扇,是再走一步;第二扇,是一口气把剩下的路都走完;第三扇,是先停下来,把"我到底要找什么"换一种问法;第四扇,要先用过第三扇之后才会显形——它让你重新作答自己刚刚提出的小问题;第五扇,允许你把入口处的题目重新改写一遍。阿宁第一天进去,凭直觉只用第二扇,十次有九次撞墙。

老馆长把她叫到楼下:"不要每一步都赌全程。先走一格,记下这一格通向几条死路、几条活路。下次站在同一格,你心里就有数了。"

于是阿宁开始记账。每一格门后,她写两个数:走过几次、其中几次最终摸到出口。下一次回到这格,她不再只看哪扇门赢得多——她还会偷偷加一个"久未光顾"的偏爱,逼自己去敲那些被冷落的门。她知道,被冷落的门里也许藏着捷径,只是从没人替它们记过账。

可问题是,从一扇门走到出口往往要二十多步,她哪有时间一步一步谨慎?她于是发明了"试跑":选定一扇门,之后的所有岔路都不再细想,凭手感一路冲到底。冲到出口,就把这一路上每一格的账本各加一笔胜绩;撞墙,就各记一笔败绩。账本越厚,她对每一格的判断就越稳。

但试跑有个毛病:手感会骗人。有时候她明明走通了,复盘却发现中间有一步全靠运气。这时师弟就派上用场。师弟的水平和她差不多,她每写完一条通路,就把中间随机几步遮住,递给师弟,说:"你来补。"师弟若能独立补出同样的答案,这条路就被两人共同认证;若师弟补出的答案和她不一样,那这条路多半是侥幸,作废。

三个月后,阿宁不再凭一次直觉判生死。她在每一格、每一扇门上都积累了上千条账目;她敢于走冷门;她用试跑代替全局推演;她让师弟当最后一道闸。镜宫的通过率从一成涨到九成。

老馆长来验收时,看着那本密密麻麻的账册,只说了一句:"你做的事情,围棋人做过,几何人也做过。现在,会写字的机器也开始这么做了——它们不再一笔写到底,而是先在心里种一棵树,沿着树枝一格一格地数,数清楚了,再落笔。"

---

## Concept and field

**Monte Carlo Tree Search (MCTS) for LLMs** sits in the *Inference-Time Compute / test-time scaling* cluster. It is the dominant family of search-based reasoning methods that turn a single forward pass into a deliberate, tree-structured exploration over partial solutions, scoring each branch with rollouts and a learned value or reward signal.

## Key mechanism

Classical MCTS has four phases — **Selection, Expansion, Simulation (rollout), Backpropagation** — selecting children via the UCT score
`UCT(s,a) = Q(s,a)/N(s,a) + c·√(ln N_parent(s) / N(s,a))`
which balances exploitation of high-value branches against exploration of under-visited ones.

LLM adaptations specialize each phase:

- **State / action design.** *rStar* (Qi et al., 2024) defines five human-like reasoning actions — propose one step, propose all remaining steps, propose a sub-question with answer, re-answer a sub-question, rephrase the question — with hard constraints (e.g., A4 only after A3) so the action space mirrors how humans actually decompose problems.
- **Value signal.** *rStar-Math* (Guan et al., 2025) replaces hand-tuned step rewards with a **Process Preference Model (PPM)** trained on pairwise step preferences mined from MCTS Q-values, plus a code-execution check that filters out steps whose Python/SymPy refuses to run. This sidesteps the noisy absolute step-scoring of prior PRMs.
- **Verification loop.** rStar's **mutual consistency**: a second SLM ("discriminator") masks 20–80% of a candidate trajectory and tries to complete it independently; only paths both models agree on survive.
- **Self-evolution.** rStar-Math iterates four rounds where MCTS rollouts produce verified trajectories that retrain both the policy and the PPM, bootstrapping a 7B model from 58.8% to 90.0% on MATH and beating o1-preview without distillation.
- **Formal-proof variant.** **AlphaProof** (DeepMind, 2024; Nature 2025) couples a Lean tactic-generation LM with AlphaZero-style MCTS, where each node is a proof state, each edge a tactic, and the terminal reward is the Lean kernel's verification. It earned IMO 2024 silver-medal performance, solving the hardest problem of the contest.

## Why it matters

MCTS gives LLMs a knob the autoregressive decoder lacks: *spend more compute, get better answers, with bounded variance*. It decouples generation from evaluation, lets weak step-level rewards aggregate into strong trajectory-level decisions, and — when paired with a verifier (Lean kernel, Python interpreter, second model) — produces training data whose correctness is mechanically checkable. This is the architectural backbone behind much of the o1/r1-era test-time scaling work.

## Key references

- Qi et al., 2024. *Mutual Reasoning Makes Smaller LLMs Stronger Problem-Solvers (rStar).* https://arxiv.org/abs/2408.06195
- Guan et al., 2025. *rStar-Math: Small LLMs Can Master Math Reasoning with Self-Evolved Deep Thinking.* https://arxiv.org/abs/2501.04519
- Xie et al., 2024. *Monte Carlo Tree Search Boosts Reasoning via Iterative Preference Learning.* https://arxiv.org/abs/2405.00451
- DeepMind, 2024. *AI achieves silver-medal standard solving IMO problems (AlphaProof + AlphaGeometry 2).* https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/
- AlphaProof team, 2025. *Olympiad-level formal mathematical reasoning with reinforcement learning.* Nature. https://www.nature.com/articles/s41586-025-09833-y

## Open questions and controversies

- **Compute cost vs. simple sampling.** Several follow-ups argue that for many benchmarks, best-of-N with a strong verifier matches MCTS at lower wall-clock cost; the regime where MCTS clearly wins is still debated.
- **Reward hacking the PPM.** rStar-Math's process preference model is itself a learned approximator; long rollouts can find adversarial chains that maximize PPM score without being correct, mirroring the well-known PRM gaming literature.
- **Generalization beyond math/proofs.** MCTS shines where terminal correctness is cheaply verifiable (Lean, executable code, numerical answers). Extending it to open-ended reasoning where no verifier exists remains the open frontier.
