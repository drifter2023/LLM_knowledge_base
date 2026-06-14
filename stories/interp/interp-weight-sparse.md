---
id: interp-weight-sparse
cluster: interp
concept: Weight-Sparse Transformers
status: done
sources:
  - https://arxiv.org/abs/2511.13653
  - https://arxiv.org/html/2511.13653v1
  - https://www.marktechpost.com/2025/11/14/openai-researchers-train-weight-sparse-transformers-to-expose-interpretable-circuits/
  - https://www.marktechpost.com/2025/12/13/openai-has-released-the-circuit-sparsity-a-set-of-open-tools-for-connecting-weight-sparse-models-and-dense-baselines-through-activation-bridges/
generated_at: 2026-04-25
---

镇上的电报局年久失修。新来的局长姓沈,是个学过电机的年轻人。他第一次走进机房,只看见一面爬满了铜线的木墙——三千多根线,像被风吹乱的头发,缠在一起,从屋顶垂到地板。每一根都连着别的几十根,谁也说不清哪一根负责传"火警",哪一根负责传"婚讯"。老局长在退休前留下一句话:"线越多,镇子收发得越准,可一旦出了岔子,你谁也找不出来。"

沈局长想做一件从未有人做过的事:他要让这面墙"瘦下来"。

他召集了镇上的接线员,定下一条新规矩。每天傍晚收工前,每人盯着自己负责的那一束线,只准留下"今天真正传过最响那几下"的几根,其余一律剪掉。第一天,他们剪掉了一半;第二天,又剪掉一半;一个月之后,三千根线只剩不到五根能用。

镇民们起初抱怨。婚讯传得慢了,火警有时要重发两遍。沈局长在账本上记下:**通讯能力下降了一些**。但他不肯松手。他对接线员说:"再忍忍,我们要看见的是另一样东西。"

果然,到了第三个月,机房里出现了奇景。墙上只剩稀稀落落的几根铜丝,但每一根都笔直、清晰、独自承担一件事。一位老接线员指着墙角一根细线惊呼:"你看,这根只在有人发引号的时候颤动!"再看旁边一根:它专门区分单引号和双引号——单引号一来,它向下偏;双引号一来,它向上偏。再往上十层楼,有一台中继器,每当下面那根"引号探测线"颤动,它就回头去找最近一次同样颤动的位置,把那里的"单/双"信号原样复制过来,贴到当前位置。

——这正是镇上"补全闭引号"的全部秘密。从前藏在三千根线的混响里,如今只用十二个节点、九条连线,就能在一张纸上画完。

沈局长把这张图钉在墙上,请镇长来看。镇长皱眉:"可你们的电报变慢了。"沈局长答:"是的。可从前出了错,我们要拆掉整面墙才能找。现在,谁要是怀疑哪封电报传错了,顺着这九条线走一遍,半小时之内就能指出是哪一根铜丝在撒谎。"

镇长沉默良久,问:"那更复杂的消息呢?比如商队的密押、外乡人的方言?"沈局长老实地说:"那些线我还没剪干净。剪得越狠,机器越蠢;留得越多,真相越藏。我每天都在这两头之间走钢丝。"

后来,沈局长又做了一件事:他在新机房和旧机房之间架了几座**短桥**,让两边的信号可以互译。这样,旧机房依然替镇子飞快地干活,而每当有人想知道"它刚才到底想了什么",就把那一刻的信号搬到新机房,顺着九条干净的铜丝走一遍——黑箱由此被翻译成了线路图。

---

## Concept and field

**Weight-Sparse Transformers** sit in the **mechanistic interpretability** cluster. The work asks a structural question: instead of trying to *reverse-engineer* a fully dense network after the fact, can we *train* a network whose weights are so sparse that its computation graph is humanly legible to begin with?

## Key mechanism

OpenAI's November 2025 paper "Weight-sparse transformers have interpretable circuits" (arXiv:2511.13653) trains GPT-2-style decoder-only transformers under an extreme L0 constraint: after every AdamW step, all but the top-k largest-magnitude entries of each weight matrix (including embeddings and biases) are zeroed out. The L0 budget is annealed linearly across the first 50% of training, with a 1/√L0 learning-rate adjustment to keep optimization stable. At the most aggressive setting roughly **1 in 1,000 weights** remain non-zero.

To recover circuits, the authors prune the already-sparse model to the minimal subgraph that solves a hand-crafted task (e.g. closing a Python string with the matching quote type). The canonical example: in layer 0, one MLP neuron fires on both quote types ("quote detector"); a second neuron's sign distinguishes single from double quotes ("quote-type classifier"). A layer-10 attention head uses the detector as its key and the classifier as its value, attending back to the opening quote position and copying the type forward. The full circuit is **12 nodes, 9 edges**, validated by mean-ablation: deleting it destroys the behavior; keeping only it preserves the loss.

A follow-up release ("circuit-sparsity", December 2025) introduces **activation bridges** — small encoder/decoder maps trained jointly on a normalized-MSE plus two KL terms, letting representations from a dense production model be translated into the sparse model's coordinate system, so that interpretable steering on the sparse side propagates back.

## Why it matters

The headline empirical result: at matched pretraining loss, sparse-model circuits are roughly **16× smaller** than circuits extracted from dense baselines. This makes sparsity a structural prior for interpretability, complementary to post-hoc dictionary methods (SAEs, transcoders). Crucially, scaling **width** while holding L0 fixed pushes the entire **capability–interpretability frontier** outward — disentanglement does not have to come at the cost of capability forever.

## Open questions and controversies

- **Compute cost.** Unstructured sparsity has no good hardware support; the authors report 100–1000× the FLOPs of a dense model of equivalent quality. Frontier-scale weight-sparse training is currently impractical.
- **Scaling ceiling.** The authors explicitly flag that "scaling sparse models beyond tens of millions of nonzero parameters while preserving interpretability remains a challenge." Tasks beyond simple Python algorithmics (e.g. variable-type tracking) yield only partially understood circuits.
- **Faithfulness of the metric.** Circuit compactness is a proxy for interpretability, not a definition of it. Polysemantic features still appear, and mean-ablation may overstate mechanistic completeness.
- **Relationship to SAE-based interpretability.** Whether weight sparsity *replaces* dictionary learning or merely *complements* it is unsettled; the activation-bridge release suggests OpenAI sees it as complementary infrastructure rather than a substitute.

## Key references

- Gao et al., "Weight-sparse transformers have interpretable circuits," OpenAI, arXiv:2511.13653 (Nov 2025). https://arxiv.org/abs/2511.13653
- OpenAI, "Understanding neural networks through sparse circuits" (Nov 2025). https://openai.com/index/understanding-neural-networks-through-sparse-circuits/
- OpenAI, `circuit_sparsity` codebase + activation-bridge release (Dec 2025). https://github.com/openai/circuit_sparsity
