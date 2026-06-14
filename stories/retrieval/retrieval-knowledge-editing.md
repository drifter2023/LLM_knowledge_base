---
id: retrieval-knowledge-editing
cluster: retrieval
concept: Knowledge Editing (ROME, MEMIT)
status: done
sources:
  - https://rome.baulab.info/
  - https://arxiv.org/abs/2202.05262
  - https://memit.baulab.info/
  - https://arxiv.org/abs/2210.07229
  - https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00644/120576/Evaluating-the-Ripple-Effects-of-Knowledge-Editing
generated_at: 2026-04-25
---

老钟表匠周师傅在城南开了五十年的铺子。铺子里收来的旧座钟有时会"记错事"——不是走得快慢的毛病,而是更怪的:有一台从洋行流出来的报时钟,每到正午,木雕的小人儿便举牌报出"巴黎",可那钟分明是为伦敦的银行定制的。买家不要,卖家不收,钟在角落里堆了七年。

周师傅起初想把整台钟拆开重做。徒弟阿绫拦住他:"师父,要是把所有齿轮都重铸一遍,别的报时——三点、五点、整点的钟声——也会跟着乱掉。"

周师傅于是想了别的办法。他把钟搬到工作台,拿一根细针,从外壳的某处轻轻一戳,小人儿便僵住,牌子翻不出来。他换一处再戳,却没有反应。如此试了上百处,终于找到三块连在一起的小齿轮——只有戳到那三块,小人儿才会"忘记"举牌。其余地方都无关紧要。

"原来一台钟里,记一件事的地方,就只是这么巴掌大一点。"周师傅说。

他拆开那三块齿轮看,惊觉它们的构造竟像一个小小的查号台:一侧的凸纹刻着"此钟服务于何方",另一侧的凹槽刻着"于是该报何地"。凸纹一对上,凹槽就吐出对应的字。要让钟改报伦敦,不必重铸,只需把那一处凹槽的刻痕,精准地、最小幅度地改一刀,让"此钟服务于何方"这串凸纹,从此对上"伦敦"那个凹槽。

阿绫学得很快。可一年后,洋行送来三千台同样错乱的钟,要在月底前全部改好。一台一台地戳针、一台一台地刻凹槽,根本来不及。阿绫便琢磨出新法子:她把三千件需要改写的"何方—何地"对应,列成一张大表,一次性算出每一处该如何同时下刀,再把这一组刀痕,分摊到那三块齿轮以及上下游紧邻的几块齿轮上,像是把改动稀释开,免得任何一块齿轮被改得太狠而崩裂。一个晚上,三千台钟全部改完。

铺子从此声名大噪。可半年后,有买家回来抱怨。改成"伦敦"的那台钟,问它"伦敦在哪个国家",它答得出"英国";可问它"那位每天听这钟声的银行家姓什么",它却糊涂地报出一个巴黎的名字——仿佛凹槽改了,却有些远处的、本以为无关的小齿轮,曾经悄悄地咬合过那一处,如今也跟着歪了一格,而周师傅当初并没有发现它们也连着。

阿绫把这件事记在册子最后一页:

> **改一字易,改一字而不动其余,难。**
> **我们能找到记一件事的那一点,却未必能找到所有依赖那一点的事。**

周师傅看了很久,提笔在旁边添了一句:

> **以后凡来改钟的,先问清楚他要改的,究竟只是钟面上的字,还是钟里那个人对世界的理解。**

---

## Knowledge Editing (ROME, MEMIT)

**Field.** This concept lives in the *retrieval & memory* cluster of LLM research, at the intersection of mechanistic interpretability and model editing. The question it answers: once a pretrained transformer has absorbed a factual association (e.g. "The Eiffel Tower is in Paris"), can we surgically rewrite that single fact in the weights without retraining and without disturbing everything else?

**Mechanism — ROME (Meng et al., NeurIPS 2022).** Using *causal tracing*, the authors corrupt the subject token's embedding, then selectively restore individual hidden states to find which states causally mediate the model's recall of the fact. The trace localises factual recall to a small band of mid-layer **MLP modules** at the last subject token. ROME then interprets that MLP as a linear key–value associative store: the input activation acts as a key encoding the subject, the output acts as a value encoding what the model "knows" about it. To install a new fact, ROME computes a closed-form **rank-one update** to the MLP's down-projection matrix that forces a chosen key to map to a chosen value, while leaving the rest of the matrix's behaviour minimally perturbed. One subject, one layer, one rank-one slice.

**Mechanism — MEMIT (Meng et al., ICLR 2023).** ROME edits one fact at a time. MEMIT generalises this to thousands of edits in a single batch by (a) spreading the required update across a *range* of causally-mediating MLP layers (e.g. layers 3–8 in GPT-J) instead of one, and (b) solving a single regularised least-squares system whose constraints encode every new (subject, relation, object) triple at once. The result is a closed-form weight delta applied across several layers, scaling editing by orders of magnitude over predecessors like KE and MEND.

**Why it matters.** Knowledge editing is a load-bearing tool for the broader claim that transformers store factual associations in *localised, addressable* parameters — a strong empirical argument for mechanistic interpretability of MLPs as memory. Practically, it offers a route to fix outdated facts, remove harmful associations, or patch hallucinations without full retraining.

**Open questions / controversies.** Subsequent work has been sharply skeptical of how *clean* these edits really are. Cohen et al. (2023, *Evaluating the Ripple Effects of Knowledge Editing*, TACL 2024) show that ROME and MEMIT systematically fail on logical consequences of edited facts — the model "knows" Paris is replaced by Rome but cannot answer compositional questions about the change. Hoelscher-Obermaier et al. (2023) build a stricter specificity benchmark and find substantial collateral damage to unrelated facts. Gu et al. (2024) report that repeated editing degrades general reasoning. The localisation premise itself has been challenged by Hase et al. (2023, *Does Localization Inform Editing?*), who show that the layer where editing works best is not always the layer causal tracing identifies. The field has since moved toward retrieval-augmented and parameter-efficient alternatives that side-step weight surgery.

**Key references.**
- Meng, Bau, Andonian, Belinkov. *Locating and Editing Factual Associations in GPT*. NeurIPS 2022. https://arxiv.org/abs/2202.05262
- Meng, Sharma, Andonian, Belinkov, Bau. *Mass-Editing Memory in a Transformer*. ICLR 2023. https://arxiv.org/abs/2210.07229
- Cohen, Biran, Yoran, Globerson, Geva. *Evaluating the Ripple Effects of Knowledge Editing in Language Models*. TACL 2024. https://arxiv.org/abs/2307.12976
