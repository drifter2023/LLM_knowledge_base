---
id: interp-sae
cluster: interp
concept: Sparse Autoencoders (SAE)
status: done
sources:
  - https://transformer-circuits.pub/2023/monosemantic-features
  - https://transformer-circuits.pub/2024/scaling-monosemanticity/
  - https://www.anthropic.com/research/towards-monosemanticity-decomposing-language-models-with-dictionary-learning
  - https://arxiv.org/html/2503.05613v3
  - https://deepmindsafetyresearch.medium.com/negative-results-for-sparse-autoencoders-on-downstream-tasks-and-deprioritising-sae-research-6cadcfc125b9
  - https://openreview.net/forum?id=DSOTgzeH3w
generated_at: 2026-04-25
---

老钟表匠林叔在巷子口开了三十年的修表铺。他有个怪癖:从来不直接修表,而是先把每一只送来的表拆开,把零件按一种谁也看不懂的方式重新摆在丝绒布上。

我十六岁那年去拜师,第一天他就指着墙上那只老挂钟说:"你听,它走得不对,但你说不出哪儿不对——为什么?"

我支吾半天答不上来。

林叔笑了:"因为它的毛病藏在十几个齿轮里,每一个齿轮都同时参与好几件事——既管秒针、又管报时、又顺带牵动月相盘。你光看一个齿轮,它看上去都在好好转。毛病是'摊'在一堆齿轮上的,你抓不住它。"

他拉开抽屉,里面是一块巨大的黑丝绒布,上面整整齐齐摆了大约**三千个**小格子。"我修表的法子,就是把它拆开,然后摊到这块布上。"

我愣住:"一只表才两百来个零件,你这布上三千个格子干嘛?"

"格子要远远多于零件,"林叔说,"才装得下。"

他从送修的怀表里取出一根游丝,放在丝绒布的某一格;又取出一颗螺钉,放在另一格。他动作极慢,有个铁规矩:**任何时刻,丝绒布上点亮的格子不能超过十几个**。其他几千个格子,都必须是空的、暗的。

"为什么要空着?"

"因为一只表的毛病,从来不是三千件事同时出错。它只是这三千种可能毛病里,碰巧亮起的那七八个。我逼着自己每次只点亮少数几格,这样每一格代表的就只能是**一件**很具体的事——'游丝偏了零点二毫米','三号齿轮的第十七颗齿磨损'。一格一义。"

我看他干了三天,才明白那块布的玄机。原本在表里搅在一起、彼此叠加的毛病,被摊到这张又宽又稀的布上之后,每一格突然有了清清楚楚、可以用人话说出来的意思。他指着第847格对我说:"看,这格只有在客人长期把表贴着收音机放的时候才会亮。"指着第2103格:"这格只在表主人是左撇子的时候亮。"

而他真正修表时,只做一件事:**把丝绒布上的零件,原样装回去**。装回去的表,和送来时一模一样——但他已经看见了它病在哪里。

第七年我出师那天,林叔送我一句口诀:"零件少而事多,故每件零件身兼数职,你看不懂它;格子多而每次只亮几格,故每格只干一件事,你看得懂它。修不修是其次,**先得让它可以被看懂**。"

后来我才知道,在另外一个完全不同的行业里,有人对着一个比怀表复杂亿万倍的东西——一个语言模型内部某一层的几千维激活向量——做了一模一样的事。他们也发现:神经元太少、概念太多,概念便彼此叠加(superposition);于是他们训练一个又宽又稀的"丝绒布",把激活展开到几万、几十万个格子上,逼它每次只亮少数几个。展开之后,那些原本搅在一起、谁也说不清的内部状态,忽然有了名字:"金门大桥"、"代码里的 bug"、"谄媚的语气"、"欺骗的意图"。

林叔的丝绒布,有个学名。

---

## Sparse Autoencoders (SAE)

**Field.** Mechanistic interpretability of large language models — cluster `interp` in this knowledge base.

**The problem it addresses.** Individual neurons inside a transformer are typically *polysemantic*: a single neuron fires for many unrelated concepts (Arabic text, Python code, and Beatles lyrics all at once). The leading explanation is the **superposition hypothesis** (Elhage et al., 2022): the model represents far more features than it has neurons by packing them as nearly-orthogonal directions in activation space. Reading off "what the model is thinking" by inspecting neurons is therefore hopeless.

**The mechanism.** A sparse autoencoder is a one-hidden-layer neural network trained on the activations `x ∈ ℝ^d` of a chosen transformer layer. The encoder maps `x` to a much wider hidden representation `f = ReLU(W_e x + b_e) ∈ ℝ^m` where `m ≫ d` (often 8×–256× wider). The decoder reconstructs `x̂ = W_d f + b_d`. Training minimises a reconstruction term plus a sparsity penalty:

```
L = ‖x − x̂‖² + λ · ‖f‖₁
```

The L1 penalty forces all but a small fraction of the `m` latent units to be zero on any given input. Because the dictionary is overcomplete and sparsely used, each latent direction `W_d[:, i]` tends to specialise on a single, human-interpretable concept — what Bricken et al. call a **monosemantic feature**.

**Key results.**
- *Towards Monosemanticity* (Bricken et al., 2023) decomposed a 512-neuron layer of a 1-layer transformer into ~4,000 features, of which human raters judged ~70% interpretable — versus near-random for raw neurons.
- *Scaling Monosemanticity* (Templeton et al., 2024) trained SAEs with up to 34M latents on Claude 3 Sonnet, recovering multilingual, multimodal features (the famous Golden Gate Bridge feature, code-bug features, deception/sycophancy features) and demonstrating that clamping a feature's activation steers model behaviour.

**Why it matters.** SAEs gave mechanistic interpretability its first scalable, unsupervised method for turning opaque activations into a vocabulary of named concepts, which in turn enables circuit discovery, model steering, and safety-relevant audits (e.g., locating deception or jailbreak features).

**Open questions and recent critiques.**
- **Incomplete recovery.** Theoretical work (Till, 2025; *On the Limits of Sparse Autoencoders*, OpenReview 2025) shows standard L1 SAEs systematically fail to recover ground-truth features unless extreme sparsity is enforced; "shrinkage" biases magnitudes downward.
- **Architectural variants.** TopK SAEs (Gao et al., 2024), JumpReLU SAEs (Rajamanoharan et al., 2024), and Gated SAEs were introduced to fight dead latents and shrinkage.
- **Negative downstream results.** In March 2025, DeepMind's mechanistic interpretability team publicly *deprioritised* SAE research after finding that SAE features underperformed simple linear probes on out-of-distribution probing and steering tasks.
- **Interpretability illusion.** SAEBench and feature-sensitivity studies (2025) report that many "interpretable-looking" features have poor sensitivity — they fail to fire on paraphrases of their own description — suggesting evaluator labels overstate true monosemanticity.

**Key references.**
- Bricken, Templeton, Batson, et al. (2023). *Towards Monosemanticity: Decomposing Language Models With Dictionary Learning.* Transformer Circuits Thread. https://transformer-circuits.pub/2023/monosemantic-features
- Templeton, Conerly, Marcus, et al. (2024). *Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet.* Transformer Circuits Thread. https://transformer-circuits.pub/2024/scaling-monosemanticity/
- Shu, Xu, Yan, Li (2025). *A Survey on Sparse Autoencoders.* arXiv:2503.05613. https://arxiv.org/html/2503.05613v3
- DeepMind Safety Research (2025). *Negative Results for Sparse Autoencoders on Downstream Tasks.* https://deepmindsafetyresearch.medium.com/negative-results-for-sparse-autoencoders-on-downstream-tasks-and-deprioritising-sae-research-6cadcfc125b9
