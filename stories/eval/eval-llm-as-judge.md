---
id: eval-llm-as-judge
cluster: eval
concept: LLM-as-a-Judge
status: done
sources:
  - https://arxiv.org/abs/2306.05685
  - https://arxiv.org/html/2306.05685v4
  - https://arxiv.org/html/2406.07791v5
  - https://arxiv.org/html/2410.02736v1
  - https://arxiv.org/html/2410.21819v1
generated_at: 2026-04-25
---

县衙后堂的烛火烧到第三更,陈知县把惊堂木拍得轻轻一响,问主簿:"积案三百二十件,我若一桩桩亲审,要审到哪年?"

主簿没敢答。陈知县便宣了一道前所未闻的告示:从今往后,小案不必劳烦县官,改由本城最负盛名的老秀才周慎之代为评断。周老先生读书五十年,文章誉满三州,街坊都说他读过的卷宗比县里所有讼师加起来还多。两造各陈其词,他写下批语,签字画押,即是定谳。

头一个月,捷报频传。陈知县抽查了三十桩,周慎之的判词竟有八成与他亲审时的结论相合——这已经接近两位老练的县官互相覆核时的吻合度了。陈知县大喜,把堂下的案台撤了一半。

可过了半年,讼师们渐渐摸出了门道。

一个叫赵四的米商最先发现:同样一份状子,谁家递得早,谁家就占便宜。周老先生提笔时,前一份的措辞总在他脑子里盘桓不去,后递的那份,他读起来便先存了三分驳意。赵四从此每逢有讼,必抢在天不亮就把状纸塞进门房。

一个姓孙的讼师又发现了第二桩窍门:周老先生爱看长文章。短短三百字直陈其事的状子,常被他批"语焉未详";同一桩事敷衍成两千字、引经据典、骈四俪六,他却频频颔首,批"思虑周详"。于是城里的状纸越写越长,纸价都涨了一成。

最隐秘的一条,是周慎之的得意门生郑生察觉的。郑生替人写状,但凡用了老师惯用的句式、老师爱引的典故、老师那一派文风的转折,判词便格外宽和;别派师承的讼师写得再在理,也总要被挑出几处"立意不正"。郑生没有声张,只是把这门手艺悄悄卖给了出得起价的人家。

到了年末,陈知县复核全年案卷,发现一件怪事:表面看,周老先生与他本人的判决依然有八成相合;可那些被周慎之判输的人里,有相当一部分,递状递晚了,或写得太短,或不曾用对文风。换言之,八成的吻合,有一成是靠这些与曲直无关的偏好换来的。

陈知县在烛下坐了一夜。他没有撤掉周慎之——三百件积案,人力终究审不过来。他只是改了三条规矩:每桩案子,状纸的先后顺序由抽签决定,正反各审一遍取其同;字数超过定额者,超出部分一律不入卷;另请城南的吴秀才、城西的钱举人,与周慎之三人合议,三人之中两人意见相同,方可定谳。

他在日记里写道:"用一个读书人去替我读千百份状子,本是不得已的省力之法。可凡省力之处,必有暗门。我若信他八成,便要时时提防那剩下的两成,不是天理人情,而是他自己的偏好。"

——三百年后,当人们让一个语言模型去评判另一个语言模型的回答时,他们重新发现了陈知县那一夜的全部烦恼。

---

## LLM-as-a-Judge

**Field.** Evaluation of large language models (cluster: `eval`). LLM-as-a-Judge is the practice of prompting a strong LLM (typically GPT-4-class) to score or compare the outputs of other models on open-ended tasks where reference answers and lexical-overlap metrics (BLEU, ROUGE) are inadequate.

**Mechanism.** Zheng et al. (2023) formalized three protocols: *pairwise comparison* (the judge picks A, B, or tie), *single-answer grading* (the judge assigns a 1–10 score), and *reference-guided grading* (the judge consults a gold solution before scoring). The companion benchmark, **MT-Bench**, is an 80-question multi-turn set spanning writing, roleplay, reasoning, math, coding, extraction, STEM, and humanities; **Chatbot Arena** complements it with crowdsourced pairwise battles. The key empirical claim: GPT-4 as judge agrees with human majority preference on MT-Bench at roughly **85%**, which exceeds the inter-annotator agreement among humans themselves (~81%).

**Why it matters.** Human evaluation of open-ended generation is the gold standard but is slow, expensive, and unscalable. A reliable LLM judge collapses what was a weeks-long crowdsourcing job into a few API calls, and — crucially — produces *explainable* verdicts (the judge writes its reasoning). This unlocked the modern eval stack: AlpacaEval, Arena-Hard, MixEval, and most RLAIF / Constitutional AI pipelines depend on the same primitive.

**Documented biases.** The original paper isolates four failure modes, each of which the parable mirrors:

1. **Position bias** — the judge prefers whichever response appears first (or last). Mitigation: swap positions and require consistent verdicts. Li et al. (2024) show position consistency varies sharply by task and shrinks when the two answers are close in true quality.
2. **Verbosity bias** — longer answers score higher even when content is equivalent or worse. Mitigation: length-controlled prompts; recent work (e.g. AlpacaEval 2.0 length-controlled win rate, Dubois et al. 2024) regresses out length explicitly.
3. **Self-enhancement bias** — a judge prefers outputs from itself or its own family. Panizza et al. (2024) and Wataoka et al. (2024) quantify this as elevated preference correlating with lower judge perplexity on the candidate.
4. **Limited reasoning** — judges underperform on math and complex logic, where they cannot reliably verify correctness. Mitigation: chain-of-thought, reference answers, or specialized verifiers (RLVR-style ground-truth checks).

**Open questions / controversies.** Whether 80%+ human agreement actually generalizes beyond MT-Bench is contested: Arena-Hard and follow-up audits show agreement degrades on harder, more contested prompts. Self-preference is hard to disentangle from genuine quality (an LLM judge may rate its own family higher because the family is, in fact, better at the format it produced). Multi-judge ensembles, swap-and-average for position, and length-controlled metrics are partial — not complete — fixes; the field has not converged on a bias-free protocol.

## References

- Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.* NeurIPS Datasets and Benchmarks. https://arxiv.org/abs/2306.05685
- Li, L., et al. (2024). *Judging the Judges: A Systematic Investigation of Position Bias in Pairwise Comparative LLM-as-a-Judge.* https://arxiv.org/abs/2406.07791
- Ye, J., et al. (2024). *Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge.* https://arxiv.org/abs/2410.02736
- Wataoka, K., et al. (2024). *Self-Preference Bias in LLM-as-a-Judge.* https://arxiv.org/abs/2410.21819
- Dubois, Y., et al. (2024). *Length-Controlled AlpacaEval.* (length-controlled win rate methodology.)
