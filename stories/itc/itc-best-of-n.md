---
id: itc-best-of-n
cluster: itc
concept: Best-of-N / Majority Voting / Weighted Voting
status: done
sources:
  - https://arxiv.org/abs/2203.11171
  - https://arxiv.org/abs/2110.14168
  - https://arxiv.org/html/2408.00724
  - https://arxiv.org/html/2502.18581v1
generated_at: 2026-04-25
---

雾还没散，码头边的鱼贩老周拎着一条三斤多的石斑，皱着眉。买主问他：「这鱼几两？」老周年轻时一眼就报，如今眼花，他摇头说：「我说不准。这样吧，叫人来掂。」

他叫来了五个常在码头打零工的人：阿丑、阿瘦、阿胖、阿哑、阿跛。每人都拎一拎，各自报数。阿丑说一斤六，阿瘦说三斤一，阿胖说三斤二，阿哑比划三斤一，阿跛说三斤。

老周心里盘算：单听任何一人都不靠谱——阿丑手抖，阿瘦贪小常少报，可若把五个数摆在一起，最多人落在「三斤上下」，那就八九不离十。他报给买主：三斤一两。买主称了，三斤零八钱。买主笑：「老周你眼花了，耳朵没花。」

这法子在码头传开，鱼贩们都学。但用了几月后，老胡发现一个漏洞：阿丑十次有九次离谱，可只要他和阿瘦串通一下，两张嘴顶过另外三张老实嘴，错的反而成了「最多人说的」。老胡于是改了规矩：每人报数前，先让他们去掂一块早已称准的秤砣，按谁掂得准给信誉分。掂得准的人，他的话算两票、三票；掂不准的，半票。再把所有票加权一汇，结果比单纯数人头稳当得多。

又过了一阵，城里来了个收古董的赵先生，他做事更彻底。他不让伙计们投票——他自己请了一位眼力极好的老师傅坐在堂后。伙计们各报各的价，老师傅一一打分，最高分的那个数，赵先生就采纳。他说：「人多嘴杂，不如一个真懂行的人来挑。投票图的是省事，挑出来的才是最好。」

镇上于是有了三派。卖鱼的老周派，凡事数人头，谁说的多就听谁——简单，便宜，能用。老胡派，按掂秤砣的准头给权重，省钱又比单纯数人头稳。赵先生派，多花一份请师傅的钱，但师傅在，最准的那一个总能被挑出来。

有一年大旱，各家生意都紧。老周派最先撑不住——他发现把人从五个加到五十个，准头早早就到顶了，再加人也没用，纯属浪费工钱。老胡派挺得久一点，但师傅难请，赵先生派只在大宗买卖里才划算。镇上的老人坐在茶馆里总结：同一条鱼，三种掂法，各有各的命。算得清自己荷包的，才知道今天该用哪一种。

后来茶馆墙上挂了一副对联，是个读过书的伙计写的：「众口同辞未必真，秤上有星方见心。」横批四个字——**择善而从**。

---

## Concept and field

**Best-of-N, Majority Voting, and Weighted Voting** are inference-time compute (ITC) strategies for large language models. They sit in the cluster of test-time aggregation methods, alongside self-consistency, verifier-guided search, and tree search (MCTS, REBASE). The unifying idea: instead of trusting a single greedy decode, draw N samples from the model and combine them.

## Key mechanism

Three closely related strategies form a family:

1. **Majority voting / Self-Consistency** (Wang et al., 2022). Sample N reasoning chains with temperature > 0, extract each chain's final answer, and return the answer that appears most often. Formally, this marginalizes over latent reasoning paths: `argmax_a Σ_i 1[answer(path_i) = a]`. The intuition is that a correct answer is reachable by many distinct chains of thought, while incorrect answers tend to be idiosyncratic.

2. **Best-of-N with a verifier** (Cobbe et al., 2021, "Training Verifiers to Solve Math Word Problems"). Sample N candidates, score each with a learned outcome reward model (ORM) or process reward model (PRM), and return the single highest-scoring candidate: `argmax_i V(x, y_i)`. No voting — a single trusted judge decides.

3. **Weighted voting**. A hybrid: sample N candidates, group by final answer, but weight each vote by a verifier score or by an intrinsic confidence signal: `argmax_a Σ_i V(y_i) · 1[answer(y_i) = a]`. Recent work (Kang et al., 2025, "Scalable Best-of-N Selection via Self-Certainty") replaces the trained verifier with the model's own token-distribution sharpness, avoiding the need for a separate reward model.

## Why it matters

These methods were the first demonstration that *test-time* compute, not just training compute, lifts LLM reasoning accuracy substantially. Self-consistency alone gave +17.9% absolute on GSM8K. They are the conceptual ancestors of o1-style "think longer" inference, and they ground the compute-optimal inference scaling laws of Wu et al. (2024), which show that smaller models with clever aggregation can Pareto-dominate larger models at fixed compute.

## Open questions and recent updates

- **Diminishing returns**: Wu et al. (2024) prove sampling-based aggregation converges to a ceiling set by the model's answer distribution; pushing N from 64 to 1024 often buys little. This motivated tree-search alternatives like REBASE.
- **Voting vs. verifier**: Pure best-of-N with a strong verifier beats majority voting when the verifier is well-calibrated; majority voting wins when verifiers are noisy or unavailable. Weighted voting is usually a robust middle ground.
- **Reward hacking under best-of-N**: Large N amplifies any miscalibration in the verifier, since the search actively seeks high-scoring outliers — a known failure mode in RLHF-adjacent settings.
- **Self-certainty (2025)**: Kang et al. argue confidence-weighted voting can match verifier-based best-of-N without any trained reward model, which would simplify deployment significantly. This is recent and worth re-verifying.

## Key references

- Wang, X. et al. (2022/2023). *Self-Consistency Improves Chain of Thought Reasoning in Language Models*. ICLR 2023. https://arxiv.org/abs/2203.11171
- Cobbe, K. et al. (2021). *Training Verifiers to Solve Math Word Problems*. https://arxiv.org/abs/2110.14168
- Wu, Y. et al. (2024). *Inference Scaling Laws: An Empirical Analysis of Compute-Optimal Inference for LLM Problem-Solving*. https://arxiv.org/html/2408.00724
- Kang, Z. et al. (2025). *Scalable Best-of-N Selection for Large Language Models via Self-Certainty*. https://arxiv.org/html/2502.18581v1
