---
id: retrieval-rag-failures
cluster: retrieval
concept: RAG Failure Modes
status: done
sources:
  - https://arxiv.org/abs/2307.03172
  - https://arxiv.org/abs/2302.00093
  - https://arxiv.org/abs/2402.07867
  - https://arxiv.org/abs/2309.01431
generated_at: 2026-04-25
---

老郑做了三十年的判官，最自豪的不是断过多少奇案，而是手下那一排卷宗柜。每当一桩新案子递上堂来，他不急着问话，先让书吏小赵从柜子里抽出"相关旧档"摞在案头，再据此发落。城里人都说，老郑断案，七分靠柜子，三分靠脑子。

后来老郑老了，眼花，案头的卷宗越摞越高。

这年春天，城东死了一个绸缎商。小赵照例去抽档，抽得很卖力，一口气抱来二十卷。老郑翻第一卷，是十年前另一桩绸缎商的命案，凶手是伙计；他点点头。翻到第十卷、十二卷的时候，他眼皮已经垂下去了，只看了个标题就翻过。第十一卷里，其实白纸黑字记着："死者前夜与债主在西巷争执"——这本是破案的关键，却恰好被压在中间，老郑没看见。最后他翻到第十九卷，是一桩与本案毫不相干的婆媳口角，里头有人骂"伙计偷钱"。老郑精神一振，提笔判道：伙计行凶，秋后问斩。

伙计的娘在堂下哭瘫了。

事情没就此完。城里有个落魄秀才，姓汪，欠了绸缎商一大笔赌债。绸缎商一死，他本该是头号嫌犯。可汪秀才聪明，他没去毁尸灭迹，他去找了小赵。

小赵是个老实人，但俸禄微薄。汪秀才请他喝了三回酒，塞给他一沓银票，求他做一件小事：往柜子里悄悄添几份"旧档"。这些旧档纸张做旧，印鉴齐全，内容也写得四平八稳——只在不起眼处提了一句："本城绸缎行历来由伙计内斗，与外人无涉。"

汪秀才连原档都没动。他只是让柜子里多出几份看似平平无奇的旁证。

下一桩绸缎案发，小赵照例抽档。他不是故意的，但那几份新添的卷宗，恰好和案情字面上对得最齐——"绸缎"、"伙计"、"内斗"——于是被抽了上来，一并摞在老郑案头。老郑翻着翻着，越翻越觉得"伙计内斗"是个贯穿数十年的旧规律，落笔时分外笃定。

汪秀才又一次脱身。

第三年，朝廷派了个年轻巡按下来复查旧案。巡按不翻柜子，他只问老郑一句话："您这柜子里的卷宗，是您断案的依据，还是您断案的来源？"

老郑愣住了。

巡按说：判官的脑子，本该是火；柜子里的纸，本该是柴。如今您把火熄了，光烧柴——柴堆里压着的关键，您看不见，叫"中间的盲点"；柴堆里夹着的废纸，您也烧，叫"无关的烟雾"；更糟的是，有人往柴堆里掺了浸过油的假柴，您闻不出，烧出来的判词，正合他意，这叫"被人下了药"。三样毛病凑在一起，柜子越大，您错得越离谱。

老郑那一夜把自己关在屋里，对着满柜的纸出神。第二天他叫小赵把柜子上锁，自己重新去问案子里每一个活人。

---

## RAG Failure Modes

**Field.** Retrieval-Augmented Generation (RAG), within the broader retrieval/grounding cluster of LLM systems research. RAG augments a generator with documents fetched from an external corpus at inference time; the failure modes below describe the characteristic ways this pipeline breaks even when each individual component looks healthy.

**Three canonical failure modes.**

1. **Lost in the middle (positional neglect of retrieved evidence).** Liu et al. (2023) show that decoder-only LLMs attend to the head and tail of a long context far more reliably than to the middle. On multi-document QA and key–value retrieval, accuracy traces a U-shape as the gold passage's position varies, and the curve does not flatten even for explicitly long-context models. In RAG this means a top-k retriever can place the right passage in front of the model and still see it ignored if it lands at rank 5 of 20.

2. **Distraction by irrelevant context.** Shi et al. (ICML 2023) introduce GSM-IC, grade-school math problems with semantically related but logically irrelevant sentences inserted. Adding such distractors degrades chain-of-thought accuracy substantially across PaLM, GPT-3.5, and Codex; the drop is monotonic in the number of distractors. Self-consistency decoding and explicit "ignore irrelevant information" instructions help but do not close the gap. RAG is structurally exposed to this failure because dense retrievers routinely return topically-similar-but-answer-free passages (the "relevant noise" category in benchmarks like RGB, Chen et al. 2024).

3. **Context (knowledge) poisoning.** Zou et al. (PoisonedRAG, USENIX Security 2025) formulate corpus-side attack as an optimization: craft a small number of texts that (a) are retrieved for a target query and (b) steer the generator to an attacker-chosen answer. With as few as five injected passages in a corpus of millions, they achieve ~90% attack success across multiple retrievers and LLMs. CorruptRAG and follow-ups push this to single-document attacks. Alignment training does not block it, because RLHF targets prompt inputs rather than retrieved content the model has been told to trust.

**Why it matters.** These three modes explain why naive RAG plateaus far below its retrieval ceiling: even when recall@k is high, generation accuracy is bounded by positional bias, distractor sensitivity, and corpus integrity. Practical responses include reranking and packing the gold passage at the head/tail (mitigating #1), training-time exposure to noisy contexts and grounded-attribution objectives (mitigating #2), and provenance/consistency filters plus retrieval signing for #3. Benchmarks such as RGB (Chen et al. 2024) decompose RAG evaluation along exactly these axes — noise robustness, negative rejection, information integration, counterfactual robustness — to make the failure modes individually measurable.

**Open questions.** Whether long-context models trained with explicit middle-position objectives genuinely overcome lost-in-the-middle, or merely shift the U-curve; whether any defense generalizes against poisoning attacks that adaptively optimize against the defender; and how to disentangle parametric vs. retrieved knowledge when they conflict (the "counterfactual robustness" axis).

## References

- Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). *Lost in the Middle: How Language Models Use Long Contexts.* TACL 2024 / arXiv:2307.03172. https://arxiv.org/abs/2307.03172
- Shi, F., Chen, X., Misra, K., Scales, N., Dohan, D., Chi, E., Schärli, N., & Zhou, D. (2023). *Large Language Models Can Be Easily Distracted by Irrelevant Context.* ICML 2023. https://arxiv.org/abs/2302.00093
- Zou, W., Geng, R., Wang, B., & Jia, J. (2024/2025). *PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models.* USENIX Security 2025 / arXiv:2402.07867. https://arxiv.org/abs/2402.07867
- Chen, J., Lin, H., Han, X., & Sun, L. (2024). *Benchmarking Large Language Models in Retrieval-Augmented Generation* (RGB). AAAI 2024 / arXiv:2309.01431. https://arxiv.org/abs/2309.01431
