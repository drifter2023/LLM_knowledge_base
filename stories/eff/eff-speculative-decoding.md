---
id: eff-speculative-decoding
cluster: eff
concept: Speculative Decoding (Systems View)
status: done
sources:
  - https://vllm.ai/blog/spec-decode
  - https://arxiv.org/html/2406.14066v1
  - https://infini-ai-lab.github.io/MagicDec-part2/
  - https://docs.vllm.ai/en/latest/features/speculative_decoding/
generated_at: 2026-04-25
---

老周在城南开了家小馆子，只有他一个掌勺。客人少的时候，他一道菜一道菜慢慢做，火候稳，出菜也不慢。后来名声起来了，午市挤进来三十几桌，他一个人就忙不过来——锅气没断，但每桌都得等。

他想了个办法：让刚学徒不久的小马在旁边那台小灶上"先猜"。小马看一眼单子，凭着对老周习惯的了解，把接下来三四道菜的备料、切配、甚至预炒，一口气先做出来。老周这边收到小马的半成品后，只需快速尝一口、扫一眼，对的就直接装盘出菜，不对的当场推翻重做。一桌菜本来要老周走五趟灶，现在他可能一趟就放下三盘。

第一周，老周很得意。可第二周麻烦来了。

周六中午爆满，五十桌同时催菜。小马照旧抢着先做，可老周这边的大灶本来就一刻不停——他每一次"验菜"都要占用本来可以正经炒一道菜的时间。更糟的是，小马猜得快但越急越离谱，十盘里有六盘老周得推翻。推翻的那些半成品，食材、灶火、人工，全白费了。那天晚上结账，老周发现：上的菜数没变多，反而比平时少了，因为小马把他的节奏带乱了。

他和老婆复盘到深夜。老婆说："你看错指标了。你一直数'端出去多少盘'，可真正算钱的，是'客人吃下去多少盘'。小马猜错的那些，你端不出去，等于没做。"

于是老周改了规矩。门口装了个小黑板，上面写着今天的桌数。桌数少时，让小马放开了猜，一次猜五六道都行——反正大灶闲着也是闲着，验一下顺手。桌数一过某个红线，老周让小马只猜一两道最有把握的；再挤，干脆让小马歇着，自己一道道来。他还观察到一个反常的现象：那些点了功夫菜、汤要吊很久的桌，哪怕人再多，让小马多猜几道反而更划算——因为大灶的瓶颈不是炒，是等汤，闲着的火力刚好够验菜。

更细的，他给小马也配了一套小砧板小料盒，跟自己的主灶分开管理：小马猜废的那些，不会污染主灶的食材库存；老周验过的，才正式从主库里扣料、记账。前厅那个排单的伙计也学聪明了，不再死板地"一桌一道"地排，而是把验菜和正炒揉在同一轮里走，一次出锅就把好几桌的下一道一起送出去。

这家馆子后来成了城南出菜最快的店。但老周从不和人说自己有多神，他只说："我那个小学徒，平时让他撒开了猜；忙起来，先让他闭嘴。"

---

## Concept and field

**Speculative Decoding (Systems View)** sits in the *Efficiency / Inference Systems* cluster. While the algorithmic side (covered separately under `itc-speculative-decoding`) asks *"is the draft-then-verify scheme mathematically lossless?"*, the systems view asks the harder production question: *"when you drop draft-and-verify into a real serving stack with continuous batching, paged KV cache, and a live QPS distribution, does it still help — and how do you keep it from hurting?"*

## Key mechanism

A production speculative decoder in a system like vLLM is not just "small model proposes, big model verifies." Three engineering pieces have to fit together:

1. **Two coordinated runners.** vLLM splits execution into a *Draft Runner* (small model proposes k tokens) and a *Target Runner* (big model verifies them in one forward pass). The scheduler is modified so a single step can produce multiple token slots per request, and the KV-cache manager has to allocate, rewind, and reconcile two parallel cache spaces — including discarding draft-only KV state on rejection.
2. **Interaction with continuous batching.** Continuous batching already amortizes weight loads across many requests, so at high QPS the target model is already compute-bound. Adding speculation steals that compute for verifying tokens that may be rejected, and the *measured throughput can drop below vanilla decoding*. Speedups of 1.5×–2.8× reported in the vLLM blog are concentrated in low-QPS or long-context regimes.
3. **Goodput-driven control.** Liu et al.'s SmartSpec (2024) reframes the metric: not throughput (tokens emitted) but **goodput** (tokens *accepted*). They build an online controller that, per scheduling step, predicts acceptance rate, models execution time on profiled hardware coefficients, and picks the speculation length k ∈ {0, 1, …, K} maximizing goodput — including k=0, i.e. dynamically *disabling* speculation under heavy load. MagicDec (Sadhukhan et al., 2024) shows the dual surprise: at long contexts the bottleneck shifts from compute to KV-cache memory bandwidth, so speculation becomes *more* useful as batch size grows, provided the draft uses a sparse (e.g. StreamingLLM) KV cache so its cost does not scale with batch.

## Why it matters

Naively bolting speculative decoding onto a serving stack often regresses production SLOs — exactly the opposite of the paper-promised speedup. The systems view is what turns a clever algorithm into a feature you can leave on by default. It also explains why the most useful unit of work in modern inference research is no longer "tokens/sec on a single sequence" but the joint optimization of scheduler, KV manager, and draft policy under a goodput objective.

## Key references

- Cade Daniel et al., "How Speculative Decoding Boosts vLLM Performance by up to 2.8x," vLLM Blog, 2024. <https://vllm.ai/blog/spec-decode>
- Liu et al., "Optimizing Speculative Decoding for Serving Large Language Models Using Goodput" (SmartSpec), arXiv:2406.14066, 2024. <https://arxiv.org/html/2406.14066v1>
- Sadhukhan et al., "MagicDec: Breaking the Latency-Throughput Tradeoff for Long Context Generation with Speculative Decoding," arXiv:2408.11049, 2024. <https://infini-ai-lab.github.io/MagicDec-part2/>
- vLLM official documentation, "Speculative Decoding." <https://docs.vllm.ai/en/latest/features/speculative_decoding/>

## Open questions

- The right *control surface* for adaptive speculation is unsettled: per-request k, per-batch k, or per-step k? SmartSpec argues per-batch; EAGLE-family work argues per-token tree shapes.
- Multi-tenant serving with heterogeneous SLOs (AdaServe, EuroSys '26) suggests speculation length should be set per-SLO, not per-system — still an active area.
- KV-cache co-management between draft and target under paged attention has subtle correctness pitfalls (e.g. preemption mid-verification) that are not yet standardized across runtimes.
