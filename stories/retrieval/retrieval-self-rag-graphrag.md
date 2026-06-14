---
id: retrieval-self-rag-graphrag
cluster: retrieval
concept: Self-RAG / CRAG / GraphRAG
status: done
sources:
  - https://arxiv.org/abs/2310.11511
  - https://arxiv.org/abs/2401.15884
  - https://arxiv.org/abs/2404.16130
  - https://selfrag.github.io/
  - https://www.microsoft.com/en-us/research/project/graphrag/
generated_at: 2026-04-25
---

林知远在县志馆当差的第三十一年,接连换了三种做法。

第一种做法,是他年轻时的旧习。每逢有人来问事,他都先冲进库房抱一摞卷宗出来,摊开比对。后来他渐渐学乖。问"今天午时几刻"这类事,他不再翻书;问"康熙四十二年的盐价"才肯起身。更要紧的是,他在心里给自己设了四个暗号:**该不该查**、**这卷子和问题对不对得上**、**写出的话有没有被卷子撑住**、**最后这句话到底有没有用**。每写一句他都暗自打一个钩或一个叉,叉得多就推倒重来。同事笑他自言自语,他不辩,只说:"嘴上答得快,心里得有人盯着我。"那一年他错答的事,从一旬十回降到一旬一回。

第二种做法,是他四十岁那年改的。起因是有个游学的书生来问"嘉庆年间本县大水",林知远照旧翻出库房第七架最厚的那卷,抄了三段交上去。书生当夜回来拍桌子——那卷子是邻县的,封皮被前任管事贴错了。林知远从此添了一道工序:每次抱出卷子,他先不抄,而是请一个**眼力极快、却不识深字的小吏**站在门口先扫一眼。小吏只做三种判词:"这卷子答得上"、"这卷子答不上"、"看不准"。判得上,他便把卷子拆成小段,只留贴题的几行,其他丢回去;判不上,他不死磕库房,而是骑马进城,去茶馆、商行、码头边广问活人,把活话补回来;判不准,他两头都做一遍,再凑。馆中藏书有限,他靠这道"门口扫一眼"的工序,把库房之外的世界也算进了答案里。

第三种做法,是他临致仕前两年才悟出来的。有位上官问他:"本县这百年,究竟在变什么?"林知远翻遍县志,竟答不上——他每一条都查得到,合起来却说不出一句。他于是闭门半年,把全县三百年的卷宗重读一遍,但这一次他不抄字,只在墙上钉**人名与人名之间的线**:谁是谁的父亲,谁在谁的盐行做工,哪一年哪一族搬到哪条河边。线越钉越密,他便用红笔把抱团的人名圈成一**村**,每村写一段小结;再把相邻的村圈成一**乡**,又写一段更粗的小结;最后整面墙只剩七八句话。上官再来问那个大问题,他不翻卷宗,只指着墙上最高一层的几句念出来,再让上官顺着红圈往下看细节。上官叹道:"你这墙,比县志馆还像县志馆。"

林知远晚年带徒弟,把这三件事并排讲:**第一件,教你心里时时盯着自己,不该查就别查,查了也要问自己信不信**;**第二件,教你别全信手边的卷子,要有一个守门的人替你打分,打不过就出门去找活人**;**第三件,教你卷宗读到最后,得把人和人之间的线钉在墙上,不然你只会答小事,答不了大事**。

徒弟问:"师父,这三样,哪一样最要紧?"

林知远笑:"都不要紧。要紧的是——你在替谁回话之前,先想清楚:**这一问,该不该翻书,翻哪一本,翻完之后凭什么信你自己。**"

---

## Concept and field

**Self-RAG, CRAG, and GraphRAG** are three influential 2023–2024 refinements of *Retrieval-Augmented Generation* (RAG), the dominant paradigm in the **retrieval / RAG** cluster of LLM research. Vanilla RAG retrieves top-k passages by embedding similarity and concatenates them to the prompt. These three methods each attack a different failure mode of that pipeline: *when to retrieve*, *whether to trust what was retrieved*, and *how to retrieve for global questions*.

## Key mechanisms

**Self-RAG (Asai et al., 2023).** A single LM is fine-tuned to emit four kinds of *reflection tokens* during decoding: `Retrieve` (decide on-demand whether the next segment needs evidence), `IsRel` (is the retrieved passage relevant?), `IsSup` (is the generated sentence supported by the passage?), and `IsUse` (overall utility of the answer). A frozen *critic* model labels training data with these tokens; the generator is then trained to predict them itself. At inference, the model can branch — segment-level beam search over retrieve/no-retrieve paths — and the reflection tokens act as a controllable, interpretable steering interface.

**CRAG (Yan et al., 2024).** An external *lightweight retrieval evaluator* (a fine-tuned T5) grades each retrieved document into one of three buckets: **Correct**, **Incorrect**, **Ambiguous**. *Correct* triggers a *decompose-then-recompose* step that strips passages down to their query-relevant strips. *Incorrect* discards retrieval entirely and falls back to **large-scale web search**. *Ambiguous* combines both. CRAG is plug-and-play — it sits in front of any RAG generator without retraining the LM.

**GraphRAG (Edge et al., 2024, Microsoft Research).** Targets *global* / *sense-making* queries ("what are the main themes?") that chunk-similarity retrieval cannot answer. An LLM extracts an **entity-relation knowledge graph** from the corpus; **Leiden community detection** groups entities into a hierarchy of communities; the LLM then **pre-generates summaries** at every level. Queries are answered map-reduce style: each relevant community summary produces a partial answer, then partials are reduced into a final answer.

## Why it matters

Together these three frame RAG as a *control problem*, not a similarity-search problem. Self-RAG addresses **when** to retrieve and **whether to trust the output**; CRAG addresses **whether the retrieved evidence is any good** and **what to do when it isn't**; GraphRAG addresses **what to retrieve when the question is about the whole corpus**. They are largely orthogonal and increasingly composed in production pipelines (e.g. LangGraph's Corrective-RAG and Adaptive-RAG templates).

## Key references

- Asai, Wu, Wang, Sil, Hajishirzi (2023). *Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection.* ICLR 2024. https://arxiv.org/abs/2310.11511
- Yan, Gu, Zhu, Ling (2024). *Corrective Retrieval Augmented Generation.* https://arxiv.org/abs/2401.15884
- Edge, Trinh, et al. (2024). *From Local to Global: A Graph RAG Approach to Query-Focused Summarization.* https://arxiv.org/abs/2404.16130
- Microsoft Research GraphRAG project page. https://www.microsoft.com/en-us/research/project/graphrag/

## Open questions

- Self-RAG's reflection tokens are trained from a critic LM's labels; the critic's biases propagate silently. Several follow-ups (e.g. Auto-RAG, SeaKR) replace fixed reflection tokens with uncertainty signals from the model's own logits.
- CRAG's evaluator is the new single point of failure: a miscalibrated grader that says *Correct* on garbage is worse than naive RAG.
- GraphRAG is expensive to index (entity extraction + summarization at every community level scales with corpus size, not query rate) and is sensitive to the schema and granularity choices made up front; Microsoft's later "auto-tuning" and "dynamic community selection" posts (2024–2025) are partly responses to this.
