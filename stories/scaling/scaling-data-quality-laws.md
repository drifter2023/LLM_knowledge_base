---
id: scaling-data-quality-laws
cluster: scaling
concept: Data Scaling & Quality Laws
status: done
sources:
  - https://arxiv.org/abs/2406.11794
  - https://arxiv.org/abs/2406.17557
  - https://arxiv.org/abs/2404.07177
  - https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1
generated_at: 2026-04-25
---

老周在城南开了三十年酒坊。年轻时他信一句话："米要多，缸要大。"凡有送米来的车,他一律照单全收,糙的、碎的、霉点的、他都让伙计倒进同一口大缸,觉得反正发酵的力气在那儿,杂味终会被时间盖过。

到第二十年,他发现一个奇怪的现象。城北新开的小坊,缸只有他三分之一大,出酒却比他清冽。他派儿子小周去偷师。小周回来说,人家不是用缸大小决胜负——是用筛子。

"什么样的筛子?"

"他们先用一只小酒坛酿一锅试试。每来一车米,先取一捧,用同样的曲、同样的水、同样的火候,在小坛里走完整个流程。开坛那天请几位老酒客盲品,记下分数。分数高的那车米,才许进大缸;分数低的,退回去。"

老周冷笑:"试一坛要七天。一年才几车米能进缸?"

小周摇头:"师傅,他们不是用人嘴去尝每一车。他们尝过几百车之后,挑出一个最会品酒的小学徒——那学徒尝多了,渐渐能光看米粒、闻一闻生米的气,就猜出最后小坛的分数,八九不离十。从那以后,大批的米,由学徒一人在码头当场判,过得了他这一关,才许卸货。"

老周还是不服:"米总是越多越好。"

小周这次说了一句让老周怔住的话:"师傅,城北的人前年还做过一件怪事。他们把同一车顶级好米,反复用了五次——每次都进缸——结果第五次出的酒,比头一次差远了。好米也会'累'。所以他们后来定了一个规矩:今年要烧多少缸酒、要烧多久,先算清楚;然后倒推该收多少顶级米、多少二等米、多少寻常米——配比是跟着窑火的总量走的,不是跟着米仓的偏好走的。"

老周一夜没睡。第二天他做了三件事:一,把库里那堆来历不明的陈米清掉一大半;二,雇了城里最有名的一位老酒客,让他陪着一个机灵的小伙计,在码头上"传嘴";三,把今年要烧的酒数贴在墙上,按这个数,算米。

那一年,他的缸缩小了,但出的酒,头一次有人愿意花高价订走。临老,他把这套规矩写在木板上,挂在酒坊门口,只有十二个字:

**"米不在多,在筛;筛随火走,勿贪。"**

---

## Concept and Field

**Data Scaling & Quality Laws** sit inside the *scaling* cluster of LLM research. Where the original Kaplan/Chinchilla scaling laws fixed dataset *quantity* as the relevant axis, a 2024 wave of work — anchored by **DataComp-LM (DCLM)** and **FineWeb** — argues that *which* tokens you train on is at least as consequential as *how many*, and that the optimal curation policy itself depends on the compute budget.

## Key Mechanism

Three ideas interlock:

1. **Empirical, ablation-driven curation.** Both DCLM and FineWeb treat the data pipeline as a benchmark: hold the model architecture, optimizer, and token budget fixed; vary one filtering / dedup / mixing choice; train a small proxy model; measure on a downstream suite (53 tasks for DCLM, MMLU/ARC/HellaSwag for FineWeb). Decisions are accepted only if they improve the proxy. This replaces heuristic "looks clean" filters with measured causal claims.

2. **Model-based filtering as the dominant lever.** DCLM's strongest finding is that a learned quality classifier (fastText trained on OpenHermes / ELI5-style positives vs Common Crawl negatives) dominates rule-based heuristics. FineWeb-Edu uses Llama-3-70B to label educational quality, then distills the labels into a small classifier that scores all 15T tokens. The classifier is the "apprentice on the dock" who imitates an expensive grader.

3. **Curation is not compute-agnostic (Goyal et al., 2024).** High-quality subsets have steeply diminishing utility under repetition: once you've trained for enough epochs that the premium pool is revisited many times, adding lower-quality unseen tokens beats re-using clean ones. Optimal filter aggressiveness therefore *decreases* as training compute grows. This breaks the implicit assumption that "the best dataset" is a property of the data alone.

## Why It Matters

DCLM-Baseline reaches 64% MMLU at 7B with 2.6T tokens, matching Llama-3-8B with ~6.6× less compute, purely through curation. FineWeb-Edu shows that an open, documented pipeline can beat closed industrial corpora on reasoning benchmarks. Together they reframe pretraining: data is a *designed* artifact with its own scaling exponents, not a passive substrate.

## Open Questions

- **Benchmark overfitting of filters.** Classifiers trained against MMLU-style positives may inflate exactly the benchmarks used to validate them; whether the gains transfer to truly held-out capabilities is unsettled.
- **Compute-dependent optima.** Goyal et al.'s claim that frontier-scale runs should *loosen* filters has not been replicated at 100B+ parameter scale in public.
- **Synthetic and licensed data.** Neither DCLM nor FineWeb addresses the next frontier — when web is exhausted, do quality laws derived from CommonCrawl still describe synthetic / book / code mixtures?

## References

- Li, J. et al. (2024). *DataComp-LM: In search of the next generation of training sets for language models.* arXiv:2406.11794. https://arxiv.org/abs/2406.11794
- Penedo, G., Kydlíček, H., Ben Allal, L., Lozhkov, A., Mitchell, M., Raffel, C., Von Werra, L., & Wolf, T. (2024). *The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale.* arXiv:2406.17557. https://arxiv.org/abs/2406.17557
- Goyal, S., Maini, P., Lipton, Z. C., Raghunathan, A., & Kolter, J. Z. (2024). *Scaling Laws for Data Filtering — Data Curation cannot be Compute Agnostic.* CVPR 2024 / arXiv:2404.07177. https://arxiv.org/abs/2404.07177
- Hugging Face FineWeb blogpost (2024). https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1
