---
id: agent-rl
cluster: agent
concept: Agentic RL (Multi-turn RL for LLM Agents)
status: done
sources:
  - https://arxiv.org/abs/2504.20073
  - https://arxiv.org/abs/2503.09516
  - https://arxiv.org/abs/2509.02547
  - https://arxiv.org/abs/2510.01132
generated_at: 2026-04-25
---

林师傅在城南开了一间侦探事务所,带过的徒弟里,只有阿岚最让他头疼。

阿岚天分极高,看一眼现场就能写出漂亮的推理报告。可这事务所接的不是写报告的活,是要徒弟亲自跑街——去茶馆问话,去档案馆翻卷宗,去当铺验信物,一桩案子常常要来回七八趟。每跑一趟,街上的风向、证人的脸色都会变,上一句问出来的话决定下一步该去哪。

林师傅一开始按老规矩教:每跑完一趟,他就在徒弟的笔记上批一句"问得好"或"问得糙"。阿岚学得飞快,单看每一句问话都漂亮极了。可结案率反而下降了。林师傅翻她的卷宗,发现一件怪事——阿岚问的每一句单独看都有理,可七八趟连起来,常常自相矛盾:第二趟去当铺验过的信物,第五趟又跑回去重验一次;明明第三趟已经排除了嫌疑人甲,第六趟又绕回去盘问他。每一步都"漂亮",合起来却是一团乱麻。

林师傅琢磨了几夜,改了规矩。他不再逐句点评,而是等阿岚把整桩案子从头跑到尾,只看最后结案对不对、用了几趟、耗了几两银。对就是对,错就是错,中间每一句问话不再单独打分。

头一个月,事情更糟了。阿岚陷入一种古怪的循环:她发现某种开场白偶尔奏效,就开始把每桩案子都用同样的开场白起手,哪怕案情天差地别。报酬一会儿暴涨一会儿归零,她的笔记越写越像背诵,推理的影子反倒淡了。林师傅看出门道——徒弟在拿一两次的侥幸当公式,把"碰巧成了"误当"应当如此"。他给阿岚立了三条新规:一,每桩案子开头要从不同的街口起步,不准总走熟路;二,只有那些过程里真正有犹豫、有改主意的卷宗才算数,从头到尾顺得离谱的不计入考核;三,推理写在问话之前,不准事后补。

更要紧的是,他把"师父"这个角色也拆成两半。一半的他,只管最后一锤定音的对错;另一半的他,坐在事务所里,实时估算徒弟此刻这一步"看上去离结案还有多远",作为缓冲,免得最终的对错信号一路炸回开头,把每一步都震得失了形。

半年之后,阿岚跑案子的样子变了。她不再追求每一句都漂亮,而是会在第三趟故意问一句看似多余的话——只为给第五趟留个回旋的余地。她学会了在街上走,而不是在纸上走。

林师傅在给同行的信里写:教一个徒弟写一份漂亮的报告,和教一个徒弟在变化的街市里跑完一整桩案子,是两回事。前者你给他批每一行,后者你只能等他跑完,再回头一起算账——可你得防着他把侥幸当公式,把套话当推理。

---

## Concept and field

**Agentic RL** (also called *multi-turn agent RL*) belongs to the **Agent / tool-use cluster** of LLM research. It refers to training paradigms that take an LLM beyond single-prompt response generation and optimize it as a sequential decision-maker that interacts with a stochastic environment — a search engine, a sandboxed shell, a game, a database — over many turns before a reward arrives. Formally, it shifts the underlying problem from the single-step MDP that classical RLHF/RLVR assumes to a temporally extended, partially observable MDP (POMDP), where the policy must reason about state, tool outputs, and its own past actions (Zhang et al., 2025, *The Landscape of Agentic RL for LLMs*).

## Key mechanism

Two 2025 systems anchor the concept:

- **RAGEN / StarPO** (Wang et al., 2025) introduces *State-Thinking-Actions-Reward Policy Optimization*: rollouts are full multi-turn trajectories `(s₀, think₀, act₀, obs₁, think₁, …, r_T)`; the policy gradient is computed over the entire trajectory rather than per-token within a single response. The paper documents an "Echo Trap" failure mode — reward variance cliffs and gradient spikes where the policy collapses onto a few high-reward templates — and proposes StarPO-S, which adds trajectory filtering, a value critic, and gradient clipping. They also find that diverse initial states, *medium* interaction granularity, and frequent rollout resampling are necessary for stable training.
- **Search-R1** (Jin et al., 2025) embeds a retrieval engine directly inside the RL loop. The model emits `<search>` queries during reasoning; the environment executes them and splices results back into context. Crucially, retrieved tokens are **masked from the policy gradient** (the model is not credited or penalized for content it didn't generate), and only an **outcome-based reward** on the final answer is used. With PPO/GRPO over Qwen2.5, this beats prompted RAG by 20–41% on seven QA benchmarks.

The unifying recipe: long horizons, tool-mediated state transitions, sparse outcome rewards, and gradient surgery (masking, filtering, critic baselines) to keep multi-turn credit assignment from exploding.

## Why it matters

Static RLHF treats each user turn as the world. Real agent tasks — web research, software engineering, scientific tool use — require the model to plan, observe, replan, and recover across many turns where each action mutates the environment. Agentic RL is the first training paradigm that actually optimizes that loop end-to-end rather than imitating it via SFT on synthetic trajectories. It is the missing rung between RLVR (verifiable single answer) and fully autonomous agents.

## Key references

- Wang, Z. et al. (2025). *RAGEN: Understanding Self-Evolution in LLM Agents via Multi-Turn Reinforcement Learning.* arXiv:2504.20073. https://arxiv.org/abs/2504.20073
- Jin, B. et al. (2025). *Search-R1: Training LLMs to Reason and Leverage Search Engines with Reinforcement Learning.* COLM 2025. https://arxiv.org/abs/2503.09516
- Zhang, G. et al. (2025). *The Landscape of Agentic Reinforcement Learning for LLMs: A Survey.* arXiv:2509.02547. https://arxiv.org/abs/2509.02547
- *A Practitioner's Guide to Multi-turn Agentic Reinforcement Learning* (2025). arXiv:2510.01132. https://arxiv.org/abs/2510.01132

## Open questions

- **Reward shaping vs. outcome-only.** Search-R1 succeeds with outcome rewards; RAGEN finds outcome-only rewards lead to "hallucinated thoughts" without reasoning-aware shaping. The right granularity is unresolved.
- **Echo Trap generality.** Whether the collapse mode RAGEN documents is fundamental to multi-turn RL or an artifact of small-model / small-rollout regimes is still debated in follow-up work.
- **Capability boundary.** The Yue et al. 2025 critique of RLVR — that RL mostly sharpens base-model capability rather than discovering new skills — has not been systematically tested on the agentic setting; it is an open question whether agentic RL teaches genuinely new tool-use behaviors or merely amplifies what the base model can already do with good prompting.
