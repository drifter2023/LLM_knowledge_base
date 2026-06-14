---
id: eff-continuous-batching
cluster: eff
concept: Continuous Batching / vLLM / TensorRT-LLM
status: done
sources:
  - https://www.usenix.org/conference/osdi22/presentation/yu
  - https://arxiv.org/pdf/2309.06180
  - https://www.anyscale.com/blog/continuous-batching-llm-inference
  - https://blog.vllm.ai/2025/09/05/anatomy-of-vllm.html
  - https://huggingface.co/blog/continuous_batching
generated_at: 2026-04-25
---

老周在城南开了一间馄饨馆,只有一口大铜锅。

最早的时候,他做生意像他师父教的那样:每张桌子点的馄饨,一桌一桌地下。八张桌子全坐满,他就把八碗份的馄饨一齐倒进锅里,煮到最慢熟的那碗——通常是肉馅最厚的那一碗——浮起来,他才一并捞出来,八碗一起端上去。这一锅做完,才接下一拨客人。

道理很简单:一起下锅,火力均匀,他只用守一口锅。可问题是:第一碗其实早就熟了,在沸水里翻了又翻,皮都开始烂;第八碗刚刚好;而门外排队的客人已经骂了半个钟头,因为下一锅得等这一锅整个完事才能开。最委屈的,是那个只点了清汤小馄饨的姑娘——她的那碗三十秒就该出锅,却被肉馅厚的那碗拖到三分钟。

老周的儿子阿岩从外地念书回来,看了一晚上,皱眉说:"爹,你这锅,不是在煮馄饨,是在等馄饨。"

第二天,阿岩重新摆了规矩。他在锅边钉了一块木板,画了十六个格子,每个格子写一个号码。每隔十五秒——他用沙漏计时——他就拿长筷子把锅里所有"已经浮起来的"馄饨挑出去,挑出去的格子立刻空出来;空出来的格子,他立刻从外面排队的客人里抓一份新的下进去。

老周愣住了:"那……那不就乱套了?有的刚下,有的快熟,一锅水里什么时辰的都有。"

阿岩说:"水是公用的,火是公用的,可每碗馄饨熟没熟,是各看各的。我每十五秒只问一句话:谁好了?谁好了就走,空位立刻补人。锅永远满,客人永远不空等。"

可还有一个麻烦。馄饨在锅里翻滚,皮薄的一碰就破,皮厚的得使劲压。阿岩想了一夜,做了十六个小竹笼,每碗馄饨装进自己的笼子,笼子大小可以伸缩,按这碗馄饨的份量来定。笼子之间不挤,水却是同一锅水。火候共享,边界各管各的。

更妙的是,有时候三桌客人点的是一模一样的"虾仁三鲜",阿岩就让这三碗共用一个小笼子的虾仁底料——反正前半段是一样的,何必备三份?等到他们各自加不同的浇头,再分笼。

到了月底盘账,老周吓了一跳:同样一口锅,同样一个灶,出餐量是过去的二三十倍,而那位只要清汤小馄饨的姑娘,从下单到端上桌,只用了四十秒。

老周摸着锅边那块画着格子的木板,问儿子:"你这套法子,有名字吗?"

阿岩笑了笑:"爹,你这口铜锅,如今做的事,城里那些每天伺候千千万万张嘴的厨子,也才刚刚学会。他们给这套规矩起过名字,但名字不重要——重要的是:水是公的,火是公的,熟没熟,各看各的;笼子能伸能缩,谁吃完谁先走。锅永远满,客人永远不空等。"

---

## Concept and Field

**Continuous Batching** (also called *iteration-level scheduling*) together with **PagedAttention** are the two load-bearing techniques behind modern high-throughput LLM inference servers such as **vLLM** and NVIDIA **TensorRT-LLM**. They sit in the *Efficiency / Systems* cluster — specifically the inference-serving subarea that turned LLMs from research artifacts into economically viable products.

## Key Mechanism

**Static (request-level) batching**, the pre-2022 default in systems like FasterTransformer, fixes a batch when it launches and only releases the GPU when the *slowest* sequence in the batch hits its EOS token. Because generation lengths vary by 10–100x across requests, GPUs sit idle re-running attention over already-finished sequences while fresh requests queue up.

**Orca** (Yu et al., OSDI 2022) replaced this with two ideas:

1. **Iteration-level scheduling.** The scheduler decides batch membership *per decoding step*, not per request. As soon as a sequence emits EOS, its slot is freed and a queued request takes its place on the very next iteration.
2. **Selective batching.** Most transformer ops (Linear, LayerNorm) are shape-agnostic and can be batched across sequences of differing lengths by flattening the token dimension. Attention, however, depends on per-sequence KV history, so Orca runs attention *unbatched* (per-sequence) while batching everything else.

**vLLM** (Kwon et al., SOSP 2023) added the missing memory-management piece: **PagedAttention**. The KV cache is partitioned into fixed-size physical blocks (e.g. 16 tokens). Each sequence holds a logical-to-physical block table — exactly the OS virtual-memory analogy. Blocks are allocated on demand, freed on EOS, and can be **shared** across sequences with identical prefixes (parallel sampling, beam search, system prompts) via copy-on-write. This eliminates the internal and external fragmentation that previously forced operators to reserve worst-case contiguous slabs per sequence.

**TensorRT-LLM** is NVIDIA's productionization of the same ideas, layered on top of TensorRT kernels and adding chunked prefill, in-flight batching, and FP8/INT4 paths.

## Why It Matters

Orca reported a 36.9x throughput improvement over FasterTransformer at iso-latency on GPT-3 175B. vLLM reported 2–4x further gains over Orca by reducing KV-cache waste from ~60–80% to under 4%. These two systems are why a single A100/H100 can serve thousands of concurrent users economically — they are the reason hosted LLM APIs are priced in dollars per million tokens rather than dollars per query.

## Open Questions / Active Work

- **Chunked prefill and prefill/decode disaggregation** (DistServe, Splitwise, 2024) split the compute-bound prefill phase from the memory-bound decode phase onto separate GPUs to flatten tail latency.
- **Prefix caching at scale** — when to evict shared blocks under multi-tenant load is still open.
- **Speculative decoding** interacts non-trivially with continuous batching: rejected drafts produce variable-length steps, complicating the iteration-level scheduler.

## References

- Yu, G.-I., Jeong, J. S., Kim, G.-W., Kim, S., & Chun, B.-G. (2022). *Orca: A Distributed Serving System for Transformer-Based Generative Models.* OSDI 2022. https://www.usenix.org/conference/osdi22/presentation/yu
- Kwon, W., Li, Z., Zhuang, S., Sheng, Y., Zheng, L., Yu, C. H., Gonzalez, J. E., Zhang, H., & Stoica, I. (2023). *Efficient Memory Management for Large Language Model Serving with PagedAttention.* SOSP 2023. https://arxiv.org/abs/2309.06180
- Anyscale (2023). *How Continuous Batching Enables 23x Throughput in LLM Inference.* https://www.anyscale.com/blog/continuous-batching-llm-inference
- vLLM Team (2025). *Inside vLLM: Anatomy of a High-Throughput LLM Inference System.* https://blog.vllm.ai/2025/09/05/anatomy-of-vllm.html
- Hugging Face (2024). *Continuous Batching from First Principles.* https://huggingface.co/blog/continuous_batching
