---
id: retrieval-parametric-vs-non
cluster: retrieval
concept: Parametric vs Non-parametric Knowledge
status: done
sources:
  - https://arxiv.org/abs/2005.11401
  - https://arxiv.org/abs/2410.05162
  - https://arxiv.org/abs/2501.15915
  - https://arxiv.org/abs/2502.14802
generated_at: 2026-04-25
---

镇上有两位郎中。

老郎中姓陈,行医四十年。他从不翻书。病人一进门,坐下,伸手,他三指搭上脉,眼皮也不抬,药方就从笔下流出来了。镇上人说陈郎中的脑子里住着一整座药王庙——三百二十种药材的性味归经,八百个古方的加减变化,连哪一年荔枝湾闹时疫该用什么引子,都在他骨头缝里熬了出来。开方极快,一炷香能看二十个病人。

小郎中姓林,从府城药学堂下来的。他诊室后头摆着两架高柜,柜子里是抽屉,抽屉上贴着小签。每看一个病人,他必先问得极细,然后请病人稍候,自己转身去翻那些抽屉——抽出几张笺,对照着,在桌上铺开,再落笔。一个病人要耗去半个时辰。镇上人起初笑他笨。

那年秋天,从南洋回来一艘船,带下一种没人见过的热病。病人高烧、舌苔发黑、第三日便咳血。陈郎中看了三个,开的是他记得最稳的那张古方,病人一个没救回来。他闭门三日,把脑中所有方子又过了一遍,仍寻不到对得上的。

林郎中接手时,先让人把死者的舌象、脉象、发病时辰一一记下,然后钻进他那两架柜子,翻了整整一夜。第二天清早,他从最底下一个抽屉里抽出一张极薄的笺——那是去岁府城医报上一位船医寄回的札记,记的是吕宋岛上一种叫"瘴咳"的病,与眼前几乎一字不差。林郎中照着札记上的方子加减,救回了七个里的五个。

陈郎中来看他配药。看了很久,问:"你柜子里这些,你都记得?"

林郎中摇头:"我只记得哪种病该去哪个抽屉找。记住抽屉的位置,比记住抽屉里的东西容易得多。而且——"他顿了顿,"抽屉里的纸,今年可以换,明年也可以换。我脑子里要是装满了,反倒换不动了。"

陈郎中沉默良久,说:"我年轻的时候,师父让我背《本草》,背不出就不许吃饭。那时候没有这么多抽屉可翻。"

"师父教您的是对的,"林郎中说,"快病急症,病人等不得我翻柜子,还得靠您那样的本事。可这世道,新病一年比一年多,船一年比一年快——光靠脑子,装不下了。"

后来两人合开了一间堂。门口挂两块匾:左边写"心中有数",右边写"案上有据"。常见的、急的,陈郎中应;偏的、新的、要追根问底的,林郎中查。镇上人这才明白:原来一个好郎中的本事,不全在他记得多少,也在他知道什么时候该信自己的记性,什么时候该去翻那些抽屉。

——而最难学的,是分辨这两件事的那一瞬。

---

## Concept and Field

**Parametric vs Non-parametric Knowledge** is a foundational distinction in the *Retrieval & Long Context* cluster of LLM research. It frames the central design tension of retrieval-augmented systems: should a model's knowledge live *inside* its weights (parametric) or *outside* in a queryable corpus (non-parametric)?

## Key Mechanism

- **Parametric memory** is knowledge compressed into the model's floating-point parameters during pretraining. Access is fast (a single forward pass), gracefully interpolative, and requires no I/O — but the knowledge is *implicit*, hard to attribute, expensive to update (requires retraining or fine-tuning), and degrades for long-tail or post-cutoff facts.
- **Non-parametric memory** is knowledge held in an external store — typically a dense vector index over a corpus like Wikipedia — accessed at inference time via a learned retriever. Knowledge is *explicit*, swappable, citable, and updatable without touching model weights, but each query incurs retrieval cost and the model must learn to integrate retrieved evidence with its own priors.

Lewis et al.'s original RAG (2020) formalized the hybrid: a pre-trained seq2seq generator (parametric) conditioned on top-k passages from a DPR-style dense index (non-parametric), with two variants — RAG-Sequence (one retrieval per output) and RAG-Token (different passages per token). The trainable retriever and frozen index together form a *differentiable memory* that can be edited at the document level.

Subsequent mechanistic work (Yu et al., 2024, "Deciphering the Interplay…") used causal mediation analysis on Atlas to show that when retrieved context is relevant, RAG models route through a two-stage circuit: a *relevance gate* that decides whether to attend to context, then an *output head* biased toward copying from retrieved tokens. When both memories disagree, retrieved context typically wins — which is desirable for fresh facts but dangerous when retrieval is noisy.

## Why It Matters

The distinction underlies nearly every practical decision in modern LLM stacks: how big a base model to train, how often to refresh the index, whether to fine-tune on new data or just add it to the corpus, and how to handle knowledge conflicts. It is the theoretical scaffold behind RAG, Atlas, REALM, kNN-LM, and emerging *parametric RAG* approaches (Su et al., 2025) that inject retrieved documents directly into FFN parameters at inference time, blurring the boundary the original framing drew.

## Open Questions

- **Knowledge conflict resolution.** When parametric and non-parametric memories disagree, on what basis should the model choose? Yu et al. (2024) show empirical context-dominance, but this is exploitable by adversarial or stale retrievals.
- **The boundary is moving.** Parametric RAG (Su et al., 2025) and HippoRAG 2 (Gutiérrez et al., 2025) suggest the parametric/non-parametric split is a spectrum, not a dichotomy — knowledge can be compiled into LoRA-like patches, capsules, or transient FFN edits.
- **Continual learning.** Non-parametric memory is the current pragmatic answer to "how do LLMs keep learning?" but does not give the model the *integrative reasoning* that parametric internalization provides.

## References

- Lewis, P. et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* NeurIPS. https://arxiv.org/abs/2005.11401
- Yu, M. et al. (2024). *Deciphering the Interplay of Parametric and Non-parametric Memory in Retrieval-augmented Language Models.* https://arxiv.org/abs/2410.05162
- Su, W. et al. (2025). *Parametric Retrieval Augmented Generation.* SIGIR. https://arxiv.org/abs/2501.15915
- Gutiérrez, B. J. et al. (2025). *From RAG to Memory: Non-Parametric Continual Learning for Large Language Models.* ICML. https://arxiv.org/abs/2502.14802
