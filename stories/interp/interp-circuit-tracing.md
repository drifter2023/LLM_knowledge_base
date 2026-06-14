---
id: interp-circuit-tracing
cluster: interp
concept: Circuit Tracing & Attribution Graphs
status: done
sources:
  - https://transformer-circuits.pub/2025/attribution-graphs/methods.html
  - https://transformer-circuits.pub/2025/attribution-graphs/biology.html
  - https://www.anthropic.com/research/open-source-circuit-tracing
  - https://www.anthropic.com/research/tracing-thoughts-language-model
generated_at: 2026-04-25
---

老钟表匠去世那年,孙女阿桑接手了铺子。

铺子里最棘手的活,是一只从市政厅抬来的落地座钟。它走得不准,有时快两秒,有时慢半分,但所有人都说它"看上去没毛病"——指针转,钟摆摆,报时也响。市长拍着它说:这玩意儿好着呢,你只要让它别再忽快忽慢就行。

阿桑打开后盖。里面是几百个齿轮,层层叠叠,油亮亮地咬合着。她祖父留下的笔记说:这钟里有十一层传动,每层之间又横着无数副齿,谁也说不清哪一颗在起作用。她试着拨动其中一颗,整座钟先是停了一瞬,然后又重新走起来,像什么都没发生。

她于是想了一个笨办法。

她不再去看真钟,而是在旁边搭了一台**仿钟**——同样的外壳,同样的指针,但每一层齿轮她都换成了自己手工打磨的、带刻度的稀疏组件。每个组件只在特定的"念头"下才转动:有的只为"凌晨三点"而转,有的只为"星期日的钟声"而转,有的甚至只为"市长走进大厅"而转。这些组件大部分时间静止,像一屋子打瞌睡的工匠,只有少数几个被点名时才睁眼。

她让仿钟跟着真钟走一整天。每当真钟在某个时刻出错,她就回到仿钟,看那一刻是哪几个工匠睁了眼,又是谁推了谁一把。她在墙上挂起一张大纸,把醒着的工匠画成圆圈,把"谁推了谁"画成箭头。一天下来,纸上密密麻麻,有上百万条线。

她于是又做了一件事:把对那一刻报时**没有贡献**的线全部擦掉,只留下真正传到了指针上的那一小撮。纸上立刻清爽起来,留下的是一棵从输入长到输出的、有根有枝的小树。

她盯着那棵小树看了很久,忽然笑了。

原来这钟在报"下午三点"之前,内部早就先想好了"该敲三下"这个结果,然后倒过来安排前面的齿轮去凑成三点的姿态——它不是走到三点才决定敲三下,它是**先决定敲三下,再让自己看起来走到了三点**。难怪它忽快忽慢:它在替未来的敲击铺路。

她还发现,有几条线她无论如何也画不出来——那是横着穿过所有层的"注意"机构,她的仿钟复刻不了,只能照抄真钟当时的姿态。她在笔记里老实写下:这一段我看不见。她也写下:我画出的小树,只对今天这一次报时成立;明天换一刻钟,工匠们点名的方式就又不同了。

市长来取钟时问她修好了没有。她说,没有,但我知道它为什么这样走了。市长不耐烦:那有什么用?

阿桑说:从前你们以为它是一只钟,所以你们只会摇它、骂它、或者把它砸了。现在我能指给你看,它内部有一个"想敲三下"的念头,有一个"市长进门"的念头,这些念头互相推搡,才让指针走成你看到的样子。下回它再出错,我们不必再猜——我们可以走进去,问那个具体的念头:你为什么醒了?

她合上钟门。墙上那张满是圆圈和箭头的纸,被夕阳照得发亮。

---

## Circuit Tracing & Attribution Graphs

**Field.** Mechanistic interpretability of large language models (cluster: `interp`). Introduced in Anthropic's March 2025 paper *Circuit Tracing: Revealing Computational Graphs in Language Models* and its companion *On the Biology of a Large Language Model*, with open-source tooling released in May 2025.

**Key mechanism.** The goal is to attribute a specific model output, on a specific prompt, to a specific subgraph of internal computation. The method has four moving parts:

1. **Cross-layer transcoder (CLT).** Each MLP block is replaced by a sparse dictionary of features that read from the residual stream at one layer but write into *all subsequent* MLP layers. Training minimizes reconstruction error against the original MLP outputs plus an L1 sparsity penalty, yielding monosemantic, sparsely-activating features.
2. **Local replacement model.** For a given prompt, the authors swap MLPs for the CLT, *freeze* the original model's attention patterns and layer-norm denominators, and add per-token error terms so that the replacement model's activations exactly match the underlying model on that prompt. This makes the forward pass linear in feature activations conditional on the frozen attention.
3. **Attribution graph.** Nodes are: active CLT features at each token position, input token embeddings, error nodes, and output logits. Edges are direct linear effects (source activation × virtual weight through residual stream and frozen attention) — so each feature's preactivation is exactly the sum of its incoming edges.
4. **Pruning.** Raw graphs have millions of edges. The authors compute indirect influence matrices and keep only nodes/edges contributing most to the target logit, typically dropping 90% of nodes while preserving ~80% of explainable behavior.

**Why it matters.** Earlier interpretability work (sparse autoencoders, individual circuit studies) gave a vocabulary of features but no systematic way to say *how* features compose into a behavior on a given input. Attribution graphs supply that compositional account. Applied to Claude 3.5 Haiku, they produced concrete mechanistic findings: the model **plans rhymes backward** in poetry, performs genuine **two-hop reasoning** (Dallas → Texas → Austin) rather than only memorized shortcuts, uses **shared multilingual features** with English-privileged output weights, and runs a **default "can't answer" circuit** that hallucinations bypass when an entity-recognition feature misfires. These were validated by causal interventions on the predicted features.

**Open questions / known limitations.** The authors are unusually candid: their methods produce "satisfying insight for about a quarter of prompts attempted." Specifically, attribution graphs (a) cannot explain how attention patterns form because attention is frozen — failing on induction-style tasks; (b) leak unexplained computation into error nodes; (c) are blind to *inhibitory* circuits and to features that fail to activate; (d) suffer compounding perturbation discrepancies, so larger CLTs are more faithful per-feature but less mechanistically faithful overall; (e) describe one prompt at a time — global circuit extraction across prompts introduces interference. Subsequent *Circuits Updates* in mid-2025 (e.g. QK attributions) try to address attention blindness; the faithfulness gap remains an active research frontier.

**Key references.**
- Ameisen, Lindsey, Pearce et al. (2025). *Circuit Tracing: Revealing Computational Graphs in Language Models*. Transformer Circuits Thread. https://transformer-circuits.pub/2025/attribution-graphs/methods.html
- Lindsey, Gurnee, Ameisen et al. (2025). *On the Biology of a Large Language Model*. Transformer Circuits Thread. https://transformer-circuits.pub/2025/attribution-graphs/biology.html
- Anthropic (May 2025). *Open-sourcing circuit-tracing tools*. https://www.anthropic.com/research/open-source-circuit-tracing
- Anthropic (March 2025). *Tracing the thoughts of a large language model*. https://www.anthropic.com/research/tracing-thoughts-language-model
