---
id: arch-diffusion-lm
cluster: arch
concept: Diffusion Language Models
status: done
sources:
  - https://arxiv.org/abs/2502.09992
  - https://arxiv.org/abs/2506.17298
  - https://deepmind.google/models/gemini-diffusion/
  - https://arxiv.org/html/2508.08712
  - https://www.inceptionlabs.ai/blog/introducing-mercury
generated_at: 2026-04-25
---

林师傅在城南开壁画馆三十年，一向只收一种学徒：能一笔一画从左上角往右下角落墨的孩子。第一笔不能改，第二笔依着第一笔的形势走，整面墙就这么爬过去。每天能画完多少，全看这一根线推得多远。

那年冬天，他从北方请来一位姓沈的姑娘当客座师傅。沈师傅干活的法子完全不同。

她让徒弟先在整面墙上铺一层灰布，把每一寸都遮起来。然后她说："你们不要从角落开始。你们站远一点，先告诉我——这面墙里大概要有几个人？光从哪边来？远处是山还是水？"

徒弟们愣了：那不还是看不见吗？

"不看见也得猜，"沈师傅说，"猜错了不要紧。"

她要徒弟同时揭开几块灰布——东边露一点眉眼，西边露一点衣袖，中间露半截屋脊。露出来的笔画不必相邻，不必有先后。然后所有人退后看一眼：东边那双眼睛和西边那只袖子，在情绪上是不是一致？屋脊的方向能不能压住下面隐约的人群？

不一致就再盖回去，重画。一致就保留，再揭下一批。

林师傅站在后头看，起初皱眉，后来不出声了。他注意到一件怪事：传统的画法里，徒弟一旦在左上角画错了一笔狐狸的耳朵，整面墙后面所有的山、所有的云、所有的人，都得围着这只错耳朵将就。错误像水一样往右下淌，淌到哪里画到哪里。

沈师傅的徒弟却可以这样说："东边那双眼睛画歪了。"——把那一小块重新蒙上灰布，下一轮再揭开重画。墙的其余部分纹丝不动，因为它们本来就不依赖那双眼睛先存在。

更奇的是速度。林师傅的徒弟一天画一面墙的三分之一。沈师傅的徒弟一天能把整面墙从一片灰雾推进到七八分像。因为他们五六个人可以同时下笔，每人负责自己揭开的那块——彼此用墙上已经显形的部分互相参照，而不是排队等前一个人收笔。

腊月里来了一桩急活。庙里要在除夕之前补好一面被火燎过的照壁，画的是一首从末句倒着读的回文诗。林师傅的徒弟做不了——他们的笔只会从开头往结尾推，倒着想就抓瞎。沈师傅让徒弟把整首诗的位置全用灰布盖上，先猜中间那个字最像什么，再往两边同时铺开。两天交工。

除夕夜，林师傅请沈师傅喝酒。他说："我教了一辈子，以为字和画都得有个先后。原来先后只是我们的一种习惯。"

沈师傅笑："也不是没代价。我的徒弟画完一面墙，得反复退后、盖布、再揭——比你们多走好几趟。一面墙的总笔画并没少，只是我们让它们不必排队。再说，墙得先量好尺寸——你那种从左下角一直往外延的画法，墙有多长都行，我的法子得先框定一个范围。"

两人对饮。窗外，新一批徒弟正在两面墙前同时起手——一面从左上角，一面从一片均匀的灰。

---

## Concept and field

**Diffusion Language Models (dLLMs)** belong to the **Architectures & Generative Paradigms** cluster of modern LLM research. They are an alternative to the dominant autoregressive (AR) next-token-prediction paradigm: instead of factorizing `p(x) = ∏ p(x_t | x_<t)` left-to-right, they treat a sequence as a fully-masked canvas and learn to *denoise* it in parallel over a small number of refinement steps.

## Key mechanism

The current generation of dLLMs (LLaDA, Mercury, Gemini Diffusion) are best understood as **masked diffusion** rather than continuous Gaussian diffusion:

1. **Forward process.** During training, every token in a sequence is independently masked with probability `t ~ U[0,1]`. At `t=1` the entire sequence is `[MASK]`; at `t=0` it is clean.
2. **Reverse process.** A bidirectional Transformer (no causal mask) is trained to predict *all* masked tokens simultaneously, optimizing a likelihood lower bound on `p(x)`.
3. **Sampling.** Generation starts from an all-masked sequence of fixed length and proceeds for `K` steps (`K` much smaller than sequence length). Each step the model predicts a distribution over every masked position; some fraction are committed (often by confidence), the rest are re-masked and revisited. Errors at one position can be repaired in later steps — a property AR models lack, since a wrong early token poisons everything to its right.

This yields three concrete advantages: (a) **parallel decoding** — many tokens emerge per forward pass, giving Mercury ~1100 tok/s and Gemini Diffusion ~1479 tok/s on H100-class hardware, 4–10× faster than comparable AR models; (b) **bidirectional context** during generation, which Nie et al. show defeats the *reversal curse* (LLaDA 8B beats GPT-4o on reversed-poem completion); (c) **iterative self-correction**, valuable for code and math.

## Why it matters

For a decade the field has implicitly equated "LLM" with "autoregressive Transformer." LLaDA's NeurIPS 2025 result — an 8B masked diffusion model competitive with LLaMA3 8B on general benchmarks — is the first scaled evidence that the AR factorization is a *choice*, not a necessity. Mercury and Gemini Diffusion then demonstrated production-grade latency wins, suggesting diffusion may be the natural paradigm whenever throughput dominates.

## Open questions and controversies

- **Fixed output length.** Current dLLMs sample on a pre-allocated canvas; variable-length generation is awkward and an active research area.
- **KV-cache incompatibility.** Bidirectional attention forbids the standard AR KV cache, conflicting with the entire AR optimization ecosystem (Wang et al., 2025 survey).
- **Quality–speed trade-off in high-entropy regions.** The survey by Wang et al. (2025) flags "ignored dependencies in high-entropy scenarios" — committing tokens in parallel can miss subtle sequential dependencies that AR models capture for free.
- **Reasoning at scale.** Whether iterative denoising can match long-chain CoT reasoning of frontier AR models remains contested; Inception's Mercury 2 (late 2025) is the first serious diffusion *reasoning* model and its evaluation is still settling.

## References

- Nie, Zhu, You, Zhang, Ou, Hu, Zhou, Lin, Wen, Li (2025). *Large Language Diffusion Models* (LLaDA). arXiv:2502.09992. NeurIPS 2025 Oral. <https://arxiv.org/abs/2502.09992>
- Inception Labs (2025). *Mercury: Ultra-Fast Language Models Based on Diffusion.* arXiv:2506.17298. <https://arxiv.org/abs/2506.17298>
- Inception Labs blog. *Introducing Mercury, the World's First Commercial-Scale Diffusion LLM.* <https://www.inceptionlabs.ai/blog/introducing-mercury>
- Google DeepMind (2025). *Gemini Diffusion.* <https://deepmind.google/models/gemini-diffusion/>
- Wang et al. (2025). *A Survey on Parallel Text Generation: From Parallel Decoding to Diffusion Language Models.* arXiv:2508.08712. <https://arxiv.org/html/2508.08712>
