---
id: align-dpo
cluster: align
concept: DPO (Direct Preference Optimization)
status: done
sources:
  - https://arxiv.org/abs/2305.18290
  - https://rlhfbook.com/c/12-direct-alignment
  - https://www.tylerromero.com/posts/2024-04-dpo/
  - https://iclr-blogposts.github.io/2024/blog/rlhf-without-rl/
generated_at: 2026-04-25
---

景德镇瓷窑的老师傅快要七十岁了。他这辈子收过很多学徒，也带出过不少手艺人，但今年春天他遇上了一个怪难题。

三月里，城里来的茶商定了一批盖碗，要"清雅、不土气、看起来像是文人会用的"。老师傅手下有个叫小竹的年轻徒弟，烧瓷的手艺不差，但味道把握不准。他烧出来的盖碗，有的过艳，有的太素，有的釉色发闷。

按老规矩，师傅会请来一位"评瓷先生"——一个专门替主家挑货、给每只碗打分的中间人。评瓷先生坐在堂前，把小竹烧的碗一只只拿起来端详，写下分数：这只七分，这只三分，那只九分。小竹再照着分数去琢磨自己哪里做错了，下一窑改进。

可今年评瓷先生病了，迟迟不来。茶商催得紧，老师傅心里着急，又不放心让小竹独自摸索。他坐在窑口前抽了一夜的烟，第二天清早把小竹叫到跟前，拿出茶商之前送回的几十对样品。

"这些碗，茶商两两看过，每一对里挑出他更喜欢的那只，另一只搁一边。我们手上没有分数，只有他选了哪只、没选哪只。"

小竹挠头："那我怎么知道差在哪儿？没有分数，我没法改。"

老师傅笑了："你不需要分数。你只需要——"他顿了顿，从架子上取下小竹自己上个月烧的一只旧碗，"——记住你原来是怎么烧的。"

小竹更糊涂了。

老师傅把茶商挑中的那只碗、和被搁下的那只碗，并排摆在小竹的旧碗旁边。"你看：被挑中的这只，比你以前烧的旧碗，多了哪几分讲究？被搁下的这只，又比你的旧碗，多了哪几分毛病？你只要让自己的手，往'多讲究'的那一头偏一点，往'多毛病'的那一头收一点。每一对，都这么挪一挪。"

"可是我不知道'讲究'到底值几分啊。"

"你不需要知道。"老师傅敲了敲桌子，"分数本来就是评瓷先生自己心里编出来的尺。茶商心里没有尺，他只有'我更喜欢这只'。你和茶商之间，本来就不需要那位中间人。中间人写下的每一个分数，最后也只是为了告诉你：这只比那只更受欢迎。既然如此——"

小竹忽然懂了。他抬头看师傅："我自己的手，就是那把尺。我以前怎么烧的，是零点；茶商挑中的，是该往哪边走；被搁下的，是该往哪边收。每一对样品都在悄悄校准我的手，根本不需要谁先替我打分。"

老师傅点头："而且你那只旧碗——你原来的手感——还得带着。不能为了讨好茶商把祖上的釉色丢了。挪，但是别挪太远。"

那一窑出来，茶商收货的时候只说了四个字："就是这个。"

评瓷先生后来病好了，赶到窑口想接着干活。老师傅给他斟了茶，没让他上座。

---

## Concept and Field

**DPO (Direct Preference Optimization)** belongs to the **alignment** cluster — specifically the family of "direct alignment algorithms" that fine-tune LLMs on human preference data without an explicit reward model or reinforcement learning loop. It was introduced by Rafailov, Sharma, Mitchell, Ermon, Manning, and Finn at NeurIPS 2023.

## Key Mechanism

Standard RLHF is a two-stage pipeline: (1) train a reward model `r(x,y)` from pairwise preferences using a Bradley–Terry likelihood, then (2) optimize the policy `π_θ` against `r` with PPO under a KL constraint to a reference policy `π_ref`. DPO collapses both stages into a single supervised classification loss.

The derivation has three moves:

1. The KL-regularized RL objective `max_π E[r(x,y)] − β·KL(π‖π_ref)` has a known closed-form optimum: `π*(y|x) = (1/Z(x))·π_ref(y|x)·exp(r(x,y)/β)`.
2. Invert this to express the reward as a function of the optimal policy: `r(x,y) = β·log(π*(y|x)/π_ref(y|x)) + β·log Z(x)`.
3. Substitute into the Bradley–Terry preference likelihood. Crucially, because Bradley–Terry only depends on the *difference* `r(x,y_w) − r(x,y_l)`, the intractable partition function `log Z(x)` cancels.

What remains is a per-sample binary cross-entropy loss in the *log-probability ratios* of the policy itself:

`L_DPO = −E[log σ(β·(log π_θ(y_w|x)/π_ref(y_w|x) − log π_θ(y_l|x)/π_ref(y_l|x)))]`

The language model is its own reward model — hence the paper's subtitle, "Your Language Model is Secretly a Reward Model."

## Why It Matters

DPO eliminated the separate reward-model training run, the on-policy sampling loop, and most of PPO's hyperparameter brittleness. It made preference fine-tuning reproducible on academic budgets and is now the default first-pass alignment recipe for many open-weights models (Zephyr, Tulu, Llama-3-Instruct variants, Qwen2-Instruct).

## Open Questions and Controversies

- **Likelihood displacement.** Empirically, DPO often *decreases* the probability of the chosen response — it just decreases the rejected one faster. Pal et al. (2024) and follow-ups argue this is a structural pathology of the loss, not a tuning issue.
- **DPO vs. PPO.** Multiple controlled studies (Xu et al. 2024, "Is DPO Superior to PPO for LLM Alignment?") find on-policy RL still wins on hard reasoning benchmarks; DPO's edge is engineering simplicity, not capability.
- **Static KL.** β is a fixed scalar, not an adaptive constraint, so DPO cannot react to per-batch drift the way PPO's adaptive KL controller can.
- **Variant explosion.** IPO (Azar et al. 2023) drops the Bradley–Terry assumption; KTO (Ethayarajh et al. 2024) replaces pairs with prospect-theoretic single-response signals; SimPO (Meng et al. 2024) removes `π_ref` entirely; ORPO folds preference learning into SFT. The field has not settled on a winner.

## Key References

- Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). *Direct Preference Optimization: Your Language Model is Secretly a Reward Model.* NeurIPS 2023. https://arxiv.org/abs/2305.18290
- Lambert, N. *RLHF Book*, Ch. 12: Direct Alignment Algorithms. https://rlhfbook.com/c/12-direct-alignment
- Xu, S., et al. (2024). *Is DPO Superior to PPO for LLM Alignment? A Comprehensive Study.* ICML 2024.
- Azar, M. G., et al. (2023). *A General Theoretical Paradigm to Understand Learning from Human Preferences* (IPO). https://arxiv.org/abs/2310.12036
