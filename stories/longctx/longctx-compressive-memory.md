---
id: longctx-compressive-memory
cluster: longctx
concept: Compressive Memory / Token Pruning
status: done
sources:
  - https://arxiv.org/abs/2404.07143
  - https://arxiv.org/abs/2309.17453
  - https://huggingface.co/blog/infini-attention
  - https://hanlab.mit.edu/projects/streamingllm
generated_at: 2026-04-25
---

老周在城南开了三十年信局。

他的规矩,镇上人都晓得:每到月底,他要把那一摞摞收来的信件做一次"折叠"。新来的伙计第一次见他动手,吓得不轻——老周把厚厚一沓信摊开,一封封读过去,然后并不把它们归档存起,而是抽出一本薄薄的账册,在上面写下几行潦草的字。写完,他把那一沓信丢进了灶膛。

"师父,这……烧了?"

"烧了。"老周拍拍那本账册,"但都在这里。"

伙计翻开账册,只见每页都密密麻麻,却又毫无章法:某月某日,西街李家娶亲,赊三钱;赵屠户欠王寡妇半吊;城北米价起了又落。没有原信,只有一笔笔被压进格子里的"骨头"。

"客人来问从前的事,你怎么答?"

"他报个名字,我就照着这名字,在账册里翻一翻——账册不长,翻得快。翻出来的几行字,加上他眼下要办的事,我心里就有数了。"

伙计将信将疑,直到那年腊月,有个外乡人来寻一封三年前的信。老周翻账册,翻了三息,说:"那年你托我送一封到苏州,收信人姓沈,信里提到一个'桐'字。"外乡人愣住,从怀里掏出半块旧玉,正刻着"桐"。

可这法子也不是没有毛病。伙计跟了三年,渐渐看出门道:老周写账册,写到后来,每一页的字越写越像。新事旧事压在同一格里,糊成一团灰。有些早年的细节,他翻是翻得到,但已经辨不清谁是谁了。师父自己也承认:"折得太多次,就只剩一个'有'字,连'是谁'都说不上。"

更怪的是另一桩事。伙计发现,老周的灶膛旁边,常年摆着三封信——三封最早的、最不起眼的、谁也不记得是谁寄来的旧信。那三封信,从不烧,从不动。

"师父,这三封留着做什么?为什么不是留最重要的几封?"

老周想了半天,摇头:"我也说不清。年轻时试过不留,留下手头新鲜的那些。结果第二天起来,整本账册就乱了,翻什么都对不上号。后来我留了这三封,什么都顺了。"他顿一顿,"它们不重要,但少了它们,别的都立不住。像屋子的四角——空着的那几角,你搬不走。"

伙计后来自己开了铺子,试着完全照师父的法子做。他烧得勤,折得狠,账册写得比师父还紧。三个月后,有客人来问旧事,他翻账册,翻得到字,却答不出人——所有的"折叠"压成了同一种灰。他这才回去问老周:你那本账册,到底每天怎么折的?是把新信和旧账揉在一起重写,还是另起一格?揉的力道又是几分新、几分旧?

老周笑:"我也是折坏过几十本,才折出这一本能用的。"

---

## Concept and field

**Compressive Memory and Token Pruning** are techniques in the **long-context** cluster of LLM research. Both attack the same bottleneck — the quadratic cost and bounded KV cache of standard self-attention — but from opposite ends. Compressive memory *folds* old tokens into a fixed-size state; token pruning *discards* most old tokens but keeps a carefully chosen subset.

## Key mechanisms

**Infini-attention (Munkhdalai, Faruqui & Gopal, 2024).** The Transformer is run segment-by-segment. Within a segment, ordinary causal dot-product attention runs over local keys/values. *Across* segments, a fixed-size matrix `M` (the "compressive memory") accumulates the outer products of past keys and values via a linear-attention / delta-rule update: `M ← M + σ(K)^T V` (with a normalizer term `z`). At read time, the query is mapped through the same kernel σ and used to retrieve `A_mem = σ(Q) M / σ(Q) z`. The local attention output `A_dot` and the memory output `A_mem` are fused per-head by a learned scalar gate β: `A = sigmoid(β) ⊙ A_mem + (1 − sigmoid(β)) ⊙ A_dot`. The result is unbounded effective context at bounded memory — the storyteller's account-book that fits in his pocket.

**StreamingLLM (Xiao, Tian, Chen, Han & Lewis, ICLR 2024).** Pure sliding-window attention collapses the moment the first real token slides out of the window. Xiao et al. found why: softmax forces probability mass *somewhere*, and trained models dump excess mass on the first few tokens regardless of semantics — the "attention sink." Keep those first 4 tokens' KV states permanently pinned, slide a normal window over everything else, and perplexity stays stable for 4M+ tokens with no fine-tuning. They further show that pre-training with a single dedicated `<sink>` placeholder makes streaming even cleaner. This is the parable's three never-burned letters at the corner of the hearth: not informative, but load-bearing.

## Why it matters

These two papers reframed long context as a *memory-management* problem rather than a positional-encoding problem. Infini-attention promised infinite context at constant memory; StreamingLLM gave a near-free fix that ships in production inference engines today.

## Open questions / controversies

The HuggingFace reproduction of Infini-attention (2024) is a cautionary tale: long-context recall **degrades** with each compression cycle, and the gating β collapses to ≈0.5 across 95% of heads — the model learns to ignore the compressed memory. After hyperparameter rescue (LR 0.01 on β, no weight decay, 16 segment rollouts) the model could continue text but still failed needle-in-haystack across segments. The HF team concluded that RoPE scaling, YaRN, and Ring Attention remain stronger baselines. The deeper open question — whether *any* fixed-size recurrent state can match attention on long-range retrieval — is still live (this is the same wall Mamba and RWKV bump into).

## References

- Munkhdalai, T., Faruqui, M., & Gopal, S. (2024). *Leave No Context Behind: Efficient Infinite Context Transformers with Infini-attention.* arXiv:2404.07143. https://arxiv.org/abs/2404.07143
- Xiao, G., Tian, Y., Chen, B., Han, S., & Lewis, M. (2024). *Efficient Streaming Language Models with Attention Sinks.* ICLR 2024. https://arxiv.org/abs/2309.17453
- Werra, L. von et al. (2024). *A failed experiment: Infini-Attention, and why we should keep trying.* HuggingFace Blog. https://huggingface.co/blog/infini-attention
- MIT HAN Lab project page: https://hanlab.mit.edu/projects/streamingllm
