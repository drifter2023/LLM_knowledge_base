---
id: arch-ssm
cluster: arch
concept: State Space Models (SSM)
status: done
sources:
  - https://arxiv.org/abs/2312.00752
  - https://arxiv.org/abs/2111.00396
  - https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mamba-and-state
  - https://arxiv.org/abs/2405.21060
  - https://arxiv.org/html/2410.07145v2
generated_at: 2026-04-25
---

清河镇只有一位驿丞，姓沈。

镇上的人写信、收信、寄货、报丧，全要经他的手。可沈驿丞身边只有一本薄薄的册子——三十二页，从他祖父那辈传下来，页数不增也不减。镇上的另一位文书赵先生则截然不同：赵先生有一整间屋子的木架，每封过手的信都按日子钉在墙上，要查哪一句话，他便顺着架子一封封翻回去，迟早能找到原文。

起先众人都笑沈驿丞：你这小册子，怎么记得下三十年来南来北往的话？

沈驿丞不答。他做的事，是这样的——每当一封新信到，他不抄录，而是把册子上原有的字句先按某种他自己琢磨出的法子轻轻"褪一褪"，像把旧墨在水里漂淡，再把新信里他认为要紧的意思，掺进褪淡后的字里。漂多少、掺多少，全看新信本身的分量。

一封寻常的家书报平安，他几乎不动册子，只让旧字稍稍黯一分；一封说"今夜父亲走了"的急信，他便几乎把那一页全数漂白，重重地写上新的字。久而久之，册子上每一页都不是某一封信的原文，而是无数封信彼此交叠、彼此让位之后留下的、一种含混却紧要的浓度。

最妙的是：他每收一封新信，只看册子的当前一页和这封新信本身，便能算出下一页的样子。他不需要回头翻。三十年里来过的所有信，都已经化在那当前一页的墨色深浅里了。所以无论镇上的人事如何累积，他处理每一封新信的工夫，始终一样快——不像赵先生，墙上信越多，回头查得越久。

镇上有人病重，临终前请沈驿丞回忆二十年前他亡妻寄来的最后一句话。沈驿丞翻开册子，沉默良久，说：我说不出原话。我只能告诉你，那句话的分量，至今还压在这一页的右下角，从没褪干净过。

那人含泪点头，说够了。

可若是县太爷某日驾到，要核对二十年前某契约上的一字一句，沈驿丞便只能摇头——那种事，得去赵先生的屋子里翻。

后来有学徒问他：师父，您这法子，到底胜在哪里？

沈驿丞指着窗外川流不息的来人：胜在册子不会涨厚。一封信进来，旧的让一让，新的住进来，账永远算得过来。镇子再活一百年，我这本册子还是三十二页。

学徒又问：那它输在哪里？

沈驿丞笑了：输在它从来没真正"记住"过任何一句话。它记住的，是所有话压在一起、互相冲淡之后，留下的那点儿气味。

——气味够用来过日子，却不够用来打官司。

---

## Concept and field

**State Space Models (SSMs)** are a family of sequence-modeling architectures positioned as sub-quadratic alternatives to the Transformer. They sit in the **architecture cluster** of modern LLM research, alongside attention variants, MoE, and linear/RWKV-style recurrences. The lineage runs from **S4** (Gu, Goel, Ré, 2021) to **Mamba** (Gu and Dao, 2023) to **Mamba-2 / SSD** (Dao and Gu, 2024).

## Key mechanism

An SSM treats a token sequence as samples of a continuous-time linear dynamical system:

- State update: `h_t = A · h_{t-1} + B · x_t`
- Output: `y_t = C · h_t`

`A`, `B`, `C` are learned matrices; `h_t` is a fixed-dimensional hidden state that compresses all past inputs. The continuous form is **discretized** via a learned step size Δ (zero-order hold), giving discrete matrices `Ā, B̄`. Crucially, an SSM admits two computational forms: a **recurrence** (O(N) inference, sequential) and a **global convolution** with a precomputed kernel (parallel training). S4's contribution was a structured (HiPPO-initialized, diagonal-plus-low-rank) `A` that makes the convolution kernel computable in O(N+L), enabling efficient training over sequences of length 16k+.

S4's weakness was that `A, B, C, Δ` are **input-independent** — the system is linear time-invariant, so it cannot perform content-based selection (it fails synthetic tasks like selective copy and induction heads). **Mamba's selection mechanism** makes `B`, `C`, and Δ explicit functions of the current input `x_t`. This breaks the convolutional view (the kernel is no longer fixed), so Mamba replaces it with a **hardware-aware parallel scan** that keeps the state in SRAM and avoids materializing the full hidden-state tensor in HBM. The result: linear time and constant memory per token, with content-aware gating that lets the model decide how much past state to forget and how much new input to absorb. **Mamba-2** reformulates the selective SSM as a structured semiseparable matrix, exposing a duality with linear attention and yielding 2–8× faster training via matmul-friendly block decomposition.

## Why it matters

Transformers are O(L²) in sequence length and require an ever-growing KV-cache at inference. SSMs offer **O(L) training, O(1)-per-token inference, and a fixed-size recurrent state**, making million-token contexts and high-throughput streaming tractable. Mamba-3B matches Transformers twice its size on language modeling and achieves 5× higher inference throughput.

## Open questions and controversies

The fixed state is also the pain point. Jelassi et al. and follow-ups show that pure SSMs underperform Transformers on **exact copying, multi-query associative recall, and in-context learning** — the parable's "verbatim contract" failure mode. **Stuffed Mamba** (Chen et al., COLM 2025) formalizes this as **state collapse**: when the recurrent state's capacity is exceeded, models cannot forget gracefully and long-context recall degrades. This has driven the field toward **hybrid architectures** (e.g. Jamba, Zamba, Samba) that interleave SSM layers with a few attention layers, treating SSM as the cheap default and attention as the precise-recall specialist.

## References

- Gu, A., & Dao, T. (2023). *Mamba: Linear-Time Sequence Modeling with Selective State Spaces.* https://arxiv.org/abs/2312.00752
- Gu, A., Goel, K., & Ré, C. (2021). *Efficiently Modeling Long Sequences with Structured State Spaces (S4).* https://arxiv.org/abs/2111.00396
- Dao, T., & Gu, A. (2024). *Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality.* https://arxiv.org/abs/2405.21060
- Chen et al. (2024). *Stuffed Mamba: State Collapse and State Capacity of RNN-Based Long-Context Modeling.* https://arxiv.org/html/2410.07145v2
- Grootendorst, M. *A Visual Guide to Mamba and State Space Models.* https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mamba-and-state
