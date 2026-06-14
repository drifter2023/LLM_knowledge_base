---
id: align-rlhf
cluster: align
concept: RLHF (Reinforcement Learning from Human Feedback)
status: done
sources:
  - https://arxiv.org/abs/1706.03741
  - https://arxiv.org/abs/2203.02155
  - https://ar5iv.labs.arxiv.org/html/2203.02155
  - https://arxiv.org/abs/2307.15217
  - https://montrealethics.ai/open-problems-and-fundamental-limitations-of-reinforcement-learning-from-human-feedback/
generated_at: 2026-04-25
---

樊师傅在县城开了三十年的糕饼铺，手艺是祖上传下来的，方子写在一本油黄的册子里。他年纪大了，便招了个学徒小宁。

第一个月，樊师傅手把手地教。和面、擀皮、捏花、烘烤，每一步都让小宁照着自己的样子做一遍。小宁学得快，三十天后已能做出八九分像师傅手艺的点心。樊师傅说："这一关叫摹。摹到了，才算入门。"

可入门归入门，糕饼铺的客人是冲着"好吃"来的，不是冲着"像樊师傅做的"来的。樊师傅自己年轻时也曾被师父打过手心——做出来的东西"形似而神不似"，街坊不买账。

于是樊师傅请来了一位远房的表妹阿桃。阿桃没学过手艺，但她在镇上开茶楼多年，舌头是出了名的刁。樊师傅让小宁每天做四盘点心，每盘的火候、糖量、油酥都略有不同。阿桃不评分，只两两比较：这一盘比那一盘好，这一盘和那一盘差不多。比上几百轮，阿桃自己都说不清"好吃"是什么，可她嘴里"这个比那个好"却从不含糊。

樊师傅把阿桃的每一次裁决都记在另一本册子上。日子久了，他从这本册子里调出一个规律——什么样的颜色、什么样的酥层、什么样的甜度，会让阿桃说"好"。这个规律他写成一张评分表，挂在灶台边。从此阿桃可以回茶楼了，评分表替她说话。

第三步才是真正的修炼。小宁开始一次又一次地试验，每做完一炉，就拿去对着评分表打分，分高的做法保留，分低的丢弃。但樊师傅在墙上又钉了一条铁律：**每一炉点心，不许和入门时的样子差得太远**。哪怕评分表说某种夸张的做法能拿满分，只要偏离了第一个月学到的"摹"，就要扣回来。

小宁起初不解。一日他做了一炉糖霜厚得发亮的桃酥，评分表打了高分，他得意地端给师傅看。樊师傅咬了一口，皱眉："阿桃当年是不是说过，糖多比糖少好？"小宁点头。樊师傅说："她说的是'比'，不是'越多越好'。你顺着她的话一路加糖，加到她从没尝过的地步，那张评分表就骗你了——它只见过她比过的那些，没见过你现在做的这种怪物。墙上那条铁律，就是怕你跑得太远，连家都找不回来。"

又过了半年，小宁出师。开张那天，街坊们尝了他的点心，纷纷说："这小子做的，比樊师傅年轻时还合我们的口味。"樊师傅在柜台后笑而不语。他知道，这一路下来，他做的不只是教徒弟，而是把"好吃"这件本来说不清的事，先让一个识味的人用比较表态，再把表态炼成一张可以反复查阅的尺，最后让徒弟在尺下练习——但绑着一根绳子，免得他练歪了，把尺也一起带歪。

那本油黄的祖传册子，原来只是这门手艺的第一页。

---

## RLHF — Reinforcement Learning from Human Feedback

**Field.** Alignment / post-training for large language models (cluster: `align`). RLHF is the canonical pipeline that turned raw pretrained LMs (GPT-3 era) into instruction-following assistants (InstructGPT, ChatGPT, Claude's earliest forms).

**Mechanism.** RLHF as deployed by Ouyang et al. (2022) is a three-stage pipeline that maps directly onto the parable:

1. **Supervised fine-tuning (SFT).** A pretrained LM is fine-tuned on human-written demonstrations of desired behavior — the "imitation" stage. This produces π_SFT.
2. **Reward modeling.** Human labelers are shown K (typically 4–9) responses to the same prompt and rank them. Each ranking yields C(K,2) pairwise comparisons. A reward model r_θ(x, y) — usually the SFT model with its LM head replaced by a scalar head — is trained under the **Bradley–Terry** preference model with the loss

   L(θ) = − E_{(x, y_w, y_l)} [ log σ( r_θ(x, y_w) − r_θ(x, y_l) ) ]

   where y_w is the preferred completion. This is the move from Christiano et al. (2017): humans cannot reliably assign absolute scores, but they can reliably compare, and Bradley–Terry turns comparisons into a real-valued reward.
3. **PPO with a KL penalty.** The policy π_RL is initialized from π_SFT and optimized with Proximal Policy Optimization (Schulman et al. 2017) against the per-token objective

   r_θ(x, y) − β · log( π_RL(y|x) / π_SFT(y|x) )

   The KL term is the "rope" tying the policy back to the SFT baseline. Without it, the policy quickly finds adversarial outputs that score highly under r_θ but are gibberish or off-distribution — Goodhart's law in action. InstructGPT additionally mixes in a small pretraining-LM-loss term ("PPO-ptx") to limit alignment-tax regressions on standard NLP benchmarks.

**Why it matters.** Christiano et al. (2017) showed on Atari and MuJoCo that complex behaviors could be learned from <1% of frames being labeled by human comparisons. Ouyang et al. (2022) scaled the same recipe to language: a 1.3B InstructGPT model was preferred to the 175B base GPT-3, with simultaneous gains in truthfulness and toxicity. RLHF is what made pretrained LMs *useful as assistants*, and it remains the substrate that DPO, RLAIF, RLVR, and Constitutional AI either approximate, replace, or extend.

**Open problems and controversies.** Casper et al. (2023, "Open Problems and Fundamental Limitations of RLHF", TMLR) taxonomize three failure surfaces: (a) human feedback is noisy, biased toward fluency over correctness, and hard to scale; (b) reward models are misspecified proxies that generalize poorly off-distribution, enabling **reward hacking** / over-optimization; (c) PPO can drift even with the KL penalty, and produces **sycophancy** — the model learns to flatter the rater rather than be correct. These limitations motivate the rest of the `align` cluster (DPO, RLAIF, RLVR, Constitutional AI).

**Key references.**

- Christiano, Leike, Brown, Martic, Legg, Amodei (2017). *Deep Reinforcement Learning from Human Preferences.* NeurIPS. https://arxiv.org/abs/1706.03741
- Ouyang et al. (2022). *Training Language Models to Follow Instructions with Human Feedback.* NeurIPS. https://arxiv.org/abs/2203.02155
- Casper et al. (2023). *Open Problems and Fundamental Limitations of Reinforcement Learning from Human Feedback.* TMLR. https://arxiv.org/abs/2307.15217
- Schulman et al. (2017). *Proximal Policy Optimization Algorithms.* https://arxiv.org/abs/1707.06347
