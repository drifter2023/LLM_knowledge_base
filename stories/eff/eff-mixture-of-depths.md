---
id: eff-mixture-of-depths
cluster: eff
concept: Mixture of Depths
status: done
sources:
  - https://arxiv.org/abs/2404.02258
  - https://arxiv.org/html/2404.02258v1
  - https://graphcore-research.github.io/mixture-of-depths/
  - https://aclanthology.org/2025.naacl-long.265/
  - https://arxiv.org/pdf/2507.10524
generated_at: 2026-04-25
---

宋元丰二年,杭州城外有一座旧驿。驿丞姓沈,接朝廷急令:每日辰时之前,须将一筐筐书信经十二道关卡,送至临安宫前。

驿中本有规矩:每封信都须由十二位先生依次盖章——校字、勘印、查讳、对号、复核、签押……一字不漏。可近年来书信暴增,每日筐内装着数千封,十二位先生从天明忙到掌灯,仍误了几次辰时。朝廷震怒,沈驿丞夜不能寐。

他的女儿阿筠,十六岁,识字过人。她翻看积压的信件,发觉一桩怪事:多数信件其实极平淡——“家中安好”、“米价如旧”、“岳父寿宴定于八月”——这些信只须粗略一阅,十二道关卡里九道都是白走。真正紧要的,不过是夹在其中的几封——边关军报、盐铁奏疏、密折私印——它们才值得十二位先生反复推敲。

阿筠便向父亲献了一计。

她在每道关卡前添了一个“小判官”。小判官不盖章、不查讳,只做一件事:把案上待审的信件迅速过目,给每封信打一个分数。分数高的,留下,交先生细审;分数低的,直接从侧门滑出,跳过这道关卡,径直送往下一道。

但阿筠又定了一条铁律:每一道关卡,无论那日来信多少,先生只审固定的若干封——比如一百封中只取前十二封。其余的,从侧门绕过。这样,先生案头永远是同样的工作量,辰时之前必能完工。一封信若在此关被判为“不必细审”,它仍会进入下一关,再被那一关的小判官重新打分;说不定下一关的小判官眼光不同,反倒拦下了它。于是同一封信,在十二道关卡中,可能只被三四位先生真正审过,其余皆是穿堂而过。

此法行了月余,驿站果然在辰时前清空了筐子。沈驿丞却另有忧虑:小判官打分时,常常要看看后面还有哪些信件作比较——“比这封更紧要的有几封?”可若是急脚递,信件一封一封陆续抵达,后面的还没来,如何比较?

阿筠又添了一招:她另请一位老吏,专门预测“这封信会不会被小判官选中”。老吏看一眼信封的厚薄、火漆的颜色、来处的州府,十之八九能猜准。于是急脚递来时,不必等后续信件,老吏一句话便定去留。

数年后,阿筠在驿站墙上题了一行字:

> 不是每封信都配得上十二道印。让该停的停,让该过的过——力气省下了,要紧的反倒看得更清。

后人读到此事,才明白那位驿丞的女儿,无意间做出了一件大事:她让同一座驿站,对不同的信,有了不同的“深度”。

---

## Concept and Field

**Mixture of Depths (MoD)** is an efficient-inference / efficient-training technique for transformer language models, introduced by Raposo, Ritter, Richards, Lillicrap, Humphreys, and Santoro (DeepMind) in April 2024. It belongs to the *efficiency* cluster, sitting alongside Mixture of Experts (MoE), early-exit networks, and other forms of conditional computation.

## Key Mechanism

A standard transformer applies every block (self-attention + MLP) to every token at every layer — a uniform compute budget regardless of how easy or hard a token is to predict. MoD breaks this uniformity:

1. **Per-block router.** Each transformer block carries a learned linear router that produces a scalar weight `r_i = w_θ · x_i` for every token.
2. **Top-k (expert-choice) selection.** The block has a fixed capacity `C` (e.g. T/8 — only 12.5% of tokens). The top-k tokens by router weight are routed *through* the block's attention and MLP; the remaining tokens skip the block entirely via the residual connection: `x_i^{l+1} = x_i^l`.
3. **Static compute graph.** Because `k` is fixed, tensor shapes are deterministic, unlike MoE-style sparse routing that depends on token counts. Total FLOPs are predictable; the *allocation* is dynamic and context-sensitive.
4. **Causality at inference.** Top-k is non-causal (it ranks tokens against future tokens). The paper offers two fixes: (a) an auxiliary binary cross-entropy loss training the router to output a calibrated per-token "I will be selected" probability, or (b) a small predictor MLP that forecasts selection with ~99% accuracy.

The empirical finding: MoD models match isoFLOP baselines in loss while using a fraction of FLOPs per forward pass, yielding up to ~50% faster sampling. Interleaving MoD blocks with normal blocks works better than making every block MoD.

## Why It Matters

MoD pushes back on a long-standing assumption — that every token needs the same depth of processing. Function words like "the" and easily-predicted continuations clearly do not need 80 layers of reasoning; rare tokens or reasoning pivots clearly do. By letting the network learn this allocation per layer, MoD recovers compute that would otherwise be spent on trivial tokens, and (because the budget is fixed) the savings translate cleanly into wall-clock speedups rather than only theoretical FLOP reductions.

It is also conceptually elegant: it unifies MoE-style routing with depth-skipping (early exit) under a single mechanism — the "experts" are the block itself versus the identity function.

## Open Questions and Follow-Ups

- **Retrofitting trained models is hard.** MoD generally needs training from scratch or extensive continued training. *MoDification* (NAACL 2025) replaces top-k with a threshold-p operator to make conversion of existing LLMs cheaper, reporting ~1.2× latency speedup and ~1.8× memory reduction in long-context use.
- **KV-cache and batched inference complications.** Skipped tokens still need keys/values for later attention, which complicates caching. *Mixture-of-Recursions* (NeurIPS 2025) tackles this by dynamically assigning recursion depth instead of binary skip/keep.
- **Multimodal extensions.** *p-MoD* (ICCV 2025) applies MoD to multimodal LLMs with progressive ratio decay, achieving 46% KV-cache and 44% TFLOP reductions.
- **Decoupled routing.** The original paper notes that routing query, key, and value separately — or routing to diverse computation types beyond null operations — remains unexplored.

## References

- Raposo, D., Ritter, S., Richards, B., Lillicrap, T., Humphreys, P. C., & Santoro, A. (2024). *Mixture-of-Depths: Dynamically allocating compute in transformer-based language models.* arXiv:2404.02258. https://arxiv.org/abs/2404.02258
- Graphcore Research. (2024). *Mixture-of-Depths: paper walkthrough.* https://graphcore-research.github.io/mixture-of-depths/
- Zhang et al. (2025). *MoDification: Mixture of Depths Made Easy.* NAACL 2025. https://aclanthology.org/2025.naacl-long.265/
- Bae et al. (2025). *Mixture-of-Recursions: Learning Dynamic Recursive Depths for Adaptive Token-Level Computation.* NeurIPS 2025. https://arxiv.org/abs/2507.10524
