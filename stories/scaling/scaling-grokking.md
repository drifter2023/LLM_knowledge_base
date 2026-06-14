---
id: scaling-grokking
cluster: scaling
concept: Grokking
status: done
sources:
  - https://arxiv.org/abs/2201.02177
  - https://arxiv.org/abs/2309.02390
  - https://papers.neurips.cc/paper_files/paper/2022/file/dfc310e81992d2e4cedc09ac47eff13e-Paper-Conference.pdf
  - https://arxiv.org/html/2408.08944v1
generated_at: 2026-04-25
---

老周在城西开了一家锁匠铺,带着一个叫阿河的徒弟。

铺子里摆着一面墙的钥匙坯,客人拿来旧锁,阿河负责配出能开的新钥匙。师父给阿河立了两条规矩:第一,每一把交付的钥匙必须能转动客人的锁;第二,每天打烊前,把所有钥匙坯按重量过一遍秤,过重的就回炉。

头三个月,阿河学得飞快。他记性极好,客人把锁往柜台上一放,他眯眼一看锁芯,就能从墙上摸出一把几乎对得上的旧坯,稍稍锉两下,试,合。客人满意,师父也点头。可是回炉的秤一过,阿河每天都要熔掉一大堆——他锉钥匙的方法是"哪里卡住锉哪里",于是每一把成品都歪七扭八,带着多余的凸起和凹槽,只为了贴合那一把锁。秤上越压越重。

到了第四个月,铺子里来了一位远道的客人,带来一把从未见过的锁。阿河照旧眯眼、摸坯、锉、试——这次试了七把都不合。他翻遍墙上的旧坯,发现没有一把"长得像"这把锁的。他急得满头汗。师父在旁边喝茶,不动。

那天打烊后,师父说:你过去配的每一把,是为那一把锁配的。今天来了第八百零一把锁,你的手里却没有第八百零一种歪法。

阿河想反驳:可我每一把都对啊,客人都满意。

师父摇头:满意,是因为你记得住八百种锁。秤,是因为你记不住第八百零一种。

从那天起,阿河没有再多配一把钥匙,但他每天还是来铺子,每天还是过秤。秤的压力把他逼得很苦——为了让总重量下降,他必须把过去八百把钥匙里**共有的那部分**留下,把每一把独有的凸起一点一点磨掉。一开始,客人来取早先寄存的钥匙,常常发现钥匙变轻了,可还能开锁;后来,有些钥匙磨得几乎只剩下一根光滑的杆子,加几个最简朴的齿。

第七个月的某一天清晨,阿河在磨第三百把存货,忽然怔住。他发现自己手里这把钥匙的形状,和昨天磨的、和上个月磨的、和最早磨的那一把,正在悄悄收拢成同一种轮廓——不是某把锁的形状,而是**所有锁共有的骨架**。

那天下午,远道的客人又来了,带着那把谁也配不出的怪锁。阿河没有去翻墙上的旧坯,他随手拿起一根新的、未锉过的坯子,凭着这几个月磨出的那个"骨架",几下削成型,插进锁孔。

咔。

他怔在原地。师父在柜台后面笑了一下,说:你早就能开八百把锁。可你今天才第一次,真的学会了开锁。

阿河回头看那一墙渐渐磨光的存货,忽然明白:这几个月里,训练集没有变,他配出的钥匙也没有"更对",可在秤的压迫下,某种东西在他手里悄悄换了相——从八百把笨重的、各自为政的钥匙,塌缩成了一根能开任何锁的、最轻的骨架。

而这一刻的"咔",在曲线上看,是一道悬崖。

---

## Concept and Field

**Grokking** is a training-dynamics phenomenon in deep learning, first reported by Power, Burda, Edwards, Babuschkin, and Misra (OpenAI, 2022). It belongs to the **scaling and emergence** cluster: a family of phenomena where a model's qualitative behavior changes abruptly as a function of training compute, data, or model size, rather than smoothly.

## Key Mechanism

Power et al. trained small transformers on modular-arithmetic tasks (e.g. `a ∘ b mod p`) with only a fraction of the multiplication table revealed during training. The training-loss curve and the test-loss curve decouple dramatically:

1. **Memorization phase.** Training accuracy climbs to near-100% within a few thousand steps, while test accuracy stays at chance. The network has overfit.
2. **Long plateau.** For tens or hundreds of thousands of additional steps — often 10²–10⁴ times longer than memorization took — test accuracy remains flat. Training loss is already near zero, so naive early stopping would have terminated here.
3. **Phase transition ("grokking").** Test accuracy jumps, sometimes within a few hundred steps, from chance to near-perfect.

The strongest mechanistic account is the **circuit-efficiency** theory (Varma, Shah, Kenton, Kramár & Kumar, 2023). Two solutions coexist inside the network:

- a **memorizing circuit**, fast to learn but with parameter norm that grows with dataset size, and
- a **generalizing circuit** (e.g. the Fourier-multiplication algorithm Nanda et al. reverse-engineered for modular addition), slow to form but achieving the same logits with smaller weight norm.

Weight decay is the load-bearing pressure: it penalizes the bloated memorizing circuit more than the lean generalizing one. Once the generalizing circuit is sufficiently formed, it dominates the logits and test accuracy snaps upward. Liu et al. (2022, NeurIPS) formalize this as a representational phase transition tracked by a **Representation Quality Index (RQI)** that jumps in lockstep with test accuracy.

## Why It Matters

Grokking is a clean laboratory analogue of the **emergent-capability** debate at frontier scale. It shows that (i) loss curves can hide ongoing structural reorganization; (ii) early stopping and validation-based model selection can systematically discard models that are about to generalize; and (iii) regularization is not just a generalization tax — it is what selects between qualitatively different internal algorithms. It also motivated the search for **progress measures**: scalar quantities (RQI, circuit norms, information-theoretic synergy) that move smoothly even when the loss does not.

## Open Questions and Recent Updates

- **Is grokking a small-model artifact, or does it occur during LLM pretraining?** Evidence is mixed; "hidden" grokking on subtasks is reported but hard to disentangle from general emergence.
- **Ungrokking and semi-grokking** (Varma et al., 2023): a grokked network can *regress* to memorization if the dataset is later shrunk, and on intermediate dataset sizes generalization plateaus partway. These predictions are direct consequences of the circuit-efficiency story.
- **Lazy-to-rich transition framing** (Kumar et al., 2023, arXiv:2310.06110) reinterprets grokking as the network leaving the NTK/lazy regime — a dual to the circuit-norm view that the reviewer should be aware of.
- **Information-theoretic reframings** (2024) argue grokking is an emergent phase transition from redundancy- to synergy-dominated information flow.

## References

- Power, A., Burda, Y., Edwards, H., Babuschkin, I., & Misra, V. (2022). *Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets.* arXiv:2201.02177. https://arxiv.org/abs/2201.02177
- Varma, V., Shah, R., Kenton, Z., Kramár, J., & Kumar, R. (2023). *Explaining Grokking through Circuit Efficiency.* arXiv:2309.02390. https://arxiv.org/abs/2309.02390
- Liu, Z., Kitouni, O., Nolte, N., Michaud, E., Tegmark, M., & Williams, M. (2022). *Towards Understanding Grokking: An Effective Theory of Representation Learning.* NeurIPS 2022. https://papers.neurips.cc/paper_files/paper/2022/file/dfc310e81992d2e4cedc09ac47eff13e-Paper-Conference.pdf
- *Information-Theoretic Progress Measures reveal Grokking is an Emergent Phase Transition* (2024). arXiv:2408.08944. https://arxiv.org/html/2408.08944v1
