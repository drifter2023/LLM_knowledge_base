---
id: longctx-external-memory
cluster: longctx
concept: External Memory / Retrieval Augmentation
status: done
sources:
  - https://arxiv.org/abs/2005.11401
  - https://arxiv.org/abs/2112.04426
  - https://arxiv.org/abs/2208.03299
  - https://deepmind.google/blog/improving-language-models-by-retrieving-from-trillions-of-tokens/
  - https://arxiv.org/html/2506.00054v1
generated_at: 2026-04-25
---

沈砚之到任清河县那年才二十六岁。

他与前任最大的不同，是脑袋里装的律例并不多。前任顾大人当年是科甲出身，一部《大清律例》倒背如流，连乾隆三十七年某条纂修条例的小注都能在堂上当场背出。百姓畏他，同僚敬他，可顾大人六十岁那年中风，半身的判例随着舌头一起糊住了，再也调不出来。

沈砚之听过这个故事，于是上任第一件事不是修衙门，是修书库。

他把后院三间空房打通，请来一位姓白的老书办，专管"翻档"。白书办做了三十年刑名幕友，自己一桩案子也判不了，可天下哪一卷判牍藏在哪个州哪一年的卷宗里，他闭着眼也能摸到。沈砚之又托人从京城、苏州、杭州、广州各处抄来历年成案，按罪名、按情节、按物件，一架一架码进去，足足两万多卷。

升堂的规矩也变了。

往常的县官，听完原告被告陈词，便在脑中翻检律条，提笔就判。沈砚之不这样。他听一段，停一段。比如听到"夜入人宅、未取财物、伤主人指"这一节，他便把这十二个字写在纸条上递出帘外。白书办在外头的卡片柜里一阵翻找，不到一炷香，便挑出七八卷情节最近的旧案，从门缝里递回来。沈砚之低头看一遍，再听下一段案情，再递一张纸条，再换七八卷。

他写判词的时候，案上常常堆着二三十卷别处的判牍。他自己脑子里那点律例，不过是一根串珠的线；真正的珠子，是白书办一段一段递进来的。

外人起初觉得这位县令是"腹中空空"，背后笑他。可三年下来，清河的疑案错案少得出奇。有人专程从邻县抄沈砚之的判词去研习，发现他每一段说理都贴着某一桩具体的旧案走，引得极准、极细，连顾大人那种背得烂熟的人也未必能信手拈来这么贴切的先例——因为顾大人脑中的，是他四十年前读过的；沈砚之桌上的，是此刻为这一段案情、专门挑出来的。

也有出岔子的时候。

有一年秋天，一桩命案，白书办递进来的旧案明明白白指向"误伤"，沈砚之却写成了"故杀"。事后复查，他自己也说不清当时为何不肯听卷宗的话——大约是堂上苦主哭得太惨，他心里先有了主意，桌上那二十几卷旧案就成了摆设。这一桩后来被臬司驳了回来，他记了一辈子。

他临退职那年，有个年轻的进士来拜，问他为官的诀窍。沈砚之指着后院那三间书库说：

"我这里头记的东西不多。判案的时候，我把要问的话剪成一小段一小段，递出去，让人替我从两万卷里挑最像的几卷回来，摆在我面前，我再照着写。脑子小，架子大，是我这一路的本钱。"

又指了指自己的胸口：

"可是架子上的东西摆得再齐，写判的还是这里。卷宗递到了，未必听；听了，未必照办。这是我这一路最难的地方，到老也没断根。"

---

## Concept: External Memory / Retrieval Augmentation

**Field.** Long-context and memory architectures for large language models (cluster: `longctx`). The concept reframes "knowing things" as a system-level property: parametric memory (model weights) is paired with non-parametric memory (an external corpus accessed by a retriever at inference or training time).

**Key mechanism.** Three landmark architectures define the design space:

1. **RAG (Lewis et al., NeurIPS 2020)** couples a pretrained seq2seq generator (BART) with a dense passage retriever (DPR) over a Wikipedia index. For each input, the retriever returns top-k passages; the generator marginalizes over them, either using one passage for the whole output (RAG-Sequence) or switching passages per token (RAG-Token). The retriever is fine-tuned end-to-end through the generation loss.

2. **RETRO (Borgeaud et al., ICML 2022)** scales the retrieval corpus to 2 trillion tokens. The input is split into fixed-size **chunks** (e.g. 64 tokens). For each chunk, a frozen BERT retriever finds the *k* nearest neighbor chunks (and their continuations) in the database. A trainable encoder embeds these neighbors, and a **chunked cross-attention** layer lets each chunk of the decoder attend only to the neighbors retrieved for the *previous* chunk, preserving autoregressive causality. The result: a 7.5B-parameter RETRO matches GPT-3 (175B) and Jurassic-1 on the Pile — roughly 25× fewer parameters for comparable perplexity.

3. **Atlas (Izacard et al., JMLR 2023)** is a retrieval-augmented model engineered for **few-shot** knowledge-intensive tasks. It pairs a Contriever dual-encoder retriever with a T5 generator using the Fusion-in-Decoder pattern (each retrieved document is encoded independently, then concatenated in the decoder). Atlas reaches >42% on Natural Questions with only 64 training examples, beating PaLM-540B by 3% with 50× fewer parameters, and trains the retriever jointly with the LM via several proposed objectives (ADist, EMDR², perplexity distillation).

**Why it matters.** External memory decouples *what the model knows* from *how big the model is*. It enables (a) smaller, cheaper models to match much larger parametric ones on knowledge-heavy benchmarks; (b) fresh knowledge updates by editing the index, not retraining; (c) provenance — the system can cite the passages it consulted; (d) effective context windows far longer than the attention span, since retrieval acts as a sparse, content-addressed memory.

**Open questions / controversies.** Recent surveys (e.g. *RAG: A Comprehensive Survey of Architectures, Enhancements, and Robustness Frontiers*, arXiv 2506.00054, 2025) document persistent failure modes: retrieval noise overriding correct reasoning, the "lost in the middle" effect on long retrieved contexts, and — most importantly — **the generator hallucinating even when correct evidence is in context**. Mechanistic work (ReDeEP, ICLR 2025) traces this to FFN-stored parametric knowledge dominating the "copying heads" that should ground on retrieved tokens. The boundary between parametric and non-parametric memory is therefore not a clean handover but a contested attention budget, and how to force grounding remains unsolved.

## References

- Lewis, P. et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* NeurIPS 2020. https://arxiv.org/abs/2005.11401
- Borgeaud, S. et al. (2022). *Improving Language Models by Retrieving from Trillions of Tokens.* ICML 2022. https://arxiv.org/abs/2112.04426
- Izacard, G. et al. (2023). *Atlas: Few-shot Learning with Retrieval Augmented Language Models.* JMLR 24. https://arxiv.org/abs/2208.03299
- DeepMind (2021). *Improving language models by retrieving from trillions of tokens* (blog). https://deepmind.google/blog/improving-language-models-by-retrieving-from-trillions-of-tokens/
- Survey (2025). *Retrieval-Augmented Generation: A Comprehensive Survey of Architectures, Enhancements, and Robustness Frontiers.* https://arxiv.org/html/2506.00054v1
