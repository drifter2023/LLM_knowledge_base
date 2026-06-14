---
id: scaling-compute-vs-inference-optimal
cluster: scaling
concept: Compute-Optimal vs Inference-Optimal Scaling
status: done
sources:
  - https://arxiv.org/abs/2203.15556
  - https://arxiv.org/html/2401.00448v2
  - https://www.interconnects.ai/p/llama-3-and-scaling-open-llms
  - https://neurips2023-enlsp.github.io/papers/paper_75.pdf
generated_at: 2026-04-25
---

镇上有两家面馆。老周开"清辉面馆"已经二十年，店里只有他一个人揉面、煮汤、端碗。他每天清晨四点起床，把面团反复醒发七次，骨汤熬足十二个钟头。一碗面端上桌，街坊都说："这碗，值。"但他一天最多卖四十碗，过了中午就挂上"今日售罄"。

街对面新开了一家"快手面屋"，老板叫小林。她原本是工厂里的工程师，做事讲究算账。开店之前她拿出一张纸，把每一笔成本拆开写：一是开店前的"备料"——揉面的时间、熬汤的火候、调味的反复试验；二是开店之后的"出餐"——客人点单到面上桌的每一秒、每一勺。

老周的算盘只打第一项。他认准一个道理：备料越足，面越香，所以他把全部精力都投在开店之前。师傅手艺上去了，单碗品质就上去了，这是他二十年的信条。镇上确实有一份业内流传的"老师傅手册"，写着同样的话：师傅水平和备料工夫，应当各占一半，谁也不能偏废。

可小林的算盘不一样。她翻完手册，盯着最后一页空白处，自己添了一行小字：手册没算客人。

她做了一个推演。假如这家店一辈子只接待一桌客，那备料和手艺各占一半的写法当然是对的——成本几乎都花在开店那一刻。可要是这家店开十年、每天接三百桌呢？开店前那一次性的功夫，会被几十万碗面摊薄到几乎可以忽略；真正吃掉成本的，是每一碗面端出去时多花的那半分钟、那半勺油、那一小撮她付不起的高级香料。

于是小林做了一件在老师傅眼里近乎疯狂的事。她把自己关在厨房里整整一年，反复练习同一种面、同一锅汤，练到手册上写"练三百次就够"的动作，她练了一万五千次。师傅们路过窗口直摇头：边际收益早就趋近于零，何苦呢。

但开张那天，奇迹发生了。小林的面，单碗用料比老周省了八成，出餐速度快了五倍，味道却只差一线。她一天能卖六百碗，每一碗都便宜、快、稳。半年后，老周的店门口冷清了，街坊议论："那位姑娘的面，没老周的香，可她家天天开着，我天天吃得起。"

有人问小林到底悟到了什么。她笑了笑，说："手册没错，错在它默认这家店只开一天。我的店要开很久很久，所以我宁愿在开张前把自己练到手册都觉得多余的地步——因为练习的钱我只花一次，端面的钱我要花一辈子。"

---

## Concept and Field

**Compute-Optimal vs Inference-Optimal Scaling** is a tension within the *scaling laws* cluster of LLM research. The classical "compute-optimal" framing (Hoffmann et al., 2022, "Chinchilla") asks: given a fixed *training* compute budget C, how should one allocate it between model parameters N and training tokens D to minimize loss? The answer was striking — N and D should grow roughly in equal proportion (≈20 tokens per parameter), overturning the earlier Kaplan et al. (2020) prescription that favored larger models on less data.

"Inference-optimal" scaling reframes the objective. If a model is to be deployed and serve billions of requests, the lifetime FLOP cost is not 6ND (training) but 6ND_train + 2N·D_inference. Once D_inference is large, shrinking N at the cost of training longer becomes a net win, because every served token then costs less.

## Key Mechanism

Sardana et al. (2023, "Beyond Chinchilla-Optimal") formalize this by minimizing total training-plus-inference compute for a *target quality*, rather than minimizing loss for a fixed training budget. Their conclusion: when expected inference volume is on the order of 10⁹ requests or more, developers should push the tokens-per-parameter ratio from the Chinchilla value of ≈20 up to hundreds or thousands.

Llama 3 (Meta, 2024) is the most visible production instance. Chinchilla-optimal for an 8B model would be ~160–200B tokens; Meta instead trained Llama 3 8B and 70B on **15 trillion tokens**, roughly 75–100× over the compute-optimal point. Empirically, log-linear improvement persisted far past where prior scaling laws predicted diminishing returns. The rationale Meta states explicitly: a smaller, over-trained model matches a larger Chinchilla-optimal model in quality while being far cheaper to serve.

## Why It Matters

The shift represents a maturation of the field — from a pure pre-training research lens (where training compute is the only cost that matters) to a deployment lens (where inference compute, integrated over a model's life, dominates). It also reframes "data efficiency": training on all available high-quality data is no longer wasteful even when scaling laws say a smaller dataset suffices, because the surplus tokens buy a smaller serving footprint.

## Open Questions / Controversies

- **Where does over-training actually saturate?** Sardana et al. observed continued improvement at tokens-per-parameter ratios up to 10,000, but the functional form there is poorly characterized.
- **Replication of Chinchilla itself.** Epoch AI's replication attempt (Besiroglu et al., 2024) and Porian et al. (2024) found that Hoffmann et al.'s reported coefficients are not fully reproducible from their own data, suggesting the canonical "20 tokens per parameter" number is softer than commonly cited.
- **Data quality vs quantity.** The over-training regime assumes plentiful, high-quality tokens; once the public web is exhausted, the inference-optimal frontier may bend back toward synthetic data or distillation.

## References

- Hoffmann, J. et al. (2022). *Training Compute-Optimal Large Language Models* (Chinchilla). NeurIPS 2022. https://arxiv.org/abs/2203.15556
- Sardana, N. & Frankle, J. (2023). *Beyond Chinchilla-Optimal: Accounting for Inference in Language Model Scaling Laws*. ICML 2024. https://arxiv.org/html/2401.00448v2 ; NeurIPS ENLSP workshop version: https://neurips2023-enlsp.github.io/papers/paper_75.pdf
- Lambert, N. (2024). *Llama 3: Scaling open LLMs to AGI*. Interconnects. https://www.interconnects.ai/p/llama-3-and-scaling-open-llms
