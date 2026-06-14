---
id: eff-pruning
cluster: eff
concept: Pruning & Sparsity
status: done
sources:
  - https://arxiv.org/abs/1803.03635
  - https://arxiv.org/abs/2306.11695
  - https://developer.nvidia.com/blog/accelerating-inference-with-sparsity-using-ampere-and-tensorrt/
  - https://arxiv.org/pdf/2104.08378
  - https://openreview.net/forum?id=PxoFut3dWW
generated_at: 2026-04-25
---

老周接手县乐团时,编制是九十二人。

预算砍了一半,他必须在三个月内把人数减到四十六。乐团里坐着的,有他师父留下来的老琴师,有他自己招进来的年轻人,有从隔壁市挖来的独奏家,也有那种从未独奏过、却在合奏里像水一样把整个声部托起来的人。每一个人,他都熟。

第一周,他试了最笨的办法:看工资条。谁拿得少,谁先走。一周后,排练厅里的声音稀薄、刺耳,像漏风的窗。第二小提琴整片空了出来,合奏的底盘塌了。他知道错在哪——一个乐手值不值钱,不能只看他单独发出的声音有多大。一个轻轻拉着内声部的人,可能正是别人辉煌的那个高音得以站住的原因。

他换了第二种办法。每次排练,他在乐手面前的谱架上放一支小小的电平表,记录这个人在这首曲子里实际"被用到"的程度——他的弓压多重,他的音被周围乐器多大程度地放大或淹没。一个乐手的去留分数,不再是他自己的响度,而是他的响度乘以他所在那一刻乐句的能量。同一个长笛手,在抒情慢板里得分很高,在铜管齐鸣的段落里得分接近零。老周把每一行(也就是每一个声部输出)单独排序,只留下乘积最大的那一半。这一次,削掉一半人之后,合奏听起来几乎和原来一样。他没有重新训练谁,没有调任何人的弓法,人就这样少了一半,声音却撑住了。

但财政局又来了一道命令:不仅要人少,还要排座方便、点名方便、调度方便。换句话说,不能东缺一个西缺一个。必须每四张椅子里,空出两张,而且是规整地空。老周咬牙重排——在每一个四人小组里,他强制留下两人、裁掉两人。挑选时仍然按那个"响度乘以乐句能量"的分数走,只是多了一条几何约束。代价是显而易见的:有几个四人组里,本该留下三个高分的人,现在只能留两个;也有几个组里,两个低分的不得不被留住一个,因为组里确实没人比他更好。整体水准比上一种方案略掉了一截。可是当演出季开始、舞台搭好、灯光打下来的时候,搬椅子的工人飞快地按统一格式摆位,售票员按统一格式印节目册,连后台调度都比以前轻松一倍——整个剧院的运转,因为这种"规整的空"而真正快了起来。

散场那夜,老周坐在空了一半的排练厅里,忽然想起师父年轻时跟他说过的一句话:一支乐团真正在演奏的,从来不是它名册上的全部人。名册只是一个外壳,壳里藏着一支更小、更精瘦的乐团,那才是声音真正发出的地方。难的不是把人裁掉,难的是认出哪一支小乐团一直都在。

---

## Concept and field

**Pruning & Sparsity** is a core technique in the *Efficiency / Compression* cluster of LLM systems research. The premise: a trained dense network contains far more parameters than it actually needs at inference time. Pruning identifies and removes the redundant weights, leaving a sparse network that is cheaper to store and (sometimes) faster to run.

## Key mechanism

Pruning methods differ along two axes — **what to remove** and **what shape the holes take**.

1. **Saliency criterion (what to remove).**
   - *Magnitude pruning* — drop the weights with the smallest absolute value. Simple but blind to context.
   - *Wanda* (Sun et al., 2023) — score each weight by `|W_ij| * ||X_j||_2`, the weight's magnitude multiplied by the L2 norm of the corresponding input activation, ranked **per output row**. No retraining, no Hessian inverse, yet it beats magnitude pruning on LLaMA at 50 % sparsity.
   - *SparseGPT* (Frantar & Alistarh, 2023) — solves a layerwise reconstruction problem using approximate second-order information; more accurate at high sparsity, ~300× slower than Wanda.

2. **Sparsity pattern (what shape).**
   - *Unstructured* — any weight can go to zero. Maximum compression, but irregular memory access; modern GPUs cannot easily skip the zeros.
   - *Structured* — entire neurons, heads, or channels are removed; very hardware-friendly but coarse.
   - *N:M semi-structured* (e.g. 2:4 on NVIDIA Ampere) — in every contiguous block of M weights, exactly N must be zero. Sparse Tensor Cores deliver up to 2× GEMM throughput on this pattern (Mishra et al., 2021).

The **Lottery Ticket Hypothesis** (Frankle & Carbin, 2019) reframes the whole problem: a randomly initialized dense network secretly contains a small subnetwork ("winning ticket") that, trained in isolation from its original initialization, matches the dense network's accuracy. Pruning is then less about destruction and more about *uncovering* an already-existing efficient circuit.

## Why it matters

LLMs are memory-bandwidth-bound at inference. Cutting 50 % of the weights of a 70 B model halves VRAM footprint and, with N:M sparsity on supported hardware, can roughly halve the matmul cost. Combined with quantization, pruning is one of the few levers that meaningfully lowers serving cost without retraining.

## Open questions

- High-sparsity (>70 %) pruning of LLMs still incurs measurable perplexity loss; lossless pruning at LLM scale remains unsolved.
- The Lottery Ticket Hypothesis transfers awkwardly to billion-parameter models — iterative magnitude pruning with rewinding is too expensive, and naive one-shot pruning doesn't recover the same "winning ticket" property.
- Wanda's per-output ranking works empirically but lacks a clean theoretical justification beyond a first-order Taylor argument.

## References

- Frankle, J., & Carbin, M. (2019). *The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks.* ICLR. https://arxiv.org/abs/1803.03635
- Sun, M., Liu, Z., Bair, A., & Kolter, J. Z. (2023). *A Simple and Effective Pruning Approach for Large Language Models* (Wanda). ICLR 2024. https://arxiv.org/abs/2306.11695
- Mishra, A., Latorre, J. A., Pool, J., et al. (2021). *Accelerating Sparse Deep Neural Networks.* https://arxiv.org/pdf/2104.08378
- NVIDIA. *Accelerating Inference with Sparsity Using the NVIDIA Ampere Architecture and TensorRT.* https://developer.nvidia.com/blog/accelerating-inference-with-sparsity-using-ampere-and-tensorrt/
