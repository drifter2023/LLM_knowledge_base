---
id: icl-induction-heads
cluster: icl
concept: Induction Heads
status: done
sources:
  - https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html
  - https://arxiv.org/abs/2209.11895
  - https://arxiv.org/html/2407.07011v2
  - https://www.neelnanda.io/mechanistic-interpretability/induction-heads-walkthrough-1
generated_at: 2026-04-25
---

旧城南的茶馆里有两个伙计,一个叫阿前,一个叫阿照。掌柜的从不亲自记账,他只在每晚打烊后,听这两人复述当天客人点了什么。

阿前的本事看起来笨得可笑。他什么都不记,只记一件事:**每听到一句话,他就把上一句悄悄贴在这句话的耳边**。比如客人喊"龙井——大碗",他不去想"龙井"是什么茶、"大碗"值多少钱,他只把"龙井"这个词,像一张小纸条,粘在"大碗"的背后。再有人喊"普洱——小盏",他又把"普洱"粘在"小盏"的背后。一整天下来,阿前没记住一笔账,只是把每一个词都悄悄背上了它前一个词的影子。茶馆里别的伙计都笑他:这人脑子是空的,只会做粘贴的活儿。

阿照不一样。阿照站在柜台后头,眼睛半睁半闭,像在打盹。可他有一种古怪的习惯——他从不听客人现在说什么,他只盯着客人**现在说的这个词,曾经在今天早些时候出现过没有**。

那一日近黄昏,一位老主顾推门进来,熟门熟路地喊:"龙井——"

阿照的眼睛在那一瞬亮了。他在脑子里飞快地往回翻:今天上午,有人也喊过"龙井"。他扑到那个旧的"龙井"跟前——可他要找的,不是那个"龙井"本身,而是阿前早晨悄悄贴在它**耳后**的那张小纸条。纸条上写着两个字:大碗。

于是阿照不等客人把话说完,就朝后厨喊:"大碗!"

客人愣了一下,随即大笑:"你怎么知道?我今天本来还没决定呢。"

阿照笑而不答。他心里明白:他根本没记住这位客人的喜好,他甚至不认识"龙井"这两个字的意思。他只是做了两件极简单的事——**先去找今天里和"现在"长得一样的旧词,再顺着旧词背后那张纸条,把纸条上的字喊出来**。粘纸条是阿前的活,翻纸条是他的活。两个人加在一起,这间茶馆便像有了一种诡异的预知力:**只要某个搭配在今天出现过一次,第二次出现开头的那一刻,结尾就已经被喊出来了**。

掌柜起初不信,直到他偷偷统计了几个月——他发现这家茶馆能"猜中"客人下一句话的本事,并不是慢慢长出来的。它是某一天,**忽然**长出来的。那一天之前,茶馆混乱、错单频出;那一天之后,阿前和阿照之间的那条无声的传递通道一旦接通,整个店仿佛在一夜之间学会了"听一半,知全句"。掌柜在账本边上写了一行字:

> 这家店真正的本事,不在记住了什么,而在于**它能够把今天发生过的事,当作今天剩下时间的规则来用**。

后来有人问掌柜,你这茶馆的灵气到底藏在谁身上。掌柜想了想,说:不在阿前,也不在阿照,在他们之间那一次**回头看**。

---

## Concept and Field

**Induction Heads** are a specific, two-layer attention circuit identified by Olsson et al. (2022) in Anthropic's Transformer Circuits thread. They sit in the **In-Context Learning (ICL)** cluster of LLM research and are currently the strongest mechanistic candidate for *how* transformers do ICL at all — i.e. why a model can absorb a pattern from earlier in its prompt and apply it to later tokens, with no weight updates.

## Key Mechanism

An induction head implements the pattern `[A][B] ... [A] → [B]`. It is built out of two attention heads acting across two consecutive layers:

1. **Layer 1 — Previous-Token Head.** A head whose only job is to copy each token's representation into the *next* position. After this layer, every token's residual stream secretly carries a tag saying "the token right before me was X." (This is "阿前" — pasting each previous word onto the back of the current one.)

2. **Layer 2 — The Induction Head proper.** This head has two learned circuits:
   - **QK circuit (prefix matching):** The query at the current position `[A]` matches keys at positions whose tag says "the previous token was A." It therefore attends back to the token immediately *after* the earlier `[A]` — namely `[B]`.
   - **OV circuit (copying):** Once attention lands on `[B]`, the OV matrix writes `[B]`'s identity into the output logits, raising the probability of predicting `[B]` next.

(This is "阿照" — looking back for an earlier copy of the current token, then reading the tag pasted by 阿前 to recover what came after it.)

Crucially, the QK and OV circuits are **decoupled from the actual token identities of A and B**, which is why induction heads generalize beyond mere bigram memorization and can drive abstract few-shot behavior, translation, and literal copying.

## Why It Matters

Olsson et al. show that induction heads form **abruptly**, during a narrow window of training that coincides with a visible bump in the loss curve and a sudden jump in the model's ability to use later-in-context tokens better than earlier ones — the operational signature of ICL. Six independent lines of evidence (co-occurrence, co-perturbation, direct ablation, behavioral generality, mechanistic plausibility, and small-to-large continuity) jointly argue that induction heads are *the* mechanistic substrate of in-context learning, not merely correlated with it. Ablating a small number of prefix-matching heads in larger models reduces few-shot accuracy nearly to zero-shot levels (Crosbie & Shutova, 2024).

## Open Questions

- Whether induction heads fully explain ICL in models with MLPs, or only the attention-only sub-component. The original paper's causal evidence is strong only for attention-only models.
- The existence of **semantic** induction heads (Ren et al., 2024) suggests the family is broader than literal token matching.
- Repetition neurons and interactions with induction heads (Yoshida et al., 2025) complicate the clean story by introducing failure modes such as degenerate copying loops.

## References

- Olsson, C., Elhage, N., Nanda, N., et al. (2022). *In-context Learning and Induction Heads.* Anthropic / Transformer Circuits Thread. [transformer-circuits.pub](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html) · [arXiv:2209.11895](https://arxiv.org/abs/2209.11895)
- Crosbie, J. & Shutova, E. (2024). *Induction Heads as an Essential Mechanism for Pattern Matching in In-context Learning.* [arXiv:2407.07011](https://arxiv.org/html/2407.07011v2)
- Nanda, N. (2023). *A Walkthrough of In-Context Learning and Induction Heads.* [neelnanda.io](https://www.neelnanda.io/mechanistic-interpretability/induction-heads-walkthrough-1)
