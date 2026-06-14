---
id: interp-crosscoders
cluster: interp
concept: Crosscoders / Transcoders
status: done
sources:
  - https://transformer-circuits.pub/2024/crosscoders/index.html
  - https://arxiv.org/abs/2406.11944
  - https://transformer-circuits.pub/2025/attribution-graphs/methods.html
generated_at: 2026-04-25
---

老钟表行的三楼,是林师傅修表的地方。

林师傅以前有个怪习惯:每修一只表,就把它拆到底,把每个齿轮、每根游丝、每颗螺丝都摆在一张白布上,逐个端详,做笔记。徒弟阿岐起初佩服得不得了——师傅记得每一颗零件的位置、磨损、年代。可日子久了,阿岐发现一个尴尬的事:师傅认识所有的零件,却经常说不出一只表"为什么走得快了三秒"。零件的故事讲了一千遍,表的故事却没讲清楚。

阿岐自己琢磨了一种新法子。他不再单看零件,而是盯着**两层齿轮之间**的咬合——上面那一层送进来什么力,下面那一层吐出去什么力。他把这种"输入到输出的转译"画在纸上,做成一张稀疏的对照表:大多数情况下表是空的,只有少数几条线亮起,代表"这一下转动,是因为上面那颗擒纵在松"。第一次,他能指着图说:"快三秒,是因为第二层这条线被第一层那颗游丝过度拨动了。"师傅看了,沉默良久,说:"你看见的是动作,我看见的只是零件。"

但阿岐很快碰到新麻烦。有些老怀表的设计很奇怪:某个特征——比如"温度补偿"——并不住在某一层齿轮里,而是横跨三四层,从游丝一直延伸到摆轮。如果他只看相邻两层的转译,就会把同一个特征拆成四份,得出四条几乎一样的解释,徒劳又冗余。

于是他又改了一次方法。这一次,他不再一层一层看,而是**同时把好几层摊在桌面上**,让一个特征可以从第三层"读入",同时向第三、第四、第五、第六层一起"写出"。这样,"温度补偿"这个横跨多层的功能,就只会在图上点亮**一根**线,而不是四根重影。更妙的是,他把两只不同年代、不同厂家的表也并排摊开,用同一张稀疏对照表去拟合两边——结果惊人地发现,有些"线"在两只表里几乎一模一样,那是机械钟表的共有语言;而另一些"线"只在新表里出现,那正是这家新厂的独门设计。他第一次能用同一种语言谈论两只本不相干的表。

师傅终于摘下放大镜。他说:"我修了一辈子,总以为零件就是答案。原来零件只是位置,真正的答案,是力气从哪里流到哪里。"

阿岐没回答。他把白布卷起来,把那张稀疏对照图小心地夹进笔记本——那不是零件清单,而是钟表的"思路"。

---

## Concept and field

**Crosscoders** and **Transcoders** belong to the **mechanistic interpretability** cluster. They are evolutions of the sparse autoencoder (SAE) program for decomposing transformer activations into monosemantic features, designed specifically to recover *circuits* rather than just *features*.

## Key mechanism

A standard **SAE** reads activations at one layer and tries to reconstruct *those same activations* with a sparse, overcomplete dictionary. It tells you *what* features are present, but not *how* the model computes them — and feature representations get duplicated across adjacent layers via the residual stream.

A **transcoder** (Dunefsky, Chlenski & Nanda, NeurIPS 2024) instead reads the input to an MLP block and is trained to reconstruct that MLP's *output*. It thus replaces the dense MLP with a wider, sparsely-activating approximation. Crucially, because encoder and decoder weights are now fixed linear maps between input-side features and output-side features, circuits factorize into an input-invariant weight term and an input-dependent activation term — making weights-based circuit analysis tractable. Dunefsky et al. used this to reverse-engineer GPT-2 small's "greater-than" circuit.

A **crosscoder** (Lindsey, Templeton, Marcus, Conerly, Batson & Olah, Anthropic, Oct 2024) generalises further: a single dictionary reads from *and* writes to *multiple layers simultaneously*. This dissolves the cross-layer superposition problem, where a single conceptual feature gets duplicated as many near-copies along the residual stream. The **cross-layer transcoder (CLT)** variant used in Anthropic's 2025 *Attribution Graphs* work has each feature at layer ℓ read from the residual stream and write to MLP outputs at layers ℓ, ℓ+1, …, L with separate per-target decoder weights. This shortens average circuit path length from ~3.7 (per-layer transcoders) to ~2.3 (CLTs).

The same machinery enables **model diffing**: train one crosscoder jointly on two models (e.g. base vs. chat-tuned, or two checkpoints), and features that decode similarly across both models are shared, while features active in only one indicate behaviours introduced by fine-tuning.

## Why it matters

SAEs unlocked interpretable features but stalled at circuit-level analysis: too many duplicated features, too many opaque MLP nonlinearities. Transcoders replace MLPs with something a human can read; crosscoders fold the residual-stream's cross-layer redundancy into single features. Together they are the substrate of Anthropic's 2025 "biology of a large language model" attribution-graph work — currently the most detailed mechanistic account of a frontier-scale LM.

## Open questions / controversies

- The original crosscoder writeup is explicitly labelled "preliminary"; loss function and architectural choices are still being iterated. Anthropic's 2025 *Insights on Crosscoder Model Diffing* update walks back some early model-diffing claims, noting that apparent "chat-only" features can be artefacts of the training objective rather than genuinely novel concepts. Reviewers should treat early diffing results with care.
- Whether CLT "replacement models" remain faithful when the underlying model is asked off-distribution questions is an active concern in the attribution-graphs methods paper itself.

## References

- Lindsey, Templeton, Marcus, Conerly, Batson, Olah (2024). *Sparse Crosscoders for Cross-Layer Features and Model Diffing.* Anthropic / transformer-circuits.pub. <https://transformer-circuits.pub/2024/crosscoders/index.html>
- Dunefsky, Chlenski, Nanda (2024). *Transcoders Find Interpretable LLM Feature Circuits.* NeurIPS 2024. <https://arxiv.org/abs/2406.11944>
- Ameisen et al. (2025). *Circuit Tracing: Revealing Computational Graphs in Language Models* (cross-layer transcoder methods). Anthropic. <https://transformer-circuits.pub/2025/attribution-graphs/methods.html>
