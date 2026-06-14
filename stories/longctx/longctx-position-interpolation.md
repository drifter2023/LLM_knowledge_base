---
id: longctx-position-interpolation
cluster: longctx
concept: Position Interpolation / YaRN / NTK-Aware Scaling
status: done
sources:
  - https://arxiv.org/abs/2306.15595
  - https://arxiv.org/abs/2309.00071
  - https://blog.eleuther.ai/yarn/
  - https://amaarora.github.io/posts/2025-09-21-rope-context-extension.html
generated_at: 2026-04-25
---

钟楼是这座城市最古老的乐器。

老钟匠林师傅守了它四十年。塔里有十二口钟,每一口转动的速度都不同——最上面的那口几乎不停歇,每一刻都在抖动;最下面的那口要一整年才走一圈。十二口钟一起咬合,城里人就用这交错的节律来约时间:第一口钟与第三口钟同向时,是早市;第七口钟与第十一口钟相对时,是祭祀;十二口钟全部归零的那一刻,是新年。

这架机械是为了一座方圆十里的城设计的。十里之内,钟声所标记的每一个时刻都对应得上一件事、一个人、一段约定。

可是这一年,城墙拆了,城向外扩了五倍。新城的边缘住着的人也想用钟楼来约时间,可他们发现,钟楼里那十二口钟的转动方式,已经无法标记新城里发生的事情——钟楼里没有"第六十里的午后",因为最慢的那口钟一年才走一圈,根本无从指代如此遥远的位置。

学徒们提了三种方案。

第一个学徒说:"把所有钟都换成更慢的。每口钟的速度都除以五,这样它们走完一圈就能覆盖整个新城。"林师傅试了。新城的远处确实能被指代了,但城里的老人当晚就来抱怨——"早市和祭祀的钟声听起来一模一样了。"那些原本咬合得最紧、用来区分细微时刻的快钟,被一并放慢之后,近处的事件全都糊在了一起。挤压是均匀的,所以损失也是均匀的——而最敏感的部分受损最重。

第二个学徒读过些更深的书,他说:"快钟管的是近处的事,本来就不该动它们。我们只放慢慢钟,让它们去够远处;快钟保留原速,继续切分近处的早晨与午后。"林师傅照做了。这一次,近处的市集与祭祀依然分明,远处的新村也有了自己的时刻。但在快慢交界的几口钟上,出现了奇怪的拍音——既不近也不远的时段,听起来总有些不对劲。

第三个学徒最沉默。他说:"中间那几口钟,不能让它们突然从'原速'跳到'放慢'。要做一道斜坡:波长比旧城还短的,完全保留;波长比旧城长的,完全放慢;在两者之间的,按比例渐变地混合两种处理。"林师傅依言又改。拍音消失了。

但还有最后一个问题。城扩大了五倍,钟声在更远的距离上传开,听起来便单薄、缥缈,远处的人难以判断"此刻"和"片刻之后"哪个更紧迫。第三个学徒于是又在钟楼下加装了一面铜镜,把钟声反射、聚拢——他算过,镜面的曲率要随城的倍数取一个对数,才能让远近的人听到的钟声都同样清晰。

新年那日,十二口钟一齐归零。新城最远处的孩子第一次听见了完整的年响,而老城里的祖母仍能从清晨的第一声钟里,辨出今天是初五还是初六。

林师傅在塔下坐了很久。他想,钟从未真正多走过一格——只是它们旋转的角速度,被人重新分配了一次。位置,从来不是计数,而是一组旋转的相位;扩展世界的方法,不是造新钟,而是教旧钟以新的几何去转动。

---

## Concept and field

**Position Interpolation (PI), NTK-Aware Scaling, NTK-by-parts, and YaRN** are post-training context-extension techniques for transformer LLMs that use **Rotary Position Embeddings (RoPE)**. They belong to the **long-context cluster** of LLM research and address a single practical question: *given a model pretrained at context length L, how do we make it work at length L' = s·L without retraining from scratch?*

## Key mechanism

RoPE encodes a token's position `m` by rotating each pair of query/key dimensions by an angle `m·θ_d`, where `θ_d = b^(-2d/|D|)` (typically `b=10000`). Different dimensions rotate at different frequencies — high-frequency pairs distinguish nearby tokens, low-frequency pairs encode global position. A model trained at length L has only ever seen rotation phases up to `L·θ_d`. Naively feeding positions beyond L is **extrapolation**, which produces unseen phase angles and catastrophic attention scores.

The four methods all rescale the angles, but differently:

- **Position Interpolation (Chen et al., 2023):** replace `m` with `m/s`. Every frequency is uniformly compressed; the model only ever sees phases inside its training range. Stable, but high-frequency dimensions — which carry fine local distinctions — are squeezed proportionally, blurring nearby-token resolution. Requires ~1000 fine-tuning steps.
- **NTK-Aware Scaling (bloc97, 2023):** instead of dividing position, change the base: `b' = b·s^(|D|/(|D|−2))`. This leaves the highest frequencies almost untouched and squeezes the lowest frequencies the most. Often works *without* fine-tuning.
- **NTK-by-parts (bloc97):** a piecewise schedule. Dimensions whose wavelength is shorter than L stay unscaled (preserve local structure); dimensions whose wavelength exceeds L are linearly interpolated; a ramp function smooths the transition.
- **YaRN (Peng et al., 2023):** combines NTK-by-parts with an **attention temperature** correction `√(1/t) = 0.1·ln(s) + 1`, applied to the pre-softmax logits. This compensates for the entropy increase that any interpolation induces over a longer sequence. YaRN reaches 128K context with ~10× less data and ~2.5× fewer steps than PI fine-tuning.

## Why it matters

These techniques unlocked the leap from 2K/4K-token Llama-style models to 32K, 64K, 128K, and 1M-token deployments without retraining. They are now standard in Llama 2/3, CodeLlama, Qwen, and Mistral long-context variants. The conceptual takeaway — *positions are phases of rotations, and the right way to extend them is geometric rescaling, not numerical extrapolation* — has reshaped how the field thinks about positional encoding.

## Key references

- Chen, S., Wong, S., Chen, L., Tian, Y. (2023). *Extending Context Window of Large Language Models via Position Interpolation.* arXiv:2306.15595. https://arxiv.org/abs/2306.15595
- Peng, B., Quesnelle, J., Fan, H., Shippole, E. (2023). *YaRN: Efficient Context Window Extension of Large Language Models.* ICLR 2024. arXiv:2309.00071. https://arxiv.org/abs/2309.00071
- bloc97 (2023). *NTK-Aware Scaled RoPE* and *NTK-by-parts* (Reddit / EleutherAI write-up). https://blog.eleuther.ai/yarn/
- Liu, X. et al. (2023). *Scaling Laws of RoPE-based Extrapolation.* arXiv:2310.05209.

## Open questions

- Effective context vs. nominal context: models advertised at 128K often degrade well before that, and "needle in a haystack" benchmarks can be gamed by training on synthetic long-context data. Whether YaRN-extended models genuinely *use* the full window for reasoning remains debated.
- Interaction with downstream training (RLHF, tool use) at the extended length is not fully characterized; some evidence suggests fine-tuning at the extended length is needed to preserve instruction-following quality.
