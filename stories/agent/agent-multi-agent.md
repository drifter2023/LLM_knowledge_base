---
id: agent-multi-agent
cluster: agent
concept: Multi-Agent Coordination
status: done
sources:
  - https://arxiv.org/abs/2308.08155
  - https://arxiv.org/abs/2307.07924
  - https://arxiv.org/html/2307.07924v5
  - https://arxiv.org/abs/2308.00352
  - https://aimaker.substack.com/p/grok-4-20-multi-agent-ai-debate-llm-council
  - https://medium.com/@lmpo/grok-4-unveiled-how-xais-multi-agent-ai-is-redefining-intelligence-2df105291e81
generated_at: 2026-04-25
---

民国十九年,沪上「明远建筑社」接了一桩急单——三个月内,在浦东芦苇地里造一栋三层洋楼。社长林明远不肯亲自下场,他把图纸摊在长条木桌上,叫来六个人。

第一个是周伯,挂「东家」的名,负责对客户讲话,把客户那句「我要一栋气派一点的」翻成「正立面带回廊,层高三米六,西式柱式」。第二个是徐工程师,挂「大匠」的名,只关心结构与材料能不能撑住周伯许下的那些气派。第三个是阿宝,刚从同济出来的画图匠,只管落笔成图。第四个是老吴,泥水出身,看图时专挑「这梁画得好看,可砌不出来」的毛病。第五个是小林,验收员,拿尺子和水平仪,洋楼建成那日他要爬上去敲每一块砖。最后一个是没有名字的人,大家叫他「拗相公」,他的差事只有一桩:无论别人说什么,他都要先反对一遍。

林明远立了一条规矩:任何一道工序,先由上一个人交给下一个人,下一个人若有疑问,必须把话题倒过来,反问上一个人,直到两个人都点头,才能往下传。比如阿宝拿到徐工程师的结构方案,觉得西墙那道承重梁画得含糊,他不许猜,他要停下笔,反过去问:「徐先生,这梁是吃竖向荷载,还是兼吃横向风载?」徐工程师答清楚了,阿宝才动笔。林明远说,匠人最怕的不是不会,是不会装作会——一装,图纸上就凭空多出一根不存在的梁,砌到一半才塌。这条「不许装会」的铁律,他写在木桌正中,墨迹很黑。

工程过半,客户忽然加价,要求屋顶再加一座观星台。林明远没有开会,他做了一件奇怪的事:他把同一道难题,抄了四份,分给徐工程师、阿宝、老吴、拗相公,叫他们各自闭门一个时辰,不许通气。一个时辰后,四张纸条收上来。徐工程师说「加钢梁」,阿宝说「改木桁架」,老吴说「这地基撑不住,得先补桩」,拗相公照例反对前三人,说「观星台本身就是错的,客户其实想要的是露台」。林明远把四张纸条并排钉在木桌上,自己不表态,只让四人互相批驳:钢梁派要回答地基派的质疑,木桁架派要回答拗相公的诘问。批驳了两轮,弱的论点自己枯萎,剩下的拼出一张谁也没单独想到的图——补桩、木桁架、外加一道露台兼观星的折中。林明远把这张拼出来的图,交给小林去验。

洋楼如期落成那一天,客户问林明远:「你六个人,怎么不打架?」林明远指着木桌正中那行墨字,说:「他们打,但只许照规矩打。一句一句传,是为了不让谎话蒙混过去;一题四份分头做,是为了不让一个人的盲点变成全社的盲点;留一个专唱反调的,是怕大家太客气。我不是社长,我是把这些规矩钉在桌上的人。」

客户没听懂。他只看见六个人,一栋楼,和桌上一块写满批注的木板。

---

## Concept and field

**Multi-Agent Coordination** for LLMs sits in the **Agent / Tool-Use cluster**. It refers to architectures in which several LLM-driven agents — each with a distinct role, prompt, or toolset — exchange messages to solve a task that a single agent (even with a long context) cannot reliably solve alone.

## Key mechanisms

Three patterns dominate the 2023–2026 literature, and the parable encodes each:

1. **Role specialization + chat chain (ChatDev, MetaGPT).** ChatDev (Qian et al., 2023) decomposes software development into a *waterfall chat chain*: design → coding → testing, with sub-phases. Specialized agents — CEO, CTO, programmer, reviewer, tester — pass artifacts down the chain. Crucially, ChatDev introduces **communicative dehallucination**: the receiving agent is forbidden from guessing under-specified inputs and must perform *role reversal*, interrogating the sender until ambiguity is resolved. The paper reports that 34.85% of code-review issues were "method not implemented" and 45.76% of test failures were `ModuleNotFound` — the kind of silent fabrication this protocol attacks. MetaGPT (Hong et al., 2023) generalizes this with **standardized operating procedures (SOPs)** that force structured artifacts (PRDs, class diagrams) between stages rather than free-form chat.

2. **Conversable agents as a programming primitive (AutoGen).** AutoGen (Wu et al., 2023) treats every actor — LLM, human, tool-runner — as a `ConversableAgent` with a uniform message interface. Workflows are written as conversation patterns (two-agent, group chat, hierarchical), not as imperative pipelines. This makes coordination *programmable*: termination conditions, speaker selection, and tool invocation are all expressible inside the chat protocol.

3. **Parallel debate / ensemble synthesis (Grok 4 Heavy, 2025).** xAI's Grok 4 Heavy spawns multiple Grok 4 instances in parallel — reportedly 4 in standard mode, up to 16 in SuperGrok Heavy — with distinct system prompts (researcher, analyst, contrarian, captain-synthesizer). Agents reason independently, then critique one another; a captain agent reconciles disagreements. xAI claims a ~65% hallucination reduction (12% → 4.2%) and Grok 4 Heavy was the first system to exceed 40% on Humanity's Last Exam. This is conceptually close to **LLM-as-a-Judge** ensembles and **self-consistency**, but with heterogeneous role priors rather than i.i.d. sampling.

## Why it matters

A single LLM call entangles planning, recall, verification, and synthesis. Multi-agent coordination *externalizes* the dependency graph: separate agents specialize, communicate explicitly, and the protocol enforces invariants (no fabrication, structured handoffs, adversarial review) that are hard to enforce inside one model's hidden state. This is the core of the 2025 "agentic" stack — AutoGen, LangGraph, CrewAI all inherit it.

## Open questions and controversies

- **Is multi-agent actually better than one strong model?** Cemri et al. (2025, "Why Do Multi-Agent LLM Systems Fail?", arXiv:2503.13657) catalog 14 failure modes — specification leakage, inter-agent miscommunication, premature termination — and find many multi-agent gains disappear when the base model is upgraded.
- **Cost vs. benefit.** Grok 4 Heavy's 16-agent debate multiplies inference cost ~16×; whether the marginal accuracy is worth it outside benchmark settings is contested.
- **Echo chambers.** Agents sharing weights and priors often reinforce each other's errors. The "contrarian" role in Grok 4.20 is a deliberate hack against this; whether prompt-induced disagreement is a real safeguard or theater remains open.

## Key references

- Wu, Bansal, Zhang, et al. (2023). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation.* arXiv:2308.08155. <https://arxiv.org/abs/2308.08155>
- Qian, Liu, Liu, et al. (2023, ACL 2024). *ChatDev: Communicative Agents for Software Development.* arXiv:2307.07924. <https://arxiv.org/abs/2307.07924>
- Hong, Zhuge, Chen, et al. (2023, ICLR 2024). *MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework.* arXiv:2308.00352. <https://arxiv.org/abs/2308.00352>
- xAI (2025). *Grok 4 / Grok 4 Heavy multi-agent paradigm.* <https://docs.x.ai/developers/model-capabilities/text/multi-agent>
