---
id: arch-rope-alibi-ntk
cluster: arch
concept: RoPE / ALiBi / NTK-aware Positional Encoding and Length Extrapolation
status: done
sources:
  - https://arxiv.org/abs/2104.09864
  - https://arxiv.org/abs/2108.12409
  - https://arxiv.org/pdf/2309.00071
  - https://blog.eleuther.ai/rotary-embeddings/
  - https://blog.eleuther.ai/yarn/
generated_at: 2026-04-25
---

钟楼下的信使

岭南古城有一座七层钟楼，每层挂一只钟，钟摆的周期从上到下依次加倍：顶层一秒一摆，再下一层两秒，再下四秒、八秒……到底层那只大钟，要走过将近一个时辰才完整地摇回原处。城里没有日晷，没有滴漏，居民约定的所有时刻，都靠这七只钟同时指示——任意时刻，七个钟摆的姿态合在一起，就是这座城独有的"时间指纹"。

阿予是城里的信使。她送信不报时刻，只报姿态：她在某一刻把楼里七只钟的角度抄在信末，收信人对照自己钟楼上的同一时刻，就能算出两人之间隔了多久。妙处在于——他们从不需要约定共同的零点。只要两人钟楼的摆速一致，姿态之差只取决于"相隔"，与"何时启程"无关。城邦因此能在大雾、战乱、迁徙之后迅速重建秩序：钟摆不变，相对就还在。

后来南境扩土，新城距旧城遥远，信件要走的路程是钟楼设计时的十倍。问题随之而来：顶层那只快钟，本是用来分辨毫厘的，可在长路上它早已转过千百圈，姿态彻底失去意义；底层的大钟倒是还在缓缓摇，但它太迟钝，整段旅程下来才挪动一指宽，也分不出远近。阿予把信交到南境时，对方常常茫然——姿态合不上，时间断了线。

第一个补救的人叫沈砚。他说，干脆把所有钟的摆速都按比例放慢十倍，让它们能涵盖新的旅程。这法子奏效，但旧城里的人抱怨：原本一秒能分辨的事，如今要等十秒，城内通信反而钝了。

第二个补救的人叫林徽。她说不必一刀切——快钟之所以快，是为了量近处；慢钟之所以慢，是为了量远处。该减速的只是慢钟，快钟几乎不必动。她按一条幂律，给每层钟分配不同的减速比：越靠近底层，越大幅放慢；越靠近顶层，越接近原速。如此一来，旅程拉长十倍，而城内的毫厘依旧分明。她管这叫"按波长分担压力"。

第三个人叫秦昭，他更激进。他索性拆掉了钟楼，只在每封信末附一行小字："收信人离我越远，请越不要把这封信当真。"距离每增一里，信的分量就线性地减一分。没有钟，没有姿态，只有一条朴素的衰减。出乎意料，这法子在极远的南境也不失灵——因为它从不假装自己懂得远方的细节，只承认远方理应模糊。

三种法子在城邦中并行。年长的史官记下：钟楼派擅长描述"相对"，衰减派擅长承受"陌生"，而林徽的折中，是在不重铸钟的前提下，让旧钟楼听见新疆域的声音。史官最后写道——所有关于"位置"的争论，归根到底，是在问一件事：当我们走得比当初设计的更远，几何还认得我们吗？

---

## Concept and Field

**RoPE (Rotary Position Embedding), ALiBi (Attention with Linear Biases), and NTK-aware / YaRN scaling** are positional-encoding schemes for Transformer language models. They sit in the **architecture cluster** and jointly answer one question: how should a self-attention layer know *where* a token is, in a way that survives sequences longer than those seen at training time?

## Key Mechanism

**RoPE** (Su et al., 2021) replaces additive position embeddings with a *rotation* applied to query and key vectors. Each pair of hidden dimensions is rotated by an angle `m · θ_d`, where `m` is the absolute position and `θ_d = base^(-2d/|D|)` is a per-dimension frequency. Because rotating both `q_m` and `k_n` by the same speed makes their inner product depend only on `m − n`, RoPE encodes **relative** position through **absolute** rotations. Different dimension pairs rotate at different wavelengths `λ_d = 2π · base^(2d/|D|)`, from "fast" (fine-grained nearby distances) to "slow" (coarse long-range distances). This is the seven-bell clock tower in the parable.

**Position Interpolation (PI)** (Chen et al., 2023) extends context by linearly compressing positions: at inference, position `m` is replaced by `m/s` where `s = L_new/L_train`. Cheap, but it slows *every* frequency uniformly — degrading short-range resolution (Sen Yan in the parable).

**NTK-aware scaled RoPE** (community-proposed by *bloc97*, formalized in YaRN; Peng et al., 2023) instead changes the base: `base' = base · s^(|D|/(|D|−2))`. This scales **low-frequency** dimensions more and **high-frequency** dimensions less, so fine-grained local structure is preserved while long-range dimensions stretch to cover the new context. **YaRN** further combines an "NTK-by-parts" ramp (different interpolation per frequency band) with an attention **temperature** correction `√(1/t) = 0.1 · ln(s) + 1` to counter softmax distribution shift at long lengths. YaRN matches state-of-the-art context extension with ~0.1% of pre-training tokens for fine-tuning. (Lin Hui in the parable.)

**ALiBi** (Press et al., 2022) abandons embeddings entirely. It adds a *linear penalty* `−|i − j| · m_h` directly to attention logits, with a per-head slope `m_h`. Recency bias is hard-coded; no rotations, no embeddings. Models trained at length 1024 extrapolate to 2048+ matching the perplexity of sinusoidal models trained at 2048. (Qin Zhao's distance-decayed letters.)

## Why It Matters

Vanilla learned absolute position embeddings catastrophically fail beyond their training length. RoPE made relative position a geometric invariant of the attention dot product, and is now the default in LLaMA, Qwen, DeepSeek, Mistral. ALiBi enabled the first credible "train short, test long" claims and powers MPT. NTK-aware scaling and YaRN are what made 32k–2M context windows tractable as *post-training* operations rather than full retraining.

## Open Questions / Controversies

- **Extrapolation vs. interpolation.** ALiBi's "true extrapolation" claims have been challenged: later studies (Kazemnejad et al., 2023; Chi et al., 2023) find that gains diminish on tasks requiring genuine long-range reasoning, and that perplexity can mask retrieval failures.
- **NTK-aware scaling without fine-tuning was a community discovery on Reddit before being formalized.** The first "NTK-aware" post (bloc97, 2023) outperformed PI zero-shot but underperformed it after fine-tuning — a tension YaRN explicitly tried to resolve.
- **Frequency-band cutoffs are heuristic.** YaRN's α, β ramp parameters and temperature constant are tuned empirically; theoretical grounding for why specific wavelengths should be interpolated vs. extrapolated remains active research (e.g., Resonance RoPE, 2024).
- **Long-context evaluation is unsettled.** Perplexity drops on PG-19 do not imply needle-in-haystack retrieval works; benchmarks like RULER and LongBench frequently show RoPE-extension methods degrading well before their nominal context window.

## References

- Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2021). *RoFormer: Enhanced Transformer with Rotary Position Embedding*. arXiv:2104.09864. <https://arxiv.org/abs/2104.09864>
- Press, O., Smith, N. A., & Lewis, M. (2022). *Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation*. ICLR 2022. arXiv:2108.12409. <https://arxiv.org/abs/2108.12409>
- Peng, B., Quesnelle, J., Fan, H., & Shippole, E. (2023). *YaRN: Efficient Context Window Extension of Large Language Models*. arXiv:2309.00071. <https://arxiv.org/pdf/2309.00071>
- EleutherAI Blog. *Rotary Embeddings: A Relative Revolution*. <https://blog.eleuther.ai/rotary-embeddings/>
- EleutherAI Blog. *Extending the RoPE*. <https://blog.eleuther.ai/yarn/>
