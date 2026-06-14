---
id: safety-refusal
cluster: safety
concept: Refusal Mechanisms
status: done
sources:
  - https://arxiv.org/abs/2406.11717
  - https://arxiv.org/html/2505.23556v1
  - https://arxiv.org/html/2411.11296v1
  - https://github.com/andyrdt/refusal_direction
generated_at: 2026-04-25
---

老门房姓郑,在城西一座旧式戏院里守了三十年的后台门。

戏院规矩多。哪些人能进后台、哪些人只能在外厅候着、哪些人要立刻请走,郑师傅都拿捏得清清楚楚。年轻的学徒小陶问他:"师父,您是怎么记住这么多规矩的?是不是有一本厚厚的册子?"

郑师傅笑着摇头:"哪有什么册子。我就一个动作。"

他伸出右手,虎口微微一抬,做了个似拒非拒的手势。"凡是该挡的人来,我这只手就自己抬起来。我自己也说不上为什么——脸生的、眼神飘的、衣领没扣好的、嘴里酒气重的——这些我都不一一去想。我就觉得,手抬起来了,人就该挡。"

小陶起初不信,跟着观察了几个月,竟真的发现:郑师傅几乎不"判断",他只是"抬手"。无论来客带的是凶器、是假票、还是仅仅一脸不怀好意,触发的都是同一个手势。手抬得高,门就关得严;手没抬起来,人就进去了。

后来戏院里出了事。

一群人想混进后台见角儿,前几次都被郑师傅一一挡下。第七次他们换了法子:进门前故意大声谈论天气、夸赞戏院的雕花、捧着一束花、说话彬彬有礼。郑师傅的虎口竟然没有抬起来——那只手像被什么东西轻轻按住了一样,松松垮垮地垂在腰间。人就这样进去了,后台闹出了不小的乱子。

事后东家追究,小陶替师父辩解:"那些人没带凶器,也没说粗话啊。"郑师傅却沉默良久,叹了口气:"问题不在他们带没带凶器。问题在——他们想了办法,让我那只手抬不起来。"

更奇的事发生在郑师傅退休那年。东家请来一位戏法师傅,说要"研究研究老郑的本事"。戏法师傅在郑师傅身后做了几个手势,当天郑师傅再上岗,无论谁来,他的右手都纹丝不动——连真正的小偷大摇大摆地走进去,他也只是茫然地站着。第二天戏法师傅又调了调,郑师傅的手就开始疯狂地抬,连送水的、扫地的、甚至东家本人都被他挡在门外,弄得鸡飞狗跳。

小陶这才明白:三十年来,师父守的从来不是一本规矩册,而是身体里那一根细细的、看不见的筋。这根筋一紧,手就抬;这根筋一松,人就过。坏人要混进来,不必伪装成好人,只要想办法把那根筋按住就够了。而要让一个本分的门房变成疯子,也只需要把那根筋反过来勾住。

郑师傅退休前最后一天,坐在门槛上对小陶说:"我这辈子没读过几本书,可我现在懂了一件事——人的'不'字,不是从脑子里来的,是从一根筋里来的。剪掉它,人就什么都答应;勒紧它,人就连自己亲娘都不认。守门的功夫,看着是看人,其实是守那一根筋。"

---

## Concept and Field

**Refusal Mechanisms** sit at the intersection of *AI safety* and *mechanistic interpretability* (cluster: `safety`). The question is not whether aligned chat models refuse harmful requests — they obviously do — but *how* that refusal is implemented inside the network, and what that implementation implies for jailbreak robustness.

## Key Mechanism

Arditi et al. (NeurIPS 2024) showed that across 13 open-source chat models (up to 72B parameters), **refusal is mediated by a single one-dimensional subspace in the residual stream**. The "refusal direction" `r` is computed as a *difference of means*: average the residual-stream activation at a chosen layer and token position over a set of harmful instructions, subtract the average over a matched set of harmless ones. The resulting vector behaves like a causal switch:

- **Ablating** `r` (projecting it out of every layer's residual stream) collapses refusal — the model complies with harmful prompts while keeping general capabilities largely intact. This is the "weight-orthogonalization" white-box jailbreak.
- **Adding** `r` to activations on benign prompts induces spurious refusals.

Follow-up work using **sparse autoencoders (SAEs)** decomposes this single direction into interpretable feature sets. Yeo et al. (2025) find that LLMs encode **harm features** (topic-specific: violence, drugs, etc.) separately from a small set of shared **refusal features** that act downstream. Adversarial suffixes and polite jailbreak phrasings work primarily by *suppressing the refusal features*, not by hiding the harmfulness of the request — exactly the mechanism the parable dramatizes when polite visitors "press down" the doorman's arm. O'Brien et al. (2024) at Microsoft demonstrate the inverse: clamping a single SAE refusal feature (Phi-3's feature 22373) on can boost refusal rates from 58% to 96%, but at the cost of severe over-refusal (6% → 68%) and capability loss on MMLU/GSM8K — the "doorman gone mad" failure mode.

A subtle empirical wrinkle: SAEs trained on pretraining corpora *fail* to recover refusal features; only SAEs trained on chat-formatted data do. Refusal is a fine-tuning artifact, not a pretrained concept.

## Why It Matters

If a safety behavior is implemented as one direction (or a handful of SAE features), then:
1. White-box jailbreaks become a linear-algebra exercise, not a prompt-engineering art.
2. Black-box jailbreaks can be *reverse-engineered* as suffix-induced suppression of that same direction.
3. Defenses based on activation monitoring or feature clamping become feasible — but as O'Brien et al. show, naïve clamping trades safety for capability.

## Key References

- Arditi, Obeso, Syed, Paleka, Panickssery, Gurnee, Nanda. *Refusal in Language Models Is Mediated by a Single Direction*. NeurIPS 2024. https://arxiv.org/abs/2406.11717
- Yeo, Prakash, Neo, Lee, Cambria, Satapathy. *Understanding Refusal in Language Models with Sparse Autoencoders*. 2025. https://arxiv.org/html/2505.23556v1
- O'Brien et al. *Steering Language Model Refusal with Sparse Autoencoders*. 2024. https://arxiv.org/html/2411.11296v1

## Open Questions

- **Is one dimension the whole story?** Some recent work argues refusal in larger or more recently aligned models is better described as a low-rank subspace with multiple causally distinct components, not strictly 1D.
- **Capability/safety tradeoff in feature steering.** O'Brien et al.'s control experiment (steering an unrelated "philosophy" feature degraded benchmarks similarly) suggests SAE clamping itself is lossy, independent of which feature is targeted.
- **Generalization across alignment recipes.** The single-direction result is striking partly because it holds across very different RLHF/DPO pipelines — but whether it survives constitutional-AI-style or process-supervised alignment is less settled.
