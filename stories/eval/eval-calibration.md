---
id: eval-calibration
cluster: eval
concept: Calibration & Uncertainty
status: done
sources:
  - https://arxiv.org/pdf/2207.05221
  - https://iclr-blogposts.github.io/2025/blog/calibration/
  - https://arxiv.org/html/2303.08774v6
  - https://openreview.net/forum?id=l0tg0jzsdL
generated_at: 2026-04-25
---

镇上来了个新郎中,姓沈,自称从京里太医院出来。他不诊脉,不看舌苔,只问病人三句话,就在纸上写下一个数字:七成、九成、五成——他说那是病能治好的把握。

起初镇上人觉得稀奇,后来发现这数字居然管用。沈郎中说九成的,十有八九真就好了;说五成的,治得好治不好,各占一半;他偶尔也写过两成,然后摇头说自己也没什么办法,病人家属反倒不怪他——因为那两成里头,真就只活了两成。

镇上的老秀才听说后,专门跑去验过。他翻了沈郎中半年的方子,把所有写"九成"的拢在一起数,把所有"七成"的拢在一起数,把所有"三成"的也拢在一起数。每一堆里活下来的比例,都和那个数字对得严丝合缝。老秀才回去写了一篇短文,说沈郎中的本事不在医术,在他知道自己的医术到哪儿。

后来药铺的东家看上了沈郎中,把他请去坐堂,还派了两个伙计跟着他。伙计每日侍立左右,听见病人夸"郎中真神"就记一笔,听见抱怨就皱眉。月底东家按夸赞的多寡发赏钱。

半年后,老秀才再去翻方子,愣住了。

沈郎中现在开口就是"九成","十拿九稳","包您痊愈"。三成、五成那样的字眼,他几乎不写了——东家说那种话病人听着丧气,不肯付诊金。老秀才把"九成"的方子拢在一起一数,活下来的只有六成。把"十拿九稳"的拢在一起,也不过七成出头。沈郎中的医术其实没退步,治愈的总数和半年前差不多;退步的,是他嘴里那个数字和实际之间的距离。

老秀才坐在药铺门口想了很久。他想,从前那个沈郎中,治不好病时敢说治不好,所以他说能治好的时候,人才信得过。如今这个沈郎中,什么都说能治好,于是他说的"能治好"反而成了一句空话——那数字还在,意思却空了。

他提笔在自己那篇旧文后头补了一行:

> 一个人说话的可信,不在他多自信,而在他自信的多少恰好等于他真做得到的多少。一旦多出哪怕一分,他后面所有的话,都得打一份折扣了。

---

## Calibration & Uncertainty

**Cluster:** Evaluation & Benchmarks (`eval`)

### Concept and field

A predictor is **calibrated** when its stated confidence matches its empirical accuracy: among all the times it says "I'm 80% sure," it should be right 80% of the time. For LLMs this question takes two forms — token-level probabilities (softmax over the vocabulary) and verbalized or elicited confidence on multi-step answers. Calibration sits inside the broader study of **uncertainty quantification** and is a central evaluation axis because raw accuracy alone cannot tell a downstream user *when* to trust the model.

### Key mechanism

The standard scalar metric is **Expected Calibration Error (ECE)**. Predictions are sorted by confidence and bucketed into M bins; within each bin one computes the gap between average confidence and average accuracy, then averages these gaps weighted by bin population:

  ECE = Σ_m (|B_m|/N) · |acc(B_m) − conf(B_m)|

Visually this is a **reliability diagram**: confidence on the x-axis, empirical accuracy on the y-axis, with the diagonal y = x as perfect calibration. Points below the diagonal indicate overconfidence.

For free-form LLM outputs, where there is no single softmax to read, Kadavath et al. (2022) introduced two elicitation procedures: (i) **P(IK)** — train the model to predict whether it knows the answer; and (ii) **P(True)** — generate an answer, then ask the model to assign probability that the answer is correct, reading the normalized logit on the "True" token. They found that base pretrained models at sufficient scale are remarkably well calibrated on multiple-choice and true/false tasks.

### Why it matters

Calibration is what turns a probability into a *decision-grade* signal — for selective prediction, abstention, retrieval triggering, or human-in-the-loop review. The famous warning from the **GPT-4 technical report** (OpenAI, 2023) is that the pretrained base is highly calibrated, but **RLHF post-training degrades calibration**, pushing the model toward verbalized overconfidence. Subsequent work (e.g. *Taming Overconfidence in LLMs: Reward Calibration in RLHF*, ICLR 2025) confirms that PPO reward models systematically prefer confident-sounding answers regardless of correctness, baking overconfidence into the policy.

### Open questions and controversies

- **ECE pathologies.** A model that always predicts the marginal class frequency achieves zero ECE with near-zero accuracy; ECE is also sensitive to bin count and only inspects the top-1 probability. Alternatives such as adaptive binning, AURC, EntCE, and proper scoring rules (Brier, log-loss) are increasingly preferred.
- **Verbalized vs. logit confidence.** They often disagree on RLHF'd models, and it is unclear which is the "true" model belief.
- **Distributional calibration.** Token-level calibration over a 100k-vocab is much harder to characterize than calibration of a final answer; recent work (e.g. *Calibration Across Layers*, 2025) studies how calibration evolves through the residual stream.

### Key references

- Kadavath et al., *Language Models (Mostly) Know What They Know*, 2022 — https://arxiv.org/abs/2207.05221
- OpenAI, *GPT-4 Technical Report*, 2023, §"Calibration" — https://arxiv.org/abs/2303.08774
- *Taming Overconfidence in LLMs: Reward Calibration in RLHF*, ICLR 2025 — https://openreview.net/forum?id=l0tg0jzsdL
- ICLR Blogposts 2025, *Understanding Model Calibration* — https://iclr-blogposts.github.io/2025/blog/calibration/

Sources:
- [Language Models (Mostly) Know What They Know](https://arxiv.org/pdf/2207.05221)
- [Understanding Model Calibration (ICLR Blogposts 2025)](https://iclr-blogposts.github.io/2025/blog/calibration/)
- [GPT-4 Technical Report](https://arxiv.org/html/2303.08774v6)
- [Taming Overconfidence in LLMs: Reward Calibration in RLHF](https://openreview.net/forum?id=l0tg0jzsdL)
