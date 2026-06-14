---
id: itc-speculative-decoding
cluster: itc
concept: Speculative Decoding
status: done
sources:
  - https://arxiv.org/abs/2211.17192
  - https://proceedings.mlr.press/v202/leviathan23a.html
  - https://research.google/blog/looking-back-at-speculative-decoding/
  - https://developer.nvidia.com/blog/an-introduction-to-speculative-decoding-for-reducing-latency-in-ai-inference/
generated_at: 2026-04-25
---

镇上有两位翻译。老周是从京城退下来的翰林，学问深，可手腕已不灵便，落笔极慢；小林是他的徒弟，年轻，下笔飞快，可遇到生僻典故就会望文生义。

商队每天黄昏抵达驿站，押着满箱蕃文急件，催着连夜译出。老周一个人译，从不会出错，但常常通宵也译不完一箱。东家把小林安排进来辅助，规矩起初是这样的：小林先译一段，老周再从头核对，错的地方擦掉重写。这反倒更慢——小林译三句，老周得重看三句，等于把活儿做了两遍。

老周琢磨了一夜，第二天定了个新规矩。

"小林，你照旧往前赶，一口气写七个字。写完别停，递给我。"

"那师父您还不是要一字一字看？"

"不。"老周把七个字铺开在案上，"我只看一眼，心里同时把这七个字'本该是什么'都想出来。这一眼的工夫，跟我自己写一个字差不多——纸是死的，墨是干的，我脑子里转得过来。"

小林不解："那您看完，错的还是要改啊。"

"听好。"老周抽出第一个字，"你写了'霜'。我心里也想着'霜'——过。第二字你写'刃'，我心里想的是'锋'——这里你猜错了，从此处起，后面五个字我一律不看，全部作废，由我亲手补一个'锋'字下去。下一轮，你再从'锋'字后面接着往前冲七个。"

小林愣了一会儿，又问："那要是我写'刃'，您心里想的也是'刃'，只是没那么笃定呢？比如您本想写'刃'的把握只有六成，而我写'刃'的把握有九成？"

老周点头，"这是要紧处。我从袖里摸一颗骰子，抛一下，看天意。我那六成除以你那九成，得三分之二——骰子落在三分之二以内，就当我也写了'刃'，过；落在外头，就算你猜错，作废、补字、重起。这样长远看，写出来的整篇文章，跟我一字一句独自译出来的，分毫不差。"

小林试了几日，惊觉箱子见底的时辰早了一倍有余。老周笑道："你下笔本就快，偏偏十之七八猜得着我的心思。我何必拦着你？我只在你猜错时出手，把错的那一段连同后面没核过的全部推倒，从那一处接住——前头省下的功夫，是白赚的。"

后来驿站学徒们口耳相传，把这套规矩叫做"先草后核，错处即断"。徒弟跑得多远，全看他和师父心思相合到几分。

---

## Speculative Decoding

**Field.** Inference-time compute and serving optimization for autoregressive language models (cluster: ITC). Introduced by Leviathan, Kalman & Matias at Google in late 2022 and presented at ICML 2023; concurrent work by Chen et al. (DeepMind, 2023) describes essentially the same algorithm under the name *speculative sampling*.

**Mechanism.** Autoregressive decoding from a large target model `M_p` is memory-bandwidth-bound: each token requires loading all parameters from HBM, leaving the GPU's compute mostly idle. Speculative decoding exploits that idle compute. A small, cheap *draft* model `M_q` autoregressively proposes γ tokens `x_1 … x_γ`. The target model is then run **once, in parallel**, over all γ+1 positions, yielding `p(·|prefix), p(·|prefix, x_1), …, p(·|prefix, x_1…x_γ)` in a single forward pass.

Each draft token is then verified by **modified rejection sampling**: sample `r ~ U(0,1)` and accept `x_i` if `r < p(x_i)/q(x_i)`; otherwise reject and resample a single replacement token from the renormalized residual distribution `(p − q)_+ / Σ(p − q)_+`. If all γ tokens are accepted, an additional "free" token is sampled directly from `p` at the last position. This rule provably preserves the exact target distribution — the output is statistically identical to standard decoding from `M_p`.

If each draft token is independently accepted with probability α, the expected number of tokens produced per target call is `(1 − α^(γ+1))/(1 − α)`. The speedup depends on α (alignment between draft and target) and the cost ratio `c = T(M_q)/T(M_p)`.

**Why it matters.** Speculative decoding is one of the few inference accelerations that is **lossless** — it does not approximate, distill, or quantize the target. Leviathan et al. report 2×–3× wall-clock speedups on T5-XXL with no change to outputs. It is now standard in vLLM, TensorRT-LLM, and Google's own production stack (including AI Overviews).

**Key references.**
- Leviathan, Kalman, Matias. *Fast Inference from Transformers via Speculative Decoding*. ICML 2023. https://arxiv.org/abs/2211.17192
- Chen, Borgeaud, Irving, Lespiau, Sifre, Jumper. *Accelerating Large Language Model Decoding with Speculative Sampling*. arXiv:2302.01318, 2023.
- Google Research blog, *Looking back at speculative decoding* (2024). https://research.google/blog/looking-back-at-speculative-decoding/

**Open questions and extensions.** Subsequent work attacks the draft model bottleneck: **Medusa** (Cai et al., 2024) replaces the draft model with extra prediction heads on the target itself; **EAGLE / EAGLE-2** (Li et al., 2024) drafts in feature space rather than token space, raising α substantially; **lookahead decoding** (Fu et al., 2024) eliminates the draft model via Jacobi iteration. Active research questions include: how to choose γ adaptively, how to make draft models robust under distribution shift (online speculative decoding, Liu et al., 2023), and how to extend the rejection-sampling guarantee to tree-structured drafts and to non-greedy structured outputs (e.g., constrained decoding, tool-use). The lossless guarantee is sometimes weakened in practice when implementations use approximate verifiers or temperature mismatches between draft and target — a subtle correctness pitfall worth flagging in any production deployment.
