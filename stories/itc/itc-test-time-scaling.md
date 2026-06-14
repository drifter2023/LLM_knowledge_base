---
id: itc-test-time-scaling
cluster: itc
concept: Test-Time Compute Scaling
status: done
sources:
  - https://openai.com/index/learning-to-reason-with-llms/
  - https://arxiv.org/abs/2408.03314
  - https://arxiv.org/abs/2501.19393
  - https://arxiv.org/abs/2502.12215
generated_at: 2026-04-25
---

阿岚是个棋手。她下的是一种很冷门的棋——单人对弈，每一盘的对手是题目本身。比赛规则只有一条：每盘棋有一个"沙漏"，沙漏倒完，她必须落下最后一子，把答案交出去。

年轻时她追求的是"一眼看穿"。她训练自己在沙漏刚翻过来的瞬间就落子，凭直觉、凭肌肉记忆。她的师父老聂总说："你的第一感很准。"她也以为这就是棋艺的全部。

后来她遇到了一类越来越难的题。这些题在第一感里看着像简单题，落子之后却总在十几步外崩盘。她开始挨打，连续输了一整年。

老聂没有教她新的开局，反而做了一件奇怪的事：把沙漏换大了。

新的沙漏可以倒一炷香那么久。老聂只对她说："你可以多想一会儿。"

阿岚一开始不会用这多出来的时间。她坐在棋盘前发呆，直觉之外她不知道还能做什么。老聂便陪她练一种新的内功，叫"自言自语"——下每一步之前，把心里那个声音放出来：我为什么想走这里？走了之后对手会怎么应？我假设错了的话，哪一步会先崩？

她开始在脑中铺开第二条、第三条线。有时候铺到一半，她发现自己最初的直觉站不住，于是退回去，换一条路重走。她甚至学会了在心里对自己说"等一下"——每当快要落子时，再多检查一遍，看看有没有更阴的陷阱。这一声"等一下"像是给自己的沙漏续了一点沙。

奇怪的事情发生了。同一副脑子、同一双手，只因为多想了一炷香，她的胜率从五成爬到了九成。更奇怪的是，老聂把她和另一位天赋远高于她、棋力是她十四倍的师兄拉来对比赛——师兄用小沙漏，她用大沙漏，居然下成了平手。算上沙子的总量，她比师兄省力得多。

棋会上的人开始追问老聂是怎么训练的。老聂只把功劳推给那只大沙漏，说："长出来的不是棋力，是用沙漏的方法。"

但故事并没有就此美好下去。第二年，几个学徒跟着模仿，把沙漏做得更大、更大。他们逼自己每盘棋都念叨上千次"等一下"。老聂在一旁冷眼看，叹了口气：他发现这些学徒的"等一下"念到后半段，开始把自己原本对的答案改成错的。沙漏越大，他们改得越狠，反而越输。老聂在墙上写下八个字："想得久，不等于想得对。"

阿岚把这八个字记了一辈子。她明白了：沙漏可以放大，但里面流的，得是真东西。

---

## Test-Time Compute Scaling

**Field.** Inference-time compute and reasoning paradigms (cluster `itc`). Test-time compute scaling refers to the practice of allocating *additional computation at inference* — longer chains of thought, multiple samples, search, or self-revision — to improve accuracy on hard problems, in lieu of (or in addition to) scaling model parameters or training data.

**Key mechanism.** OpenAI's o1 system card ("Learning to Reason with LLMs", 2024) demonstrated that a model trained with reinforcement learning to produce long internal chains of thought exhibits a *second* scaling law: accuracy improves smoothly with the amount of compute spent thinking at inference, not just with training compute. On AIME 2024, o1 reportedly scored 74% with one sample, 83% with majority vote over 64 samples, and 93% when re-ranking 1000 samples with a learned verifier. Snell, Lee, Xu, and Kumar ("Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters", arXiv:2408.03314, 2024) formalized two mechanisms: (1) *verifier-guided search* against a dense process reward model, and (2) *adaptive proposal-distribution updates* in which the model revises its own answer. They show that with a compute-optimal allocation tuned to prompt difficulty, a small model can match a model 14× larger under FLOPs-matched comparison, and the optimal strategy yields >4× efficiency over naive best-of-N. Muennighoff et al. ("s1: Simple Test-Time Scaling", arXiv:2501.19393, 2025) reproduced this open-source via *budget forcing* — appending the token "Wait" to extend the model's reasoning trace, or truncating it to spend less — showing that even a small fine-tuned model can climb the test-time scaling curve.

**Why it matters.** This paradigm decouples capability from parameter count. It opens a knob — inference compute — that can be turned at deployment time per query, enables small open models to rival much larger ones on reasoning tasks, and reframes "intelligence" as something accumulated through deliberation, not only through pretraining. It is the technical foundation underlying o1, o3, DeepSeek-R1, QwQ, and the broader reasoning-model wave.

**Open questions / controversies.** Zeng et al. ("Revisiting the Test-Time Scaling of o1-like Models", arXiv:2502.12215, 2025) report that for o1-like open models (QwQ, DeepSeek-R1, LIMO) longer CoTs do *not* monotonically improve accuracy — correct answers are often *shorter* than incorrect ones, because over-long traces trigger faulty self-revision that flips right answers to wrong. They propose "Shortest Majority Vote" as a corrective. The broader debate is whether the smooth scaling curves shown by o1 reflect a genuine property of deliberation or an artifact of verifier re-ranking and benchmark selection. Reviewers should also re-verify the exact AIME numbers above against the current OpenAI page, since the post has been updated since first release.

**Key references.**
- OpenAI. "Learning to Reason with LLMs." 2024. https://openai.com/index/learning-to-reason-with-llms/
- Snell, Lee, Xu, Kumar. "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters." arXiv:2408.03314, 2024. https://arxiv.org/abs/2408.03314
- Muennighoff et al. "s1: Simple Test-Time Scaling." arXiv:2501.19393, 2025. https://arxiv.org/abs/2501.19393
- Zeng, Cheng, Yin, Zhou, Qiu. "Revisiting the Test-Time Scaling of o1-like Models." arXiv:2502.12215, 2025. https://arxiv.org/abs/2502.12215
