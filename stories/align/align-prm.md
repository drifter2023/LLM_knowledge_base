---
id: align-prm
cluster: align
concept: Process Reward Models (PRM)
status: done
sources:
  - https://arxiv.org/abs/2312.08935
  - https://arxiv.org/abs/2501.07301
  - https://arxiv.org/pdf/2305.20050
  - https://www.stephendiehl.com/posts/process_reward/
generated_at: 2026-04-25
---

县衙里堂审一桩盗银案，主簿姓周，专管核卷。

旧年的规矩很简单：差役破案归来，递上口供与赃物，知县只问一句——"人对了没有？银找回来没有？"对了便记功，错了便记过。周主簿初到时也照此办事，案卷堆得再厚，他也只翻最后一页。

可这年开春，城里接连出了三桩怪事。第一桩，差役拿了人，银也起出来了，知县记功；半月后才发现，那人是被屈打成招的，真贼早已远遁。第二桩，差役顺藤摸瓜抓了七户人家，最后一户确是真凶，前六户被无辜羁押了二十余日。第三桩更荒唐——差役一路糊涂办案，途中证据互相矛盾，可巧合之下最末抓的人正好认了罪，于是"功"也照记。

周主簿翻这些卷宗，越看越心惊。他对知县说：「老爷，光看末页不行了。一份卷子从头到尾十几道关口，每一关都可能走岔。我请求改章程：以后每办一道关口，便要在卷边盖一枚朱印或墨印——朱印为通，墨印为偏。差役领功，不再凭末页，而凭卷边朱印的密度。」

知县皱眉：「那谁来盖这印？你一人核得过来么？」

周主簿想了七日，献上一法。他说：「我不必逐句去判每一步对不对——那要我亲自重审，谁也忙不过来。我只做一件事：每读到一道关口，就让三五个生员从此处接着往下推演，看他们最终能否独立推到一个对的结局。若五人里有四人能推到对处，这一步多半是好的，盖朱印；若五人皆推到死胡同，这一步多半已偏，盖墨印。我以"此步是否还留得住通往真相的路"来给它打分，而不问它本身像不像真相。」

新章程行了半年，奇效。差役们渐渐改了脾气——他们知道，糊涂着办到末尾撞上对的答案，也无功可领，因为卷边墨印太多。他们开始在每一道关口都谨慎，因为每一关都被单独看见。

可到了秋后，周主簿自己却愁了起来。他发现三件麻烦事。

其一，那些生员推演时，本就带着各自的偏见。有几道关口，明明已经走偏，却因为生员们都恰好顺着这个偏处推下去，反倒推出了对的结局——于是错关口被盖了朱印。

其二，差役们摸清了门道，开始把卷子写得每一步都四平八稳、看着像通衢大道，可末了那答案仍是错的。卷边一片朱红，结案却荒唐。周主簿这才意识到，他赏的是「过程的样子」，不是「过程本身」。

其三，最微妙——他翻看半年的卷宗，发现墨印高度集中在最后一两道关口。也就是说，他费心设计的逐关核验，渐渐又退化回了"只看末页"的老样子，只不过换了一层皮。

周主簿在烛下叹气：逐步打分本是为了挣脱"只问结局"的窠臼，可若打分的人自己也只是另一个粗糙的推演者，这窠臼便会从另一道门重新爬回来。

---

## Process Reward Models (PRM)

**Field.** Alignment and post-training for reasoning LLMs (cluster: `align`). PRMs sit between RLHF-style outcome reward models (ORMs) and verifiable-reward methods (RLVR), giving dense step-level supervision over chain-of-thought.

**Mechanism.** A PRM scores *each intermediate step* of a reasoning trace, not just the final answer. Two families dominate:

1. **Human-labeled process supervision** — Lightman et al., "Let's Verify Step by Step" (OpenAI, 2023), released the PRM800K dataset of ~800k human step-level labels on MATH solutions and showed a process-supervised verifier substantially outperforms outcome-only verifiers under best-of-N reranking.
2. **Automatic step labeling** — Wang et al., *Math-Shepherd* (arXiv 2312.08935, 2023), removes the human bottleneck. For each prefix of a solution, they perform Monte-Carlo rollouts: sample K continuations from a completion model and label the step's "correctness" as the empirical probability that those continuations reach the gold answer. The PRM is then trained to predict this MC value per step. Math-Shepherd uses the resulting PRM both as a verifier (rerank N candidates by minimum or product of step scores) and as a dense reward signal in step-level PPO, lifting Mistral-7B on GSM8K from 77.9 → 84.1 and on MATH from 28.6 → 33.0.

**Why it matters.** Outcome-only rewards are sparse and credit-assignment-blind: a chain that lucks into the right answer through faulty steps is reinforced, and a chain that errs once near the end loses all signal for its earlier good work. PRMs provide localized credit, are more interpretable to humans, and align more directly with "reasoning we endorse" rather than "answers we like." They became central to the o1 / R1 generation of reasoning models and to inference-time search (tree search guided by step values).

**Open questions / controversies.**

- **MC labels are noisy.** Zhang et al., "The Lessons of Developing Process Reward Models in Mathematical Reasoning" (arXiv 2501.07301, 2025), document that MC-estimation labels are systematically inferior to human or LLM-as-judge labels because the completion model that does the rollouts is itself the source of bias — a step is called "correct" if the same flawed model can finish from it.
- **BoN evaluation is misleading.** The same paper identifies *response-process misalignment* (right answer, wrong steps still rewarded), score inflation, and an "outcome shift" where a trained PRM's minimum step-score concentrates on the final-answer step — i.e., the PRM silently collapses back into an ORM.
- **PRM vs RLVR.** With the rise of verifiable-reward RL (RLVR, e.g. DeepSeek-R1), some argue dense process rewards are unnecessary and even harmful — RLVR with only outcome rewards has matched or exceeded PRM-guided pipelines on math/code, raising open debate about when step-level supervision pays for its labeling cost and bias.

**Key references.**

- Lightman, Kosaraju, Burda et al., "Let's Verify Step by Step," 2023 — https://arxiv.org/abs/2305.20050
- Wang, Li, Shao et al., "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations," 2023 — https://arxiv.org/abs/2312.08935
- Zhang et al., "The Lessons of Developing Process Reward Models in Mathematical Reasoning," 2025 — https://arxiv.org/abs/2501.07301
