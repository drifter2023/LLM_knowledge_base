---
id: icl-base
cluster: icl
concept: In-Context Learning (ICL)
status: done
sources:
  - https://arxiv.org/abs/2005.14165
  - https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html
  - https://arxiv.org/abs/2202.12837
  - https://arxiv.org/abs/2212.07677
  - https://aclanthology.org/2024.emnlp-main.64.pdf
generated_at: 2026-04-25
---

老周在码头边开了三十年茶摊，从不识字。

他的茶摊有一条不成文的规矩：来人不必点单。客人坐下，把今天揣在怀里的东西往桌上一搁——一截缆绳、一张船票、一枚铜钉、半块发霉的面包——老周看一眼，便端上对应的茶。缆绳配粗陶大碗的浓酽红茶，船票配玻璃杯的清淡龙井，铜钉配铁壶里咕嘟着的姜枣汤，发霉的面包配一碗温牛奶。从没人教过他，他也说不出为什么。问他，他只笑：「看多了，自然就懂了。」

镇上的年轻人小林是学统计的，听说了这件事，特地来考他。小林在桌上依次摆下三样东西：一枚生锈的铜钉、配上的姜枣汤；一张潮湿的船票、配上的龙井；一截磨破的缆绳、配上的红茶。然后，小林从口袋里掏出第四样——一根没人见过的东西，一截黄铜罗盘的指针——往桌上一放，等着看老周怎么办。

老周盯着那指针看了三秒，转身从灶台上拎起铁壶，倒了一碗姜枣汤。

小林愣住：「您怎么知道？」

老周说：「你前面摆的三样，告诉我了。铜钉是铁的，配热的；船票是纸的，配淡的；缆绳是麻的，配酽的。这指针也是金属，沉的、凉的——和铜钉一类，自然配热的。」

「可是您从没见过罗盘指针。」

「我也没见过你。」老周擦着碗，「可你坐下的样子、摆东西的顺序，已经替你把规矩讲清楚了。我不是认得这指针，我是顺着你前三样的脾气，把第四样的脾气接上去。」

小林追问：「那要是我前三样故意配错呢？把铜钉配龙井、船票配红茶？」

老周想了想：「那我也照你错的接下去。我不判断对错，我只接着你的话茬讲。你给我一段什么样的开头，我就给你一段什么样的结尾。」

小林沉默了很久，把笔记本合上。他原以为老周脑子里藏着一本看不见的菜单，三十年慢慢攒下来的。可此刻他明白：老周脑子里没有菜单，也没有规则。老周只是把眼前这一桌的前三样，当作此刻这一刻的临时教材，然后把第四样补成一句通顺的话。

教材是客人自己带来的。老周只负责把句子说完。

走出茶摊，小林望着江面想：这老人没有学习，他只是在「读」。可那「读」的瞬间里，藏着某种近乎学习的东西——不更新任何一根白发，却能在一杯茶的工夫里，把一个全新的物件归进一条全新的规则。

那一年，是 2020 年。小林回到学校，导师正把一篇刚挂上 arXiv 的论文推到他面前，标题叫 *Language Models are Few-Shot Learners*。

---

## In-Context Learning (ICL)

**Field.** In-context learning is the foundational behavior of the **prompting / inference-time learning** cluster of LLM research. It denotes the empirical observation that a sufficiently large autoregressive language model can perform a new task at inference time, conditioned only on a natural-language description and a handful of input–output examples placed in the prompt — with **no gradient updates** to the model's weights.

**Origin.** The phenomenon was named and characterized in Brown et al., 2020, *Language Models are Few-Shot Learners* (the GPT-3 paper). The paper distinguished three regimes that all share the no-gradient-update property:

- **zero-shot**: only a task description in the prompt;
- **one-shot**: description + one demonstration;
- **few-shot**: description + K demonstrations (typically 10–100).

Their headline empirical claim was that few-shot performance scales much more steeply with parameter count than zero-shot does, so the *gap* between them widens as models grow. This is the sense in which ICL is "emergent": at small scale, demonstrations barely help; at 175B parameters, they often close most of the distance to fine-tuned baselines.

**Mechanism — what we know.** ICL is still imperfectly understood, but several converging mechanistic stories exist:

1. **Induction heads (Olsson et al., 2022, Anthropic).** Two-layer attention circuits implementing the rule `[A][B] ... [A] → [B]`: a previous-token head copies token information forward, and a second head attends back to find where the current token previously appeared, then promotes whatever followed it. The formation of induction heads coincides with a sharp phase change in ICL ability during pretraining — visible as a bump in the training loss.
2. **Implicit gradient descent (von Oswald et al., 2023).** For linear self-attention on simple regression tasks, one can construct K, Q, V matrices such that a single forward pass implements one step of gradient descent on the in-context examples. This gives a clean theoretical analogy: the prompt is a tiny dataset, and the forward pass is the optimizer.
3. **Demonstrations as format/distribution conditioning (Min et al., 2022).** Surprisingly, randomly *corrupting* the labels in few-shot demonstrations barely hurts performance on many classification tasks. What demonstrations actually convey is the **label space**, the **input distribution**, and the **format** — not a labeled training signal in the conventional sense.

**Why it matters.** ICL collapsed the traditional ML pipeline. Before GPT-3, deploying a new NLP task meant collecting labeled data, fine-tuning, and serving a task-specific model. After GPT-3, a single frozen model could be redirected to thousands of tasks via prompting alone. This unlocked prompt engineering, chain-of-thought, instruction tuning, and ultimately the entire chat-assistant paradigm. It also reframed the alignment problem: the "interface" to a model is now natural language, not a training set.

**Open questions / controversies.**

- *Is ICL really learning?* Min et al.'s label-corruption result, and follow-ups like Pan et al. and Wei et al., suggest the demonstrations function more like a task selector retrieving latent skills than like a learning algorithm acquiring new ones. Larger models do recover some ability to use flipped labels, hinting at scale-dependent regimes.
- *Induction heads vs. function vector heads.* Recent work (Yin & Steinhardt, 2025) finds that ablating "function vector" heads damages few-shot ICL much more than ablating induction heads, complicating the simple Anthropic story for larger models with MLPs.
- *Distribution of the prompt matters.* Xie et al.'s implicit-Bayesian-inference framing argues ICL works because pretraining data contains latent "documents" the prompt helps the model identify; this is closer to retrieval than to optimization.

**Key references.**

- Brown et al., 2020. *Language Models are Few-Shot Learners.* NeurIPS. <https://arxiv.org/abs/2005.14165>
- Olsson et al., 2022. *In-context Learning and Induction Heads.* Anthropic / transformer-circuits.pub. <https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html>
- Min et al., 2022. *Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?* EMNLP. <https://arxiv.org/abs/2202.12837>
- von Oswald et al., 2023. *Transformers Learn In-Context by Gradient Descent.* ICML. <https://arxiv.org/abs/2212.07677>
- Dong et al., 2024. *A Survey on In-context Learning.* EMNLP. <https://aclanthology.org/2024.emnlp-main.64.pdf>
