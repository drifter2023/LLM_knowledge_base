---
id: agent-benchmarks
cluster: agent
concept: Agent Benchmarks (GAIA, SWE-Bench, WebArena, OSWorld, AgentBench)
status: done
sources:
  - https://arxiv.org/abs/2311.12983
  - https://arxiv.org/abs/2310.06770
  - https://arxiv.org/abs/2307.13854
  - https://arxiv.org/abs/2404.07972
  - https://arxiv.org/abs/2308.03688
  - https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
  - https://arxiv.org/html/2506.12286v3
generated_at: 2026-04-25
---

驾校的老校长退休那年,把考核手册整个推翻重写。

新来的年轻教练第一天来上课,看见院子里停着五辆车,每辆车前都立着一块牌子。

第一块牌子写着"问路"。学员上车,考官递过去一张写满古怪问题的纸:从这里开车去三家旧书店,把每家最贵的那本绝版小说的出版年份加起来,告诉我答案。学员要会查地图、会打电话、会进店翻书、会算账。校长说:"这题不难,街上随便一个老太太花一下午都能办成。可是上届考生里,十个有九个交白卷。"

第二块牌子写着"修车"。考场后面停着一排旧车,每辆都贴着一张真实的车主投诉单——刹车异响、空调漏水、发动机抖。学员要钻到车底,翻零件手册,找到那个出过毛病的螺丝,换掉,然后把车开上测试台,跑完一整套老师傅早就写好的检测程序,全部通过才算赢。校长强调:"投诉单是从修理厂真账本里抄来的,不是我编的。"

第三块牌子写着"跑腿"。这是一座微缩的小镇模型,有杂货铺、有论坛公告板、有镇政府办公网站,全部能用。考题是:替张大妈在杂货铺下个单,顺便去论坛回一个三天前的帖子,再帮她把社保表填好提交。每一步都有真实的后台在记录,你不能靠嘴上说"我做完了",系统得真看到订单生成、帖子发出、表格入库。

第四块牌子写着"上机"。一台真的电脑,装着真的操作系统、真的办公软件、真的浏览器。考题写在便条上:把这个表格里所有姓王的人筛出来,做成幻灯片,通过邮件发给老李。考官不看你点了哪些按钮,只看最后老李有没有真的收到那封邮件,附件对不对。

第五块牌子前没有车,只有八张桌子,每张桌子代表一个完全不同的小世界——下棋、写代码、逛网店、查数据库……学员要在八张桌子之间转一圈,每张都坐下来打一仗。校长说:"我想看看,一个人到底是只会一样,还是真有那种通用的脑子。"

年轻教练走完一圈,皱眉问:"老人家,以前考试不就是笔试加路考吗?哪用得着这么折腾?"

校长摇头:"以前我们考的是'背没背过交规',他们考过了,上路还是撞人。现在我不再问他知道什么,我只问他能不能把一件真事从头办到尾,办完之后世界真的变了样。"

教练又问:"那为什么要五块牌子?一块不够吗?"

校长盯着第二块牌子看了很久,慢慢说:"因为有的学员太聪明,会去翻往年的考题集,把答案背下来。我设五个不同的场子,就是想让他们没法靠记忆混过去——可即便如此,前阵子还是有人把第二块牌子的题库给摸透了,我现在正打算把那一关整个换掉。"

他叹了口气:"考一个会办事的人,比考一个会答题的人,要难得多。"

---

## Concept and field

**Agent Benchmarks** are the dominant evaluation paradigm for LLM-based autonomous agents — systems that plan, call tools, browse, write code, and interact with environments rather than merely answering questions. They sit in the **Agents / Tool-Use cluster** of LLM research and have largely replaced static QA benchmarks as the headline metric for frontier-model "agentic" capability.

## Key mechanisms

The five canonical suites in the parable map directly to:

1. **GAIA** (Mialon et al., 2023) — 466 questions easy for humans (92%) but hard for GPT-4 with plugins (15%). Each question requires *composition* of web browsing, multimodal perception, and tool use to reach a single short answer. Philosophy: don't chase superhuman tasks; measure robustness on tasks the average person can do.
2. **SWE-Bench** (Jimenez et al., 2023) — 2,294 real GitHub issue/PR pairs from 12 Python repos. The agent receives the issue text and the repo, must produce a patch, and is graded by whether the project's hidden test suite passes. *Execution-based*, not text-similarity.
3. **WebArena** (Zhou et al., 2023) — 812 long-horizon tasks across four self-hosted, fully-functional websites (e-commerce, Reddit-like forum, GitLab, CMS). Evaluation is *functional*: did the database actually change to the desired state? Best GPT-4 agent: 14.4%; humans: 78.2%.
4. **OSWorld** (Xie et al., NeurIPS 2024) — 369 tasks in real Ubuntu/Windows/macOS VMs with real apps (LibreOffice, VSCode, Chrome). Each task ships an init-state script and an execution-based check. Best model ~12%; humans ~72%.
5. **AgentBench** (Liu et al., ICLR 2024) — eight heterogeneous environments (OS, DB, KG, card game, lateral thinking puzzles, web shop, web browsing, code) used jointly to probe whether agentic skill *generalizes* across domains.

The shared design pattern: **(a) ground tasks in real artifacts, (b) evaluate by execution / state change, not string match, (c) report a wide human-vs-model gap** to leave headroom.

## Why it matters

These benchmarks defined what "agent capability" even means operationally, and made progress legible: GPT-4-era 14% on WebArena → Claude/GPT-5-era >50% within two years; sub-5% on SWE-Bench → >70% on SWE-Bench Verified. They turned vague claims about "AI assistants" into pass-rate curves that labs, regulators, and product teams can read.

## Open questions and recent controversies

- **Contamination of SWE-Bench.** In February 2026 OpenAI publicly announced it would no longer report SWE-Bench Verified scores, citing both flawed test design (~59% of audited problems had material issues) and training-data leakage: GitHub issues and PRs entered Common Crawl / The Stack, and models were observed reproducing exact patches — including original variable names and comments — that did not appear in the prompt. The "SWE-Bench Illusion" paper (arXiv:2506.12286) and SWE-Rebench (using post-cutoff 2025 issues) both argue that headline gains are partly memorization. Replacement suites: **SWE-Bench Pro**, **SWE-Rebench**.
- **Construct validity for GAIA / WebArena / OSWorld.** Agents can shortcut tasks via web search rather than the intended reasoning chain; reproducibility of WebArena depends on freezing the bundled site versions; OSWorld task scripts are sensitive to UI updates in the bundled apps.
- **Cross-benchmark transfer is weak.** AgentBench's own finding — that strong performance in one environment rarely predicts another — has been reproduced repeatedly, suggesting "agentic ability" is not a single latent skill but a basket of fragile skills.

## Key references

- Mialon, Fourrier, Swift, Wolf, LeCun, Scialom (2023). *GAIA: a Benchmark for General AI Assistants.* arXiv:2311.12983. https://arxiv.org/abs/2311.12983
- Jimenez, Yang, Wettig, Yao, Pei, Press, Narasimhan (2023, ICLR 2024). *SWE-bench: Can Language Models Resolve Real-World GitHub Issues?* arXiv:2310.06770. https://arxiv.org/abs/2310.06770
- Zhou et al. (2023, ICLR 2024). *WebArena: A Realistic Web Environment for Building Autonomous Agents.* arXiv:2307.13854. https://arxiv.org/abs/2307.13854
- Xie et al. (NeurIPS 2024). *OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments.* arXiv:2404.07972. https://arxiv.org/abs/2404.07972
- Liu et al. (ICLR 2024). *AgentBench: Evaluating LLMs as Agents.* arXiv:2308.03688. https://arxiv.org/abs/2308.03688
- OpenAI (Feb 2026). *Why we no longer evaluate SWE-bench Verified.* https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
