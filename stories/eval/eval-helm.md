---
id: eval-helm
cluster: eval
concept: Holistic Evaluation of Language Models (HELM)
status: done
sources:
  - https://arxiv.org/abs/2211.09110
  - https://crfm.stanford.edu/helm/
  - https://github.com/stanford-crfm/helm
  - https://crfm.stanford.edu/2025/03/20/helm-capabilities.html
generated_at: 2026-04-25
---

镇上每年办一场厨艺擂台,选出"年度名厨"。可三十年来,擂台的规矩从没统一过。

第一年,主审是位糕点师,只让选手做苹果派,谁的派最甜谁就赢。第二年换了川菜馆老板坐镇,题目变成水煮鱼,辣度压过一切。第三年来了位西餐主厨,他爱看摆盘。每位评审上任,都把自己最在意的那一味当作"厨艺"的全部。于是镇上流传着一份奇怪的英雄榜:张师傅在第七届以糖醋排骨夺魁,李师傅在第十二届靠一碗清汤封神,可两人从未在同一道菜上较量过。镇民翻着名册,谁也说不清这些名字摆在一起,究竟谁更强。

第三十一年,镇上来了位姓梁的年轻人。他不开店,只摆了一面巨大的木格墙,横向钉着四十二根木条,纵向挂着七只铜铃。

他对围观的人说:"咱们的麻烦不是评审太严,是评审太偏。每个人只摸了大象的一只脚,就嚷嚷自己摸的是整头象。"

他请来三十位大厨,每人按同一份食单,做完全部四十二道菜——从家常炒青菜到分子料理,从婚宴主菜到病号粥。每做出一道,就有七个人同时上前:第一人尝味道,第二人称分量是否如菜单所标(他说:"自己吹了几两,就得交几两"),第三人偷偷把盐罐换成糖罐,看大厨能不能稳住手艺,第四人专点穷亲戚爱吃的粗粮菜,第五人查菜里有没有夹带刻薄的话,第六人嗅油烟里有没有毒,第七人掐表看灶火烧了多久、柴薪烧了几担。

七只铜铃,七种问法。每一道菜,都要在木格墙上留下七个刻痕。

有人不服:"你这哪是比厨艺,是在为难人。我做糖醋排骨,凭什么要被挑剔成本?我做御膳,凭什么要顾穷亲戚?"

梁姓年轻人摇头:"我不是要你每一格都满分。我是要让你的强项和短处,都摆在同一面墙上,跟别人摆在同一面墙上。从前张师傅赢在甜,李师傅赢在鲜,这两件事各自都对,可没人把它们放在一起看过。一个名厨之所以是名厨,不是因为他在某一格上孤军夺魁,而是因为他三十张刻痕摊开来,人们能一眼看清——他擅长什么,牺牲了什么,贵不贵,稳不稳,毒不毒。"

他停顿一下,又补一句:"这面墙也不是终点。明年若有人发明新菜,我就加一根木条;若有人提出新的问法,我就挂一只新铃。墙是活的。"

镇民这才明白,真正难的从来不是判一道菜的高低,而是把所有名厨、所有菜式、所有问法,**摆进同一张表里**——空格不许藏,短板不许遮,然后让人自己看。

---

## Holistic Evaluation of Language Models (HELM)

**Field.** Cluster 11 — Evaluation & Benchmarks. HELM, introduced by Liang, Bommasani, Lee et al. at Stanford's Center for Research on Foundation Models (CRFM) in 2022, is a meta-benchmark and a methodology for evaluating large language models.

**Key mechanism.** HELM is built around an explicit **scenarios × metrics matrix**. The authors decompose evaluation into two axes:

1. **Scenarios** — concrete use cases defined as `(task, domain, language/dialect, who)`. The original release covered 16 core scenarios (e.g. NaturalQuestions, MMLU, NarrativeQA, TruthfulQA, RAFT) plus 26 targeted scenarios probing specific capabilities such as reasoning, disinformation, and copyright.
2. **Metrics** — seven dimensions measured *simultaneously* on each scenario whenever applicable: **accuracy, calibration, robustness, fairness, bias, toxicity, and efficiency**.

The methodological commitment is that no single number suffices: a model that wins on accuracy but is brittle under perturbation, miscalibrated, biased against dialects, or expensive to run is not unambiguously "better." HELM forces every model into the same dense grid (30 models × 42 scenarios × 7 metrics in v1.0), with all prompts, completions, and scoring released publicly. Crucially, HELM standardizes the **prompting protocol** (few-shot format, decoding parameters) so that comparisons are apples-to-apples — which is why coverage of core scenarios jumped from a prior average of 17.9% per model to 96.0%.

**Why it matters.** Before HELM, model leaderboards were a patchwork: GPT-3 reported on one set, PaLM on another, with little overlap. HELM made it possible to read trade-offs off a single matrix, and it normalized the idea that benchmarks should be **living** — versioned releases continuously add scenarios (MedHELM, AIR-Bench, HELM Capabilities 2025) and retire saturated ones. It also seeded a vocabulary (scenario, metric, taxonomy gap) that downstream benchmarks like BIG-bench, HELM-Instruct, and VHELM inherit.

**Open questions / controversies.**

- **Saturation and contamination.** Many HELM core scenarios (MMLU, HellaSwag) are now near ceiling and likely in pretraining data; the 2025 HELM Capabilities refresh is partly an admission of this.
- **What "holistic" omits.** Agentic behavior, long-horizon tool use, and multi-turn alignment are poorly captured by the static prompt-completion frame. HELM's authors acknowledge the framework is incomplete by design.
- **Metric independence is a fiction.** Robustness perturbations can change accuracy estimates; fairness and bias are operationalized narrowly (often just demographic accuracy gaps). Critics argue the seven axes are correlated and not jointly sufficient for "holistic" claims.

**Key references.**

- Liang, Bommasani, Lee, et al. (2022). *Holistic Evaluation of Language Models.* arXiv:2211.09110. <https://arxiv.org/abs/2211.09110>
- Stanford CRFM HELM project page and leaderboards. <https://crfm.stanford.edu/helm/>
- HELM open-source framework. <https://github.com/stanford-crfm/helm>
- Stanford CRFM (2025). *HELM Capabilities.* <https://crfm.stanford.edu/2025/03/20/helm-capabilities.html>
