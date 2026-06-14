---
id: align-constitutional-ai-rlaif
cluster: align
concept: Constitutional AI / RLAIF (Reinforcement Learning from AI Feedback)
status: done
sources:
  - https://arxiv.org/abs/2212.08073
  - https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
  - https://rlhfbook.com/c/13-cai.html
  - https://arxiv.org/abs/2309.00267
generated_at: 2026-04-25
---

砚秋十六岁那年，师父远行渡海，归期不定。临行前师父没有留下范本，只在墙上钉了一卷薄薄的麻纸，纸上是十六句他半生琢磨出的训诫：「笔不可怒」「墨不欺白」「藏锋于横之始」「字不可谄媚于观者」……如此等等。师父说：「我不在的日子，你照常每日写两百张。墙上这十六句，便是我。」

起初砚秋慌乱。从前师父坐在他身后，一笔写歪，背上便挨一记戒尺；一笔写得好，师父会说「这一捺收得干净」。如今背后空空，他每写一张，都要自己起身，走到墙下，闭眼随手指一句训诫，再回到案前，盯着自己刚写的字，逐字对照那一句去找毛病。

——「笔不可怒。」他看自己写的「山」字，竖钩处力透三分，墨花飞溅，便是怒了。于是重写一张，把那一钩收住。

——「墨不欺白。」他看「云」字，横画压得太满，纸上几乎没有留白可呼吸，便是欺了。于是重写一张，让白处也成为字的一部分。

他不再保留最初的两百张，只把每日改过的那批，扎成一束，作为自己的新范本。半年下来，砚秋发现自己不必再走到墙下，那十六句已经长在他手腕里——下笔之前，腕子先替他犹豫一下。

第二年，小师弟阿野入门。砚秋不忍让他经历自己最初那种背后空荡的恐慌，便想出一个法子：他每日临帖两份，故意写得略有差异——一份收锋、一份纵笔；一份疏朗、一份紧密。然后他叫阿野来，从墙上抽一句训诫——「藏锋于横之始」——再把两份字摊在阿野面前，问：「依这一句，哪一份更好？」

阿野起初战战兢兢，怕自己选错。砚秋说：「你不是在评我，你是在替墙说话。墙说什么，你就说什么。」阿野渐渐选得稳了。砚秋把阿野的每一次选择都记在册子里：训诫某句，左胜，或右胜。一册记满，他便照着这本册子，回头修自己的笔法——凡阿野依「不谄媚」选中的那一类，他便多写；凡被弃的那一类，他便戒掉。

又过一年，师父归来。他在院里站了很久，看砚秋写字，又翻了那本厚厚的册子，最后只问了一句：「这一年，是谁在你背后？」

砚秋指了指墙上那卷麻纸，又指了指阿野，说：「师父，是您留下的十六句，和一个愿意替这十六句说话的人。」

师父沉默良久，把麻纸取下来，卷好，放进砚秋的箱子里，说：「以后你出师了，也这样教别人罢。」

---

## Constitutional AI / RLAIF

**Field.** Alignment and post-training for large language models — specifically, the family of techniques that replace human preference labels with model-generated preference labels in the RLHF pipeline. Cluster: alignment / post-training.

**Mechanism.** Bai et al. (2022) introduce Constitutional AI (CAI) as a two-stage recipe in which the *only* human-authored signal is a short list of natural-language principles ("the constitution"):

1. **Supervised stage (critique-and-revise).** Sample a response from an initial helpful-only model on a red-team prompt. Then prompt the *same* model with a randomly drawn constitutional principle and instruct it to (a) critique its own response against that principle and (b) rewrite the response. Iterate. Fine-tune the base model on the final revisions. This produces an SL-CAI model with no per-example human labels.

2. **RL stage (RLAIF).** Sample two completions from the SL-CAI model on a new prompt. Show both to an LLM judge along with a randomly drawn principle, and ask which completion better satisfies it. The judge's log-probabilities over "(A)" vs. "(B)" yield a soft preference label. Train a preference model (PM) on these AI-generated pairs exactly as one would on human pairs, then run standard RL (PPO) against the PM. The result is the RL-CAI model.

Two implementation tricks matter. First, *chain-of-thought* prompting in the judge improves both accuracy and interpretability of the AI labels. Second, principles are sampled per example rather than applied jointly, which acts as a kind of ensembling and reduces over-fitting to any single rule.

**Why it matters.** RLHF's bottleneck is the cost and noise of human comparison data. RLAIF demonstrates that, given a capable enough labeler model and a well-written rubric, synthetic preference data can match or even exceed human-labeled data on harmlessness, while being roughly two orders of magnitude cheaper (Lee et al. 2023, "RLAIF vs. RLHF"). It also opened the door to today's *rubric-based rewards* and *LLM-as-judge* RL pipelines that dominate frontier post-training.

**Open questions / controversies.**
- *Bias amplification.* AI labels are low-variance but high-bias: the judge inherits and concentrates the labeler's idiosyncrasies. Frontier labs reportedly still treat human preference data as a competitive moat (Lambert, *RLHF Book* ch. 13).
- *Constitution authorship.* The "constitution" reframes the political problem of whose values are encoded — it does not solve it. Critics (e.g., the *digi-con.org* commentary) argue the metaphor of a constitution lends unearned legitimacy to a list written by a single lab.
- *Reward hacking under self-judging.* When the same model both generates and judges, failure modes such as sycophancy and stylistic gaming can become invisible to the training signal.

**Key references.**
- Bai, Y., Kadavath, S., Kundu, S., Askell, A., et al. (2022). *Constitutional AI: Harmlessness from AI Feedback*. arXiv:2212.08073. https://arxiv.org/abs/2212.08073
- Lee, H., Phatale, S., Mansoor, H., et al. (2023). *RLAIF vs. RLHF: Scaling Reinforcement Learning from Human Feedback with AI Feedback*. arXiv:2309.00267. https://arxiv.org/abs/2309.00267
- Lambert, N. *RLHF Book*, ch. 13: Constitutional AI & AI Feedback. https://rlhfbook.com/c/13-cai.html
