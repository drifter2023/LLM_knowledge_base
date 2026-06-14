---
id: longctx-ring-flash-attention
cluster: longctx
concept: Ring Attention / FlashAttention
status: done
sources:
  - https://arxiv.org/abs/2205.14135
  - https://arxiv.org/abs/2310.01889
  - https://coconut-mode.com/posts/ring-attention/
  - https://peterchng.com/blog/2024/08/19/ring-attention-scaling-attention-across-multiple-devices/
generated_at: 2026-04-25
---

老周在县城开了一家旧档案誊录铺,专门帮人把堆积如山的来往书信整理成卷宗。生意上门时,他总是要把每一封信和其余每一封信都对照一遍——谁回应了谁,谁在装糊涂,谁在打埋伏——少一对照,卷宗就立不起来。

铺子里有两间屋。外屋宽敞,堆得下半人高的信箱,可走进去取一封信要绕过桌椅、爬上梯子,一来一回半炷香。里屋窄,只放得下一张矮桌,可手一伸就够着,翻信像翻自己的掌纹。老周年轻时学的法子,是把所有信一次性全摊到外屋地上,横竖排开,然后一封封比对。这法子直白,却有个毛病:每比一对,他都得跑去外屋取一次,然后再回里屋写一笔。一桩三千封信的案子,他光是来回跑腿就要跑上十天。

后来他学乖了。他先把信箱按厚度切成一摞摞小捆,每次只把一小捆搬进里屋。坐在矮桌前,他不急着下定论,而是在墙上钉一张小纸条,记下"目前为止,这一行里最重的那封信是哪封、所有信加起来的分量大概多少"。下一捆搬进来时,他不必把上一捆再请回来,只要拿新一捆和墙上那两个数字一比,就能把纸条更新。等所有小捆都进过一次里屋,墙上那张纸条上的数字,恰好就是他要的最终结论。外屋只去一次,里屋的小桌却被反复利用——他第一次明白,真正费力气的不是动脑子,而是来回搬东西。

铺子越做越大,一个人忙不过来。老周收了七个徒弟,在镇里租下七间相邻的小屋,围着一口古井摆成一圈。每个徒弟手里各分到三千封信中的一份,作为自己当下要"质问"的那一摞——这一摞不挪窝,就像一个人盯住自己负责的那段供词。可要立卷宗,每个徒弟仍得让自己的那一摞和别人手里的所有信对照过。

老周想了个章程:七间屋首尾相连,每过一刻钟,左边屋子就把自己手上"用来被质问"的那一摞,顺着廊子递给右边屋子;与此同时,自己也从更左边的屋子接过新的一摞。每个徒弟手里"自己负责质问"的那摞始终不动,而"被拿来对照"的那摞则像水车上的木斗,绕着古井转一圈。妙处在于:递信和翻信是同时进行的——徒弟翻当前这摞的时候,廊子里小厮已经在替他把下一摞往这边送、把上一摞往那边送。七圈走完,每个徒弟都把自己那份和全镇所有的信对照过了一遍,而没有任何一刻,有人闲着等信。

镇上人后来传:老周的铺子能誊三万封、三十万封信的卷宗,旁人却连三千封都嫌多。秘诀不在脑子,而在两件小事——里屋的小桌要用足,廊子里的脚步不能停。

---

## Concept and field

**Ring Attention** and **FlashAttention** are two complementary engineering breakthroughs that made it tractable to train and serve Transformers on very long sequences. They sit in the **long-context cluster** of LLM systems research: not new model architectures, but exact, mathematically-equivalent reorganizations of the attention computation that exploit the *memory hierarchy* (FlashAttention) and the *device topology* (Ring Attention).

## Key mechanism

**FlashAttention (Dao et al., 2022)** is *IO-aware exact attention*. The bottleneck on a GPU is not FLOPs but reads/writes between high-bandwidth memory (HBM, the "outer room") and the small on-chip SRAM (the "inner room"). Standard attention materializes the full N×N score matrix in HBM, costing O(N²) memory traffic. FlashAttention instead **tiles** Q, K, V into blocks, loads a tile of K,V into SRAM, streams a tile of Q against it, and computes a **numerically-stable online softmax** by maintaining running per-row statistics — the running max `m` and the running normalizer `ℓ` — that are updated as new K,V blocks arrive. The N×N matrix is never materialized. In the backward pass, the same logic is run again with **recomputation** so intermediate activations need not be stored. Result: exact attention, sub-quadratic HBM traffic, 2–4× wall-clock speedup, and memory linear in sequence length.

**Ring Attention (Liu, Zaharia & Abbeel, 2023)** scales the same blockwise idea across *devices*. The sequence is sharded so each of D devices owns a block of queries (and a block of K,V) permanently. The query shard *stays put*; the K,V shards travel around a logical ring, one hop per step. At each step every device runs a FlashAttention-style blockwise update against the K,V it currently holds, then forwards that K,V to its right neighbor while receiving a new K,V from its left. Because send/receive happens concurrently with the local compute, communication is **fully overlapped** with computation. After D steps every query block has seen every K,V block — exact attention, but with context length that scales linearly in device count, with no extra communication overhead beyond a single ring rotation per layer.

## Why it matters

Together, these two algorithms removed the quadratic-memory wall that had pinned context lengths to a few thousand tokens. FlashAttention made 8K–32K-token training routine on a single GPU; Ring Attention pushed practical context to millions of tokens across a TPU/GPU pod. They underwrite essentially every modern long-context model (FlashAttention-2 and -3 are now default kernels in PyTorch and JAX; Ring Attention or its variants — Striped Attention, Context Parallel — power Gemini-class million-token windows).

## Key references

- Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré. *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness.* NeurIPS 2022. https://arxiv.org/abs/2205.14135
- Hao Liu, Matei Zaharia, Pieter Abbeel. *Ring Attention with Blockwise Transformers for Near-Infinite Context.* ICLR 2024. https://arxiv.org/abs/2310.01889
- Tri Dao. *FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning.* 2023. https://tridao.me/publications/flash2/flash2.pdf

## Open questions

- Load balance under causal masking: a naive ring assigns highly uneven work to devices (later query blocks attend to more keys). **Striped Attention** (Brandon et al., 2023) reorders the sharding to fix this; whether it is the final word is open.
- FlashAttention's optimality is proven only up to constant factors for a specific SRAM size; the joint optimum across the GPU/TPU memory hierarchy + interconnect is still a moving target as hardware evolves (FlashAttention-3 already had to be rewritten for Hopper's asynchrony and FP8).

## References

- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (arXiv:2205.14135)](https://arxiv.org/abs/2205.14135)
- [Ring Attention with Blockwise Transformers for Near-Infinite Context (arXiv:2310.01889)](https://arxiv.org/abs/2310.01889)
- [Ring Attention Explained — Coconut Mode](https://coconut-mode.com/posts/ring-attention/)
- [Ring Attention: scaling attention across multiple devices — Peter Chng](https://peterchng.com/blog/2024/08/19/ring-attention-scaling-attention-across-multiple-devices/)
