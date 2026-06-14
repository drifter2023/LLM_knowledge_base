---
id: scaling-laws
cluster: scaling
concept: Scaling Laws (Kaplan 2020 / Chinchilla)
status: done
sources:
  - https://arxiv.org/abs/2001.08361
  - https://arxiv.org/abs/2203.15556
  - https://arxiv.org/abs/2404.10102
  - https://epoch.ai/publications/chinchilla-scaling-a-replication-attempt
generated_at: 2026-04-25
---

清末民初,皖南一户姓周的茶商接手了祖上传下的炒茶作坊。家中两样东西都不少:一是炒茶的铁锅,二是从山上摘来的鲜叶。可是柴火紧——一年里能烧的炭,是有定数的。

老周年轻时听过一句行话:"锅大出茶香。"于是每年开春,他总把柴大半都拨给那口最大的铁锅,把鲜叶薄薄一层铺下去,翻两道,起锅,装罐。茶汤倒是清亮,只是入口寡淡,像没睡醒的人说话。镇上的老茶客喝了直摇头:"周老板,你这茶是炒了个形状,没炒出味来。"

老周不服气,第二年换了更大的锅,鲜叶仍铺薄薄一层。柴火烧得更旺,锅烧得更烫,茶叶在锅里只翻了几下就被铲出来。茶香似乎比去年浓了一丝,可还是差了点什么。他把这归因于锅还不够大。

直到那年冬天,作坊里来了个走乡串户的老师傅,姓何,据说在闽北炒了四十年岩茶。何师傅在灶前蹲了半晌,看老周炒了一锅,起身说:"周老板,你这是把锅当成了功夫。"

老周愣住。

何师傅说:"一斤炭,既要养锅,也要焙叶。锅太大,叶太少,炭都耗在烫铁皮上,叶子还没出汗就熟了——香气是锁在叶脉里的,得让它在锅里慢慢走出来。你这茶,叶没走够路。"

老周问:"那该怎么配?"

何师傅伸出两根手指:"我师父传下来的口诀是,锅长一寸,叶也得长一寸。锅与叶,该是齐头并进的。你把柴拨给锅九成,叶只给一成,锅再大也是空烧。"

老周将信将疑,第二年照办:把铁锅换小了一号,省下的炭用来多收鲜叶,炒的时候叶子在锅里翻滚的时间长了一倍。出锅那天,他自己先尝了一杯——茶汤入口,先是清,然后回甘,像山涧从舌根一路淌下去。镇上的老茶客捧着杯子不说话,过了半晌,只点了点头。

第三年,老周开始在账本上记一种新的东西:每一斤炭,配多大的锅,配多少叶,出多少香。他发现何师傅那句"锅长一寸,叶也长一寸"并不是玄学——它是用四十年炭火换出来的一道配比。柴是定数,锅是参数,叶是数据;以前他以为锅越大越好,是因为他忘了:茶香不是锅里炼出来的,是叶子在锅里走过的路上一点点逼出来的。

许多年后,老周的孙子去城里读了书,回乡时带了一本洋文写的书,书里讲一种新东西,叫"模型"。孙子翻着翻着忽然笑了,说:"爷爷,你那本炭、锅、叶的账,城里人正在重写。"

---

## Concept and field

**Scaling Laws** are empirical power-law relationships that predict the cross-entropy loss of a neural language model as a function of three resources: the number of parameters $N$, the size of the training dataset $D$ (in tokens), and the total training compute $C$ (in FLOPs). They sit in the **scaling** cluster of LLM research and have been the single most consequential planning tool of the modern LLM era — every frontier lab uses some variant of them to decide how to spend a training budget.

## Key mechanism

**Kaplan et al. (2020)** trained Transformer language models across more than seven orders of magnitude of compute and fit:

$$L(N) \propto N^{-\alpha_N},\quad L(D) \propto D^{-\alpha_D},\quad L(C) \propto C^{-\alpha_C}$$

with $\alpha_N \approx 0.076$, $\alpha_D \approx 0.095$. They derived a joint law $L(N,D) = \left[(N_c/N)^{\alpha_N/\alpha_D} + D_c/D\right]^{\alpha_D}$ and concluded that, for a fixed compute budget, **model size should be scaled much more aggressively than data**: $N_{\text{opt}}(C) \propto C^{0.73}$, $D_{\text{opt}}(C) \propto C^{0.27}$. This recommendation justified GPT-3-style "very large model, modest data, stop before convergence."

**Hoffmann et al. (2022)** — the Chinchilla paper — repeated the experiment more carefully (over 400 runs from 70M to 16B parameters) using three estimation methods: (1) fixed model size with varying tokens, (2) IsoFLOP curves at fixed compute, (3) parametric fit of $L(N,D) = E + A/N^\alpha + B/D^\beta$. All three methods agreed that $N$ and $D$ should scale **roughly equally** with compute ($a \approx b \approx 0.5$). The practical heuristic: **roughly 20 tokens per parameter**. They tested the prediction by training Chinchilla, a 70B model trained on 1.4T tokens, and beat the 280B Gopher (which used the same compute) on essentially every benchmark.

The discrepancy with Kaplan turned out to stem largely from Kaplan's use of a fixed learning-rate schedule and the inclusion of embedding parameters in $N$, which together biased his estimate of the data exponent.

## Why it matters

Scaling laws turned model design from craft into budgeting. If you know your compute envelope, the laws tell you the parameter count and token count that minimize loss — and they extrapolate predictably across orders of magnitude, which is why labs are willing to commit nine-figure training runs to a single configuration. Chinchilla's correction redirected the field from "build the biggest model you can afford" to "feed your model far more data than you think." Llama, Llama 2, and most open-weights models since 2023 have been trained well past the 20:1 ratio precisely because inference cost favors smaller, longer-trained models.

## Open questions and controversies

**Besiroglu, Erdil et al. (2024, arXiv:2404.10102)** attempted to replicate the third (parametric) approach in Chinchilla and found that the published estimates do not fit the reconstructed data, that the reported confidence intervals were implausibly tight (would have required hundreds of thousands of runs), and that the parametric law was internally inconsistent with the IsoFLOP-based 20:1 ratio Chinchilla itself recommended. Their refit yields $L(N,D) \approx 1.82 + 482/N^{0.348} + 2085/D^{0.366}$, which is internally consistent across all three approaches. The high-level Chinchilla recommendation survives — but the reviewer should treat any specific exponent quoted from the original Hoffmann paper with caution.

Other open threads: scaling laws break down once data quality, repetition, or post-training (RLHF, distillation) enters the picture; loss is a poor proxy for downstream capabilities (emergence); and inference-time compute (test-time scaling, chain-of-thought) opens a third axis the original laws do not model.

## Key references

- Kaplan, J. et al. (2020). *Scaling Laws for Neural Language Models.* arXiv:2001.08361. <https://arxiv.org/abs/2001.08361>
- Hoffmann, J. et al. (2022). *Training Compute-Optimal Large Language Models.* NeurIPS 2022. arXiv:2203.15556. <https://arxiv.org/abs/2203.15556>
- Besiroglu, T., Erdil, E. et al. (2024). *Chinchilla Scaling: A Replication Attempt.* arXiv:2404.10102. <https://arxiv.org/abs/2404.10102>
