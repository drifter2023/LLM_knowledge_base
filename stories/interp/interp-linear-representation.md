---
id: interp-linear-representation
cluster: interp
concept: Linear Representation Hypothesis
status: done
sources:
  - https://arxiv.org/abs/2311.03658
  - https://arxiv.org/html/2311.03658v2
  - https://forum.effectivealtruism.org/posts/ugxYsptTKvpCgQXCL/inside-the-linear-representation-hypothesis-how-llms-turn
  - https://www.alignmentforum.org/posts/tojtPCCRpKLSHBdpn/the-strong-feature-hypothesis-could-be-wrong
generated_at: 2026-04-25
---

老制图师陆衡退休后,把祖传的航海罗盘搬到了阁楼。这罗盘不指北——它是一只黄铜大盘,盘面上空无刻度,指针却会因被询问的"问题"而偏转。

他的孙女小满九岁,第一次见这东西时,只当是个会动的玩具。

"爷爷,这针怎么乱晃?"

"它不乱晃。"陆衡说,"你问它一个问题,它就指一个方向。"

小满试着喊:"国王!"指针朝东南偏了三度。她又喊:"王后!"指针朝东偏了七度。她皱起眉头:"那它们之间差多少?"

陆衡笑了:"你算算。"

小满拿尺子量,从"国王"的针尖到"王后"的针尖,画了一条短线。她又喊:"男人!"——东偏南五度。"女人!"——东偏北二度。她又量了一遍那条短线。

"爷爷……这两条线一样长,方向也一样。"

"对。"老人点头,"罗盘从不直接告诉你'什么是性别'。但只要你拿任何一对——男人与女人,公牛与母牛,父亲与母亲——把它们的针尖相减,你得到的永远是同一条小箭头。这条箭头,就是它心里默念的'阴阳'。"

小满半信半疑。她又试了别的:"过去!"——西北。"未来!"——东北。她量出第二条小箭头。再试:"昨天/明天","古老/年轻"。每一对相减,得到的都是这第二条小箭头,长度方向几乎不差。

"奇怪的是,"陆衡说,"这两条小箭头——'阴阳'和'时间'——彼此垂直。"

"垂直?"

"互不打扰。我若在你说出一句话时,把'阴阳'那条小箭头悄悄加到针尖上,句子里的他会变成她,可昨天还是昨天,黄牛还是黄牛。这两条方向住在同一个盘面上,却像两条并不相交的河。"

小满忽然好奇:"那盘面上一共有多少条这样的小箭头?"

"很多。颜色、国别、礼貌与粗鲁、真与假……每一种你能想到的对立,都偷偷占据着一条方向。盘面看似空白,其实早被千万条隐形的箭头编成了一张网。我们看不见网,只看见针在转。"

"那……针为什么会按这种方式转?它怎么学会的?"

陆衡停了一会儿,望向窗外。

"我也说不清。它不是被人教的。它是自己在长年累月地听人说话之后,**自发**地把世界的对立,一条一条,折叠成了直线。仿佛它觉得——把意义摆成直线,是最省力的活法。"

小满又问:"那它会不会有时候偷懒,把意思藏在弯线里?"

老人沉默了很久,才说:"会。有些意思,它确实不肯排成直线。那时候,我们这些拿尺子的人,就量不到它了。"

阁楼里,黄铜罗盘静静发亮。指针因为没人发问,垂在零度。但小满已经知道,那看似空白的盘面下,藏着一座由无数平行小箭头堆叠出的、隐形的图书馆。

---

## Concept and Field

**Linear Representation Hypothesis (LRH)** — a foundational claim in **mechanistic interpretability** of large language models (cluster: `interp`). The hypothesis states that high-level semantic concepts (gender, tense, sentiment, language, truth-value, etc.) are encoded in a model's hidden activation space as **linear directions**: the difference between activations of contrastive pairs ("king" − "man" ≈ "queen" − "woman") consistently points along a concept-specific vector.

## Key Mechanism

Park, Choe, and Veitch (2023) gave the first rigorous formalization. They distinguish two notions of linearity that had previously been conflated:

1. **Unembedding (output) representations** — directions γ̄_W in the output space such that for any counterfactual word pair differing only in concept W, the difference of unembedding vectors aligns with γ̄_W. This is the classical word2vec-style "king − man" intuition.
2. **Embedding (input/context) representations** — directions λ̄_W in the residual-stream space such that adding λ̄_W to a context activation steers the model's output along W while leaving causally-separable concepts (e.g., tense when steering gender) untouched.

The technical novelty is the **causal inner product**: rather than the Euclidean inner product (which is arbitrary because representations are identified only up to invertible linear transformations), they construct an inner product — derived from the covariance structure of the unembedding matrix — under which causally-separable concepts are *orthogonal*. Under this inner product, the Riesz isomorphism makes unembedding and embedding representations the *same vector*, so a steering direction can be cheaply estimated from word-pair differences instead of expensive sentence-pair contrasts. Validated on LLaMA-2 7B: estimated concept directions probe accurately, steer outputs predictably, and stay near-orthogonal across causally independent concepts.

## Why It Matters

LRH is the load-bearing assumption underneath nearly every modern interpretability technique: linear probing, activation steering / representation engineering, sparse autoencoders (which decompose activations into sparse linear combinations of concept directions), and difference-in-means jailbreak vectors. If concepts were generically nonlinear, none of these would work cleanly. Park et al. supply the geometric justification for treating activation space as a near-orthogonal dictionary of feature axes.

## Open Questions and Controversies

- **Strong vs. weak LRH.** The *weak* form — "many concepts are linear" — is well-supported empirically. The *strong* form — "all features are linear atoms" — is contested. Engels et al. ("Not All Language Model Features Are Linear", 2024) found multi-dimensional, manifold-shaped features (e.g., days-of-week as a circle) that resist linear decomposition.
- **Universal applicability.** Subsequent theoretical work (e.g., "On the Failure of a Universal Linear Representation Hypothesis") uses VC-dimension bounds to argue LRH cannot hold universally, and small recurrent architectures exhibit non-linear "onion" magnitude codes instead.
- **Identifiability of the inner product.** Estimating the causal inner product from unembedding covariance is itself an empirical procedure; how well it generalizes beyond LLaMA-style decoders remains open.

## References

- Park, K., Choe, Y. J., & Veitch, V. (2023/2024). *The Linear Representation Hypothesis and the Geometry of Large Language Models.* arXiv:2311.03658 / ICML 2024. <https://arxiv.org/abs/2311.03658>
- Park et al., HTML version with detailed formalization: <https://arxiv.org/html/2311.03658v2>
- "Inside the Linear Representation Hypothesis" — EA Forum overview of weak vs. strong LRH: <https://forum.effectivealtruism.org/posts/ugxYsptTKvpCgQXCL/inside-the-linear-representation-hypothesis-how-llms-turn>
- "The 'strong' feature hypothesis could be wrong" — alignment-forum critique: <https://www.alignmentforum.org/posts/tojtPCCRpKLSHBdpn/the-strong-feature-hypothesis-could-be-wrong>
