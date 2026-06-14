---
id: agent-autonomous-science
cluster: agent
concept: Autonomous Scientific Discovery (LLM as Scientist)
status: done
sources:
  - https://sakana.ai/ai-scientist/
  - https://arxiv.org/abs/2502.14297
  - https://arxiv.org/html/2505.13259v1
  - https://github.com/SakanaAI/AI-Scientist-v2
  - https://arxiv.org/abs/2504.08066
generated_at: 2026-04-25
---

镇上的钟表铺传到第三代时，老掌柜病倒，把铺子留给了一个还没出师的徒弟，名叫阿七。

第一年，阿七是听吩咐的手。师父在床头说："今日校那只挂钟的擒纵。"他便去校擒纵；师父说："给王家的怀表换游丝。"他便去换游丝。每一桩活计师父都先验过料，再画好图，他只负责把铜片磨到该有的厚度。镇上人说，阿七是把好钳子，但不是钟表匠。

第二年，师父咳得说不出整句话，只能在纸上写半行字："西头巷那只老座钟，慢。"剩下的，阿七要自己去想：是发条疲了，还是齿轮蚀了，还是摆锤受了潮？他学会了一套排查的次序——先听声，再拆壳，再量摆幅，最后才动锉刀。师父点头的次数变多了，但每修完一只，阿七还是要把表盘端到床前，让那双昏花的眼睛过一遍。镇上人改口说，阿七是个会拆表的伙计。

第三年春天，师父走了。

铺子里只剩阿七一个人。第一桩没人指路的活，是一只从没见过的西洋八音钟，主人只丢下一句"它走得不准，你看着办"就走了。阿七在工作台前坐了三天。第一天他翻遍了师父留下的笔记，没有这种钟的图样；第二天他自己提了一个猜想——也许是温差让黄铜涨缩不均；第三天他造了一个小盒子，盒里放冰，盒外烤炭，把钟搁在中间观察走时的偏差。猜想错了。他又提一个：也许是八音筒的滚轴磨偏了重心，连累了走时机构。这一个，对了一半。

他开始养成一种古怪的习惯：每提一个猜想，就先在纸上写下"如果这是真的，那么明天我应该看到什么"，再去做那个能让猜想活下来或死掉的小实验。猜想死了，他不难过，反而松一口气——又少了一条岔路。猜想活下来了，他也不急着高兴，而是再写一条："还有什么别的解释能让我看到同样的现象？"他把这些纸钉在墙上，钉得密密麻麻，像一棵向四面八方伸枝的树，枯掉的枝条用红笔划掉，活着的继续往下分叉。

到了第三年冬天，镇上来了一位走南闯北的老钟匠，进门转了一圈，盯着墙上那棵纸做的树看了许久，问阿七："你师父教你的？"

阿七摇头："师父教我怎么修钟。提猜想、做小实验、自己判对错——这是钟自己教我的。师父走后，没人再替我验料、画图、点头了。我得既是徒弟，又是师父，还得是那个挑剔的、专门挑我毛病的老主顾。"

老钟匠没说话，只在临走前留下一句："你这铺子，从今往后不是修钟的了。是问钟为什么的地方。"

那年除夕，阿七在账本最后一页写下：第一年我是手，第二年我是脑，第三年我才算是个匠人。手听人指；脑能排次序，但要人点头；匠人提问、试错、自审、再来一遍，没有人在床头等他端表盘过去。

他没意识到自己写下的，正是后来一整代研究者想要让机器学会的事。

---

## Concept and field

**Autonomous Scientific Discovery** — also framed as **"LLM as Scientist" (Level 3 autonomy)** — is an emerging research thread inside the **Agent / LLM-Agents cluster**. It asks whether a language-model-driven system can run the full scientific loop on its own: surveying prior work, proposing falsifiable hypotheses, designing and executing experiments, interpreting results, and writing them up — with humans only setting the high-level scope.

The HKUST-KnowComp survey *From Automation to Autonomy* (Luo et al., 2025) formalizes a three-level taxonomy that the parable mirrors directly:

- **Level 1 — LLM as Tool** (阿七的第一年): the model performs one well-scoped subtask under tight human supervision.
- **Level 2 — LLM as Analyst** (第二年): the model chains multiple analytical steps; humans set goals and validate outputs.
- **Level 3 — LLM as Scientist** (第三年): the system autonomously conducts the major stages of research, from hypothesis formulation to result interpretation, with minimal human involvement.

## Key mechanism

The flagship implementation is Sakana AI's **The AI Scientist** (Lu et al., 2024, published in *Nature*) and its successor **AI Scientist-v2** (Yamada et al., 2025). Their pipeline has four stages:

1. **Idea generation**: the agent brainstorms research directions from a code template, then queries Semantic Scholar to filter out non-novel ideas.
2. **Experimental iteration**: the agent writes code, runs experiments, plots results, and annotates each figure for later use. v2 replaces the linear loop with a **progressive agentic tree search** managed by an "experiment manager" agent that expands and prunes branches of investigation — structurally identical to阿七墙上那棵不断分叉、剪枝的纸树.
3. **Manuscript drafting**: results are written up in LaTeX, with citations retrieved autonomously.
4. **Automated peer review**: an LLM reviewer scores the paper and produces feedback that loops back into the next round of ideas. v2 produced one workshop paper that exceeded the average human acceptance threshold.

The defining shift from Level 2 to Level 3 is **closure of the feedback loop without a human in it**: the agent must be its own critic, its own falsifier, its own next-iteration planner.

## Why it matters

If this loop genuinely closes, the bottleneck of science shifts from researcher-hours to compute, and the rate of hypothesis generation decouples from human cognition. Even partial successes (e.g., AstroAgents' prebiotic chemistry hypotheses, >30% rated plausible by domain experts; an LLM-multi-agent system designing novel SARS-CoV-2 nanobody binders) suggest the loop already produces non-trivial outputs in narrow domains.

## Open questions and controversies

A 2025 critical evaluation by Beel et al. (*arXiv:2502.14297*) is the load-bearing skeptic the reviewer should re-verify:

- **42% of AI-Scientist experiments fail outright** due to coding errors; per-iteration code edits average only 8% character change, suggesting weak adaptive debugging.
- **Novelty filtering is broken**: the system flagged textbook techniques (e.g., micro-batching for SGD) as novel contributions.
- **Citations and structure**: median 5 citations per paper, most pre-2020; placeholder text and hallucinated numbers appeared in finished drafts.

The Luo et al. survey adds five unsolved challenges: fully-cyclic discovery (vs. one-shot runs), robotic/wet-lab integration, transparent reasoning chains, continual self-improvement, and ethical governance of autonomous research.

## Key references

- Lu, Lu, Lange, Foerster, Clune, Ha (2024). *The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery.* https://sakana.ai/ai-scientist/
- Yamada et al. (2025). *The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search.* https://arxiv.org/abs/2504.08066
- Luo et al. (2025). *From Automation to Autonomy: A Survey on Large Language Models in Scientific Discovery.* https://arxiv.org/html/2505.13259v1
- Beel et al. (2025). *Evaluating Sakana's AI Scientist: Bold Claims, Mixed Results, and a Promising Future?* https://arxiv.org/abs/2502.14297
