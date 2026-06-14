---
id: icl-prompt-tuning
cluster: icl
concept: Prompt Tuning vs Prefix Tuning
status: done
sources:
  - https://arxiv.org/abs/2104.08691
  - https://arxiv.org/abs/2101.00190
  - https://aclanthology.org/2021.acl-long.353.pdf
  - https://aclanthology.org/2021.emnlp-main.243/
generated_at: 2026-04-25
---

镇上有一座叫"百工坊"的老作坊,几百名匠人按祖传规矩干活。规矩刻在木梁上,谁也不许改。东家更换太频繁,新东家若想让作坊改做新货,从前的法子是把所有匠人召来重训——既花钱,又把老手艺折腾散了。后来镇上出了两位"调度师",一位姓黎,一位姓莱,各有一套不动祖训、却能让作坊换样出货的本事。

黎调度师的法子,被坊里人称作"层层递色"。她不写字、不喊话,而是用一种没有名目的彩绳。彩绳并非真的拿给匠人看,而是分别系在作坊每一层楼梯的扶手上——一楼一种颜色,二楼一种颜色,直到顶楼。匠人上楼取料、下楼交货,手指无意中拂过扶手,身上便沾了那一层的颜色;颜色再混进他与同伴的应答里,顺着工序一层层晕染上去。她坚持每层都要有自己的彩绳,因为她相信:作坊的活儿是层层加工的,只在门口染一次色,到了顶楼早就褪了。

可是层层都系彩绳,绳子太多,黎调度师自己也记不住。于是她想出一个窍门:她只随身带一小卷"母线",再带一架小小的提花机。要哪一层的彩绳,就把母线穿过提花机,机器自动织出那层该用的颜色。母线短,提花机小,塞进袖子就能走。等到上岗那天,她在楼梯间架好提花机,把全楼的彩绳一次织完、一次系好,然后把提花机收起,悄悄离开。匠人们什么都没察觉,出来的货却已是新样。

莱调度师的法子更省事,坊里人叫它"门口一封信"。她不上楼,只在大门口的传达室里放一封封了口的信。信上没有字,只有几滴不同浓度的香露。匠人一进门,鼻尖掠过那香,香气便随他贯穿整日的活计。她坚持信只放在门口——多了她不放,楼上她不去。

起初莱调度师常被人笑话。同样要让作坊改做新货,她那一封信哪里比得上黎调度师层层递色?在小作坊里,她确实输——香气走到三楼就散了,出来的货四不像。可是这十来年,百工坊越扩越大,匠人从几百变成几万,楼也加到几十层。怪事发生了:作坊越大,莱调度师那封门口的信反而越灵。匠人多到一定程度,彼此口耳相传,香气竟能从一楼一直传到顶楼,出来的货和黎调度师层层布置的几乎一样好。镇上的人开始议论:也许真正撑住这件事的,是百工坊本身的厚度,而不是调度师的手艺有多繁复。

两位调度师都从不修改木梁上的祖训。她们只是往这座沉默的老作坊里,放进一点点没有文字、却能被身体读到的东西——黎调度师把它织进每一层楼,莱调度师只把它搁在门口的桌上。一位押在深度上,一位押在规模上。镇上的人于是懂了:有些指令,从来不需要写成字。

---

## Concept and field

**Prompt Tuning vs Prefix Tuning** are two foundational *parameter-efficient fine-tuning* (PEFT) methods within the **In-Context Learning / Prompting** cluster. Both freeze the pretrained language model entirely and instead learn a small set of *continuous* vectors — "soft prompts" — that condition the frozen model on a downstream task. They replace the search over discrete natural-language prompts with gradient descent in embedding space.

## Key mechanism

**Prefix Tuning** (Li & Liang, 2021) prepends a sequence of learnable vectors — the *prefix* — to the **key and value** matrices at **every transformer layer**. Subsequent tokens attend to this prefix as if it were a sequence of "virtual tokens," and because the injection is repeated at every depth, the prefix can steer attention computation throughout the network. To stabilize optimization, the authors do not learn the prefix matrix `P_θ` directly; they reparametrize it as `P_θ = MLP(P'_θ)` where `P'_θ` is a smaller matrix passed through an MLP. After training, the MLP is discarded and only the materialized prefix is kept. Prefix tuning was demonstrated on GPT-2 (table-to-text) and BART (summarization), training only ~0.1% of parameters while matching full fine-tuning, and outperforming it in low-data and out-of-domain regimes.

**Prompt Tuning** (Lester, Al-Rfou & Constant, 2021) is described by its authors as a *simplification* of prefix tuning: it inserts learned vectors **only at the input embedding layer**, with no per-layer injection and no MLP reparametrization. This makes it dramatically smaller (often <0.01% of parameters) and trivially composable across tasks — you just keep different soft prompts in storage and swap them at inference.

## Why it matters

The headline result of Lester et al. is the **scale crossover**: at small T5 sizes, prompt tuning lags behind both full fine-tuning and prefix tuning, but as the frozen backbone grows past ~10B parameters, the gap closes and prompt tuning matches full fine-tuning. This was strong early evidence that *capability lives in the frozen weights* and that adaptation can be vanishingly cheap once the base model is large enough — directly motivating the modern PEFT ecosystem (LoRA, adapters, P-Tuning v2) and multi-tenant serving where one frozen LLM serves many tasks via swappable prompt vectors. Prefix tuning remains the stronger choice at smaller scales and for generation tasks where deep-layer steering matters.

## Key references

- Li, X. L., & Liang, P. (2021). *Prefix-Tuning: Optimizing Continuous Prompts for Generation.* ACL 2021. https://arxiv.org/abs/2101.00190
- Lester, B., Al-Rfou, R., & Constant, N. (2021). *The Power of Scale for Parameter-Efficient Prompt Tuning.* EMNLP 2021. https://arxiv.org/abs/2104.08691
- Liu, X. et al. (2022). *P-Tuning v2: Prompt Tuning Can Be Comparable to Fine-tuning Universally Across Scales and Tasks.* ACL 2022. https://arxiv.org/abs/2110.07602

## Open questions

- **Interpretability of soft prompts.** The learned vectors do not lie near any real token embedding; their nearest neighbors in vocab space are often unrelated to the task. What information they encode, and whether they can be projected back into discrete prompts, remains open.
- **Optimization fragility at small scale.** Prompt tuning is notoriously sensitive to initialization (random vs. sampled vocab vs. class-label embeddings) and learning rate at sub-billion-parameter scales — a gap P-Tuning v2 partly closes by reintroducing per-layer prompts, effectively converging back toward prefix tuning.

## References

- Lester, Al-Rfou & Constant, 2021 — https://arxiv.org/abs/2104.08691
- Li & Liang, 2021 — https://arxiv.org/abs/2101.00190
- Prefix-Tuning ACL camera-ready — https://aclanthology.org/2021.acl-long.353.pdf
- Prompt Tuning EMNLP camera-ready — https://aclanthology.org/2021.emnlp-main.243/
