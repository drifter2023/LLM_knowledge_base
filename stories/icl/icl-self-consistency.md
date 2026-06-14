---
id: icl-self-consistency
cluster: icl
concept: Self-Consistency
status: done
sources:
  - https://arxiv.org/abs/2203.11171
  - https://openreview.net/forum?id=1PL1NIMMrw
  - https://aclanthology.org/2025.findings-acl.744.pdf
  - https://aclanthology.org/2025.findings-acl.1030.pdf
generated_at: 2026-04-25
---

汴梁城外有一桩疑案。城南绸缎庄的少东家死在自家后院的井边,仵作翻来覆去验了三日,只验出胸口一处淡红色的指印,旁的痕迹一概没有。知府姓裴,新上任不久,接了这案子,愁得三宿没睡。

裴知府素来不信一人之断。他召来衙门里七位捕头,把案卷复印七份,各发一份,命他们各自回家,关起门来想,三日后再来回话。他只立下一条规矩:七人不得互通,不得彼此打听,各凭自家本事推。

三日后,七人齐聚二堂。

第一位捕头说,凶手是绸缎庄的账房,因少东家查账查到他头上,他在井边推了一把。
第二位捕头说,凶手是少东家的续弦,因争家产,趁夜下了毒,再把人推下井。
第三位捕头说,凶手是城北的赌坊老板,少东家欠了八百两,赌坊派人来要债,推搡之间出了人命。
第四位捕头说,凶手是续弦,毒杀之后伪装成失足。
第五位捕头说,凶手是少东家的亲弟弟,为了抢家业。
第六位捕头说,凶手是续弦,她趁少东家弯腰打水时从背后一推。
第七位捕头说,凶手是赌坊。

裴知府听完,把七张供词在案上一字排开,提笔在每一行末尾画了个圈。圈完抬头道:七人之中,三人指续弦,二人指赌坊,余下两人各执一词。

师爷在旁边低声道:大人,可第二位说的是毒杀,第四位也说是毒杀,第六位说的却是推搡,这三人虽都指续弦,**手法**却不一样,如何算作同一桩?

裴知府摇头:我不问他们怎么走到那里,我只问他们最后指着的是谁。七条路径,起点各异,中途绕的弯也各异——有的从账目绕,有的从赌债绕,有的从家产绕——可只要终点同指一人,这人就比旁人多了一分嫌疑。仵作那一处指印,我们验不出是谁的;可七位捕头各凭线索独立去推,三人不约而同指向同一处,这便不是巧合了。

师爷又问:若七人之中只有一人推得最深、最像真凶,大人也不取他,反取人多的那一个?

裴知府道:一人推得再深,也只是一条路。一条路可能通,也可能歪。可若三条互不相通的路都通到同一扇门,这扇门后面是谁,就八九不离十了。我宁可信三条粗路的合力,不信一条精路的孤明。

——后来传讯续弦,果然审出实情。

师爷在卷宗末尾添了一行小字:**断案不在路精,而在终同。**

---

## Concept and field

**Self-Consistency** (Wang et al., 2022) is a decoding-time technique in the *in-context learning / prompting* cluster of large language model research. It sits on top of chain-of-thought (CoT) prompting and replaces the standard greedy decode with an ensemble over sampled reasoning traces.

## Key mechanism

Given a prompt that already elicits chain-of-thought reasoning, self-consistency proceeds in three steps:

1. **Sample diverse reasoning paths.** Instead of decoding one greedy CoT, sample N traces from the language model with non-zero temperature (the paper uses T = 0.5–0.7 with top-k = 40 for most experiments), so each trace explores a different sequence of intermediate steps.
2. **Extract the final answer from each trace.** Each sampled trace ends in a discrete answer (a number, a multiple-choice letter, a yes/no).
3. **Marginalize over reasoning paths.** Take the *majority vote* over the extracted answers — equivalently, choose argmax_a Σ_i 1[answer(trace_i) = a]. The intermediate reasoning is discarded; only the terminal answer is aggregated.

The key intuition is that a correct answer can be reached by many distinct valid derivations, while incorrect answers tend to be reached by idiosyncratic, mutually inconsistent ones. Marginalizing over reasoning paths therefore concentrates probability mass on the correct answer even when no single path is reliable.

## Why it matters

Self-consistency was the first prompting-only technique to push GSM8K dramatically (+17.9% over CoT with PaLM-540B), and similarly large gains on SVAMP (+11.0%), AQuA (+12.2%), StrategyQA (+6.4%), and ARC-challenge (+3.9%). It also became the *baseline* against which most later inference-time-compute methods (tree-of-thoughts, debate, verifier-guided search, process reward models) are measured. Notably, Huang et al. (2024, "LLMs Cannot Self-Correct Reasoning Yet") show that many gains attributed to multi-agent debate are actually just self-consistency in disguise.

## Open questions and recent updates

- **Cost.** Sampling N traces multiplies inference compute by N; reproducing the paper's MATH numbers with N = 64 famously costs ~$2,000 in GPT-4 API calls.
- **Beyond unweighted voting.** Confidence-weighted voting (Taubenfeld et al., ACL 2025) and ranked voting (2025) consistently beat plain majority vote at equal or lower sample budgets, suggesting plain SC leaves signal on the table.
- **Free-form answers.** Self-consistency requires a discrete answer to vote over; for open-ended generation it does not directly apply, motivating universal-self-consistency variants that use an LLM-as-judge to cluster equivalent answers.

## References

- Wang, X., Wei, J., Schuurmans, D., Le, Q., Chi, E., Narang, S., Chowdhery, A., & Zhou, D. (2022). *Self-Consistency Improves Chain of Thought Reasoning in Language Models*. ICLR 2023. https://arxiv.org/abs/2203.11171
- OpenReview discussion: https://openreview.net/forum?id=1PL1NIMMrw
- Taubenfeld et al. (2025). *Confidence Improves Self-Consistency in LLMs*. ACL Findings. https://aclanthology.org/2025.findings-acl.1030.pdf
- *Ranked Voting based Self-Consistency of Large Language Models* (2025). ACL Findings. https://aclanthology.org/2025.findings-acl.744.pdf
