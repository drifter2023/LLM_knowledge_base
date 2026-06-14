---
id: eff-peft-lora
cluster: eff
concept: "PEFT: LoRA / QLoRA / Adapter"
status: done
sources:
  - https://arxiv.org/abs/2106.09685
  - https://arxiv.org/abs/2305.14314
  - https://arxiv.org/abs/1902.00751
  - https://proceedings.mlr.press/v97/houlsby19a/houlsby19a.pdf
generated_at: 2026-04-25
---

老钟表匠林师傅在城南守着一间巴掌大的店面,玻璃柜里摆着祖父留下的那台落地座钟。座钟有四百三十七个零件,每一个齿轮、每一根游丝都是百年前从瑞士请来的工匠亲手打磨的,装回去要请同一个流派的师傅,价钱够买下半条街。林师傅这辈子没动过它一颗螺丝。

但生意不能不做。来店里的客人五花八门:有人要把祖传怀表改成能戴在手腕上的,有人要给老钟加个西敏寺报时,还有更刁钻的——一位戏班的老板,要让座钟在每天下午三点用钟声敲出《贵妃醉酒》的过门。

起初林师傅是按规矩来的:每接一单,就把整台钟拆开,在内部加装一组新的齿轮组。三单下来,钟腹里塞得满满当当,新齿轮和老齿轮咬在一起,走时慢了半拍,报时也闷。客人不满意,他自己更心疼。

第二年开春,他想了个法子。他不再往钟里塞东西了。他在钟壳外侧,贴着原来的传动轴,加装了一对极薄的铜片——一片细长的输入片,一片细长的输出片,中间用一根只有两毫米直径的细轴相连。老钟的传动力先经过这根细轴,被"压扁"成两毫米的窄流,再被"撑开"还原回去,送回原来的输出端。平日里,这对铜片几乎不起作用,等于没装;但只要他在那根细轴上稍稍刻几道纹路,整台钟的节拍就会按他的意思偏移一点点。

戏班老板的《贵妃醉酒》,他只在那根细轴上刻了七道纹。怀表改腕表的客人,他换了另一对铜片,刻了三道纹。每个客人的"定制"就是这么一对薄薄的铜片加几道刻痕,装拆都不动老钟分毫。客人来取货时,林师傅当着面把铜片合进钟壳,钟声立刻变了味道;客人走了,他取下铜片,座钟又恢复成祖父留下的样子,分秒不差。

有徒弟问他:"师傅,既然您只刻七道纹,为什么不直接在老钟的主齿轮上刻?"

林师傅说:"主齿轮上能刻的纹有几万种,可一首曲子真正要用的,也就那么七道。先把力道压到一根细轴上,我才知道哪七道是要紧的。压得越细,我越不容易刻错。"

到了第三年,城里闹钟荒,铜也贵了。林师傅又改良了一次:他把老钟内部的齿轮全部重新铸成一种粗糙的、只有四个齿位的廉价合金——走时还是准的,只是看上去毛糙。但他外挂的那对铜片,依旧用最好的铜,依旧只刻几道纹。客人听不出区别,他的店却能开下去。

后来这门手艺传开了。城里的钟表匠们都说:真正值钱的不是那台老钟,是林师傅愿意承认——一支曲子的灵魂,只藏在七道刻痕里。

---

## Concept and field

**PEFT (Parameter-Efficient Fine-Tuning): LoRA, QLoRA, and Adapters.** This sits in the **Efficiency** cluster of LLM research, alongside quantization, distillation, and inference-time tricks. PEFT methods adapt a frozen pretrained model to a new task by training a tiny number of extra parameters, instead of updating all billions of base weights.

## Key mechanism

**Adapters (Houlsby et al., 2019).** Insert small bottleneck modules — a down-projection to a low dimension, a nonlinearity, an up-projection back — twice inside each Transformer block (after attention, after FFN). Only the adapters and layer-norms train; the base is frozen. On GLUE, this matched full fine-tuning within 0.4% while adding only ~3.6% parameters per task. The cost: extra layers add inference latency.

**LoRA (Hu et al., 2021).** Instead of adding sequential modules, LoRA reparameterizes a frozen weight matrix `W ∈ ℝ^{d×k}` with an additive low-rank update `W + ΔW = W + BA`, where `B ∈ ℝ^{d×r}`, `A ∈ ℝ^{r×k}`, and `r ≪ min(d,k)` (often r=4 or 8). `A` is initialized Gaussian, `B` is initialized to zero so `ΔW=0` at start. The update is scaled by `α/r`. Only `A` and `B` train. The motivating hypothesis is that task-adaptive weight changes have low **intrinsic rank** — the parable's "seven notches." Critically, at inference time `BA` can be merged back into `W`, so **no latency penalty**. LoRA reduced trainable parameters for GPT-3 175B by 10,000× while matching full fine-tuning quality.

**QLoRA (Dettmers et al., 2023).** Pushes LoRA further: quantize the frozen base model to 4-bit using **NF4 (4-bit NormalFloat)**, an information-theoretically near-optimal datatype for normally distributed weights; apply **double quantization** (quantize the quantization constants themselves); and use **paged optimizers** to absorb memory spikes via NVIDIA unified memory. Gradients flow through the dequantized-on-the-fly 4-bit base into 16-bit LoRA adapters. This brought 65B-parameter fine-tuning down to a single 48GB GPU, producing the Guanaco family of models.

## Why it matters

Full fine-tuning of a 65B+ model requires hundreds of GBs of optimizer state and a fleet of A100s. PEFT collapses that to a single consumer or workstation GPU, makes per-task checkpoints kilobytes-to-megabytes instead of hundreds of gigabytes, and enables clean multi-tenant serving (swap adapters per request against one shared base). LoRA is now the default mechanism behind Hugging Face PEFT, Stable Diffusion fine-tunes, and the entire "open-weights ecosystem."

## Open questions and controversies

- **Does low-rank adaptation match full fine-tuning at scale and on hard reasoning tasks?** Empirically it does on instruction-following and classification, but full-rank fine-tuning still wins on some math and code benchmarks — the "intrinsic rank" assumption is a hypothesis, not a theorem.
- **Robustness trade-offs.** Recent work (Liu et al., 2025, arXiv:2505.12871) studies whether LoRA-tuned models are *more* susceptible to training-time attacks than fully fine-tuned baselines.
- **NF4 optimality** is proven only under the assumption that weights are exactly normal; deviations in practice leave a small but real quality gap, and follow-ups (e.g., LoRA+, DoRA, LoftQ) keep chipping at it.

## References

- Houlsby et al., 2019. *Parameter-Efficient Transfer Learning for NLP.* ICML. <https://arxiv.org/abs/1902.00751> · PMLR PDF: <https://proceedings.mlr.press/v97/houlsby19a/houlsby19a.pdf>
- Hu et al., 2021. *LoRA: Low-Rank Adaptation of Large Language Models.* ICLR 2022. <https://arxiv.org/abs/2106.09685>
- Dettmers et al., 2023. *QLoRA: Efficient Finetuning of Quantized LLMs.* NeurIPS 2023. <https://arxiv.org/abs/2305.14314>
