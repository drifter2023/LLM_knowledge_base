---
id: itc-parallel-vs-sequential
cluster: itc
concept: Parallel vs Sequential Scaling (Test-Time Compute)
status: done
sources:
  - https://arxiv.org/html/2408.03314v1
  - https://lilianweng.github.io/posts/2025-05-01-thinking/
  - https://letters.lossfunk.com/p/sequential-scaling-outperforms-parallel
  - https://arxiv.org/html/2502.12215v1
  - https://www.marktechpost.com/2025/09/08/parathinker-scaling-llm-test-time-compute-with-native-parallel-thinking-to-overcome-tunnel-vision-in-sequential-reasoning/
generated_at: 2026-04-25
---

清河县的县衙后堂，老知县把一桩疑案交到两位刑名师爷手里，限他们三日破案。卷宗只有一份，案情却盘根错节：一个绸缎商死在自家后院，家中有妻、有妾、有学徒、有账房，每个人都有半截不在场证明。

老知县只给了一个条件：三日之内，每人最多动用三百两银子的盘缠去查访。银子是同一个数。

左师爷姓罗，做事讲究"一条线追到底"。他派一个机灵的小吏出门，第一天先去访邻居，回来禀报。罗师爷听完，皱眉，又叫小吏拿着初步结论去找账房对账。账房口风一松，小吏当夜回来，罗师爷又把所有线索摊在案上，重新审视——昨天怀疑的妾室，今天看来反而清白；账目里某一笔生丝的去向才是要害。第三天，罗师爷叫小吏带着前两轮的全部底稿去逼问学徒。学徒被问得心慌，吐出了关键的一句话。罗师爷在烛下慢慢把三轮笔录拼成一张完整的供述——破案。

右师爷姓宋，做事讲究"广撒网"。他把三百两均分成六份，雇了六个市井闲汉，各发一份卷宗的抄本，分头去查不同的人。三天后六人陆续回来，六份口供摊在桌上：三个咬定是妾，两个咬定是账房，一个含糊。宋师爷召集衙役按多数投票，定了妾室的罪。

老知县看完两份呈报，先夸罗师爷思路清明，转头却问："若死者不是绸缎商，而是码头上一具无名浮尸呢？"

罗师爷愣住。无名浮尸——他那条"昨天的线索喂今天"的链条，第一天就无从开头。一旦小吏第一日的访问走错了方向，第二日是顺着错处继续走，第三日是把错处当作铁证去逼供。错得越久，越像真的。罗师爷只在烛下复盘，自己看不见自己的盲点。这正是宋师爷六张嘴的好处：六个闲汉互不通气，错也错得各不相同，多数票反而能把孤立的偏见洗掉。

老知县捻着胡须道："简单的案子，一个聪明人顺藤摸瓜就够了，越摸越深。难的案子，要先撒网捞起所有可能，再回头慢慢理。你们俩，谁也不是错的——错的是把自己那一套当成了万灵。"

他随即提笔，在卷宗上批了八个字：易者循之，难者群之。

三日后，清河县又来一桩新案。罗师爷与宋师爷这回并肩坐下：先让六个闲汉撒网摸出三五条互不重叠的可能线索，再由罗师爷挑出最有指望的一条，逐日深究下去。预算还是三百两，破案却快了一倍。

---

## Concept and Field

**Parallel vs Sequential Scaling** is a core dichotomy in **inference-time compute (ITC)** — the cluster of techniques that trade extra test-time FLOPs for higher answer quality, instead of (or on top of) scaling pre-training. The two axes are:

- **Parallel scaling** — sample N independent reasoning trajectories from the same prompt and aggregate (majority vote / self-consistency / best-of-N with a verifier or reward model).
- **Sequential scaling** — generate one long chain-of-thought, or iteratively revise a draft, where each step is conditioned on the full prior history (reflection, self-correction, o1/R1-style "thinking longer").

## Key Mechanism

Snell et al. (2024) framed the tradeoff explicitly: parallel sampling is *global search* over high-level strategies, while sequential revision is *local refinement* of a promising draft. Their main empirical finding is **difficulty-conditioned**: on easy questions sequential revision dominates (the base model's first draft is roughly right and just needs polish); on hard questions an optimal *mix* wins, because the model needs both diverse strategy proposals and per-strategy refinement. Allocating compute by predicted difficulty yields ~4× efficiency over pure best-of-N.

The picture is not settled, however. **Chen et al. (2025)** ("Revisiting the Test-Time Scaling of o1-like Models", arXiv 2502.12215) showed that for QwQ, R1-Distill, and LIMO, sequential scaling has weak self-revision: models keep their original (often wrong) answer in >70% of revision attempts and sometimes flip correct answers to incorrect ones; per-token, parallel sampling gives strictly better coverage. They propose **Shortest Majority Vote** — parallel sampling weighted by chain length, since correct chains tend to be shorter. **ParaThinker** (Tsinghua, Sep 2025, arXiv 2509.04475) names the failure mode "tunnel vision": once a sequential chain commits to a bad prefix, additional thinking budget makes things monotonically worse, and the only escape is native multi-path generation.

## Why It Matters

This tradeoff structures the entire ITC design space. Self-consistency (Wang et al. 2022), best-of-N with PRMs, Tree-of-Thoughts, MCTS-style search, o1/R1 long CoT, and Forest-of-Thought are all points on the parallel↔sequential spectrum. Knowing which axis to scale — and how to allocate a fixed token budget between them — directly determines whether spending 10× compute at inference actually buys you accuracy or just longer wrong answers.

## Key References

- Snell, Lee, Xu, Kumar (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
- Chen et al. (2025). *Revisiting the Test-Time Scaling of o1-like Models.* [arXiv:2502.12215](https://arxiv.org/html/2502.12215v1)
- Wen et al. (2025). *ParaThinker: Native Parallel Thinking to Overcome Tunnel Vision.* [MarkTechPost summary](https://www.marktechpost.com/2025/09/08/parathinker-scaling-llm-test-time-compute-with-native-parallel-thinking-to-overcome-tunnel-vision-in-sequential-reasoning/)
- Weng, L. (2025). *Why We Think.* [Lil'Log](https://lilianweng.github.io/posts/2025-05-01-thinking/)

## Open Questions

- Does the Snell et al. "easy → sequential, hard → mix" rule survive on RLVR-trained reasoning models, where the sequential chain is the *trained* behavior rather than a prompted afterthought? Chen et al. and ParaThinker suggest tunnel vision is a real regression.
- Token-matched vs wall-clock-matched comparisons give different winners (sequential pays quadratic attention cost) — fair-comparison protocols are still contested.
