---
id: scaling-emergent-abilities
cluster: scaling
concept: Emergent Abilities
status: done
sources:
  - https://arxiv.org/abs/2206.07682
  - https://arxiv.org/abs/2304.15004
  - https://www.jasonwei.net/blog/emergence
  - https://proceedings.neurips.cc/paper_files/paper/2023/file/adc98a266f45005c403b8311ca7e8bd7-Paper-Conference.pdf
generated_at: 2026-04-25
---

老周在镇上开了家锁匠铺，铺子后院养着一群学徒。他收徒有个怪规矩：每教一招，必让学徒在一面铁门前试手。门上挂十把锁，全开才算过关，差一把都判作"不会"。

最小的徒弟阿丑，七岁，连铜片都捏不稳。老周教他听簧、捻丝、走针，他听着听着就睡着了。每月一次试门，十把锁，阿丑一把都开不了。账本上写：不会。

第二年来了阿乙，十二岁，手指灵巧些。老周一样地教，一样地试。阿乙能把第一把锁的弹子推到位，但推不到底；能听见第二把的回响，但找不准方向。十把锁，他还是一把都开不了。账本上写：不会。

阿丙十六岁来，已经能独自走完前三把锁的七成路程了。可第三把的最后一颗弹子他总差那么半毫，第四把更不必说。十把里，依然零把。账本上写：不会。

直到阿丁进门那年，他十九，手稳，耳清。试门那天，他从第一把开到第十把，"咔、咔、咔"，一气呵成。围观的镇民惊呼："这孩子是天才！前面三个学徒苦练数年一无所获，他一来就全开了——这门手艺，原来是要等到某个岁数才会突然降临的！"

老周不说话。当晚他把账本翻给来访的教书先生看。教书先生看了半晌，问："师傅，您这试门，为什么非要十把全开才算数？"

老周说："门是这么造的。开不全，门就不开。"

教书先生说："我明白门是这么造的。可您账本上记的是徒弟的本事，不是门的脾气。阿丑那年，您若让他单试一把，他能推动几颗弹子？阿乙能听清几声回响？阿丙离第三把的最后半毫有多近？这些您都没记。您只记了'不会'。"

老周怔住。

教书先生取过笔，重画一张表。横轴是徒弟的年岁与练习的时辰，纵轴不再是"开了几把门"，而是"摸到了多少颗弹子的正位"。阿丑零点二，阿乙一点八，阿丙四点九，阿丁九点七。四个点连起来，是一条平滑上扬的弧线，没有任何一处突兀的跳跃。

"师傅，"教书先生说，"您看见的那一声'咔'，不是天降神通，是您把尺子做成了悬崖。徒弟其实在一寸一寸地走，是您的门，把这一寸走成了'有'与'无'。"

老周望着那条弧线，沉默良久，把账本合上。

第二天，他在铁门旁多挂了一只盘子，盘上摆着十颗小小的铜弹子。每个学徒试完门，他便把当天能推到位的弹子一颗颗摆进盘里。

镇上还在传"阿丁是天才"的故事。但老周知道，弹子盘里那条慢慢长高的小山，才是真正的本事。

---

## Concept and Field

**Emergent Abilities** in large language models, within the **scaling** cluster of LLM research. The term was popularized by Wei et al. (2022), who defined an ability as *emergent* if "it is not present in smaller models but is present in larger models" — the hallmark being a sharp, phase-transition-like jump in task performance at some critical parameter / compute / data scale, rather than the smooth power-law curves predicted by the Kaplan/Hoffmann scaling laws.

## Key Mechanism (and the Counter-Mechanism)

Wei et al. catalogued dozens of such jumps. Examples: 3-digit arithmetic appearing around GPT-3 13B and 4–5-digit arithmetic at 175B; chain-of-thought prompting becoming useful only around LaMDA 68B; MMLU subjects flipping from chance to competence between Chinchilla 7B and 70B; ~25 BIG-Bench tasks emerging only at PaLM 540B. Plotted on a log-x scale-vs-accuracy axis, these look like flat-then-cliff curves, suggesting a qualitative regime change in the model.

Schaeffer, Miranda, and Koyejo (NeurIPS 2023, Outstanding Paper) argued the cliff is, in large part, an artifact of **metric choice plus thin test sets**. Their claim has two pieces:

1. **Discontinuous metrics manufacture discontinuities.** Exact-match accuracy on a multi-step task (e.g. integer addition) requires *every* token correct; per-token error rate may be falling smoothly with scale, but raised to the k-th power it stays near zero until it suddenly isn't. Swap to a continuous metric (token edit distance, Brier score, log-likelihood) on the *same model outputs* and the curve becomes smooth and predictable.
2. **Sparse evaluation hides gradual progress.** With too few test examples, small but real improvements at intermediate scales are statistically invisible, reinforcing the illusion of nothing-then-something.

So the mechanism, on the strong-emergence reading, is some genuine inductive-bias phase transition inside the network; on the Schaeffer reading, it is a measurement geometry effect on top of an underlying smooth capability curve.

## Why It Matters

If emergence is real, scaling laws are radically incomplete: capability forecasting, deployment safety, and dangerous-capability evaluations all have to assume that new behaviors can appear without warning. If emergence is largely a mirage, capability forecasting becomes far more tractable — you simply pick a continuous metric and extrapolate. The empirical reality, by 2025, sits between: many "emergent" curves do flatten under better metrics, but a residue of genuine threshold effects (notably in multi-step reasoning and tool use under RL fine-tuning) remains contested.

## Open Questions / Controversies

- Schaeffer et al. (2023) is the canonical critique and must be read alongside Wei et al. The reviewer should verify it is cited as the *metric-artifact* hypothesis, not as a refutation of all emergence.
- Even on continuous metrics, some tasks show genuinely sigmoidal scaling; whether these count as "emergence" depends on definitional taste.
- Post-training emergence (instruction tuning, RLHF, RLVR) is a separate phenomenon where capabilities appear without parameter scaling, and is not what the 2022 paper measured.

## References

- Wei, J., Tay, Y., Bommasani, R., et al. (2022). *Emergent Abilities of Large Language Models.* arXiv:2206.07682. https://arxiv.org/abs/2206.07682
- Schaeffer, R., Miranda, B., & Koyejo, S. (2023). *Are Emergent Abilities of Large Language Models a Mirage?* NeurIPS 2023 (Outstanding Paper). https://arxiv.org/abs/2304.15004 / https://proceedings.neurips.cc/paper_files/paper/2023/file/adc98a266f45005c403b8311ca7e8bd7-Paper-Conference.pdf
- Wei, J. (2022). *137 emergent abilities of large language models* (blog post and running list). https://www.jasonwei.net/blog/emergence
