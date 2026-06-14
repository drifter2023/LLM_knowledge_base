---
id: align-grpo
cluster: align
concept: GRPO (Group Relative Policy Optimization)
status: done
sources:
  - https://arxiv.org/abs/2402.03300
  - https://yugeten.github.io/posts/2025/01/ppogrpo/
  - https://medium.com/@jenwei0312/the-evolution-of-policy-optimization-understanding-grpo-dapo-and-dr-3e758c54b2c6
  - https://arxiv.org/pdf/2503.20783
  - https://cameronrwolfe.substack.com/p/grpo
generated_at: 2026-04-25
---

老周的拳馆开在巷子深处，招的都是穷孩子。

最早他是按老法子带徒弟的：每收一个新人，就在墙角另请一位"看官"——一个上了年纪的老拳师，专职在旁边盯着，给徒弟的每一拳每一脚打分。"这一拳七分，下一脚四分，腰没沉，扣两分。"看官的眼睛要养，要喂，要常常请去喝酒，开销比徒弟本人还大。可没办法，徒弟自己打完一套拳，根本不知道刚才哪里好哪里坏，没有看官的分数，他就没法进步。

这样带了十几年，老周累得不行。看官老了一个又一个，新看官又要从头培养，比教徒弟还慢。

直到那年冬天，他病了一场，躺在炕上想通了一件事。

他把看官全辞了。

第二天他对徒弟们说："以后不这么练了。每天早上，你们八个人，每人对着同一个木桩，把同一套拳打八遍。打完，我只问一句话——这八遍里，哪几遍打得比你们这一组的平均水平好，哪几遍比平均差。"

徒弟们愣住。"师父，那谁来打分？"

"你们自己互相就是分数。"老周说，"小三今天这一遍打得比你们八个人的均值高半分，那这一遍的姿势就值得他记住、明天接着这么打；小五那一遍比均值低了一分，那个动作就别再犯。你们这一组的成绩自己起伏，自己就是自己的尺。"

有徒弟皱眉："那要是我们这一组今天集体打得都很烂呢？均值低，烂的也成了好的。"

老周点头："所以我让你们八个人打同一个桩、同一套拳。八个人面对的是一样的难处，烂也是一起烂，好也是一起好。我要的不是你比天底下所有人强，我要的是——在今天这一桩、这一拳的处境里，你比你身边这七个自己强。"

又有徒弟问："那您还看不看我们打？"

"我看。"老周说，"但我不打分。我只做一件事：不许你们一夜之间把拳路改得连自己都认不出。今天的你，和昨天的你，不能差太远，差太远就是走火。其余的，组里的高低自己说话。"

那年开春，拳馆里没有看官，没有打分先生，墙角空了一块。可八个徒弟一组一组地打，一组一组地比，烂的自己沉下去，好的自己浮上来。半年后，巷口比武，老周的徒弟一连赢了三家有看官的大馆子。

外人来打听秘诀，老周只说了一句：

"省下养看官的那笔钱，让同门之间互相做尺子。打得好不好，不必问外人，问问你旁边那七个一起挨揍的兄弟就够了。"

---

## GRPO (Group Relative Policy Optimization)

**Field.** Alignment / RL post-training for LLMs. Sits in the `align` cluster as the workhorse optimizer underneath modern RLHF and RLVR pipelines (DeepSeek-R1, Qwen-Math, and most open reasoning models trained after early 2024).

**Mechanism.** GRPO was introduced by Shao et al. in *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models* (arXiv:2402.03300, Feb 2024) and made famous by *DeepSeek-R1*. It is a critic-free variant of PPO. The recipe:

1. For each prompt `q`, sample a **group** of `G` completions `{o_1, ..., o_G}` from the current policy `π_θ`.
2. Score each completion with a reward model (or a verifier, in the RLVR setting) to get rewards `{r_1, ..., r_G}`.
3. Compute the advantage by **within-group normalization**:

   `A_i = (r_i − mean({r_1..r_G})) / std({r_1..r_G})`

   This advantage is broadcast to every token in the i-th completion (in the outcome-supervision case).
4. Optimize the standard PPO clipped surrogate objective using these advantages, plus a KL penalty to a reference policy `π_ref`:

   `L(θ) = E[ min(ρ_t A_i, clip(ρ_t, 1−ε, 1+ε) A_i) ] − β · D_KL(π_θ ‖ π_ref)`

   where `ρ_t` is the per-token importance ratio.

The key move is that **the group's own mean and standard deviation play the role that the value/critic network plays in PPO**. There is no value network to train, no GAE to compute — peers are the baseline.

**Why it matters.** PPO for LLMs requires a critic the size of the policy, roughly doubling memory and adding instability. GRPO halves memory, simplifies the training loop, and — crucially — composes naturally with verifiable rewards (math correctness, code unit-tests), because all you need is a scalar reward per rollout. This is why GRPO became the de facto optimizer of the 2024–2025 reasoning-model wave, including DeepSeek-R1 (Guo et al., 2025).

**Open questions and recent critiques.**

- **Length bias.** GRPO's loss aggregates by dividing per-response by response length, which under-penalizes long incorrect outputs and biases the policy toward verbose wrong answers (DAPO; Yu et al. 2025).
- **Difficulty bias.** Dividing the advantage by `std(r)` over-weights prompts where the group happens to have low variance, distorting the curriculum (Liu et al., *Understanding R1-Zero-Like Training: A Critical Perspective*, arXiv:2503.20783, **Dr. GRPO**).
- **Fixes are themselves contested.** Dr. GRPO replaces per-sequence scaling with a fixed constant; subsequent work (e.g. MAD-GRPO, λ-GRPO) argues this re-introduces a verbosity bias of its own. A clean, non-heuristic aggregation rule remains an open problem.

**Key references.**

- Shao, Wang, Zhu et al., *DeepSeekMath* (2024) — [arXiv:2402.03300](https://arxiv.org/abs/2402.03300)
- DeepSeek-AI, *DeepSeek-R1* (2025).
- Liu et al., *Understanding R1-Zero-Like Training* (Dr. GRPO, 2025) — [arXiv:2503.20783](https://arxiv.org/pdf/2503.20783)
- Yu et al., *DAPO* (2025).
- Wolfe, *Group Relative Policy Optimization (GRPO)* — [cameronrwolfe.substack.com/p/grpo](https://cameronrwolfe.substack.com/p/grpo)
- Shi, *A Vision Researcher's Guide to PPO & GRPO* — [yugeten.github.io](https://yugeten.github.io/posts/2025/01/ppogrpo/)
