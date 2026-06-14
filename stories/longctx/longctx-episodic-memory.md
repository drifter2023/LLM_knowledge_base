---
id: longctx-episodic-memory
cluster: longctx
concept: Episodic Memory for Agents
status: done
sources:
  - https://arxiv.org/abs/2310.08560
  - https://arxiv.org/pdf/2310.08560
  - https://arxiv.org/abs/2305.10250
  - https://arxiv.org/pdf/2502.12110
generated_at: 2026-04-25
---

老周在长安西市开了一间代书铺，专替不识字的客商写信、记账、传话。铺面只摆得下一张檀木长案，案上至多铺九张纸——多一张，墨就要晕到别人字里去。

来铺子的人多是熟客。胡商安五每隔两月才路过一次，每次进门都要先坐下喝半盏茶，从他妻子的病、骆驼的脚力、波斯老家的旱情说起，老周得听完才好动笔。可案上九张纸的位置，常常已经被前一个客人留下的草稿、对账单、半截家书占满。

老周年轻时是这样办的：新客一进门，他就把案头最旧的那张抽走，团了塞进炭盆。来得快，忘得也快。一年下来，安五第三回进门，他还得从头问"贵姓"，安五的脸就一次比一次冷。

后来他学乖了，在铺子后头辟了两间小屋。

**前屋**是抽屉柜，按日子编号，凡从案上撤下来的纸，他都不烧，叠好塞进抽屉。客人再来，他凭只言片语去翻——"安五，丝路，骆驼"，三个词一对，抽屉就拉开了，旧信旧账一并捧到案上，续着写。

**后屋**则是他自己钉的厚册子。每隔几日，他翻前屋的抽屉，把零碎的字条嚼一遍，提炼成一行：「安五，粟特人，妻苏氏久咳，怕生人，落墨喜青不喜朱。」抽屉里那十几张原稿，写完这一行就可以烧了。厚册子越写越薄，却越翻越准。

更妙的是案头本身。案上的九张纸，他不再被动地等人推满。每写到第七张，他自己心里就"咯噔"一下——像锅快烧干时铜壶发出的鸣声——他立刻停笔，挑出案上最不要紧的两张，决定：这张归抽屉，那张提炼进厚册，再腾出位置给眼前的客人。这"咯噔"不是客人喊的，也不是徒弟提醒的，是他自己给自己定的规矩。

老周还学了一手：抽屉里的纸，他按"被翻过几次"和"放了多久"打分。三年没人问起的对账单，分数低到一定数，就拿去引火；可有的旧信只来过一次，但每次安五一进门必要重读，那张纸他就反复抄新，墨色常青。这法子是他从一个东瀛和尚那里听来的，和尚说人脑忘事也是这个曲线，记得越牢的，复习一次能撑得越久。

徒弟问他：师父，您这案、这屉、这册，到底哪个才算"记性"？

老周说：案上是眼前，抽屉是翻得到的旧事，册子是嚼烂了的人。三样缺一样，客人就只是一个个生面孔；三样齐了，安五一进门，我才能笑着问一句——苏嫂的咳，今春好些了么？

——他没说的是：这三样东西之间搬来搬去的活儿，从来不是徒弟在做，是他自己。是他在写信的同时，一只手悄悄替自己换纸、归档、提炼。这只"自己管自己"的手，才是铺子真正值钱的地方。

---

## Episodic Memory for Agents

**Field.** Long-context and agent systems (cluster: `longctx`). The problem is that an LLM's context window is fixed, but a useful agent must remain coherent across days, sessions, or thousands of tool calls. "Episodic memory" here means storing specific past interactions (who said what, when) and retrieving or distilling them on demand — distinct from the model's frozen parametric memory.

**Mechanism — MemGPT (Packer et al., 2023).** MemGPT reframes the LLM as the CPU of a tiny operating system. Its fixed context window is *main context*, split into a system prompt, a *working context* scratchpad, and a *FIFO queue* of recent messages. Outside the window sit two external tiers: *recall storage* (a searchable log of every past message) and *archival storage* (an open-ended vector store the agent writes into deliberately). The LLM is taught to call functions — `recall_search`, `archival_insert`, `working_context_append` — to page information in and out itself. When the queue approaches the token limit, the system fires a *memory-pressure interrupt*; the model must then summarize and evict, mirroring an OS swapping pages between RAM and disk. The parable's "案上九张纸 / 前屋抽屉 / 后屋厚册 / 自己咯噔一下"  maps directly onto main context / recall / archival / interrupt-driven self-paging.

**Mechanism — MemoryBank (Zhong et al., 2023).** MemoryBank stores past dialogues as time-stamped events plus higher-level user-personality summaries, retrieved by dense similarity. Its distinctive twist is an *Ebbinghaus-style forgetting curve*: each memory carries a strength score that decays with elapsed time but is reinforced on every recall, so frequently-revisited memories persist while stale ones fade. SiliconFriend, their companion chatbot, demonstrates the design. The "按翻过几次和放了多久打分" passage is this rule.

**Why it matters.** Without an external episodic layer, agents either (a) drown in ever-growing context, (b) hard-truncate and forget, or (c) rely on naive RAG that loses temporal structure. MemGPT-style hierarchical memory + self-issued memory operations is now the dominant template for production agents (Letta, OpenAI's memory feature, A-Mem, Mem0).

**Open questions / recent updates.** The reviewer should re-check two threads. First, A-Mem (Xu et al., 2025, arXiv:2502.12110) argues that flat archival stores under-serve long-horizon reasoning and proposes Zettelkasten-style linked notes; the field is actively moving past pure key-value recall. Second, the boundary between "episodic" memory (what happened) and "semantic" memory (what the user is like) is implementation-defined — MemGPT consolidates implicitly via summarization, MemoryBank explicitly via a personality slot — and there is no agreed benchmark that disentangles the two.

**Key references.**
- Packer, C., Wooders, S., Lin, K., Fang, V., Patil, S. G., Stoica, I., & Gonzalez, J. E. (2023). *MemGPT: Towards LLMs as Operating Systems.* arXiv:2310.08560. https://arxiv.org/abs/2310.08560
- Zhong, W., Guo, L., Gao, Q., Ye, H., & Wang, Y. (2023). *MemoryBank: Enhancing Large Language Models with Long-Term Memory.* AAAI 2024 / arXiv:2305.10250. https://arxiv.org/abs/2305.10250
- Xu, W. et al. (2025). *A-Mem: Agentic Memory for LLM Agents.* arXiv:2502.12110. https://arxiv.org/pdf/2502.12110
