---
id: agent-react
cluster: agent
concept: ReAct Paradigm
status: done
sources:
  - https://arxiv.org/abs/2210.03629
  - https://react-lm.github.io/
  - https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/
  - https://www.promptingguide.ai/techniques/react
generated_at: 2026-04-25
---

老探长退休前带过最后一个徒弟，名叫阿俞。

阿俞天资极高，记忆里装着上千本案例集，脑子转得比人快三倍。第一次外勤，是城南一桩失踪案：一个开锁匠的女儿三天没回家。老探长把卷宗扔给阿俞，让他先讲讲怎么查。

阿俞坐在桌前，闭着眼，从头讲到尾——讲了二十分钟。他说凶手大概是城北的赌徒，因为开锁匠近来欠债；动机、路线、藏匿点，推得严丝合缝，还顺手画了张时间线。讲完睁眼，颇为得意。

老探长把卷宗合上，说："走，去开锁匠的铺子。"

到了铺子，阿俞还在念叨他的赌徒理论。老探长却只问了开锁匠一句："你女儿走那天，穿的什么鞋？"——开锁匠愣了一下，说是新买的白布鞋。

老探长在门口的泥地上蹲了半晌，抬头对阿俞说："你接着想。"

阿俞继续推：白布鞋容易脏，所以她不会走土路，所以应该往石板街那边去——

"先别想完。"老探长打断他，"你这一句一句往下推，每一步都建立在你脑子里那张时间线上。可你那张时间线，是你自己画的。"他指了指泥地上一道浅浅的车辙，"这道印子，刚才你想了二十分钟也没想出来。"

阿俞不服："我可以把它加进推理里。"

"你要先低头看，再抬头想。"老探长说，"看一眼，想一句；想一句，再去看一眼。看到的东西会推翻你想的，想的东西会告诉你下一眼该看哪儿。你刚才那一长串，哪怕错在第二步，后面十八步全是错的，你也不知道。"

那天傍晚，他们在石板街尽头的一户人家找到了女孩——她躲在那里，因为偷听到父亲要把她许给债主。阿俞的赌徒理论有一半是对的，另一半全错。错的那一半，是他没在第三步就停下来去敲一户邻居的门。

很多年后，阿俞自己也带徒弟了。他给每个新人立的第一条规矩是：

**想一步，动一步，看一眼，再想下一步。**

他说，单凭脑子里的链条，一个人会编出一座完美但虚假的城；单凭手脚去试，又会像没头苍蝇撞遍每一扇门。真正的查案，是让"想"和"做"互相搀着走——想的部分负责决定下一步去看什么、问什么；看到的、问到的，又回过头来纠正想的部分。一条链子，两条腿，交替落地。

他从没给这条规矩起过响亮的名字。但他知道，那年泥地上的车辙，比他脑子里二十分钟的推理，更接近"思考"这件事的本来面目。

---

## ReAct Paradigm

**Cluster:** Agents and tool use (`agent`).

### Concept and field

ReAct ("Reason + Act") is a prompting and control paradigm for LLM agents introduced by Shunyu Yao et al. at ICLR 2023. It is the foundational template for nearly every modern LLM agent framework (LangChain agents, AutoGPT-style loops, tool-using assistants), and the direct ancestor of more recent variants such as Reflexion and ReST-meets-ReAct.

### Key mechanism

ReAct structures an agent's trajectory as an interleaved sequence of three token types:

1. **Thought** — a free-form natural-language reasoning step that plans, decomposes, tracks state, or handles exceptions.
2. **Action** — a structured call into an external tool or environment (e.g. `Search[Eiffel Tower]`, `Click[buy]`, `go to kitchen`).
3. **Observation** — the environment's response, fed back into the context.

The model is prompted (few-shot, originally one or two demonstrations) to generate Thought→Action, then the harness executes the action and appends the Observation; the loop repeats until the model emits a terminal action like `Finish[answer]`. Crucially, *thoughts are not required at every step* — on dense decision tasks like ALFWorld, the model decides when to think versus when to act, so "sparse reasoning" emerges where it is useful.

The synergy claim is two-directional. Reasoning-only agents (chain-of-thought) hallucinate because they have no way to ground intermediate facts; action-only agents (e.g. SayCan, WebGPT-style) cannot recover from errors because they have no scratchpad for plan revision. ReAct makes thoughts *condition on observations* and actions *condition on thoughts*, so each modality corrects the other.

### Why it matters

ReAct was the first paper to show that an LLM, with a handful of in-context examples, can drive a closed-loop agent that interacts with a non-trivial environment. On HotpotQA and FEVER it beat acting-only baselines and matched chain-of-thought while being far less prone to hallucination; on ALFWorld and WebShop it outperformed imitation-learning and RL baselines by 34% and 10% absolute success rate respectively. It established the Thought/Action/Observation trace as the lingua franca for tool-using agents.

### Key references

- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., Cao, Y. (2022). *ReAct: Synergizing Reasoning and Acting in Language Models.* ICLR 2023. https://arxiv.org/abs/2210.03629
- Project page with trajectories: https://react-lm.github.io/
- Google Research blog post: https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/

### Open questions and known limitations

- **Failure on long-horizon tasks.** ReAct's loop has no explicit memory or self-correction mechanism beyond the running context; once it commits to a wrong sub-plan it tends to perseverate. This motivated Reflexion (Shinn et al., 2023), which adds verbal self-critique.
- **Prompt sensitivity.** Performance depends heavily on the exemplars and on the action-space schema; small wording changes can collapse the agent.
- **Reasoning trace fidelity.** The "thoughts" are post-hoc rationalisations as often as they are causal plans — a concern shared with chain-of-thought interpretability work.
- **Scaling via fine-tuning vs. prompting.** The original paper showed fine-tuned small models with ReAct traces beat prompted larger ones; ReST-meets-ReAct (Aksitov et al., ICLR 2024) extends this with self-improvement loops, but how much of the gain comes from the *format* versus the *training signal* remains debated.
