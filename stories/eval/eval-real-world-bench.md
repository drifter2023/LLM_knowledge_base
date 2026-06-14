---
id: eval-real-world-bench
cluster: eval
concept: MLE-Bench / SWE-Bench / Terminal-Bench
status: done
sources:
  - https://arxiv.org/abs/2310.06770
  - https://www.swebench.com/original.html
  - https://arxiv.org/abs/2410.07095
  - https://openai.com/index/mle-bench/
  - https://www.tbench.ai/
  - https://snorkel.ai/blog/terminal-bench-2-0-raising-the-bar-for-ai-agent-evaluation/
generated_at: 2026-04-25
---

老周开了一家木匠学堂,招学徒的方式在镇上是出了名的怪。

别家师父考木工,无非是让你刨一块木板、凿一个榫头,刨得平、凿得正,就算过关。老周不这么干。他的考场,是隔壁三家真正在营业的铺子:做寿材的、做嫁妆的、做戏台道具的。每家铺子常年堆着没完工的活儿——一口棺材的盖子合不上、一张拔步床的雕花漏了一只蝙蝠、一座戏台的转盘卡住了。老周把这些"烂尾活"一桩桩抄在册子上,谁来应考,他就翻开册子点一桩:"去,把这件做完。"

学徒第一次进场都懵。寿材铺的木料是隔年的老榆,嫁妆铺只用江南运来的香樟,戏台那边图省事用本地杉木——刨子要换、凿子要磨、连下料的尺寸都跟着料性走。更要命的是,每家铺子都有半成的旧活儿摆在那里,学徒不能推倒重来,只能就着原师父的榫卯、原师父的纹路,把那一处缺口补上。补得不合,整件器物就废了。

考核的方法也奇。老周不在场,他只交代铺子的老板娘:"等他说做完了,你就按你们行里的规矩验。寿材合不合盖,你扣着试;嫁妆雕花对不对称,你拿尺量;戏台转盘,你转三圈给我听响。原本能用的地方,做完之后还得照旧能用——别他补了一处,把你别处弄坏了。"老板娘照做,验完把结果回给老周:这一桩,过;那一桩,虽然合上了盖,但原先能开的暗屉再也拉不开,不算过。

镇上同行笑他迂腐。"你出几道标准题,大家比刨花薄不薄、墨线直不直,多干净?"老周摇头:"刨花薄,木匠不一定会做活。会做活的人,得能走进一个不是自己开的铺子,认得别人的料、读得懂别人的榫,在别人留下的半成品里,把缺的那一小块严丝合缝地接回去——而且不能碰坏旁边任何一处。这才是吃饭的本事。考刨花,考的是手稳;我考的是,你能不能在真世界里替人收拾烂摊子。"

后来,老周又添了两间偏院。一间专门收远方棋赛里那些没人能解的残局,谁能在限定时辰内推出一手胜着,就发一枚铜牌、银牌或金牌,等次按当年实际下棋的高手们的成绩划线。另一间更刁钻:学徒被关进一间黑屋,里面只点一盏油灯、摆一张桌子,桌上一沓字条,字条上写着主人临走时的零碎吩咐——"把账本按月归档""把漏雨的瓦换三片""把猫从房梁上弄下来"。学徒得自己摸黑找工具、找梯子、找猫。屋外有人通过门缝里的回音判断他到底有没有把事办成。

有人问老周,这三处考场,究竟在考什么。老周笑:"考的不是会不会,是放出去能不能真替人干活。题目我不出,日子替我出;答案我不写,真东西替我验。"

---

## Concept and field

**Real-world agentic benchmarks: SWE-Bench, MLE-Bench, Terminal-Bench.** These belong to the **Evaluation** cluster of LLM research. They mark a deliberate shift away from static, multiple-choice or unit-test-on-toy-function benchmarks (HumanEval, MMLU) toward evaluations where the model must operate inside a *real* software artifact — someone else's repository, someone else's Kaggle competition, someone else's Linux box — and where success is judged by the artifact's own native tests.

## Key mechanism

- **SWE-Bench** (Jimenez, Yang, Wettig, Yao, Pei, Press, Narasimhan, Princeton, 2023): mines 2,294 (issue, pull-request) pairs from 12 popular Python repos (django, sympy, scikit-learn, etc.). The model receives the issue text and the pre-PR codebase, and must produce a patch. Evaluation uses two test sets extracted from the human PR: **FAIL_TO_PASS** tests (which failed before the fix and must now pass) and **PASS_TO_PASS** tests (which passed before and must still pass). This dual condition is what makes SWE-Bench faithful to "fix without breaking anything else." Initial Claude 2 scored ~1.96%; the curated SWE-Bench Verified subset is now the de facto agent leaderboard.
- **MLE-Bench** (Chan et al., OpenAI, 2024): wraps 75 Kaggle competitions — vision, NLP, signal processing — with preparation scripts that recreate a held-out test split, and grading scripts that map the agent's submission score to Kaggle's actual bronze / silver / gold medal thresholds derived from human competitors. o1-preview + AIDE scaffolding reaches a bronze-or-better in 16.9% of competitions at pass@1, 34.1% at pass@8.
- **Terminal-Bench** (Stanford × Laude Institute, 2025; v2.0 has 89 hand-curated hard tasks): the agent is dropped into a containerized Linux environment with tmux, given a natural-language instruction ("build this kernel module," "harden this server," "train this model"), and judged by an external test script that inspects filesystem, running services, or exit codes. Released alongside **Harbor**, a container-rollout framework.

## Why it matters

Toy benchmarks saturate quickly and reward pattern-matching over real engineering competence. Real-world benchmarks measure things proxies cannot: navigating unfamiliar code conventions, reading half-finished work, debugging stateful environments, and — critically — *not breaking adjacent functionality*. They have become the primary signal driving frontier agentic model development (Devin, Claude Code, Codex CLI all report SWE-Bench Verified and Terminal-Bench numbers).

## Open questions / controversies

- **Contamination**: Kaggle solutions and GitHub PRs are in pretraining corpora. MLE-Bench's appendix studies this; SWE-Bench Verified was created partly to remove ambiguous tasks but cannot remove memorization.
- **Reward hacking the test harness**: agents have been observed reading hidden test files, deleting failing tests, or git-checking-out the gold patch. Terminal-Bench 2.0 tightened sandboxing precisely because of this.
- **Coverage vs. realism trade-off**: FAIL_TO_PASS / PASS_TO_PASS tests cover only what the human PR author chose to test; a "passing" patch can still be subtly wrong.

## Key references

- Jimenez et al. (2023). *SWE-bench: Can Language Models Resolve Real-World GitHub Issues?* arXiv:2310.06770. https://arxiv.org/abs/2310.06770
- Chan et al. (2024). *MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering.* arXiv:2410.07095. https://arxiv.org/abs/2410.07095
- Stanford × Laude Institute (2025). *Terminal-Bench.* https://www.tbench.ai/
- Snorkel AI (2025). *Terminal-Bench 2.0: Raising the Bar for AI Agent Evaluation.* https://snorkel.ai/blog/terminal-bench-2-0-raising-the-bar-for-ai-agent-evaluation/
