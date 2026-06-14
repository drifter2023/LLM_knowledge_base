---
id: eval-pairwise-vs-pointwise
cluster: eval
concept: Pairwise vs Pointwise Evaluation
status: done
sources:
  - https://arxiv.org/abs/2403.04132
  - https://www.lmsys.org/blog/2023-05-03-arena/
  - https://arxiv.org/abs/2504.14716
  - https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model
generated_at: 2026-04-25
---

老吴在镇上经营一家面馆已经三十年。镇上原有一位"评味官",姓孙,每年立秋之后挨家挨家走,带一只小本子和一杆秤。他到每家先尝一口汤,皱皱眉,在本子上写一个数;再尝一口面,点点头,又写一个数;最后给整碗面打一个总分,从一到十。

孙评味官打分极认真,可问题是没有人服气。东街的赵记给了八分,西街的钱记也给了八分,可镇上人人都知道两家根本不是一个水准。更糟的是,孙评味官年纪大了,立春那天舌头淡,打的分普遍低;立秋那天胃口好,打的分普遍高。同一碗面,春天是六分,秋天能到九分。老吴翻着本子,觉得这哪是评面,这是评孙评味官的舌头。

那年冬天孙评味官告老,镇长想了一个新法子。他在镇口搭了一个棚子,不打分,只摆两只碗。每天来往的客商、脚夫、归乡的学生,谁路过就请他坐下,端上两碗面——一碗来自这家,一碗来自那家,碗底不写名字。客人只需指一指:这碗更好。

镇长不让任何人说"几分",只问"哪一碗"。一年下来,棚子里攒了几万张小纸条,每张上只有两个无名的碗和一个手印。镇长请来一位算账先生,先生把纸条一张张铺开,说:"我不知道每家面馆有多好,但我知道——若赵记赢了钱记十回输了三回,那赵记比钱记强的可能就有个数。"他在算盘上拨来拨去,最后给每家排出一个分数,不是绝对的好坏,而是"两两相遇时谁更可能赢"。镇上人一看排名,纷纷点头:"对,就是这个味儿。"

可老吴留心到一件怪事。第二年,西街新开的孙记面馆窜到了榜首。孙记的面其实平平,但老板娘极聪明:她在每只碗边放一小碟翠绿的葱花,又把碗边擦得锃亮。客人左右一看,绿的那碗显然"更精致",于是手一指。一旦两碗摆在一起,客人的眼睛就先于舌头做了判断。老吴叹气:从前孙评味官一碗一碗地尝,虽然舌头会变,可至少看不见对面那碗;如今两碗并排,赢的不一定是面,可能是葱花。

镇长后来又请了个老法师,在棚子旁边重新摆了一张桌,让客人有时也单独尝一碗,只评这一碗。两套法子并行,镇长说:"一碗摆着,人评的是面本身,标尺会飘;两碗并着,标尺稳了,人评的却可能是别的东西。世上没有不带偏的秤,只有知道自己偏在哪儿的秤。"

老吴把这话抄在面馆的柱子上,挂了很多年。

---

## Pairwise vs Pointwise Evaluation

**Cluster:** Evaluation & Benchmarks (`eval`).

**The two protocols.** *Pointwise* (absolute) evaluation asks a judge — human or LLM — to assign each model output a score on some scale (e.g. 1–10, or a rubric per axis). *Pairwise* evaluation shows the judge two outputs side-by-side for the same prompt and asks only which is better (with optional ties). Pointwise produces calibrated-looking numbers; pairwise produces a directed graph of wins and losses.

**The Chatbot Arena recipe.** LMSYS's Chatbot Arena (Chiang et al., 2024) operationalised pairwise evaluation at scale: anonymous users chat with two unnamed models, vote for the better one, and the votes are aggregated. The aggregation step is a **Bradley–Terry model**, which assumes the probability that model *i* beats model *j* is `σ(β_i − β_j)`. Maximum-likelihood estimation over hundreds of thousands of votes yields a score β per model, then linearly rescaled into the familiar Elo-like range for readability. Confidence intervals are produced by bootstrap. Active sampling preferentially pairs models whose ratings are close, which is where comparisons are most informative.

**Why pairwise won the leaderboard wars.** Pointwise scoring suffers from rater drift, scale incomparability across raters, and prompt-difficulty confounding — an absolute "7" from rater A on a hard prompt is incommensurable with a "7" from rater B on an easy one. Pairwise comparisons cancel many of these nuisance variables: same prompt, same rater, same moment, only the model differs. Bradley–Terry then turns the relative judgments into a global ranking with well-understood statistical properties.

**The catch.** Pairwise is not bias-free, only bias-different. Tripathi et al. (COLM 2025, "Pairwise or Pointwise?") show that pairwise LLM-judge protocols are **substantially more susceptible to distractor features** — superficial attributes like length, formatting, or emoji that flip preferences without changing content quality. Their headline number: pairwise preferences flip in ~35% of cases under controlled distractor injection, versus ~9% for absolute scores. Side-by-side viewing makes the judge a comparer of surfaces. Pointwise, in turn, suffers calibration drift but is harder to game adversarially. Recent practice therefore mixes both: pairwise for leaderboards, pointwise rubrics for capability-specific axes.

**Open questions.** How to detect and discount style-based distractor wins (Arena's "style control" is one attempt); whether Bradley–Terry's transitivity assumption holds for LLMs that have non-transitive strengths across prompt categories; and how vulnerable public arenas are to vote rigging (Huang et al., 2025).

## References

- Chiang, W.-L. et al. (2024). *Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference.* arXiv:2403.04132. <https://arxiv.org/abs/2403.04132>
- LMSYS Org (2023). *Chatbot Arena: Benchmarking LLMs in the Wild with Elo Ratings.* <https://www.lmsys.org/blog/2023-05-03-arena/>
- Tripathi, A., Wadhwa, S., Durrett, G., Niekum, S. (2025). *Pairwise or Pointwise? Evaluating Feedback Protocols for Bias in LLM-Based Evaluation.* arXiv:2504.14716. <https://arxiv.org/abs/2504.14716>
- Bradley, R. A. & Terry, M. E. (1952). *Rank Analysis of Incomplete Block Designs.* See <https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model>
