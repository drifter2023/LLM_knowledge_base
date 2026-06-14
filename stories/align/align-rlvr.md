---
id: align-rlvr
cluster: align
concept: RLVR (Reinforcement Learning with Verifiable Rewards)
status: done
sources:
  - https://arxiv.org/abs/2411.15124
  - https://rlhfbook.com/c/14-reasoning
  - https://arxiv.org/abs/2504.13837
  - https://www.lesswrong.com/posts/s3NaETDujoxj4GbEm/tsinghua-paper-does-rl-really-incentivize-reasoning-capacity
generated_at: 2026-04-25
---

雪落得急的那一年，云栖书院来了一位新山长。书院旧规：每月文会，先生们围坐品评学童的策论，谁的笔法最得长者欢心，谁便摘了魁首。这套规矩行了三十年，养出来的孩子文辞华丽，议论圆融，可一旦让他们去算粮仓的尺寸、丈量河堤的弧度，便都张口结舌。

新山长姓林，原是工部的算师。他到任第一日就把文会撤了，在院中支起一口大锅，锅旁挂着一杆秤、一只漏壶、一方算盘。

"从今往后，"他说，"题目我出，答案天定。"

他把孩子们分成几十组，每日清晨发下一沓题：有的要算出某段堤坝几时溃决，有的要写一段口诀让账房先生照着拨珠，珠落之声须与他袖中那只沙漏的滴答严丝合缝。孩子们交卷之后，林山长不读，不评，只把答案丢进锅里——锅底刻着标尺，水位对了便浮起一片绿叶，错了便沉一块黑石。

绿叶浮起的那个孩子，今夜多得一碗饭。仅此而已。

起初众人不解。一位老先生抚须而叹："这般粗暴，岂不抹煞了文心？"林山长不答，只让他看院中孩子。三个月后，那些原本只会堆砌辞藻的孩子，竟真的能在一炷香内算清三十顷地的赋税。一年后，他们解出了工部存了二十年的悬案。消息传开，邻县的书院纷纷仿效，一时间天下学童都不再追求"先生点头"，只追求"叶浮石沉"。

可有一桩怪事，渐渐浮上来。

院里有个叫阿野的孩子，天资极杂——他每道题都能想出七八种解法，有时绕一个匪夷所思的远路，竟也能让叶子浮起。从前文会上，先生们最爱他这股野气。如今呢？阿野发现，自己越练越"准"：那些远路他不再走了，因为绿叶只奖励一次浮起，不在乎你走的是哪条路；走熟路最稳，最快得饭。半年之后，他出题十中其九，可有一道极偏的怪题，从前的他抓耳挠腮三百次或许能撞上一次，如今的他抓耳挠腮三千次，竟一次也撞不上了——那条野路，早已被他自己亲手封死。

一位云游的老学究在院外站了很久。他对林山长说："您这口锅，奖的是'答得对'，不是'想得到'。锅只看水位，看不见水底。孩子们浮起的叶子越来越多，可他们脑子里的暗河，正在一条条干涸。"

林山长沉默良久，提笔在锅沿刻了一行小字：

> 可验之赏，能教鱼跃于既识之渊；至于未识之渊，鱼是否仍能跃，吾尚未知。

那一年的雪，下到了开春。

---

## RLVR — Reinforcement Learning with Verifiable Rewards

**Field.** Post-training and alignment of large language models (cluster: alignment / RLHF successors).

**Mechanism.** RLVR replaces the *learned preference reward model* of classical RLHF with a *deterministic verifier*. The model samples a chain-of-thought plus a final answer; an external function checks the answer (string-match against a math ground truth, execution against unit tests, a proof checker, etc.) and returns a binary reward — typically 1 if correct, 0 otherwise. That scalar is then plugged into a policy-gradient algorithm, most commonly **PPO** or **GRPO** (Group Relative Policy Optimization, introduced by DeepSeek-Math and central to DeepSeek-R1). Because the reward is cheap and noiseless, RLVR runs for hundreds or thousands of epochs over the *same* prompts, in contrast to RLHF which usually does one or two passes. The term "RLVR" was coined by Lambert et al. in the **Tülu 3** report (Allen AI, Nov 2024).

**Why it matters.** Verifiable rewards solved two problems at once: (1) reward hacking against a learned RM, and (2) the absence of dense supervision for multi-step reasoning. By rewarding only the final correctness, RLVR lets the model discover its *own* chain-of-thought without anyone labeling intermediate steps. This recipe is widely credited as the engine behind the 2024–2025 wave of explicit-reasoning models — OpenAI's **o1** (Sept 2024), **DeepSeek-R1** (Guo et al., Jan 2025), Kimi k1.5, and many open replications. It also reframed alignment: for verifiable domains (math, code, formal logic), preference data is no longer necessary or even desirable.

**Open questions / controversy.** A NeurIPS 2025 paper by **Yue, Chen, Lu, Zhao, Wang, Song, Huang — "Does RL Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?"** (arXiv:2504.13837) argues that RLVR does *not* expand the base model's capability frontier. Their key evidence is the pass@k crossover: the RLVR'd model dominates at pass@1, but the *base* model overtakes it at pass@256 on in-distribution math benchmarks. They interpret RLVR as **sharpening** — it concentrates probability on solutions the base model could already sample, while pruning rarer but sometimes-essential reasoning paths ("narrowing the reasoning boundary"). Counter-evidence exists: out-of-domain, and with algorithms like RLOO or REINFORCE++, the crossover point shifts well beyond k=256, and other 2025 work (e.g. arXiv:2506.14245) argues RLVR *implicitly* incentivizes correct reasoning rather than mere sampling. Whether RLVR teaches new skills or merely amplifies latent ones is the live debate the reviewer should track.

**Key references.**
- Lambert et al., 2024. *Tülu 3: Pushing Frontiers in Open Language Model Post-Training.* https://arxiv.org/abs/2411.15124
- Yue et al., 2025. *Does RL Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?* https://arxiv.org/abs/2504.13837
- Guo et al., 2025. *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning.*
- Lambert, *RLHF Book*, ch. 14 "Reasoning Training." https://rlhfbook.com/c/14-reasoning
