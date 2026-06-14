---
id: arch-linear-attention
cluster: arch
concept: Linear Attention and Hybrid Architectures (RWKV, RetNet, Jamba)
status: done
sources:
  - https://arxiv.org/abs/2006.16236
  - https://arxiv.org/abs/2307.08621
  - https://arxiv.org/abs/2305.13048
  - https://arxiv.org/abs/2403.19887
  - https://arxiv.org/html/2507.06457v1
generated_at: 2026-04-25
---

苏老先生在城南开了家钱庄,门口挂一块乌木牌,上书"过目不忘"四字。

这门生意他做了四十年。每来一位客人办存取,他都要坐下来,把当日所有进出过的客人在脑子里逐一过一遍——从清晨第一个挑担的菜农,到午后绸缎庄的少东家,再到方才那位刚走的远房表叔——然后才能决定眼前这笔银子该怎么记。客人多的时候,他要把整本流水从头默到尾,常常一笔账要拖到掌灯才结。城里人都说苏老的账最准,但也最慢。

他有个徒弟叫阿恒,聪明,但等不及。阿恒说:"师父,您这样下去要累死。我有个法子。"

阿恒在柜台后头摆了一只陶罐,罐里盛着掺了朱砂的清水。每来一位客人,他就把那人的姓名、面相、所求之事捏成一张小纸团,蘸一蘸朱砂水,然后投进另一只更大的青瓷瓮里。瓮里早已积着前面所有客人的纸团,泡得字迹混在一处,化成一瓮浑浊的红水。要回应新客人时,阿恒不再回想任何具体的人,他只把新客人的纸团往瓮里一蘸,看那瓮水如何浸染纸面,就知道该怎么应对。

起初苏老大怒:"你这是把人都搅成一锅粥!"

阿恒说:"师父,您一次次从头默,默到第一万个客人时,要从头数到一万。我这瓮,无论来一万还是十万,只蘸一次就够了。瓮永远是那么大,水永远是那一瓮。"

苏老不语。三个月后,钱庄翻了三倍的客流,阿恒一人能顶过去十人。乡里都来看这只神奇的瓮。

可是麻烦来了。

某日来了一位姓周的盐商,说半年前他在此处寄存过一枚祖传玉印,如今要取回。阿恒把周盐商的纸团蘸进瓮里——瓮水泛起一阵淡淡的红晕,似乎确有此人的影子,但具体是哪一日、哪一枚、放在哪个抽屉,瓮全说不清。半年来浸进去的几千个纸团,早把那一笔关于玉印的细节稀释成了无形。周盐商当场拍了桌子。

阿恒慌了。他想加大朱砂的浓度,可浓了瓮就糊;他想给近来的纸团多蘸两下、远来的少蘸一下,让旧客人的痕迹随时日自然褪去——这法子勉强能用,可真到要追三个月前某一笔时,还是抓不住。

苏老把茶杯一放,说:"你那瓮,记得住'大概',记不住'就是它'。"

那一夜,师徒二人重新设计了铺面。八只柜台并排,七只仍是阿恒的瓮——快、省、能应付绝大多数日常往来;每隔七只,夹一只苏老式的老柜台,那里仍要把所有相关账目从头默一遍,专门用来处理玉印、地契、祖传信物这一类必须"指名道姓"的事。客人进门先走瓮,瓮答不上的,再转去老柜台。

开张那日,苏老在新匾上题了八个字:**七瓮一忆,各司其职。**

钱庄从此既快又准。城里人都说,这位老先生终于服了软,把他那"过目不忘"的牌子,挪到第八只柜台上头去了。

---

## Concept and Field

**Linear Attention** and the family of **Hybrid Architectures** (RWKV, RetNet, Mamba/Jamba) belong to the *Architectures* cluster of LLM research. They are responses to a structural cost of vanilla Transformers: softmax attention requires every new token to attend to every previous token, giving O(N²) compute and an O(N) KV cache that grows without bound during decoding.

## Key Mechanism

Softmax attention computes `Attn(Q,K,V)_i = Σ_j softmax(q_i·k_j) v_j`. **Linear attention** (Katharopoulos et al., 2020) replaces the softmax kernel with a feature map φ, so similarity becomes φ(q)·φ(k). By associativity, `Σ_j (φ(q_i)·φ(k_j)) v_j = φ(q_i)^T · (Σ_j φ(k_j) v_j^T)`. The inner sum is a fixed-size matrix `S_t = Σ_{j≤t} φ(k_j) v_j^T` that can be maintained recurrently: `S_t = S_{t-1} + φ(k_t) v_t^T`. Inference becomes O(1) per token, training stays parallel — "Transformers are RNNs."

The parable's *bowl* is exactly this state matrix S_t: every token's (key, value) pair gets dissolved into a single fixed-size summary, regardless of sequence length.

**RetNet** (Sun et al., 2023) adds a multiplicative decay γ: `S_t = γ·S_{t-1} + k_t^T v_t`, exposing three equivalent forms — parallel (for training), recurrent (for O(1) inference), and chunkwise (for long sequences). **RWKV** (Peng et al., 2023) interleaves a *time-mix* block (a linear-attention-like recurrence with learned per-channel decay, the WKV operator) with a *channel-mix* block, scaling to 14B parameters as the largest dense RNN of its time.

The bowl, however, *forgets*. A fixed-size recurrent state cannot perform precise associative recall over long contexts — the "玉印" failure mode. This motivates **hybrids**. **Jamba** (Lieber et al., 2024) interleaves Mamba (a selective state-space recurrence) with full self-attention in a 7:1 ratio, plus MoE every other layer; the rare attention layers handle exact recall while Mamba layers carry the bulk of sequence processing cheaply. Recent systematic studies (Zhang et al., 2025, "A Systematic Analysis of Hybrid Linear Attention") confirm this division of labor: linear layers do compression, sparse full-attention layers do retrieval.

## Why It Matters

Linear/recurrent layers unlock million-token inference at constant memory; full-attention layers preserve the recall fidelity transformers are prized for. The hybrid recipe is now the default for long-context efficient LLMs.

## Open Questions

How few full-attention layers can one keep before recall collapses? What gating discipline (fixed decay, data-dependent, hierarchically shared) best preserves in-context learning? And does the recurrent state have a fundamental capacity ceiling, or merely an engineering one? These are open as of 2025.

## References

- Katharopoulos, A., Vyas, A., Pappas, N., & Fleuret, F. (2020). *Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention.* ICML. https://arxiv.org/abs/2006.16236
- Sun, Y., Dong, L., Huang, S., Ma, S., Xia, Y., Xue, J., Wang, J., & Wei, F. (2023). *Retentive Network: A Successor to Transformer for Large Language Models.* https://arxiv.org/abs/2307.08621
- Peng, B., Alcaide, E., Anthony, Q., et al. (2023). *RWKV: Reinventing RNNs for the Transformer Era.* Findings of EMNLP. https://arxiv.org/abs/2305.13048
- Lieber, O., et al. (2024). *Jamba: A Hybrid Transformer-Mamba Language Model.* https://arxiv.org/abs/2403.19887
- Zhang et al. (2025). *A Systematic Analysis of Hybrid Linear Attention.* https://arxiv.org/html/2507.06457v1
