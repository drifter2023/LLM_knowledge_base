---
id: interp-open-problems
cluster: interp
concept: Open Problems in Interpretability
status: done
sources:
  - https://arxiv.org/abs/2501.16496
  - https://arxiv.org/html/2501.16496v1
  - https://www.far.ai/research/open-problems-in-mechanistic-interpretability
  - https://arxiv.org/html/2506.18852v1
generated_at: 2026-04-25
---

康熙四十年的秋天,二十九位钟表匠被召到内务府造办处,任务只有一个:把南怀仁留下的那座两人高的自鸣钟拆开,弄明白它"为什么会自己走"。

主持这件差事的是首席匠人卢守拙。他先在地上画了一圈白线,把工匠分成三班:第一班叫"零件班",负责把钟拆到不能再拆;第二班叫"功用班",负责说出每个零件"做什么";第三班叫"对照班",负责把零件班和功用班的说法对上。

零件班最先出问题。一个年轻工匠举起一根细如发丝的铜丝,问:"这算一个零件,还是半个?"卢守拙没法回答。他原本以为,一个零件就是"能从钟里取出来、单独存在的东西"。可是这根铜丝拆下来就断了——它在钟里时是一根,离了钟就是两段。再追问下去,他发现连"齿轮"都不好定义:有的齿轮其实是两片薄铜叠起来用胶粘的,平时看是一个,加热就是两个;有的齿牙看似独立,却共用一根轴心,牵一发动全身。零件班吵了三天,最后在墙上贴出一张告示:"暂以肉眼可辨者为一件,日后再议。"卢守拙看了,叹了口气。这张告示一贴,后面所有的账都算在这条糊涂规矩上。

功用班更糟。他们指着一个小铜片说:"这个是报时用的。"可第二天发现,把它取下来,钟照样报时,只是音色闷了一点。再过几天又发现,这个铜片在凌晨三点会轻轻颤一下,而那一刻钟的走时会快上一瞬——它似乎还兼着别的事。一个零件到底"做什么",取决于你在哪一刻、用什么尺度去看它。功用班最后只好写:"主用是A,次用疑似B、C、D,余者待考。"

对照班的差事最让卢守拙夜里睡不着。零件班说"这是第317号零件",功用班说"它管报时";可把这条记录拿去验,把317号取走,钟坏了——但坏的方式不是"不报时",而是整座钟慢了半刻。这说明317号其实不只管报时,或者,功用班对"报时"两个字的理解,本来就和这座钟的真实运作不是一回事。卢守拙试着把全部317号、318号……一千三百多条记录拼起来,想得到一份"完整的钟之图谱"。他失败了三次。每一次失败,都不是因为某条记录写错,而是因为这些记录彼此之间根本对不上同一个"零件"——零件班的"一件"、功用班的"一件"、对照班的"一件",从一开始就不是同一件事。

第四十九天,皇帝来问进展。卢守拙跪着说:"启禀皇上,奴才们拆得动这座钟,画得出每一个轮齿,却讲不清'一个零件'到底是什么。等奴才们把这件事说清楚,才敢说真的看懂了它。"皇帝沉默良久,说:"那你们现在做的,叫什么?"卢守拙答:"叫——把不会的地方,一条一条列出来。"

---

## Open Problems in Interpretability

**Field.** Mechanistic interpretability (MI), within the broader interpretability cluster of LLM research. The reference work is Sharkey et al., *Open Problems in Mechanistic Interpretability* (arXiv:2501.16496, January 2025; published in TMLR, September 2025), co-authored by ~30 researchers from 18 organizations including Apollo Research, Anthropic, DeepMind, MIT, and Northeastern.

**What the paper does.** Rather than propose a new method, it audits the field. It maps current MI work onto a "reverse-engineering" pipeline (decompose the network into parts → describe what each part does → validate the descriptions) and asks, at each stage, what we still cannot do rigorously. The parable above is a near-literal restatement: the "零件班 / 功用班 / 对照班" correspond to decomposition, description, and validation; the bickering over what counts as one piece is the field's unresolved fight over what a *feature* is.

**Key open problems surfaced.**

1. **No rigorous definition of "feature."** Sparse dictionary learning (SDL/SAEs) is built on the assumption that there exist canonical atomic units of computation, but the paper concedes that "satisfying formal definitions are elusive and conceptual foundations are not yet established." Features are identified pragmatically, not derived from first principles.
2. **SAEs leak.** A 16-million-latent SAE inserted into GPT-4 incurred a loss equivalent to throwing away ~90% of pretraining compute — the dictionary is not a faithful re-expression of the model.
3. **Sparsity is a brittle proxy for interpretability.** Feature splitting, feature absorption, and dataset-dependence of the learned latents mean that "sparse" does not reliably mean "monosemantic" or "real."
4. **The linear representation hypothesis is partial.** Some representations are clearly nonlinear; the strong form of the hypothesis is empirically false in some models, yet most tooling assumes it.
5. **Faithfulness of circuit explanations is under-specified.** Ablation results often reveal that a "circuit for X" also affects Y and Z, and the field lacks an agreed-upon criterion for when an explanation has captured the mechanism vs. a correlate.
6. **Socio-technical gaps.** Section 4 of the paper argues MI must connect to AI governance and confront philosophical questions (what *kind* of explanation is good enough for safety claims?) rather than retreat into pure mechanism.

**Why it matters.** Interpretability is increasingly cited as a load-bearing pillar of alignment plans (e.g., for detecting deceptive cognition or verifying RLHF). If the field's foundational vocabulary — "feature," "circuit," "faithful explanation" — is not yet well-defined, then downstream safety arguments inherit that ambiguity. Sharkey et al. is the field's most explicit acknowledgment of this and a coordinated agenda for fixing it.

**Open controversies / recent updates.**

- A follow-up philosophy paper, *Mechanistic Interpretability Needs Philosophy* (Williams et al., arXiv:2506.18852, June 2025), argues the foundational gaps the Sharkey survey lists are not just technical but conceptual, and calls for sustained engagement with philosophy of science.
- Within the SAE community there is active debate over whether the post-2024 generation of SAEs (e.g., Matryoshka, JumpReLU, end-to-end SAEs) materially addresses the reconstruction-faithfulness critique or merely shifts it.

**Key references.**

- Sharkey, L., Chughtai, B., Batson, J., Nanda, N., et al. (2025). *Open Problems in Mechanistic Interpretability.* arXiv:2501.16496. https://arxiv.org/abs/2501.16496
- *Mechanistic Interpretability Needs Philosophy* (2025). arXiv:2506.18852. https://arxiv.org/html/2506.18852v1
- FAR.AI summary: https://www.far.ai/research/open-problems-in-mechanistic-interpretability
