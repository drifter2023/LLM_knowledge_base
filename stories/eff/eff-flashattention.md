---
id: eff-flashattention
cluster: eff
concept: FlashAttention 1/2/3
status: done
sources:
  - https://arxiv.org/abs/2205.14135
  - https://arxiv.org/abs/2307.08691
  - https://arxiv.org/abs/2407.08608
  - https://crfm.stanford.edu/2023/07/17/flash2.html
  - https://tridao.me/blog/2024/flash3/
  - https://pytorch.org/blog/flashattention-3/
generated_at: 2026-04-25
---

老周接手县档案馆的那年，馆里只有他一个人，外加一座三层小楼。

楼的结构很奇怪：一楼是阴冷的大库房，能放下全县八十年的卷宗，但每次进出都要走二十级台阶，开三道铁门；二楼是他自己的小办公室，一张木桌，桌上只摆得下两叠卷宗；三楼是天台，没什么用。

县里要他做一件事：把每一份新案卷，和过去所有的旧案卷比对一遍，写一份"关联摘要"。

老周一开始的做法很自然。他抱着新案卷下楼，翻开第一份旧卷，看完，记下关联程度；再翻第二份，再记；翻到第几千份的时候，他发现自己一天来回爬了四十趟楼梯，腿都软了。真正读卷宗的时间，反而不到两成。

他坐在二楼，看着满桌的纸，第一次意识到：**累死他的不是读，是搬。**

于是他改了规矩。

他不再一份一份地搬，而是一次抱一摞——刚好够铺满那张木桌的一摞。摞在桌上之后，他把今天要处理的新案卷一份份取出来，挨个和这一摞旧卷比对，比对完整摞之后，再下楼换下一摞。每一摞他都在心里记一个"暂时的总分"和一个"目前见过的最高分"，下一摞来了，就用这两个数把新的比对结果折算进去，绝不需要回头去翻已经下楼的那些卷宗。摘要因此可以一边比一边写，写完直接归档，桌上永远只有一摞纸。

爬楼次数从几千次降到了几十次。

第二年，县里把他的助理招齐了，一下来了八个年轻人。老周原本的法子立刻显得笨——八个人挤在二楼办公室，桌子就那么大，互相递纸、互相喊话，乱成一团。他想了一夜，把分工重新划了：每人负责一段年份的新案卷，各自从库房抱自己那一摞旧卷上来，互不打扰；办公室里再把桌子一分为四，四个人各占一角，谁也不许越界拿对方的纸。**比对的方向也调了个头**——以前是抱着旧卷找新卷，现在是抱着新卷找旧卷，因为新卷天然是按人分好的，这样分工才不打架。馆里的吞吐量翻了一倍。

第三年，县里换了一栋全新的、带传送带和分拣员的办公楼。老周本来以为换了楼就万事大吉，没想到效率反而只提了一点点——年轻人还按老法子干，传送带大半时间空转。

他又琢磨了很久，最后把人分成两班：一班专门站在传送带边上，只管搬纸，不读；另一班坐在桌前，只管读，不搬。两班错开节奏，搬的人永远比读的人提前半步，桌上永远有下一摞在等着。他甚至让两组读的人轮流——这一组算总分的时候，那一组在读下一摞，谁也不闲着。

为了再省一点墨水，他还学会了一个小把戏：在抄录某些数字之前，先用一张事先印好的花纹纸把数字"打散"一下，让那些异常大的数字不再扎眼，这样用更便宜、更粗的钢笔也能抄得准。

档案馆门口挂的牌子从没换过。但来访的人都说，这地方一年比一年快，而每一份摘要，和第一年老周一个人慢慢爬楼写出来的，**一字不差**。

---

## FlashAttention 1/2/3 — IO-aware exact attention

**Field.** GPU systems / efficient Transformer inference and training. Belongs to the `eff` (efficiency) cluster of this knowledge base.

**The problem.** Standard self-attention computes an N×N matrix `S = QKᵀ`, applies softmax, then multiplies by V. The arithmetic is O(N²d), but the *real* bottleneck on modern GPUs is memory traffic: that N×N matrix has to be written to and read from High Bandwidth Memory (HBM), which is ~10× slower than on-chip SRAM. For long sequences, attention becomes memory-bound — the GPU's tensor cores sit idle waiting on loads.

**FlashAttention (Dao et al., NeurIPS 2022).** An *exact* (not approximate) attention algorithm whose key insight is to be **IO-aware**: count HBM↔SRAM transfers, not just FLOPs. It tiles Q, K, V into blocks small enough to fit in SRAM, then runs an **online softmax** that streams over K/V blocks while keeping a running max and running denominator per row. Because the full N×N matrix is never materialized in HBM, memory traffic drops from O(N²) to O(N²/M) where M is SRAM size — a 2–4× wall-clock speedup, ~10–20× memory savings, with bitwise-equivalent outputs (this is the parable's "字字不差").

**FlashAttention-2 (Dao, 2023).** FA-1 only reached 25–40% of peak FLOPs because of poor work partitioning. FA-2 fixes three things: (1) rewrite the online-softmax recurrence so fewer non-matmul ops (rescales, masks) sit on the critical path, since matmul is what tensor cores actually accelerate; (2) **swap the loop order** — parallelize over the Q (sequence) dimension instead of K/V, exposing more parallelism across SMs even at small batch size; (3) split Q across the 4 warps in a threadblock while sharing K/V, eliminating the cross-warp shared-memory shuffles of FA-1's "split-K" scheme. Result: ~2× over FA-1, ~72% MFU on A100.

**FlashAttention-3 (Shah, Bikshandi, Zhang, Thakkar, Ramani, Re, Dao, NeurIPS 2024).** FA-2 again underutilized the H100 (Hopper), reaching only 35%, because Hopper's wins come from *asynchrony* (TMA hardware, WGMMA, async barriers) and FP8. FA-3 introduces: (1) **warp specialization** — dedicated producer warps issue TMA loads while consumer warps run WGMMA, decoupling memory and compute (the parable's two-shift split); (2) **ping-pong scheduling** between two warpgroups so that one warpgroup's softmax overlaps the other's GEMM; (3) intra-warpgroup pipelining of softmax with the next matmul; (4) **incoherent processing** for FP8 — multiply Q and K by a random Hadamard matrix to spread outliers before quantization, reducing FP8 error ~2.6× (the "花纹纸" trick). Result: 1.5–2× over FA-2, 75% MFU in BF16, ~1.2 PFLOPs/s in FP8 on H100.

**Why it matters.** FlashAttention is now the default attention kernel in PyTorch, vLLM, Megatron, and most frontier-model training stacks. It is arguably the single most consequential systems result in the LLM era: without it, training context-128k models and serving long-context inference at current latencies would be economically infeasible. It also reframed how the field thinks about kernel design — from FLOP-counting to *roofline-aware*, hierarchy-aware algorithms.

**Open questions.** FP8 (and emerging FP4) accuracy at very long context, integration with paged-KV / variable-length serving, and how much further asynchrony-aware design can push Blackwell-class hardware before a fundamentally new attention primitive is needed.

## References

- Dao, Fu, Ermon, Rudra, Ré (2022). *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness.* NeurIPS 2022. <https://arxiv.org/abs/2205.14135>
- Dao (2023). *FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning.* <https://arxiv.org/abs/2307.08691>
- Stanford CRFM blog (2023). *FlashAttention-2.* <https://crfm.stanford.edu/2023/07/17/flash2.html>
- Shah, Bikshandi, Zhang, Thakkar, Ramani, Ré, Dao (2024). *FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision.* NeurIPS 2024. <https://arxiv.org/abs/2407.08608>
- Tri Dao blog (2024). *FlashAttention-3.* <https://tridao.me/blog/2024/flash3/>
- PyTorch blog (2024). *FlashAttention-3.* <https://pytorch.org/blog/flashattention-3/>
