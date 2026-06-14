---
id: itc-long-cot
cluster: itc
concept: Long Chain-of-Thought (DeepSeek-R1 style reasoning traces)
status: done
sources:
  - https://arxiv.org/abs/2501.12948
  - https://arxiv.org/html/2501.12948v1
  - https://arxiv.org/abs/2502.03373
  - https://arxiv.org/html/2503.09567v5
  - https://www.nature.com/articles/s41586-025-09422-z
generated_at: 2026-04-25
---

老周的儿子小川今年要参加省里的奥数选拔。家里请不起补习老师，老周自己只读到中专，于是想了个笨办法：每晚把当天的难题铺在桌上，让小川"想多久都行，想错了也无所谓，写下来就行"。规矩只有一条——最后一行必须圈出一个数字，对了，桌上那块红糖糕就是他的；错了，糕收回。

头两个礼拜，小川的草稿纸上只有寥寥几行：列方程，解方程，写答案。错得多，对得少。老周不教，只翻到最后一页，看圈出来的数字，对照答案册，决定要不要把糖糕推过去。

第三个礼拜的某个晚上，小川在一道几何题上卡住了。他像往常那样列了辅助线，算到一半发现矛盾。他停下笔，盯着草稿，忽然在下一行写："不对，刚才那条线画错了，重新来。"——这是他第一次在纸上跟自己说话。那一晚他把同一道题翻来覆去做了四遍，草稿写满了三张纸，最后圈出的数字是对的。糖糕推过去时，老周没说什么，只是把那三张草稿单独收进一个铁皮盒。

从那以后，小川的草稿越写越长。他开始写"嗯，这个思路好像走不通，换一个"，写"等一下，我先验算一下第二步"，写"如果 x 是负数会怎么样？试试看"。有时候一道题他要写满七八张纸，反复回到三步之前推翻自己。老周看不懂中间那些字，但他注意到一件事：草稿越长的那几晚，圈出的数字越容易对。

镇上中学的数学老师听说了，特地上门看小川的草稿。他翻了半天，对老周说："你这孩子的法子，跟我们教的不一样。我们教学生：列式、计算、写答案，三步走，干净利落。你儿子写的这些——'等一下'、'不对'、'再试试'——按我们的标准，是要扣分的，叫'草稿不规范'。"

老周挠挠头："那他题目做对了算不算？"

老师沉默了一会儿，说："算。可你知道吗，他现在做一道题的时间，是别的孩子的十倍。"

老周把那个铁皮盒推到老师面前。盒子里厚厚一沓草稿，从最早的几行，到后来密密麻麻的七八页，按时间排着。老师一张张翻过去，忽然明白了什么——这孩子不是被人教会了"反思"和"回溯"，他是因为只有最后那个数字会换来糖糕，自己慢慢长出了在纸上跟自己吵架的习惯。没人告诉他要这么做，是糖糕逼出来的。

选拔考试那天，小川交卷最晚。他的草稿纸用了别人的三倍。监考老师皱眉，但分数出来，他是全省前十。

颁奖回来的路上，小川问老周："爸，你当初为啥不教我标准解法？"

老周说："我不会。我只会看最后那个圈。"

---

## Concept and field

**Long Chain-of-Thought (Long CoT)** refers to extended reasoning traces — typically thousands to tens of thousands of tokens — that modern reasoning LLMs (DeepSeek-R1, OpenAI o1, etc.) generate before committing to a final answer. It belongs to the **Inference-Time Compute (ITC)** cluster: the family of techniques that trade more tokens at inference for better answers, rather than more parameters at training.

Unlike the original "Let's think step by step" CoT prompting (Wei et al., 2022), Long CoT traces are not short, linear scratchpads. Wang et al.'s 2025 survey formalizes three defining features: **deep reasoning** (many interdependent logical nodes), **extensive exploration** (branching into uncertain sub-problems in parallel), and **feasible reflection** (revisiting and revising earlier steps).

## Key mechanism

The breakthrough demonstrated by **DeepSeek-R1-Zero** (DeepSeek-AI, 2025) is that Long CoT can emerge from **pure outcome-based reinforcement learning**, with no supervised demonstrations of "how to think." A base model is given verifiable problems (math, code) and rewarded only when its final answer is correct. Under GRPO-style RL, the policy is free to allocate however many tokens it wants to the `<think>...</think>` block before the final answer.

What the DeepSeek team observed (Figure 3 of the paper) is that **average response length grows monotonically** across training steps — from a few hundred tokens to many thousands — without any explicit length reward. Mid-training, the model develops what the authors call an *aha moment*: it spontaneously begins writing phrases like "wait, let me reconsider" and "let me verify this step," learning to **allocate more thinking time** to harder problems by re-evaluating its own initial approach. Self-verification, backtracking, and dynamic strategy switching all emerge as instrumental behaviors selected for by the binary correctness reward.

Yeo et al.'s "Demystifying Long CoT" (2025) shows that while SFT cold-starts are not strictly necessary, **reward shaping is critical for stabilizing length growth**: naive RL often collapses into either too-short greedy chains or runaway repetition. They also report that scaling verifiable rewards onto noisy web-extracted STEM problems is feasible with filtering.

## Why it matters

Long CoT is the technical substrate of the "reasoning model" paradigm that reshaped frontier LLMs in 2025. It established that:

1. Sophisticated cognitive behaviors (reflection, planning, error correction) need not be supervised — they can be **incentivized** by outcome rewards alone, given a verifiable domain.
2. **Inference-time compute is a new scaling axis**: holding parameters fixed, accuracy on competition math/code improves with more thinking tokens.
3. The traces are distillable: smaller models fine-tuned on R1's traces inherit much of the reasoning capability (DeepSeek-R1-Distill-Qwen, Llama variants).

## Open questions and controversies

- **Overthinking**: longer is not always better. Beyond some threshold, extra tokens can degrade accuracy or just waste compute (Wang et al., 2025 survey).
- **Length–accuracy correlation**: noisy and task-dependent; not a clean monotonic law.
- **PRM vs ORM**: whether process reward models (step-level supervision) or outcome reward models (DeepSeek's choice) yield better Long CoT remains contested.
- **Faithfulness**: the visible trace may not be the actual computation the model uses to reach its answer — an active interpretability concern.

## Key references

- DeepSeek-AI. *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. arXiv:2501.12948 (2025); Nature (2025). https://arxiv.org/abs/2501.12948
- Yeo, E. et al. *Demystifying Long Chain-of-Thought Reasoning in LLMs*. arXiv:2502.03373 (2025). https://arxiv.org/abs/2502.03373
- Chen, Q. et al. *Towards Reasoning Era: A Survey of Long Chain-of-Thought for Reasoning Large Language Models*. arXiv:2503.09567 (2025). https://arxiv.org/html/2503.09567v5
- Wei, J. et al. *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*. NeurIPS 2022. (Original short-CoT precursor.)
