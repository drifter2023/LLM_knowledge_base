---
id: scaling-phase-transitions
cluster: scaling
concept: Phase Transitions in Training (Induction Head Formation)
status: done
sources:
  - https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html
  - https://arxiv.org/abs/2209.11895
  - https://arxiv.org/abs/2404.07129
  - https://proceedings.mlr.press/v235/singh24c.html
generated_at: 2026-04-25
---

老周在城南开了一间不起眼的抄经铺子，雇了三个学徒：阿甲、阿乙、阿丙。

铺子接的是寺里的活——同一卷经文，要抄成几百份。老周自己年轻时也是抄经人，知道这行的诀窍：经文里很多字句是反复出现的，只要记住"上次见到这个字，下一个字写的是什么"，速度就能快上数倍。但他从不教这个诀窍。他只给学徒一支笔、一沓纸，按页计酬，错字扣钱。他相信，肯下功夫的人自己会摸出来。

头三个月，三人都抄得极慢，错得极多。每天夜里，老周翻看他们的废纸，记一笔账：错字数目几乎是一条平直的线，看不出谁有长进。师娘看不下去，劝他指点几句，老周只摇头："还差一点。"

第四个月初的某一天，阿甲忽然开了窍。

那天傍晚，老周收纸时发现阿甲的废纸堆只剩薄薄一层，而正本厚得惊人。他盘问阿甲，阿甲挠头说不出所以然，只说："师父，我也不知怎么回事。前几日我总记得'如是我闻'后头跟着'一时'，可笔下还是要犹豫；昨天起，手就自己走了。"老周不动声色，那一晚却在账本上画了一道粗粗的折线——阿甲的产量，一夜之间翻了三倍，错字几近于零。

更奇的是，阿乙在第二天也开了窍，阿丙在第四天也开了窍。三人都说不清那一刻到底发生了什么，只觉得"忽然就会了"。

老周这才把师娘叫到账房，指着那张折线图说："你看，不是平地起的。"

师娘困惑："明明就是平地起的，前头三个月毫无长进。"

老周笑了笑，从抽屉里抽出他自己当年的练字本。那上头密密麻麻写满了三件小事的练习——第一件，看到一个字，要先记住它前一个字是什么；第二件，要会在满纸字里去找"上次见过的同一个字"；第三件，找到之后，要把那时跟在后面的字照搬过来。三件小事，缺一不可。任何一件没练熟，整个诀窍就用不出来；三件都熟了的那一刻，诀窍就"砰"地一声成了。

"所以前三个月不是没长进，"老周说，"是三件零件各自在长，外头看不出来。等最后一颗螺丝拧上，整台机器才一齐转起来。"

师娘还是不服气："那你为什么不早点教他们这三件小事？"

老周收起练字本，望着窗外暮色："因为我若教了，他们学会的就是我那一套。让他们自己长出来，他们以后抄任何一卷没见过的经，都能自己接上。"

那一年冬天，铺子接了一卷从未抄过的梵文音译。三个学徒看了一眼，照样抄得飞快。

---

## Concept and field

**Phase Transitions in Training**, specifically the **induction-head phase change**, sits in the **scaling and training dynamics** cluster. It refers to the empirical observation that certain capabilities of transformer language models do not emerge gradually with more gradient steps but appear *abruptly*, often visible as a small bump or kink in the training-loss curve. The canonical case is the formation of **induction heads** — attention heads that implement the algorithm `[A][B] … [A] → [B]` — which Olsson et al. (2022) identified as the mechanistic substrate of much in-context learning.

## Key mechanism

An induction head is built from at least two attention heads working in composition: a **previous-token head** in an earlier layer that writes "the token I follow" into each position's residual stream, and a later-layer head whose query-key circuit matches the current token against those previous-token annotations to attend back to the right place, then copies that location's value forward. Singh et al. (2024) decompose the formation process further into **three interacting subcircuits** — previous-token attend-and-copy, query/key matching, and value-copy routing — and show via causal "clamping" interventions that all three must be in place before the phase change fires. Until the last subcircuit is functional, none of the partial progress is visible in the loss; once the final piece is learned, the composite circuit suddenly works end-to-end and loss drops sharply.

This is why the loss curve looks flat-then-bump rather than smooth: the mechanism is **multiplicative** in its components, so progress on individual subcircuits produces near-zero behavioral signal until the conjunction completes.

## Why it matters

The phase-change phenomenon reframes "emergent abilities" away from mystical scale thresholds and toward concrete, mechanistically traceable circuits whose timing depends on data statistics, depth, and optimization dynamics. It also gave mechanistic interpretability its first reproducible developmental landmark: a discrete event you can locate in training time, ablate, and study causally. Olsson et al. argue that induction heads explain the bulk of in-context learning across model sizes, making the phase change one of the most consequential single events in transformer training.

## Open questions and controversies

- **Causal vs. correlational evidence at scale.** Olsson et al. provide strong causal evidence only in small attention-only models; for large MLP-bearing models the link between induction heads and in-context learning is correlational. Whether the same circuits drive few-shot reasoning in frontier models remains debated.
- **Beyond induction heads.** Park et al. (2025, "Beyond Induction Heads") show that in-context *meta-learning* tasks induce **multi-phase** circuit emergence, not a single phase change — suggesting induction heads are one instance of a broader family of circuit phase transitions.
- **Theoretical grounding.** Singular-learning-theory approaches (e.g. Chen et al.'s developmental interpretability program) try to predict phase-transition timing from loss-landscape geometry, but a closed-form predictor of *when* a given circuit will crystallize is still open.

## References

- Olsson, C., Elhage, N., Nanda, N., et al. (2022). *In-context Learning and Induction Heads.* Anthropic / Transformer Circuits Thread. https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html
- Olsson et al. (2022) arXiv preprint. https://arxiv.org/abs/2209.11895
- Singh, A., Moskovitz, T., Hill, F., Chan, S., Saxe, A. (2024). *What needs to go right for an induction head? A mechanistic study of in-context learning circuits and their formation.* ICML 2024. https://arxiv.org/abs/2404.07129
- Singh et al. (2024) PMLR proceedings. https://proceedings.mlr.press/v235/singh24c.html
