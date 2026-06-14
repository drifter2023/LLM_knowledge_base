---
id: safety-constitutional-ai
cluster: safety
concept: Constitutional AI
status: done
sources:
  - https://arxiv.org/abs/2212.08073
  - https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
  - https://rlhfbook.com/c/13-cai.html
  - https://www.anthropic.com/news/claudes-constitution
  - https://arxiv.org/abs/2310.13798
generated_at: 2026-04-25
---

赵师傅在城南开了一家小面馆,带着一个十六岁的徒弟阿岭。阿岭手脚麻利,可性子急,客人一句话不顺耳,他能把整碗面摔在桌上。

赵师傅起初想一句一句教他:这位客人是熟客,要少盐;那位是孕妇,不要花椒;喝醉的别理会,别还嘴。可教了三个月,阿岭还是错。客人换了,情境换了,阿岭就傻眼。赵师傅熬不住,病倒了一回。

病好之后,他换了法子。

他取来一张红纸,只写了七条:**一、不可让客人受伤。二、不可羞辱来吃饭的人。三、不可糊弄付了钱的人。四、对老人小孩,要更耐心一分。五、对喝醉的,先递水,再说话。六、若两条规矩冲突,先保人不受伤。七、记住你是来做面的,不是来赢的。**

红纸贴在后厨墙上。赵师傅说:“以后我不在,你照着这上面问自己。”

第一阶段,赵师傅让阿岭每晚收摊后,把白天每一桩不顺的事重写一遍。先写他当时怎么做的——摔碗、甩脸、回嘴;再对照红纸,一条一条问自己:“这一下,违了哪条?”然后写一遍“若是按红纸,我该怎么做”。一开始阿岭写得敷衍,后来写得越来越细。半年后,他白天动手之前,脑子里已经先走过那一遍“若是按红纸”了——他不再需要纸,纸长进了他的手脚。

可赵师傅知道,光会“想一遍”,真到客人拍桌子那一刻,人还是会犯浑。于是他设了第二阶段。

他让阿岭每端出一碗面,都在心里先做两版:一版是脾气上来的版本,一版是按红纸的版本。然后他自己扮成一个看不见的老掌柜,坐在阿岭心里,摸出红纸的某一条,问:“这两版,哪一版更合这一条?”阿岭得回答,得给出理由。日子久了,这个“心里的老掌柜”不再需要赵师傅,阿岭自己就长出了一个。每端一碗,心里那个掌柜就替他挑一遍。挑得多了,阿岭的手自然往“更合红纸”的那一版偏。

一年后,赵师傅彻底不进后厨了。客人来了一个刁钻的,问阿岭:“你这面馆凭什么不让我加酒?”阿岭没摔碗,也没回嘴。他笑了一下,说:“您坐,我先给您端碗热汤。我们这儿有几条规矩,不是我定的,是贴在墙上的——您要是想看,我念给您听。”

赵师傅在帘子后头听见了,闭上眼。他知道阿岭已经不是在背那七条了。那七条,已经是阿岭自己。

——只是赵师傅也心里清楚:那张红纸,是他一个人写的。哪天换一个师傅,换一张纸,阿岭长出来的,就会是另一个人。

---

## Constitutional AI

**Field.** Alignment and safety (cluster: `safety`). Constitutional AI (CAI) is Anthropic's flagship method for training a helpful, harmless assistant using a small set of written principles ("a constitution") instead of large-scale human labels of harmful content. It is the training backbone of Claude.

**Mechanism.** CAI replaces the human-labeled harmlessness data of standard RLHF with two AI-driven stages:

1. **Supervised stage (critique-and-revise).** Given a red-teaming prompt and a draft response from a helpful-only RLHF model, the same model is asked to *critique* its draft against a randomly sampled constitutional principle ("Identify ways in which the response is harmful…"), then *revise* the draft accordingly. The base model is fine-tuned on the (prompt, final-revision) pairs. After several rounds, the SL-CAI model has internalized a first pass of the constitution.

2. **RL stage (RLAIF).** The SL-CAI model generates pairs of responses to harmful prompts. A separate "feedback model" is shown each pair together with a sampled principle and asked which response better satisfies it; the log-probabilities form a soft preference label. These AI-generated preferences (combined with human helpfulness preferences) train a preference model, which then serves as the reward in standard RL fine-tuning. This step is *Reinforcement Learning from AI Feedback* — RLAIF.

The resulting model is reported to be both more harmless *and* less evasive than RLHF baselines: instead of refusing flatly, it engages and explains its objection. Bai et al. also show that adding chain-of-thought to the feedback model improves the harmlessness/helpfulness Pareto frontier.

**Why it matters.** CAI made three things tractable: (a) scaling oversight without scaling human labelers on traumatic content; (b) making the value specification *explicit and editable* — you change behavior by changing the constitution, not by relabeling data; (c) using model capability itself as supervision, foreshadowing scalable-oversight programs (debate, RLAIF-at-scale, recursive reward modeling).

**Open questions / controversies.**
- **Who writes the constitution?** Anthropic's principles draw from the UN Declaration of Human Rights, Apple's ToS, and in-house judgment. Critics (e.g., the *digi-con.org* essay) argue the legitimacy of "constitution" framing is overstated — there is no ratification, no democratic input. Anthropic's *Collective Constitutional AI* experiment partly responds to this.
- **Specific vs. general principles.** Bai et al. 2023 ("Specific versus General Principles for Constitutional AI", arXiv:2310.13798) found a single principle ("do what's best for humanity") can be surprisingly effective but underperforms on fine-grained harms — there is real tension between brevity and coverage.
- **Faithfulness of AI feedback.** RLAIF labels can encode the feedback model's own biases; recent work (e.g., *Inverse Constitutional AI*, ICLR 2025) tries to reverse-engineer which implicit principles a preference dataset actually optimizes, often revealing drift from the stated constitution.
- **Robustness.** Smaller-scale replications ("Constitution or Collapse?", arXiv:2504.04918) report that on Llama-3-8B the SL stage can degrade general capabilities, suggesting CAI's reported gains depend on a strong helpful-only starting point.

**Key references.**
- Bai et al., 2022. *Constitutional AI: Harmlessness from AI Feedback.* arXiv:2212.08073. <https://arxiv.org/abs/2212.08073>
- Anthropic, 2023. *Claude's Constitution.* <https://www.anthropic.com/news/claudes-constitution>
- Kundu, Bai et al., 2023. *Specific versus General Principles for Constitutional AI.* arXiv:2310.13798.
- Lambert, *RLHF Book*, ch. 13 (Constitutional AI & AI Feedback). <https://rlhfbook.com/c/13-cai.html>
