---
id: arch-self-attention-kv-cache
cluster: arch
concept: Self-Attention and KV Cache
status: done
sources:
  - https://arxiv.org/abs/1706.03762
  - https://arxiv.org/abs/2309.06180
  - https://arxiv.org/abs/2305.13245
  - https://blog.vllm.ai/2023/06/20/vllm.html
  - https://proceedings.neurips.cc/paper_files/paper/2024/file/028fcbcf85435d39a40c4d61b42c99a4-Paper-Conference.pdf
generated_at: 2026-04-25
---

老沈在城南开了一间"接话馆"。规矩很怪:每位进门的客人,都要把自己想说的下一句话先写在小纸片上,递给柜台后的伙计。伙计不会自己作答,而是带着这张纸,回到馆子最里间那条长长的木廊。

木廊两侧,从开张那天起,所有来过的客人留下的话都按到来的次序贴在墙上。每条贴纸有两面:朝外的一面写着"这句话讲的是什么样的事"——那是一种摘要式的索引,老沈管它叫**钥匙**;朝内的一面写着这句话本身完整的内容,老沈称之为**底子**。

伙计的工作是这样的:他拿着新客的小纸片,沿着长廊走一遍,把纸片凑到每一张旧贴纸的"钥匙"边比对,看二者气味相不相投。气味浓的,他在心里给那条旧贴纸打一个高分;气味淡的,打低分。走完全程,他把所有分数归一,再按这份分数,把每条旧贴纸"底子"上写的话各取一缕,拼成一句新的回应,递回给客人。客人读罢,满意,自己那张纸也就被贴到长廊末端,成了下一位客人的旧贴纸之一。

馆子开张头几个月,生意清淡,长廊还短,这套法子顺畅得很。可来客越来越多,长廊也越拖越长。伙计渐渐发现一件事:每来一位新客,他要做的事其实只是"拿新纸片去和**新增加的那一段**长廊比对",前面九成九的旧贴纸,他上一次已经比过了,分数和取出的那缕底子全都是老样子。可若每来一人都从头走一遍,馆子非垮不可。于是老沈下令:每张贴纸贴上墙的当口,就把它的钥匙和底子各抄一份,锁进一只贴身小匣。下一位客人来时,伙计只需打开匣子,把昨日的成果直接取出,只对**今天新添的一两张**贴纸现场比对就行。馆子的生意因此兴隆数倍。

但小匣很快也出了麻烦。老沈原本给每位常客单独留了一只长形大匣,按他可能要写的最长篇幅预留位置。结果短客人占着长匣,长匣装不下临时来的更长的话,匣子之间还留着大段大段的空隙——七成的木料都空着,新客却进不来。一位姓权的账房先生劝老沈,说衙门里管粮的法子可以借来:别给每人一只长匣,把仓房切成同样大小的小格子,谁来了就发给他几格,用完再续;格子不必相邻,用一本小册子记下"某客的第几段话在第几格"即可。从此木料不再空置,连双胞胎客人想引用同一段开场白,也只要在册子上把那一格指给两人共用,省下又一份抄写。

再后来,馆子雇了好几位伙计同时听客人说话——他们各有各的关切,有的盯着语气,有的盯着名物,有的盯着时序。可老沈精打细算,发现没必要让每位伙计都备一套自己的钥匙和底子:让他们**几人一组合用一份**,听上去结果只略逊一筹,匣子却轻了一大截。

有人问老沈,这馆子到底在做什么生意。老沈笑笑说:"我们只是认真地,让每一句新话,都把过去说过的所有话再听一遍——只是听得越来越省力罢了。"

---

## Concept: Self-Attention and the KV Cache

**Field.** Transformer architecture and inference systems — cluster `arch` in this knowledge base. This concept underwrites virtually every modern LLM and is the load-bearing primitive that the whole "scaling laws + decoder-only LM" stack rests on.

**Mechanism — self-attention.** In Vaswani et al.'s 2017 Transformer, every token is projected into three vectors: a query *q*, a key *k*, and a value *v*. For a token at position *t*, the layer computes attention as `softmax(q_t · K^T / √d_k) · V`, where `K` and `V` stack the keys and values of all positions *t* attends to (in a decoder, positions ≤ *t*). The dot products `q_t · k_i` are similarity scores; softmax turns them into a distribution; the output is a weighted blend of the value vectors. Multi-head attention runs *h* such operations in parallel with different projections, then concatenates. The mechanism is permutation-equivariant (positions enter only via positional encodings) and, crucially, *fully parallelizable across positions during training*.

**Mechanism — KV cache.** Autoregressive decoding generates one token at a time. Naively, generating token *t+1* would recompute every prior token's *k* and *v*. But those are deterministic functions of past tokens and past weights — so production inference engines store them in a **KV cache**: a per-layer, per-head tensor of shape roughly `[batch, heads, seq_len, d_head]` for both K and V. Each new step then only computes one new `(k_t, v_t)` pair, appends them, and runs attention against the cached `K`, `V`. This converts decoding from O(n²) to O(n) FLOPs per step, but the cache itself becomes the dominant memory consumer at long contexts.

**Why it matters.** The KV cache is the single biggest engineering bottleneck in serving large models. Two recent lines of work have reshaped the architecture and the runtime around it:

1. **PagedAttention / vLLM** (Kwon et al., SOSP 2023) observes that prior systems pre-allocate one contiguous KV buffer per request sized to the maximum sequence length, wasting 60–80% of memory to fragmentation and over-reservation. PagedAttention instead partitions the KV cache into fixed-size blocks stored non-contiguously, with a per-sequence block table mapping logical positions to physical blocks — exactly OS virtual memory paging. This enables near-zero waste, copy-on-write sharing across parallel samples and beam search, and 2–4× higher throughput than FasterTransformer/Orca.
2. **Multi-Query and Grouped-Query Attention** (Shazeer 2019; Ainslie et al. 2023) shrink the cache at the architecture level. MQA shares one K/V head across all query heads (extreme compression, quality loss); GQA shares K/V across *groups* of query heads, interpolating between MHA and MQA. Ainslie et al. show that an MHA checkpoint can be uptrained into GQA with ~5% of pretraining compute. GQA is now the default in Llama 2 70B, Llama 3, Mistral, and most modern open-weight models.

Recent work (KVQuant, NeurIPS 2024; Coupled Quantization; MiniCache) pushes further by quantizing the cache itself — KVQuant targets ultra-low precision via non-uniform quantization sensitive to activation distribution, enabling 10M-token contexts.

**Open questions.** How aggressively can the cache be compressed (quantized, pruned, summarized) before reasoning quality degrades on long-context tasks? Is the K/V structure the *right* memory primitive at all, or are state-space and linear-attention alternatives (Mamba, RWKV, RetNet) about to replace it? And as context windows stretch toward 10M tokens, prefill cost — not the cache — may become the binding constraint.

**Key references.**
- Vaswani et al., 2017. *Attention Is All You Need*. NeurIPS. https://arxiv.org/abs/1706.03762
- Kwon et al., 2023. *Efficient Memory Management for Large Language Model Serving with PagedAttention*. SOSP. https://arxiv.org/abs/2309.06180
- Ainslie et al., 2023. *GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints*. https://arxiv.org/abs/2305.13245
- Hooper et al., 2024. *KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization*. NeurIPS. https://proceedings.neurips.cc/paper_files/paper/2024/file/028fcbcf85435d39a40c4d61b42c99a4-Paper-Conference.pdf
