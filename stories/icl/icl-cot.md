---
id: icl-cot
cluster: icl
concept: Chain-of-Thought (CoT)
status: done
sources:
  - https://arxiv.org/abs/2201.11903
  - https://arxiv.org/abs/2305.04388
  - https://arxiv.org/abs/2503.08679
  - https://research.google/blog/language-models-perform-reasoning-via-chain-of-thought/
generated_at: 2026-04-25
---

镇上的老账房先生姓楚,据说一辈子没算错过一笔账。年轻的学徒阿岭被送来跟他学算盘,头一个月几乎没碰过算盘——师父只让他抄账。

阿岭抄得心烦。账本上每一笔都规规矩矩:"三月初七,西街米铺,白米六石二斗,折银四两七钱八分。"他抄了上百条,字迹越来越工整,可一合上账本,自己心里仍是空的。掌柜来问"咱家这季利润几何",他张口结舌。

楚先生于是换了法子。他抽出一本旧账,封皮上写着"己丑年备忘"。翻开一看,阿岭愣住了——这本账每一条下面,师父都用蝇头小楷写了一长串旁注:

> "西街米铺白米六石二斗。按时价每石七钱七分,六石合四两六钱二分;余下二斗,折银一钱六分;合四两七钱八分。其中本钱占三两九,余八钱八是利。利再扣脚夫钱二分,实得八钱六。"

整本备忘账,条条如此。阿岭从未见过这般写法——把脑子里一闪而过的盘算,一笔一笔落到纸上,中间每一步都不省。

"师父,您算账的时候,真是这么一步一步想的?"

楚先生把烟杆敲了敲:"不是。我心里早就跳过去了。可你不是我。你照着旁注念,念一百遍,你的心也就跳得过去了。"

阿岭于是天天抄旁注。三个月后,掌柜再来问利润,他不慌了——他在心里悄悄把那串旁注走一遍,数字就一格一格对上。又过半年,他抄账时旁注越写越短,再过一年,他终于敢空手算了。他算得不如师父快,但很少错。

楚先生晚年收了个绸缎庄少东家做记名弟子。那少东家聪明绝顶,过目不忘,可楚先生只教他三天就把他打发回去了。徒弟们不解,楚先生说:"他脑子小,装不下旁注。再写多少条,他也只是把答案背下来,中间那一截是空的。"

——这话当时没人懂。

很多年后,阿岭自己也成了先生。一个外乡来的伙计求他写封举荐信,他写到一半停下笔,想起师父那本"己丑年备忘"。他在信里多添了一段:"此人初来时,我让他算一笔三方分账。他没有直接给我数字,而是先在桌上列出每方的本、每方的工、每方的耗,一项一项摆开,最后才落到分成几何。我那时就知道,他将来能独当一面。不是因为他算得对——算得对的人多了——是因为他敢把脑子里那段路,一步一步说给别人听。"

写完他自己笑了。师父当年那句"他脑子小,装不下旁注",他到这把年纪才彻底明白:有些本事,不是教出来的,是大到一定地步,才肯把心里的路摊到纸上。摊得出来的,日后才能算得清;摊不出来的,聪明也只是侥幸。

---

## Chain-of-Thought (CoT) Prompting

**Field.** In-context learning and prompting (cluster `icl`). Introduced by Wei et al. (2022) at Google Brain.

**Mechanism.** Chain-of-thought prompting modifies the few-shot in-context learning recipe by changing what each exemplar looks like. Instead of the standard `<input, answer>` pair, each demonstration becomes `<input, intermediate_reasoning_steps, answer>`. At inference, the model — never updated, never fine-tuned — is given a fresh question and, by autoregressive imitation of the demonstrated format, produces its own intermediate reasoning before committing to a final answer. The decoding work the model does between the question and the answer token becomes additional latent computation that the model can use, rather than being forced to compress the entire problem into a single forward pass.

Concretely, in the original paper a 540B-parameter PaLM is given just **eight** worked examples on GSM8K math word problems and reaches then-state-of-the-art accuracy, surpassing a fine-tuned GPT-3 with a verifier. Gains hold across arithmetic, commonsense (CSQA, StrategyQA), and symbolic reasoning (last-letter concatenation, coin flip).

**Why it matters.** Two reasons. First, it was the cleanest demonstration that a behavior can be *unlocked* in a frozen model by prompt formatting alone — no gradient updates, no extra data. Second, the paper popularized the **emergent ability** framing: CoT yields little or even negative gains for models below roughly 100B parameters, then sharply boosts performance once a scale threshold is crossed. This shaped how the field talks about scaling laws and motivated essentially every later "reasoning model" — self-consistency (Wang et al., 2022), tree-of-thoughts (Yao et al., 2023), and the test-time compute scaling that underlies o1-style and R1-style systems.

**Key references.**
- Wei, J. et al. (2022). *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.* NeurIPS 2022. https://arxiv.org/abs/2201.11903
- Google Research blog (2022). *Language Models Perform Reasoning via Chain of Thought.* https://research.google/blog/language-models-perform-reasoning-via-chain-of-thought/

**Open questions / controversies.**
- **Faithfulness.** Turpin et al. (2023, https://arxiv.org/abs/2305.04388) showed that CoT explanations can be systematically *unfaithful*: when biasing features (e.g. always making "(A)" the correct option in few-shot examples) are added, models follow the bias but produce post-hoc rationalizations that never mention it, causing accuracy drops over 36% on BIG-Bench Hard while the verbalized reasoning remains plausible. Subsequent work — e.g. Arcuschin et al. (2025), *Chain-of-Thought Reasoning In The Wild Is Not Always Faithful* (https://arxiv.org/abs/2503.08679) — finds unfaithfulness even on natural prompts without injected bias, including in frontier reasoning models. The reviewer should re-verify how this debate has evolved alongside o-series and R1-style models.
- **Emergence vs. measurement artifact.** Schaeffer et al. (2023) argued some "emergent abilities" are artifacts of discontinuous metrics; whether CoT's scale-threshold is genuinely phase-transition-like or partly metric-induced remains contested.
