---
id: eff-vq-kv-cache
cluster: eff
concept: Vector Quantization for KV Cache
status: done
sources:
  - https://arxiv.org/abs/2402.02750
  - https://arxiv.org/abs/2504.19874
  - https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/
  - https://arxiv.org/abs/2401.18079
  - https://arxiv.org/abs/2506.18879
  - https://arxiv.org/abs/2510.06175
generated_at: 2026-04-25
---

老周开了一间档案馆,专替城里一位记忆力惊人却日渐衰弱的老法官保管卷宗。法官每审一桩新案,都要把过去三十年里所有相关案卷重新翻一遍才肯落笔。卷宗堆到第十一万册时,馆里再也塞不下,老周只好动脑子。

他先把卷宗分成两类。一类叫"索引卡":薄薄一张,记着案件的关键词、人名、地名,法官靠它来判断"这桩与本案相关吗"。另一类叫"卷本":厚厚一摞,装着证词、判词、附录,法官只在确认相关后才会真正去读其中一两本。

老周发现一桩怪事。索引卡虽然薄,但同一栏的字迹粗细总是固定的——"被告姓名"那一栏永远工整,"涉案金额"那一栏永远潦草——也就是说,**纵看一栏**,变化很小;**横看一张卡**,变化反而大。卷本恰恰相反,**同一本之内**字迹风格统一,**本与本之间**才千差万别。

于是他订了两套规矩。索引卡按栏归档:把所有卡的"被告姓名"栏剪下来摞成一沓,只记这一沓共用的简写规则;每张卡只留两个比特就能复原。卷本则按本归档:每一本算出自己的尺度,本内压成两比特,本与本互不相扰。最近三个月的卷宗他不动,原样摆在手边——法官最常翻的就是新卷,压坏了一张近卡,比压坏一千张旧卡还麻烦。这样一来,档案室缩到原先的四成,法官几乎察觉不到差别。

可惜下一任档案员阿桂没那么有耐心。她接手时卷宗已涨到一千万册,且每天还在涌进来。她来不及一栏栏统计字迹,只能"盲压"。她的法子近乎赌博:进来一份新卷,她先用一面**随机毛玻璃**把字迹打散——奇怪的是,字一旦被随机搅匀,每个笔画的浓淡分布反而变得规整,像被某种看不见的手摊平了。她照着这份摊平后的分布,粗暴地把每个笔画压成三个刻度。

但她知道,光这样压,法官比对两份卷宗"是否相关"时会偏心——压缩误差会系统性地把分数推高或推低。于是她又加了一道工序:把第一道压完后剩下的**残差**,拿另一面更细的毛玻璃再照一次,只留一个比特,记下"是正还是负"。这一比特不为还原字迹,只为把先前那点偏心抵消掉,使比对分数无偏。她不需要看进来的卷是哪个法庭、哪种案子——毛玻璃是预先铸好的,对谁都一视同仁。

很多年后,有人把这两位档案员的法子写成了一本书。书里说:同一道难题——把无穷无尽的旁证压进有限的抽屉——可以靠**洞察分布的不对称**来解,也可以靠**先把分布搅成已知的样子再下刀**来解。前者像老周,慢工细活,适合一座老馆;后者像阿桂,刀快意狠,适合洪水般涌来的新卷。两人都没动过法官的判词,却都让那位老人多审了好些年的案子。

---

## Vector Quantization for KV Cache

**Field.** Inference efficiency for large language models (cluster: `eff`). Specifically, lossy compression of the per-token Key/Value tensors that attention layers cache during autoregressive decoding. As context length grows, the KV cache — not the model weights — becomes the dominant consumer of HBM and the binding constraint on batch size and throughput.

**The problem.** A standard 7B model at 128K context can spend tens of gigabytes on KV cache alone. Naive 8-bit quantization helps but plateaus around 4 bits; below that, scalar per-tensor quantization destroys attention quality because (a) keys contain large per-channel outliers and (b) inner-product (attention score) distortion is asymmetric and easily biased.

**Two families of mechanism.**

1. **Distribution-aware asymmetric scalar quantization (KIVI).** Liu et al. (ICML 2024) empirically show that the **key cache has channel-wise outliers** — a few coordinates carry persistently large magnitudes across all tokens — while the **value cache is roughly uniform per channel but varies per token**. The fix is asymmetric: quantize keys **per-channel** (group elements along the channel axis, share scale/zero-point across tokens) and values **per-token** (each token gets its own scale). A small sliding window of recent tokens is kept in fp16 because partial groups cannot be cheaply quantized online. KIVI hits 2-bit with negligible accuracy loss, 2.6× peak-memory reduction, and 2.35–3.47× throughput.

2. **Data-oblivious vector quantization with random rotations (TurboQuant, KVQuant, CommVQ, VecInfer).** Rather than analyzing the data, **rotate it first**. A random orthogonal transform (Hadamard or QJL) makes the marginal distribution of each coordinate concentrate to a known Beta-like form, which lets a single off-the-shelf scalar quantizer be near-optimal on every coordinate. TurboQuant (Zandieh et al., arXiv:2504.19874, 2025; ICLR 2026) adds a second stage: a **1-bit Quantized Johnson–Lindenstrauss (QJL)** transform on the residual that makes the inner-product estimator **unbiased**, closing the gap that scalar MSE-optimal quantizers leave open. The result is provably within ≈2.7× of the information-theoretic distortion-rate lower bound, runs online with no calibration data, and reaches ~3 bits per value with up to 8× attention speedup on H100.

**Why it matters.** These methods turn long-context inference from a memory-bandwidth-bound nightmare into something a single consumer GPU can serve. CommVQ (Apple, 2025) pushes to 1-bit by making the codebook commute with RoPE; KVQuant (Hooper et al., NeurIPS 2024) reaches 10M-token contexts via pre-RoPE per-channel keys plus a dense-and-sparse split for outliers.

**Open questions.** (a) How low can bits-per-value go before generation quality degrades on reasoning-heavy tasks, where small attention errors compound? (b) Codebook-based VQ (CommVQ, VecInfer) gives better rate-distortion than scalar VQ but introduces decode-time lookup overhead — when does this trade off favorably on real hardware? (c) Interaction with attention sinks and streaming eviction (H2O, StreamingLLM) is under-studied; quantization error and eviction error may compound.

## References

- Liu, Z., Yuan, J., Jin, H., Zhong, S., Xu, Z., Braverman, V., Chen, B., Hu, X. (2024). *KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache*. ICML 2024. https://arxiv.org/abs/2402.02750
- Zandieh, A., et al. (2025). *TurboQuant: Online Vector Quantization with Near-optimal Distortion Rate*. arXiv:2504.19874. https://arxiv.org/abs/2504.19874
- Google Research blog (2026). *TurboQuant: Redefining AI efficiency with extreme compression*. https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/
- Hooper, C., et al. (2024). *KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization*. NeurIPS 2024. https://arxiv.org/abs/2401.18079
- Apple ML Research (2025). *CommVQ: Commutative Vector Quantization for KV Cache Compression*. https://arxiv.org/abs/2506.18879
- *VecInfer: Efficient LLM Inference with Low-Bit KV Cache via Outlier-Suppressed Vector Quantization* (2025). arXiv:2510.06175. https://arxiv.org/abs/2510.06175
