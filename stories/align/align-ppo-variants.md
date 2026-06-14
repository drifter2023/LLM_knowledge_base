---
id: align-ppo-variants
cluster: align
concept: PPO Variants — DAPO, REINFORCE++, RLOO
status: done
sources:
  - https://arxiv.org/abs/2503.14476
  - https://dapo-sia.github.io/
  - https://arxiv.org/abs/2501.03262
  - https://arxiv.org/html/2501.03262v5
  - https://huggingface.co/blog/putting_rl_back_in_rlhf_with_rloo
  - https://aclanthology.org/2024.acl-long.662.pdf
generated_at: 2026-04-25
---

宋家庄的私塾里有位姓沈的先生，专教算术。先生从不亲自给学生打分——他请了一位"评事"老者坐在堂后，听学生答题之后只说"对"或"不对"。沈先生要做的，是看着这些"对"与"不对"，决定下回该让谁多写几道、谁该回去重学。

起先，沈先生用的是村里最古老的法子：每次出一题，让一个孩子作答，听评事的评语，对了就多夸两句，错了就少夸。日子久了，孩子们的进步慢得像井水冒泡。沈先生心想，问题在于他没有对照——孩子答得"对"，到底是题简单，还是这孩子真的高明？他分不清。

于是他改了法子。每出一题，让四个孩子同时作答，评事一一评过，沈先生便取这四人之中**其余三人**的平均成绩，作为衡量第一个孩子的尺子。如此一来，"题目本身有多难"被这把尺子吃掉了，剩下的就只是这孩子相对于同窗的高下。这法子省去了原先那位坐在角落、专门猜"这道题大概值多少分"的account先生——那人薪水昂贵，还常常猜错。村里人都说沈先生聪明。

可推行了半年，沈先生发现一桩怪事。他出的题目分两类：易题（四人皆对）和难题（四人皆错）。这两类题里，"其余三人的平均"恰好等于那一人自己的成绩，尺子量出来是零——孩子做了等于没做，纸笔白费。更糟的是，凡是中等难度、四人答案有对有错的题，孩子们越练越精，而真正的难题，因为永远拿不到正反馈，渐渐被遗忘。沈先生于是定下新规：**凡是全班齐对或齐错的题，当日作废，重新抽题，直到凑足有分歧的题目为止**。这一改，孩子们的进步陡然加快。

但还有第二桩烦恼。沈先生发现，每道题的尺子都只用"答这道题的四个孩子"来定，结果是：碰上一组天资平平的孩子，那道题的尺子就松；碰上一组聪慧的，尺子就严。同一个孩子，今日因同伴愚钝而显得出众，明日因同伴聪慧而显得平庸——评判飘忽不定。沈先生索性把当日**全堂所有题目、所有孩子的成绩**汇总，求一个统一的均值与方差，再以此为尺。这样一来，尺子稳了，飘忽没了，孩子们也不再因为坐在哪一桌而吃亏。

到了年末，邻村另一位塾师吴先生听说沈先生的法子，亲自来访。吴先生说："你那评事终究是个外人，主观武断。我村里改了规矩——评事只判'对'或'不对'，且这个'对'必须是村口张铁匠那台秤能称出来的硬道理：算出来的数对上了答案，便是对；对不上，便是错。如此一来，连尺子都不必那么花哨。"沈先生拱手称善，回去又把答错过长的题目单独打了折扣——孩子若把一道两行能解的题写满了三页纸，哪怕最后蒙对，也只给半分，免得他们养成絮叨的毛病。

那一年宋家庄出了三个秀才。后来人问沈先生治学的诀窍，他只说了一句：

"不必请那位猜分的先生。让同窗们互为镜子，把全堂的尺子合一，把没分歧的题作废，把絮叨的答卷打折——这就够了。"

---

## Concept and Field

This parable illustrates **PPO Variants for RLHF / RLVR — specifically RLOO, REINFORCE++, and DAPO** — a family of critic-free policy-optimization algorithms in the **alignment** cluster. They are the post-2024 successors and competitors to PPO and GRPO for fine-tuning LLMs with reward signals.

## Key Mechanism

All three abandon PPO's learned **value network** (the "account 先生" Mr. Shen dismissed) and instead build the advantage baseline from sibling samples. They differ in *which* samples and *how* they normalize:

- **RLOO (REINFORCE Leave-One-Out, Ahmadian et al., ACL 2024).** For each prompt, sample *k* completions. The baseline for completion *i* is the **mean reward of the other k−1 completions** for the same prompt. Treats the entire completion as a single action; uses plain REINFORCE loss `logprob · (reward − baseline)`. Removes the value model and the GAE machinery — 50–70% less VRAM, 2–3× faster than PPO.

- **GRPO** (DeepSeek, the parable's "其余三人平均" step) generalizes RLOO with prompt-level mean-and-std normalization plus a PPO-style clipped objective.

- **DAPO (ByteDance Seed + Tsinghua, March 2025).** Patches GRPO with four tricks: (1) **Clip-Higher** — raises the upper clip bound of the importance ratio to prevent entropy collapse on low-probability exploratory tokens; (2) **Dynamic Sampling** — discards prompt groups whose accuracy is exactly 0 or 1 (zero-advantage groups, the "全班齐对或齐错"); (3) **Token-Level Policy Gradient Loss** — averages loss per token rather than per sequence, crucial for long chain-of-thought; (4) **Overlong Reward Shaping** — soft-penalizes excessively long completions. Achieved 50 on AIME 2024 with Qwen2.5-32B in half DeepSeek-R1-Zero's training steps.

- **REINFORCE++ (Hu et al., Jan 2025).** Argues that GRPO/RLOO's *prompt-local* normalization is theoretically biased and encourages reward hacking on easy prompts. Replaces it with **Global Advantage Normalization** — z-score across the entire batch — and adds PPO-style clipping and KL regularization. The "全堂统一尺子" step in the parable.

## Why It Matters

PPO's value head is expensive to train, prone to bias, and adds an extra model copy. The R1/o1-era discovery that **verifiable rewards plus group-relative baselines** suffice unlocked massive open RL training. These variants are the workhorses behind nearly every open-source reasoning model released in 2025.

## Open Questions

- DAPO's Dynamic Sampling helps efficiency but throws away prompts where *all* responses fail — exactly the hardest curriculum signal. Whether this hurts ceiling capability (the Yue et al. 2025 RLVR critique applies here too) is unresolved.
- REINFORCE++'s claim that prompt-local normalization is biased is contested; GRPO partisans argue local normalization is a *feature* for difficulty-adaptive learning, not a bug.
- Token-level vs sequence-level loss interacts non-trivially with length-bias in reward models — still actively studied.

## Key References

- Yu et al., 2025. *DAPO: An Open-Source LLM Reinforcement Learning System at Scale.* arXiv:2503.14476. https://arxiv.org/abs/2503.14476
- Hu et al., 2025. *REINFORCE++: Stabilizing Critic-Free Policy Optimization with Global Advantage Normalization.* arXiv:2501.03262. https://arxiv.org/abs/2501.03262
- Ahmadian et al., 2024. *Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs.* ACL 2024. https://aclanthology.org/2024.acl-long.662.pdf
- Hugging Face blog, *Putting RL back in RLHF with RLOO.* https://huggingface.co/blog/putting_rl_back_in_rlhf_with_rloo
