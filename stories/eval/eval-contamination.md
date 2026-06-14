---
id: eval-contamination
cluster: eval
concept: Benchmark Contamination
status: done
sources:
  - https://arxiv.org/abs/2411.03923
  - https://arxiv.org/html/2406.04244v1
  - https://arxiv.org/html/2404.00699v4
  - https://arxiv.org/abs/2502.14425
generated_at: 2026-04-25
---

县学督学钱先生在江南做了三十年的督学，每年腊月，他要从七十二个县里挑出"神童"，呈给学政。挑神童的法子很古老：他亲手命题，封在桐木匣子里，骑驴下乡，到了县学才开匣，孩子们当堂作答。

这一年腊月，他在松江府遇到一个叫阿宁的孩子。

阿宁十一岁，眉清目秀，作答如行云流水。钱先生出的第一题是《孟子》里一段冷僻的"民为贵"章疏解，阿宁不仅背得熟，连前朝某位大儒的批注也引了三句。第二题是策论，问漕运改海，阿宁的对答里出现了"潮信失候则三仓告匮"这样的句子——钱先生愣了一下，因为这句话，是他十年前自己写在一本未刊行的札记里的。

他把卷子合上，没有声张。

回到府衙，他翻出近年的旧匣旧卷，一题一题地比对。他发现一个怪事：阿宁所有答得最漂亮的题，都是他钱某人在过去十五年里反复用过、且在某次酒后誊抄给松江教谕看过的旧题。而那些他临时新拟、从未示人的偏题，阿宁答得只是中平。

钱先生没有去问阿宁的先生。他做了另一件事。

第二年，他改了规矩。腊月下乡之前，他先把命题册子原样寄到县里，让县学贴在照壁上三日，再回收。然后他另拟一份从未示人的新题，临场启封。

那一年，松江府再没有出过神童。阿宁的卷子，中平。

但钱先生的烦恼并没结束。他发现：哪怕他再怎么防范，新题里总有些字眼、某些典故、某种问法，和他过去三十年的旧题"形似而神不似"。一个真正用功的孩子，读得出题里的味道；一个只是把旧卷烂熟于心的孩子，也读得出。两者在新题上的分数，慢慢又拉开了——但拉开的幅度，比从前小得多。

他在札记里写下一句话，留给后任：

"题之贵，不在难，在生。出过的题，一旦在世上流过一遍，便不再是秤，而是镜——孩子照着它，把自己照成它要的样子。"

他又添了一句，更短：

"故我每出新题，必先自问：此题在我书房之外，可曾走漏过半个字？"

---

## Benchmark Contamination

**Field.** LLM evaluation methodology (cluster: `eval`).

**The mechanism.** Modern LLMs are pre-trained on web-scale corpora that, by construction, almost certainly include the test sets, problem statements, gold answers, or paraphrased variants of the very benchmarks (MMLU, GSM8K, HumanEval, MATH, BIG-Bench, etc.) used to evaluate them. When this happens, reported scores no longer measure *capability*; they partially measure *memorization of the eval*. Sainz et al. and the survey of Xu et al. (2024) decompose contamination into four severity levels — semantic, information, data, and label — corresponding to whether the model has seen the topic, the metadata, the inputs, or the labeled pairs. Detection strategies fall into two camps:

1. **Matching-based.** N-gram overlap between training corpus and benchmark (GPT-3 used 13-grams; GPT-4 used 50-character spans). Singh et al. (2024)'s **ConTAM** study finds that *longest-contaminated-substring* outperforms union-overlap, that larger n reduces false negatives, and that contamination effects are often **larger than vendors report** because hyperparameter choices in detection mask the signal.
2. **Behavioral / comparison-based.** Membership-inference attacks, perplexity gaps between canonical and perturbed test items, **TS-Guessing** (mask part of a test item and see if the model can fill it), and **CDD** (peakedness of the output distribution as a memorization tell). These work even when the training corpus is closed.

**Why it matters.** Contamination breaks the entire scoring contract. StarCoder-7B scores roughly 5x higher on leaked HumanEval samples than on non-leaked ones (Riddell et al.). It explains why frontier model leaderboards saturate the moment a benchmark goes public, and why scaling-law claims based on public benchmarks must be read with suspicion. Mitigations include private/held-out benchmarks (e.g., GPQA's gated split, SWE-Bench Verified rotations), **dynamic benchmarks** (LiveCodeBench, DyVal) that regenerate problems after the training cutoff, paraphrase-resistant constructions, and benchmark-free evaluation (LLM-as-judge, human pairwise preference).

**Open questions / controversies.** Bordt et al.'s ICML 2025 paper "How Much Can We Forget about Data Contamination?" challenges the strong assumption that small-scale contamination invalidates a benchmark — arguing that with enough new tokens, fine-grained leakage washes out. This is contested: Singh et al. find the opposite, that under-reported contamination materially inflates scores. There is also no consensus oracle for *semantic* contamination (a paraphrase of a test item) — string-matching misses it entirely, and behavioral detectors give noisy signals. Reviewers should treat any single-method contamination audit as a lower bound, never a clean bill of health.

## References

- Singh, A. K., Kocyigit, M. T., Poulton, A., Esiobu, D., Lomeli, M., Szilvasy, G., Hupkes, D. (2024). *Evaluation data contamination in LLMs: how do we measure it and (when) does it matter?* arXiv:2411.03923. https://arxiv.org/abs/2411.03923
- Xu, C., et al. (2024). *Benchmark Data Contamination of Large Language Models: A Survey.* arXiv:2406.04244. https://arxiv.org/html/2406.04244v1
- Ravaut, M., et al. (2024). *A Comprehensive Survey of Contamination Detection Methods in Large Language Models.* arXiv:2404.00699. https://arxiv.org/html/2404.00699v4
- Cheng, Y., et al. (2025). *A Survey on Data Contamination for Large Language Models.* arXiv:2502.14425. https://arxiv.org/abs/2502.14425
- Bordt, S., et al. (2025). *How Much Can We Forget about Data Contamination?* ICML 2025.
